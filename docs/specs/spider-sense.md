# Spider-sense & respiração por beat

> Wave "micro-craft" 3D (backlog `docs/plans/backlog.md`: IDEIA-3D-10,
> IDEIA-3D-09). Duas respostas do corpo ao mesmo sinal que já move luz e
> câmera — a mudança de beat — sem um draw call novo.

## §1 — Spider-sense nos boundaries (3D-10)

Toda vez que a narrativa cruza um beat, o modelo "sente": o rim **sobe a 3×**
e a cabeça dá um **micro-tick** lateral, decaindo em ~200ms — o arrepio da
fronteira. O gatilho dispara ~6× por scroll completo.

- Sinal: `beatRuntime.beat`; envelope puro em
  `src/components/3d/rig/spiderSense.ts` (step uma vez por frame pelo rig,
  antes dos early-returns — o envelope decai mesmo em statue/reduced-motion).
- **Mount não arrepia**: o primeiro step apenas arma o tracker.
- Rim: o slot `rim` (point, oxide) multiplica a intensidade por
  `1 + 2·envelope` dentro do fade normal do `LightRig` — nenhum light novo,
  nenhum recompile. `instant` (reduced-motion) ignora o boost.
- Cabeça: roll de 0,035 rad no spike aplicado como offset adicional ao
  `composed` de `head` (peso 1) e `neck` (peso 0.4), depois do head-chain —
  o spring de tracking não mascara o tick. O **lado alterna** a cada trigger
  (sign ±1), então boundaries consecutivos não parecem um tique repetido.
- Decay exponencial k=9 com snap a zero abaixo de 0.01 — quando o envelope
  morre, o custo volta a exatamente zero.

## §2 — Respiração dirigida por beat (3D-09)

O peito não respira mais num ritmo constante: **presa e curta no hero** (a
máscara observa), **lenta e funda no fullBody** (o pôster exhala).

- Alvos por beat em `src/components/3d/rig/breath.ts`
  (hero 0.18 Hz × 0.7 · evolution 0.28 × 1.1 · fullBody 0.14 × 1.3 ·
  colophon 0.12 × 1.0, etc.).
- Taxa e amplitude fazem easing exponencial (k=3) e a **fase é integrada**
  (`phase += delta·2π·rate`), nunca recomputada — mudar a taxa nunca faz o
  peito pular.
- Consumo: spine1/spine2 usam a amostra (`sin(phase)·amp`) no lugar do
  antigo `sin(t·2π·0.25)`; amplitudes `MOTION.breath.spine1/spine2`
  inalteradas.
- `prefers-reduced-motion`: statue — a fase pode avançar mas nenhuma pose é
  escrita (comportamento já garantido pelo early-return do rig).

## §3 — Custo

Zero draw calls novos, zero lights novos, zero uniforms por frame além do
multiplicador de intensidade do rim (o mesmo caminho de fade de sempre). O
envelope custa uma multiplicação e um `exp` por frame.

## §4 — Verificação

- Unit: `tests/unit/spiderSense.test.ts` (mount mudo, spike por mudança de
  beat, decay monótono com snap, rim 1×..3×, tick alternante, reset) e
  `tests/unit/breath.test.ts` (amostra limitada, sem salto na troca de
  ritmo, fullBody mais lento que o hero, easing de amplitude).
- Debug: `window.__rig.sense` (envelope) e `__rig.breath` (amostra) no
  `?debug=1`.
- Evidências: `node scripts/collect-spider-sense.mjs` →
  `docs/evidence/spider-sense/`.
