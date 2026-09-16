# 003 — Consolidate Custom Easing Tokens & Optimize Gauge Duration Budget

- **Status**: TODO
- **Commit**: 4f4d713
- **Severity**: MEDIUM
- **Category**: Easing & duration / Cohesion & tokens
- **Estimated scope**: 3 files (`globals.css`, `SafetyScoreGauge.tsx`, `DocumentSpatial3DMap.tsx`)

## Problem

UI animations use inconsistent duration budgets and weak browser default easings (`ease-out`, `duration-1000`, `duration-300`). Specifically, `SafetyScoreGauge.tsx` uses `duration-1000` (1000ms), which exceeds the 300ms UI animation budget for interactive components, making score updates feel slow.

```tsx
/* src/components/xray/SafetyScoreGauge.tsx:85 — current */
className="transition-all duration-1000 ease-out"
```

## Target

Establish custom cubic-bezier easing tokens in `globals.css` and enforce strict duration budgets under 300ms for UI state updates:

```css
/* target in globals.css */
:root {
  --ease-out-custom: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out-custom: cubic-bezier(0.77, 0, 0.175, 1);
}
```

```tsx
/* target in SafetyScoreGauge.tsx */
className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
```

## Repo conventions to follow

- Global CSS variables live in `src/app/globals.css`.
- Easing budgets: UI gauge transitions cap at 300ms max.

## Steps

1. In `src/app/globals.css`:
   Define CSS variables `--ease-out-custom: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-in-out-custom: cubic-bezier(0.77, 0, 0.175, 1)`.

2. In `src/components/xray/SafetyScoreGauge.tsx` (line 85):
   Change `duration-1000 ease-out` to `duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]` and restrict property to `transition-[stroke-dashoffset]`.

3. In `src/components/3d/DocumentSpatial3DMap.tsx` (line 94):
   Change `duration-300 ease-out` to `duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]`.

## Boundaries

- Do NOT alter score calculation logic in `SafetyScoreGauge.tsx`.
- Do NOT change SVG viewBox or radius math.

## Verification

- **Mechanical**: Run `npm run build` and `npm test` to verify clean build.
- **Feel check**:
  - Switch sample documents in the dashboard; verify the SVG safety gauge arc updates within 300ms with a snappy, responsive feel.
  - In Chrome DevTools Animations panel, inspect the cubic-bezier curve to confirm custom ease-out trajectory.
- **Done when**: UI animation durations are capped at 300ms with custom cubic-bezier tokens.
