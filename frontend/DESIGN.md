# QuestSage Design System & Visual Direction: "The Guild Chronicler"

## 1. Design Read

**An illuminated tactical quest parchment meets a precision fantasy RPG HUD: deep forest-ink canvas, forged brass framing, and a locked ember-orange hearth accent for active momentum.**

---

## 2. Surface Mode & The Three Dials

* **Surface Mode**: **`OPERATE`** (High-signal productivity ledger and tactical execution HUD, with **`READ`** sanctuary mode for `/chat` goal synthesis at 65–75ch line lengths).
* **Three Dials**:
  * **VARIANCE**: `6 / 10` — Distinctive tactile RPG physical framing (brass hairline borders, rarity stamps, engraved headers) paired with disciplined, alignment-locked tabular layouts.
  * **MOTION**: `3 / 10` — Snappy, mechanical micro-interactions strictly under 250ms. Zero endless floating particles, zero pulsing breathing glows, zero bounce loops.
  * **DENSITY**: `7 / 10` — Compact tactical ledger. Tabular XP metrics, time-budget tags, multi-segment subtask rails, and structured status ledgers.

---

## 3. Brand Identity Rationale & Distinction

Within the unified project ecosystem, QuestSage holds a distinct, unmistakable identity:
* *Portfolio*: Carbon and technical paper instrument editorial (monochrome, cyan hairline, scientific precision).
* *WHOT*: Lagos street night gaming (high-voltage neon green and yellow, kinetic arcade action).
* *ZCover / Ziqura*: Calm trust insurance (clinical medical navy, sage teal, high-legibility clarity).
* *PDM*: Industrial telemetry control room (heavy machinery dark, CRT phosphor amber, mono-dense).
* **QuestSage ("The Guild Chronicler")**: A heroic yet grounded personal operating system. It rejects the cartoonish purple/indigo gradient Habitica/Notion clichés in favor of deep evergreen forest-ink, forged brass architectural rules, illuminated manuscript vellum tones, and a locked ember-orange hearth accent that represents the spark of personal drive.

---

## 4. Semantic Design Token System

All neutral surfaces and borders are tinted toward the evergreen forest-ink hue with an OKLCH chroma of `0.012–0.025` to eradicate sterile pure-gray (`#000000`, `#808080`) deadness. The primary accent is locked to Hot Ember Orange at `~74%` saturation (`< 80%` saturation cap).

### CSS Custom Properties (`:root` Dark Mode by Default, `[data-theme="light"]` Manuscript Mode)

```css
:root {
  /* ==========================================================================
     CORE COLOR PALETTE: Dark Mode ("Forest Ink & Ember Hearth") - Default
     ========================================================================== */
  
  /* Canvas & Surface Hierarchy (OKLCH Tinted Evergreen Neutrals) */
  --bg-canvas: oklch(0.16 0.018 155);        /* #0D1914 - Deep Forest Ink */
  --bg-surface: oklch(0.20 0.022 152);       /* #13231C - Dark Evergreen Ledger */
  --bg-elevated: oklch(0.24 0.025 150);      /* #192E25 - Raised Quest Card */
  --bg-overlay: oklch(0.14 0.015 155 / 0.88);/* Modal backdrop scrim */
  --bg-subtle: oklch(0.22 0.020 152);        /* Table header & slot backing */

  /* Hairlines & Engraved Framing */
  --border-subtle: oklch(0.28 0.022 150 / 0.45); /* 1px structural separator */
  --border-strong: oklch(0.38 0.035 145 / 0.65); /* Card boundary */
  --border-brass: oklch(0.68 0.11 85 / 0.55);    /* Forged antique brass accent line */
  --border-brass-solid: oklch(0.68 0.11 85);     /* Solid brass milestone seal */

  /* Typography Hierarchy */
  --text-primary: oklch(0.93 0.015 90);      /* #EFECE4 - Illuminated Vellum */
  --text-secondary: oklch(0.76 0.020 140);   /* #A6B8AD - Sage Mist */
  --text-muted: oklch(0.55 0.020 145);       /* #6B7F74 - Shadowed Moss */
  --text-inverse: oklch(0.16 0.018 155);     /* Deep Forest Ink on light chips */

  /* Single Locked Primary Accent (<80% Saturation) */
  --accent-primary: oklch(0.58 0.18 42);     /* #D9531E - Hot Ember Orange */
  --accent-hover: oklch(0.52 0.19 40);       /* #C04515 - Deepened Hearth */
  --accent-muted: oklch(0.58 0.18 42 / 0.18);/* Tinted ember badge background */
  --accent-foreground: oklch(0.98 0.01 85);  /* White-gold button text */

  /* Secondary Brass / Gold Guild Accents */
  --brass-primary: oklch(0.68 0.12 85);      /* #C29B38 - Forged Guild Brass */
  --brass-hover: oklch(0.62 0.13 83);        /* #AB8426 */
  --brass-muted: oklch(0.68 0.12 85 / 0.16); /* Brass badge backing */

  /* Semantic State Tokens */
  --status-success: oklch(0.62 0.14 145);    /* #2E8B57 - Verdant Victory */
  --status-success-muted: oklch(0.62 0.14 145 / 0.16);
  --status-warning: oklch(0.72 0.13 85);     /* #C68A1A - Brass Caution */
  --status-warning-muted: oklch(0.72 0.13 85 / 0.16);
  --status-danger: oklch(0.55 0.18 28);      /* #C73523 - Crimson Hazard */
  --status-danger-muted: oklch(0.55 0.18 28 / 0.16);
  --status-info: oklch(0.62 0.09 200);       /* #3A7D8C - Scholar's Blue */
  --status-info-muted: oklch(0.62 0.09 200 / 0.16);

  /* Tactical Rarity Tiers */
  --rarity-common: oklch(0.65 0.02 145);     /* Weathered Iron */
  --rarity-heroic: oklch(0.68 0.12 85);      /* Forged Brass */
  --rarity-legendary: oklch(0.58 0.18 42);   /* Ember Flame */

  /* Layout, Radii & Depth */
  --radius-xs: 0.125rem;  /* 2px - Crisp tactical tags */
  --radius-sm: 0.25rem;   /* 4px - Inputs & subtask rows */
  --radius-md: 0.375rem;  /* 6px - Quest cards & modals */
  --radius-lg: 0.5rem;    /* 8px - Container shells */
  --radius-full: 9999px;  /* Segmented pill rails only */

  /* Elevation Shadows (Zero Neon Glow, Optical Grounding Only) */
  --shadow-sm: 0 1px 2px oklch(0.08 0.01 155 / 0.35);
  --shadow-md: 0 4px 12px oklch(0.08 0.01 155 / 0.45);
  --shadow-lg: 0 12px 32px oklch(0.08 0.01 155 / 0.65);

  /* Motion & Easing Curves */
  --ease-out-quart: cubic-bezier(0.23, 1, 0.32, 1);
  --duration-fast: 150ms;
  --duration-normal: 220ms;
}

/* Light Theme: "Manuscript Scribe Mode" */
[data-theme="light"] {
  --bg-canvas: oklch(0.96 0.012 90);         /* #F5F2EB - Aged Manuscript Vellum */
  --bg-surface: oklch(0.98 0.008 85);        /* #FAF8F3 - Scribe Parchment */
  --bg-elevated: oklch(0.92 0.015 88);       /* #ECE7DC - Indented Ledger Rail */
  --bg-overlay: oklch(0.20 0.015 90 / 0.45);
  --bg-subtle: oklch(0.94 0.012 88);

  --border-subtle: oklch(0.85 0.018 90 / 0.7);
  --border-strong: oklch(0.70 0.025 85 / 0.8);
  --border-brass: oklch(0.58 0.10 80);
  --border-brass-solid: oklch(0.55 0.11 78);

  --text-primary: oklch(0.20 0.022 152);     /* #13231C - Deep Forest Gall Ink */
  --text-secondary: oklch(0.42 0.025 150);   /* #4A5F54 - Muted Scribe Tone */
  --text-muted: oklch(0.58 0.020 145);       /* #708479 - Marginalia */
  --text-inverse: oklch(0.98 0.008 85);

  --accent-primary: oklch(0.54 0.18 42);     /* #C94614 - Sealing Wax Red-Orange */
  --accent-hover: oklch(0.48 0.19 40);
  --accent-muted: oklch(0.54 0.18 42 / 0.12);
  --accent-foreground: oklch(0.98 0.01 85);

  --brass-primary: oklch(0.55 0.11 78);
  --brass-hover: oklch(0.48 0.11 76);
  --brass-muted: oklch(0.55 0.11 78 / 0.12);

  --status-success: oklch(0.52 0.13 145);
  --status-warning: oklch(0.62 0.12 85);
  --status-danger: oklch(0.50 0.17 28);
  --status-info: oklch(0.52 0.09 200);

  --shadow-sm: 0 1px 2px oklch(0.30 0.02 90 / 0.08);
  --shadow-md: 0 4px 12px oklch(0.30 0.02 90 / 0.12);
  --shadow-lg: 0 12px 32px oklch(0.30 0.02 90 / 0.16);
}
```

---

## 5. Typography Roles & Exact Font Families

Three dedicated typographic roles eliminate the generic single-sans monoculture:

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  /* Display / Heroic Headings: Engraved architectural broadsheet authority */
  --font-display: 'Cinzel', serif;
  
  /* Body / UI Controls: Crisp, modern humanist legibility */
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Tactical Data / HUD / XP Numbers: Fixed-width telemetry */
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Typographic Application Rules
1. **Headings (`h1`, `h2`, `h3`, Quest Titles, Modal Headers)**: Render in `var(--font-display)` (`Cinzel`), semi-bold or bold, with tight tracking (`letter-spacing: 0.02em; text-transform: uppercase;`). Line-height locked to `1.15–1.25`.
2. **Body Prose, Input Fields, Subtask Titles**: Render in `var(--font-body)` (`Plus Jakarta Sans`), regular or medium weight, with natural reading line-height `1.55`.
3. **Numbers, XP Allocations, Timers, Percentages, Status Chips**: Render in `var(--font-mono)` (`JetBrains Mono`) with `font-variant-numeric: tabular-nums` strictly enforced. Zero shifting of counters during progress updates.
4. **Line-Length Discipline**: Chat dialog and reading passages locked to `max-width: 70ch`.

---

## 6. Layout Grid & Spacing Rhythm

* **Grid Foundation**: 8px baseline rhythm (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* **Container Max-Widths**:
  * Global App Shell: `max-w-7xl` (`1280px`) with `16px` side gutters on mobile (`px-4`), `32px` on desktop (`px-8`).
  * Quest Detail / Command HUD: `max-w-5xl` (`1024px`).
  * Sanctuary Chat Docket: `max-w-3xl` (`768px`) centered reading channel.
* **Header / Navigation Bar**: Compact `56px` fixed tactical command strip with integrated XP micro-rail.
* **Card Structure**: Single-level card hierarchy with 1px hairlines (`border: 1px solid var(--border-subtle)`). **Never nest cards inside cards.** Inner task lists render as borderless divided rows (`divide-y divide-[var(--border-subtle)]`).

---

## 7. The Single Signature Element: "The Chronicle Rail"

### Definition
**The Chronicle Rail** is QuestSage's signature tactical component: a precision multi-segment XP progress rail integrated directly into every active Quest Card and the top Command Navigation bar.

### Mechanical Specification
* **Structure**: A recessed channel (`height: 6px; background: var(--bg-canvas); border: 1px solid var(--border-subtle)`) partitioned into distinct geometric segments corresponding exactly to each subtask's mathematical weight (`weight%`).
* **Active State**: Uncompleted segments remain muted forest-ink (`var(--bg-subtle)`). When a subtask is toggled, its segment fills with Hot Ember Orange (`var(--accent-primary)`) using a crisp 180ms ease-out cubic curve.
* **Tactical Readout**: Flanked by an engraved brass level stamp (`LVL 05`) on the left and a tabular XP ticker (`+120 / 450 XP [35m REMAINING]`) on the right.
* **Restraint**: The rail contains zero rainbow gradients, zero glowing drop-shadows, and zero pulsating borders. It communicates immediate mathematical momentum through crisp mechanical fill states.

---

## 8. Motion Laws & Physics

1. **Sub-300ms Duration Ceiling**: All interactive transitions are capped between `150ms` and `250ms`.
2. **Cubic-Bezier Easing**: Transitions strictly utilize `cubic-bezier(0.23, 1, 0.32, 1)` (custom ease-out quart). Never use linear or bounce/elastic curves for productivity UI.
3. **Entry Geometry**: Modals, dropdowns, and flyouts enter from `transform: scale(0.95); opacity: 0;` to `transform: scale(1); opacity: 1;`. Starting from `scale(0)` is explicitly banned.
4. **Active Press Feedback**: Interactive buttons, cards, and chips apply `:active { transform: scale(0.98); }` with `120ms` recovery.
5. **Zero Keyboard Animation**: Keyboard shortcuts (`Enter` to submit, `Esc` to close modal, arrow navigation) trigger instant (0ms) state shifts.
6. **No `transition: all`**: Every transition must explicitly declare targeted properties: `transition: transform 180ms var(--ease-out-quart), background-color 180ms var(--ease-out-quart), border-color 180ms var(--ease-out-quart);`.
7. **Prefers-Reduced-Motion**: Under `@media (prefers-reduced-motion: reduce)`, all transitions drop to `0.001ms` duration or opacity-only fades.
8. **Hover Gating**: All `:hover` styling is strictly wrapped in `@media (hover: hover) and (pointer: fine)` to eliminate sticky tap states on mobile touchscreens.

---

## 9. Mobile-Native Baseline

1. **100dvh Application Shell**: The root layout uses `min-h-[100dvh]` to account for dynamic address bars in iOS Safari and Chrome Android.
2. **16px Input Font Floor**: Form inputs, textareas, and search fields specify `font-size: max(16px, 1rem)` under `@media (pointer: coarse)` to prevent iOS Safari from triggering disruptive auto-zoom.
3. **Safe-Area Insets**: Navigation and mobile toolbars respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
4. **Touch Targets**: All interactive elements satisfy minimum `44x44px` physical touch targets with `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent`.

---

## 10. Complete 5-State View Matrix

Every data surface (Dashboard Quests, Master Quest Log, Great Sage Dialogue, Profile Badges) must render 5 distinct states:

| State | Visual Treatment |
|---|---|
| **1. Loading** | Non-pulsing structural skeletal blocks using subtle wireframe borders (`border: 1px dashed var(--border-subtle)`). |
| **2. Empty** | Tactical "Uninscribed Docket" state: a quiet border frame with a mono label ("No Active Trials Inscribed") and one direct action button ("Forge Trial"). |
| **3. Error** | Crisp crimson hairline border (`var(--status-danger)`), tabular error code, and single retry action. Zero dramatic full-screen crash illustrations. |
| **4. Partial** | Initial quest cards populated while background telemetry syncs; subtasks render checkable immediately without blocking on secondary stats. |
| **5. Populated** | Full tactile ledger view with Chronicle Rails, tabular XP counters, and domain badges. |

---

## 11. Global Bans

The following patterns are **permanently forbidden** anywhere in the QuestSage codebase:
1. **Purple/Indigo Glow Gradients**: No `linear-gradient(135deg, #7C3AED, ...)` or neon violet accents.
2. **Slate-900 + Neon Blue/Purple Defaults**: No generic AI template color pairings.
3. **Emoji as UI Icons**: No literal emojis (`🚀`, `🔥`, `🎯`, `⭐`, `🏆`) in JSX templates or badge icons; use exact Lucide SVG icons styled with semantic tokens.
4. **Infinite Pulsing/Breathing Keyframes**: No `animate-pulse`, `animate-bounce`, `.sage-orb` scaling, or infinite rotating glow backgrounds.
5. **Glassmorphism Blur Stacks**: No `backdrop-filter: blur(10px)` with semi-transparent white borders on opaque content.
6. **Cliché 3-Card or 4-Card Marketing Grids**: No generic feature grids with floating colored circles.
7. **Cards Nested in Cards**: No sub-cards inside quest cards; use clean hairlines or divider lists.
8. **Centered-Hero-Over-Mesh-Gradient**: No generic landing page mesh headers.
9. **Fraunces/Serif Without Purpose**: Serif fonts are restricted strictly to `Cinzel` for engraved titling.
10. **Em-Dash Slogan Copy & AI Buzzwords**: No "Elevate your productivity — unleash your potential" slogans.
11. **Dead Pure-Gray Neutrals**: No `#808080`, `#000000`, or `#ffffff` without OKLCH tinting.

---

## 12. Slop Kill List (Audited Tells → Concrete Rules)

| # | Concrete Slop Tell in Audit (File:Line) | Architectural Elimination Rule |
|---|---|---|
| 1 | `src/components/Navigation.tsx:180` | Remove rainbow purple-gold-sage gradient XP bar. Replace with **The Chronicle Rail** using solid Ember Orange fill and brass notch indicators. |
| 2 | `src/pages/QuestChat.tsx:145` | Remove purple-light gradient achievement bubble. Replace with dark forest-ink card (`var(--bg-elevated)`) with 1px brass hairlines. |
| 3 | `src/pages/QuestChat.tsx:178` | Remove purple-to-gold avatar circle. Replace with crisp engraved Sage sigil badge in deep forest ink with antique brass glyph. |
| 4 | `src/styles/design-system.css:398` | Delete dead `.sage-card` magic purple gradient. Eliminate unused CSS file entirely. |
| 5 | `src/styles/design-system.css:518` | Delete `.magic-particles::before` purple radial glow keyframe. |
| 6 | `src/pages/Profile.tsx:194` | Remove unmapped Tailwind `bg-purple-100` and `text-purple-600`. Map directly to semantic tokens `var(--bg-elevated)` and `var(--accent-primary)`. |
| 7 | `src/pages/QuestChat.tsx:254-256` | Remove 3 `animate-bounce` floating dots. Replace with quiet indeterminate ledger scanline (<200ms pulse). |
| 8 | `src/styles/design-system.css:460-481` | Delete `.sage-orb` infinite pulse scaling keyframes (`@keyframes sage-pulse`). |
| 9 | `src/styles/QuestSage-design-system.css:565-572` | Delete `@keyframes glow-pulse` intense neon box-shadows. |
| 10 | `src/styles/design-system.css:415-421` | Delete `@keyframes sage-glow` 180-deg rotating background. |
| 11 | `src/styles/design-system.css:540-544` | Delete `@keyframes particle-float` moving background layers. |
| 12 | `src/pages/Dashboard.tsx:117` | Delete rocket emoji `🚀` and cheerleading copy. Replace with concise tactical readiness prompt: "Active Trials & Tactical Readiness". |
| 13 | `src/pages/Profile.tsx:47-68` | Delete literal emojis `🎯`, `🔥`, `⭐`, `🏆`. Replace with Lucide icons (`Target`, `Flame`, `Star`, `Trophy`) styled with `--brass-primary` and `--accent-primary`. |
| 14 | `src/components/Navigation.tsx:60` & `src/styles/QuestSage-design-system.css:221-256` | Eliminate neon drop-shadows `rgba(255, 215, 0, 0.3)`. Replace with clean 1px solid hairline borders and crisp 1px optical drop shadows. |
| 15 | `src/pages/QuestChat.tsx:326` | Delete cliché 4-card AI marketing feature grid ("What I Can Help You With"). Replace with focused single-column prompt docket with direct action chips. |
| 16 | `src/pages/Dashboard.tsx:152` & `src/pages/Profile.tsx:155` | Delete generic floating colored-circle 4-stat card rows. Replace with integrated horizontal command HUD telemetry bar using tabular numbers. |
| 17 | `src/pages/Dashboard.tsx:287-294` | Delete corporate Walt Disney motivational quote card completely. |
| 18 | `src/index.css:2` & `src/styles/QuestSage-design-system.css:43-45` | Remove generic Inter/Poppins monoculture. Import and enforce `Cinzel` display + `Plus Jakarta Sans` body + `JetBrains Mono` tabular data. |
| 19 | `src/pages/Dashboard.tsx:83, 209-210`, `src/pages/QuestList.tsx:95-107`, `src/pages/QuestChat.tsx:369` | Eliminate all hardcoded Tailwind hex codes (`#FEE2E2`, `#DCFCE7`, `#166534`, etc.). Replace with semantic status tokens (`var(--status-success)`, `var(--status-warning)`, `var(--status-danger)`). |
| 20 | Dead Design System Split | Consolidate dead `design-system.css` into unified `QuestSage-design-system.css` so missing classes (`sage-card`, `magic-particles`) are replaced by canonical tokens. |
