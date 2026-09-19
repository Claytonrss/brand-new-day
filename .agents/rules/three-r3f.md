---
description: Non-negotiables for 3D/R3F scenes and components — tokens, camera, performance, attribution.
globs: src/components/3d/**, src/hooks/*3d*, src/lib/*three*
---

# Rules — 3D / React Three Fiber

Binding sources: `docs/design/design-bible.md`,
`docs/design/performance-design.md`, contract §2.2
(`docs/workflow/spec-driven-contract.md`).

- Design tokens only (`src/index.css` `@theme`) — no hardcoded hex in scenes.
- Frame-rate-independent animation: `1 - Math.exp(-k * delta)` — never raw
  per-frame lerps.
- Every 3D component wrapped in an Error Boundary (WebGL context loss must not
  blank the page).
- Performance budget per `docs/design/quality-matrix.md`: degrade deliberately
  (tiers), never silently.
- Mobile-first framing: `390×844` is the reference viewport, desktop is the
  enhancement.
- CC-BY 4.0 attribution (model by Eskze) stays visible without hover whenever
  the model renders.
