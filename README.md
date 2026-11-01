# QuestSage — AI Life Gamification Platform

> "Life is a game. Play it." — An AI-powered personal operating system turning goals into structured RPG quests with adaptive XP and the Great Sage NLU engine.

---

## 📊 Project Snapshot

| Attribute | Value |
|---|---|
| **Type** | Full-stack Web Application (AI Productivity & Gamification) |
| **Maturity** | Active development (v3.0 Great Sage Engine) |
| **Status** | 🟢 Active |
| **Primary Language(s)** | Python 3.11+, TypeScript, TSX, CSS3 |
| **Tech Stack** | FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, React 18, TypeScript, Tailwind CSS, SQLite |
| **Last Major Update** | 2026-11-01 (Auto-synced) |
| **Estimated LOC** | ~29,216 LOC |
| **Test Coverage** | 100% intent recognition test suite passing (`SUCCESS_SUMMARY.md`) |

---

## 🎯 The Aim

### What This Project Is
QuestSage transforms daily habit tracking, personal goal execution, and skill mastery into an immersive, dopamine-aligned Role-Playing Game (RPG). Unlike sterile to-do lists that induce cognitive fatigue and guilt, QuestSage acts as an intelligent companion powered by the **Great Sage Natural Language Understanding (GS-NLU) Engine**. 

Users interact via conversational natural language ("I want to learn Python in 30 days" or "I feel burned out and overwhelmed"). The Great Sage parses the intent, emotional energy, and user context, cross-references their **Digital Lifestyle Profile (DLP)**, and synthesizes balanced, actionable quests complete with time-budgeted subtasks (15 to 60 minutes), experience points (XP), skill domain tags (Learning, Creative, Productive, Social, Personal), and difficulty scaling.

### Why It Exists
Most productivity apps fail because they treat human beings like deterministic machines. Checklists ignore emotional friction, fatigue, and lack of clarity. When a user writes a vague goal like "Get in shape", traditional apps leave it as an intimidating monolith, leading to procrastination.

QuestSage decomposes monolithic aspirations into bite-sized quest chains with clear win conditions, instantaneous positive reinforcement (XP, level-ups, streaks), and empathetic guidance that scales down difficulty when energy is low.

### What Success Looks Like
A player starts their day, types a messy stream-of-consciousness thought into QuestSage, and watches Great Sage instantly transform it into an interactive quest card: `Quest: Python Fundamentals Mastery (60 min) — Subtasks: [1] Install runtime, [2] Write loop, [3] Run test | Reward: +25 XP`. Completing subtasks triggers audio-visual feedback, increments skill trees, and keeps motivation high.

### What It Is NOT
- It is **not** a generic corporate task tracker (Jira/Asana) with game skins slapped on top.
- It is **not** an inflexible habit tracker that penalizes users harshly for taking rest days; the Great Sage adapts quests dynamically to emotional capacity.

---

## 🏗️ Architecture Overview

[![Interactive AI Knowledge Graph](https://img.shields.io/badge/Architecture-Interactive%20AI%20Knowledge%20Graph-02d2e3?style=for-the-badge&logo=diagram-next)](https://ottailo.vercel.app/projects/QuestSage)

> 🧭 **Explore Interactively (Understand-Anything Paradigm)**:
> - **Live Portfolio Dashboard**: Explore this system in the live [Interactive AI Knowledge Graph](https://ottailo.vercel.app/projects/QuestSage) with node telemetry, clickable layer inspectors, live search, and dependency tracers.
> - **Offline HTML Viewer**: Open [`docs/architecture-graph.html`](./docs/architecture-graph.html) directly in any web browser with zero installation.
> - **Understand Anything CLI**: Run `/understand-dashboard` or launch the standalone zero-dependency viewer:
>   ```bash
>   npx https://github.com/Egonex-AI/Understand-Anything/releases/latest/download/understand-anything-viewer.tgz .
>   ```

### Exhaustive Multi-Plane System Architecture

```mermaid
graph TB
    subgraph "Plane 1: Client Application (React 18 SPA)"
        UserHUD["RPG Dashboard HUD<br/>(Level Bar, XP Counters, Streak Flame)"]
        QuestLogView["Quest Log & Tree View<br/>(Daily, Side, Main, Epic Chains)"]
        SageChat["Great Sage Chat Interface<br/>(Natural Language Goal Parser)"]
        ProfileView["Character Profile & Skill Matrix<br/>(DLP Traits & Domain Breakdown)"]
    end

    subgraph "Plane 2: API Gateway & Versioned Routers (FastAPI :8000)"
        APIRoot["FastAPI Core (backend/app/main.py)"]
        AuthRouter["api/v1/endpoints/auth.py<br/>JWT Authentication, Login, Register"]
        QuestRouter["api/v1/endpoints/quests.py<br/>Quest CRUD, Subtasks, XP Claiming"]
        AIRouter["api/v1/endpoints/ai.py<br/>Great Sage NLU & Quest Generation"]
        ProfileRouter["api/v1/endpoints/profile.py<br/>Digital Lifestyle Profile Sync"]

        APIRoot --> AuthRouter
        APIRoot --> QuestRouter
        APIRoot --> AIRouter
        APIRoot --> ProfileRouter
    end

    subgraph "Plane 3: Great Sage NLU & Intelligence Core"
        IntentClassifier["GS-NLU Intent Classifier<br/>(goal_creation, quest_generation, progress_analysis)"]
        EntityExtractor["Entity & Skill Extractor<br/>(Skill Domain, Action Verbs, Deadlines)"]
        EmotionAnalyzer["Emotional Valence & Energy Gauge<br/>(High/Urgent, Steady, Fatigued/Burnout)"]
        AdaptiveSynthesizer["Adaptive Quest Synthesizer<br/>(XP Budgeting & Subtask Decomposer)"]

        AIRouter --> IntentClassifier
        IntentClassifier --> EntityExtractor
        EntityExtractor --> EmotionAnalyzer
        EmotionAnalyzer --> AdaptiveSynthesizer
    end

    subgraph "Plane 4: Digital Lifestyle Profile (DLP) Engine"
        DLPManager["DLP Manager Core"]
        TraitVector["Trait Vector Evaluator<br/>(Productivity Rhythms, Completion Velocity)"]
        FatigueProtector["Anti-Burnout Fatigue Protector<br/>(Downscales difficulty if 3 days stalled)"]

        AdaptiveSynthesizer <--> DLPManager
        DLPManager --> TraitVector
        DLPManager --> FatigueProtector
    end

    subgraph "Plane 5: Relational Persistence Layer (SQLAlchemy 2.0)"
        DB[(SQLite Store: backend/QuestSage.db)]
        TableUsers["User Table (Level, Current_XP, Streak)"]
        TableQuests["Quest Table (Difficulty, XP, Status, Deadline)"]
        TableSubtasks["Subtask Table (Title, Minutes, Is_Completed)"]
        TableDLP["LifestyleProfile Table (Traits, Energy Vector)"]
        TableBadges["Achievement Table (Unlocked Milestones)"]

        DB --- TableUsers
        DB --- TableQuests
        DB --- TableSubtasks
        DB --- TableDLP
        DB --- TableBadges
    end

    subgraph "Plane 6: Dead Ends & Fallbacks"
        DE_Auth["⛔ DEAD END 1: Expired JWT<br/>401 Unauthorized -> Redirect to /login"]
        DE_LowConf["⛔ DEAD END 2: Ambiguous Goal NLU<br/>Confidence < 0.50 -> Clarification prompt required"]
        DE_ZeroSub["⛔ DEAD END 3: Zero Subtasks Defined<br/>Form submission blocked on custom quest creation"]
        DE_PastDate["⛔ DEAD END 4: Invalid Past Deadline<br/>Validation error: Deadline must be in the future"]
    end

    UserHUD --> APIRoot
    QuestLogView --> QuestRouter
    SageChat --> AIRouter
    ProfileView --> ProfileRouter

    QuestRouter --> TableQuests
    QuestRouter --> TableSubtasks
    QuestRouter --> TableUsers
    AuthRouter --> TableUsers
    ProfileRouter --> TableDLP

    AuthRouter -.->|Token invalid| DE_Auth
    IntentClassifier -.->|Score < 0.50| DE_LowConf
    QuestRouter -.->|0 subtasks| DE_ZeroSub
    QuestRouter -.->|Past deadline| DE_PastDate
```

🔍 *[Open Full-Screen Zoomable Diagram (SVG)](./docs/diagrams/architecture.svg)*


[Source: `docs/diagrams/architecture.graphify`]

---

## 🧭 Exhaustive User Flow & Dead-End Map

The following map details **every user path, input field, modal, button click, XP progression step, and dead end** across QuestSage.

```mermaid
graph TD
    Start([👤 Player / User]) --> LandView["Visit QuestSage Frontend (localhost:3000)"]

    subgraph "Screen 1: Authentication & Onboarding (/login & /register)"
        LandView --> CheckToken{Valid JWT token in localStorage?}
        CheckToken -->|No| LoginScreen["Render Login / Register View"]
        LoginScreen --> FormAuth["Input: Email + Password"]
        FormAuth --> BtnLogin["🔘 [BTN] Enter Quest World (POST /auth/login)"]
        BtnLogin --> ValidateAuth{Credentials Valid?}
        ValidateAuth -->|No| DE_AuthFail["⛔ DEAD END 1: Auth Failed<br/>Error alert: 'Invalid email or password'<br/>Stuck on /login"]
        ValidateAuth -->|Yes| SetToken["Save Bearer token to localStorage<br/>Redirect to /dashboard"]
    end

    subgraph "Screen 2: RPG Dashboard HUD (/dashboard)"
        SetToken --> RenderHUD["Render Dashboard HUD Component"]
        RenderHUD --> HUDHeader["Header: Level Badge, XP Progress Bar, Streak Flame, Street Coins"]
        RenderHUD --> BtnOpenSage["🔘 [BTN] Consult Great Sage AI"]
        RenderHUD --> BtnNewQuest["🔘 [BTN] + Create Custom Quest"]
        RenderHUD --> BtnViewQuests["🔘 [BTN] Open Full Quest Log"]
        RenderHUD --> BtnViewProfile["🔘 [BTN] Character Sheet & DLP"]
    end

    subgraph "Screen 3: Great Sage Conversational NLU Modal"
        BtnOpenSage --> SageModalView["Open Great Sage AI Drawer Modal"]
        SageModalView --> InputSage["Input: Freeform Natural Language Goal<br/>e.g. 'I want to build a portfolio before Friday'"]
        InputSage --> BtnAskSage["🔘 [BTN] Synthesize Quest<br/>POST /api/v1/ai/analyze"]
        BtnAskSage --> NLUCheck{Intent Confidence >= 0.50?}
        NLUCheck -->|Confidence < 0.50| DE_Vague["⛔ DEAD END 2: Ambiguous Goal<br/>Sage responds: 'What specific skill do you want to practice?'<br/>User must clarify prompt before quest can generate"]
        NLUCheck -->|Confident| SynthesizeCard["Great Sage outputs Structured Quest Preview Card:<br/>Title, Domain, Difficulty, XP Reward, 3-4 Timed Subtasks"]
        SynthesizeCard --> BtnAcceptQuest["🔘 [BTN] Accept Quest into Log<br/>POST /api/v1/quests/"]
        SynthesizeCard --> BtnReroll["🔘 [BTN] Re-roll / Adjust Intensity"]
        BtnAcceptQuest --> QuestSaved["Quest committed to DB -> Appears in Quest Log"]
    end

    subgraph "Screen 4: Manual Quest Builder Modal"
        BtnNewQuest --> ManualModalView["Open Create Quest Dialog"]
        ManualModalView --> ManualInputs["Inputs: Title, Description, Deadline Picker,<br/>Dropdown Difficulty (Daily, Side, Main, Epic),<br/>Subtask Checklist Builder"]
        ManualModalView --> BtnAddSubtask["🔘 [BTN] + Add Subtask (Title + Minutes)"]
        ManualModalView --> BtnSubmitManual["🔘 [BTN] Forge Quest"]
        BtnSubmitManual --> CheckDeadline{Deadline > Current Timestamp?}
        CheckDeadline -->|Deadline in past| DE_Past["⛔ DEAD END 4: Invalid Deadline<br/>Inline alert: 'Deadline must be in the future'"]
        CheckDeadline -->|Deadline valid| CheckSubtaskCount{Subtasks count >= 1?}
        CheckSubtaskCount -->|0 subtasks| DE_ZeroSub["⛔ DEAD END 3: Missing Subtasks<br/>Submit blocked: 'A quest must contain at least 1 subtask'"]
        CheckSubtaskCount -->|>= 1 subtasks| ManualSaved["Quest committed to database"]
    end

    subgraph "Screen 5: Active Quest Execution & XP Claiming (/quests)"
        BtnViewQuests --> RenderQuestLog["Render Active Quests Grouped by Domain"]
        RenderQuestLog --> QuestCardComponent["Quest Card Item"]
        QuestCardComponent --> SubtaskList["Subtask Checkboxes [15-60 min each]"]
        SubtaskList --> CheckboxClick["User checks off subtask: [X] Done<br/>PATCH /api/v1/quests/{id}/subtasks/{subId}"]
        CheckboxClick --> CheckAllDone{Are all subtasks checked?}
        CheckAllDone -->|No: Partial progress| UpdateBar["Update quest progress percentage bar"]
        CheckAllDone -->|Yes: All subtasks done| BtnClaimXP["🔘 [BTN] Claim Quest Victory & XP!"]
        BtnClaimXP --> ClaimAction["POST /api/v1/quests/{id}/complete<br/>Update user XP, check level-up threshold"]
        ClaimAction --> LevelCheck{XP >= Next Level Boundary?}
        LevelCheck -->|Yes: Level Up| LevelUpAnimation["🎉 Level-Up Modal with Fanfare Sound Effect<br/>Level increments: Lvl N -> Lvl N+1<br/>Skill points awarded"]
        LevelCheck -->|No| XPGainedToast["Show XP Gained Toast (+35 XP)"]
    end

    subgraph "Screen 6: DLP Anti-Burnout Recovery Loop"
        RenderHUD --> InactivityCheck{User stalled > 3 days with 0 completions?}
        InactivityCheck -->|Yes: Fatigue Detected| FatigueBanner["⚠️ Digital Lifestyle Profile Triggered:<br/>'Notice you've been tired lately. Scaling down difficulty.'"]
        FatigueBanner --> BtnAcceptRest["🔘 [BTN] Accept Rest Day (Streak preserved)"]
        FatigueBanner --> BtnMicroQuest["🔘 [BTN] Accept Restorative Micro-Quest (5 min, +10 XP)"]
        InactivityCheck -->|No: Active player| NormalRhythm["Normal play mode maintained"]
    end
```

🔍 *[Open Full-Screen Zoomable Diagram (SVG)](./docs/diagrams/user-flow.svg)*


---

## 🗂️ File Structure

### Complete Directory Organization

```
QuestSage/
├── requirements.txt             # Python dependencies (FastAPI, SQLAlchemy, Pydantic)
├── SUCCESS_SUMMARY.md           # Test results & Great Sage v3.0 sign-off
├── README.md                    # This master documentation
├── docs/
│   └── diagrams/               # Visual architecture & graphify assets
│       ├── architecture.graphify
│       ├── architecture.png
│       ├── file-tree.graphify
│       ├── file-tree.png
│       ├── dependencies.graphify
│       ├── dependencies.png
│       ├── data-flow.graphify
│       ├── data-flow.png
│       ├── user-flow.graphify
│       ├── user-flow.png
│       ├── connection-map.graphify
│       └── connection-map.png
├── backend/
│   ├── .env                     # Secrets & environment variables
│   ├── QuestSage.db              # SQLite persistence database
│   ├── test_api.py              # End-to-end API test suite
│   ├── test_direct.py           # Core logic direct unit tests
│   ├── test_personalization.py  # Personalization & DLP test suite
│   ├── alembic/                 # Migration environment
│   ├── app/
│   │   ├── main.py              # FastAPI production entry point
│   │   ├── main_simple.py       # Standalone testing entry point
│   │   ├── api/                 # Versioned API routers
│   │   │   └── v1/
│   │   │       ├── api.py       # Master v1 router aggregator
│   │   │       └── endpoints/   # Domain endpoints
│   │   │           ├── ai.py    # Great Sage NLU & Quest Generation
│   │   │           ├── auth.py  # User authentication & tokens
│   │   │           └── quests.py# Quest CRUD, subtasks & XP logging
│   │   ├── core/                # Config, security, database sessions
│   │   ├── models/              # SQLAlchemy database models
│   │   └── schemas/             # Pydantic validation schemas
│   └── tests/                   # Automated pytest suites
└── frontend/
    ├── package.json             # React 18, Tailwind, Lucide dependencies
    ├── tsconfig.json            # TypeScript build configuration
    ├── public/                  # Sound assets & icons
    └── src/
        ├── App.tsx              # Root React component
        ├── components/          # Quest cards, HUD headers, XP bars
        ├── pages/               # Dashboard, Profile, QuestLog
        └── services/            # Axios API client
```

---

## 🧩 The Logic & Data Pipeline

### End-to-End Data Flow & NLU Synthesis

```mermaid
sequenceDiagram
    autonumber
    participant User as Player (React Frontend)
    participant API as FastAPI Router (/api/v1/ai/analyze)
    participant Sage as Great Sage NLU Engine
    participant DLP as Digital Lifestyle Profile
    participant DB as SQLite (QuestSage.db)

    User->>API: POST /api/v1/ai/analyze {text: "Learn Docker containerization in 2 weeks"}
    API->>Sage: Parse Natural Language Input
    Sage-->>Sage: Extract Intent: 'quest_generation' (Confidence: 0.94)
    Sage-->>Sage: Extract Entities: [Skill: DevOps/Docker, Duration: 14 days]
    Sage->>DLP: Query Player Learning History & Energy Rhythms
    DLP-->>Sage: Return Profile: Steady Velocity, Evening Learner
    Sage-->>Sage: Decompose into 4 Sequenced Micro-Tasks (30 min each)
    Sage-->>Sage: Compute Difficulty: Side Quest (+35 XP)
    Sage->>API: Return Structured Quest DTO
    API-->>User: 200 OK {title: "Docker Containerization Mastery", xp: 35, subtasks: [...]}
    User->>API: POST /api/v1/quests/ (Accept Quest)
    API->>DB: Insert Quest & Subtask Records
    DB-->>API: Confirm Commit
    API-->>User: 201 Created -> Quest appears in HUD
```

🔍 *[Open Full-Screen Zoomable Diagram (SVG)](./docs/diagrams/data-flow.svg)*


---

## 🔌 Connection Map & Integration Interfaces

### Exhaustive Connection & Integration Map

```mermaid
graph TB
    subgraph "Client Layer"
        ReactApp["React 18 SPA (Port 3000)<br/>Axios API Client + Web Audio Engine"]
    end

    subgraph "FastAPI Application Server (Port 8000)"
        FastAPICore["backend/app/main.py"]
        AuthModule["app/api/v1/endpoints/auth.py"]
        QuestModule["app/api/v1/endpoints/quests.py"]
        AIModule["app/api/v1/endpoints/ai.py (Great Sage NLU)"]
    end

    subgraph "Data & Knowledge Persistence"
        SQLiteDB[(backend/QuestSage.db<br/>SQLAlchemy ORM + Alembic)]
    end

    subgraph "Cross-Project Portfolio Reference"
        PortfolioCaseStudy["projects/ottailo-portfolio<br/>(Showcased as Core AI Showcase)"]
    end

    ReactApp <-->|HTTP REST JSON| FastAPICore
    FastAPICore --> AuthModule
    FastAPICore --> QuestModule
    FastAPICore --> AIModule
    AuthModule --> SQLiteDB
    QuestModule --> SQLiteDB
    AIModule --> SQLiteDB
    ReactApp -.->|Case Study Link| PortfolioCaseStudy
```

🔍 *[Open Full-Screen Zoomable Diagram (SVG)](./docs/diagrams/connection-map.svg)*


---

## ⚙️ Setup & Usage

### Backend Launch
```bash
# 1. Navigate to backend
cd QuestSage/backend

# 2. Setup virtualenv
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r ../requirements.txt

# 4. Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### Frontend Launch
```bash
# 1. Navigate to frontend
cd QuestSage/frontend

# 2. Install dependencies & run
npm install
npm start
# Opens at http://localhost:3000
```

---

## 📝 Document Meta
- **Generated:** 2026-09-13
- **Last Verified Current:** 2026-11-01
- **Verification Frequency:** Monthly or upon Great Sage algorithm iteration.
