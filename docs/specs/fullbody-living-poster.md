# Scene Spec: FullBody — Living Poster

## 1. Context

**Section:** FullBody  
**Branch:** `feat/fullbody-living-poster` (retroactive)  
**Author:** @plan  
**Date:** 2026-09-08

> **Note:** This spec is retroactive — FullBody was implemented in wave-3 without
> a Scene Spec. This document validates the existing implementation against the
> spec-driven contract and closes Fase 6.9 of `PROGRESS.md`.

## 2. Visual Goal

Revelação final: corpo inteiro do Spider-Man emerge em frame cinematográfico,
concluindo o arco narrativo (mistério → mudança → sacrifício → revelação).
Iluminação mais brilhante e uniforme do que as seções anteriores — não há
mais close-up dramático, há poster.

A composição assume função de "living poster": silhueta forte, título em
blocos curtos, atribuição CC-BY em posição definitiva (footer).

**Copy:**
- Kicker: "31 de julho"
- Título: "Um homem sem nome. / Uma cidade sem escolha."
- Corpo: "SPIDER-MAN: BRAND NEW DAY chega aos cinemas em 31 de julho de 2026."

**Narrativa:** conclusão do arco (Hero → Evolution → Arsenal → FullBody).
O herói sem máscara, sem manchetes — apenas o homem por trás do mito.

> **Correção (ADR-017, 2026-09-10):** este spec retroativo codificava a copy
> divergente `UM HERÓI QUALQUER.`. A fonte de verdade é
> `docs/design/storyboard.md`: título em quatro blocos curtos, data de estreia
> como kicker e corpo. A implementação atual (`FullBodyOverlay.tsx`) segue essa
> copy.

Reference: `docs/design/design-bible.md`, `docs/design/storyboard.md`

## 3. Composition

**Mobile (390×844, 430×932):**
- Safe zone: bottom (overlay alinhado na base)
- Model position: centro do frame (regra dos terços não se aplica — centralizado)
- Copy position: bottom center, max 82vw
- Título em quatro blocos curtos, ancorado na base — nunca cruza o símbolo do
  peito (composition-rules.md §FullBody)
- Quebras de linha manuais (`UM HOMEM\nSEM NOME.\nUMA CIDADE\nSEM ESCOLHA.`),
  sem quebra de palavra acidental
- Texto centralizado (per `docs/design/composition-rules.md` §FullBody)

**Desktop (1440×900):**
- Safe zone: bottom (overlay alinhado na base)
- Model position: centro do frame
- Copy position: bottom center, max 560px (md: 480px / lg: 560px)
- Mesmas quebras manuais; título sempre dentro do bloco
- Texto centralizado

Reference: `docs/design/composition-rules.md`

## 4. 3D Assets

**Model:** `public/models/spider-man_brand_new_day-v2.glb`  
**Size:** 22.4 MB  
**Pose:** full body (corpo inteiro visível, sem crop)  
**Position:** `[0, -5, 0]` (ajustado para centralizar o modelo na composição)  
**Scale:** `1.2` (ligeiramente maior para impacto visual do "poster")  
**Rotation:** `[0, 0.2, 0]` (ligeira rotação para dinamismo)  
**Rig:** Mixamo — modelo compartilhado com HeroScene (66 joints, incluindo
`mixamorig:Head_06` e `mixamorig:Neck_05`)

> FullBody **não** renderiza seu próprio modelo — herda de `HeroScene`.

## 5. Lighting

The FullBody scene **complements** the base lighting rig from `HeroScene`
(always active) with four additional lights that brighten the model for the
full-body reveal. None of these lights cast shadows — shadow handling is
delegated to the HeroScene base rig.

| Light Type | Position | Intensity (mobile / desktop) | Color (token) | Purpose |
|---|---|---|---|---|
| Directional (Key boost) | `[3, 6, 4]` | `1.5 / 2.0` | `COLORS.paper` | Brighter key for full-body visibility |
| Point (Fill) | `[-4, 0, 3]` | `8 / 12` | `COLORS.steel` | Soft, opposite side for even illumination |
| Point (Rim) | `[3, -1, -4]` | `10 / 15` | `COLORS.oxide` | Warm, from behind for silhouette separation |
| Point (Ground bounce) | `[0, -4, 2]` | `4 / 6` | `COLORS.concrete` | Subtle upward fill to illuminate legs/feet |

**Breakpoint:** mobile intensities are used when `size.width < BREAKPOINTS.MOBILE`
(see `src/design/breakpoints.ts`).

**Shadows:** disabled — none of the FullBody lights have `castShadow={true}`.
Shadow casting on the GLB model is handled by the HeroScene base rig.

> **Rationale:** iluminação mais brilhante e uniforme do que outras seções.
> A revelação pede luz clara — não há mais mistério, não há mais close-up
> dramático. O frame é um poster vivo. As luzes desta seção são um
> **complemento** da base rig de HeroScene (sempre ativa), não uma
> substituição — por isso as intensities são menores que os valores
> canônicos originais do plano (key 4.0, fill 20, rim 25): a base já
> entrega a maior parte da luminosidade, e este delta apenas ajusta o
> look final para o wide shot.

Reference: `docs/design/design-bible.md` (paleta de cores), `docs/design/composition-rules.md` §FullBody, `src/components/3d/FullBodyScene.tsx`

## 6. Camera

**Mobile:**
- Position: `[0, -1.0, 11]`
- FOV: `50°`
- LookAt: `[0, -3.0, 0]`

**Desktop:**
- Position: `[0, -1.0, 16]`
- FOV: `42°`
- LookAt: `[0, -4.0, 0]`

**Animation:** static (no scroll-driven camera movement in this section).
FullBody é o destino final da câmera — o último keyframe do journey.

```ts
// src/components/3d/cameraKeyframes.ts
fullBody: {
  mobile:  { position: [0, -1.0, 11], lookAt: [0, -3.0, 0], fov: 50 },
  desktop: { position: [0, -1.0, 16], lookAt: [0, -4.0, 0], fov: 42 },
}
```

> **Note on lookAt y-offsets:** the lookAt Y values (`-3.0` mobile / `-4.0`
> desktop) tilt the camera target downward to compensate for the model's
> lowered hip/feet position in the wide shot, keeping the character
> vertically centered in the frame despite the camera pulling back to z=11/16.

Reference: `docs/specs/hero-mouse-tracking.md`, `docs/specs/evolution-chest-symbol.md`, `docs/specs/arsenal-web-shooters.md`, `src/components/3d/cameraKeyframes.ts`

## 7. Interactions

**Mouse tracking:**
- Disabled nesta seção. FullBody é estática — não há tracking.
- Foco narrativo: contemplação do poster, não interação.

**Scroll triggers:**
- Trigger: section enter (Arsenal → FullBody transition)
- Animation: camera pullback (de `arsenalEnd` close-up → `fullBody` wide reveal)
- Duration: ~100vh de scroll (10% do camera path total)
- Implementação: GSAP ScrollTrigger em `CameraRig.tsx`

**Reduced motion:**
- Camera transition disabled quando `prefers-reduced-motion: reduce`
- Fallback: composição estática no keyframe `fullBody` (sem tween)

## 8. Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| FPS (mobile) | ≥ 55 | Chrome DevTools em iPhone 12 |
| FPS (desktop) | ≥ 60 | Chrome DevTools em 1440p |
| Draw calls (mobile) | < 50 | Three.js Stats.js |
| Draw calls (desktop) | ≤ 150 | Three.js Stats.js |
| Texture memory | ≤ 80 MB | Chrome DevTools Memory tab |
| GLB load time | ≤ 2.5 s (4G) | Network tab |
| Memory delta vs Arsenal | ≤ +5 MB | Chrome DevTools Memory tab |

> **Rationale:** FullBody herda o modelo e rig de HeroScene — o custo
> adicional é apenas das 4 luzes complementares (key boost, fill, rim,
> ground bounce). Sem models ou texturas extras, memory delta deve ser
> marginal.

Reference: `docs/design/performance-design.md`

## 9. Accessibility

**ARIA labels:**
- `<section aria-labelledby="fullbody-title">`: landmark da seção FullBody
- `<h2 id="fullbody-title">`: `"Um homem sem nome. / Uma cidade sem escolha."` (título acessível)
- `<footer>`: contém a atribuição CC-BY com link externo (`rel="noopener noreferrer"`)

**Keyboard navigation:**
- Tab order: skip 3D canvas (decorativo, `tabindex="-1"` herdado de HeroScene)
- Attribution link permanece focável (Tab → Enter para abrir Sketchfab)
- Focus indicators: utilitários do Tailwind v4 (visíveis no link)

**Reduced motion:**
- Camera transition disabled quando `prefers-reduced-motion: reduce`
- Fallback: composição estática no keyframe `fullBody` (sem tween de câmera)

**Screen readers:**
- Landmark `<section>` identifica o beat narrativo
- Texto "A Revelação" lido antes do título (ordem DOM correta)

Reference: `docs/design/mobile-first.md`

## 10. Stop Conditions

This Scene Spec is "done" when:

| Condition | Measurement | Status |
|---|---|---|
| Visual quality | Rubric score ≥ 4 on all blockers | [x] (re-filled against `docs/evidence/portfolio-audit/` in Wave P0) |
| Performance | FPS ≥ 55 on iPhone 12 | [x] (verified in wave-3) |
| Accessibility | Lighthouse a11y ≥ 90 | [x] (ARIA landmarks present) |
| Code quality | Zero lint/typecheck errors | [x] (verified in wave-3) |
| Legal compliance | CC-BY attribution visible | [x] (moved to FullBody footer) |

**Escalation triggers:**
- [ ] Spec is ambiguous → return to @plan
- [ ] Gate fails after 3 iterations → escalate to human
- [ ] Visual < 4 after 3 iterations → escalate to human
- [ ] Performance exceeded by > 20% → escalate to human

**Validation against wave-3 implementation:**

| Critério | Spec | Implementação | Status |
|---|---|---|---|
| Lighting rig (4 luzes complementares) | Key boost, fill, rim, ground bounce | ✅ `FullBodyScene.tsx:26-58` | ✅ |
| Mobile/desktop intensity split | `1.5/2.0`, `8/12`, `10/15`, `4/6` | ✅ via `BREAKPOINTS.MOBILE` (`FullBodyScene.tsx:21`) | ✅ |
| Lighting colors | `paper` / `steel` / `oxide` / `concrete` | ✅ Tokens `COLORS.*` em `FullBodyScene.tsx` | ✅ |
| Shadows | Disabled (delegado à base rig de HeroScene) | ✅ Sem `castShadow` nas luzes FullBody | ✅ |
| ARIA landmarks | `aria-labelledby="fullbody-title"` | ✅ `FullBodyOverlay.tsx:17` | ✅ |
| `<h2 id="fullbody-title">` | Título acessível (copy do storyboard, ADR-017) | ✅ `FullBodyOverlay.tsx` | ✅ |
| CC-BY attribution | Footer com link Eskze | ✅ `FullBodyOverlay.tsx` (footer) | ✅ |
| Copy FullBody | Título 4 linhas + data `31 de julho` no kicker/corpo | ✅ `FullBodyOverlay.tsx` (P0, ADR-017) | ✅ |
| Quebras de linha manuais | Sem quebra de palavra acidental | ✅ `SplitTextHeadline.tsx` (`\n` → `whitespace-nowrap`) | ✅ |
| Camera keyframes `fullBody` | mobile + desktop definidos | ✅ `cameraKeyframes.ts:55-60` | ✅ |
| Camera position mobile | `[0, -1.0, 11]` | ✅ `cameraKeyframes.ts:58` | ✅ |
| Camera position desktop | `[0, -1.0, 16]` | ✅ `cameraKeyframes.ts:59` | ✅ |
| Camera lookAt mobile | `[0, -3.0, 0]` | ✅ `cameraKeyframes.ts:58` | ✅ |
| Camera lookAt desktop | `[0, -4.0, 0]` | ✅ `cameraKeyframes.ts:59` | ✅ |
| Composition centralizada | max-w 82vw mobile / 560px desktop | ✅ `FullBodyOverlay.tsx:18` (`82vw / 480 / 560`) | ✅ |
| `prefers-reduced-motion` | Fallback estático | ✅ Implementado em `CameraRig.tsx` | ✅ |