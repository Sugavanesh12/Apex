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
**Status:** 🔄 In Progress
**Objective:** Build verification, unit test runner, HTTP server validation.
**Depends on:** Phase 3

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ✅ | 3/3 | 100% |
| 2 | ✅ | 3/3 | 100% |
| 3 | ✅ | 1/1 | 100% |
| 4 | 🔄 | 0/1 | 80% |

## Later milestones
- **M2 Backend:** Supabase auth, schema (ARCH §2), RLS, replace mock services.
- **M3 AI:** AI gateway (Gemini/Groq/Ollama adapters), meal-photo analysis, coach chat, weekly insight pipeline.
- **M4 P2 features:** push, offline queue, barcode, plan generator, weekly review.
