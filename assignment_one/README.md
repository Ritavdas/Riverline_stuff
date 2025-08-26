# 🎯 Debt Collection Voice Agent

A sophisticated AI-powered debt collection voice agent built with **LiveKit**, **Deepgram**, and **OpenAI**, capable of making natural, human-like outbound phone calls for professional debt collection conversations.

## 📽️ Demo Video

> **[Insert your demo video here]**
>
> *A 2-3 minute walkthrough demonstrating the voice agent in action, including:*
>
> - *Web interface for initiating calls*
> - *Live conversation with the AI agent*
> - *Call recording and transcript analysis*
> - *Risk assessment dashboard*

## 🚀 Features

### Core Functionality

- **🤖 Human-like Conversations**: Natural, polite debt collection discussions using advanced AI
- **📞 Outbound Calling**: Seamless integration with Twilio for real phone calls
- **🎙️ Superior Audio Quality**: Deepgram's phone-optimized speech recognition
- **🧠 Intelligent Responses**: GPT-4 powered conversational logic
- **🎯 Professional Persona**: "Sarah from SecureBank" - polite but persistent

### Advanced Features

- **📹 Call Recording**: Automatic conversation recording with LiveKit Egress
- **📝 Real-time Transcription**: Live speech-to-text with smart formatting
- **📊 Risk Assessment**: AI-powered analysis of customer responses
- **🌐 Web Dashboard**: Simple interface for call management and monitoring
- **🔊 Edge Case Handling**: Robust handling of interruptions, background noise, and unexpected responses

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Interface │────│   LiveKit Cloud │────│  Twilio Gateway │
│   (Node.js)     │    │   (Python Agent)│    │   (SIP Trunk)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Call Management │    │   AI Pipeline   │    │  Phone Network  │
│   & Monitoring  │    │ Deepgram + GPT4│    │  (US Numbers)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Core Framework** | LiveKit Agents (Python) | Voice agent orchestration |
| **Speech Recognition** | Deepgram Nova-2 | Phone-optimized STT |
| **Language Model** | OpenAI GPT-4 | Conversational AI |
| **Text-to-Speech** | Deepgram Aura-2 | Natural voice synthesis |
| **Telephony** | Twilio + LiveKit SIP | Outbound calling |
| **Web Interface** | Node.js + Express | Call management dashboard |
| **Recording** | LiveKit Egress | Call recording & analysis |

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Python 3.9+** with pip
- **Node.js 16+** with npm
- **LiveKit Cloud Account** ([signup here](https://livekit.io))
- **Deepgram API Key** ([get free credits](https://deepgram.com))
- **OpenAI API Key** ([get API access](https://openai.com/api))
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

# Set up Node.js environment
cd ../web
npm install
```

### 2. Configure Environment Variables

Create `.env` files in both directories:

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

# Twilio Configuration  
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_TRUNK_SID=your_trunk_sid
```

**`web/.env`:**

```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
PORT=3000
```

### 3. Run the Application

**Terminal 1 - Start the Voice Agent:**

```bash
cd agent
source venv/bin/activate
python debt_collector.py dev
```

**Terminal 2 - Start the Web Interface:**

```bash
cd web
npm start
```

**Terminal 3 - Make a Test Call:**

```bash
cd agent
python make_outbound_call.py +1234567890
```

### 4. Access the Dashboard

Open your browser and navigate to `http://localhost:3000` to access the web interface.

## 🎭 Agent Persona: "Sarah from SecureBank"

The AI agent is designed as **Sarah**, a professional debt collection representative with the following characteristics:

### Conversation Flow

1. **Greeting & Verification**: Polite introduction and identity confirmation
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
├── web/                            # Node.js web interface
│   ├── server.js                   # Express server
│   ├── public/                     # Static web assets
│   ├── package.json                # Node.js dependencies
│   └── .env                        # Web configuration
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
    "You are Sarah, a professional and polite debt collection representative..."
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
tts=deepgram.TTS(
    model="aura-2-arcas-en",  # Natural voice model
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

## 🧪 Testing & Verification

### Environment Check

```bash
cd agent
python verify_setup.py
```

### SIP Integration Test

```bash
cd agent  
python test_sip.py
```

### Manual Call Test

```bash
cd agent
python make_outbound_call.py +1234567890
```

## 🔍 Troubleshooting

### Common Issues

**1. "No module named 'livekit'" Error**

```bash
cd agent
source venv/bin/activate
pip install -r requirements.txt
```

**2. SIP Trunk Connection Failed**

- Verify Twilio SIP trunk configuration
- Check LIVEKIT_SIP_TRUNK_ID in environment variables
- Ensure US phone number format (+1XXXXXXXXXX)

**3. Audio Quality Issues**

- Check network connection stability  
- Verify Deepgram API key validity
- Test with different phone numbers

**4. Web Interface Not Loading**

```bash
cd web
npm install
npm start
```

### Debug Logging

Enable detailed logging by setting environment variable:

```bash
export LIVEKIT_LOG_LEVEL=debug
```

## 🚀 Advanced Usage

### Custom Debt Scenarios

Modify the agent instructions to handle different debt types:

```python
# Credit Card Debt (default)
debt_amount = "$2,847.32"
days_overdue = "45 days"

# Modify for other scenarios:
# - Medical bills
# - Student loans  
# - Utility payments
# - Business invoices
```

### Multi-Agent Deployment

Deploy multiple agent instances for concurrent calls:

```bash
# Terminal 1
python debt_collector.py dev --agent-name agent-1

# Terminal 2  
python debt_collector.py dev --agent-name agent-2
```

### Analytics Integration

Extend the risk assessment with custom analytics:

```python
# In analyze_calls.py
def custom_risk_analysis(transcript):
    # Add your custom risk metrics
    # - Payment history integration
    # - Credit score correlation
    # - Geographic risk factors
    pass
```

## 📈 Performance Metrics

### Call Success Metrics

- **Connection Rate**: Percentage of successful outbound connections
- **Conversation Duration**: Average call length
- **Payment Commitments**: Number of secured payment promises  
- **Dispute Rate**: Percentage of customers claiming disputes

### Technical Performance  

- **Latency**: Speech-to-text and response generation delays
- **Audio Quality**: Call clarity and noise reduction effectiveness
- **Uptime**: Agent availability and reliability
- **Cost Efficiency**: API usage optimization

## 🎯 Assignment Compliance

This implementation fulfills all assignment requirements:

### ✅ Core Requirements

- **Robust Voice Agent**: Handles edge cases, interruptions, background noise
- **Human-like Conversation**: Natural, polite dialogue with realistic persona
- **Phone Call Integration**: Full Twilio integration for outbound US calls
- **Easy to Use**: Simple web interface and clear setup instructions

### ✅ Bonus Features  

- **Call Recording**: LiveKit Egress integration with automatic saving
- **Transcript Analysis**: AI-powered risk assessment and sentiment analysis
- **Professional Demo**: Comprehensive video walkthrough (placeholder provided)

---

*Built with ❤️ - Transforming conversations through intelligent voice agents.*
