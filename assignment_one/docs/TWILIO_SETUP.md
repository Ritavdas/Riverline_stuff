# Twilio SIP Integration Setup

## Step 1: Twilio Account Setup

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Create a free account (comes with $15 free credit)
3. Verify your phone number
4. Note your Account SID and Auth Token

## Step 2: Get a Phone Number

1. Go to Phone Numbers → Manage → Buy a number
2. Choose a US number (required for easier setup)
3. Note the phone number (e.g., +15551234567)

## Step 3: LiveKit SIP Trunk Configuration

1. In LiveKit Cloud dashboard:
   - Go to SIP section
   - Create a new SIP Trunk
   - Configure with Twilio credentials:
     - Name: "Twilio Trunk"
     - SIP URI: `sip:twilio.com`
     - Username: Your Twilio Account SID
     - Password: Your Twilio Auth Token

2. Note the SIP Trunk ID from LiveKit

## Step 4: Environment Variables

Add these to your `.env` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token  
TWILIO_PHONE_NUMBER=+15551234567

# LiveKit SIP
LIVEKIT_SIP_TRUNK_ID=your_livekit_sip_trunk_id
```

## Step 5: Test Configuration

Run the test script:

```bash
cd agent
source venv/bin/activate
python outbound_caller.py
```

## Troubleshooting

- **Authentication errors**: Double-check Account SID and Auth Token
- **Number format**: Always use E.164 format (+1234567890)
- **Permissions**: Ensure Twilio account has calling permissions
- **Credits**: Check you have sufficient Twilio credits

## Cost Estimation

- Outbound calls: ~$0.013/minute to US numbers
- Free credits should cover 50+ test calls of 5 minutes each
