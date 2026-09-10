# Scene Spec — Calibração de Âncoras, Cabeça e Suavidade

> **Status:** implementado
> **Branch:** `fix/beat-anchors-and-head-tracking`
> **Origem:** review visual das Waves B/A/C (feedback do stakeholder)
> **Data:** 2026-09-09

## 1. Context

Três problemas foram reportados após as Waves B/A/C:

1. **Seção 2 (Evolution) enquadra a axila no desktop**, não o símbolo do peito.
2. **Seção 3 (Arsenal) não mostra o lançador de teia** — que fica na parte de
   baixo do antebraço — e o braço não se move.
3. **A cabeça vira bem para a direita, mas demais para a esquerda**, e o
   movimento geral ficou "duro".

Diagnóstico por medição (via `window.__rig.world`):

| Fato medido (desktop) | Valor |
|---|---|
| Peito real (`Spine2_04` + `Spine1_03`) | **(1,028; −2,254)** |
| `lookAt` do keyframe de Evolution | **(0; −2,0)** → 1 unidade à esquerda |
| Punho/antebraço real no Beat 3 | **(−1,23; −2,72; −0,38)** |
| `lookAt` do keyframe de Arsenal | **(−0,5; −3,3; 0)** |
| Mão no Beat 3 (pose anterior) | **(−2,34; −3,32; 0,44)** — ombro abaixo, sem apresentação |
| Cabeça: yaw com ponteiro à esq. / dir. | **−0,31 / +0,48** (assimétrico por causa da rest pose) |

Causa raiz: cada consumidor tinha sua própria âncora hardcoded e elas
discordavam entre si. O modelo desktop fica em `x ≈ 1,02` (offset de
composição), mas a câmera mirava em `x = 0`.

## 2. Visual Goal

Cada beat deve mirar **o joint que ele promete**: peito no Beat 2, punho no
Beat 3, com o braço apresentando a parte de baixo do antebraço para uma câmera
posicionada abaixo. A cabeça deve responder de forma quase simétrica, com o
lado esquerdo deliberadamente mais contido. O passeio não deve parar a cada
fronteira de beat.

## 3. Composition

Nenhuma mudança nas posições autorais de composição: o offset do modelo no
desktop (x ≈ 1,0, com o texto à esquerda) é intencional e é **preservado** — a
correção é aplicada como delta (`medido − autoral`), não como reposicionamento.
`hero` e `fullBody` não recebem correção.

## 4. 3D Assets

Nenhum asset novo. Âncoras lidas do esqueleto existente (66 joints).

## 5. Lighting

O spotlight do Beat 2 passa a mirar a altura do peito **medida**
(`ANCHORS.chest.y`) em vez do literal `CHEST_Y`.

## 6. Camera

- `CameraTrack` ganha correção de âncora: para `evolution` e `arsenal`, o
  delta entre a âncora medida e a autoral é somado a `position` e `lookAt` do
  segmento inteiro.
- O arco do Arsenal passa a orbitar a âncora real do antebraço com alturas
  **abaixo** do punho (`startHeight −0,8`, `endHeight −0,6`), para ver a parte
  de baixo.

## 7. Interactions

- **Easing:** os beats intermediários passam de `smoothstep`/`easeInOutCubic`
  para **`linear`**. Qualquer ease-in-out zera a derivada nas pontas, então a
  câmera *parava* em cada fronteira — a sensação de "duro" reportada. O suavizador
  exponencial do `useFrame` (k=2) já arredonda as quinas; só a aterrissagem
  final (`fullBody`, `easeOutCubic`) mantém ease próprio.
- **Cabeça:** `headYawTarget(x, baseYaw)` — bias `baseYaw · −0,6` (compensa a
  rotação de −0,25 rad do grupo no desktop) e limites assimétricos
  (**direita 0,42 / esquerda 0,30**).
- **Rig:** respiração 0,006→0,008, sway 0,02→0,028, peso 0,015→0,02, mola de
  pose 9→5,5 (assentamento mais macio).
- **Handheld** da câmera: 0,02→0,028 (posição) e 0,015→0,02 (lookAt).
- **Pose do Arsenal:** `foreArmR` de −0,25 para **−1,1 rad** (~63° de flexão).
  Medido: sobe a mão ~0,55 unidades e deixa o antebraço horizontal.

## 8. Performance Budget

Sem custo novo: `updateAnchors` faz 4–6 `getWorldPosition` por frame, sem
alocação. Draw calls e `programs` inalterados.

## 9. Accessibility

`prefers-reduced-motion` continua congelando rig e câmera; o enquadramento
estático por seção agora também usa as âncoras medidas.

## 10. Stop Conditions

- [x] `pnpm verify` verde.
- [x] **Âncora de Evolution** mira o peito medido: `lookAt` corrigido por
      `medido − autoral`, coberto por teste unitário.
- [x] **Câmera do Arsenal** mira o antebraço medido (−1,81; −2,98) com a câmera
      0,42 unidades **abaixo**, olhando para cima.
- [x] **Cabeça quase simétrica:** deltas medidos −0,112 (esq.) / +0,119 (dir.)
      no desktop; no mobile −0,147 / +0,195 (esquerda contida por projeto).
- [x] **Movimento mais macio:** beats intermediários lineares; curvatura
      mediana do caminho ≤ 30°/unidade (medido 14–16).
- [x] 60 testes unitários verdes (9 novos de âncoras/cabeça).
- [ ] **Aprovação visual humana** da pose do Arsenal e do novo enquadramento
      de Evolution (evidências em `docs/evidence/wave-p0-calibration/`).
