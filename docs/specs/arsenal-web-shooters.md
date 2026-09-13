# Scene Spec: Arsenal — Web Shooters

## 1. Context

**Section:** Arsenal  
**Branch:** `feat/arsenal-axis-crossing`  
**Author:** @plan  
**Date:** 2026-09-06

> This spec continues the camera journey from Evolution. The Camera Rig
> foundation (ADR-004) is already implemented (`src/components/3d/CameraRig.tsx`,
> wired in `App.tsx`) and will be extended with Arsenal-specific keyframes.

## 2. Visual Goal

Sobrevivência e improviso: "o essencial, construído à mão". A câmera cruza o
eixo do personagem em uma órbita lateral, revelando o wrist/web-shooter em
close foreground. Beat 3 é o movimento de câmera mais complexo da peça —
distinto de Hero (estático + tracking) e Evolution (push-in).

**Copy:**

- Kicker: "O que sobrou"
- Título: "Sem apoio.\nSó o essencial."
- Corpo: "Sem Stark, sem SHIELD, sem ninguém para ligar. Só o que ele mesmo construiu nos pulsos — e a cidade que continua escolhendo proteger."

Texto alinhado à esquerda (mobile), nunca cobre o launcher. Composição com
o wrist dominando o frame.

## 3. Composition

**Mobile (390×844, 430×932):**

- Wrist/launcher domina o frame
- Texto no lado oposto do braço, alinhado à esquerda
- Safe zone: left, max 82vw, min margin 24px
- Risco mitigado: "detalhe ficar pequeno demais" — keyframes mobile próprios

**Desktop (1440×900):**

- Órbita lateral mais ampla
- Texto nunca cobre o launcher
- Safe zone: left, max 560px

Reference: `docs/design/composition-rules.md`

## 4. 3D Assets

**Model:** `public/models/spider-man_brand_new_day-v2.glb` (22.4 MB)  
**Focus:** wrist/web-shooter (mão direita)  
**Rig:** Mixamo — descobrir joints da mão e wrist (análogo à descoberta do
`mixamorig:Head_06` no Hero) via `pnpm inspect:glb` (esperado:
`mixamorig:RightWrist` ou equivalente — confirmar)  
**Validação necessária:** confirmar posição do web-shooter no modelo real

## 5. Lighting

**Base:** manter rig do Hero/Evolution (5 luzes com design tokens)

**Launcher accent:**

- Adicionar PointLight `COLORS.steel` ou `COLORS.signal` dedicada ao launcher
- Iluminar o wrist para legibilidade em close-up
- Intensidade calibrada para não lavar o rim light existente

**Shadows:** habilitados para profundidade do close-up

## 6. Camera

### Camera Journey (continuação do Evolution — ancorada ao código implementado)

> Fonte da verdade para a transição: `evolutionEnd` em
> `src/components/3d/cameraKeyframes.ts` (refinado no Look Dev — peito a
> y ≈ -1.5 mobile / -2.0 desktop). Os keyframes do Arsenal abaixo são hipóteses
> de partida na escala world validada.

**Evolution → Arsenal transition:**

| Keyframe                     | Mobile                   | Desktop                  |
| ---------------------------- | ------------------------ | ------------------------ |
| Evolution end (implementado) | [0.1, -1.0, 3.5] FOV 32  | [0.15, -1.2, 3.0] FOV 26 |
| Arsenal start (hipótese)     | [-3.4, -2.4, 5.0] FOV 36 | [-3.3, -3.1, 4.1] FOV 30 |
| Arsenal end (hipótese)       | [-2.7, -2.5, 3.6] FOV 34 | [-2.5, -3.2, 3.0] FOV 28 |

**Beat 3 — "a câmera cruza o eixo":**

- Lateral orbit do lado direito para o lado esquerdo do personagem
- lookAt foca no wrist/web-shooter (mão direita, world -x)
- Movimento contínuo ao longo de ~150vh de scroll
- Eixo cruza na frente do personagem (z da câmera permanece > 0: 3.0–5.0)

### lookAt

- Evolution end (implementado): [0, -1.5, 0] mobile / [0, -2.0, 0] desktop (peito)
- Arsenal (hipótese): [-0.9, -2.6, 0.1] mobile / [-0.5, -3.3, 0] desktop
  (wrist/web-shooter) — validar no modelo real via descoberta dos joints

## 7. Interactions

**Scroll triggers:**

- Trigger: section enter (Evolution → Arsenal transition)
- Animation: GSAP ScrollTrigger scrub
- Duration: ~150vh de scroll
- Easing: linear scrub, lerp smoothing (k=3)

**Beat 3 — "a câmera cruza o eixo":**

- Trigger: scroll progress 0-100% da seção
- Animation: órbita lateral contínua
- Ápice: 50% do scroll (eixo cruzado)
- Saída: transição para FullBody (pullback)

**Reduced motion:**

- Scroll-triggered animations disabled when `prefers-reduced-motion: reduce`
- Fallback: composição estática no keyframe final do Arsenal
- Iluminação e composição preservadas

## 8. Performance Budget

| Metric                    | Target   | Measurement                  |
| ------------------------- | -------- | ---------------------------- |
| FPS (mobile)              | ≥ 55     | Chrome DevTools on iPhone 12 |
| FPS (desktop)             | ≥ 60     | Chrome DevTools on 1440p     |
| Draw calls (mobile)       | < 50     | Three.js Stats.js            |
| Draw calls (desktop)      | ≤ 150    | Three.js Stats.js            |
| Scroll smoothness         | ≥ 55 FPS | ScrollTrigger scrub sem jank |
| Memory delta vs Evolution | ≤ +10 MB | Chrome DevTools Memory tab   |

> Scroll smoothness = FPS médio durante o scroll de 150vh. Jank = frame drops
> abaixo de 45 FPS por > 100ms.

Reference: `docs/design/performance-design.md`

## 9. Accessibility

**ARIA labels:**

- `<section aria-labelledby="arsenal-title">`
- `<h2 id="arsenal-title">`: "Sem apoio. Só o essencial."

**Keyboard navigation:**

- Tab order skips 3D canvas (decorative)
- Scroll navigation preserved

**Reduced motion:**

- Scroll-triggered animations disabled when `prefers-reduced-motion: reduce`
- Fallback: static composition at Arsenal final keyframe
- Lighting and composition preserved

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
| Asset discovery   | Wrist joints identified in rig   | [ ]    |

**Escalation triggers:**

- [ ] Spec is ambiguous → return to @plan
- [ ] Gate fails after 3 iterations → escalate to human
- [ ] Visual < 4 after 3 iterations → escalate to human
- [ ] Scroll jank after 3 iterations → escalate to human
- [ ] Wrist joints not found → escalate to human
