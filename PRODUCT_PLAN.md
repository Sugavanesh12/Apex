# APEX — AI Fitness, Nutrition & Recovery Web App
## Product Plan (what to build, why, what data, what is free)

> Working name: **APEX** (training/performance) with a **Nourish** nutrition module. Rename freely.
> Companion file: `ARCHITECTURE_AND_TESTING.md` (architecture, data model, APIs, all test cases).

---

## 0. Assumptions (correct me if any is wrong)

| # | Assumption | Impact if wrong |
|---|-----------|-----------------|
| A1 | Web app only (Angular, PWA-installable). No native iOS/Android in v1. | Native wrapper (Capacitor) is Phase 4 |
| A2 | "Free" = free tier or open source with no credit card needed for MVP. Free tiers change, so verify limits before committing. | Swap provider via the adapter layer |
| A3 | AI keys must NOT live in the browser, so we need a thin serverless backend (free tier). | Without it, keys leak |
| A4 | Single-user accounts first. Community/coach features come later. | Adds roles/permissions |
| A5 | Not a medical product. No diagnosis. Wellness guidance + safety guardrails. | Medical = regulation |
| A6 | One design system, two themes: **Performance (dark)** from the APEX mockup and **Nourish (light)** from the nutrition mockup. | Pick one theme only |
| A7 | Sports supported at start: Gym + a generic "Sport" profile (cricket in your mockup, then running, football, etc.). | Sport-specific modules grow |

---

## 1. Vision & users

**One sentence:** a daily operating system for your body: plan training, log sessions, track food and water, understand recovery, and talk to an AI coach that knows your data.

### Personas
| Persona | Goal | What they need most |
|---------|------|---------------------|
| **Gym lifter (Alex)** | Get stronger, track PRs | Fast set logging, rest timer, progressive overload hints |
| **Team-sport athlete** | Speed/skill + load management | Sport sessions, readiness, load vs recovery |
| **Healthy-living beginner** | Lose fat / build habit | Simple food logging, reminders, gentle guidance |
| **Busy professional** | 20-minute routines | Quick workouts, reminders, weekly summary |

### Principles (from your guideline file, applied to product)
1. **Simplicity first (YAGNI):** MVP = log, see, get one useful suggestion. Everything else is phased.
2. **Don't assume:** AI estimates are always editable and labelled as estimates.
3. **Goal-driven:** every phase has measurable exit criteria (section 11).
4. **Privacy by default:** health data is sensitive. Minimal collection, explicit consent, export and delete.

---

## 2. Reality checks (answers to your direct questions)

### 2.1 "If the camera isn't available, can they upload from gallery to calculate calories?"
**Yes, that works, and you should support both.** But one correction: *calorie calculation from a photo is an estimate, not exact.*

- A photo shows **what** the food is (good) but not **how much** (weak: depth, hidden oil, sauces, rice under curry). Typical error is roughly 20–30% or more, depending on meal.
- Therefore the flow must be: **Photo → AI identifies items + estimates grams → user reviews/edits → database computes calories.** (Your Nourish mockup already shows this: "AI estimate · Review before saving", ingredient list with Edit, portion size.)
- **Important design choice:** the AI should only *identify items and guess grams*. The calories/macros should come from a **food database** (USDA / Open Food Facts), not from the AI's own numbers (LLMs hallucinate nutrition values).
- Accuracy boosters: portion picker (small/medium/large), "add a reference" (fork/plate/hand), barcode scan for packaged food, text search fallback, "my foods" / saved meals, correction learning ("you usually eat 200 g rice").

**How photos get in (all via standard browser features):**
| Method | Web API | Notes |
|--------|---------|-------|
| Live camera | `navigator.mediaDevices.getUserMedia` | HTTPS required; permission prompt |
| Take photo via device camera app | `<input type="file" accept="image/*" capture="environment">` | Works on most mobile browsers |
| Gallery / file | `<input type="file" accept="image/*">` | Works everywhere incl. desktop |
| Drag and drop | HTML5 DnD | Desktop convenience |

Always: resize client-side (max ~1024 px), strip EXIF (GPS), then upload.

### 2.2 What a website can and cannot do (and the alternative)

| Need | Web reality | Alternative in plan |
|------|-------------|---------------------|
| Camera | Yes (HTTPS + permission) | Gallery upload fallback |
| Push reminders | Yes via Service Worker + Web Push. **On iPhone only works if the app is added to the Home Screen** (iOS 16.4+) | In-app reminder center, email reminders, `.ics` calendar export |
| Reminders when app is closed | Needs a server to schedule pushes (cron) | Free serverless cron |
| Background GPS tracking | Unreliable (tab sleeps) | Keep screen awake (Wake Lock API), manual distance entry, GPX import |
| Heart-rate straps | Web Bluetooth only on Chrome/Edge (not iOS Safari) | Manual HR/RPE entry; Phase 4 native wrapper |
| Apple Health / Health Connect | Not accessible from the web | File import (Apple Health export, CSV, GPX/FIT), manual entry |
| Step counter | No direct web access | Manual or imported; skip in MVP |
| Offline use | Yes via PWA service worker + IndexedDB | Queue logs, sync later |
| Voice input | Web Speech API (browser-dependent) | Typed input always available |
| Barcode scan | `BarcodeDetector` (limited) | ZXing-js library (free) |

### 2.3 External services: the "free" list

| Purpose | Free option | Caveat |
|---------|-------------|--------|
| Food nutrition DB | **USDA FoodData Central** (free API key), **Open Food Facts** (open data, barcodes) | USDA is US-centric; add custom foods/recipes for regional dishes |
| Exercise library | **free-exercise-db** (open dataset on GitHub) / **wger** (open source API) | Check each license; host the JSON ourselves |
| Weather (outdoor advice) | **Open-Meteo** (no key for non-commercial) | Check terms if you monetize |
| Pose / form check, rep counting | **MediaPipe Pose** (on-device, Apache-2.0) | Runs in browser, no video upload (good for privacy) |
| LLM chat + vision | **Gemini API free tier** and/or **Groq free tier**; self-host **Ollama** for dev | Free tiers have rate limits and may use data to improve products; verify current terms. Keep provider swappable |
| On-device AI (offline, private) | **Transformers.js / WebLLM** | Large downloads; Phase 3 optional |
| Backend (auth, DB, functions) | **Supabase** free tier or **Firebase Spark** | Supabase free projects can pause after inactivity. Firebase Functions need the pay-as-you-go plan even if usage stays at zero |
| Hosting | Cloudflare Pages / Netlify / Vercel free tier / Firebase Hosting | |
| Charts | Chart.js (`ng2-charts`) or Apache ECharts | MIT/Apache |
| UI components | **Angular Material + CDK** (free) + Tailwind for tokens | **Avoid Kendo UI** in this app: it is commercial/licensed, which breaks the free-only rule |
| Web Push | Browser Push API + VAPID keys (free) | |
| Error monitoring | Sentry free tier / self-hosted GlitchTip | |

---

## 3. Feature modules

Legend: **P1** = MVP, **P2** = next, **P3** = later, **P4** = native/optional.

### 3.1 Onboarding & profile (P1)
Short, skippable-where-possible, with progress bar. Collect only what the app uses (see section 4).
- Goal selection (build muscle / lose fat / performance / general health / sport-specific)
- Body basics, activity level, experience level
- Equipment and schedule
- Food preferences and restrictions
- Safety screen (injuries/conditions as *optional* flags)
- Consent: terms, privacy, AI-processing consent, notification consent (asked at a sensible moment, not on first load)

### 3.2 Dashboard / Overview (P1)  — from APEX mockup
- Greeting + date + "Ready to train" status
- **Today's mission** card: recommended session, duration, intensity, *Start session*
- **Performance readiness** ring (0–100) with sleep, HRV (if user enters it), recovery label
- **Training load** weekly chart (strength / speed / skill)
- **Fuel status**: calories, protein, water + *Log meal*
- **Up next** (calendar items), **Coach AI** insight card with *View insight / Dismiss*
- **Live stats** (personal bests: squat, sprint, batting avg etc., user-configurable)
- **Activity** feed (PRs, completed sessions)
- Streak counter (training days) with a non-punishing streak design (see 7.5)

### 3.3 Training: Gym & Sessions (P1)
- **Exercise library**: search, filter by muscle, equipment, difficulty; images/GIF/video link; instructions; common mistakes
- **Plans**: AI-generated or template (PPL, upper/lower, full body, beginner), editable
- **Live session logger** (the core screen):
  - Exercise → sets with weight × reps × RPE, add/remove sets
  - Previous performance shown inline
  - Rest timer (auto-start, vibration/sound optional), Wake Lock to keep screen on
  - Superset / warm-up set support (P2)
  - Auto **PR detection** (weight, reps, estimated 1RM)
  - Finish → summary: volume, duration, PRs, session RPE, notes
- **Progressive overload hints** (rule-based first, AI explains): "last time 60×8 at RPE 7, try 62.5×8"
- **Sport sessions** (P2): skill drills, speed work, match/practice, duration, session RPE; sport profile (cricket batting drills, running intervals, etc.)
- **Mobility/warm-up flows** (P2): 5–10 minute guided routines
- **Form check with camera** (P3): MediaPipe on-device rep counting + basic form cues. No video leaves the device.
- **Cardio** (P2): manual entry + GPS-while-open + GPX import

### 3.4 Nutrition tracker (P1) — from Nourish mockup
- **Daily view**: calorie ring, protein/carbs/fat bars, water glasses, meals list, **Scan meal** button
- **Add food** (all paths):
  1. Photo scan (camera / gallery) → review screen
  2. Text search (USDA/OFF) + "my foods" + recent/frequent
  3. Barcode (P2)
  4. Quick-add calories/macros
  5. Natural language: "2 rotis, dal, curd" → parsed by AI into items for review (P2)
- **Review screen** (from mockup): estimated kcal, macro tiles, ingredient list with grams + Edit, add ingredient, portion size, confidence badge, Save / Edit
- **Water log**: one-tap glass, custom size, daily target from body weight
- **Meal templates/saved meals/recipes** (P2)
- **Nutrition suggestions** (P1 basic, P2 smarter): what to eat next to hit protein, post-workout meal idea, hydration nudge, weekly pattern ("you hit protein most on training days")
- **Meal plan generator** (P2): respects restrictions, budget, cook time; grocery list export
- **Safety guardrails** (see 6.3): no extreme deficits, option to hide calorie numbers, non-shaming copy

### 3.5 Recovery (P1 basic, P2 deeper)
- **Daily check-in (30 seconds)**: sleep hours + quality, soreness (body map), energy, stress, mood, optional resting HR/HRV
- **Readiness score** (transparent heuristic, section 5.4): shows *why* the number is what it is
- **Suggestions**: train as planned / reduce volume / mobility day / rest, with reasons
- **Recovery toolkit**: stretching routines by muscle group, breathing exercise, sleep hygiene tips, deload week suggestions
- **Injury/pain flag** (P2): if user reports sharp pain, suggest rest and professional advice, and exclude affected movements from plans
- **Sleep log** (manual; import later)

### 3.6 AI Coach (chat + proactive) (P1 chat, P2+ proactive)
- Chat box with context: profile, goals, last 14 days of training, nutrition, recovery
- Suggested prompts ("Plan tomorrow", "Why am I tired?", "High-protein dinner under 600 kcal")
- **Actions, not just text:** AI can propose "Add this workout to tomorrow", "Log 500 ml water", "Create meal plan" with a confirm button (structured tool calls)
- Proactive insights card (daily), weekly review (P2)
- Voice input (P3)
- Always shows: *"AI guidance supports your training. Not medical advice."* (as in your mockup)

### 3.7 Reminders & notifications (P1 in-app, P2 push)
- Types: log meal, drink water, workout time, recovery check-in, weekly review, streak-safe nudge
- Controls (from mockup): smart reminders toggle, quiet hours, tone, per-type toggles, snooze
- "We'll remind you, never judge you": copy rules in 7.5
- Delivery: in-app → Web Push → email fallback → `.ics` export

### 3.8 Progress & insights (P1 basic, P2 deeper)
- Body metrics over time (weight, optional waist/body fat), strength trends, volume per muscle, calorie consistency, protein average, hydration streak, meal logging %
- Week / Month / Year toggle (from mockup), exportable summary (PDF/CSV)
- Photo progress (private, P3)

### 3.9 Community (P3)
Team sessions, challenges, leaderboard (opt-in), sharing PRs. Needs moderation and privacy design; postpone.

### 3.10 Settings, privacy, account (P1)
Profile edit, units (kg/lb, cm/ft), theme (dark/light/system), language (i18n-ready), notification settings, connected data imports, **export my data**, **delete my account and data**, consent management, Terms of Service, Privacy Policy.

### 3.11 Additional useful things (you asked me to think as the user)
| Idea | Why a user wants it | Phase |
|------|--------------------|-------|
| Quick-log widget on dashboard (water, weight, meal) | Logging must take <10 seconds | P1 |
| "Repeat yesterday" / copy meal | Most people eat similar things | P1 |
| Deload and rest-day logic | Avoids burnout/injury | P2 |
| Weekly review report | Closes the loop | P2 |
| Gym-mode UI (big buttons, high contrast, one hand) | Used with sweaty hands | P1 |
| Offline logging | Gym basements have no signal | P2 |
| Warm-up set calculator, plate calculator | Standard lifter needs | P2 |
| Body-measurement guide with illustrations | Correct input | P2 |
| Travel/hotel-gym mode (bodyweight/minimal equipment plans) | Real life | P2 |
| Supplement/medication reminders (generic, user-defined) | Routine | P3 |
| Menstrual-cycle-aware training (opt-in) | Useful to many users | P3 |
| Import from CSV (Strong, Hevy, MyFitnessPal exports) | Lowers switching cost | P3 |
| Share/print workout | Coaches, trainers | P3 |

---

## 4. Data to collect (every input, why, and how)

Principle: *collect only what a feature uses.* Mark sensitive fields clearly and make them optional where possible.

### 4.1 Account
| Field | Type | Req | Why | Validation |
|-------|------|-----|-----|-----------|
| Email | text | Yes | Login, recovery, email reminders | RFC format, verify |
| Password or social login | secret | Yes | Auth | Min 10 chars; breached-password check optional |
| Display name | text | Yes | Greeting | 1–40 chars |
| Date of birth | date | Yes | Age-based formulas, age gate | Age gate: block under minimum age (13/16/18 depending on region); do not store minors' data without compliant consent |
| Time zone, locale | auto | Auto | Reminders, units | IANA tz |
| Consents (ToS, Privacy, AI, notifications, marketing) | booleans + timestamp | Yes | Compliance | Store version + time |

### 4.2 Body & lifestyle (profile)
| Field | Type | Req | Why |
|-------|------|-----|-----|
| Sex assigned at birth / "use for calculations" | enum (+ prefer not to say → average formula) | Optional | BMR formula |
| Height | number cm/ft-in | Yes | BMR, BMI-free tracking |
| Weight | number kg/lb | Yes | Calories, protein, water targets |
| Target weight / goal direction | number/enum | Optional | Calorie plan |
| Body fat %, waist, etc. | number | Optional | Progress |
| Activity level (job + lifestyle) | enum 4–5 levels | Yes | TDEE |
| Training experience | enum (beginner/intermediate/advanced) | Yes | Plan complexity |
| Primary goal(s) | multi enum | Yes | Everything |
| Sport(s) and position/role | enum + text | If sport user | Sport plans |
| Dominant hand/side | enum | Optional | Sport-specific |
| Sleep typical hours, wake time | number/time | Optional | Reminders, recovery |

### 4.3 Training setup
| Field | Why |
|-------|-----|
| Days per week + preferred days/time | Plan schedule, reminders |
| Session length available | Plan size |
| Equipment (none / dumbbells / home gym / full gym) | Exercise filtering |
| Preferred training style (strength, hypertrophy, HIIT, mobility…) | Plan type |
| Exercises to avoid / injuries (optional, free text + body-part chips) | Safety filtering |
| Current lifts (optional 1RM or recent weights) | Starting loads |

### 4.4 Nutrition setup
| Field | Why |
|-------|-----|
| Diet type (omnivore, vegetarian, vegan, eggetarian, pescatarian, halal, etc.) | Suggestions |
| Allergies/intolerances (chips + free text) | **Safety-critical for suggestions** |
| Cuisines liked, foods disliked | Personalization |
| Meals per day, typical meal times | Reminders |
| Cooking skill/time, budget | Meal plans |
| Water target preference, glass size | Hydration |
| Show calories? (toggle) | Wellbeing option |

### 4.5 Health & safety screen (sensitive; optional; explain why)
- "Any injuries or conditions we should be careful with?" (free text/chips)
- Pregnancy/postpartum (optional, changes advice)
- Under medical care for diet/exercise? (shows a "consult your professional" note)
- History of disordered eating? (optional; if yes, hides calorie numbers by default and softens targets)
- A short **PAR-Q style** readiness question set (chest pain, dizziness, doctor-advised limits): any "yes" → show advice to speak to a professional before starting
- **Never** diagnose. Store as flags with consent, encrypt, easy delete.

### 4.6 Daily inputs (kept tiny)
| Input | Frequency | Effort |
|-------|-----------|--------|
| Meals (photo/search) | per meal | 5–20 s |
| Water | per glass | 1 tap |
| Sleep | daily | 2 taps |
| Soreness / energy / stress | daily | 3 sliders |
| Weight | weekly | 1 number |
| Workout sets | per set | 3 taps |
| Session RPE | per session | 1 slider |
| Optional: resting HR/HRV | daily | 1 number |

---

## 5. Calculations (transparent, unit-tested)

> Show formulas in an "How is this calculated?" sheet. Users trust what they can inspect.

### 5.1 Energy
- **BMR (Mifflin–St Jeor):** `10·kg + 6.25·cm − 5·age + 5` (male), `… − 161` (female). If sex not given, use the average of both.
- **TDEE** = BMR × activity multiplier (sedentary 1.2, light 1.375, moderate 1.55, very active 1.725, extra 1.9).
- **Goal calories:** fat loss = TDEE − ~10–20% (never below the safety floor, see 6.3); gain = TDEE + ~5–10%.

### 5.2 Macros (defaults, editable)
- Protein: roughly 1.6–2.2 g/kg for training users (lower, ~1.2–1.6, for general health goals)
- Fat: ~20–35% of calories (minimum ~0.6 g/kg)
- Carbs: remainder
- Fiber target ~14 g per 1000 kcal
- Water baseline ~30–35 ml/kg, plus training/heat adjustment

### 5.3 Training
- **Estimated 1RM (Epley):** `w × (1 + reps/30)` (use only for reps ≤ 10)
- **Volume** = Σ(weight × reps); **tonnage per muscle group** weekly
- **Session load** = session RPE (1–10) × duration (min)
- **Weekly load trend** = compare this week's load to the 4-week average; flag if > ~1.3–1.5× (heuristic; label as guidance)
- **Progressive overload rule:** if all sets hit top of rep range at RPE ≤ 8 → increase load by smallest plate increment.

### 5.4 Readiness score (0–100), explainable heuristic (v1)
Weighted blend with visible factors, e.g.: sleep 30%, soreness 20%, energy 15%, stress 10%, recent load vs baseline 15%, HRV/resting HR trend vs personal baseline 10% (if provided). Missing inputs → re-normalize weights and show "based on 4 of 6 signals." Output band: Good / Moderate / Low with a reason string. Mark clearly as an estimate, not a medical measure.

---

## 6. AI plan

### 6.1 AI features (ordered by value / simplicity)
| # | Feature | Input | Output | Phase |
|---|---------|-------|--------|-------|
| 1 | Coach chat with user context | question + summarized data | text + optional actions | P1 |
| 2 | Meal photo → items + grams | image | JSON items + confidence | P1 |
| 3 | Daily insight card | last 14 days summary | 1–2 sentences + action | P1 |
| 4 | Workout plan generator | profile, equipment, schedule | structured plan JSON | P2 |
| 5 | Nutrition suggestions / meal plan | macros left, restrictions | meal ideas JSON | P2 |
| 6 | Natural-language food/workout logging | text/voice | parsed log for review | P2 |
| 7 | Recovery advice | check-in + load | recommendation + reason | P2 |
| 8 | Weekly review | week summary | report | P2 |
| 9 | Form check/rep count (on-device) | camera landmarks | counts + cues | P3 |
| 10 | Adaptive plan (auto-adjust from adherence) | history | plan edits for approval | P3 |

### 6.2 AI design rules
1. **Rules first, AI second.** Numbers (calories, loads, readiness) come from deterministic code. AI explains, personalizes, parses.
2. **Structured output:** AI returns JSON validated against a schema; reject and retry on invalid.
3. **Context budget:** send *summaries* (last 14 days aggregates), not raw logs.
4. **Human-in-the-loop:** AI proposes changes; the user confirms before anything is saved or scheduled.
5. **Provider-agnostic gateway:** one `AIProvider` interface with adapters (Gemini, Groq, Ollama). Swap if a free tier changes.
6. **Server-side keys, rate limits, per-user quotas, caching** (identical image hash/prompt → cached).
7. **Transparency:** "AI estimate" badges; show confidence; show "why".
8. **Privacy:** strip EXIF, no PII in prompts (use internal IDs, not names/emails), explicit AI consent, option to delete chat history.

### 6.3 Safety guardrails (must-have)
- Medical red flags in chat (chest pain, fainting, severe pain, eating-disorder signs, self-harm, pregnancy complications) → stop coaching, show supportive message and advise professional/emergency help. Never diagnose or suggest medication.
- Calorie floor: never recommend below a safe minimum (set as a configurable floor tied to BMR, with an absolute hard minimum); cap weekly weight-loss rate suggestions (~0.5–1% body weight/week).
- Allergens: suggestions must exclude declared allergens, and the UI shows "check labels yourself."
- Minors: age gate; no weight-loss targeting for under-18 users.
- Wellbeing mode: hide calories/weights, no "good/bad food" language, no shame-based streak loss.
- Prompt-injection hygiene: user text and imported data are data, not instructions; AI actions need confirmation.

---

## 7. UI/UX plan

### 7.1 Information architecture
```
Overview  |  Training  |  Nutrition  |  Recovery  |  Coach AI  |  Progress  |  (Community P3)
Settings / Profile / Notifications
```
- **Desktop (≥1024 px):** left sidebar nav (as APEX mockup), main grid, right activity rail.
- **Tablet (600–1023 px):** collapsed icon sidebar, 2-column grid.
- **Mobile (<600 px):** bottom tab bar (Today / Train / Scan / Recover / Coach) with a central **Scan/Log** action, single column, bottom sheets for add/edit.

### 7.2 Key screens & flows
1. **Onboarding:** Welcome → Goal → Body → Activity → Training setup → Food prefs → Safety → Consents → Plan preview → Dashboard.
2. **Log a meal (photo):** Scan → (camera or gallery) → analyzing (skeleton + progress) → Review (items, grams, portion, confidence) → Save → dashboard updates with a short, non-blocking animation.
3. **Log a meal (search):** Search → select → portion → Save.
4. **Start workout:** Dashboard mission → Preview exercises → Start → Set logger + rest timer → Finish summary (PRs) → Optional RPE and notes → Save.
5. **Daily recovery check-in:** 3 sliders + sleep → readiness + suggestion.
6. **Ask AI:** Chat → answer with action chips → Confirm.
7. **Reminders:** Settings → toggle types → quiet hours → test notification.
8. **Weekly review:** auto-generated page + export.

### 7.3 Design system (merged from both mockups)
Use **CSS variables/design tokens** so both themes share components.

| Token group | Performance (dark) | Nourish (light) |
|-------------|-------------------|-----------------|
| Surface | Graphite `#0E1318`-ish layers | Warm off-white (not pure white) |
| Primary | Lime (CTA, active nav) | Plum (CTA) |
| Accent 1 | Cyan (speed/info) | Mint (success/progress) |
| Accent 2 | Orange (skill/PR/warning) | Coral (protein/alert) |
| Accent 3 | — | Citrus (carbs/streak) |
| Semantic | success, warning, danger, info (same meanings across themes) | |

Pick final hexes after contrast testing (WCAG AA: 4.5:1 text, 3:1 large text/UI). Macro colors must stay consistent app-wide (e.g., protein = same color everywhere).

**Typography:** one display font for headings + one UI sans (self-hosted for speed/privacy). Numbers use tabular figures.
**Components (build once, reuse):** Primary/secondary/ghost buttons, status chips (Ready/Recovery/PR), tab bar, stat card (compact), progress ring, macro bar, chart wrappers, toggle, list item with swipe actions, bottom sheet, dialog, toast, skeleton loaders, empty states, form fields with inline validation.
**Motion:** 120 ms feedback, gentle haptics (Vibration API where supported), respects `prefers-reduced-motion`, never blocks the next action (as in your motion system).

### 7.4 "Don't look vibecoded" checklist (from your image)
Your list had 30 items (items 9–12 are cut off in the screenshot, so check the full video for those). Mapping to rules for this app:

| Item | Our rule |
|------|----------|
| Harsh gradients, radial orbs, neon, rainbow, purple+black | Flat/subtle surfaces; one accent per role; **lime is an accent only, not a glow on everything**; no decorative orbs |
| Pure white background | Warm off-white in light theme |
| Lucide icons, sparkle icons, emojis | Use one cohesive icon set, consistent stroke; no sparkles for AI (use a neutral coach mark); no emoji as UI icons |
| Drop shadows, liquid glass, soft-radius everywhere | Use borders + elevation tokens sparingly; mix radius by component (cards vs chips vs inputs) |
| 3 feature cards in a row, bento grids, checkmark bullets, 3 pricing tiers | Dashboard layout driven by user data/priority, not template rows; no pricing page needed (free) |
| Terminal window, "it's not X, it's Y" copy, fake stats | Honest, specific microcopy; no fake numbers/testimonials |
| No real product demos | Landing page shows **real screens** from the working app |
| No skeleton loaders | Skeletons for every async region |
| No ToS / privacy policy | **Required** (health data). Link in footer + onboarding consent |
| Hover animations, animated arrows | Minimal; focus-visible states matter more than hover |
| Basic pastel colors | Tune palette for contrast and brand; avoid default pastel set |

> Note: the two mockups you added lean toward neon lime and soft pastels, so apply the table above when converting them to real tokens.

### 7.5 Copy & tone rules
- Supportive, specific, never judging ("You're 2 glasses from your goal").
- Missed items are neutral ("Missed", not "Failed").
- Streaks: allow **rest days and one "freeze"** so streaks don't punish recovery.
- No moralizing about food.

### 7.6 Accessibility
WCAG 2.2 AA: keyboard navigation, visible focus, labels, ARIA for charts (data table alternative), color is never the only signal, 44×44 px touch targets, screen reader announcements for timers/toasts, reduced motion, text scaling to 200%.

### 7.7 Responsive rules
Mobile-first CSS, container queries for cards, charts resize with ResizeObserver, no horizontal scroll, safe-area insets, landscape support for workout logger, test at 320, 375, 414, 768, 1024, 1280, 1536, 1920 px.

---

## 8. Reminder & notification plan

| Reminder | Trigger | Delivery |
|----------|---------|----------|
| Log breakfast/lunch/dinner | user meal times, only if not logged yet | Push / in-app |
| Drink water | interval during waking hours if behind pace | Push / in-app |
| Workout | planned session time − X min | Push / in-app / `.ics` |
| Recovery check-in | morning | Push / in-app |
| Weekly review | chosen day | Email / push |
| Re-engagement | after ≥ 5 days inactive, max 1 per week | Email only |

Rules: quiet hours, daily cap (e.g., max 5 pushes/day), snooze, one-tap "turn off this type," smart skipping (no water ping if logged 10 min ago), time-zone aware, ask permission **after** the user has seen value (contextual prompt), explain the iOS Home-Screen requirement.

---

## 9. Compliance & privacy checklist
- Terms of Service, Privacy Policy, AI-use disclosure, not-medical-advice notice
- Consent records with version/time; separate consent for health-flag data, AI processing, notifications
- Data minimization, encryption in transit and at rest, row-level access control (a user sees only their rows)
- Export (JSON/CSV) and full delete (including AI chat history, images)
- Do not store meal photos by default after analysis (or let user choose); strip EXIF
- Regional laws depending on users' location (e.g., GDPR, India's DPDP Act, CCPA): get legal review before public launch
- Age gate and minors policy
- Third-party processors list (AI provider, hosting) documented

---

## 10. Success metrics
- Time to log a meal ≤ 20 s (photo) / ≤ 10 s (repeat)
- Time to log a set ≤ 5 s
- Onboarding completion ≥ 70%
- Day-7 retention target (set after beta)
- Photo-estimate edit rate (how often users correct AI) and mean error vs. corrected value
- Reminder opt-out rate < 20%
- Lighthouse: Performance ≥ 90 (mobile), Accessibility ≥ 95

---

## 11. Roadmap with exit criteria (goal-driven)

| Phase | Scope | Exit criteria (verifiable) |
|-------|-------|---------------------------|
| **P0 Foundation (1–2 wks)** | Angular workspace, design tokens, Storybook, auth, DB schema, CI, PWA shell | CI green; login works; Lighthouse PWA pass; tokens documented |
| **P1 MVP (6–8 wks)** | Onboarding, dashboard, exercise library, live session logger, food search + photo scan (review flow), water, recovery check-in, readiness v1, AI chat v1, in-app reminders, settings, ToS/Privacy | All P1 test cases pass; E2E happy paths pass on Chrome/Safari/Firefox + mobile viewports; a11y audit has zero critical issues; AI safety tests pass |
| **P2 Smart (6–8 wks)** | Plan generator, meal plans, barcode, NL logging, web push, offline sync, weekly review, sport sessions, import/export | Push works on Android Chrome + desktop + iOS PWA; offline queue sync tested; plan generator schema-valid ≥ 99% |
| **P3 Advanced (open)** | Form check (MediaPipe), adaptive plans, on-device AI option, community, photo progress | Per-feature criteria |
| **P4 Native (optional)** | Capacitor wrapper for HealthKit/Health Connect, background reminders, BLE | Store review pass |

---

## 12. Risks
| Risk | Mitigation |
|------|-----------|
| Free AI tier limits/changes | Provider adapter, caching, graceful degradation (manual logging still works) |
| Photo calorie inaccuracy | Review step, DB-based nutrition, confidence + portion UI, honest labelling |
| iOS push limitations | PWA install guidance, email fallback |
| Health-data liability | Not-medical disclaimers, guardrails, consent, legal review |
| Scope creep | Phase gates; each feature needs a user story + test cases before building |
| Disordered-eating harm | Wellbeing mode, floors, neutral language, red-flag handling |
| Free backend pauses/limits | Keep portable schema (Postgres), documented migration path |
