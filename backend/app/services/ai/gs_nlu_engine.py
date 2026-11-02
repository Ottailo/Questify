"""
QuestSage Natural Language Understanding (GS-NLU) Engine
The core AI engine that powers QuestSage's intelligent understanding.
"""

import re
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
# Use simple fallbacks for now to ensure the system works
class NumpyFallback:
    def mean(self, data):
        return sum(data) / len(data) if data else 0
    def array(self, data):
        return data

np = NumpyFallback()
SentenceTransformer = None
AutoTokenizer = None
AutoModel = None
torch = None

from app.core.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class IntentType(Enum):
    """Intent types for user messages."""
    GOAL_CREATION = "goal_creation"
    QUEST_GENERATION = "quest_generation"
    QUEST_MODIFICATION = "quest_modification"
    QUEST_COMPLETION = "quest_completion"
    PROGRESS_ANALYSIS = "progress_analysis"
    MOTIVATION_REQUEST = "motivation_request"
    ADVICE_REQUEST = "advice_request"
    PERSONALIZATION_REQUEST = "personalization_request"
    PRODUCTIVITY_ANALYSIS = "productivity_analysis"
    REFLECTION_REQUEST = "reflection_request"
    GENERAL_CHAT = "general_chat"
    HELP_REQUEST = "help_request"


class EntityType(Enum):
    """Entity types for named entity recognition."""
    GOAL = "goal"
    TIMELINE = "timeline"
    DIFFICULTY = "difficulty"
    DOMAIN = "domain"
    EMOTION = "emotion"
    ENERGY_LEVEL = "energy_level"
    AVAILABLE_TIME = "available_time"
    SKILL = "skill"
    INTEREST = "interest"
    CONSTRAINT = "constraint"


@dataclass
class Intent:
    """Intent recognition result."""
    intent_type: IntentType
    confidence: float
    entities: List[Dict[str, Any]]
    context: Dict[str, Any]
    timestamp: datetime


@dataclass
class Entity:
    """Named entity recognition result."""
    entity_type: EntityType
    value: str
    start_pos: int
    end_pos: int
    confidence: float
    context: Dict[str, Any]


@dataclass
class ContextualUnderstanding:
    """Comprehensive contextual understanding."""
    emotional_state: str
    energy_level: str
    urgency_level: str
    complexity_preference: str
    domain_focus: str
    temporal_context: str
    social_context: str
    motivation_level: float
    confidence: float


class GSNLUEngine:
    """QuestSage Natural Language Understanding Engine."""

    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.device = "cuda" if torch and torch.cuda.is_available() else "cpu"
        
        # Initialize models
        self.sentence_model = None
        self.tokenizer = None
        self.intent_model = None
        
        # Intent patterns
        self.intent_patterns = self._initialize_intent_patterns()
        self.entity_patterns = self._initialize_entity_patterns()
        self.contextual_patterns = self._initialize_contextual_patterns()
        
        # Performance tracking
        self.accuracy_metrics = []
        self.response_times = []
        
        # Initialize models asynchronously if dependencies are available
        if SentenceTransformer and AutoTokenizer:
            asyncio.create_task(self._initialize_models())
        else:
            logger.warning("AI dependencies not available, using rule-based fallback")
    
    async def _initialize_models(self):
        """Initialize AI models asynchronously."""
        try:
            logger.info("Initializing QuestSage NLU models...")

            if SentenceTransformer:
                # Load sentence transformer for embeddings
                self.sentence_model = SentenceTransformer(self.model_name)
                logger.info("Sentence transformer loaded")
            else:
                logger.warning("SentenceTransformer not available")

            if AutoTokenizer:
                # Load tokenizer and model for intent classification
                self.tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
                logger.info("Tokenizer loaded")
            else:
                logger.warning("AutoTokenizer not available")

            logger.info("QuestSage NLU models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing GS-NLU models: {e}")
            logger.warning("Continuing with rule-based fallback")
    
    def _initialize_intent_patterns(self) -> Dict[IntentType, Dict[str, Any]]:
        """Initialize intent recognition patterns."""
        return {
            IntentType.GOAL_CREATION: {
                "keywords": ["want to", "need to", "goal", "achieve", "accomplish", "learn", "master", "become"],
                "patterns": [
                    r"(?:i\s+)?(?:want\s+to|need\s+to|would\s+like\s+to)\s+(.+)",
                    r"(?:my\s+)?(?:goal\s+is|goal\s+to)\s+(.+)",
                    r"(?:i\s+)?(?:want\s+to\s+)?(?:learn|master|become|achieve)\s+(.+)",
                    r"(?:help\s+me\s+)?(?:learn|master|become|achieve)\s+(.+)"
                ],
                "context_clues": ["goal", "objective", "target", "aim", "purpose"]
            },
            IntentType.QUEST_GENERATION: {
                "keywords": ["create", "generate", "make", "build", "quest", "task", "challenge"],
                "patterns": [
                    r"(?:create|generate|make|build)\s+(?:a\s+)?(?:quest|task|challenge)",
                    r"(?:give\s+me|show\s+me)\s+(?:a\s+)?(?:quest|task|challenge)",
                    r"(?:what\s+should\s+i\s+)?(?:do|work\s+on|focus\s+on)"
                ],
                "context_clues": ["quest", "task", "challenge", "work", "focus"]
            },
            IntentType.PROGRESS_ANALYSIS: {
                "keywords": ["progress", "how am i", "doing", "analysis", "review", "stats"],
                "patterns": [
                    r"(?:how\s+am\s+i\s+)?(?:doing|progressing)",
                    r"(?:show\s+me\s+)?(?:my\s+)?(?:progress|stats|analysis)",
                    r"(?:analyze|review)\s+(?:my\s+)?(?:progress|performance)"
                ],
                "context_clues": ["progress", "performance", "analysis", "review"]
            },
            IntentType.MOTIVATION_REQUEST: {
                "keywords": ["motivate", "inspire", "encourage", "motivation", "boost", "energy"],
                "patterns": [
                    r"(?:give\s+me|i\s+need)\s+(?:motivation|inspiration|encouragement)",
                    r"(?:motivate|inspire|encourage)\s+(?:me|us)",
                    r"(?:boost\s+my\s+)?(?:motivation|morale|energy)"
                ],
                "context_clues": ["motivation", "inspiration", "encouragement", "boost"]
            },
            IntentType.ADVICE_REQUEST: {
                "keywords": ["advice", "help", "suggest", "recommend", "guidance", "tips"],
                "patterns": [
                    r"(?:give\s+me|i\s+need)\s+(?:advice|help|guidance|tips)",
                    r"(?:can\s+you\s+)?(?:suggest|recommend|advise)",
                    r"(?:what\s+should\s+i\s+)?(?:do|try|focus\s+on)"
                ],
                "context_clues": ["advice", "help", "guidance", "suggestion"]
            }
        }
    
    def _initialize_entity_patterns(self) -> Dict[EntityType, Dict[str, Any]]:
        """Initialize entity recognition patterns."""
        return {
            EntityType.GOAL: {
                "patterns": [
                    r"(?:learn|master|become|achieve|build|create|develop)\s+(.+)",
                    r"(?:i\s+want\s+to|i\s+need\s+to)\s+(.+)",
                    r"(?:my\s+goal\s+is|my\s+goal\s+to)\s+(.+)"
                ],
                "keywords": ["learn", "master", "become", "achieve", "build", "create", "develop"]
            },
            EntityType.TIMELINE: {
                "patterns": [
                    r"(\d+)\s*(?:days?|weeks?|months?|years?)",
                    r"(?:in|within|by)\s+(\d+)\s*(?:days?|weeks?|months?|years?)",
                    r"(?:deadline|due)\s+(?:in|by)\s+(\d+)\s*(?:days?|weeks?|months?|years?)"
                ],
                "keywords": ["days", "weeks", "months", "years", "deadline", "due"]
            },
            EntityType.DIFFICULTY: {
                "patterns": [
                    r"(?:easy|simple|basic|beginner|intermediate|advanced|expert|hard|difficult|challenging)",
                    r"(?:make\s+it\s+)?(?:easy|simple|basic|hard|difficult|challenging)",
                    r"(?:i\s+want\s+)?(?:easy|simple|basic|hard|difficult|challenging)"
                ],
                "keywords": ["easy", "simple", "basic", "beginner", "intermediate", "advanced", "expert", "hard", "difficult", "challenging"]
            },
            EntityType.DOMAIN: {
                "patterns": [
                    r"(?:in|about|related\s+to)\s+(programming|art|music|fitness|cooking|learning|work|personal|business|health)",
                    r"(?:programming|art|music|fitness|cooking|learning|work|personal|business|health)\s+(?:quest|task|goal)"
                ],
                "keywords": ["programming", "art", "music", "fitness", "cooking", "learning", "work", "personal", "business", "health"]
            },
            EntityType.EMOTION: {
                "patterns": [
                    r"(?:i\s+feel|i'm|i\s+am)\s+(happy|sad|excited|motivated|tired|energetic|frustrated|confident|overwhelmed|stressed)",
                    r"(?:mood|feeling)\s*:?\s*(happy|sad|excited|motivated|tired|energetic|frustrated|confident|overwhelmed|stressed)"
                ],
                "keywords": ["happy", "sad", "excited", "motivated", "tired", "energetic", "frustrated", "confident", "overwhelmed", "stressed"]
            }
        }
    
    def _initialize_contextual_patterns(self) -> Dict[str, Dict[str, List[str]]]:
        """Initialize contextual understanding patterns."""
        return {
            "emotional_state": {
                "positive": ["happy", "excited", "motivated", "confident", "energetic", "enthusiastic", "optimistic"],
                "negative": ["sad", "frustrated", "tired", "overwhelmed", "stressed", "anxious", "discouraged"],
                "neutral": ["calm", "focused", "determined", "curious", "thoughtful", "peaceful", "balanced"]
            },
            "energy_level": {
                "high": ["energetic", "excited", "motivated", "enthusiastic", "pumped", "ready"],
                "medium": ["focused", "determined", "steady", "balanced", "normal"],
                "low": ["tired", "exhausted", "drained", "sluggish", "unmotivated"]
            },
            "urgency_level": {
                "high": ["urgent", "asap", "immediately", "quickly", "fast", "priority", "deadline", "critical"],
                "medium": ["soon", "eventually", "when possible", "moderate", "normal", "sometime"],
                "low": ["sometime", "eventually", "no rush", "whenever", "flexible", "leisurely"]
            },
            "complexity_preference": {
                "high": ["complex", "advanced", "sophisticated", "detailed", "comprehensive", "intensive", "challenging"],
                "medium": ["moderate", "intermediate", "standard", "normal", "regular", "balanced"],
                "low": ["simple", "basic", "easy", "quick", "straightforward", "minimal", "beginner"]
            }
        }
    
    async def analyze_text(self, text: str, user_context: Dict[str, Any] = None) -> Intent:
        """Analyze text for intent, entities, and context."""
        start_time = datetime.now()
        
        try:
            # Extract entities
            entities = self._extract_entities(text)
            
            # Recognize intent
            intent_type, confidence = self._recognize_intent(text, entities)
            
            # Analyze context
            context = self._analyze_context(text, user_context or {})
            
            # Create intent result
            intent = Intent(
                intent_type=intent_type,
                confidence=confidence,
                entities=entities,
                context=context,
                timestamp=datetime.now()
            )
            
            # Record performance metrics
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            self.response_times.append(processing_time)
            
            return intent
            
        except Exception as e:
            logger.error(f"Error in GS-NLU analysis: {e}")
            # Return fallback intent
            return Intent(
                intent_type=IntentType.GENERAL_CHAT,
                confidence=0.1,
                entities=[],
                context={},
                timestamp=datetime.now()
            )
    
    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text."""
        entities = []
        text_lower = text.lower()
        
        for entity_type, entity_info in self.entity_patterns.items():
            # Check patterns
            for pattern in entity_info["patterns"]:
                matches = re.finditer(pattern, text_lower, re.IGNORECASE)
                for match in matches:
                    entity = {
                        "type": entity_type.value,
                        "value": match.group(1) if match.groups() else match.group(0),
                        "start_pos": match.start(),
                        "end_pos": match.end(),
                        "confidence": 0.8,
                        "context": {"pattern": pattern}
                    }
                    entities.append(entity)
            
            # Check keywords
            for keyword in entity_info["keywords"]:
                if keyword in text_lower:
                    entity = {
                        "type": entity_type.value,
                        "value": keyword,
                        "start_pos": text_lower.find(keyword),
                        "end_pos": text_lower.find(keyword) + len(keyword),
                        "confidence": 0.6,
                        "context": {"keyword": keyword}
                    }
                    entities.append(entity)
        
        return entities
    
    def _recognize_intent(self, text: str, entities: List[Dict[str, Any]]) -> Tuple[IntentType, float]:
        """Recognize user intent from text."""
        text_lower = text.lower()
        intent_scores = {}
        
        # Score each intent type
        for intent_type, intent_info in self.intent_patterns.items():
            score = 0
            
            # Check keywords
            for keyword in intent_info["keywords"]:
                if keyword in text_lower:
                    score += 1
            
            # Check patterns
            for pattern in intent_info["patterns"]:
                if re.search(pattern, text_lower):
                    score += 2
            
            # Check context clues
            for clue in intent_info["context_clues"]:
                if clue in text_lower:
                    score += 0.5
            
            # Boost score based on entities
            for entity in entities:
                if entity["type"] in ["goal", "timeline", "difficulty"]:
                    score += 0.5
            
            intent_scores[intent_type] = score
        
        # Find best intent
        if intent_scores:
            best_intent = max(intent_scores.items(), key=lambda x: x[1])[0]
            max_score = intent_scores[best_intent]
            
            # Calculate confidence based on score
            confidence = min(max_score / 5.0, 1.0)
            
            return best_intent, confidence
        
        return IntentType.GENERAL_CHAT, 0.1
    
    def _analyze_context(self, text: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze contextual information."""
        text_lower = text.lower()
        context = {}
        
        # Analyze emotional state
        context["emotional_state"] = self._analyze_emotional_state(text_lower)
        context["energy_level"] = self._analyze_energy_level(text_lower)
        context["urgency_level"] = self._analyze_urgency_level(text_lower)
        context["complexity_preference"] = self._analyze_complexity_preference(text_lower)
        
        # Add user context
        context.update(user_context)
        
        return context
    
    def _analyze_emotional_state(self, text: str) -> str:
        """Analyze emotional state from text."""
        for state, keywords in self.contextual_patterns["emotional_state"].items():
            if any(keyword in text for keyword in keywords):
                return state
        return "neutral"
    
    def _analyze_energy_level(self, text: str) -> str:
        """Analyze energy level from text."""
        for level, keywords in self.contextual_patterns["energy_level"].items():
            if any(keyword in text for keyword in keywords):
                return level
        return "medium"
    
    def _analyze_urgency_level(self, text: str) -> str:
        """Analyze urgency level from text."""
        for level, keywords in self.contextual_patterns["urgency_level"].items():
            if any(keyword in text for keyword in keywords):
                return level
        return "medium"
    
    def _analyze_complexity_preference(self, text: str) -> str:
        """Analyze complexity preference from text."""
        for level, keywords in self.contextual_patterns["complexity_preference"].items():
            if any(keyword in text for keyword in keywords):
                return level
        return "medium"
    
    async def get_contextual_understanding(self, text: str, user_context: Dict[str, Any] = None) -> ContextualUnderstanding:
        """Get comprehensive contextual understanding."""
        intent = await self.analyze_text(text, user_context)
        
        return ContextualUnderstanding(
            emotional_state=intent.context.get("emotional_state", "neutral"),
            energy_level=intent.context.get("energy_level", "medium"),
            urgency_level=intent.context.get("urgency_level", "medium"),
            complexity_preference=intent.context.get("complexity_preference", "medium"),
            domain_focus="general",
            temporal_context="present",
            social_context="individual",
            motivation_level=0.7,
            confidence=intent.confidence
        )
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get GS-NLU performance metrics."""
        return {
            "timestamp": datetime.now(),
            "average_response_time": np.mean(self.response_times) if self.response_times else 0,
            "total_analyses": len(self.response_times),
            "model_name": self.model_name,
            "device": self.device
        }


# Global GS-NLU instance
gs_nlu_engine = GSNLUEngine()
