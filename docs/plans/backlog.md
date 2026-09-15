# Backlog — ideias não implementadas e catálogo de IDs

> Consolidação canônica da varredura de 2026-09-12 (brainstorm original no
> git history) + planos executados que **ficaram para trás**. Ideias
> **verificadas contra o código** — nenhuma existe hoje. Restrições de
> design: `docs/design/design-bible.md` (proibições) e
> `docs/design/composition-rules.md`.

## Quick wins (simples, sem dependência nova)

> Os sete quick wins originais foram **todos executados** — ver "Já
> absorvidos" abaixo (PRs #40, #41 e #44). O que resta aqui são os médios
> e grandes.

| ID           | Ideia                                                                                              | Ganho                                          | Notas                                                           |
| ------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| IDEIA-3D-05  | **Olhar na lente** — hotspot especular nas lentes desloca com o ponteiro                           | o olhar lê-se pelo brilho, não só pela rotação | `lensShader` (Wave C) já toca a lente; soma camada              |
| IDEIA-3D-02  | **Dedos procedurais** — curl por noise + punho fecha no web-shot                                   | mão deixa de ser estátua                       | rig usa 16 joints; **verificar nomes dos bones de dedo** nos 66 |
| IDEIA-3D-06  | **Fio em tensão no Arsenal** — linha fina permanente do pulso para fora do frame, vibrando com fbm | prontidão permanente                           | 1 draw call (linha); combinar com o hint                        |
| IDEIA-3D-07  | **Contraposto idle de ciclo longo** (12–20 s)                                                      | o pôster vivo nunca repete frame               | soma ao sway/weight-shift existentes                            |
| IDEIA-PAG-10 | **Modo attract** — 20 s sem input: drift de câmera + pulse no hint                                 | convida ao scroll sem UI                       | gate reduced-motion; câmera já tem handheld fbm                 |
| IDEIA-AMB-05 | **Thwip de partículas** — micro-burst no impacto do web-shot                                       | payoff físico do tiro                          | reusa o sistema de partículas GPU (1 draw call)                 |
| IDEIA-AMB-01 | **Teias de canto reativas** — fios que flexionam com cursor/gyro                                   | ambientação nas bordas                         | SVG + CSS vars                                                  |
| IDEIA-AMB-09 | **Colofon webbed shut** — fios desenhando sobre o colofon na entrada                               | a página se fecha em teia                      | mesmo mecanismo do fio do chapter print (`pathLength=1`)        |
| IDEIA-PAG-04 | **Fio-guia do cursor (desktop)** — catenária sutil até a borda                                     | a página é tecida                              | só com hover; respeitar reduced-motion                          |

## Grandes / com dependências (decidir conscientemente)

| ID              | Ideia                                 | Por que está aqui                                                                         |
| --------------- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| IDEIA-3D-08     | **Wrist-cam PiP** no macro do Arsenal | scissor render de outra câmera — custo de engenharia e risco de performance no mobile     |
| IDEIA-AMB-06    | **Áudio diegético opcional**          | exige licenciar assets + política de autoplay/opt-in; projeto separado                    |
| IDEIA-AMB-02/03 | **Skyline + janelas acesas**          | rejeitado na 2ª revisão do Pareto (risco contra "o personagem é o primeiro sinal visual") |

## Já absorvidos (não refazer)

- **Quick wins (PRs #40, #41 e #44, 2026-09-13):**
  - PAG-01 tipografia reativa, AMB-08 carimbo por beat, PAG-06 CTA
    magnético, AMB-07 trama do traje — PR #40 (`feat/dom-micro-craft`),
    spec `docs/specs/dom-micro-craft.md`.
  - 3D-10 spider-sense (halo de traços + expressão de alerta nos
    boundaries), 3D-09 respiração por beat (presa no hero, funda no
    fullBody) — PR #44 (`feat/spider-sense`), spec
    `docs/specs/spider-sense.md`.
  - PAG-09 (progress bar como fio de teia) ficou de fora de propósito:
    mexeria na ProgressBar recém-otimizada (Wave 1) — reavaliar pós
    sessão de device.
- 3D-01 landing, 3D-04 lean, PAG-05 beat chrome, AMB-04 chapter print —
  entregues nas Waves 1–5 (PRs #32–#37).
- 3D-03 hard cut — rejeitado na 2ª revisão (quebraria a assinatura contínua).
- PAG-03 web-wipe — parcialmente absorvido pelo chapter print (fio +
  misregistration); o clip-path diagonal não foi aplicado (avaliar se ainda
  soma sobre o print atual).

## Condicionais (data-gated — ver `PROGRESS.md` Bloco A/C)

Esperam os números da sessão de device no S23:

- **FALHA-02** — zona morta de adaptação: 35–45 fps no mobile não degrada
  (threshold medium→low só abaixo de 30 fps). Fix condicionado: threshold
  mobile-only < ~40 fps, só se o T0.5 mostrar o medium na faixa 35–44.
- **FALHA-10** — scroll touch sem suavização (`syncTouch` do Lenis off):
  parte do "feel" pode ser input, não FPS. Testar `syncTouch: true` no S23
  só se fps ≥ 55 com queixa de feel persistente (trade-off: latência).
- **FALHA-03** — canvas renderiza a custo total sob cobertura parcial de
  cards (~50% em fling; reclassificado como não prioritário após
  challenge). Variante segura (pause só em repouso + resume em
  `touchstart`/`wheel`) só se térmica/bateria dói na sessão.
- ~~**F4b** (GLB ≤ 15 MB)~~ — fechado antecipadamente (PR #61, ADR-029:
  23,5 → 6,5 MB meshopt).

## Catálogo de IDs (citados em comentários de código)

Fonte canônica das referências `FALHA-*`/`IDEIA-*` em `src/`, `tests/` e
`scripts/`:

| ID       | Status | Resumo                                                                                                   |
| -------- | ------ | -------------------------------------------------------------------------------------------------------- |
| FALHA-01 | ✅     | tier inicial mobile nascia em `high` — corrigido pelo tier síncrono (PR #32, ADR-022)                    |
| FALHA-02 | ⏳     | zona morta 35–45 fps — condicionado à sessão S23 (acima)                                                 |
| FALHA-03 | ⏳     | render sob cobertura — variante segura condicionada (acima)                                              |
| FALHA-04 | ✅     | shadow map por frame — shadow throttle (PR #33, ADR-023)                                                 |
| FALHA-05 | ✅     | ProgressBar com setState por scroll + `height` — rAF + `scaleY` (PR #32)                                 |
| FALHA-06 | ✅     | `will-change` permanente em centenas de spans — removido (PR #32)                                        |
| FALHA-07 | 🟡     | alocações por frame (GC churn) — parcialmente endereçado em drive-bys (Wave 1); sem verificação dedicada |
| FALHA-08 | ✅     | HDR de CDN externa — self-host (PR #34, ADR-021)                                                         |
| FALHA-09 | ✅     | troca de tier com "pop" instantâneo — só em scroll idle (PR #32, ADR-022)                                |
| FALHA-10 | ⏳     | `syncTouch` do Lenis — condicionado à sessão S23 (acima)                                                 |
| FALHA-11 | ✅     | janela inicial a dpr 2 antes do adapter — absorvida pelo tier síncrono                                   |
| FALHA-12 | ✅     | gate do tiro (`high`) dessincronizado do hint — alinhado (PR #32/#34)                                    |
| FALHA-13 | ✅     | tap disparava tiro E drag — `isTap` no `pointerup` (PR #34)                                              |
| FALHA-14 | ✅     | variantes GLB leves sem uso — superado pelo meshopt único (PR #61, ADR-029)                              |
| FALHA-15 | 🟡     | `gsap.ticker.remove` com arrow nova (vaza em HMR/testes; inócuo em produção)                             |
| FALHA-16 | 🟡     | rest pose lida em render como valor (frágil a refactor; verificar antes de mexer)                        |

🟡 = latente/parcial, sem ação planejada. Os `IDEIA-*` citados em código
(PAG-01, PAG-06, 3D-09, 3D-10, AMB-07, AMB-08) estão em "Já absorvidos".
