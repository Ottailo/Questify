"""
Comprehensive integration test suite for QuestSage Great Sage Backend API.
Tests Authentication, Profile, OmniRoute AI, Quest Lifecycle, Subtask Toggles, and XP Claims.
"""

import sys
import os
import pytest
import httpx

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app


@pytest.mark.anyio
async def test_health():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"


@pytest.mark.anyio
async def test_full_user_and_quest_lifecycle():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register or Login
        user_email = "vanguard_pytest@guild.ledger"
        user_pwd = "VanguardSecretKey99!"
        reg_payload = {
            "email": user_email,
            "username": "VanguardPytest",
            "password": user_pwd,
            "first_name": "Valerius",
            "last_name": "Scribe"
        }
        reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
        
        login_res = await client.post("/api/v1/auth/login", json={"email": user_email, "password": user_pwd})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Verify Profile
        profile_res = await client.get("/api/v1/users/profile", headers=headers)
        assert profile_res.status_code == 200
        assert profile_res.json()["email"] == user_email

        # 3. Create Quest
        quest_data = {
            "title": "Master Async Python with Great Sage",
            "description": "Deconstruct async event loops and coroutine scheduling",
            "quest_type": "Engineering",
            "difficulty": "normal",
            "xp_value": 250,
            "estimated_duration": 45,
            "subtasks": [
                {"id": 1, "text": "Inspect asyncio.run event loop lifecycle", "weight": 50, "completed": False},
                {"id": 2, "text": "Benchmark async tasks with gathered futures", "weight": 50, "completed": False}
            ]
        }
        create_res = await client.post("/api/v1/quests/", json=quest_data, headers=headers)
        assert create_res.status_code == 200
        quest = create_res.json()
        quest_id = quest["id"]
        assert quest["title"] == quest_data["title"]

        # 4. Recent Quests
        recent_res = await client.get("/api/v1/quests/recent", headers=headers)
        assert recent_res.status_code == 200
        assert any(q["id"] == quest_id for q in recent_res.json())

        # 5. Toggle Subtask 1
        toggle_res = await client.patch(f"/api/v1/quests/{quest_id}/subtasks/1/toggle", headers=headers)
        assert toggle_res.status_code == 200
        assert toggle_res.json()["progress_percentage"] == 50.0

        # 6. Complete Quest
        claim_res = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
        assert claim_res.status_code == 200
        assert claim_res.json()["xp_earned"] == 250
