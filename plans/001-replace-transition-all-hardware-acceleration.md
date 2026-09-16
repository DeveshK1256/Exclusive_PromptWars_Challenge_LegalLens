# 001 — Replace Unaccelerated transition-all with Hardware-Accelerated Transforms

- **Status**: TODO
- **Commit**: 4f4d713
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 4 files (`LegalXRayDashboard.tsx`, `ActionPlanViewer.tsx`, `HoverGlossaryText.tsx`, `DocumentSpatial3DMap.tsx`)

## Problem

The codebase frequently uses Tailwind's `transition-all` on interactive cards, buttons, filter chips, and popovers. `transition-all` forces the browser to evaluate non-hardware-accelerated properties (`background-color`, `border-color`, `box-shadow`, `padding`, `width`, `height`) on every animation frame, triggering layout recalculations, repaint spikes, and frame drops.

```tsx
/* src/components/xray/LegalXRayDashboard.tsx:75 — current */
className={`p-4 rounded-2xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ...`}

/* src/components/action/ActionPlanViewer.tsx:59 — current */
className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ...`}
```

## Target

Explicitly target hardware-accelerated CSS properties (`transform`, `opacity`) and scope color transitions to `transition-colors` or discrete `transition-[transform,opacity,background-color,border-color]`:

```tsx
/* target */
className={`p-4 rounded-2xl border text-left transition-[transform,opacity,background-color,border-color] duration-200 ease-out transform-gpu ...`}
```

## Repo conventions to follow

- Easing tokens in Tailwind/CSS should use explicit property scoping.
- Exemplar: `src/components/action/EmailCounterOfferModal.tsx:59` uses `transition-colors` for crisp background color updates.

## Steps

1. In `src/components/xray/LegalXRayDashboard.tsx` (lines 75, 91, 107, 123, 212):
   Replace `transition-all` with `transition-[transform,opacity,background-color,border-color] duration-200 ease-out`.

2. In `src/components/action/ActionPlanViewer.tsx` (lines 59, 74, 89, 118, 155, 268, 283):
   Replace `transition-all` with `transition-[transform,opacity,background-color,border-color] duration-150 ease-out`.

3. In `src/components/ui/HoverGlossaryText.tsx`:
   Replace `transition-all` on the hover popover drawer with `transition-[transform,opacity] duration-200 ease-out`.

4. In `src/components/3d/DocumentSpatial3DMap.tsx` (line 109):
   Replace `transition-all duration-300` with `transition-[transform,opacity,box-shadow] duration-200 ease-out`.

## Boundaries

- Do NOT alter component markup or state logic.
- Do NOT remove hover state feedback.
- Do NOT add external motion libraries.

## Verification

- **Mechanical**: Run `npm run build` and `npm test` to ensure clean compilation.
- **Feel check**:
  - Hover over filter cards in Legal X-Ray Dashboard; confirm smooth 60fps transform and color transition.
  - Open Chrome DevTools -> Rendering -> Performance Monitor; confirm CPU layout recalculation count stays flat during hover animations.
  - Confirm DevTools Animations panel shows `transform` and `opacity` as hardware-accelerated layers.
- **Done when**: `transition-all` is removed from interactive dashboard components and replaced with explicit hardware-accelerated property transitions.
