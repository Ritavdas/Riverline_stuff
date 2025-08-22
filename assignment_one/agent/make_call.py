#!/usr/bin/env python3
"""
Simple CLI command to make debt collection calls
Usage: python make_call.py +1234567890 "John Doe"
"""

import asyncio
import logging
import sys

from dotenv import load_dotenv
from outbound_caller import OutboundCaller

load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


async def make_debt_collection_call(phone_number: str, customer_name: str = "Customer"):
    """Make a debt collection call"""

    print(f"🔥 Initiating debt collection call to {phone_number} ({customer_name})")
    print("📞 Creating room and dialing...")

    caller = OutboundCaller()

    try:
        room_name = await caller.make_call(
            phone_number=phone_number,
            customer_name=customer_name,
            account_last_four="4729",
            amount_due=2847.32,
            days_overdue=45,
        )

        print(f"✅ Call initiated successfully!")
        print(f"📋 Room: {room_name}")
        print(f"🤖 Voice agent will join automatically")
        print(f"📱 Calling {phone_number}...")

        # Monitor call status
        print("\n⏳ Monitoring call status...")
        for i in range(10):
            await asyncio.sleep(5)
            status = await caller.get_call_status(room_name)
            print(
                f"Status: {status['status']} | Participants: {status.get('participants', 0)}"
            )

            if status["status"] == "active" and status.get("participants", 0) > 1:
                print("🎉 Call is active! Debt collection agent is talking.")
                break

        print("\n✨ Call monitoring complete.")

    except Exception as e:
        print(f"❌ Call failed: {e}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python make_call.py +1234567890 [Customer Name]")
        print("Example: python make_call.py +919650098052 'John Doe'")
        sys.exit(1)

    phone_number = sys.argv[1]
    customer_name = sys.argv[2] if len(sys.argv) > 2 else "Customer"

    print("🎯 Debt Collection Voice Agent")
    print("=" * 40)

    asyncio.run(make_debt_collection_call(phone_number, customer_name))


if __name__ == "__main__":
    main()
