# QuestSage Completion & Modernization Task Checklist

## 1. Database & Security Infrastructure
- [x] Implement database abstraction for SQLite & PostgreSQL compatibility (`backend/app/core/database.py`, `backend/app/core/config.py`) [Verified: PostgreSQL pool settings + dynamic URI builder]
- [x] Create secure cryptography & JWT token engine using `bcrypt` and `PyJWT` (`backend/app/core/security.py`) [Verified: bcrypt 12-round hashing + HS256 JWT tokens]
- [x] Implement `get_current_user` and `get_current_active_user` FastAPI dependency guards with Bearer token authentication (`backend/app/core/deps.py`) [Verified in integration tests]

## 2. Authentication System (Full-Stack Closed Loop)
- [x] Refactor `backend/app/api/v1/endpoints/auth.py` with real bcrypt password verification and JWT issuance [Verified: tests emit valid signed JWT tokens]
- [x] Implement `POST /api/v1/auth/register` (unique check, password hashing, DLP initialization, JWT return) [Verified: User & DLP created in DB]
- [x] Implement `POST /api/v1/auth/login` (credential check, JWT issuance) [Verified: 200 OK + JWT returned]
- [x] Implement `GET /api/v1/auth/me` (authenticated user profile retrieval) [Verified: Profile & telemetry returned]
- [x] Wire `frontend/src/pages/Login.tsx` to `QuestSageAPI.loginUser` with real error handling and redirect [Verified: Calls live endpoint and stores token]
- [x] Wire `frontend/src/pages/Register.tsx` to `QuestSageAPI.registerUser` with validation and automatic login [Verified: Real registration flow with terms agreement]
- [x] Update `frontend/src/services/api.ts` auth headers and interceptors [Verified: Auto-injects Bearer token]
- [x] Secure protected routes in frontend (`Layout.tsx` auth check) [Verified: Redirects unauthenticated visits to /login]

## 3. Great Sage AI Engine: OmniRoute Integration
- [x] Create OmniRoute AI Client in `backend/app/services/ai/omniroute_client.py` connecting to `http://127.0.0.1:20129/v1` [Verified: 200 OK via deepseek-v4.1-flash]
- [x] Configure environment variables for OmniRoute URL, API Key, and Model (`infron/deepseek/deepseek-v4.1-flash`) [Verified: live connection]
- [x] Refactor `gs_nlu_engine.py` to use LLM-based intent understanding with fallback [Verified: Sage wisdom persona + state detection]
- [x] Refactor `quest_generator.py` to synthesize rich, dynamic quest blueprints via OmniRoute with structured JSON output [Verified: 3-step weighted subtask breakdown]
- [x] Test OmniRoute quest generation from backend [Verified: tested via test_direct.py with exit code 0]

## 4. API Contract Harmonization & Endpoints
- [x] Implement `GET /api/v1/quests/recent` (recent active quests for dashboard) [Verified: returns top active dossiers]
- [x] Update `GET /api/v1/quests/` to use authenticated `current_user` instead of mandatory query param [Verified: eliminates 422 error]
- [x] Implement `PATCH /api/v1/quests/{id}/subtasks/{subtask_id}/toggle` (subtask completion persistence) [Verified: calculates progress percentage and persists to SQLite]
- [x] Implement `POST /api/v1/quests/{id}/complete` (XP payout, level calculation, streak update) [Verified: awards XP and updates user stats]
- [x] Implement `GET /api/v1/users/profile`, `GET /api/v1/users/stats`, and `GET /api/v1/users/achievements` [Verified: all 3 endpoints functional]

## 5. Industrial Studio UI/UX & Onboarding Walkthrough (Rule 11)
- [x] Build interactive first-run onboarding tour (`WalkthroughModal.tsx`) [Verified: 5 architectural protocols with interactive checkboxes and navigation launcher]
- [x] Update `Dashboard.tsx` to consume live `recentQuests` and `userStats` without mock fallbacks [Verified: real API calls with fallback resilience]
- [x] Add "Inscribe Quest" action card in `QuestChat.tsx` to commit Sage recommendations directly to active ledger [Verified: Inscribe button calls createQuest]
- [x] Enable subtask checklist interactivity in `QuestList.tsx` with backend persistence [Verified: optimistic UI + server sync]
- [x] Connect `Profile.tsx` to live user profile, achievements, and DLP fatigue sliders [Verified: uses real user data and icon map]

## 6. Multi-Persona Usability & Verification Gate (Rules 7, 11, 12, 13)
- [x] Define end-to-end 5-Persona User Journey Matrix in `USER_PERSONAS.md` [Verified: Persona 1 to 5 fully documented]
- [x] Fix `test_direct.py` and write Pytest suite for auth, quest creation, and subtask toggle (`backend/tests/test_backend_api.py`) [Verified: Pytest 2/2 passed in 2.54s]
- [x] Verify `npm run build` passes with exit code 0 [Verified: Compiled successfully into build/ with zero warnings, 123.33 kB]
- [x] Automated Browser E2E Suite with Microsoft Edge via Puppeteer (`scripts/run_e2e_suite.mjs`) [Verified: Exit code 0, all 14 PNG screenshots captured]:
  - `tests/screenshots/01_login_authentication.png` (63,762 B)
  - `tests/screenshots/02_registration_docket.png` (98,622 B)
  - `tests/screenshots/03a_walkthrough_modal.png` (198,397 B)
  - `tests/screenshots/03_dashboard_command_hud.png` (133,055 B)
  - `tests/screenshots/04_dashboard_quick_directive_inscribed.png` (157,216 B)
  - `tests/screenshots/05_great_sage_scribe_sanctuary.png` (249,121 B)
  - `tests/screenshots/06_campaign_roster_quest_log.png` (278,623 B)
  - `tests/screenshots/07_subtask_progress_rail.png` (279,133 B)
  - `tests/screenshots/08_character_sheet_dlp.png` (337,836 B)
  - `tests/screenshots/personas/persona_1_auth_onboarding.png` (98,619 B)
  - `tests/screenshots/personas/persona_2_sage_cognitive_dialogue.png` (249,121 B)
  - `tests/screenshots/personas/persona_3_quest_ledger_inscription.png` (249,673 B)
  - `tests/screenshots/personas/persona_4_milestone_checklist_toggle.png` (279,133 B)
  - `tests/screenshots/personas/persona_5_dlp_fatigue_calibration.png` (337,836 B)
