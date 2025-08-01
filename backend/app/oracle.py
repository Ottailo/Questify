import openai
import chromadb
from tavily import TavilyClient
from sqlalchemy.orm import Session
from app.crud import create_quest, complete_quest, get_user_quests, get_user_by_id
from app.schemas import OracleInput, OracleAction
import os
import json
from typing import List, Dict, Any
import asyncio

# Initialize clients
openai.api_key = os.getenv("OPENAI_API_KEY")
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# Initialize ChromaDB for memory
chroma_client = chromadb.Client()
try:
    memory_collection = chroma_client.get_collection("user_memories")
except:
    memory_collection = chroma_client.create_collection("user_memories")

class Oracle:
    def __init__(self):
        self.system_prompt = """You are The Oracle, a wise and mystical AI Game Master in Questify. You guide adventurers on their real-life quests with wisdom, encouragement, and a touch of mystery.

Your role:
- Help users create meaningful quests from their goals and tasks
- Provide guidance and motivation
- Remember past interactions and user preferences
- Use web search when needed for current information
- Respond in a structured JSON format

Available actions:
- CREATE_QUEST: Create a new quest for the user
- COMPLETE_QUEST: Mark an existing quest as complete
- SEARCH_INTERNET: Search for current information
- MESSAGE: Send a motivational or guidance message

Always respond with valid JSON in this format:
{
    "action": "ACTION_TYPE",
    "data": {
        // Action-specific data
    },
    "message": "Your response message to the user"
}"""

    def get_user_context(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Gather user context for the Oracle."""
        user = get_user_by_id(db, user_id)
        if not user:
            return {}
        
        # Get active quests
        quests = get_user_quests(db, user_id)
        active_quests = [q for q in quests if not q.is_completed]
        
        return {
            "user": {
                "id": user.id,
                "name": user.adventurer_name,
                "level": user.level,
                "xp": user.xp,
                "xp_for_next_level": user.xp_for_next_level,
                "mood": user.last_interaction_mood
            },
            "active_quests": [
                {
                    "id": q.id,
                    "title": q.title,
                    "description": q.description,
                    "xp_value": q.xp_value
                } for q in active_quests
            ]
        }

    def get_user_memories(self, user_id: int, query: str, limit: int = 5) -> List[str]:
        """Retrieve relevant user memories from ChromaDB."""
        try:
            results = memory_collection.query(
                query_texts=[query],
                n_results=limit,
                where={"user_id": str(user_id)}
            )
            return results['documents'][0] if results['documents'] else []
        except Exception as e:
            print(f"Error retrieving memories: {e}")
            return []

    def store_memory(self, user_id: int, text: str):
        """Store a memory in ChromaDB."""
        try:
            memory_collection.add(
                documents=[text],
                metadatas=[{"user_id": str(user_id), "timestamp": str(asyncio.get_event_loop().time())}],
                ids=[f"{user_id}_{asyncio.get_event_loop().time()}"]
            )
        except Exception as e:
            print(f"Error storing memory: {e}")

    def search_web(self, query: str) -> str:
        """Search the web using Tavily API."""
        try:
            response = tavily_client.search(query=query, search_depth="basic")
            return response.get('content', 'No information found.')
        except Exception as e:
            print(f"Error searching web: {e}")
            return "Unable to search the web at this time."

    def interact(self, db: Session, user_id: int, input_data: OracleInput) -> OracleAction:
        """Main Oracle interaction method."""
        # Gather context
        context = self.get_user_context(db, user_id)
        memories = self.get_user_memories(user_id, input_data.message)
        
        # Construct prompt
        prompt = f"""
{self.system_prompt}

User Context:
- Level: {context.get('user', {}).get('level', 1)}
- XP: {context.get('user', {}).get('xp', 0)}/{context.get('user', {}).get('xp_for_next_level', 100)}
- Current Mood: {context.get('user', {}).get('mood', 'neutral')}

Active Quests:
{json.dumps(context.get('active_quests', []), indent=2)}

Relevant Memories:
{json.dumps(memories, indent=2)}

User Message: "{input_data.message}"

Respond with valid JSON only:
"""

        try:
            # Get AI response
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                action_data = json.loads(ai_response)
            except json.JSONDecodeError:
                # Fallback to message if JSON parsing fails
                action_data = {
                    "action": "MESSAGE",
                    "data": {},
                    "message": ai_response
                }
            
            # Execute action
            result = self.execute_action(db, user_id, action_data)
            
            # Store memory of this interaction
            self.store_memory(user_id, f"User: {input_data.message} | Oracle: {result.message}")
            
            return result
            
        except Exception as e:
            print(f"Error in Oracle interaction: {e}")
            return OracleAction(
                action="MESSAGE",
                data={},
                message="I apologize, but I'm experiencing some difficulties. Please try again in a moment."
            )

    def execute_action(self, db: Session, user_id: int, action_data: Dict[str, Any]) -> OracleAction:
        """Execute the action specified by the AI."""
        action = action_data.get("action", "MESSAGE")
        data = action_data.get("data", {})
        message = action_data.get("message", "")
        
        if action == "CREATE_QUEST":
            try:
                quest_data = {
                    "title": data.get("title", "New Quest"),
                    "description": data.get("description", ""),
                    "xp_value": data.get("xp_value", 10)
                }
                quest = create_quest(db, quest_data, user_id)
                message = f"Quest created: {quest.title} (XP: {quest.xp_value})"
            except Exception as e:
                message = f"Failed to create quest: {str(e)}"
                
        elif action == "COMPLETE_QUEST":
            try:
                quest_id = data.get("quest_id")
                if quest_id:
                    quest = complete_quest(db, quest_id, user_id)
                    if quest:
                        message = f"Quest completed: {quest.title}! You gained {quest.xp_value} XP!"
                    else:
                        message = "Quest not found or already completed."
                else:
                    message = "No quest ID provided."
            except Exception as e:
                message = f"Failed to complete quest: {str(e)}"
                
        elif action == "SEARCH_INTERNET":
            try:
                query = data.get("query", "")
                if query:
                    search_result = self.search_web(query)
                    message = f"Search results for '{query}': {search_result}"
                else:
                    message = "No search query provided."
            except Exception as e:
                message = f"Search failed: {str(e)}"
        
        return OracleAction(
            action=action,
            data=data,
            message=message
        ) 