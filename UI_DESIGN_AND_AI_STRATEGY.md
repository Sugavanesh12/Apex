# APEX — AI Strategy + Page-by-Page Design Spec

> Companion to `PRODUCT_PLAN.md` and `ARCHITECTURE_AND_TESTING.md`.
> Part A: how to introduce AI properly. Part B: gym logging UX. Part C: weekly AI message system. Part D: all page designs (wireframes). Part E: design tokens. Part F: external tools (updates the free-services table in the plan).

---

# PART A — How to introduce AI properly

## A1. Build our own AI, or use existing AI?

**Do not train your own model.** Training needs large datasets, GPUs, and ML engineering, and it would be worse than free hosted models for chat, vision and text. Instead, **build the parts that make the AI useful and safe, and rent the "brain".**

| Layer | Build or use? | What it is |
|-------|---------------|-----------|
| 1. **Rules engine** (calculators, overload, readiness, load, safety) | **Build** (plain TypeScript, tested) | The numbers. Deterministic. Never delegated to an LLM |
| 2. **User Brain** (memory/context of each user) | **Build** | Profile + computed stats + weekly summaries + learned habits. This is what makes AI "know" the user |
| 3. **Insight engine** (finds what matters this week) | **Build** | Ranks findings (e.g., "bench stalled 3 weeks") using rules |
| 4. **AI Gateway** (keys, quotas, schemas, safety, provider swap) | **Build** (thin serverless layer) | Control point for all AI calls |
| 5. **Language + vision model** (chat, writing insights, reading meal photos, parsing text) | **Use** a hosted free-tier LLM (Gemini / Groq), self-host Ollama for dev | Rented intelligence |
| 6. **Pose/rep counting** | **Use** MediaPipe (on-device) | Phase 3 |
| 7. **Personal adaptation** (learns your portions, typical weights, schedule) | **Build** with simple statistics, not ML training | e.g., "you usually eat 200 g rice" = median of your corrections |

Later, if you gather enough *corrected* data, you can train a small classifier (e.g., for your regional foods). That is optional and only after launch.

## A2. The golden rule: **rules compute, AI explains**

```
Raw logs ──► Rules engine ──► Findings (numbers, facts)
                                   │
                User Brain ────────┤
                                   ▼
                           AI model writes/explains/parses
                                   │
                           Validator (numbers match? safe? schema?)
                                   ▼
                          User sees message / plan / suggestion
```
- The AI never invents numbers. It receives facts like `{lift:"bench", stalled_weeks:3}` and writes the sentence.
- Output is validated: every number in the AI text must exist in the findings. If not, regenerate or fall back to a template.
- Every AI feature has a **non-AI fallback** (template text, manual entry) so the app works when the AI is down or rate-limited.

## A3. Introduce AI in 4 stages (don't ship everything at once)

| Stage | What | Needs LLM? | Exit check |
|-------|------|-----------|------------|
| **A. Smart rules** | Overload hints, readiness, protein-left suggestions, template weekly summary | No | Works with AI turned off |
| **B. AI narrates** | LLM rewrites findings into friendly daily/weekly messages; meal photo → items | Yes | Validator passes ≥ 99%; golden tests pass |
| **C. AI converses + acts** | Chat with the user's context; proposes actions (add workout, log water) with confirm | Yes | Safety tests AI-07…AI-12 pass |
| **D. AI adapts** | Plan auto-adjusts from adherence; personal portion learning; form check | Yes + ML | User-approved changes only |

## A4. The User Brain (how AI "knows" each person)

Four tiers, all stored in our database, all visible/editable by the user:

| Tier | Content | Updated | Example |
|------|---------|---------|---------|
| **1. Identity & goals** | Age band, goal(s), experience, sport, equipment, diet, allergies, injuries/limits, schedule, preferences (units, tone) | When user edits | "Goal: build strength. Cricket batter. Trains Mon/Wed/Fri. No knee-heavy lunges." |
| **2. Metrics (computed)** | Daily/weekly aggregates: sessions, volume per muscle, PRs, protein avg, water avg, sleep avg, readiness trend, adherence % | Nightly job | "Last 4 wks: 3.2 sessions/wk, protein avg 112 g (target 140)" |
| **3. Narrative memory** | AI-written 120-word summary of the past 4–8 weeks, rewritten weekly (fixed length so context never grows) | Weekly | "Consistent trainer, improving squat; struggles with Friday sessions and evening protein." |
| **4. Learned habits** | Simple stats | Nightly | "Skips lunch logging 60% of weekdays; prefers 6:30 am training; edits rice portion up by ~25 g" |

**Context pack** sent to the model per request (kept ≈ 1–1.5k tokens): Tier 1 + latest Tier 2 numbers + Tier 3 narrative + only the data relevant to the question (e.g., last 3 bench sessions if asked about bench). No name/email; use internal user id.

**User control (trust feature):** Settings → **"What your coach knows about you"** page: shows tiers 1, 3, 4 in plain language; user can edit, correct ("I don't have a knee problem anymore") or delete any item, or reset the coach memory entirely.

**Cold start (new user):** Coach says what it knows (from onboarding), asks at most 1–2 questions, and uses template insights until ≥ 7 days of data exist. No fake personalization.

## A5. Making it work for **all** users (not only weight loss)

Goal is a first-class setting that changes dashboard, targets, language, scoring, and AI focus.

| Goal / user type | Primary dashboard metrics | AI coaching focus | Notes |
|------------------|--------------------------|-------------------|-------|
| Build muscle | Weekly volume per muscle, protein, progressive overload | Overload, balance push/pull, protein | Calorie surplus optional |
| Lose fat | Calorie trend, protein, steps/activity, adherence | Sustainable deficit, protein, no crash diets | Safety floors, wellbeing mode |
| Get stronger | Estimated 1RM, PRs, recovery | Load progression, deloads | |
| Sport performance (cricket, football, running…) | Skill sessions, speed/power tests, load vs readiness | Peaking, injury-risk load, recovery | Sport profile with custom metrics |
| Endurance | Weekly distance/time, zone time (manual), long-run progression | Gradual build, rest | |
| General health / habit | Active days, water, sleep, steady routines | Small wins, consistency | Gentle tone |
| Mobility / flexibility | Mobility minutes, streak, soreness trend | Routines, form | |
| Return after break / injury | Pain-free sessions, gradual load | Conservative progression; "check with a professional" | Requires safety screen |
| Older adults / beginners | Balance, strength basics, consistency | Safe, simple routines | Larger text option |
| Maintain | Stability metrics | Keep routine, prevent drift | |
| Pregnancy/postpartum (opt-in) | Gentle activity, hydration | "Follow your clinician's guidance" first | No weight-loss messaging |

Design implications:
- **Goal-driven widgets:** dashboard cards are chosen/ordered by goal (a lifter sees volume and PRs; a general-health user sees active days and water). Users can pin/hide any card.
- **Body-neutral mode:** hides weight and calorie numbers; goals expressed as habits and performance.
- **Neutral, inclusive language:** no gendered defaults; "sex for calculations" optional; no "bikini body"-type copy; no moral language about food.
- **Multiple goals** allowed (e.g., strength + health); AI weights advice by the primary goal.
- **Accessibility options:** large text, high contrast, reduced motion, simple mode.

---

# PART B — Gym logging: tap the exercise image, log sets fast

## B1. Flow
```
Start session ─► Exercise list (image cards)
                    │ tap image
                    ▼
        Exercise logging sheet (full screen on mobile / side panel on desktop)
                    │ log sets (≤ 3 taps each)
                    ▼
        Back to list (card shows ✓ 3/4 sets) ─► next exercise ─► Finish ─► Summary
```

## B2. Design goals (measurable)
| Goal | Target |
|------|--------|
| Taps to log a repeat set (same as last) | **1 tap** (complete ✓) |
| Taps to log a changed set | 2–4 (adjust stepper/keypad, then ✓) |
| Time to log a set | ≤ 5 s |
| Works one-handed, sweaty hands, glare | Large targets (≥ 48 px), high contrast gym mode |
| Offline | Yes, queued and synced |

## B3. Exercise list screen (inside a session)
```
┌───────────────────────────────────────────┐
│ ←  Lower Body Power        00:41:12   ⋯   │
│ ───────────────────────────────────────── │
│ ┌──────┐  Back Squat                       │
│ │ IMG  │  Last: 120×5 · Target 4×5   ✓2/4 │
│ └──────┘  ▓▓▓▓░░░░                        │
│ ┌──────┐  Romanian Deadlift                │
│ │ IMG  │  Last: 80×8 · Target 3×8    0/3  │
│ └──────┘                                   │
│ ┌──────┐  Box Jump                         │
│ │ IMG  │  Last: 12 reps · Target 3×6 0/3  │
│ └──────┘                                   │
│  [ + Add exercise ]    [ Finish session ]  │
└───────────────────────────────────────────┘
 Rest timer chip floats bottom-right when running: ⏱ 01:12
```
- Card = exercise image (from library), name, last performance, target, progress bar.
- Tap anywhere on image/card → logging sheet. Long-press/drag handle → reorder. Swipe → swap/skip/delete.

## B4. Exercise logging sheet
```
┌───────────────────────────────────────────┐
│ ▼  Back Squat                    ⓘ  ⋯     │
│ ┌─────────────────────────────┐            │
│ │   [exercise image / short   │  Last time │
│ │    looping demo]            │  120×5,5,5 │
│ └─────────────────────────────┘  PR 130 kg │
│                                            │
│  SET   KG          REPS        RPE   ✓     │
│  W     60  [-][+]   8  [-][+]   –    ☑     │  ← warm-up
│  1    120  [-][+]   5  [-][+]   7    ☑     │  ← done
│  2    120  [-][+]   5  [-][+]   ·    ☐     │  ← ghost values from last time
│  3    120  [-][+]   5  [-][+]   ·    ☐     │
│  [ + Add set ]   [ Same as last ]          │
│                                            │
│  Notes ▸       Plate calc ▸    Swap ▸      │
│ ┌────────────────────────────────────────┐ │
│ │  ✓  Complete set 2  (starts 2:00 rest) │ │  ← big primary button
│ └────────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```
**Behavior rules**
1. Each new set is **pre-filled** with last session's values (shown as ghost text) or the previous set's values in this session. Pressing ✓ accepts them → *1 tap*.
2. **Steppers** change weight by the user's increment (default 2.5 kg / 5 lb; per-exercise setting) and reps by 1. Long-press repeats. Tap the number → numeric keypad (`inputmode="decimal"`).
3. **RPE** optional: tapping the RPE cell opens 6–10 chips (one tap).
4. ✓ marks set complete, auto-starts **rest timer** (default per exercise), vibrates when done (if supported), never blocks the next action.
5. **PR detection** on ✓: confetti-free, calm badge "New PR · est. 1RM 142 kg".
6. **Undo** toast (5 s) after complete/delete.
7. **Set types:** warm-up, working, drop set, failure, AMRAP (tag chips). **Exercise types** change columns: strength (kg×reps), bodyweight (reps, +added kg), timed (seconds), distance (km/m + time), cardio (min + intensity), mobility (hold seconds). This keeps it useful for all users, not only lifters.
8. **Superset/circuit** mode groups exercises and rotates the sheet.
9. Auto-save on every change (offline-first), so refresh or battery death loses nothing.
10. Data per set: `weight, reps, rpe, duration, distance, set_type, is_pr, timestamp, rest_taken, note`.

## B5. After the session
Summary page (see D-Training-6) stores everything: it feeds progress charts, PR history, weekly load, the User Brain metrics, and the weekly AI message.

---

# PART C — Weekly AI message (banner at the top)

## C1. Pipeline
```
Weekly scheduler (user's day/time, local time zone; default Sunday 6 pm)
   → compute weekly metrics vs previous 4 weeks
   → insight rules produce candidate Findings (win / focus / risk), each with score
   → pick top 1 win + top 1–2 improvement areas + 1 next-step
   → LLM writes message from Findings ONLY (+ user's tone preference)
   → validator: numbers match, no banned language, safe, length OK (else template fallback)
   → store `weekly_insights` row
   → deliver: in-app top banner + notification center + Web Push (if allowed) + optional email
   → tap opens Weekly Review page
```

### Candidate insight rules (examples)
| Rule | Finding |
|------|---------|
| Sessions < plan for 2 weeks | Consistency drop; suggest shorter sessions or reschedule |
| Lift stalled ≥ 3 sessions | Suggest deload/rep-range change |
| Weekly sets per muscle < threshold | Under-trained muscle group |
| Push:pull imbalance | Add rowing/pulling work |
| Protein avg < target on ≥ 4 days | Protein shortfall; suggest meal ideas |
| Water below goal ≥ 4 days | Hydration nudge |
| Sleep avg < personal baseline − 1 h | Recovery priority |
| Load spike > ~1.5× 4-week avg | Injury-risk caution |
| New PR(s) | Celebrate (always include a win if any exists) |
| Logging gaps | Gentle prompt to log (never shame) |
| Goal-specific (sport: skill sessions; endurance: weekly distance) | Per goal table in A5 |

## C2. Message format (short, scannable)
**Banner (collapsed):** one line headline + chevron.
**Expanded / push body:** headline, 3 lines (Win · Focus · Next step), one button.

Example:
```
Your week in review
✓ Win:   Squat up to 125 kg × 5 (+5 kg).
→ Focus: Protein averaged 112 g vs your 140 g target.
◎ Next:  Add a protein snack after Friday's session.
[ Open weekly review ]   [ Later ]
```
Limits: push title ≤ 40 chars, body ≤ 120 chars (short, since OS truncates), in-app expanded ≤ 400 chars. Plain language, no jargon, no shaming, one primary action.

## C3. Banner behavior (top of app)
- Sits under the top bar, above page content, on all main pages; **one banner at a time** by priority: safety > weekly review > PR/achievement > daily tip > feature tip.
- States: collapsed (default), expanded, dismissed (swipe/X → moves to Notification Center, not lost), read.
- Does not cover content (pushes layout down, no overlay); respects `prefers-reduced-motion`.
- Also appears as a badge on the bell icon, and in the **Notification Center** (inbox list with filters: AI insights, reminders, achievements).
- Works offline (cached last insight); push is a bonus, since iOS requires Home-Screen install.

```
┌────────────────────────────────────────────────────┐
│ ◉ Your week in review: 1 win, 1 thing to improve  ⌄ │  ← banner (collapsed)
├────────────────────────────────────────────────────┤
│ Overview …                                          │
```

## C4. Weekly Review page
Sections: Week summary numbers (sessions, volume, active minutes, protein/water avg, sleep avg, readiness trend) → **Win** → **Focus** (with a "why" explanation and the numbers behind it) → **Next week plan** (one-tap "Add to my plan / Set reminder") → Ask coach about this (chat prefilled) → Feedback buttons (Helpful / Not helpful / Wrong) which tune future insights.

## C5. Guardrails
Always uses facts from findings; no medical claims; no weight-shaming; wellbeing mode hides numbers; skips weeks with too little data (sends an encouraging "log a few days and I'll have more for you" message instead).

---

# PART D — Page designs

**Global layout**
- **Mobile (< 600 px):** top bar (logo, bell, avatar) → banner slot → content → bottom tab bar: **Today · Train · (＋ Log) · Recover · Coach**. Center ＋ opens quick-log sheet (Scan meal, Log water, Start workout, Check-in, Weight).
- **Tablet:** icon-only sidebar, 2-column content.
- **Desktop (≥ 1024):** left sidebar (Overview, Training, Nutrition, Recovery, Coach AI, Progress, Community*, Settings), top bar (date, search, bell, status chip), banner slot, main grid, optional right rail (Activity).
- Every page has: loading skeleton, empty state, error state with retry, offline indicator.

## D0. Public & Account
### D0-1 Landing page
```
[Logo]                         Features  How it works  Privacy   [Log in] [Get started]
─────────────────────────────────────────────────────────────────────────
H1: Train, eat and recover with a coach that knows you.
Sub: Log workouts in seconds. Understand your body. Weekly guidance, in plain language.
[ Get started free ]  [ See how it works ]            [REAL app screenshot / short screen capture]
─────────────────────────────────────────────────────────────────────────
How it works (4 steps with real screens: Set goal → Log → Understand → Improve weekly)
Built for: strength · sport · fat loss · general health · mobility (tabs change screenshots)
Privacy & safety block (what we store, AI disclosure, export/delete, not-medical notice)
Footer: Terms · Privacy · Contact
```
Rules: real product screens only (no fake stats/testimonials), no pricing section (free).

### D0-2 Register / Login / Reset
Single centered card (mobile full screen): email, password (show/hide), social login button(s) if enabled, link to Terms/Privacy, errors inline, "Forgot password". Register adds DOB (age gate) and ToS/Privacy checkbox.

## D1. Onboarding (wizard, progress bar, back/skip where allowed, auto-save)
1. **Welcome:** what to expect (2 min), "Skip optional questions anytime".
2. **Goal:** large selectable cards (all goals from A5; multi-select; one marked primary).
3. **About you:** name, DOB (already), sex-for-calculations (optional, "prefer not to say"), height, weight, units toggle, **why we ask** helper text.
4. **Activity & experience:** daily activity level (illustrated options), training experience, current routine.
5. **Training setup:** days/week (day chips), session length slider, equipment chips, preferred styles, sport + role (if any).
6. **Food setup:** diet type, allergies (chips, prominent), dislikes, meals/day, calories visibility toggle ("Show calorie numbers / Focus on habits instead").
7. **Safety check:** short readiness questions, injuries/limits (optional, body-part chips), disordered-eating sensitivity option (private, optional), note "not medical advice".
8. **Reminders:** choose reminder types, times, quiet hours (permission requested later in context).
9. **Consents:** ToS, Privacy, AI processing (explained), health-info handling (separate toggle), notifications.
10. **Your starting plan:** shows computed targets with "How is this calculated?" and an AI-generated first week (editable) → **Go to dashboard**.

## D2. Overview (Home / Today)
Mobile:
```
┌──────────────────────────────────────┐
│ ☰ Logo               🔔(1)   (A)      │
│ [Banner: Your week in review …    ⌄] │
│ Good morning, Alex                    │
│ Wed, 15 Oct · Readiness 86 · Ready    │
│ ┌──────────────────────────────────┐ │
│ │ TODAY'S SESSION                   │ │
│ │ Lower-body power · 68 min · High  │ │
│ │ [ Start session  → ]              │ │
│ └──────────────────────────────────┘ │
│ ┌──── Fuel ─────┐ ┌─── Water ──────┐ │
│ │ 1,240/2,000   │ │ 5/8 glasses    │ │
│ │ P 68/110      │ │ [ + glass ]    │ │
│ │ [ Scan meal ] │ │                │ │
│ └───────────────┘ └────────────────┘ │
│ Recovery: Sleep 7h42 · HRV +8%  [Check-in] │
│ Coach: "Add 2 explosive sets today." [View] [Dismiss] │
│ Training load (week chart)            │
│ Up next · Activity feed               │
└──────────────────────────────────────┘
```
Desktop: follow the APEX mockup: hero "Today's mission" card spanning top; 3-column grid (Readiness | Training load | Live stats) → (Fuel | Up next | Coach AI); right rail = Activity. Cards reorder by goal (A5); "Customize" mode lets users pin/hide cards.

## D3. Training
### D3-1 Training hub
Tabs: **Plan · Library · History · Sport**. Plan tab: this week's schedule (day chips with session names/status), Start/Resume, "Generate/adjust with AI". Quick actions: Start empty workout, Repeat last session, Mobility 10 min.

### D3-2 Exercise library
Search bar + filter chips (muscle, equipment, difficulty, type). Grid of **image cards** (image, name, muscle, equipment). Favorite ♥, "Add to session/plan". Custom exercise button (upload own photo optional).
### D3-3 Exercise detail
Image/demo, muscles worked (diagram), steps, common mistakes, variations/alternatives (for injuries or no equipment), **your history** (best set, 1RM trend chart, last 5 sessions), "Add to today".
### D3-4 Plan builder / AI plan
Left: weekly calendar with sessions; right: session editor (drag exercises, sets × rep range, rest). **AI panel:** "Generate plan" with inputs prefilled from profile → preview diff → Accept/Edit. Shows why ("Added rows to balance pushing").
### D3-5 Live session
= Part B screens (exercise list + logging sheet), with sticky header (timer, finish), floating rest timer, Wake Lock indicator.
### D3-6 Session summary
Duration, total volume, sets, PRs (badges), muscles worked (body map), session RPE slider, mood/energy chips, notes, "What went well / what to adjust" (AI, short), **Save** → returns to Overview. Edit/delete past session allowed.
### D3-7 History & detail
Calendar/heat-map of sessions + list; tap for full detail and edit.
### D3-8 Sport session log (cricket/running/etc.)
Pick sport template → fields: type (practice/match/drill), duration, intensity (RPE), key metrics (custom per sport, e.g., sprint time, batting avg), notes. Same layout components as gym logging.

## D4. Nutrition
### D4-1 Today
Calorie ring (or habit view in body-neutral mode), macro bars, water glasses, meal list (breakfast/lunch/snack/dinner) with kcal and image thumbnails, **Scan meal** primary button, "Repeat yesterday", date switcher.
### D4-2 Add food sheet
Four big options: **Scan meal photo · Search · Barcode · Quick add**; recents and favorites list below.
### D4-3 Scan meal
Full-screen camera with frame guide and tips ("good light, whole plate"), shutter, **Choose from gallery** (always visible), switch camera, torch if supported, privacy note ("Your photos stay private"). If camera permission denied → gallery picker screen with explanation.
### D4-4 Analyzing
Photo preview with skeleton shimmer and cancel; text "Estimating…" (no spinner-only).
### D4-5 Review meal (core trust screen)
```
┌─────────────────────────────────────┐
│ ←  Chicken rice bowl                 │
│ [photo]  AI estimate · review before saving │
│          620 kcal                    │
│ [P 38g] [C 72g] [F 18g] [Fiber 8g]   │
│ Ingredients            High confidence│
│  Chicken      150 g   [Edit]          │
│  Rice         175 g   [Edit]          │
│  Avocado       70 g   [Edit] ⚠ low conf │
│  + Add ingredient                     │
│ Portion  [ 1 bowl (425 g) ▾ ]         │
│ [ Save meal ]   [ Retake ]            │
└─────────────────────────────────────┘
```
Edits recalc instantly; low-confidence items flagged; "Wrong food?" opens search replace.
### D4-6 Search & food detail
Search results (USDA/OFF/custom/my foods), serving options, grams input, macros preview, add to meal.
### D4-7 Meal plan / suggestions
"What should I eat next?" card (macros left → 3 ideas with kcal/protein), weekly meal plan (AI-generated, respects allergies), grocery list export. Allergy notice always visible.
### D4-8 Water
Quick glass buttons, custom amount, daily chart, reminder shortcut.

## D5. Recovery
### D5-1 Recovery home
Readiness ring + **"Why this score"** factor list (sleep, soreness, energy, stress, load), recommendation (Train as planned / Lighten / Mobility / Rest), trend chart (14 days).
### D5-2 Daily check-in (30 s)
Sleep hours + quality, soreness body map (tap areas), energy/stress/mood sliders, optional resting HR/HRV, pain flag ("sharp pain? tell us"). Result screen shows readiness + suggestion.
### D5-3 Recovery toolkit
Stretching/mobility routines by area (with images and timers), breathing exercises, sleep tips, deload guidance.

## D6. Coach AI
Chat layout: message list, composer (text, voice P3, image attach for meals), suggested prompt chips ("Plan tomorrow", "Why am I tired?", "High-protein dinner"), **action cards** inside replies (e.g., "Add this workout to Thursday" [Confirm]). Header shows "AI guidance supports your training. Not medical advice." and a **"What I know about you"** link. Thumbs up/down on each answer. Desktop: chat with a right panel showing referenced data (e.g., the bench chart used in the answer).

## D7. Progress & Insights
Segmented **Week / Month / Year**. Tabs: Overview · Strength · Body · Nutrition · Habits. Charts with table alternatives; PR list; muscle-volume heatmap; body metrics (hidden in body-neutral mode); consistency calendar; **Export summary** (PDF/CSV). **Weekly Review** archive list (C4).

## D8. Notification Center
Bell opens panel (desktop) or page (mobile): filter chips (All · AI insights · Reminders · Achievements), items with timestamp, unread dot, swipe to dismiss, "Mark all read", link to settings.

## D9. Settings
- **Profile & goals** (edit anything from onboarding)
- **What your coach knows about you** (view/edit/delete memory; reset)
- **Training preferences** (increments, rest defaults, units, equipment)
- **Nutrition preferences** (diet, allergies, calorie visibility)
- **Notifications** (types, times, quiet hours, weekly review day/time, push/email toggles, iOS install hint, test button)
- **Appearance** (dark/light/system, text size, reduced motion, high contrast, gym mode)
- **Privacy & data** (consents, AI data use, export, delete account)
- **Connected data** (file imports: CSV/GPX/Apple Health export)
- **About / Legal** (Terms, Privacy, version)

## D10. Legal pages
Terms, Privacy Policy, AI-use disclosure, medical disclaimer, cookie/storage notice. Plain language, versioned, linked from footer, onboarding and settings.

## D11. System states (design each once, reuse everywhere)
Skeleton loaders • empty states (illustration-free, helpful text + one action) • error with retry • offline banner ("Saved on this device, will sync") • update available toast • permission-denied guides (camera, notifications) • 404 • maintenance • session-expired.

---

# PART E — Design tokens (starting values; verify contrast before locking)

| Token | Dark "Performance" | Light "Nourish" |
|-------|--------------------|-----------------|
| `--bg` | `#0F1419` | `#FAF6F1` (warm off-white, not pure white) |
| `--surface` | `#161D24` | `#FFFFFF` (cards only) |
| `--surface-2` | `#1E2730` | `#F3ECE4` |
| `--border` | `#2A3540` | `#E6DDD2` |
| `--text` | `#E8EDF2` | `#2A1F2D` |
| `--text-muted` | `#9AA7B4` | `#6B5F6E` |
| `--primary` | Lime `#B8F23C` (text on it `#0F1419`) | Plum `#5B2A4E` (text on it `#FFFFFF`) |
| `--accent-1` | Cyan `#2CD4E8` | Mint `#8FD9B0` (fills only, not text) |
| `--accent-2` | Orange `#FF9F43` | Coral `#F08A7A` |
| `--accent-3` | — | Citrus `#F2D15C` |
| Semantic | success / warning / danger / info — same meaning in both themes | |
| Radius | inputs 10 · cards 16 · chips 999 · sheets 24 top | |
| Spacing | 4-pt scale (4, 8, 12, 16, 24, 32, 48) | |
| Type | Display: Archivo (athletic, variable width) · UI: Inter · numerals tabular | |
| Motion | 120 ms feedback, 200–300 ms transitions, reduced-motion respected | |
| Breakpoints | 600 / 1024 / 1440 | |

**Macro colors (consistent everywhere):** Protein = coral/orange, Carbs = citrus/cyan, Fat = mint/lime (pick one mapping and never change it).
Lime is an *accent for CTAs and active states*, not a glow on everything. No decorative gradients/orbs (see anti-vibecoded checklist in the plan, 7.4).

---

# PART F — External tools & services (update to the plan's free-services list)

| Purpose | Tool | Cost | Notes |
|---------|------|------|-------|
| LLM chat + insight writing + vision | Gemini API (free tier) — primary; Groq (free tier) — text fallback | Free tier, limited | Keep behind `AIProvider` adapter; check current limits/terms |
| Local AI for development | Ollama | Free/open | Dev & tests without quota |
| Optional on-device AI (offline/private) | Transformers.js / WebLLM | Free/open | Phase 3; large downloads |
| Vector search for coach knowledge (optional) | Supabase `pgvector` + free embeddings | Free tier | Only if we add a curated knowledge base; not needed for MVP |
| Backend, auth, DB, cron, functions | Supabase (or Firebase) | Free tier | RLS on all tables |
| Web push | Browser Push API + VAPID via `web-push` library | Free | iOS needs Home-Screen install |
| Email (weekly digest fallback) | Resend or Brevo free tier | Free tier | Verify limits |
| Food data | USDA FoodData Central, Open Food Facts | Free | Cache responses; respect licenses/attribution |
| Exercise data + images | free-exercise-db (open dataset), wger | Free/open | Check each image license & attribution |
| Weather (outdoor advice) | Open-Meteo | Free (non-commercial) | |
| Barcode | ZXing-js (`@zxing/browser`) | Free/open | |
| Pose estimation | MediaPipe Tasks Vision | Free/open | Phase 3 |
| Offline storage | Dexie.js (IndexedDB wrapper) | Free/open | Sync queue |
| Charts | ngx-echarts (Apache ECharts) or Chart.js | Free/open | |
| Validation | zod | Free/open | Shared schemas |
| Dates | date-fns | Free/open | tz handling |
| Icons | Tabler Icons / Phosphor / Material Symbols | Free/open | One consistent set; avoid default-looking packs |
| Fonts | Archivo, Inter (self-hosted) | Free/open | |
| Design/wireframes | Figma (free tier) or Penpot (open source); Excalidraw for quick sketches | Free | Export tokens to CSS variables |
| Component workshop | Storybook | Free/open | Visual tests |
| Testing | Vitest/Jest, Angular Testing Library, Playwright, axe-core, Lighthouse CI, MSW | Free/open | |
| CI/CD & hosting | GitHub Actions + Cloudflare Pages/Netlify/Firebase Hosting | Free tier | |
| Monitoring | Sentry free tier or GlitchTip | Free tier | |

**Not used:** Kendo UI (licensed). **Avoid:** Google Fit API (being retired), paid food-recognition APIs, any SDK that sends photos to unknown third parties.

---

## Next steps (suggested)
1. Approve the page list in Part D (add/remove pages).
2. Build the `domain/` rules + Insight engine with tests first (Stage A works without AI).
3. Build the exercise-card → logging-sheet flow (Part B) as the first interactive prototype; measure "taps per set".
4. Add the AI gateway, meal-photo analysis, weekly message pipeline (Stages B–C).
5. Turn the wireframes above into high-fidelity screens in Figma/Penpot using the tokens in Part E.
