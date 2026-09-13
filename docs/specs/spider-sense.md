# Spider-sense & respiração por beat

> Wave "micro-craft" 3D (backlog `docs/plans/backlog.md`: IDEIA-3D-10,
> IDEIA-3D-09). **v2 — redesenhado em 2026-09-13** depois do aceite em
> device: a v1 (flash de rim ×3 em toda fronteira de beat) lia como "brilho
> ao redor da cabeça" — indistinguível do rim/atmosfera que o herói já tem —
> e disparava já na primeira rolagem. O redesign dá iconografia própria e
> disciplina de gatilho.

## §1 — O halo (iconografia)

Seis traços ondulados hairline (1.5px, `signal`) desenhando-se em leque sobre
o **hemisfério superior** da posição projetada da cabeça — os "emanata" dos
quadrinhos. Nunca abaixo do horizonte: o rosto nunca é coberto
(`composition-rules`).

- Geometria pura em `src/design/senseArcs.ts` (leque −153°…−27°, raios
  0.32–0.46 da caixa, squiggle cúbica com wiggle alternado); testes cobrem
  leque/cobertura da cabeça e stagger ≤150ms.
- Âncora: `SenseAnchor` projeta `ANCHORS.head` pela câmera e publica
  `--sense-x/y` (px de tela) **enquanto o envelope vive** (~600ms por
  disparo); custo em repouso = uma comparação por frame.
- Overlay DOM: `src/components/ui/SpiderSense.tsx` — draw-on de 170ms por
  traço (`pathLength=1` + dash, mesmo idioma do fio do chapter print),
  opacity escrita por rAF direto no elemento; o loop rAF só vive enquanto o
  halo vive (padrão ProgressBar; watcher de 90ms em repouso).
- Reduced-motion: traços nascem desenhados, sem animação; o envelope também
  nunca é escrito no pose (rig statue).

## §2 — A expressão (o corpo responde)

Sem rig facial, a alerta é corporal — três camadas somadas sobre o envelope:

1. **Snap para a lente**: a cabeça gira para a câmera (`atan2` da posição da
   câmera − `ANCHORS.head`, clampeado pelos limites do Beat 1) com blend
   `envelope`; as molas de cabeça (k=6) transformam o blend em estalo e o
   decay em volta ao tracking.
2. **Lentes abrem**: `uLensPulse` recebe `+0.9 × envelope` sobre o alvo do
   beat (`MaterialFxDriver`) — os olhos brilham.
3. **Respiração trava**: a amostra do peito é multiplicada por
   `1 − 0.9 × envelope` (`breathStep(delta, beat, sense)`) — prende e solta
   (catch → exhale) junto com o halo.
4. **Tick lateral**: roll de 0.022 rad alternando lado por disparo
   (head 1.0 / neck 0.4), aplicado depois do head-chain.

## §3 — Disciplina de gatilho

- Dispara **só na entrada** dos três beats de perigo — `evolution`,
  `arsenal`, `fullBody`. Nunca no Hero/Opening/cards/colofon; nunca no mount.
  Primeira ocorrência possível: **37.5% do scroll** (entrada do Evolution).
- Uma vez por entrada: sair e voltar re-arma naturalmente (comparação de
  beat); o **contador travado** (`count`) publica `__rig.senseCount` para
  evidência — sobrevive ao decay (sob SwiftShader o desktop roda a ~5fps e a
  janela visual do envelope fecha antes de um poll externo).
- Envelope: decay exponencial k=4.6 — vida legível (~500ms acima de 0.1),
  zero duro quando < 0.01.

## §4 — Respiração por beat (3D-09)

Inalterada pelo redesign (ver §2 item 3 para a interação): alvos por beat em
`src/components/3d/rig/breath.ts` (hero 0.18 Hz × 0.7 → fullBody 0.14 Hz ×
1.3), taxa e amplitude com easing (k=3) e **fase integrada** — mudar o
ritmo nunca faz o peito pular.

## §5 — Custo

Zero draw calls novos, zero lights, zero post-processing. O halo é DOM
(6 paths SVG) e só existe visualmente por ~600ms por disparo; fora dele, um
`setInterval` de 90ms + uma comparação por frame.

## §6 — Verificação

- Unit: `tests/unit/spiderSense.test.ts` (disciplina de gatilho — inclui
  "não dispara em card/colofon/hero", primeira chance = entrada do
  Evolution; envelope; tick alternante), `tests/unit/breath.test.ts`
  (limites, sem salto, fullBody mais lento, catch sob sense),
  `tests/unit/senseArcs.test.ts` (leque superior, raios, stagger, path).
- Visual: `tests/visual/spider-sense.spec.ts` — não dispara em
  hero/card (`@smoke`), dispara na entrada do Evolution com halo ancorado,
  não re-dispara ao voltar para card. Asserções no latch (`senseCount`).
- Evidências: `node scripts/collect-spider-sense.mjs` →
  `docs/evidence/spider-sense/` (latch por parada, halo aceso, viewports
  390/430/1440).
- Debug: `?debug=1` → `window.__rig.sense` (envelope), `__rig.senseCount`
  (travado), `__rig.breath` (amostra).
