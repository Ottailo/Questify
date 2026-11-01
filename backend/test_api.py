"""
Test script for QuestSage Great Sage AI API.
"""

import requests
import json

# Base URL
BASE_URL = "http://localhost:8001"

def test_root():
    """Test root endpoint."""
    response = requests.get(f"{BASE_URL}/")
    print("Root endpoint:")
    print(json.dumps(response.json(), indent=2))
    print()

def test_health():
    """Test health endpoint."""
    response = requests.get(f"{BASE_URL}/health")
    print("Health endpoint:")
    print(json.dumps(response.json(), indent=2))
    print()

def test_ai_analyze():
    """Test AI analysis endpoint."""
    data = {
        "message": "I want to learn Python programming",
        "user_id": 1,
        "context": {}
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/ai/analyze", json=data)
    print("AI Analysis endpoint:")
    print(json.dumps(response.json(), indent=2))
    print()

def test_quest_generation():
    """Test quest generation endpoint."""
    data = {
        "user_message": "I want to learn Python programming",
        "user_id": 1,
        "available_time": 60,
        "energy_level": "high"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/ai/generate-quest", json=data)
    print("Quest Generation endpoint:")
    print(json.dumps(response.json(), indent=2))
    print()

def test_performance():
    """Test performance endpoint."""
    response = requests.get(f"{BASE_URL}/api/v1/ai/performance")
    print("Performance endpoint:")
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == "__main__":
    print("🧙‍♂️ Testing QuestSage Great Sage AI API")
    print("=" * 50)
    
    try:
        test_root()
        test_health()
        test_ai_analyze()
        test_quest_generation()
        test_performance()
        
        print("✅ All tests completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the server is running on port 8001.")
    except Exception as e:
        print(f"❌ Error during testing: {e}")
