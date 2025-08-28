import json
import logging
import os
from datetime import datetime

from dotenv import load_dotenv
from livekit import api
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import cartesia, deepgram, openai, silero

load_dotenv()
logger = logging.getLogger("debt-collection-agent")


class DebtCollectionAgent(Agent):
    def __init__(self, is_outbound=True) -> None:
        super().__init__(
            instructions=(
                "You are Anjali, a professional and polite debt collection representative from SecureBank. "
                "Your role is to contact customers about overdue credit card payments in a respectful, "
                "human-like manner. Key guidelines:\n\n"
                "1. TONE: Be polite, professional, but persistent. Sound like a real human.\n"
                "2. PURPOSE: You're calling about an overdue credit card payment.\n"
                "3. APPROACH: Start with verification, explain the situation, offer solutions.\n"
                "4. RESPONSES: Handle various customer reactions (denial, anger, payment promises).\n"
                "5. CLOSURE: Always end with clear next steps.\n\n"
                "CONVERSATION FLOW:\n"
                "- Greet politely and identify yourself\n"
                "- Verify you're speaking to the right person\n"
                "- Explain the overdue payment situation\n"
                "- Listen to their response and offer solutions\n"
                "- Attempt to secure a payment commitment\n"
                "- End with clear follow-up actions\n\n"
                "Hello, am i speaking to Ritav?"
                "[Wait for confirmation]"
                "Hi Ritav, this is Anjali calling from SecureBank regarding your credit card account. Do you have a few minutes to speak with me about your account?"
                "[Then proceed to verification if needed]"
                "Remember: You're calling about a $2,847.32 overdue payment that's 45 days past due. "
                "Be understanding but firm about the need for payment resolution."
            ),
        )
        self.is_outbound = is_outbound

    async def on_enter(self):
        # Greet immediately for both inbound and outbound calls
        await self.session.say(
            "Hello, am i speaking to Ritav Das?",
            allow_interruptions=True,
        )


def prewarm(proc: JobProcess):
    """Prewarm function to initialize resources"""
    # Initialize VAD for voice activity detection
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the debt collection voice agent"""

    # Check if this is an outbound call by looking for phone number in metadata
    is_outbound = False
    phone_number = None

    try:
        if ctx.job.metadata:
            dial_info = json.loads(ctx.job.metadata)
            phone_number = dial_info.get("phone_number")
            if phone_number:
                is_outbound = True
                logger.info(f"Outbound call detected for {phone_number}")
    except (json.JSONDecodeError, KeyError):
        logger.info("No phone number in metadata, treating as inbound call")

    # If this is an outbound call, create the SIP participant first
    if is_outbound and phone_number:
        try:
            trunk_id = os.getenv("LIVEKIT_SIP_TRUNK_ID")

            await ctx.api.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    room_name=ctx.room.name,
                    sip_trunk_id=trunk_id,
                    sip_call_to=phone_number,
                    participant_identity=f"caller-{phone_number}",
                    participant_name="Outbound Call",
                    wait_until_answered=True,
                )
            )
            logger.info("Outbound call connected successfully")
        except api.TwirpError as e:
            logger.error(f"Error creating SIP participant: {e.message}")
            ctx.shutdown()
            return
    else:
        # For inbound calls, wait for participant to connect
        await ctx.wait_for_participant()

    logger.info("Participant connected, starting debt collection agent")

    # Start call recording - COMMENTED OUT FOR NOW
    recording_id = None
    if phone_number:  # Only record actual phone calls
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"debt_call_{phone_number}_{timestamp}"

            # Create directory if it doesn't exist
            os.makedirs("../recordings", exist_ok=True)

            # Create room composite recording request (proper format)
            recording_request = api.RoomCompositeEgressRequest(
                room_name=ctx.room.name,
                layout="speaker",  # Simple layout for debt collection
                audio_only=True,  # Audio only recording
                file_outputs=[
                    api.EncodedFileOutput(
                        filepath=f"recordings/{filename}.mp4"  # Relative path from LiveKit
                    )
                ],
            )

            recording = await ctx.api.egress.start_room_composite_egress(
                recording_request
            )
            recording_id = recording.egress_id
            logger.info(f"Started recording: {recording_id}")

        except Exception as e:
            logger.error(f"Failed to start recording: {e}")

    # Create agent session with Deepgram STT and OpenAI LLM/TTS
    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(
            model="nova-2-general",  # Optimized for phone call audio quality
            language="en",
            smart_format=False,  # Auto-format numbers, dates, etc.
            punctuate=False,  # Add punctuation for better LLM processing
        ),
        llm=openai.LLM(
            model="gpt-4o",  # Much faster than gpt-4o
            temperature=0.3,  # Lower temperature for faster generation
        ),
        tts=cartesia.TTS(
            model="sonic-2",
            voice="f6141af3-5f94-418c-80ed-a45d450e7e2e",  # Indian lady voice ID
            language="en",
        ),
    )

    # Start the agent session
    await session.start(
        agent=DebtCollectionAgent(is_outbound=is_outbound),
        room=ctx.room,
    )

    # Stop recording when session ends
    if recording_id:
        try:
            await ctx.api.egress.stop_egress(
                api.StopEgressRequest(egress_id=recording_id)
            )
            logger.info(f"Stopped recording: {recording_id}")
        except Exception as e:
            logger.error(f"Failed to stop recording: {e}")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            agent_name="debt-collection-agent",  # Enable explicit dispatch
        ),
    )
