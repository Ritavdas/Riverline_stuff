import logging

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import openai, silero

load_dotenv()
logger = logging.getLogger("debt-collection-agent")


class DebtCollectionAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are Sarah, a professional and polite debt collection representative from SecureBank. "
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
                "Remember: You're calling about a $2,847.32 overdue payment that's 45 days past due. "
                "Be understanding but firm about the need for payment resolution."
            ),
        )

    async def on_enter(self):
        # When the agent enters the session, start with the greeting
        await self.session.say(
            "Hello, may I please speak with the account holder for credit card ending in 4729?",
            allow_interruptions=True,
        )


def prewarm(proc: JobProcess):
    """Prewarm function to initialize resources"""
    # Initialize VAD for voice activity detection
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the debt collection voice agent"""

    # Wait for the first participant to connect
    await ctx.wait_for_participant()

    logger.info("Participant connected, starting debt collection agent")

    # Create agent session with OpenAI components
    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        stt=openai.STT(
            model="whisper-1",
        ),
        llm=openai.LLM(
            model="gpt-4o-mini",
            temperature=0.7,
        ),
        tts=openai.TTS(
            model="tts-1",
            voice="nova",  # Professional female voice
        ),
    )

    # Start the agent session
    await session.start(
        agent=DebtCollectionAgent(),
        room=ctx.room,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )
