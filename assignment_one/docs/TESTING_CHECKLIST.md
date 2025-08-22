# Testing Checklist - Debt Collection Voice Agent

## Phase 1: Environment Setup ✓
- [x] Python environment with LiveKit Agents
- [x] OpenAI plugin installed  
- [x] Basic agent script created

## Phase 2: Basic Voice Agent Test

### Prerequisites:
1. **Create .env file:**
   ```bash
   cd agent
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

2. **Required credentials:**
   - LiveKit Cloud account + API keys
   - OpenAI API key
   
### Test Steps:
1. **Test agent in development mode:**
   ```bash
   cd agent
   source venv/bin/activate
   python debt_collector.py dev
   ```
   
2. **Expected outcome:**
   - Agent starts and connects to LiveKit room
   - You can join via web browser to test conversation
   - Agent should greet and ask about account holder

## Phase 3: Web Interface Test

### Test Steps:
1. **Install Node.js dependencies:**
   ```bash
   cd web
   npm install
   ```

2. **Start web server:**
   ```bash
   npm start
   ```

3. **Test interface:**
   - Visit http://localhost:3000
   - Try initiating a call (will be simulated for now)
   - Check call status updates

## Phase 4: Integration Test

### Test Steps:
1. **Configure Twilio SIP trunk in LiveKit**
2. **Test outbound calling with real phone number**
3. **Verify agent joins call and converses**

## Current Status: 
**Phase 2 - Ready to test basic voice agent**

Let's start with Phase 2!