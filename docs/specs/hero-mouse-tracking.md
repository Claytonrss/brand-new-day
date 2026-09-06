# Scene Spec: Hero — Mouse Tracking

## 1. Context

**Section:** Hero  
**Branch:** `feat/hero-mouse-tracking`  
**Author:** @plan  
**Date:** 2026-09-06

> Values in this spec are **binding targets**. Baseline is the approved Look Dev
> v1/v2 (rubric ≥ 4) in `HeroScene.tsx`, `HeroCamera.tsx`, `SpiderManModel.tsx`.
> Where targets diverge from current code, the implementer adjusts the code to
> conform to this spec and re-validates the visual rubric.

## 2. Visual Goal

Cinematic chiaroscuro: the character emerges from the `ink` darkness carved by
a warm `oxide` rim light — "luz recortando a silhueta" (design-bible.md). Peter
Parker isolated, alone under the mask — impact, anonymity, solitude
(storyboard.md). Mouse tracking creates intimacy: the character observes and
follows the user — "ameaça silenciosa: nada grita, tudo observa". The first
fold must feel like a movie frame, not a page. Avoid: copy covering the
face/mask; static poster feel (storyboard risks).

## 3. Composition

**Mobile (390×844, 430×932):**
- Safe zone: top-left (below metadata header); text block max 82vw; min
  horizontal margin 24px
- Model position: centered-bottom — mask/torso dominate the frame, head in
  the upper-central region
- Copy position: top-left safe zone, never covering eyes/mask

**Desktop (1440×900):**
- Safe zone: left — max 480px (md/tablet), 560px (lg/desktop)
- Model position: right rule-of-thirds intersection, silhouette with lateral
  breathing room
- Copy position: left safe zone, negative space for drama

Reference: `docs/design/composition-rules.md`

## 4. 3D Assets

**Model:** `public/models/spider-man_brand_new_day-v2.glb`  
**Size:** 22.4 MB  
**Textures:** KTX2/Basis ready (loader wired via `extendGltfLoaderWithKtx2`,
assets staged)  
**Animations:** None — static pose with mouse tracking  
**Rig:** Mixamo, 66 joints; head bone `mixamorig:Head_06` (primary tracking
target); `mixamorig:Neck_05` available

## 5. Lighting

| Light Type | Position | Intensity | Color (token) | Purpose |
|---|---|---|---|---|
| Ambient | — | 2.2 | `COLORS.ink` | Base fill |
| Directional | [5, 8, 3] | 2.2 | `COLORS.paper` | Key light |
| Point | [-4, 2, -2] | 4 | `COLORS.steel` | Fill light |
| Point | [3, 1, 4] | 8 | `COLORS.oxide` | Rim light (warm) |
| Point | [-2, 3, 5] | 5 | `COLORS.signal` | Accent (red) |

**Shadows:** disabled — the silhouette is sculpted by rim light, not shadows;
mobile performance budget (degradation order preserves lighting first —
performance-design.md).

## 6. Camera

**Mobile:**
- Position: [0, 0.45, 18]
- FOV: 35°
- LookAt: [0, 0.45, 0]

**Desktop:**
- Position: [0, 0.45, 16]
- FOV: 30°
- LookAt: [0, 0.45, 0]

**Animation:** static camera + head mouse tracking (scroll storytelling
deferred to the camera rig engine — Phase 6.3).

## 7. Interactions

**Mouse tracking:**
- Target: head bone `mixamorig:Head_06` (fallback: model group rotation)
- Damping: `1 - Math.exp(-k * delta)` where k = 4 (frame-rate independent)
- Range: ±0.3 radians X, ±0.15 radians Y
- Pointer normalized: [-1, 1] from center (R3F `state.pointer`)

**Scroll triggers:**
- Trigger: None yet — deferred to the Evolution section / camera rig engine
  (Phase 6.3); Hero stays ~100vh
- Animation: N/A (deferred)
- Duration: N/A (deferred)

## 8. Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| FPS (mobile) | ≥ 55 | Chrome DevTools on iPhone 12 |
| FPS (desktop) | ≥ 60 | Chrome DevTools on 1440p |
| Draw calls (mobile) | < 50 | Three.js Stats.js |
| Draw calls (desktop) | ≤ 150 | Three.js Stats.js |
| Texture memory | ≤ 80 MB | Chrome DevTools Memory tab |
| GLB load time | ≤ 3 seconds | Network tab on 4G |

> GLB load ≤ 3s assumes the optimized production asset (≤ 15 MB target —
> performance-design.md). FPS = 5s-window average measured in `useFrame`,
> not subjective impression.

Reference: `docs/design/performance-design.md`

## 9. Accessibility

**ARIA labels:**
- `<section>` (HeroOverlay): `aria-labelledby="hero-title"` (implemented)
- `<h1 id="hero-title">`: `NINGUÉM SABE.` (implemented)
- Header status dot: `aria-hidden="true"` (implemented)

**Keyboard navigation:**
- Tab order skips the 3D canvas (decorative)
- Attribution link (Eskze, CC-BY 4.0) remains focusable with a visible
  focus indicator

**Reduced motion:**
- Mouse tracking disabled when `prefers-reduced-motion: reduce`
  (to be implemented — not in baseline)
- Fallback: static pose; lighting and composition preserved (a visual
  choice, not a broken page)

Reference: `docs/design/mobile-first.md`

## 10. Stop Conditions

This Scene Spec is "done" when:

| Condition | Measurement | Status |
|---|---|---|
| Visual quality | Rubric score ≥ 4 on all blockers | [ ] |
| Performance | FPS ≥ 55 on iPhone 12 | [ ] |
| Accessibility | Lighthouse a11y ≥ 90 | [ ] |
| Code quality | Zero lint/typecheck errors | [ ] |
| Legal compliance | CC-BY attribution visible | [ ] |

**Escalation triggers:**
- [ ] Spec is ambiguous → return to @plan
- [ ] Gate fails after 3 iterations → escalate to human
- [ ] Visual < 4 after 3 iterations → escalate to human
- [ ] Performance exceeded by > 20% → escalate to human