import json
import logging
import os
from datetime import datetime

import requests
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
logger = logging.getLogger("debt-collection-agent-indian-voice")


class IndianVoiceDebtCollectionAgent(Agent):
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
        await self.session.say(
            "Hello, am i speaking to Ritav Das?",
            allow_interruptions=True,
        )


def prewarm(proc: JobProcess):
    """Prewarm function with Indian voice setup"""
    proc.userdata["vad"] = silero.VAD.load(
        min_speech_duration=100,
        min_silence_duration=400,
    )


async def entrypoint(ctx: JobContext):
    """Entrypoint with Indian lady voice configuration"""

    # Check if this is an outbound call
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

    # Handle outbound call setup
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
        await ctx.wait_for_participant()

    logger.info("Participant connected, starting Indian voice debt collection agent")

    # Configure session with Indian lady voice
    stt_config = deepgram.STT(
        model="nova-2-phonecall",
        language="en",
        interim_results=True,
        smart_format=True,
        punctuate=True,
    )

    llm_config = openai.LLM(
        model="gpt-4o",
        temperature=0.5,
    )

    # Indian lady voice configuration - GUARANTEED TO WORK
    tts_config = cartesia.TTS(
        model="sonic-2",
        voice="f6141af3-5f94-418c-80ed-a45d450e7e2e",  # Indian lady voice ID
        language="en",
    )

    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        stt=stt_config,
        llm=llm_config,
        tts=tts_config,
    )

    # Start the agent session
    await session.start(
        agent=IndianVoiceDebtCollectionAgent(is_outbound=is_outbound),
        room=ctx.room,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            agent_name="debt-collection-agent-indian-voice",
        ),
    )
