# Scene Spec: [Feature Name]

## 1. Context

**Section:** [Hero | Evolution | Arsenal | FullBody | Credits]  
**Branch:** `feat/<feature-slug>`  
**Author:** @plan  
**Date:** YYYY-MM-DD

## 2. Visual Goal

[What should the user see/feel? Reference design-bible.md]

## 3. Composition

**Mobile (390×844, 430×932):**
- Safe zone: [top/bottom/left/right]
- Model position: [rule-of-thirds intersection]
- Copy position: [safe zone]

**Desktop (1440×900):**
- Safe zone: [left/right]
- Model position: [rule-of-thirds intersection]
- Copy position: [safe zone]

Reference: `docs/design/composition-rules.md`

## 4. 3D Assets

**Model:** `public/models/<filename>.glb`  
**Size:** [X MB]  
**Textures:** [KTX2/Basis | WebP | PNG]  
**Animations:** [list animations required]  
**Rig:** [Mixamo joint names for key bones]

## 5. Lighting

| Light Type | Position | Intensity | Color (token) | Purpose |
|---|---|---|---|---|
| Ambient | — | [X] | `COLORS.ink` | Base fill |
| Directional | [x, y, z] | [X] | `COLORS.paper` | Key light |
| Point | [x, y, z] | [X] | `COLORS.steel` | Fill light |
| Point | [x, y, z] | [X] | `COLORS.oxide` | Rim light (warm) |
| Point | [x, y, z] | [X] | `COLORS.signal` | Accent (red) |

**Shadows:** [enabled | disabled — document why]

## 6. Camera

**Mobile:**
- Position: [x, y, z]
- FOV: [X°]
- LookAt: [x, y, z]

**Desktop:**
- Position: [x, y, z]
- FOV: [X°]
- LookAt: [x, y, z]

**Animation:** [static | GSAP ScrollTrigger | mouse tracking]

## 7. Interactions

**Mouse tracking:**
- Target: [head bone | model group | camera]
- Damping: `1 - Math.exp(-k * delta)` where k = [X]
- Range: [±X radians]

**Scroll triggers:**
- Trigger: [section enter | section exit | scroll progress]
- Animation: [GSAP timeline | camera dolly | model rotation]
- Duration: [X seconds]

## 8. Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| FPS (mobile) | ≥ 55 | Chrome DevTools on iPhone 12 |
| FPS (desktop) | ≥ 60 | Chrome DevTools on 1440p |
| Draw calls | ≤ [X] | Three.js Stats.js |
| Texture memory | ≤ [X MB] | Chrome DevTools Memory tab |
| GLB load time | ≤ [X seconds] | Network tab on 4G |

Reference: `docs/design/performance-design.md`

## 9. Accessibility

**ARIA labels:**
- `[element]`: `[label]`

**Keyboard navigation:**
- [Tab order]
- [Focus indicators]

**Reduced motion:**
- [What animations are disabled?]
- [Fallback behavior]

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