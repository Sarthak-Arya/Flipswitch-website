# Home Page — Section 2: The Problem

## Reference Direction

### What to take from the reference (layout & shape only)

**File:** [`harness/exec-plans/active/card section 2.jpg`](harness/exec-plans/active/card%20section%202.jpg)

Use this image for **visual direction** — structure, proportion, and hierarchy — not for literal colors:

- Vertical card with **large corner radius** (~24–32px; implement with `--radius-card` where close enough)
- **Dark-to-glow gradient** on the card: near-black/charcoal at top → soft glow concentrated at the **bottom center**, fading upward (match the reference’s *shape* of the gradient, not its hue)
- **Left-aligned** content with generous horizontal padding and breathing room between title, body, and footer
- **Two-tone card title** (optional): primary phrase in `--clr-text-primary`, secondary phrase in `--clr-text-secondary` or `--clr-text-muted` (e.g. “Broken” / “Processes” split if copy supports it)
- **Typography hierarchy:** bold title → muted problem list → distinct resolution/footer line
- Optional **thin divider** above the resolution line (reference footer separator)
- Cards in a **horizontal row**; optional peek of the next card at the right edge on desktop; single column on mobile

### Colors: brand tokens only

**Do not** sample or hard-code colors from the reference (no cobalt/indigo hex values from the mockup, no third-party palette).

All card and section colors must come from FlipSwitch brand tokens in `resources/css/app.css` `:root`:

| Role | Use these tokens only |
|------|------------------------|
| Page/section field | `--clr-bg`, `--gradient-bg` |
| Card base | `--clr-surface`, `--clr-bg` |
| Card border | `--clr-border` |
| Bottom glow | `--clr-bg-glow`, `--color-blue` at low opacity (same family as hero atmospheric blue) |
| Primary text | `--clr-text-primary` |
| Secondary / list copy | `--clr-text-secondary` |
| Muted / title second line | `--clr-text-muted`, `--clr-glyph` |
| Accent / resolution emphasis | `--color-blue` |

If a new token is required, add it to `:root` as a **derivative of existing brand values** (e.g. `rgba` of `--color-blue` or `--clr-bg-glow`), not an ad-hoc hex from the reference.

This should become a FlipSwitch problem section, not a direct copy of the reference (which shows a pricing card with non-brand content). **Match the reference’s card anatomy; paint it only with brand colors.**

Compare the finished implementation against `card section 2.jpg` (layout) and `messaging.md` (copy/voice) — same workflow as `hero-section.md` → `harness/docs/reviews/`.

---

## Strategic Intent

This is the **first content section after the hero**. Per `messaging.md` §6 (Home Page), it must establish credibility and **explain the problem** before services, proof, and process.

### Core stance

> AI should serve business outcomes, not trends.

The section positions FlipSwitch against the brand “enemy” — AI hype, broken systems, silos, manual bottlenecks — without fear-based selling. Tone: calm, authoritative, direct (see `messaging.md` §4 Voice And Tone).

### Messaging alignment

| User intent | `messaging.md` anchor |
|-------------|----------------------|
| “AI Isn’t The Solution.” | §3 Main Idea; §5 Pillar 2 “Technology With Intent”; headline bank: *Not every workflow needs AI. Every workflow needs clarity.* |
| Broken Processes | §2 frustrations (missed follow-ups, manual work); §3 enemy: manual bottlenecks |
| AI Hype | §3 enemy: AI hype; §8 vendor underdelivery |
| Disconnected Systems | §2 lack of visibility; §5 forward-deployed execution |
| Bottom statement | §5 Pillar 4 “Measurable Outcomes”; §12 rule 4 |

### Card structure (user requirement)

Each card must explain **both the problem and the solution** as much as possible inside the card — not only pain points. Problem signals first; a resolution line closes each card.

---

## Approved Copy

### Section header

| Element | Copy |
|---------|------|
| Eyebrow | `The Problem` |
| Headline (`h2`) | `AI Isn't The Solution.` |
| Lead line 1 | `Most businesses don't need more AI.` |
| Lead line 2 | `They need better systems.` |

### Card 1 — Broken Processes

**Problem signals:**

- Manual work.
- Missed follow-ups.
- Operational friction.

**Resolution line (default):**

> We map workflows first, then automate what actually slows you down.

### Card 2 — AI Hype

**Problem signal:**

- Vendors selling AI for problems that don't require it.

**Resolution line (default):**

> We start with the business case — not the buzzword.

### Card 3 — Disconnected Systems

**Problem signals:**

- Sales.
- Operations.
- HR.
- Customer Support.
- Working in silos.

**Resolution line (default):**

> We connect the workflow so teams share visibility, not duplicate effort.

### Closing statement (below the grid)

`We implement AI only where it creates measurable value.`

Not a CTA button — editorial closing line. Optional left border accent (echo hero `.hero__message` editorial panel) if it fits the layout.

---

## Layout Requirements

### Desktop

- `.page-section` container: `min(100% - 2rem, 1180px)`, centered, `clamp(4rem, 8vw, 7rem)` vertical padding.
- Eyebrow: first `<p>` — blue, uppercase (existing `.page-section > p:first-child` rule).
- Headline: Share Tech Mono display scale via `.page-section h2`.
- Lead block: two lines, secondary text, max-width ~36rem.
- **Three cards** in a row (`.content-grid` or `.problem-section__grid`).
- Closing statement full-width under the grid, slightly emphasized.

### Mobile (≤620px)

- Single-column card stack.
- Headline scales with existing `clamp()` on `h2`.
- No horizontal overflow; reduce glow intensity if it causes banding on small screens.

### Section order on home page

```
HeroSection
ProblemSection    ← section 2 (this plan)
ServiceList
Proof (inline)
ProcessList
```

---

## Card Visual System

**Layout from reference** (`card section 2.jpg`). **Colors from brand only** (`:root` in `app.css`).

Apply to each `.problem-section__card` / `article`:

| Property | Direction |
|----------|-----------|
| Shape / layout | Match reference: tall card, large radius, left-aligned stack, optional footer divider above resolution |
| Background | Layered gradient: `--clr-surface` / `--clr-bg` at top → brand glow at bottom via `radial-gradient` using `--clr-bg-glow` and `--color-blue` (low opacity) — **never** reference cobalt/indigo hex |
| Border | `1px solid var(--clr-border)` |
| Radius | `--radius-card` (40px) unless reference review prefers slightly smaller; stay on-token |
| Title | `--font-ui` (Barlow); `--clr-text-primary` + optional second line in `--clr-text-secondary` / `--clr-text-muted` |
| Problem list | `--clr-text-secondary`, `--lh-body` |
| Resolution line | `--color-blue` or `--clr-text-primary`; separated like reference footer (divider optional) |
| Divider | `var(--clr-border)` only |

**Forbidden**

- Hex/rgb colors lifted from `card section 2.jpg`
- New accent hues outside the brand palette
- Reference-specific UI/content (Breeew, Stripe, “One spot left”, pagination dots, logos)

**Do not** introduce Tailwind or new font families.

---

## Component Architecture

### New component

**`ProblemSection`** — `resources/js/Components/sections/ProblemSection.tsx`

- Static copy in a `PROBLEM_CARDS` constant (title, `problemPoints: string[]`, `resolution: string`).
- No backend props for v1.

### Suggested markup

```tsx
<section className="page-section problem-section" data-reveal>
  <p>The Problem</p>
  <h2>AI Isn't The Solution.</h2>
  <div className="problem-section__lead">
    <p>Most businesses don't need more AI.</p>
    <p>They need better systems.</p>
  </div>
  <div className="problem-section__grid content-grid">
    {PROBLEM_CARDS.map((card) => (
      <article key={card.id} className="problem-section__card">
        <h3>{card.title}</h3>
        <ul>
          {card.problemPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="problem-section__resolution">{card.resolution}</p>
      </article>
    ))}
  </div>
  <p className="problem-section__closing">
    We implement AI only where it creates measurable value.
  </p>
</section>
```

### Home page integration

**File:** `resources/js/Pages/Home.tsx`

```tsx
import { ProblemSection } from '../Components/sections/ProblemSection';

// …
<HeroSection />
<ProblemSection />
<ServiceList services={services} />
```

### Naming note

`architecture.md` lists `NarrativeSection` for “Problem → solution.” This plan uses **`ProblemSection`** for section 2 only; solution copy lives inside each card per product intent. A separate solution band can be planned later if needed.

---

## CSS Targets

**File:** `resources/css/app.css` (after `.page-section` / `.content-grid` rules, ~line 665)

### Reuse

- `.page-section` — width, padding, `h2` scale
- `.content-grid` — 3 → 2 → 1 column breakpoints (900px, 620px)

### New BEM block `.problem-section`

- `.problem-section__lead` — spacing below headline, secondary paragraphs
- `.problem-section__card` — extends grid `article`; bottom glow pseudo-element or layered background
- `.problem-section__resolution` — footer-style resolution line
- `.problem-section__closing` — closing statement emphasis
- Card `ul` — list reset, secondary color, tight vertical rhythm

Override generic `.content-grid article` min-height if cards need more room for five-line Disconnected Systems card.

---

## Animation Plan

Use the existing stack from `architecture.md`:

### Baseline

- `data-reveal` on the section — `useScrollReveal()` in `MarketingLayout` (GSAP fade-up, `y: 24`, trigger `top 85%`).

### Optional enhancement (v1.1)

- `ScrollTrigger` stagger on `.problem-section__grid article` (~0.12s)
- Respect `prefers-reduced-motion` via `usePrefersReducedMotion`

Keep motion subtle; clarity over spectacle.

---

## Accessibility Requirements

- Hero keeps the page’s single `h1`; this section uses `h2` for the headline.
- Card titles are `h3`.
- Problem points as semantic `<ul>` / `<li>`.
- Glow layers must not reduce text contrast on titles and resolution lines.
- Section fully readable with animations disabled.

---

## Implementation Sequence

1. Read `card section 2.jpg` for **layout only** (radius, padding, gradient shape, type hierarchy, divider).
2. Map all colors to `:root` brand tokens — verify no reference hex values in CSS.
3. Create `ProblemSection.tsx` with `PROBLEM_CARDS` and markup above.
4. Add `.problem-section` styles in `app.css` (brand-colored glow cards + lead + closing).
5. Import `<ProblemSection />` in `Home.tsx` immediately after `<HeroSection />`.
6. Test desktop, tablet (900px), and mobile (620px).
7. Write review notes in `harness/docs/reviews/`: layout vs `card section 2.jpg`, colors vs brand tokens only.
8. Run `npm run typecheck` and `npm run build`.

---

## Acceptance Criteria

- Section is the **second block** on the home page, directly under the hero.
- Copy matches the approved structure (header, lead, three cards, closing statement).
- Each card includes **problem signals and a resolution line**.
- Cards match reference **layout** (dark shell, bottom glow shape, rounded corners, type hierarchy).
- All card/section **colors use brand tokens only** — no colors sampled from the reference image.
- Scroll reveal works; reduced-motion shows static layout.
- No regression to hero or downstream sections.

---

## Open Questions

1. **Resolution copy** — Default lines are messaging-aligned drafts; confirm or tighten before final ship.
2. **Card icons** — Reference has no icons; add only if brand later supplies glyphs for Broken Processes / AI Hype / Disconnected Systems.
3. **Horizontal peek** — Reference shows a second card edge; implement optional `overflow` peek on desktop or keep a clean three-column grid.
