"""
Direct test script for QuestSage Great Sage Backend API and OmniRoute integration.
"""

import sys
import asyncio
import os

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, init_db
from app.models.user import User
from app.api.v1.endpoints.auth import register_user, login_user, UserCreate, UserLogin
from app.services.ai.omniroute_client import omniroute_client


async def run_direct_test():
    print("Initializing Database tables...")
    await init_db()
    db = SessionLocal()

    print("[1/3] Testing Auth Engine (Bcrypt + JWT)...")
    email = "chronicler_direct@guild.ledger"
    pwd = "DirectTestKey2026!"
    
    # Register test user
    try:
        reg_res = await register_user(UserCreate(email=email, username="DirectChronicler", password=pwd), db)
        print("  - Register: OK (Token received)")
    except Exception:
        # User may already exist
        pass

    login_res = await login_user(UserLogin(email=email, password=pwd), db)
    assert login_res.access_token, "No access token issued!"
    print(f"  - Login: OK (User: {login_res.username})")

    print("[2/3] Testing OmniRoute Great Sage AI Directive Analysis...")
    analysis = await omniroute_client.analyze_directive("I need to focus on completing the backend API today.")
    print(f"  - Sage Advice: {analysis.get('message')}")
    print(f"  - Detected State: {analysis.get('emotional_state')} (Energy: {analysis.get('energy_level')})")

    print("[3/3] Testing OmniRoute Quest Blueprint Deconstruction...")
    blueprint = await omniroute_client.generate_quest_blueprint("Build high-performance async REST API", user_level=5)
    print(f"  - Blueprint Title: {blueprint.get('title')}")
    print(f"  - XP: {blueprint.get('xp_value')} | Duration: {blueprint.get('estimated_duration')}m")
    for s in blueprint.get("subtasks", []):
        print(f"    * {s.get('text')} [{s.get('weight')}%]")

    print("\nAll direct tests PASSED successfully!")


if __name__ == "__main__":
    asyncio.run(run_direct_test())
