"""
Advanced Quest Generation System powered by Great Sage AI.
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from app.models.quest import Quest, QuestType, QuestDifficulty, QuestStatus
from app.models.user import User, DigitalLifestyleProfile
from app.services.ai.gs_nlu_engine import gs_nlu_engine, IntentType, ContextualUnderstanding
from app.core.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class QuestDomain(Enum):
    """Quest domain enumeration."""
    LEARNING = "learning"
    CREATIVE = "creative"
    PRODUCTIVE = "productive"
    SOCIAL = "social"
    PERSONAL = "personal"
    TECHNICAL = "technical"
    HEALTH = "health"
    BUSINESS = "business"


@dataclass
class QuestContext:
    """Context for quest generation."""
    user: User
    user_message: str
    dlp: DigitalLifestyleProfile
    current_quests: List[Quest]
    intent: IntentType
    contextual_understanding: ContextualUnderstanding
    available_time: Optional[int] = None  # in minutes
    energy_level: Optional[str] = None


@dataclass
class GeneratedQuest:
    """Generated quest structure."""
    title: str
    description: str
    quest_type: QuestType
    difficulty: QuestDifficulty
    domain: QuestDomain
    xp_value: int
    estimated_duration: int
    subtasks: List[Dict[str, Any]]
    personalization_data: Dict[str, Any]
    ai_confidence: float
    adaptability_score: float
    creativity_level: float


class QuestGenerator:
    """Advanced quest generation system."""
    
    def __init__(self):
        self.quest_templates = self._initialize_quest_templates()
        self.domain_patterns = self._initialize_domain_patterns()
        self.difficulty_scaling = self._initialize_difficulty_scaling()
        self.personalization_rules = self._initialize_personalization_rules()
    
    def _initialize_quest_templates(self) -> Dict[QuestDomain, Dict[str, Any]]:
        """Initialize quest templates for different domains."""
        return {
            QuestDomain.LEARNING: {
                "base_structure": ["discover", "explore", "practice", "apply", "master"],
                "templates": [
                    "Learn {skill} through {method}",
                    "Master {concept} by {approach}",
                    "Explore {topic} using {technique}",
                    "Practice {skill} with {exercise}",
                    "Apply {knowledge} to {project}"
                ],
                "subtask_patterns": [
                    "Research {topic} for {duration}",
                    "Practice {skill} for {duration}",
                    "Create {project} using {technique}",
                    "Test {knowledge} with {exercise}",
                    "Share {learning} with {audience}"
                ]
            },
            QuestDomain.CREATIVE: {
                "base_structure": ["inspire", "design", "create", "refine", "share"],
                "templates": [
                    "Create {project} using {medium}",
                    "Design {artwork} with {style}",
                    "Build {creation} for {purpose}",
                    "Craft {item} using {technique}",
                    "Develop {idea} into {form}"
                ],
                "subtask_patterns": [
                    "Gather inspiration from {source}",
                    "Sketch initial concepts",
                    "Create first draft",
                    "Refine and improve",
                    "Share with {audience}"
                ]
            },
            QuestDomain.PRODUCTIVE: {
                "base_structure": ["plan", "organize", "execute", "optimize", "complete"],
                "templates": [
                    "Organize {system} for {purpose}",
                    "Optimize {process} to {goal}",
                    "Streamline {workflow} for {benefit}",
                    "Automate {task} using {tool}",
                    "Complete {project} by {deadline}"
                ],
                "subtask_patterns": [
                    "Analyze current {process}",
                    "Identify improvement areas",
                    "Implement {solution}",
                    "Test and validate",
                    "Document results"
                ]
            },
            QuestDomain.SOCIAL: {
                "base_structure": ["connect", "collaborate", "support", "lead", "inspire"],
                "templates": [
                    "Connect with {community} about {topic}",
                    "Collaborate on {project} with {team}",
                    "Support {person} in {goal}",
                    "Lead {initiative} for {purpose}",
                    "Inspire {audience} through {method}"
                ],
                "subtask_patterns": [
                    "Reach out to {person}",
                    "Plan {activity} together",
                    "Execute {collaboration}",
                    "Follow up and maintain",
                    "Celebrate success"
                ]
            },
            QuestDomain.PERSONAL: {
                "base_structure": ["reflect", "grow", "challenge", "transform", "achieve"],
                "templates": [
                    "Reflect on {experience} to {purpose}",
                    "Grow {skill} through {method}",
                    "Challenge {belief} with {evidence}",
                    "Transform {habit} into {improvement}",
                    "Achieve {goal} by {timeline}"
                ],
                "subtask_patterns": [
                    "Set clear intention",
                    "Take consistent action",
                    "Track progress daily",
                    "Adjust approach as needed",
                    "Celebrate milestones"
                ]
            }
        }
    
    def _initialize_domain_patterns(self) -> Dict[str, List[str]]:
        """Initialize domain detection patterns."""
        return {
            "programming": ["code", "programming", "software", "development", "coding", "python", "javascript", "react"],
            "art": ["art", "drawing", "painting", "design", "creative", "visual", "aesthetic", "artistic"],
            "music": ["music", "song", "instrument", "compose", "play", "sing", "audio", "melody"],
            "fitness": ["fitness", "exercise", "workout", "gym", "running", "yoga", "health", "strength"],
            "cooking": ["cooking", "recipe", "food", "kitchen", "bake", "cook", "culinary", "chef"],
            "learning": ["learn", "study", "education", "knowledge", "skill", "master", "understand"],
            "business": ["business", "entrepreneur", "startup", "marketing", "sales", "finance", "strategy"],
            "health": ["health", "wellness", "mental", "physical", "meditation", "mindfulness", "therapy"]
        }
    
    def _initialize_difficulty_scaling(self) -> Dict[str, Dict[str, Any]]:
        """Initialize difficulty scaling rules."""
        return {
            "beginner": {
                "duration_multiplier": 1.5,
                "subtask_count": 3,
                "complexity": "simple",
                "guidance_level": "high"
            },
            "intermediate": {
                "duration_multiplier": 1.0,
                "subtask_count": 5,
                "complexity": "moderate",
                "guidance_level": "medium"
            },
            "advanced": {
                "duration_multiplier": 0.8,
                "subtask_count": 7,
                "complexity": "complex",
                "guidance_level": "low"
            },
            "expert": {
                "duration_multiplier": 0.6,
                "subtask_count": 9,
                "complexity": "expert",
                "guidance_level": "minimal"
            }
        }
    
    def _initialize_personalization_rules(self) -> Dict[str, Dict[str, Any]]:
        """Initialize personalization rules."""
        return {
            "communication_style": {
                "analytical": {
                    "tone": "systematic and methodical",
                    "structure": "step-by-step",
                    "focus": "logic and efficiency"
                },
                "creative": {
                    "tone": "inspiring and imaginative",
                    "structure": "flexible and open-ended",
                    "focus": "innovation and expression"
                },
                "collaborative": {
                    "tone": "encouraging and supportive",
                    "structure": "team-oriented",
                    "focus": "community and sharing"
                },
                "empathetic": {
                    "tone": "understanding and compassionate",
                    "structure": "gentle and supportive",
                    "focus": "personal growth and well-being"
                }
            },
            "learning_style": {
                "visual": {
                    "preferred_media": ["diagrams", "videos", "infographics"],
                    "instructions": "visual and diagrammatic"
                },
                "auditory": {
                    "preferred_media": ["podcasts", "audio", "discussions"],
                    "instructions": "verbal and conversational"
                },
                "kinesthetic": {
                    "preferred_media": ["hands-on", "practice", "experiments"],
                    "instructions": "practical and experiential"
                },
                "reading": {
                    "preferred_media": ["articles", "books", "documentation"],
                    "instructions": "written and detailed"
                }
            }
        }
    
    async def generate_quest(self, context: QuestContext) -> GeneratedQuest:
        """Generate a personalized quest based on context."""
        try:
            # Determine quest domain
            domain = self._determine_quest_domain(context)
            
            # Determine quest type and difficulty
            quest_type = self._determine_quest_type(context)
            difficulty = self._determine_difficulty(context)
            
            # Generate quest content
            title = self._generate_title(context, domain)
            description = self._generate_description(context, domain)
            
            # Calculate quest parameters
            xp_value = self._calculate_xp_value(context, difficulty)
            estimated_duration = self._estimate_duration(context, difficulty, domain)
            
            # Generate subtasks
            subtasks = self._generate_subtasks(context, domain, difficulty)
            
            # Calculate personalization metrics
            personalization_data = self._calculate_personalization_data(context, domain)
            adaptability_score = self._calculate_adaptability_score(context, domain)
            creativity_level = self._calculate_creativity_level(context, domain)
            
            # Calculate AI confidence
            ai_confidence = self._calculate_ai_confidence(context, domain, difficulty)
            
            return GeneratedQuest(
                title=title,
                description=description,
                quest_type=quest_type,
                difficulty=difficulty,
                domain=domain,
                xp_value=xp_value,
                estimated_duration=estimated_duration,
                subtasks=subtasks,
                personalization_data=personalization_data,
                ai_confidence=ai_confidence,
                adaptability_score=adaptability_score,
                creativity_level=creativity_level
            )
            
        except Exception as e:
            logger.error(f"Error generating quest: {e}")
            # Return fallback quest
            return self._generate_fallback_quest(context)
    
    def _determine_quest_domain(self, context: QuestContext) -> QuestDomain:
        """Determine quest domain based on context."""
        message_lower = context.user_message.lower()
        
        # Check message for domain keywords
        for domain, keywords in self.domain_patterns.items():
            if any(keyword in message_lower for keyword in keywords):
                domain_mapping = {
                    "programming": QuestDomain.TECHNICAL,
                    "art": QuestDomain.CREATIVE,
                    "music": QuestDomain.CREATIVE,
                    "fitness": QuestDomain.HEALTH,
                    "cooking": QuestDomain.CREATIVE,
                    "learning": QuestDomain.LEARNING,
                    "business": QuestDomain.BUSINESS,
                    "health": QuestDomain.HEALTH
                }
                return domain_mapping.get(domain, QuestDomain.LEARNING)
        
        # Check user's DLP interests
        if context.dlp.interests:
            top_interest = max(context.dlp.interests.items(), key=lambda x: x[1])
            interest_domain_mapping = {
                "programming": QuestDomain.TECHNICAL,
                "art": QuestDomain.CREATIVE,
                "music": QuestDomain.CREATIVE,
                "fitness": QuestDomain.HEALTH,
                "learning": QuestDomain.LEARNING,
                "business": QuestDomain.BUSINESS
            }
            return interest_domain_mapping.get(top_interest[0], QuestDomain.LEARNING)
        
        # Default to learning domain
        return QuestDomain.LEARNING
    
    def _determine_quest_type(self, context: QuestContext) -> QuestType:
        """Determine quest type based on context."""
        # Check urgency level
        if context.contextual_understanding.urgency_level == "high":
            return QuestType.main
        
        # Check user level
        if context.user.level < 5:
            return QuestType.side
        elif context.user.level > 20:
            return QuestType.main
        
        # Check current quest load
        active_quests = len(context.current_quests)
        if active_quests > 5:
            return QuestType.daily
        elif active_quests > 3:
            return QuestType.side
        
        return QuestType.side
    
    def _determine_difficulty(self, context: QuestContext) -> QuestDifficulty:
        """Determine quest difficulty based on context."""
        # Check complexity preference
        complexity = context.contextual_understanding.complexity_preference
        
        # Check user level
        user_level = context.user.level
        
        # Check DLP difficulty preference
        if context.dlp.difficulty_preference:
            difficulty_mapping = {
                "easy": QuestDifficulty.easy,
                "moderate": QuestDifficulty.normal,
                "challenging": QuestDifficulty.hard,
                "adaptive": QuestDifficulty.normal
            }
            base_difficulty = difficulty_mapping.get(context.dlp.difficulty_preference, QuestDifficulty.normal)
        else:
            base_difficulty = QuestDifficulty.normal
        
        # Adjust based on complexity preference
        if complexity == "high":
            if base_difficulty == QuestDifficulty.easy:
                base_difficulty = QuestDifficulty.normal
            elif base_difficulty == QuestDifficulty.normal:
                base_difficulty = QuestDifficulty.hard
        elif complexity == "low":
            if base_difficulty == QuestDifficulty.hard:
                base_difficulty = QuestDifficulty.normal
            elif base_difficulty == QuestDifficulty.normal:
                base_difficulty = QuestDifficulty.easy
        
        # Adjust based on user level
        if user_level < 5 and base_difficulty == QuestDifficulty.hard:
            return QuestDifficulty.normal
        elif user_level > 20 and base_difficulty == QuestDifficulty.normal:
            return QuestDifficulty.hard
        
        return base_difficulty
    
    def _generate_title(self, context: QuestContext, domain: QuestDomain) -> str:
        """Generate personalized quest title."""
        templates = self.quest_templates[domain]["templates"]
        template = random.choice(templates)
        
        # Extract key concepts from user message
        key_concepts = self._extract_key_concepts(context.user_message)
        
        # Personalize based on DLP
        communication_style = context.dlp.communication_style or "balanced"
        personalization = self.personalization_rules["communication_style"].get(communication_style, {})
        
        # Replace placeholders
        title = template.format(
            skill=key_concepts.get("skill", "new skills"),
            method=key_concepts.get("method", "practical exercises"),
            concept=key_concepts.get("concept", "new concepts"),
            approach=key_concepts.get("approach", "hands-on learning"),
            topic=key_concepts.get("topic", "interesting topics"),
            technique=key_concepts.get("technique", "effective techniques"),
            exercise=key_concepts.get("exercise", "guided practice"),
            project=key_concepts.get("project", "real projects"),
            medium=key_concepts.get("medium", "creative tools"),
            style=key_concepts.get("style", "your unique style"),
            purpose=key_concepts.get("purpose", "personal growth"),
            item=key_concepts.get("item", "something meaningful"),
            idea=key_concepts.get("idea", "creative ideas"),
            form=key_concepts.get("form", "tangible results")
        )
        
        return title
    
    def _generate_description(self, context: QuestContext, domain: QuestDomain) -> str:
        """Generate personalized quest description."""
        # Base description template
        base_description = f"Embark on a personalized journey to {context.user_message.lower()}. "
        
        # Add domain-specific guidance
        domain_guidance = {
            QuestDomain.LEARNING: "This quest will help you build knowledge and skills through structured learning.",
            QuestDomain.CREATIVE: "This quest will unleash your creativity and help you express your unique vision.",
            QuestDomain.PRODUCTIVE: "This quest will help you optimize your workflow and achieve better results.",
            QuestDomain.SOCIAL: "This quest will help you connect with others and build meaningful relationships.",
            QuestDomain.PERSONAL: "This quest will help you grow personally and achieve your goals.",
            QuestDomain.TECHNICAL: "This quest will help you develop technical skills and problem-solving abilities.",
            QuestDomain.HEALTH: "This quest will help you improve your physical and mental well-being.",
            QuestDomain.BUSINESS: "This quest will help you develop business skills and entrepreneurial thinking."
        }
        
        description = base_description + domain_guidance.get(domain, "This quest will help you achieve your goals.")
        
        # Add personalization based on DLP
        if context.dlp.communication_style:
            style_guidance = {
                "analytical": " Focus on systematic approaches and measurable outcomes.",
                "creative": " Embrace your creativity and explore innovative solutions.",
                "collaborative": " Connect with others and learn through shared experiences.",
                "empathetic": " Focus on personal growth and meaningful connections."
            }
            description += style_guidance.get(context.dlp.communication_style, "")
        
        return description
    
    def _calculate_xp_value(self, context: QuestContext, difficulty: QuestDifficulty) -> int:
        """Calculate XP value for quest."""
        base_xp = {
            QuestDifficulty.easy: 10,
            QuestDifficulty.normal: 25,
            QuestDifficulty.hard: 50,
            QuestDifficulty.epic: 100,
            QuestDifficulty.legendary: 200
        }
        
        xp = base_xp[difficulty]
        
        # Adjust based on user level
        level_multiplier = 1 + (context.user.level * 0.1)
        xp = int(xp * level_multiplier)
        
        # Adjust based on quest type
        type_multipliers = {
            QuestType.daily: 0.8,
            QuestType.side: 1.0,
            QuestType.main: 1.5,
            QuestType.epic: 2.0,
            QuestType.legendary: 3.0
        }
        
        xp = int(xp * type_multipliers.get(context.quest_type, 1.0))
        
        return max(xp, 5)
    
    def _estimate_duration(self, context: QuestContext, difficulty: QuestDifficulty, domain: QuestDomain) -> int:
        """Estimate quest duration in minutes."""
        base_duration = {
            QuestDifficulty.easy: 30,
            QuestDifficulty.normal: 60,
            QuestDifficulty.hard: 120,
            QuestDifficulty.epic: 240,
            QuestDifficulty.legendary: 480
        }
        
        duration = base_duration[difficulty]
        
        # Adjust based on domain
        domain_multipliers = {
            QuestDomain.LEARNING: 1.2,
            QuestDomain.CREATIVE: 1.3,
            QuestDomain.PRODUCTIVE: 0.9,
            QuestDomain.SOCIAL: 0.8,
            QuestDomain.PERSONAL: 1.0,
            QuestDomain.TECHNICAL: 1.1,
            QuestDomain.HEALTH: 0.9,
            QuestDomain.BUSINESS: 1.1
        }
        
        duration = int(duration * domain_multipliers.get(domain, 1.0))
        
        # Adjust based on user level
        if context.user.level < 5:
            duration = int(duration * 1.5)  # New users take longer
        elif context.user.level > 20:
            duration = int(duration * 0.8)  # Experienced users are faster
        
        return duration
    
    def _generate_subtasks(self, context: QuestContext, domain: QuestDomain, difficulty: QuestDifficulty) -> List[Dict[str, Any]]:
        """Generate personalized subtasks."""
        template = self.quest_templates[domain]
        base_structure = template["base_structure"]
        subtask_patterns = template["subtask_patterns"]
        
        # Determine number of subtasks based on difficulty
        difficulty_scaling = self.difficulty_scaling.get("intermediate", {})  # Default
        subtask_count = min(len(base_structure), difficulty_scaling.get("subtask_count", 5))
        
        subtasks = []
        for i in range(subtask_count):
            step = base_structure[i]
            pattern = subtask_patterns[i] if i < len(subtask_patterns) else subtask_patterns[0]
            
            # Personalize subtask
            subtask_title = self._personalize_subtask_title(step, context, domain)
            subtask_description = self._personalize_subtask_description(pattern, context, domain)
            
            subtasks.append({
                "title": subtask_title,
                "description": subtask_description,
                "xp_value": max(5, context.user.level * 2),
                "difficulty": "easy" if i < 2 else "normal",
                "order_index": i,
                "estimated_duration": 15 + (i * 10),
                "personalization_notes": f"Tailored for {context.dlp.communication_style or 'balanced'} communication style"
            })
        
        return subtasks
    
    def _personalize_subtask_title(self, step: str, context: QuestContext, domain: QuestDomain) -> str:
        """Personalize subtask title based on user profile."""
        communication_style = context.dlp.communication_style or "balanced"
        
        style_titles = {
            "analytical": f"Systematically {step.title()} Your {domain.value.title()} Approach",
            "creative": f"Creatively {step.title()} Your {domain.value.title()} Journey",
            "collaborative": f"Collaboratively {step.title()} Your {domain.value.title()} Experience",
            "empathetic": f"Compassionately {step.title()} Your {domain.value.title()} Path"
        }
        
        return style_titles.get(communication_style, f"{step.title()} Your {domain.value.title()} Quest")
    
    def _personalize_subtask_description(self, pattern: str, context: QuestContext, domain: QuestDomain) -> str:
        """Personalize subtask description based on user profile."""
        # Replace placeholders in pattern
        description = pattern.format(
            topic=context.user_message,
            duration="15-30 minutes",
            skill="your skills",
            technique="effective techniques",
            project="your project",
            exercise="guided exercises",
            audience="your community",
            source="reliable sources",
            solution="your solution",
            process="your process",
            person="a mentor or peer",
            activity="collaborative activities",
            collaboration="meaningful collaboration",
            experience="your experiences",
            method="proven methods",
            belief="limiting beliefs",
            evidence="new evidence",
            habit="positive habits",
            improvement="continuous improvement",
            goal="your goals",
            timeline="your timeline"
        )
        
        return description
    
    def _extract_key_concepts(self, text: str) -> Dict[str, str]:
        """Extract key concepts from user message."""
        # Simple keyword extraction - in production, this would use more sophisticated NLP
        concepts = {}
        
        # Extract skills
        skill_keywords = ["learn", "master", "develop", "build", "create"]
        for keyword in skill_keywords:
            if keyword in text.lower():
                concepts["skill"] = "new skills"
                break
        
        # Extract methods
        method_keywords = ["through", "using", "with", "by"]
        for keyword in method_keywords:
            if keyword in text.lower():
                concepts["method"] = "practical exercises"
                break
        
        return concepts
    
    def _calculate_personalization_data(self, context: QuestContext, domain: QuestDomain) -> Dict[str, Any]:
        """Calculate personalization data for the quest."""
        return {
            "user_traits": list(context.dlp.core_traits.keys())[:3] if context.dlp.core_traits else [],
            "interests": list(context.dlp.interests.keys())[:3] if context.dlp.interests else [],
            "communication_style": context.dlp.communication_style or "balanced",
            "learning_style": context.dlp.learning_style or {},
            "motivation_triggers": context.dlp.motivation_triggers[:3] if context.dlp.motivation_triggers else [],
            "domain": domain.value,
            "difficulty_preference": context.dlp.difficulty_preference or "moderate"
        }
    
    def _calculate_adaptability_score(self, context: QuestContext, domain: QuestDomain) -> float:
        """Calculate how adaptable this quest is to the user."""
        adaptability = 0.5  # Base adaptability
        
        # Add adaptability based on DLP complexity
        trait_count = len(context.dlp.core_traits) if context.dlp.core_traits else 0
        interest_count = len(context.dlp.interests) if context.dlp.interests else 0
        
        adaptability += min((trait_count + interest_count) / 10, 0.3)
        
        # Add adaptability based on domain
        domain_adaptability = {
            QuestDomain.LEARNING: 0.8,
            QuestDomain.CREATIVE: 0.9,
            QuestDomain.PRODUCTIVE: 0.6,
            QuestDomain.SOCIAL: 0.9,
            QuestDomain.PERSONAL: 0.8,
            QuestDomain.TECHNICAL: 0.7,
            QuestDomain.HEALTH: 0.8,
            QuestDomain.BUSINESS: 0.7
        }
        
        adaptability += domain_adaptability.get(domain, 0.5) * 0.2
        
        return min(adaptability, 1.0)
    
    def _calculate_creativity_level(self, context: QuestContext, domain: QuestDomain) -> float:
        """Calculate creativity level of the quest."""
        creativity = 0.5  # Base creativity
        
        # Add creativity based on domain
        domain_creativity = {
            QuestDomain.LEARNING: 0.6,
            QuestDomain.CREATIVE: 0.9,
            QuestDomain.PRODUCTIVE: 0.4,
            QuestDomain.SOCIAL: 0.7,
            QuestDomain.PERSONAL: 0.8,
            QuestDomain.TECHNICAL: 0.5,
            QuestDomain.HEALTH: 0.6,
            QuestDomain.BUSINESS: 0.6
        }
        
        creativity += domain_creativity.get(domain, 0.5) * 0.3
        
        # Add creativity based on user's creative style
        if context.dlp.communication_style == "creative":
            creativity += 0.2
        
        return min(creativity, 1.0)
    
    def _calculate_ai_confidence(self, context: QuestContext, domain: QuestDomain, difficulty: QuestDifficulty) -> float:
        """Calculate AI confidence in quest quality."""
        confidence = 0.8  # Base confidence
        
        # Adjust based on context clarity
        if context.contextual_understanding.confidence > 0.8:
            confidence += 0.1
        elif context.contextual_understanding.confidence < 0.5:
            confidence -= 0.2
        
        # Adjust based on DLP completeness
        if context.dlp.core_traits and context.dlp.interests:
            confidence += 0.1
        
        # Adjust based on domain familiarity
        if domain in [QuestDomain.LEARNING, QuestDomain.PERSONAL]:
            confidence += 0.05
        
        return min(confidence, 1.0)
    
    def _generate_fallback_quest(self, context: QuestContext) -> GeneratedQuest:
        """Generate a fallback quest when generation fails."""
        return GeneratedQuest(
            title="Personal Growth Quest",
            description="A personalized quest to help you achieve your goals and grow as a person.",
            quest_type=QuestType.side,
            difficulty=QuestDifficulty.normal,
            domain=QuestDomain.PERSONAL,
            xp_value=25,
            estimated_duration=60,
            subtasks=[
                {
                    "title": "Set Your Intention",
                    "description": "Take a moment to clarify what you want to achieve.",
                    "xp_value": 5,
                    "difficulty": "easy",
                    "order_index": 0,
                    "estimated_duration": 15
                },
                {
                    "title": "Take Action",
                    "description": "Take the first step toward your goal.",
                    "xp_value": 10,
                    "difficulty": "normal",
                    "order_index": 1,
                    "estimated_duration": 30
                },
                {
                    "title": "Reflect and Learn",
                    "description": "Reflect on your progress and what you've learned.",
                    "xp_value": 10,
                    "difficulty": "normal",
                    "order_index": 2,
                    "estimated_duration": 15
                }
            ],
            personalization_data={"fallback": True},
            ai_confidence=0.5,
            adaptability_score=0.5,
            creativity_level=0.5
        )


# Global quest generator instance
quest_generator = QuestGenerator()
