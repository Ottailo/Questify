# QuestSage Product Specification & Durable Truth

## 1. Product Definition & Core Mission

**QuestSage** is a full-stack gamified personal productivity and life operating system powered by the **Great Sage Natural Language Understanding (GS-NLU) engine** (FastAPI backend + React 18/19 frontend).

It transforms unstructured, emotionally charged user goals, anxieties, and ambitions ("I want to learn Python in 30 days", "I feel overwhelmed and burned out") into structured, dopamine-aligned quest cards with weighted micro-tasks (15–60 minutes), tactical XP rewards, skill domain classifications, and adaptive pace regulation via a Digital Lifestyle Profile (DLP).

Unlike sterile corporate task managers (Jira, Asana, Todoist) that treat human output as an endless backlog of obligations, QuestSage frames daily focus as a heroic chronicle. The objective is to eliminate task paralysis, replace guilt with momentum, and provide empathetic, cognitive-load-aware pacing for complex life ambitions.

---

## 2. Target Audience & Operating Context

### Core Audience
* **Knowledge Workers & Software Engineers**: Technical professionals managing relentless context-switching who need structured, friction-free breakdown of technical milestones.
* **Goal-Oriented Creators & Students**: Independent builders executing multi-week study or creative sprints who thrive on visible progression metrics and XP feedback loops.
* **Individuals with Executive Dysfunction & Burnout Susceptibility**: High-drive individuals prone to task freeze or over-commitment who need proactive fatigue protection, rest-day stabilization, and micro-stepped entry points.

### Operating Context
* **Desktop Command Station**: Primary daily planning, deep quest ledger management, and conversational breakdown with the Great Sage while working.
* **Mobile Companion (100dvh Shell)**: Quick on-the-go quest completion, rapid capture of new goals via natural language, and daily streak verification during transitions.
* **Session Rhythms**:
  1. *Morning Alignment (2–3 min)*: Review the active HUD, check today's quest slots, and commit to 1–3 high-weight subtasks.
  2. *Deep Work Execution (15–60 min chunks)*: Check off weighted subtasks; observe immediate tabular XP feedback.
  3. *Sanctuary Reflection (5–10 min)*: Converse with the Great Sage when blocked, unmotivated, or facing a massive ambiguous goal.

---

## 3. Product Voice & Archetype

* **The Archetype**: **The Great Sage / Guild Chronicler** — An ancient, discerning, and grounded mentor. Not a subservient chatbot, not an exclamation-mark-heavy cheerleader, and not an aloof corporate AI.
* **Demeanor**: Perceptive, concise, tactile, and calm. Speaks with quiet authority and clarity.
* **Microcopy Rules**:
  * **User-Centric Active Verbs**: "Inscribe Quest", "Claim XP", "Advance Subtask", "Begin Trial" — never passive system terms like "Submit", "Execute", or "Process".
  * **Zero Artificial Sycophancy**: Ban fake enthusiasm ("You're doing fantastic! 🎉", "Let's make today magical!"). Acknowledge progress factually: "Subtask verified. 120 XP allocated to Mastery."
  * **Empathetic Fatigue Intervention**: When stall conditions occur (>3 days without movement), the Sage suggests tactical rest or quest recalibration without guilt: "Pace has slowed. Fatigue mitigation active: streak preserved. Break this trial into smaller increments?"
  * **Banned Vocabulary**: Strictly eliminate "Elevate", "Unleash", "Next-Gen", "Seamless", "Supercharge", "Game-Changer", and em-dash slogan copy.

---

## 4. Evidence & Core Mechanics

The interface serves five concrete, verified engineering mechanics:

1. **GS-NLU Deconstruct Engine (`/api/v1/ai/analyze`)**:
   Takes conversational natural language and extracts goal scope, estimated duration, difficulty tier, and 2–5 structured subtasks with discrete completion criteria.

2. **Subtask Time-Budgeting with XP Weighting**:
   Every subtask possesses an explicit duration estimate (15–60 min) and a fractional completion weight (`weight%`). Total quest XP is distributed proportionally, giving micro-actions verifiable mathematical value.

3. **Digital Lifestyle Profile (DLP) Fatigue Protector**:
   Backend DLP tracks activity velocity. If inactivity exceeds thresholds, difficulty scaling automatically steps down and grants grace rest periods without resetting streaks or imposing punitive UI shame states.

4. **The Master Quest Log Ledger**:
   A four-state progression system (`not_started`, `in_progress`, `completed`, `abandoned`) supporting filtering, keyword search, and subtask checklist auditing.

5. **Character Progression HUD**:
   Global level progression, XP threshold rails, Wisdom Point accumulation, active streak counters, and milestone achievement seals.

---

## 5. Route & Screen Inventory

| Route | View Name | Primary User Job | Critical States Required |
|---|---|---|---|
| `/` | **Character HUD & Active Command** | Assess character standing, initiate quick natural language quests, advance active quest cards. | Loading skeleton, empty quest queue, active quest cards, max-level state. |
| `/chat` | **The Great Sage Sanctuary** | Deep conversational goal deconstruction, burnout counseling, quest synthesis. | Idle reading view, streaming synthesis docket, quest card confirmation, error state. |
| `/quests` | **Master Quest Log** | Comprehensive audit and execution of all quests; subtask checklists; manual Forge modal. | Populated ledger, filtered empty state, multi-subtask drilldown, creation modal. |
| `/profile` | **Character Sheet & DLP Matrix** | Review long-term mastery metrics, unlocked milestone seals, DLP fatigue calibration. | Metric cards, badge grid (locked/unlocked), activity history, preferences. |
| `/login` | **Gate of Entry (Authentication)** | Sign in with credentials or demo access token. | Clean input focus, auth error alert, loading spinner. |
| `/register` | **Initiate Onboarding** | Account creation, username selection, password verification. | Inline field validation, password match indicator, submit lock. |
