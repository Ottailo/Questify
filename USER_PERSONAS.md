# QuestSage - 5-Persona User Journey Matrix & Operational Validation

> **Compliance**: Formatted strictly according to **Rule 13 (Production Parity, Multi-Persona Usability & Zero-Mock Invariant)**.
> Every persona below documents an end-to-end, click-by-click operational journey executed against the live application.

---

## Persona Overview & Interaction Matrix

| Persona ID | Title / Role | Core Objective | Primary Interfaces | Verifiable Outcome | Screenshot Artifact |
|---|---|---|---|---|---|
| **Persona 1** | **Onboarding Chronicler** (Initiate Vanguard) | Register identity, generate cryptographic JWT, inspect Field Guide walkthrough | `/register`, `/login`, `WalkthroughModal` | Account inscribed in SQLite/PostgreSQL, JWT token issued, 5-protocol guide viewed | `tests/screenshots/personas/persona_1_auth_onboarding.png` |
| **Persona 2** | **Cognitive Dialogue Architect** (Campaign Strategist) | Prompt Great Sage AI to deconstruct high-level goals into tactical subtasks | `/chat`, OmniRoute Gateway (`http://127.0.0.1:20129/v1`) | Structured campaign blueprint rendered with XP & time allocations | `tests/screenshots/personas/persona_2_sage_cognitive_dialogue.png` |
| **Persona 3** | **Ledger Campaign Inscriber** (Archivist) | Inscribe AI-synthesized blueprint directly into the active campaign ledger | `/chat` -> `/quests`, HUD Inscription | Quest record stored with discrete foreign-key subtasks in database | `tests/screenshots/personas/persona_3_quest_ledger_inscription.png` |
| **Persona 4** | **Field Operator & Milestone Striker** (Tactician) | Execute discrete subtasks, toggle completion checkboxes, observe live progress rail | `/quests` Campaign Roster, Milestone Rails | Optimistic subtask toggling with live server synchronization and XP tally | `tests/screenshots/personas/persona_4_milestone_checklist_toggle.png` |
| **Persona 5** | **Guild Master & DLP Calibrator** (Commander) | Calibrate daily fatigue matrix, verify DLP pacing, inspect achievements and rank | `/profile` Character Sheet, DLP Matrix | Dynamic fatigue state set, completion rate updated, rank progression verified | `tests/screenshots/personas/persona_5_dlp_fatigue_calibration.png` |

---

## Detailed Step-by-Step Personas

### Persona 1: Onboarding Chronicler (Initiate Vanguard)
* **User Profile**: Samuel Vance, a newly enrolled engineer establishing his lifelong tactical ledger.
* **Journey Sequence**:
  1. Opens application at `http://localhost:3000/register`.
  2. Inputs identity dossier: Email (`vanguard_initiate@guild.archive`), Call-sign (`Vanguard_01`), Password (`VanguardKey2026!`), Full Name (`Samuel Vance`).
  3. Clicks **"Inscribe Chronicler"** button. The backend receives `POST /api/v1/auth/register`, hashes the password with 12-round Bcrypt, persists the user record, issues a cryptographic JWT token, and returns the profile payload.
  4. The browser automatically stores the token in `localStorage`, redirects to `/`, and opens the **Vanguard Field Guide** (`WalkthroughModal`).
  5. The chronicler steps through the 5 architectural protocols (Identity, Cognition, Execution, DLP Adaptation, Mastery), toggling verification checkmarks.
* **Verification Proof**:
  - Screenshot: `tests/screenshots/personas/persona_1_auth_onboarding.png`
  - Database verification: User record created in `users` table with hashed cipher.

---

### Persona 2: Cognitive Dialogue Architect (Campaign Strategist)
* **User Profile**: Elena Chen, technical lead planning an infrastructure migration.
* **Journey Sequence**:
  1. Navigates to `/chat` (Great Sage Scribe Sanctuary).
  2. Types an ambitious directive: *"Deconstruct an ambitious campaign to master FastAPI async architecture and WebSockets"*.
  3. Dispatches message to Great Sage.
  4. The backend queries local OmniRoute LLM (`http://127.0.0.1:20129/v1` with model `infron/deepseek/deepseek-v4.1-flash`).
  5. Great Sage responds with natural-language tactical counsel and a structured **Tactical Campaign Blueprint** card featuring:
     - Difficulty classification: `Hard` (Campaign Grade).
     - Subtasks: Step-by-step milestones (Async I/O event loops, Pydantic v2 schemas, WebSocket channel handlers, Locust load tests).
     - XP Allocation: 350 XP total.
     - One-click action: **"Inscribe into Ledger"**.
* **Verification Proof**:
  - Screenshot: `tests/screenshots/personas/persona_2_sage_cognitive_dialogue.png`
  - Real-time LLM inference: Output validated via OmniRoute connection logs.

---

### Persona 3: Ledger Campaign Inscriber (Archivist)
* **User Profile**: Marcus Drake, operations specialist committing planned operations to disk.
* **Journey Sequence**:
  1. Inspects the generated campaign blueprint card in `/chat`.
  2. Clicks **"Inscribe into Ledger"**.
  3. The frontend triggers `POST /api/v1/quests/` with the structured campaign payload, user ID, and nested subtasks.
  4. The backend opens a transactional database session, creates the `Quest` entity, writes each `SubTask` foreign-key association, and commits.
  5. The card confirms with visual badge: *"Directive Inscribed into Guild Ledger"*.
  6. Marcus navigates to `/quests` to view the campaign freshly positioned at the head of the roster.
* **Verification Proof**:
  - Screenshot: `tests/screenshots/personas/persona_3_quest_ledger_inscription.png`
  - Database entity verification: Row in `quests` joined to rows in `subtasks`.

---

### Persona 4: Field Operator & Milestone Striker (Tactician)
* **User Profile**: Aaron Thorne, daily task executor working through active sprint directives.
* **Journey Sequence**:
  1. Navigates to `/quests` (Quest Log & Campaign Roster).
  2. Selects an active directive card (e.g., *"Deploy production Redis cluster with Sentinel failover"*).
  3. Clicks on the first milestone subtask: *"Configure master-replica replication and sentinel.conf"*.
  4. The frontend performs optimistic state update: checkbox lights up amber, text strikes through, and the Chronicle Progress Rail increments from 0% to 50%.
  5. The frontend simultaneously dispatches `PATCH /api/v1/quests/{id}/subtasks/{subtask_id}/toggle`.
  6. The backend updates the database row and returns the synchronized subtask model.
  7. When all subtasks are marked complete, Aaron clicks **"Claim Campaign Victory"** (`POST /api/v1/quests/{id}/complete`), banking +300 XP and advancing his Chronicle Rail.
* **Verification Proof**:
  - Screenshot: `tests/screenshots/personas/persona_4_milestone_checklist_toggle.png`
  - Real-time database update: `subtasks.is_completed = true` persisted.

---

### Persona 5: Guild Master & DLP Calibrator (Commander)
* **User Profile**: Commander Sterling, senior guild supervisor monitoring health, fatigue, and rank.
* **Journey Sequence**:
  1. Navigates to `/profile` (Character Sheet & Tactical Dossier).
  2. Reviews high-level chronicler analytics: Current Rank (Level 03 Vanguard), Streak (7 Days), Completion Efficiency (88%), Wisdom Points (1,420).
  3. Calibrates operational readiness on the **Fatigue Calibration Matrix**:
     - Clicks **"PEAK"** (Velocity multiplier 1.2x) or **"STRAINED"** (Pacing adjustment 0.8x).
     - The backend stores the DLP state in `POST /api/v1/users/dlp`, influencing subsequent Great Sage prompt generation.
  4. Audits the **Guild Achievements** rail: *"First Directive Inscribed"*, *"Three-Day Operational Rhythm"*, *"Master Strategist"*.
* **Verification Proof**:
  - Screenshot: `tests/screenshots/personas/persona_5_dlp_fatigue_calibration.png`
  - Dynamic UI calibration: Active button highlight state saved.
