# Scene Spec — Interatividade do Modelo (Wave D)

> **Status:** implementado
> **Branch:** `feat/atmosphere-depth` (mesma branch da Wave E, a pedido)
> **Plano de origem:** `docs/plans/archive/3d-motion-upgrade-plan.md` §4 Wave D
> **Data:** 2026-09-09

## 1. Context

Até esta wave a cena só reagia a **scroll** e ao ponteiro de forma passiva (o
head-tracking da Wave A). O canvas é `pointer-events: none` — necessário porque
as seções HTML rolam por cima —, então não havia nenhuma interação direta com o
personagem: nem arrastar, nem tocar, nem reagir a gesto.

Além disso, `memorable-moments.md:41-42` fecha o Beat 3 no lançador de teia, mas
nada na cena acontece quando o visitante clica.

## 2. Visual Goal

- **Arrastar** o personagem orbita-o suavemente (±12°) e ele **volta sozinho**
  ao lugar quando a mão solta — brinquedo, não bug.
- No **mobile**, inclinar o aparelho produz um parallax discreto (sem exigir
  toque).
- No **Beat 3**, tocar/clicar dispara uma **teia** com cara de teia (curva
  pendurada), com recuo do punho e um leve tranco na lente.
- A luz de recorte **acompanha o cursor**, dando presença ao gesto.

## 3. Composition

Sem mudança de enquadramento, keyframes, rig ou luz estática. O arrasto só
adiciona rotação ao **grupo do modelo** (nunca a bones), então nenhuma pose é
sobrescrita. O texto é HTML, fora do canvas, e não é afetado.

## 4. 3D Assets

Nenhum asset novo. A teia é geometria procedural (`THREE.Line` com 13 pontos,
um único draw call, reutilizada).

## 5. Lighting

O slot `accent` do `LightRig` passa a receber um deslocamento de até 0,35
unidades vindo do cursor (`rimOffset`). Nenhuma luz nova.

## 6. Camera

O tranco da lente é um impulso de FOV de até **1,5°** (`INTERACTION.cameraKick`)
que decai exponencialmente — some em ~0,5 s. Nada de shake de posição.

## 7. Interactions

### 7.1 Arrastar para orbitar (D1)

| Parâmetro          | Valor                                  |
| ------------------ | -------------------------------------- |
| Limites            | yaw ±0,21 rad (±12°) · pitch ±0,12 rad |
| Sensibilidade      | 0,0045 rad/px (yaw) · 0,003 (pitch)    |
| Retorno ao repouso | `1 − exp(−4·delta)`                    |
| Dispositivos       | **somente `(hover: hover)`**           |

O clamp é joelho suave (`tanh`), nunca corte duro. Listener no `window`
(o canvas é `pointer-events: none`).

**Hover-only (emenda 2026-09-13):** em touch, todo swipe de scroll começa com
um `pointerdown` no `window` — o drag brigava com o gesto primário da página e
transmitia o tremor do dedo ao modelo sem suavização (`alpha = 1` durante o
arrasto), além de somar com o gyro. A condição de escala "arrasto compete com o
scroll em touch" prevista nas Stop Conditions disparou em uso real. No touch o
drag-orbit fica desligado; o mobile mantém giroscópio (§7.2), tap-to-shoot
(§7.4) e drift idle. Desktop (mouse) intocado — drag não conflita com wheel.

### 7.2 Giroscópio (D2)

`deviceorientation` com **calibração na primeira leitura** (o modelo não salta
ao anexar o listener) e limites de ±0,12 / ±0,06 rad. Indisponível ou negado →
sem efeito, sem erro.

### 7.3 Luz de recorte (D4)

`rimOffset(pointerX, pointerY, 0.35)` soma ao slot `accent`.

### 7.4 Teia no Beat 3 (D3)

- Gatilho: `pointerdown` **enquanto o beat é `arsenal`** e tier `high`.
- Origem: âncora do punho medida (`ANCHORS.wrist` — ADR-013).
- Direção: `camera.getWorldDirection()` × 6 unidades.
- Geometria: 13 pontos com **queda quadrática** (máx. 0,22 unidades no meio,
  zero nas pontas) — lê como teia, não como laser.
- Vida: 0,7 s; extensão nos primeiros 35%, fade no resto. Uma instância só,
  geometria reescrita no lugar (1 draw call).

### 7.5 Piscada estilizada (E+D)

O asset não tem pálpebras. A piscada é um obturador de shader com duas partes:

- **E (pálpebra):** superfícies superior e inferior na cor do traje fecham até
  se encontrar no meio; o eixo vertical vem do **bounding box real do mesh**
  (`measureLidBounds`), não do UV.
- **D (compressão):** a lente encolhe 30% em direção ao próprio centro no ápice,
  para ler como olho fechando e não como brilho sumindo.

Cadência aleatória de 2,6–7,2 s, duração 180 ms, `?blink=off|subtle|full|hold`,
desligada em `prefers-reduced-motion`. Medição de aceite: pixels com luminância

> 200 na região do rosto caem **98,1%** no ápice.

## 8. Performance Budget

| Recurso          | Custo                                                        |
| ---------------- | ------------------------------------------------------------ |
| Teia             | 1 draw call (só no Beat 3 e tier `high`)                     |
| Listeners        | 5 no `window`, todos passivos exceto onde necessário         |
| Estado por frame | sem alocação (vetores reutilizados; `INTERACTION` é mutável) |

Draw calls base mantidos (44 no desktop `fx=subtle`).

## 9. Accessibility

- `prefers-reduced-motion`: **tudo desligado** — arrasto não rotaciona, giro
  ignorado, teia não dispara, rim fixo. Há teste dedicado.
- Nenhum DOM novo, nenhum impacto em ARIA, foco ou teclado.
- O arrasto não bloqueia o scroll: o gesto é lido no `window` e o Lenis continua
  dono do eixo vertical.

## 10. Stop Conditions

- [x] `pnpm verify` verde (lint, typecheck, test, build).
- [x] **Arrasto orbita e volta:** teste de browser mede `yaw` > 0,02 durante o
      arrasto e decrescente após soltar (3 viewports).
- [x] **Luz acompanha o cursor:** `rimX` negativo à esquerda, positivo à direita.
- [x] **Teia dispara:** clique durante o Arsenal incrementa `shotId`.
- [x] **Reduced motion:** `yaw` permanece 0 e `dragging` falso durante arrasto.
- [x] 83 testes unitários (12 novos de interação) · 12 testes de browser.
- [ ] **Aprovação visual humana** do gesto e do desenho da teia.
- [ ] Giroscópio em dispositivo real (não há sensor no Chromium headless).

**Escalar para humano se:** a teia não for legível em 0,7 s. (A competição
arrasto × scroll em touch foi escalada, confirmada e resolvida pela emenda
hover-only de 2026-09-13 em §7.1.)
