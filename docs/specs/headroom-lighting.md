# Scene Spec — Headroom (Wave F)

> **Status:** ✅ implementado — 3D Motion Upgrade (PRs #17–#29)
> **Branch:** `perf/headroom-lighting`
> **Plano de origem:** `3d-motion-upgrade-plan.md` §4 Wave F
> **Data:** 2026-09-09

## 1. Context

Wave F é pré-requisito de todas as waves de movimento e efeito (B, A, C, E, D).
Hoje as quatro cenas — `HeroScene`, `EvolutionScene`, `ArsenalScene`,
`FullBodyScene` — ficam montadas **permanentemente** (`src/App.tsx:86-92`),
somando ~10 luzes ativas em qualquer ponto do scroll, das quais 3 projetam
sombra (incluindo uma point light, cuja sombra custa 6 render passes).

O objetivo desta wave **não é mudar o look**: é devolver orçamento de GPU
(draw calls e ms/frame) mantendo a iluminação aprovada no Look Dev v2, e criar
a infraestrutura de _beat_ que as próximas waves vão consumir.

Seções afetadas: todas (Hero, Chapter 1, Evolution, Chapter 2, Arsenal, FullBody).

## 2. Visual Goal

O visitante não deve perceber nenhuma mudança na iluminação entre o antes e o
depois desta wave — com duas exceções intencionais:

1. transições entre seções passam a ter **dissolve de 450 ms** entre conjuntos
   de luz (antes, a troca era instantânea ou inexistente, porque tudo estava
   aceso ao mesmo tempo);
2. em dispositivos de tier `low`, as sombras são desligadas
   (`profile.shadows`) e o dpr cai para 1 — a iluminação em si é preservada,
   porque o custo desta cena está em passes de sombra e fill rate, não em
   contagem de luzes (`performance-design.md:46-54`).

## 3. Composition

Sem mudança de composição. Nenhum keyframe de câmera, escala, posição ou
rotação do modelo é alterado. O modelo permanece em `heroModelLayout.ts`
(head em y = 0.45 mobile / 0.40 desktop) e continua sendo renderizado por um
único componente (`Stage`), idêntico ao `HeroScene` de hoje, apenas sem luzes.

Atribuição CC-BY 4.0 permanece no overlay HTML (fora do escopo desta wave) e
não é tocada.

## 4. 3D Assets

- Modelo: `public/models/spider-man_brand_new_day-v3-meshopt.glb` (6.5 MB, 16 meshes,
  11 materiais, 273k vértices / 278k triângulos, skins de 66 bones — ADR-029, **0 clips
  de animação**).
- Texturas: 30 imagens WebP somando **3.0 MB** — dentro do budget; **nenhuma
  recompressão de textura é necessária nesta wave**.
- Constatação da auditoria: o peso do GLB é **geometria não comprimida**
  (~19 MB; o arquivo não usa Draco nem meshopt — `extensionsUsed` =
  `EXT_texture_webp`, `KHR_materials_emissive_strength`,
  `KHR_materials_specular`). Isso estoura o budget de ≤ 15 MB e é tratado em
  item separado (F4b), fora desta wave, por exigir re-export do asset.
- Nenhum asset novo é adicionado.

## 5. Lighting

Um único `LightRig` substitui as quatro cenas. Em vez de montar/desmontar
luzes por beat, existem **6 slots permanentes**; cada beat altera apenas
intensidade, posição e cor, com dissolve.

| Regra                   | Valor                                                             | Motivo (medido)                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slots de luz            | 6 permanentes: `ambient`, `key`, `rim`, `accent`, `fill`, `sweep` | montar/desmontar luz muda os defines do shader (`NUM_POINT_LIGHTS`) e força recompilação: `programs` subiu de 10 para 27 com stalls de 200–600 ms durante o scroll |
| Emissores de sombra     | **1** (`key` directional 1024)                                    | cada caster = 1 pass extra × 16 meshes                                                                                                                             |
| Sombra de point light   | **proibida**                                                      | cubemap = 6 passes — era o maior custo individual do baseline                                                                                                      |
| Sombra do spot (Beat 2) | desligada nesta wave                                              | decisão de budget (ver §8); a auto-sombra do Beat 2 volta na Wave C via shader dedicado                                                                            |
| Transição               | dissolve de intensidade/posição/cor, `1 - Math.exp(-6·delta)`     |                                                                                                                                                                    |

Base constante — reproduz o composite aprovado no Look Dev v2, que mantinha o
rig do Hero aceso em todas as seções — mais acentos por beat:

| Slot                        | Base (todos os beats)          | Acentos por beat                                                                   |
| --------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `ambient`                   | `steel` 0.35                   | —                                                                                  |
| `key` (directional, sombra) | `paper` 3.0 @ [5, 8, 3]        | `fullBody`: posição [3, 6, 4]                                                      |
| `rim` (point)               | `oxide` 30cd @ [3, 1, 4] d10   | `fullBody`: 15cd @ [3, -1, -4] d18                                                 |
| `accent` (point)            | `signal` 15cd @ [-2, 3, 5] d8  | —                                                                                  |
| `fill` (point)              | `steel` 14cd @ [-4, 2, -2] d12 | `arsenal`: `steel` 6/8cd no punho d4 · `fullBody`: `steel` 8/12cd @ [-4, 0, 3] d20 |
| `sweep` (spot)              | 0                              | `evolution`: varredura do Beat 2                                                   |

O Beat 2 mantém exatamente o comportamento do
`EvolutionScene.tsx:83-109`: intensidade 0 → 18 (ápice em 60 % do beat) →
resíduo 2, com varredura de x −0.4 → 0.4 sobre o símbolo do peito
(`CHEST_Y` = −1.5 mobile / −2.0 desktop), agora dirigido pelo progresso local
do beat em vez de um ScrollTrigger privado.

## 6. Camera

Sem mudança. `CameraRig` continua usando `CAMERA_PATH` linear — a substituição
por curva é a Wave B e **não** faz parte desta spec. O `BeatProvider` apenas
observa o progresso; não move a câmera.

## 7. Interactions

- `BeatProvider` usa **um** master `ScrollTrigger` (`document.body`,
  `top top` → `bottom bottom`, `scrub: true`) e publica
  `{ beat, t, progress, velocity }`.
- `velocity` (progresso/segundo, via `self.getVelocity()` normalizado pela
  altura da viewport) é exposto agora como groundwork para a Wave B
  (FOV punch, dolly lag). Nenhum comportamento o consome nesta wave.
- Atualização de beat dispara re-render apenas na troca de beat (6 vezes no
  scroll inteiro), nunca por frame.
- `prefers-reduced-motion`: o dissolve é instantâneo e a varredura do Beat 2
  fica fixa no resíduo.

## 8. Performance Budget

Medições reais (Chromium headless, 3 viewports, 6 posições de scroll,
contador de draw calls injetado via `WebGLRenderingContext`). Valores de FPS
deste ambiente **não são válidos** — o headless usa rasterização por software
(SwiftShader, 1–5 FPS em qualquer versão); servem apenas pontos de comparação
relativa.

| Métrica                    | Antes (`main`)               | Depois                               | Medição                           |
| -------------------------- | ---------------------------- | ------------------------------------ | --------------------------------- |
| Luzes na cena              | ~10 permanentes              | 6 slots permanentes                  | inspeção de `lightCues.ts`        |
| Emissores de sombra        | 3 (1 point light = 6 passes) | **1** (directional 1024)             | `castShadow`                      |
| Draw calls por frame       | **118–120**                  | **44–46** (`medium`) · 11–13 (`low`) | contador WebGL                    |
| `programs` (recompilações) | crescia 10 → 27 no scroll    | estável em **10**                    | `gl.info.programs`                |
| Triângulos por frame       | ~506 k                       | ~458 k                               | `gl.info.render.triangles`        |
| dpr high / medium / low    | 2 / 1.5 / 1                  | **1.75 / 1.25 / 1**                  | `qualityContext.ts`               |
| GLB                        | 22.4 MB                      | 22.4 MB                              | **não resolvido aqui** → item F4b |

Composição dos 44–46 draw calls medidos (não estimados): 16 meshes + 16 passes
de sombra + ~13 passes de post-processing (bloom com `mipmapBlur`, vignette,
noise, cópias do composer) + 1 de partículas. A estimativa original de 32 não
contabilizava o post-processing.

**Decisão registrada (2026-09-09):** o limite de ≤ 40 draw calls desta spec
estava errado — foi substituído por **≤ 48 no tier `medium`/`high`** e
**≤ 16 no tier `low`**. Manter a sombra do spot custaria +16 passes (62 total)
e foi recusado em favor do budget; o Beat 2 recupera auto-sombra na Wave C com
shader dedicado. O dpr reduzido (1.75 / 1.25) foi mantido.

`PerformanceMonitor` passa a expor `window.__perf` com
`{ fps, ms, calls, triangles, programs, geometries, textures }` para que o
Playwright possa asseverar budget (Wave G) e para o HUD `?debug=1`.

## 9. Accessibility

- Nenhuma mudança em ARIA, foco ou navegação por teclado (nada de DOM novo,
  exceto o HUD de debug, que não renderiza sem `?debug=1`).
- `prefers-reduced-motion`: dissolve instantâneo, varredura do Beat 2
  desativada, partículas já paradas — a composição estática precisa continuar
  legível (critério "Motion reduzida ainda bonita", rubrica peso 1, mínimo 3).
- Correção parcial de bug conhecido: hoje, com reduced-motion, a câmera fica
  travada no enquadramento `fullBody` para a página inteira
  (`CameraRig.tsx:52-61`). Esta wave **não** corrige (é Wave B5), mas o
  `LightRig` passa a acompanhar o beat real do scroll, de modo que a luz
  corresponde à seção de fato visitada.

## 10. Stop Conditions

Parar e abrir PR quando todos forem verdadeiros:

- [x] `pnpm verify` verde (lint, typecheck, test, build).
- [x] `pnpm test:visual` verde nos 3 viewports (48 testes; o Arsenal/1440 é
      sensível ao timeout de 120 s neste ambiente e deve ser reexecutado
      isolado se falhar por timeout).
- [x] Draw calls por frame ≤ 48 no tier `medium`/`high` (medido: 44–46) e
      ≤ 16 no tier `low` (medido: 11–13).
- [x] `programs` estável durante o scroll (medido: 10, sem crescimento).
- [x] Nenhuma luz com `castShadow` em point light; somente o `key` projeta
      sombra.
- [x] Diff de pixels antes/depois revisado por humano: hero 2–9 %, capítulos
      1–5 %, fullBody 5–17 %, arsenal 7–25 %, evolution 16–25 %
      (evidências em `docs/evidence/wave-f-headroom/`).
- [ ] FPS médio ≥ 45 no tier `medium` (mobile) e ≥ 55 no tier `high` —
      **pendente**: exige dispositivo real ou Chromium com GPU; o headless
      atual usa SwiftShader.
- [ ] Rubrica visual: "Iluminação e silhueta" ≥ 4 e "Performance percebida
      mobile" ≥ 4; média ponderada ≥ 4 — **pendente**: requer olho humano.

**Escalar para humano se:** o look aprovado no Look Dev v2 não for reproduzível
com ≤ 4 luzes por beat em qualquer seção (nesse caso, a restrição vira decisão
de produto, não de engenharia).
