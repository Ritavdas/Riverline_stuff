#!/usr/bin/env python3
"""
Test script to check LiveKit SIP + Twilio integration
"""

import asyncio
import logging
import os

from dotenv import load_dotenv
from livekit import api

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sip-test")


async def test_sip_integration():
    """Test the SIP trunk configuration"""

    livekit_api = api.LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"),
    )

    print("🧪 Testing LiveKit SIP Integration")
    print("=" * 40)

    # Test 1: Check if we can create a room
    try:
        room_name = "sip-test-room"
        room = await livekit_api.room.create_room(
            api.CreateRoomRequest(name=room_name, empty_timeout=60)
        )
        print(f"✅ Room created: {room.name}")
    except Exception as e:
        print(f"❌ Room creation failed: {e}")
        return

    # Test 2: Try to create SIP participant
    try:
        phone_number = "+919650098052"  # Your number for testing
        trunk_id = os.getenv("LIVEKIT_SIP_TRUNK_ID")

        print(f"📞 Attempting call to {phone_number}")
        print(f"🔗 Using SIP Trunk: {trunk_id}")

        sip_info = await livekit_api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                sip_trunk_id=trunk_id,
                sip_call_to=phone_number,
                room_name=room_name,
                participant_identity=f"test-call-{phone_number}",
                participant_name="Test Call",
                play_ringtone=True,
            )
        )

        print(f"✅ SIP participant created: {sip_info.participant_identity}")
        print("📱 Call should be ringing now...")

        # Monitor for 30 seconds
        print("⏳ Monitoring for 30 seconds...")
        for i in range(6):
            await asyncio.sleep(5)
            try:
                room_info = await livekit_api.room.list_rooms(
                    api.ListRoomsRequest(names=[room_name])
                )
                if room_info.rooms:
                    participants = room_info.rooms[0].num_participants
                    print(f"📊 Room participants: {participants}")
            except Exception as e:
                print(f"⚠️  Status check failed: {e}")

        print("✨ Test complete!")

    except Exception as e:
        print(f"❌ SIP call failed: {e}")
        print("💡 This might indicate:")
        print(f"   - SIP trunk configuration issue")
        print(f"   - Phone number verification needed")
        print(f"   - Twilio account restrictions")


if __name__ == "__main__":
    asyncio.run(test_sip_integration())
