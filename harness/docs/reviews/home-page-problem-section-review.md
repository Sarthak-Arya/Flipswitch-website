# Home Page Problem Section — Implementation Review

**Plan:** `harness/exec-plans/active/home-page-problem-section.md`  
**Reference (layout only):** `harness/exec-plans/active/card section 2.jpg`  
**Copy:** Approved table in plan / `messaging.md` alignment

## Layout vs reference

| Reference element | Implementation |
|-------------------|----------------|
| Tall card, large radius | `.problem-section__card` — `min-height: 20rem`, `--radius-card` (40px) |
| Dark top → bottom-center glow | Layered `linear-gradient` + `::before` radial glow |
| Left-aligned stack, generous padding | `padding: var(--sp-6)` / `--sp-7` bottom |
| Two-tone title | `titlePrimary` / `titleSecondary` spans per card |
| Muted body list | `.problem-section__points` — `--clr-text-secondary` |
| Footer divider + resolution | `border-top` on `.problem-section__resolution` |
| Three-column row | `.content-grid` (3 → 2 @900px → 1 @620px) |
| Closing editorial line | `.problem-section__closing` with left border accent |

**Not ported from reference:** Breeew/Stripe content, pagination, logos, non-brand hues.

## Colors vs brand tokens

- Card shell: `--clr-surface`, `--clr-bg`, `--clr-border`
- Glow: `--problem-card-glow-blue`, `--problem-card-glow-deep` (`color-mix` from `--color-blue`, `--clr-bg-glow`)
- Text: `--clr-text-primary`, `--clr-text-muted`, `--clr-text-secondary`, `--color-blue`
- Section field: inherits page `--gradient-bg` / `--clr-bg` from `body`

No hex sampled from reference image.

## Home page order

1. `HeroSection` (unchanged)
2. `ProblemSection` (new)
3. `ServiceList`
4. Proof inline
5. `ProcessList`

## Accessibility

- Section `h2`; card titles `h3`; problem signals in `ul`/`li`
- `data-reveal` + `useScrollReveal` in `MarketingLayout`; static when `prefers-reduced-motion`

## Verification

- `npm run typecheck`
- `npm run build`
