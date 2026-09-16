# 004 — Implement Physicality Origin Scaling & Press Feedback

- **Status**: TODO
- **Commit**: 4f4d713
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 2 files (`HoverGlossaryText.tsx`, `EmailCounterOfferModal.tsx`)

## Problem

Hover glossary popovers (`HoverGlossaryText.tsx`) appear abruptly without physical scale-in origin transforms. Interactive buttons on modals (`EmailCounterOfferModal.tsx`) lack tactile active press feedback (`scale(0.97)` on `:active`), making them feel rigid.

```tsx
/* src/components/ui/HoverGlossaryText.tsx — current */
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs z-50">
```

## Target

Incorporate subtle scale origin transitions (`scale(0.96)` + `opacity: 0` -> `scale(1)` + `opacity: 1`) and add active press feedback (`active:scale-[0.97]`):

```tsx
/* target in HoverGlossaryText.tsx */
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs z-50 transform origin-bottom transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] animate-in fade-in zoom-in-95">
```

```tsx
/* target in button */
className="... active:scale-[0.97] transition-transform duration-100 ease-out"
```

## Repo conventions to follow

- Scale origin matches trigger alignment (bottom origin for popovers above text triggers).
- Active scale stays subtle between `0.95` and `0.98`.

## Steps

1. In `src/components/ui/HoverGlossaryText.tsx`:
   Add `origin-bottom animate-in fade-in zoom-in-95 duration-150` to the popover container.

2. In `src/components/action/EmailCounterOfferModal.tsx`:
   Add `active:scale-[0.97] transition-all` to action buttons ("Copy Email", "Cancel").

3. In `src/components/xray/LegalXRayDashboard.tsx`:
   Add `active:scale-[0.98]` to finding card expansion toggle buttons.

## Boundaries

- Do NOT change modal backdrop overlay behavior.
- Do NOT use `scale(0)` (always start from `scale(0.95)` or `zoom-in-95`).

## Verification

- **Mechanical**: Run `npm test` to verify zero accessibility or DOM violations.
- **Feel check**:
  - Hover over legal terms in document text (e.g. *indemnification*, *arbitration*); confirm popover smoothly grows from its text trigger rather than popping abruptly.
  - Click action buttons; confirm subtle, tactile `scale(0.97)` active press response.
- **Done when**: Popovers scale from trigger origin and buttons respond with tactile active press feedback.
