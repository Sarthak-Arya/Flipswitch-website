# Home Hero Section Plan

## Reference Direction

Use the provided hero reference as the visual direction: dark editorial layout, large architectural display type, minimal navigation, soft blue/black atmospheric background, and a strong oversized brand/title moment at the bottom.

This should become a FlipSwitch hero, not a direct copy of the reference. The mood should stay aligned with the brand: intelligent, authoritative, calm, premium, technical, and forward-looking.

## Hero Message

Primary headline direction from `messaging.md`:

**Flip the Switch to What's Next.**

Supporting copy:

**AI engineering and automation systems built for measurable business outcomes.**

Alternative if the giant bottom headline needs stronger service clarity:

**AI Systems for Intelligent Growth**

CTA options:

- Primary: `Book a Discovery Call`
- Secondary: `Explore How We Work`

## Layout Requirements

Desktop hero should include:

- Full viewport height hero section.
- Top navigation with FlipSwitch logo on the left.
- Navigation links: `About`, `Services`, `Work`, `Insights`, `Contact`.
- Primary CTA button on the top right.
- Small editorial intro copy block in the upper-left/mid-left area.
- Small floating phrase or micro-message in the upper-right/mid-right area.
- Large oversized display headline anchored near the bottom.
- Soft dark-to-blue atmospheric background similar to the reference.
- Subtle curved/bordered panel shape in the top-left area if it fits the final design.

Mobile hero should include:

- Logo, compact menu trigger, and CTA or contact link.
- Stacked hero copy.
- Large display headline scaled down but still visually dominant.
- No horizontal overflow.
- Reduced background intensity for readability.

## Fonts Needed

### Display Font

Used for the oversized bottom headline and any strong hero wordmark-style text.

Preferred direction:

- **Tektur** — open-source, technical, modular, strong for AI/engineering.
- **Gridular** — premium/pixel-industrial look, closest to the reference mood if licensing is acceptable.
- **PP NeueBit** — strong pixel/editorial character, good for bold tech moments if licensing is acceptable.

Recommended default:

**Tektur** for the first implementation because it is accessible, web-friendly, and visually close enough to the reference without introducing licensing friction.

### UI / Body Font

Used for nav, buttons, supporting copy, and readable text.

Preferred direction:

- **Geist Sans** — modern, clean, technical, excellent for UI.
- **Inter** — reliable, neutral, readable fallback.
- **Satoshi** — premium and modern if licensing/source is available.

Recommended default:

**Geist Sans** for UI/body text, with `system-ui` fallback.

### Optional Mono Font

Used only for small technical labels, coordinates, metadata-style text, or micro-copy if needed.

Recommended:

- **Geist Mono**
- **JetBrains Mono**

## Assets Needed

Before final design implementation, collect or confirm:

- FlipSwitch logo in SVG format, preferably white and black variants.
- Transparent logo mark/icon if separate from wordmark.
- Final hero headline text.
- Final short supporting paragraph.
- Final CTA labels and target links.
- Any background asset direction: gradient only, abstract image, 3D render, particles, or video.
- Font licensing approval if using premium fonts like Gridular, PP NeueBit, or Satoshi.

Existing available asset:

- `logo.png` exists, but SVG is preferred for header and crisp scaling.

## Visual System Decisions

These should be captured later in `design.md`:

- Exact colors for background, blue glow, text, border lines, and button states.
- Exact font sizes and responsive scaling.
- Border radius and curved panel treatment.
- Header spacing and sticky/non-sticky behavior.
- Whether the bottom headline says `FlipSwitch`, `AI Systems`, or a campaign headline.
- Whether the hero uses image/video/Three.js or CSS gradients only.

## Implementation Targets

Likely files to update when implementation begins:

- `resources/js/Pages/Home.tsx`
- `resources/js/Components/sections/HeroSection.tsx`
- `resources/js/Layouts/MarketingLayout.tsx`
- `resources/css/app.css`
- `public/` or `resources/assets/` for logo/background assets

Suggested component split:

- `HeroSection` — main hero structure and copy.
- `SiteHeader` — logo, navigation, CTA.
- `HeroBackdrop` — background gradient/glow layer.
- `HeroKicker` — small floating message area.

## Animation Plan

Use the existing animation stack from `architecture.md`:

- GSAP for headline reveal and section entrance.
- Lenis for smooth scroll.
- Framer Motion only for small UI interactions if needed.

Recommended animation behavior:

- Header fades in subtly on load.
- Intro copy fades up with small delay.
- Giant display headline reveals with clip/mask or staggered word animation.
- Background glow moves very slowly with transform only.
- Respect `prefers-reduced-motion` and show static layout when enabled.

## Accessibility Requirements

- Hero must have one clear `h1`.
- CTA buttons must be keyboard accessible.
- Background layers must not reduce text contrast.
- Navigation must be usable without animation.
- Decorative floating text should not replace essential content.
- Provide reduced-motion fallback.

## Implementation Sequence

1. Finalize exact hero copy and CTA text.
2. Confirm font choice: `Tektur + Geist Sans` as default unless premium fonts are approved.
3. Get SVG logo assets.
4. Create `HeroSection` and `SiteHeader` components.
5. Add design-neutral structure first.
6. Add final CSS after `design.md` defines visual tokens.
7. Add GSAP reveal behavior.
8. Test desktop, tablet, and mobile breakpoints.
9. Run `npm run typecheck` and `npm run build`.

## Open Questions

1. Should the oversized bottom text say **FlipSwitch**, **AI Systems**, or the tagline **What's Next**?
2. Do you want to use free/open-source fonts first, or are premium font licenses acceptable?
