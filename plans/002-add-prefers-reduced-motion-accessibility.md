# 002 — Add Prefers-Reduced-Motion Handling across CSS and 3D Canvas Features

- **Status**: TODO
- **Commit**: 4f4d713
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 3 files (`globals.css`, `SafetyScore3DOrb.tsx`, `Card3DPerspective.tsx`)

## Problem

The codebase features animated components (`@keyframes marquee` in `globals.css`, 3D continuous particle rotation loop in `SafetyScore3DOrb.tsx`, and cursor 3D tilt tracking in `Card3DPerspective.tsx`) that do not check user OS preference for reduced motion (`prefers-reduced-motion: reduce`). Users with vestibular disorders will experience unintended motion and disorientation.

```css
/* src/app/globals.css:20 — current */
.animate-marquee {
  animation: marquee 25s linear infinite;
}
```

## Target

Include `@media (prefers-reduced-motion: reduce)` in CSS to pause position animations while preserving static content, and check `window.matchMedia('(prefers-reduced-motion: reduce)')` in React/Canvas components:

```css
/* target */
@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
  }
}
```

```tsx
/* target in React component */
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) return;
```

## Repo conventions to follow

- Media queries match standard Tailwind / CSS responsive and accessibility breakpoints.
- Exemplar: `src/app/globals.css` handles CSS utility definitions.

## Steps

1. In `src/app/globals.css`:
   Add `@media (prefers-reduced-motion: reduce)` rule for `.animate-marquee` to set `animation: none`.

2. In `src/components/3d/SafetyScore3DOrb.tsx`:
   Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. If true, render a static high-resolution frame instead of scheduling continuous `requestAnimationFrame` loops.

3. In `src/components/ui/Card3DPerspective.tsx`:
   Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. If true, disable mouse 3D rotation transforms (`setRotateX(0)`, `setRotateY(0)`).

## Boundaries

- Do NOT remove opacity/color feedback for users with reduced motion preferences.
- Do NOT disable 3D canvas rendering entirely — freeze motion while preserving static visualization.

## Verification

- **Mechanical**: Run `npm test` to confirm all 19 accessibility test files pass.
- **Feel check**:
  - Open Chrome DevTools -> Rendering tab -> Emulate CSS media feature `prefers-reduced-motion: reduce`.
  - Verify `SafetyScore3DOrb` stays still while score number remains clearly visible.
  - Hover over hero feature cards in `app/page.tsx`; confirm 3D card tilt is suppressed while subtle hover color feedback remains.
- **Done when**: All motion components respect `prefers-reduced-motion: reduce`.
