# Scene Spec: Web-Shoot — Descoberta da micro-interação

## 1. Context

**Section:** Arsenal (Beat 3)
**Wave:** P3.1 (plano: `docs/plans/archive/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** a micro-interação `WebShoot` (teia + tranco de lente) já existe
> e funciona — mas **ninguém sabe que pode clicar**. Não há hint, não há
> affordance, e no mobile não há gesto claro. Uma micro-interação escondida é
> uma micro-interação que não existe. Este spec torna a interação
> **descobrível** sem quebrar a imersão.

## 2. Visual Goal

No Beat 3, o visitante percebe — sem instrução externa — que o pulso/lançador
reage a um toque/clique. A descoberta é um pequeno "aha", não um tutorial.

- **Emoção:** agência. "Eu fiz isso acontecer."
- **Restrição:** o hint não pode virar UI de game nem cobrir o lançador.

## 3. Hint de descoberta

Escolher **uma** direção no Look Dev (A preferida por ser diegética):

- **A — pulso no pulso.** Um anel de luz sutil pulsa 1–2 vezes sobre o
  lançador quando o Beat 3 entra (uma única vez, não em loop), como um
  "respirar" do ponto interativo. Some depois.
- **B — label mono.** Um hint de texto pequeno junto ao HUD do Arsenal:
  `toque no pulso`. Mais explícito, menos elegante.

Não usar os dois. O hint aparece **uma vez por sessão** (não a cada scroll) e
**nunca** em `prefers-reduced-motion`.

## 4. Gestos por plataforma

| Plataforma | Gesto  | Alvo                                                                                             |
| ---------- | ------ | ------------------------------------------------------------------------------------------------ |
| Desktop    | clique | idealmente na região do pulso; fallback: qualquer clique no Beat 3 dispara (comportamento atual) |
| Mobile     | toque  | mesma lógica; alvo generoso (o pulso é pequeno em 390px)                                         |

- O disparo já usa `ANCHORS.wrist` (âncora real, ADR-013) — manter.
- Zona de toque: ampliar o alvo no mobile para não exigir precisão de pixel.

## 5. Feedback

- Teia (curva pendurada, 1 draw call) + tranco de lente (FOV kick) — já
  existem; manter.
- Opcional: o label `gatilho · duplo toque` do HUD (`arsenal-macro-hud.md`)
  pode piscar sutilmente no disparo, reforçando causa→efeito.

## 6. Degradação

- Desktop High: teia + kick completos.
- Mobile Good: teia + kick reduzido.
- Mobile Low / `prefers-reduced-motion`: sem hint, sem teia animada (a
  interação some por completo; a seção continua legível).

## 7. Critérios de aceite (mensuráveis)

| #   | Critério                                             | Medição                                      |
| --- | ---------------------------------------------------- | -------------------------------------------- |
| 1   | Visitante descobre a interação sem instrução externa | teste com usuário / revisão                  |
| 2   | Hint não cobre o lançador nem vira UI de game        | screenshot 1440/390                          |
| 3   | Funciona em touch e mouse                            | teste de browser (`motion.spec.ts` + manual) |
| 4   | Hint aparece 1× por sessão, nunca em reduced-motion  | teste                                        |
| 5   | `?debug` mostra o `shotId` incrementando             | `window.__interaction`                       |

## 8. Stop Conditions

- [ ] Hint vira "tutorial" → simplificar até ser um pulso/label único.
- [ ] Alvo de toque exige precisão → ampliar zona.

## 9. Evidências

- Vídeo 1440 e 390 mostrando: entrada no Beat 3 → hint → disparo.
