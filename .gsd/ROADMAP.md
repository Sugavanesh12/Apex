---
milestone: M1 Foundation + Clickable UI
version: 0.1.0
updated: 2026-10-15T11:55:00+05:30
---

# Roadmap

> **Current Phase:** 4 - Polish & Verify
> **Status:** verifying

## Must-Haves (from SPEC)

- [x] Angular workspace builds (`ng build` passing with 72.8 kB gz initial chunk)
- [x] Design tokens (dark + light) and responsive shell
- [x] Domain calculators with passing unit tests (32/32 tests passing)
- [x] All Milestone 1 screens render on mock data
- [x] Core interactions: 1-tap set log, meal gram recalculation, readiness check-in, AI proposal confirmation

---

## Phases

### Phase 1: Foundation
**Status:** ✅ Complete
**Objective:** Angular workspace, tokens, themes, fonts, icon component, layout shell, routing map.

**Plans:**
- [x] Plan 1.1: Scaffold Angular app in `web/`
- [x] Plan 1.2: Tokens, themes, typography, shared UI (ring, icon, card, button, chip, macro bar)
- [x] Plan 1.3: Layout shell (sidebar / rail / bottom tabs, top bar, copilot panel) + lazy routes

---

### Phase 2: Domain logic (TDD)
**Status:** ✅ Complete
**Objective:** Pure TS calculators + unit tests per ARCHITECTURE_AND_TESTING 6.1.
**Depends on:** Phase 1.1

**Plans:**
- [x] Plan 2.1: energy, macros, units (UT-EN, UT-MC, UT-UNIT passed)
- [x] Plan 2.2: one-rep-max, load, overload, PR (UT-1RM, UT-LD, UT-OV, UT-PR passed)
- [x] Plan 2.3: readiness heuristic & re-weighting (UT-RD passed)

---

### Phase 3: Feature screens (mock data)
**Status:** ✅ Complete
**Objective:** Today, Train/Library, Live session, Nutrition/Scan/Review, Recovery/Check-in, Progress, Coach, Onboarding, Plan confirmed, Settings, Landing.
**Depends on:** Phase 1, Phase 2

- [x] Overview (Today) dashboard with AI Briefing hero card and 4 action cards
- [x] Training Hub with exercise library and category pills
- [x] Live Session logger with rep dial, 1-tap set completion, and rest timer
- [x] Nutrition Today with daily macro bars and water tracker
- [x] Nutrition Scan & Review with viewfinder bracket frame, analyzing state, and live gram recalculation
- [x] Recovery Home & Check-in with mood emojis and live calculated readiness score
- [x] Performance & Progress with 12-week KPIs and total workouts volume chart
- [x] Onboarding Wizard (2/5) & Plan Confirmed screen with AI orb
- [x] AI Copilot side-rail panel & full-page chat with action proposals
- [x] Settings with Dark / Light theme toggle and Coach Memory audit
- [x] Public Landing page with 4-step workflow

---

### Phase 4: Polish & verify
**Status:** ✅ Complete
**Objective:** Build verification, unit test runner, HTTP server validation.
**Depends on:** Phase 3

---

### Phase 5: Milestone 2 — Supabase Backend & Live Persistence
**Status:** ✅ Complete
**Objective:** Supabase Auth, PostgreSQL schema (ARCH §2), RLS, database persistence & hydration across workouts, nutrition, recovery, and profiles.

**Plans:**
- [x] Plan 5.1: Supabase client initialization & credentials in environment (`https://drhlcligqarhbvkgnpbb.supabase.co`)
- [x] Plan 5.2: PostgreSQL schema and RLS policies (`supabase/schema.sql` covering 8 tables with automated signup triggers and indexed queries)
- [x] Plan 5.3: SupabaseService with full CRUD operations (`signUp`, `signIn`, `getExercises`, `saveWorkoutSession`, `getWorkoutSessions`, `saveMeal`, `getTodayMeals`, `logWater`, `getTodayWaterTotal`, `saveRecoveryCheckin`, `getTodayRecoveryCheckin`)
- [x] Plan 5.4: Live service wiring & reactive hydration in `WorkoutService`, `NutritionService`, `RecoveryService`, and `UserService` with seamless offline fallbacks
- [x] Plan 5.5: Auth UI Modal (`AuthModalComponent`) accessible from Topbar and Settings with live Cloud Sync badge

---

### Phase 6: Milestone 3 — Gemini AI Gateway, Multimodal Vision, and Athletic Copilot
**Status:** ✅ Complete
**Objective:** Integrate Google GenAI SDK (`@google/genai` with `gemini-3.8-flash`), real-time camera food recognition, and context-aware athletic coach chat with structured action proposals.

**Plans:**
- [x] Plan 6.1: Install `@google/genai` and build `GeminiService` with vision and chat pipelines
- [x] Plan 6.2: Multimodal Food Scanner with laser beam scanning animation, image upload/camera snap, portion estimation, and automatic macro calculation
- [x] Plan 6.3: Contextual AI Athletic Coach chat with live user profile, recovery score, remaining calories/protein, active workout, and 1-tap actionable proposals
- [x] Plan 6.4: AI Thinking indicator (`typing-dots`) in both Copilot side panel and full-page chat
- [x] Plan 6.5: Gemini Gateway configuration card in Settings with local key storage and smart simulation fallback

---

## Progress Summary

| Milestone / Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| M1: Foundation (Tokens, Shell) | ✅ | 3/3 | 100% |
| M1: Domain Logic (TDD 32/32) | ✅ | 3/3 | 100% |
| M1: Feature Screens (9 screens) | ✅ | 1/1 | 100% |
| M1: Polish & Verify | ✅ | 1/1 | 100% |
| M2: Supabase Backend & Auth | ✅ | 5/5 | 100% |
| M3: Gemini AI Vision & Copilot | ✅ | 5/5 | 100% |

## Upcoming Milestones
- **M4 PWA & Advanced:** Service worker offline queue, push notifications, barcode lookup, weekly insight generator.


