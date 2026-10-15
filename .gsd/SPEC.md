# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> Sources of truth: `PRODUCT_PLAN.md`, `UI_DESIGN_AND_AI_STRATEGY.md`, `ARCHITECTURE_AND_TESTING.md`.
> This spec scopes **Milestone 1 (P0 Foundation + clickable UI on mock data)**.

## Vision
APEX is a daily operating system for the body: plan training, log sessions fast, track food and water, understand recovery, and talk to an AI coach that knows your data. Web-only Angular PWA, free-tier stack, privacy-first, not a medical product.

## Goals (Milestone 1)
1. **Foundation** — Angular workspace (standalone, signals, lazy routes), design tokens (dark "Performance" theme + light "Nourish" theme), responsive layout shell (sidebar ≥1024, icon rail 600–1023, bottom tabs <600).
2. **Domain logic (TDD)** — pure TS calculators in `src/app/domain/`: energy (BMR/TDEE/goal calories with floor), macros + water, 1RM (Epley), session load + spike, progressive overload, readiness (re-normalized weights), PR detection, unit conversion.
3. **Clickable screens on mock data** matching the reference screens: Today (dashboard), Train hub + Exercise library, Live session logger (Part B of UI doc), Nutrition today + Scan meal + Meal review, Recovery home + Check-in, Progress, Coach AI (chat + right panel on desktop), Onboarding wizard, Plan confirmed, Settings (appearance), Landing.
4. **Data access behind interfaces** — every feature reads/writes through injectable services with mock implementations so Supabase can replace them later.

## Non-Goals (Milestone 1)
- Real backend, auth, Supabase, RLS (Milestone 2)
- Real LLM calls / AI gateway (Milestone 3). Coach and meal scan use deterministic mock responses that follow "rules compute, AI explains".
- Web push, offline sync queue, barcode, MediaPipe, community
- Storybook, CI pipeline, Playwright suite (later milestone)

## Constraints
- Angular latest stable, standalone components, signals, `@if/@for`, lazy routes.
- Vanilla CSS with design tokens (CSS custom properties). No Tailwind, no Material styling, no Kendo. Angular CDK allowed for a11y behavior.
- Fonts: Archivo (display) + Inter (UI), tabular numerals.
- Icons: one consistent set (Tabler-style inline SVG), no emoji as UI icons, no sparkle icon for AI.
- Visual direction: match the reference screens (graphite surfaces, lime CTAs, colored rings, athlete/mountain imagery) with glow toned down per PRODUCT_PLAN 7.4.
- Macro colors fixed app-wide: Protein = orange, Carbs = cyan, Fat = lime.
- `domain/` has zero Angular imports. Features never import other features.
- Windows/PowerShell host: one shell command per invocation.

## Success Criteria
- [ ] `ng build` succeeds with zero errors
- [ ] `ng test` passes all domain unit tests (UT-EN, UT-MC, UT-1RM, UT-LD, UT-OV, UT-RD, UT-PR, UT-UNIT from ARCHITECTURE_AND_TESTING 6.1)
- [ ] All routes in the routing map render in the browser with no console errors
- [ ] Layout switches correctly at 375 / 768 / 1280 px (screenshots captured)
- [ ] Live session: a repeat set is logged with 1 tap; rest timer starts; PR badge appears
- [ ] Meal review: editing grams recalculates kcal/macros instantly
- [ ] Recovery check-in produces a readiness score with "why" factors
- [ ] Dark/light theme switch persists across reload

## User Stories
### As a gym lifter (Alex)
- I want to tap an exercise card and log a set in one tap
- So that logging never slows my workout

### As a healthy-living beginner
- I want to snap a meal photo and review the estimate
- So that I track food without typing

### As any user
- I want a readiness score that explains itself
- So that I trust what the coach recommends

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Design tokens dark + light | Must-have | UI doc Part E |
| Responsive shell | Must-have | UI doc Part D global layout |
| Domain calculators + tests | Must-have | PRODUCT_PLAN §5 |
| Mock data services | Must-have | Interfaces for later Supabase swap |
| Skeleton / empty / error states | Should-have | UI doc D11 |
| Reduced motion, focus-visible, 44px targets | Must-have | WCAG 2.2 AA |

---

*Last updated: 2026-10-15*
