#!/usr/bin/env python3
"""
Generate a room token for testing the debt collection agent
"""

import os
from livekit import api
from dotenv import load_dotenv

load_dotenv()

def generate_room_token(room_name="test-debt-collection", participant_name="Test User"):
    """Generate a room token for testing"""
    
    # Your LiveKit credentials
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    livekit_url = os.getenv("LIVEKIT_URL")
    
    if not all([api_key, api_secret, livekit_url]):
        print("❌ Missing LiveKit credentials in .env file")
        return None
    
    # Generate token
    token = api.AccessToken(api_key, api_secret) \
        .with_identity(participant_name) \
        .with_name(participant_name) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        )).to_jwt()
    
    print(f"🎯 Room: {room_name}")
    print(f"🌐 LiveKit URL: {livekit_url}")
    print(f"🎟️  Room Token: {token}")
    print(f"\nℹ️  This token allows '{participant_name}' to join room '{room_name}'")
    
    return token

if __name__ == "__main__":
    print("🔑 Generating room token for debt collection agent testing...\n")
    generate_room_token()