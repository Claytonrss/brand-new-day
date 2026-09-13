# Backlog — ideias mineradas (2026-09-12)

> Curadoria da varredura de docs: ideias do brainstorm
> (`docs/research/2026-09-12-brainstorm.md`) e de planos executados que
> **ficaram para trás**. Todas foram **verificadas contra o código em
> 2026-09-12** — nenhuma existe hoje. Origem e restrições de design no
> brainstorm original (checado contra `design-bible.md`).

## Quick wins (simples, sem dependência nova)

> Os sete quick wins originais foram **todos executados** — ver "Já
> absorvidos" abaixo (PRs #40 e #41). O que resta aqui são os médios e
> grandes.

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

| ID          | Ideia                                 | Por que está aqui                                                                         |
| ----------- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| IDEIA-3D-08 | **Wrist-cam PiP** no macro do Arsenal | scissor render de outra câmera — custo de engenharia e risco de performance no mobile     |
| AMB-06      | **Áudio diegético opcional**          | exige licenciar assets + política de autoplay/opt-in; projeto separado                    |
| AMB-02/03   | **Skyline + janelas acesas**          | rejeitado na 2ª revisão do Pareto (risco contra "o personagem é o primeiro sinal visual") |

## Já absorvidos (não refazer)

- **Quick wins (PRs #40–#41, 2026-09-13):**
  - PAG-01 tipografia reativa, AMB-08 carimbo por beat, PAG-06 CTA
    magnético, AMB-07 trama do traje — PR #40 (`feat/dom-micro-craft`),
    spec `docs/specs/dom-micro-craft.md`.
  - 3D-10 spider-sense (rim 3× + tick de cabeça alternante nos boundaries),
    3D-09 respiração por beat (presa no hero, funda no fullBody) — PR
    #41 (`feat/spider-sense`), spec `docs/specs/spider-sense.md`.
  - PAG-09 (progress bar como fio de teia) ficou de fora de propósito:
    mexeria na ProgressBar recém-otimizada (Wave 1) — reavaliar pós
    sessão de device.
- 3D-01 landing, 3D-04 lean, PAG-05 beat chrome, AMB-04 chapter print —
  entregues nas Waves 1–5 (PRs #32–#37).
- 3D-03 hard cut — rejeitado na 2ª revisão (quebraria a assinatura contínua).
- PAG-03 web-wipe — parcialmente absorvido pelo chapter print (fio +
  misregistration); o clip-path diagonal não foi aplicado (avaliar se ainda
  soma sobre o print atual).

## Condicionais (ver `PROGRESS.md` Bloco C)

- FALHA-02 (threshold mobile), FALHA-10 (syncTouch), F4b (GLB ≤ 15 MB),
  FALHA-03 (render gating variante segura) — todos esperam os números da
  sessão de device no S23.
