# Hero Section Review

## Review Scope

Compared the delivered frontend implementation against:

- `harness/exec-plans/active/hero section.jpg`
- `harness/exec-plans/active/hero-section.md`
- Current implementation in `resources/js/Components/sections/HeroSection.tsx`, `resources/js/Components/SiteHeader.tsx`, and `resources/css/app.css`

The implementation is directionally close: it uses the requested dark editorial mood, Tektur + Geist, upper-left editorial copy, top navigation, CTA buttons, floating micro-message, blue atmospheric glow, and a bottom oversized brand moment. The remaining changes are mostly about matching the reference hierarchy and making the hero feel less like a generic SaaS hero.

## Required Changes

### 1. Make the Oversized Bottom Headline the Primary Visual Moment

Current issue:

The delivered hero has two competing headline moments:

- The visible `h1`: `Flip the Switch to What's Next.`
- The decorative bottom display text: `FlipSwitch`

In the reference, the oversized bottom typography is the dominant hero moment. In the current build, the main `h1` sits in the lower-middle area with CTAs underneath, so the layout reads more like a conventional landing page hero instead of the requested editorial reference.

Change request:

- Rework the hierarchy so the bottom anchored display text is the dominant headline.
- Decide whether the bottom display should say `FlipSwitch`, `AI Systems`, or `What's Next`; the execution plan leaves this open, but the implementation should make this choice intentional.
- If `Flip the Switch to What's Next.` remains the semantic `h1`, visually integrate it into the bottom display treatment or make the bottom headline the accessible `h1`.
- Reduce the mid-page hero copy so it does not compete with the oversized bottom typography.

### 2. Replace the Placeholder Header Mark

Current issue:

The header currently uses a circular `FS` text mark. The plan asks for the FlipSwitch logo on the left, and notes that `logo.png` exists while SVG is preferred.

Change request:

- Replace the placeholder `FS` mark with the actual FlipSwitch logo asset.
- If only `logo.png` is available, use it temporarily but size it carefully for crisp rendering.
- Keep the logo white/light on the hero background.
- Preserve accessible labeling with `aria-label="FlipSwitch home"`.

### 3. Align the Header CTA Copy With the Plan

Current issue:

The header CTA says `Book a Call`, while the plan specifies the primary CTA as `Book a Discovery Call`.

Change request:

- Update the header CTA to `Book a Discovery Call` on desktop.
- On small screens, a shorter label is acceptable only if spacing requires it, but it should still clearly map to the discovery-call action.

### 4. Refine the Background Treatment

Current issue:

The current background includes a bright blue radial glow, grid lines, and dot texture. The reference is softer and more atmospheric, with a dark editorial field and blue light concentrated toward the lower/right area. The current grid/dot treatment pushes the design toward a tech dashboard aesthetic.

Change request:

- Reduce or remove the visible grid and dot overlays in the hero.
- Darken the upper and left portions of the background.
- Keep the blue glow softer, larger, and more diffused, weighted toward the lower-right.
- Make sure the bottom display text remains high contrast against the glow.

### 5. Tighten the Upper-Left Editorial Panel

Current issue:

The curved top-left panel is a good match to the reference direction, but its copy and visual weight currently compete with the main hero content.

Change request:

- Keep the curved panel, but make it feel more like the reference: quiet, editorial, and secondary.
- Consider using only one short paragraph plus the small `Explore How We Work` link.
- Avoid making this panel feel like a card component; the reference feels more like an integrated layout surface.

### 6. Revisit Hero CTA Placement

Current issue:

The hero currently has CTAs under the central `h1`, plus a header CTA and a text link in the panel. This creates three action zones in the first viewport.

Change request:

- Keep the header CTA.
- Keep one primary action area in the hero body.
- If the design moves closer to the reference, the upper-left panel link can serve as the secondary editorial action, while the larger bottom headline remains uncluttered.
- Avoid placing large CTA buttons directly under the oversized display moment unless the final composition still feels like the reference.

### 7. Improve Mobile Brand and Display Handling

Current issue:

On small screens, the header hides the `FlipSwitch` word and leaves only the placeholder `FS` mark. The bottom `FlipSwitch` display is constrained with `overflow: hidden`, which may crop the word instead of scaling it elegantly.

Change request:

- After replacing the logo, verify that the mobile header still clearly shows the FlipSwitch brand.
- Scale the bottom display text down so it remains legible and intentional on mobile.
- Avoid cropping the display word unless that crop is an intentional art direction.
- Confirm there is no horizontal overflow at 320px, 375px, 390px, 430px, tablet, and desktop widths.

### 8. Add the Planned Hero Entrance Polish

Current issue:

The plan calls for subtle header fade-in, intro copy fade-up, display headline reveal, slow background motion, and reduced-motion support. The current implementation has reveal behavior on the panel/copy and background drift, but the header and bottom display headline do not yet receive the planned reveal treatment.

Change request:

- Add a subtle entrance for the header.
- Add a mask/clip or stagger reveal for the oversized bottom display headline.
- Keep the animation restrained and premium.
- Preserve the existing `prefers-reduced-motion` behavior so the hero remains static and readable for users who request reduced motion.

## Acceptance Checklist

- The first viewport visually matches the reference mood: dark editorial, minimal, premium, and atmospheric.
- The oversized bottom headline is the clear visual anchor.
- The header uses the actual FlipSwitch logo, not a placeholder text mark.
- Header navigation remains: `About`, `Services`, `Work`, `Insights`, `Contact`.
- Header CTA uses the planned discovery-call language.
- Background is soft and atmospheric, not visibly grid-heavy.
- Mobile layout shows brand, menu, CTA/contact affordance, stacked copy, and no horizontal overflow.
- The page still has one clear accessible `h1`.
- Animations respect `prefers-reduced-motion`.
