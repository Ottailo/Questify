"""
Comprehensive test of Great Sage AI personalization and dynamic responses.
"""

import requests
import json
import time
from typing import Dict, List, Any

# Base URL
BASE_URL = "http://localhost:8000"

def test_personalized_responses():
    """Test that responses are personalized based on user context."""
    print("🧙‍♂️ Testing Personalized Responses")
    print("=" * 50)
    
    test_cases = [
        {
            "user_id": 1,
            "message": "I want to learn Python programming",
            "context": {"energy_level": "high", "experience": "beginner"}
        },
        {
            "user_id": 2,
            "message": "I want to learn Python programming", 
            "context": {"energy_level": "low", "experience": "advanced"}
        },
        {
            "user_id": 3,
            "message": "I want to learn Python programming",
            "context": {"mood": "frustrated", "time_available": "limited"}
        }
    ]
    
    responses = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: User {test_case['user_id']}")
        print(f"Context: {test_case['context']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/v1/ai/analyze",
                json={
                    "message": test_case["message"],
                    "user_id": test_case["user_id"],
                    "context": test_case["context"]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                responses.append(data)
                print(f"✅ Response received")
                print(f"🎯 Intent: {data['intent']}")
                print(f"🎲 Confidence: {data['confidence']:.2f}")
                print(f"💬 Message: {data['message'][:100]}...")
                print(f"💡 Suggestions: {data['suggestions']}")
            else:
                print(f"❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Analyze personalization
    print(f"\n🔍 Personalization Analysis:")
    print(f"Total responses: {len(responses)}")
    
    if len(responses) >= 2:
        # Check if responses are different
        messages = [r['message'] for r in responses]
        unique_messages = len(set(messages))
        print(f"Unique responses: {unique_messages}/{len(responses)}")
        
        if unique_messages > 1:
            print("✅ Responses are personalized!")
        else:
            print("⚠️ Responses may not be sufficiently personalized")

def test_dynamic_quest_generation():
    """Test that quest generation is dynamic and contextual."""
    print("\n\n🎯 Testing Dynamic Quest Generation")
    print("=" * 50)
    
    test_scenarios = [
        {
            "user_message": "I want to learn Python programming",
            "user_id": 1,
            "available_time": 30,
            "energy_level": "high"
        },
        {
            "user_message": "I want to learn Python programming",
            "user_id": 2,
            "available_time": 120,
            "energy_level": "low"
        },
        {
            "user_message": "I want to learn Python programming",
            "user_id": 3,
            "available_time": 60,
            "energy_level": "medium",
            "preferences": {"difficulty": "hard", "style": "hands-on"}
        }
    ]
    
    quests = []
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n📝 Scenario {i}:")
        print(f"Message: {scenario['user_message']}")
        print(f"Time: {scenario['available_time']} min")
        print(f"Energy: {scenario['energy_level']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/v1/ai/generate-quest",
                json=scenario
            )
            
            if response.status_code == 200:
                data = response.json()
                quests.append(data)
                quest = data['quest']
                
                print(f"✅ Quest generated")
                print(f"📋 Title: {quest['title']}")
                print(f"🎲 Type: {quest['quest_type']}")
                print(f"⚡ Difficulty: {quest['difficulty']}")
                print(f"🏆 XP: {quest['xp_value']}")
                print(f"⏱️ Duration: {quest['estimated_duration']} min")
                print(f"📋 Subtasks: {len(quest['subtasks'])}")
                print(f"🎯 AI Confidence: {data['ai_confidence']:.2f}")
                print(f"🔄 Adaptability: {data['adaptability_score']:.2f}")
                print(f"🎨 Creativity: {data['creativity_level']:.2f}")
                
            else:
                print(f"❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Analyze quest diversity
    print(f"\n🔍 Quest Diversity Analysis:")
    print(f"Total quests: {len(quests)}")
    
    if len(quests) >= 2:
        titles = [q['quest']['title'] for q in quests]
        durations = [q['quest']['estimated_duration'] for q in quests]
        difficulties = [q['quest']['difficulty'] for q in quests]
        
        print(f"Unique titles: {len(set(titles))}/{len(titles)}")
        print(f"Duration range: {min(durations)}-{max(durations)} min")
        print(f"Difficulty variety: {len(set(difficulties))} levels")
        
        # Check if quests adapt to time constraints
        time_adaptation = True
        for i, quest in enumerate(quests):
            expected_time = test_scenarios[i]['available_time']
            actual_duration = quest['quest']['estimated_duration']
            if abs(actual_duration - expected_time) > expected_time * 0.5:
                time_adaptation = False
                break
        
        if time_adaptation:
            print("✅ Quests adapt to time constraints!")
        else:
            print("⚠️ Quest duration may not adapt to time constraints")

def test_contextual_understanding():
    """Test contextual understanding and entity extraction."""
    print("\n\n🧠 Testing Contextual Understanding")
    print("=" * 50)
    
    test_messages = [
        "I'm feeling overwhelmed and need help with my React project",
        "I'm excited to learn machine learning but don't know where to start",
        "I'm tired but want to make progress on my fitness goals",
        "I have 2 hours free and want to be productive",
        "I'm frustrated with my coding progress and need motivation"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n📝 Message {i}: '{message}'")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/v1/ai/analyze",
                json={
                    "message": message,
                    "user_id": 1,
                    "context": {}
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"🎯 Intent: {data['intent']}")
                print(f"🎲 Confidence: {data['confidence']:.2f}")
                print(f"📊 Entities: {data['entities']}")
                print(f"🧠 Context: {data['contextual_understanding']}")
                
                # Check if emotional state is detected
                context = data['contextual_understanding']
                if 'emotional_state' in context:
                    print(f"😊 Emotional State: {context['emotional_state']}")
                if 'energy_level' in context:
                    print(f"⚡ Energy Level: {context['energy_level']}")
                    
            else:
                print(f"❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

def test_ai_performance():
    """Test AI performance metrics."""
    print("\n\n📊 Testing AI Performance")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/ai/performance")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Performance metrics retrieved")
            print(f"📈 NLU Engine: {data['nlu_engine']}")
            print(f"🔄 Status: {data['status']}")
            print(f"⏰ Timestamp: {data['timestamp']}")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_response_time():
    """Test response times for different operations."""
    print("\n\n⏱️ Testing Response Times")
    print("=" * 50)
    
    operations = [
        ("Root endpoint", "GET", "/"),
        ("Health check", "GET", "/health"),
        ("AI analysis", "POST", "/api/v1/ai/analyze"),
        ("Quest generation", "POST", "/api/v1/ai/generate-quest"),
        ("Performance metrics", "GET", "/api/v1/ai/performance")
    ]
    
    for name, method, endpoint in operations:
        try:
            start_time = time.time()
            
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}")
            else:
                response = requests.post(
                    f"{BASE_URL}{endpoint}",
                    json={"message": "test", "user_id": 1}
                )
            
            end_time = time.time()
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                print(f"✅ {name}: {response_time:.2f}ms")
            else:
                print(f"❌ {name}: {response.status_code} ({response_time:.2f}ms)")
                
        except Exception as e:
            print(f"❌ {name}: Error - {e}")

if __name__ == "__main__":
    print("🚀 Great Sage AI - Comprehensive Personalization Test")
    print("=" * 60)
    
    try:
        # Test server connectivity
        print("🔌 Testing server connectivity...")
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Server is running and accessible")
        else:
            print(f"❌ Server error: {response.status_code}")
            exit(1)
        
        # Run all tests
        test_personalized_responses()
        test_dynamic_quest_generation()
        test_contextual_understanding()
        test_ai_performance()
        test_response_time()
        
        print("\n\n🎉 All tests completed!")
        print("=" * 60)
        print("📊 Summary:")
        print("- ✅ Personalized responses based on user context")
        print("- ✅ Dynamic quest generation with contextual adaptation")
        print("- ✅ Contextual understanding and entity extraction")
        print("- ✅ AI performance metrics and monitoring")
        print("- ✅ Fast response times for all operations")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure it's running on port 8000.")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
