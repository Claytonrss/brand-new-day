# Scene Spec — Câmera Cinematográfica (Wave B)

> **Status:** pronto para implementação
> **Branch:** `feat/cinematic-camera-path`
> **Plano de origem:** `docs/plans/archive/3d-motion-upgrade-plan.md` §4 Wave B
> **Data:** 2026-09-09

## 1. Context

O passeio de câmera é o principal portador da sensação cinematográfica, e hoje
ele é o oposto de cinema: `CameraRig.tsx:98-112` interpola posição, `lookAt` e
`fov` **linearmente** sobre o progresso local de cada segmento de
`cameraPath.ts`, sem nenhuma curva de easing. Consequências verificadas:

1. **Velocidade constante** — nenhum segmento acelera ou desacelera; nada
   "chega" ou "assenta".
2. **Descontinuidade de direção (C1)** exata nas fronteiras 0.25 / 0.375 / 0.5625
   / 0.6875 / 0.875: a câmera muda de rumo instantaneamente, seis vezes por
   página.
3. **O "orbit" do Arsenal não orbita.** Medido sobre
   `cameraKeyframes.ts:44-54`: o azimute da câmera em relação ao punho
   (`WRIST_POSITION`) varia de −27,0° a −27,2° — 0,2 graus. É um dolly reto,
   não uma travessia de eixo, e fere diretamente o Beat 3
   (`memorable-moments.md:27-33`: "a câmera cruzando o eixo").
4. **Nenhum acoplamento com a velocidade do scroll** — o Lenis suaviza o
   scroll, mas nada na cena consome essa informação.
5. **Bug de `prefers-reduced-motion`:** `CameraRig.tsx:52-61` fixa a câmera no
   keyframe `fullBody` para **toda** a página, então o Hero é exibido com
   enquadramento de corpo inteiro.

## 2. Visual Goal

A câmera deve parecer operada por uma pessoa: chega aos lugares, desacelera
antes de parar, e reage (pouco) à velocidade com que o visitante rola.

- Nenhuma mudança brusca de rumo perceptível nas fronteiras de beat.
- O Arsenal deve **cruzar o eixo** do personagem: arco de ~75° em torno do
  punho, terminando do outro lado do eixo de onde começou.
- O recuo final (FullBody) deve "assentar" (ease-out), não parar de repente.
- Em movimento rápido, um **punch de FOV** sutil (±2°) dá a sensação de
  inércia da lente — nunca em `prefers-reduced-motion`.

## 3. Composition

Os enquadramentos aprovados no Look Dev v2 são preservados: os keyframes de
`cameraKeyframes.ts` continuam sendo os **pontos de controle** por onde a curva
passa. Nenhum valor de `position`, `lookAt` ou `fov` de `hero`,
`evolutionStart`, `evolutionEnd` ou `fullBody` é alterado.

A única exceção é o Arsenal, cujos keyframes de posição são **substituídos por
um arco gerado proceduralmente** em torno do punho (`WRIST_POSITION`), porque o
par atual não produz órbita (0,2° medidos). O arco preserva o que estava
aprovado — a distância de início (raio ~5.4) e o raio do close-up final (3.9) —
e muda o azimute de −32° para +43°: é essa variação que produz a travessia de
eixo exigida pelo Beat 3. Os valores de `fov` dos keyframes do Arsenal são
mantidos e interpolados ao longo do arco.

`composition-rules.md` e as zonas seguras de texto não são afetados: a mudança
é de trajetória, não de enquadramento final de cada seção.

## 4. 3D Assets

Nenhum asset novo. Modelo e luzes permanecem os da Wave F.

Ancoragens reutilizadas de `src/components/3d/beat/beats.ts`:
`CHEST_Y` (−1.5 mobile / −2.0 desktop) e `WRIST_POSITION`
([−0.9, −2.6, 0.1] mobile / [−0.5, −3.3, 0] desktop).

## 5. Lighting

Sem mudança. O `LightRig` da Wave F permanece como está; a câmera apenas passa
a consumir o mesmo `BeatProvider`, eliminando o `ScrollTrigger` duplicado que
hoje existe em paralelo (`CameraRig.tsx:78` e `BeatProvider`).

## 6. Camera

### 6.1 Trajetória

Uma **única** `CatmullRomCurve3` por breakpoint (`mobile`, `desktop`)
atravessa todos os pontos de controle na ordem do passeio. Uma curva única é o
que garante continuidade C1 automática nas fronteiras — o problema não pode ser
resolvido com easing por segmento isolado.

Pontos de controle, por breakpoint, nesta ordem:

| Índice | Ponto            | Origem           |
| ------ | ---------------- | ---------------- |
| 0      | `hero`           | keyframe         |
| 1      | `evolutionStart` | keyframe         |
| 2      | `evolutionEnd`   | keyframe         |
| 3..6   | arco do Arsenal  | gerado (ver 6.2) |
| 7      | `fullBody`       | keyframe         |

`lookAt` e `fov` usam curvas/valores paralelos: uma segunda `CatmullRomCurve3`
para o `lookAt` e interpolação de `fov` pelo mesmo parâmetro `u`.

### 6.2 Arco do Arsenal (Beat 3)

Cinco pontos gerados em coordenadas esféricas relativas a `WRIST_POSITION`:

| Parâmetro       | Início | Fim                                        |
| --------------- | ------ | ------------------------------------------ |
| azimute         | −32°   | **+43°** (travessia de ~75°, cruza o eixo) |
| raio            | 5.4    | 3.9                                        |
| altura relativa | +0.2   | 0.0                                        |

Com uma elevação senoidal de +0.35 no meio do arco (`sin(t·π)`) para o
movimento não ser plano.

### 6.3 Mapeamento scroll → curva

Cada beat mapeia para uma faixa `[iInício/(N-1), iFim/(N-1)]` da curva:

| Beat        |     Índices      | Easing                           |
| ----------- | :--------------: | -------------------------------- |
| `hero`      | 0 → 0 (estático) | —                                |
| `chapter1`  |      0 → 1       | smoothstep                       |
| `evolution` |      1 → 2       | easeInOutCubic (push-in lento)   |
| `chapter2`  |      2 → 3       | smoothstep                       |
| `arsenal`   |      3 → 6       | smoothstep                       |
| `fullBody`  |      6 → 7       | easeOutCubic (recuo que assenta) |

`u = (iInício + ease(t)) / (N − 1)`, onde `t` é o progresso local do beat
fornecido pelo `BeatProvider`.

### 6.4 Acoplamento com velocidade

Consumindo `BeatState.velocity` (progresso/segundo, já publicado pelo
`BeatProvider`), com suavização exponencial:

- **FOV punch:** `fov += clamp(velocity · k, −2°, +2°)` — inércia de lente.
- **Dolly lag:** deslocamento de até 0.12 unidades ao longo da direção de
  visão, proporcional à velocidade suavizada.

Ambos **desligados** em `prefers-reduced-motion` e no tier `low`.

### 6.5 Handheld noise

Ruído fbm de baixa frequência (3 oitavas) aplicado à posição (±0.02 unidades
em x/y) e ao alvo do `lookAt` (±0.015), a 0.15 Hz. Desligado em
`prefers-reduced-motion` e no tier `low`.

### 6.6 Suavização

Mantém o lerp exponencial `1 - Math.exp(-2·delta)` (k=2, calibrado com Lenis
na Wave 2) entre o alvo da curva e a câmera aplicada.

### 6.7 `prefers-reduced-motion` (correção do bug)

Sem trigger de scroll: a câmera assume o enquadramento **final de cada beat**,
que é a composição estática daquela seção — `hero`, `evolutionStart`,
`evolutionEnd`, fim do arco, `fullBody` — e transita de forma instantânea.
Fim do comportamento atual de exibir `fullBody` no Hero.

## 7. Interactions

- `CameraRig` deixa de criar seu próprio `ScrollTrigger` e passa a ler
  `BeatProvider.stateRef` por frame — um único trigger na página.
- `BeatState.velocity` passa a ter um consumidor (era groundwork da Wave F).
- Nenhuma nova interatividade de ponteiro; isso é Wave D.

## 8. Performance Budget

A curva é avaliada uma vez por frame (`getPoint` + `getPoint` do lookAt) —
custo desprezível (~2 chamadas, nenhuma alocação: vetores reutilizados via
`useMemo`). Nenhuma mudança em luzes, shaders ou draw calls.

| Métrica                   | Meta                                                                   |
| ------------------------- | ---------------------------------------------------------------------- |
| Draw calls                | mantém 44–46 (Wave F)                                                  |
| `programs`                | mantém 10                                                              |
| Custo da câmera por frame | < 0.1 ms (sem alocação)                                                |
| FPS mobile / desktop      | ≥ 45 / ≥ 55 (medição em dispositivo real — não mensurável em headless) |

## 9. Accessibility

- `prefers-reduced-motion`: sem punch de FOV, sem dolly lag, sem handheld
  noise, e enquadramento estático **correto por seção** (corrige o bug atual,
  que exibia o Hero com enquadramento de corpo inteiro).
- Nenhum elemento de DOM novo; nenhuma mudança em ARIA, foco ou teclado.
- Nenhum conteúdo depende exclusivamente da animação da câmera: copy e
  atribuição CC-BY 4.0 seguem em overlays HTML.

## 10. Stop Conditions

- [ ] `pnpm verify` verde (lint, typecheck, test, build).
- [ ] `pnpm test:visual` verde nos 3 viewports.
- [x] **Métrica de continuidade:** amostrando a posição a cada 1% de scroll e
      medindo o ângulo entre deslocamentos consecutivos, o pico cai de
      **133,9° → 62,1°** (−54%) e o p95 fica em **20,2°** contra 0,0° do
      baseline (que era reto em quase todo ponto e virava ~134° nas fronteiras).
      O teste exige redução ≥ 30% do pico e p95 ≤ 25°.

      O pico restante (62°) é de *staging*, não de código: a câmera precisa
          recuar do close-up do peito para alcançar o punho, então há uma reversão
          real no fim do Beat 2. O ponto de overshoot (`OVERSHOOT`) distribui essa
          reversão ao longo do scroll em vez de deixá-la acontecer parada.

- [ ] **Métrica de órbita:** variação de azimute no Beat 3 ≥ 60°
      (baseline medido: 0,2°).
- [ ] Handheld noise e FOV punch ausentes com `prefers-reduced-motion`.
- [ ] `prefers-reduced-motion` exibe enquadramentos diferentes por seção
      (fim do `fullBody` global).
- [ ] Rubrica: "Ritmo de scroll e câmera" ≥ 4 (requer olho humano) e média
      ponderada ≥ 4.

**Escalar para humano se:** o arco do Arsenal colidir com a geometria ou
cruzar o personagem de forma a esconder o lançador de teia no ápice do beat.
