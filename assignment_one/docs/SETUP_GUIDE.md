# Debt Collection Voice Agent - Setup Guide

## Step 1: LiveKit Cloud Setup

1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a free account
3. Create a new project
4. Copy your credentials:
   - `LIVEKIT_URL` (e.g., wss://your-project.livekit.cloud)
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`

## Step 2: OpenAI API Setup

1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create an API key
3. Copy your `OPENAI_API_KEY`

## Step 3: Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual credentials in `.env`

## Step 4: Test Basic Agent

Run the agent in development mode:
```bash
cd agent
source venv/bin/activate
python debt_collector.py dev
```

This will start the agent locally for testing before we add telephony integration.

## Next Steps

- Set up Twilio for SIP integration
- Test outbound calling
- Build web interface