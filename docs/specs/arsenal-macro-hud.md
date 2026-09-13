# Scene Spec: Arsenal — Macro + HUD de anotação

## 1. Context

**Section:** Arsenal (Beat 3)
**Wave:** P2a.1 (plano: `docs/plans/archive/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** hoje o Arsenal é "o braço de outro ângulo" — a câmera orbita,
> mas o enquadramento não é íntimo o suficiente para vender o tema (o que Peter
> construiu com as próprias mãos). É o beat com mais potencial de mostrar
> **engenharia**: ir para o macro do lançador e anotar o detalhe como um
> diagrama técnico. É também onde a micro-interação `WebShoot` vive.

> **Dependência:** esta wave assume P0.1 resolvido (copy fora do pulso) e
> roda junto com P1c (a assinatura de atmosfera do Arsenal — ar seco, luz dura
> — é parte do clima macro).

## 2. Visual Goal

O lançador de teia **preenche o frame** como um close de produto/jóia, e uma
camada de **HUD técnico** anota partes com linhas de chamada finas — como um
diagrama de engenharia, não como UI de game. É o beat que mais diz "alguém
fez isso à mão".

- **Emoção:** sobrevivência, improviso, precisão.
- **Contraste:** depois do close orgânico do peito (Evolution), o macro do
  lançador é **mecânico** — metal, cartucho, gatilho.

**Copy de HUD proposta (mono, técnica, curta):**

- `web-shooter · mk.ii`
- `cartucho de teia · pressurizado`
- `gatilho · duplo toque`
- `construído à mão`

## 3. Composition

**Desktop (1440×900):**

- O lançador ocupa **≥40% da largura** do frame, em macro.
- Linhas de chamada (hairlines) partem de pontos do lançador para labels mono
  nas margens — **nunca** cruzando o detalhe que anotam.
- Copy narrativo do beat (`SEM APOIO. SÓ O ESSENCIAL.`) recua para uma zona
  secundária ou aparece no início do beat e cede lugar ao HUD no macro.

**Mobile (390/430):**

- Linhas de chamada complexas não cabem. O HUD vira uma **legenda inferior**
  (lista mono curta) + no máximo 1–2 marcadores pontuais sobre o lançador.
- O pulso/lançador continua 100% desobstruído (P0.1).

Reference: `docs/design/composition-rules.md` (Arsenal: pulso é o foco).

## 4. 3D / Câmera

- **Câmera macro:** novo(s) keyframe(s) em `cameraPath.ts`/`cameraKeyframes.ts`
  aproximando muito mais do pulso, usando a âncora real (`anchorStore.wrist` —
  ver ADR-013). A órbita de 85° (Wave B) pode permanecer, mas com raio menor.
- **Foco:** `EffectsStack` DOF foca no pulso (já existe foco por beat);
  apertar a `focusRange` no macro para o fundo cair.
- **Luz:** cue do Arsenal vira luz dura de recorte (ver `atmosphere-per-beat.md`).
- **Risco conhecido:** o macro pode revelar costura/limite de geometria ou de
  textura do modelo. Validar em Look Dev; se cruzar artefato, recuar a câmera
  ou ajustar âncora — **não** "consertar" o asset nesta wave.

## 5. Interactions

> **Revisão (feat/arsenal-click-reveal):** o reveal do HUD passa a ser
> gesto-gated nos perfis capazes, em sincronia com a descoberta do disparo
> (`web-shoot-discovery.md §3/§5`) — antes ele surgia por scroll (0.42–0.6),
> fora de fase com o anel do pulso.

- **Perfis capazes** (`!prefers-reduced-motion && tier ≠ low`): o HUD só se
  revela no **primeiro tap do Beat 3** — o mesmo gesto que dispara a teia —
  com fade de 700ms; o anel respirando no pulso (`WebShootHint`) é a
  affordance. Sem tap, **auto-reveal** em progresso local ≥ 0.8 da seção.
  Revelado, permanece visível enquanto a seção estiver ativa e some quando
  ela sai (`onLeave`/`onLeaveBack`), como antes.
- **`prefers-reduced-motion` / tier `low`:** reveal por scroll como antes
  (snap no macro em progresso > 0.5 / envelope 0.42–0.6).
- A copy narrativa continua recedendo por scroll (0.28–0.44), independente do
  reveal.
- HUD de anotação não é interativo (é gráfico), exceto se o pointer-parallax
  (P2b.1) estiver ativo — aí os labels têm parallax sutil.

## 6. Degradação

| Tier                        | Comportamento                                                   |
| --------------------------- | --------------------------------------------------------------- |
| Desktop High                | macro + HUD completo (linhas de chamada) + DOF apertado         |
| Mobile Good                 | macro + legenda inferior + 1–2 marcadores; DOF reduzido         |
| Mobile Low / reduced-motion | enquadramento do lançador legível, HUD estático, sem DOF pesado |

## 7. Critérios de aceite (mensuráveis)

| #   | Critério                                                    | Medição               |
| --- | ----------------------------------------------------------- | --------------------- |
| 1   | Desktop: lançador ≥40% da largura do frame com HUD legível  | screenshot 1440       |
| 2   | Mobile: mesma informação como legenda, pulso desobstruído   | screenshot 390/430    |
| 3   | Nenhum artefato de geometria/textura visível no macro       | revisão Look Dev      |
| 4   | Draw calls/luzes dentro do budget                           | `budget.spec.ts`      |
| 5   | Rubrica "integração texto/personagem" e "originalidade" ≥ 4 | rubrica               |
| 6   | HUD oculto no scroll, revela no tap; auto-reveal no fim     | `interaction.spec.ts` |

## 8. Stop Conditions

- [ ] Macro revela limite do modelo que não dá para contornar → recuar câmera,
      registrar em tech-debt.
- [ ] HUD vira "UI de videogame" → simplificar até ler como diagrama editorial.
- [ ] Copy narrativo some no beat → garantir que o tema (`SEM APOIO…`) ainda
      aterrissa antes do macro.

## 9. Evidências

- `docs/evidence/arsenal-macro-hud/{1440,430,390}-scroll-{60,75}.png`
