# 🎯 Debt Collection Voice Agent

A sophisticated AI-powered debt collection voice agent built with **LiveKit**, **Deepgram**, **Cartesia**, and **OpenAI**, capable of making natural, human-like outbound phone calls for professional debt collection conversations.

## 📽️ Demo Video

https://github.com/user-attachments/assets/077e90d3-52a3-4a64-bec0-d69ff57d997e


> *A 2-3 minute walkthrough demonstrating the voice agent in action, including:*
>
> - *Console interface for initiating calls*
> - *Live conversation with the AI agent*
> - *Call recording and transcript analysis*
> - *Console-based risk assessment output*

## 🚀 Features

### Core Functionality

- **🤖 Human-like Conversations**: Natural, polite debt collection discussions using advanced AI
- **📞 Outbound Calling**: Seamless integration with Twilio for real phone calls
- **🎙️ Superior Audio Quality**: Deepgram's phone-optimized speech recognition
- **🧠 Intelligent Responses**: GPT-4 powered conversational logic
- **🎯 Professional Persona**: "Anjali from SecureBank" - polite Indian voice agent

### Advanced Features

- **📹 Call Recording**: Automatic conversation recording with LiveKit Egress
- **📝 Real-time Transcription**: Live speech-to-text with smart formatting
- **📊 Risk Assessment**: AI-powered analysis of customer responses
- **🖥️ Console Interface**: Real-time call monitoring and logging
- **🔊 Edge Case Handling**: Robust handling of interruptions, background noise, and unexpected responses

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Python Console │────│   LiveKit Cloud │────│  Twilio Gateway │
│  debt_collector │    │   (AI Pipeline) │    │   (SIP Trunk)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Console Output  │    │   AI Pipeline   │    │  Phone Network  │
│ Real-time Logs  │    │Deepgram+Cartesia│    │  (US Numbers)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### How It's Built

1. **LiveKit Agents Framework**: Orchestrates the entire voice pipeline
2. **Deepgram STT**: Converts phone audio to text with phone-optimized models
3. **OpenAI GPT-4**: Powers Anjali's conversational intelligence
4. **Cartesia TTS**: Generates natural Indian voice synthesis
5. **Twilio SIP**: Handles actual phone call connectivity
6. **Console Interface**: Real-time monitoring and testing

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Core Framework** | LiveKit Agents (Python) | Voice agent orchestration |
| **Speech Recognition** | Deepgram Nova-2 | Phone-optimized STT |
| **Language Model** | OpenAI GPT-4 | Conversational AI |
| **Text-to-Speech** | Cartesia Sonic-2 | Natural Indian voice synthesis |
| **Telephony** | Twilio + LiveKit SIP | Outbound calling |
| **Console Interface** | Python Terminal | Real-time monitoring |
| **Recording** | LiveKit Egress | Call recording & analysis |

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Python 3.9+** with pip

- **LiveKit Cloud Account** ([signup here](https://livekit.io))
- **Deepgram API Key** ([get free credits](https://deepgram.com))
- **OpenAI API Key** ([get API access](https://openai.com/api))
- **Cartesia API Key** ([get voice synthesis access](https://cartesia.ai))
- **Twilio Account** ([free trial available](https://twilio.com))

## ⚡ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd riverlineAssignment/assignment_one

# Set up Python environment
cd agent
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` file in the agent directory:

**`agent/.env`:**

```bash
# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_SIP_TRUNK_ID=your_sip_trunk_id

# AI Services
DEEPGRAM_API_KEY=your_deepgram_api_key
OPENAI_API_KEY=your_openai_api_key
CARTESIA_API_KEY=your_cartesia_api_key

# Twilio Configuration  
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_TRUNK_SID=your_trunk_sid
```

### 3. Run the Application

**Terminal 1 - Start the Voice Agent (Wait Mode):**

```bash
cd agent
source venv/bin/activate
python debt_collector.py start
```

The agent will now be waiting and ready to join rooms for incoming connections.

**Terminal 2 - Make an Outbound Call:**

```bash
cd agent
python make_outbound_call.py +1234567890
```

### 4. Test in Console

The agent runs directly in the console. You can see real-time logs of the conversation, connection status, and call progress in Terminal 1 where the agent is running.

## 🎭 Agent Persona: "Anjali from SecureBank"

The AI agent is designed as **Anjali**, a professional debt collection representative with authentic Indian voice characteristics and the following features:

### Conversation Flow

1. **Greeting & Verification**: Personalized greeting "Hello, am i speaking to Ritav Das?" and identity confirmation
2. **Situation Explanation**: Clear explanation of overdue payment ($2,847.32, 45 days past due)
3. **Active Listening**: Responds appropriately to customer reactions
4. **Solution Offering**: Flexible payment options and assistance
5. **Commitment Securing**: Attempts to get concrete payment promises
6. **Professional Closure**: Clear next steps and follow-up actions

### Key Behaviors

- **Polite but Persistent**: Maintains professional tone while pursuing collection
- **Empathetic Responses**: Understands customer difficulties and offers solutions
- **Edge Case Handling**: Gracefully manages interruptions, denials, and unexpected responses
- **Human-like Interaction**: Natural speech patterns, appropriate pauses, realistic reactions

## 📁 Project Structure

```
assignment_one/
├── agent/                          # Python LiveKit agent
│   ├── debt_collector.py          # Main agent implementation
│   ├── make_outbound_call.py       # Call initiation script
│   ├── analyze_calls.py            # Risk assessment analysis
│   ├── verify_setup.py             # Environment verification
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Agent configuration
│

├── docs/                           # Documentation
│   ├── PROJECT_DECISIONS.md        # Technical decisions & architecture
│   ├── challenge_one.txt           # Original assignment requirements
│   └── selfNotes.txt               # Development notes
│
├── recordings/                     # Call recordings (auto-created)
└── transcripts/                    # Conversation transcripts (auto-created)
```

## 🔧 Configuration Options

### Agent Behavior Customization

**Conversation Tone** (`debt_collector.py:25-43`):

```python
instructions=(
    "You are Anjali, a professional and polite debt collection representative..."
    # Modify this section to change agent personality
)
```

**Audio Models** (`debt_collector.py:140-154`):

```python
stt=deepgram.STT(
    model="nova-2-phonecall",  # Optimized for phone calls
    smart_format=True,         # Auto-format numbers/dates
    punctuate=True,           # Add punctuation
),
tts=cartesia.TTS(
    model="sonic-2",
    voice="f6141af3-5f94-418c-80ed-a45d450e7e2e",  # Indian lady voice
    language="en",
)
```

### Call Recording Settings

Recording is automatically enabled for all phone calls and saved to the `recordings/` directory with timestamps.

## 📊 Risk Assessment

The system includes AI-powered risk assessment of customer responses:

### Risk Categories

- **🟢 Low Risk**: Cooperative customers, payment commitments
- **🟡 Medium Risk**: Hesitant customers, partial payments
- **🔴 High Risk**: Hostile responses, refusal to pay, disputes

### Analysis Features

- **Sentiment Analysis**: Emotional tone of customer responses
- **Commitment Detection**: Identification of payment promises
- **Dispute Recognition**: Legal challenge or disagreement indicators
- **Cooperation Score**: Overall willingness to resolve debt

## 🧪 Testing & Usage

### Step-by-Step Testing

**1. Environment Check:**

```bash
cd agent
python verify_setup.py
```

**2. Start Agent (Console Mode):**

```bash
python debt_collector.py start
```

The agent will show: "Waiting for connections..." and real-time logs.

**3. Make Test Call:**

```bash
# In another terminal
cd agent
python make_outbound_call.py +1234567890
```

**4. Monitor Console:**
Watch Terminal 1 for live conversation logs, STT output, and agent responses.

### Console Testing Features

- **Real-time STT**: See exactly what the agent hears
- **Live Responses**: Watch Anjali's responses as they generate
- **Call Status**: Connection, recording, and session info
- **Error Handling**: Immediate feedback on any issues

---

*Built with ❤️ - Transforming conversations through intelligent voice agents.*
