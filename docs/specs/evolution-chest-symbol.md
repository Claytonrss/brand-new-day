# Scene Spec: Evolution — Chest Symbol

## 1. Context

**Section:** Evolution  
**Branch:** `feat/evolution-scroll-storytelling`  
**Author:** @plan  
**Date:** 2026-09-06

> This spec includes the Camera Rig / Scroll Storytelling foundation (Phase 6.3)
> as an embedded dependency. The camera rig is shared across Evolution, Arsenal,
> and FullBody sections.

## 2. Visual Goal

Tensão e transformação interna: close no peito/símbolo do Spider-Man. O beat
memorável é "a luz atravessa o símbolo" — uma varredura de luz que revela a
transformação interna de Peter Parker. Push-in lento scrubado por scroll ao
longo de ~150vh.

**Copy:**

- Kicker: "A mudança"
- Título: "Algo nele\nestá mudando."
- Corpo: definido no storyboard.md

Texto alinhado à direita, nunca cobre o símbolo. Composição assimétrica com
espaço negativo para drama.

## 3. Composition

**Mobile (390×844, 430×932):**

- Close no símbolo, texto em bloco compacto
- Safe zone: top-left, max 82vw, min margin 24px
- Risco mitigado: keyframes mobile próprios para legibilidade

**Desktop (1440×900):**

- Close assimétrico com espaço negativo
- Texto alinhado à direita, nunca cruzando o símbolo
- Safe zone: right, max 560px

Reference: `docs/design/composition-rules.md`

## 4. 3D Assets

**Model:** `public/models/spider-man_brand_new_day-v2.glb` (22.4 MB)  
**Focus:** peito/símbolo (chest symbol)  
**Rig:** Mixamo, torso joints relevantes  
**Validação necessária:** confirmar posição do símbolo no modelo real (análogo
à descoberta do `mixamorig:Head_06` no Hero)

## 5. Lighting

**Base:** manter rig do Hero (5 luzes com design tokens)

**Beat 2 — "a luz atravessa o símbolo":**

- Adicionar SpotLight `COLORS.signal` dedicada ao símbolo
- Animar intensidade e posição durante o push-in
- Varredura de luz entre 50-70% do scroll (ápice 60%)
- Recorte-sombra permanentemente alterado após o beat

**Shadows:** habilitados para o Beat 2 (recorte-sombra é parte da emoção)

## 6. Camera

### Camera Rig / Scroll Storytelling (fundação)

**Arquitetura:**

- Objeto mutável alvo (position, lookAt, fov) atualizado por ScrollTrigger
- Suavização: lerp no useFrame com k=3 (frame-rate independent)
- Condicionais por breakpoint (768px)
- Resize sem teleporte: debounce ~150ms, transição suave

**Hero → Evolution journey:**

| Keyframe        | Scroll | Mobile                  | Desktop                  |
| --------------- | ------ | ----------------------- | ------------------------ |
| Hero final      | 0%     | [0, 0.45, 18] FOV 35    | [0, 0.45, 16] FOV 30     |
| Evolution start | ~30%   | [0.1, 0.52, 1.0] FOV 34 | [0.15, 0.55, 0.9] FOV 28 |
| Evolution end   | 100%   | [0.1, 0.52, 0.6] FOV 32 | [0.15, 0.55, 0.5] FOV 26 |

**Dolly:** ~40% de aproximação ao longo do scroll, FOV −2° (mobile) / −2° (desktop)

### lookAt

- Hero final: [0, 0.45, 0]
- Evolution: [0, 0.5, 0] (foco no peito/símbolo)

## 7. Interactions

**Scroll triggers:**

- Trigger: section enter (Hero → Evolution transition)
- Animation: GSAP ScrollTrigger scrub
- Duration: ~150vh de scroll
- Easing: linear scrub, lerp smoothing (k=3)

**Beat 2 — "a luz atravessa o símbolo":**

- Trigger: scroll progress 50-70%
- Animation: SpotLight `COLORS.signal` varrendo o símbolo
- Ápice: 60% do scroll
- Recorte-sombra: permanentemente alterado após o beat

**Reduced motion:**

- Scroll-triggered animations disabled when `prefers-reduced-motion: reduce`
- Fallback: composição estática no keyframe final do Evolution
- Iluminação e composição preservadas

## 8. Performance Budget

| Metric               | Target   | Measurement                  |
| -------------------- | -------- | ---------------------------- |
| FPS (mobile)         | ≥ 55     | Chrome DevTools on iPhone 12 |
| FPS (desktop)        | ≥ 60     | Chrome DevTools on 1440p     |
| Draw calls (mobile)  | < 50     | Three.js Stats.js            |
| Draw calls (desktop) | ≤ 150    | Three.js Stats.js            |
| Scroll smoothness    | ≥ 55 FPS | ScrollTrigger scrub sem jank |
| Memory delta vs Hero | ≤ +10 MB | Chrome DevTools Memory tab   |

> Scroll smoothness = FPS médio durante o scroll de 150vh. Jank = frame drops
> abaixo de 45 FPS por > 100ms.

Reference: `docs/design/performance-design.md`

## 9. Accessibility

**ARIA labels:**

- `<section aria-labelledby="evolution-title">`
- `<h2 id="evolution-title">`: "Algo nele está mudando."

**Keyboard navigation:**

- Tab order skips 3D canvas (decorative)
- Scroll navigation preserved

**Reduced motion:**

- Scroll-triggered animations disabled when `prefers-reduced-motion: reduce`
- Fallback: static composition at Evolution final keyframe
- Lighting and composition preserved (visual choice, not broken page)

Reference: `docs/design/mobile-first.md`

## 10. Stop Conditions

This Scene Spec is "done" when:

| Condition         | Measurement                      | Status |
| ----------------- | -------------------------------- | ------ |
| Visual quality    | Rubric score ≥ 4 on all blockers | [ ]    |
| Performance       | FPS ≥ 55 on iPhone 12            | [ ]    |
| Scroll smoothness | No jank during 150vh scroll      | [ ]    |
| Accessibility     | Lighthouse a11y ≥ 90             | [ ]    |
| Code quality      | Zero lint/typecheck errors       | [ ]    |
| Legal compliance  | CC-BY attribution visible        | [ ]    |

**Escalation triggers:**

- [ ] Spec is ambiguous → return to @plan
- [ ] Gate fails after 3 iterations → escalate to human
- [ ] Visual < 4 after 3 iterations → escalate to human
- [ ] Scroll jank after 3 iterations → escalate to human
