#!/usr/bin/env python3
"""
Setup verification script for debt collection voice agent
"""

import os
import sys

from dotenv import load_dotenv


def check_env_file():
    """Check if .env file exists"""
    env_path = ".env"
    if not os.path.exists(env_path):
        print("❌ .env file not found")
        print("   → Copy .env.example to .env and fill in your credentials")
        return False

    print("✅ .env file found")
    return True


def check_credentials():
    """Check if all required credentials are set"""
    load_dotenv()

    required_vars = [
        "LIVEKIT_URL",
        "LIVEKIT_API_KEY",
        "LIVEKIT_API_SECRET",
        "OPENAI_API_KEY",
    ]

    missing = []
    for var in required_vars:
        value = os.getenv(var)
        if not value or value.startswith("your-"):
            missing.append(var)
        else:
            print(f"✅ {var} is set")

    if missing:
        print(f"\n❌ Missing credentials: {', '.join(missing)}")
        print("   → Update your .env file with actual values")
        return False

    return True


def check_imports():
    """Check if required packages are installed"""
    try:
        import livekit.agents

        print("✅ livekit-agents installed")
    except ImportError:
        print("❌ livekit-agents not found")
        return False

    try:
        from livekit.plugins import openai

        print("✅ livekit-plugins-openai installed")
    except ImportError:
        print("❌ livekit-plugins-openai not found")
        return False

    return True


def main():
    print("🔍 Verifying debt collection agent setup...\n")

    checks = [check_env_file(), check_credentials(), check_imports()]

    if all(checks):
        print("\n🎉 Setup verification complete! Ready to test the agent.")
        print("\nNext steps:")
        print("1. Run: python debt_collector.py dev")
        print("2. Open the LiveKit room URL in your browser")
        print("3. Test the conversation")
    else:
        print("\n⚠️  Setup incomplete. Please fix the issues above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
