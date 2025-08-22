# Debt Collection Voice Agent - Project Decisions & Architecture

## Project Overview
Building a debt collection voice agent using LiveKit for Riverline's hiring assignment. The agent must make outbound calls via Twilio and engage in natural, polite conversations to collect outstanding debts.

## Technology Stack Decisions

### Core Framework: LiveKit Agents (Python) ✅

**Decision:** Use Python-based LiveKit Agents Framework as the primary technology

**Rationale:**
- **Production Ready**: Explicitly recommended by LiveKit for production use
- **Mature Ecosystem**: Stable APIs with comprehensive documentation
- **Rich AI Integrations**: Full support for all major STT/TTS/LLM providers
- **10-Minute Quickstart**: Fastest path to working voice agent
- **Telephony Support**: Built-in SIP integration for Twilio outbound calls

**Alternative Considered:** AgentsJS (Node.js)
- **Rejected because**: Beta status, potential API changes, production not recommended

### Telephony Integration: LiveKit SIP + Twilio ✅

**Decision:** Use LiveKit's native SIP integration with Twilio for outbound calling

**Rationale:**
- **Seamless Integration**: LiveKit SIP is designed specifically for this use case
- **Minimal Configuration**: Direct integration with Twilio SIP trunks
- **Advanced Features**: DTMF support, call transfers, voicemail detection
- **US Number Support**: Assignment specifically mentions using US numbers
- **Call Quality**: Built-in Krisp noise cancellation

**Alternative Considered:** Direct Twilio Voice API
- **Rejected because**: More complex integration, less optimized for AI agents

### AI Services Stack

**Speech-to-Text:** OpenAI Whisper or Deepgram
- **Rationale**: High accuracy, real-time processing, good noise handling

**Language Model:** OpenAI GPT-4 
- **Rationale**: Best conversational AI for polite, human-like debt collection dialogue

**Text-to-Speech:** ElevenLabs or OpenAI TTS
- **Rationale**: Natural-sounding voices for convincing human-like conversations

**Alternative Considered:** OpenAI Realtime API
- **Could be explored**: Single API for STT+LLM+TTS, but less control over individual components

### Architecture Decisions

#### 1. Agent Architecture: Single Agent per Call ✅
- **Decision**: Deploy one Python agent instance per outbound call
- **Rationale**: Isolated conversations, better debugging, scalable

#### 2. Web Interface: Simple Express.js Dashboard ✅
- **Decision**: Minimal Node.js/Express web interface for call management
- **Rationale**: 
  - Familiar technology for quick development
  - Simple requirements (call initiation, status monitoring)
  - Separation of concerns (Python for AI, JS for UI)

#### 3. Call Recording: LiveKit Egress ✅
- **Decision**: Use LiveKit's built-in egress functionality
- **Rationale**: Native integration, automatic transcription, bonus points

#### 4. Data Storage: Local Files + Optional Database ✅
- **Decision**: Store call recordings and transcripts locally, with optional lightweight database
- **Rationale**: Assignment scope is proof-of-concept, not production system

### Conversation Design Decisions

#### 1. Debt Collection Scenario: Credit Card Overdue ✅
- **Decision**: Focus on credit card debt collection scenario
- **Rationale**: 
  - Common, relatable scenario
  - Clear conversation flow patterns
  - Well-defined success metrics (payment promise, dispute, etc.)

#### 2. Conversation Flow: Polite but Persistent ✅
- **Decision**: Design agent to be respectful but effective
- **Rationale**: 
  - Assignment emphasizes "polite" conversation
  - Realistic business scenario
  - Demonstrates advanced conversational AI

#### 3. Edge Case Handling: Comprehensive ✅
- **Decision**: Handle interruptions, background noise, unexpected responses
- **Rationale**: Assignment specifically requires robust edge case handling

### Implementation Phases

#### Phase 1: Core Agent Setup
1. LiveKit Cloud account setup
2. Python environment with LiveKit Agents
3. Basic voice pipeline (STT + LLM + TTS)
4. Local testing in console mode

#### Phase 2: Conversation Logic
1. Debt collection conversation state machine
2. Polite, human-like response generation
3. Edge case handling (interruptions, denials, etc.)
4. Call termination logic

#### Phase 3: Telephony Integration
1. Twilio account setup and SIP trunk configuration
2. LiveKit SIP integration
3. Outbound calling implementation
4. Call status monitoring

#### Phase 4: Web Interface
1. Simple Express.js server
2. Call initiation form
3. Real-time call status display
4. Basic call history

#### Phase 5: Recording & Analysis (Bonus)
1. Call recording with LiveKit Egress
2. Transcript storage and analysis
3. Simple risk assessment algorithm
4. Results dashboard

### Risk Mitigation Strategies

#### Technical Risks:
- **LiveKit Cloud Limits**: Use free tier efficiently, monitor usage
- **Twilio Costs**: Use free credits, test with short calls
- **AI API Costs**: Optimize prompts, use efficient models

#### Project Risks:
- **Time Constraints**: Focus on core features first, bonus features last
- **Complexity Creep**: Keep web interface minimal
- **Integration Issues**: Test telephony integration early

### Success Criteria

#### Minimum Viable Product:
- ✅ Agent makes outbound calls via Twilio
- ✅ Natural conversation about debt collection
- ✅ Handles basic interruptions and responses
- ✅ Simple web interface to initiate calls

#### Bonus Features:
- ✅ Call recording and transcript storage
- ✅ Basic risk analysis of customer responses
- ✅ Professional demo video

### Development Environment

**Required Tools:**
- Python 3.9+ with uv package manager
- LiveKit Cloud account
- Twilio account (free tier)
- OpenAI API key
- Node.js (for web interface)

**Repository Structure:**
```
riverlineAssignment/
├── agent/                 # Python LiveKit agent
├── web/                   # Node.js web interface  
├── recordings/            # Call recordings
├── transcripts/           # Conversation transcripts
├── docs/                  # Documentation
└── README.md             # Setup instructions
```

### Timeline Estimate

**Total Development Time**: 12-15 hours
- **Phase 1-2**: Core agent (4-5 hours)
- **Phase 3**: Telephony integration (3-4 hours)
- **Phase 4**: Web interface (2-3 hours)
- **Phase 5**: Bonus features (2-3 hours)
- **Testing & Demo**: 1-2 hours

**Deliverable**: Working voice agent + 2-3 minute Loom demo video

---

*This document serves as the technical specification and decision rationale for the debt collection voice agent project. All decisions prioritize assignment success, development speed, and demonstration value.*