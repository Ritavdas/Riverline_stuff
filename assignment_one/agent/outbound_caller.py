import asyncio
import logging
import os
from typing import Optional

from livekit import api
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("outbound-caller")


class OutboundCaller:
    def __init__(self):
        self.livekit_api = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )
    
    async def make_call(
        self, 
        phone_number: str, 
        customer_name: Optional[str] = None,
        account_last_four: str = "4729",
        amount_due: float = 2847.32,
        days_overdue: int = 45
    ) -> str:
        """
        Make an outbound call to collect debt
        
        Args:
            phone_number: Phone number to call (e.g., +1234567890)
            customer_name: Name of the customer (optional)
            account_last_four: Last 4 digits of credit card
            amount_due: Amount owed
            days_overdue: Days past due
            
        Returns:
            Room name for the call
        """
        
        # Create a room for the call
        room_name = f"debt-collection-{phone_number.replace('+', '').replace('-', '')}"
        
        logger.info(f"Creating room: {room_name}")
        
        try:
            # Create room
            room = await self.livekit_api.room.create_room(
                api.CreateRoomRequest(
                    name=room_name,
                    empty_timeout=10 * 60,  # 10 minutes timeout
                    max_participants=2,  # Agent + caller
                )
            )
            
            logger.info(f"Room created: {room.name}")
            
            # Create SIP participant for outbound call
            sip_info = await self.livekit_api.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    sip_trunk_id=os.getenv("LIVEKIT_SIP_TRUNK_ID"),
                    sip_call_to=phone_number,
                    room_name=room_name,
                    participant_identity=f"caller-{phone_number}",
                    participant_name=customer_name or f"Customer {phone_number}",
                    participant_metadata=f"account_last_four={account_last_four},amount_due={amount_due},days_overdue={days_overdue}",
                    dtmf="",  # No DTMF for initial call
                    play_ringtone=True,
                )
            )
            
            logger.info(f"SIP participant created: {sip_info.participant_identity}")
            
            # Start the debt collection agent in the room
            await self._start_agent_in_room(room_name, customer_name, account_last_four, amount_due, days_overdue)
            
            return room_name
            
        except Exception as e:
            logger.error(f"Failed to make call to {phone_number}: {e}")
            raise
    
    async def _start_agent_in_room(
        self, 
        room_name: str, 
        customer_name: Optional[str],
        account_last_four: str,
        amount_due: float,
        days_overdue: int
    ):
        """Start the debt collection agent in the specified room"""
        
        # This would typically be handled by your agent deployment system
        # For now, we'll just log that the agent should be started
        logger.info(f"Agent should be started in room: {room_name}")
        logger.info(f"Customer: {customer_name}, Account: ***{account_last_four}, Amount: ${amount_due}, Days overdue: {days_overdue}")
    
    async def get_call_status(self, room_name: str) -> dict:
        """Get the status of an ongoing call"""
        
        try:
            room = await self.livekit_api.room.list_rooms(
                api.ListRoomsRequest(names=[room_name])
            )
            
            if room.rooms:
                room_info = room.rooms[0]
                participants = await self.livekit_api.room.list_participants(
                    api.ListParticipantsRequest(room=room_name)
                )
                
                return {
                    "room_name": room_name,
                    "active": room_info.num_participants > 0,
                    "participants": len(participants.participants),
                    "duration": room_info.creation_time,
                    "status": "active" if room_info.num_participants > 0 else "ended"
                }
            else:
                return {
                    "room_name": room_name,
                    "active": False,
                    "status": "not_found"
                }
                
        except Exception as e:
            logger.error(f"Failed to get call status for {room_name}: {e}")
            return {
                "room_name": room_name,
                "active": False,
                "status": "error",
                "error": str(e)
            }


# Example usage
async def main():
    """Example of how to use the OutboundCaller"""
    caller = OutboundCaller()
    
    # Make a test call
    phone_number = "+1234567890"  # Replace with actual test number
    customer_name = "John Doe"
    
    try:
        room_name = await caller.make_call(
            phone_number=phone_number,
            customer_name=customer_name,
            account_last_four="4729",
            amount_due=2847.32,
            days_overdue=45
        )
        
        print(f"Call initiated in room: {room_name}")
        
        # Check status after 5 seconds
        await asyncio.sleep(5)
        status = await caller.get_call_status(room_name)
        print(f"Call status: {status}")
        
    except Exception as e:
        print(f"Call failed: {e}")


if __name__ == "__main__":
    asyncio.run(main())