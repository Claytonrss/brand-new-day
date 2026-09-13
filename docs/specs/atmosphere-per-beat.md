# Scene Spec: Atmosfera por Beat (assinatura de ritmo)

## 1. Context

**Section:** transversal (todos os beats)
**Wave:** P1c.1 (plano: `docs/plans/archive/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** hoje a atmosfera é uma **nota contínua** — vermelho/preto com a
> mesma densidade de partículas e a mesma luz do início ao fim (ver `docs/
evidence/portfolio-audit/`). O scroll é suave, mas a _textura temporal_ é
> plana: nenhuma seção "sente" diferente da anterior sem ler o texto. O
> projeto já tem `BeatProvider` (fonte única de beat), atmosfera em GPU (1
> draw call) e `LightRig` com cues por beat — falta **dirigir** esses
> parâmetros por beat como decisão de design.

## 2. Visual Goal

Cada beat ganha uma **assinatura de atmosfera** própria, de modo que um scroll
rápido (sem ler) já comunique mudança de capítulo. A variação é de densidade,
temperatura de luz e textura — **não** de ângulo de câmera (isso já existe).

> Regra de ouro (de `memorable-moments.md`): a assinatura existe porque
> reforça a emoção da seção. Se um parâmetro não reforça a emoção, ele sai.

## 3. Assinatura por beat

| Beat          | Emoção                   | Densidade de partículas   | Temperatura de luz           | Textura / extra                            |
| ------------- | ------------------------ | ------------------------- | ---------------------------- | ------------------------------------------ |
| **Hero**      | anonimato, solidão       | baixa (ar limpo, frio)    | fria, contraste alto         | grão presente; névoa fina                  |
| **Evolution** | transformação interna    | alta, lenta (ar pesado)   | aquece no varrido do símbolo | partículas reagem ao spotlight (já existe) |
| **Arsenal**   | sobrevivência, improviso | média, ar "limpo" e seco  | luz dura de recorte          | menos grão; foco em nitidez do material    |
| **FullBody**  | revelação, poster        | muito baixa (quase vazio) | luz clara e uniforme         | mínimo de textura; foco total na silhueta  |
| **Colophon**  | resolução, autoria       | mínima                    | apagada, quieta              | quase sem atmosfera                        |

> As transições entre beats fazem **crossfade** dos parâmetros (densidade,
> cor de névoa, intensidade), nunca corte seco. As chapter cards são os pontos
> de respiração onde o crossfade acontece por completo.

## 4. Implementação (direção, não código)

- **Fonte de verdade:** `BeatProvider` publica `{ beat, t, progress, velocity }`.
  Atmosfera, luz e FX consomem o mesmo estado (já é o padrão do projeto).
- **Atmosfera (`Atmosphere.tsx` / `particlesShader.ts`):** uniform de densidade/
  opacidade por camada, interpolado por beat. Movimento continua no vertex
  shader (1 draw call).
- **Névoa (`FogExp2`):** densidade e cor por beat, com crossfade.
- **Luz (`LightRig`/`lightCues.ts`):** cada beat já tem cue; ajustar cor/
  intensidade para a assinatura da tabela acima.
- **Post-processing (`EffectsStack`):** intensidade de grão/vinheta por beat
  (Hero mais grão; FullBody quase limpo). Respeitar `?fx=off|subtle|full`.

## 5. Degradação por tier

| Tier                                  | Comportamento                                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Desktop High                          | assinatura completa (partículas + névoa + grão por beat)                                                                         |
| Mobile Good                           | densidade reduzida; crossfade mantido; grão sutil                                                                                |
| Mobile Low / `prefers-reduced-motion` | atmosfera estática por beat (sem drift), crossfade vira corte suave; assinatura ainda legível por **luz/cor**, não por movimento |

Reference: `docs/design/quality-matrix.md`, `performance-design.md` (ordem de
degradação: post-processing primeiro, silhueta nunca).

## 6. Critérios de aceite (mensuráveis)

| #   | Critério                                                                 | Medição                                         |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| 1   | Em scroll rápido, cada beat "sente" diferente sem ler texto              | revisão humana + capturas por beat              |
| 2   | Crossfade entre beats sem corte/pop perceptível                          | vídeo de scroll (`evidence:motion`)             |
| 3   | Draw calls inalterados (atmosfera continua 1 draw call)                  | `budget.spec.ts`                                |
| 4   | `prefers-reduced-motion`: assinatura por luz/cor presente, sem movimento | `reduced-motion.spec.ts` (0% diff de movimento) |
| 5   | Rubrica "ritmo de scroll e câmera" e "sensação cinematográfica" ≥ 4      | rubrica                                         |

## 7. Stop Conditions

- [ ] Uma assinatura não reforça a emoção do beat → remover o parâmetro.
- [ ] Crossfade vira "arco-íris" de transição → reduzir amplitude de cor.
- [ ] Custo de GPU sobe além do budget → reduzir densidade antes de remover a
      assinatura (performance-design).

## 8. Evidências

- `docs/evidence/atmosphere-per-beat/{hero,evolution,arsenal,fullbody,colophon}-{390,1440}.png`
- Vídeo de scroll completo por viewport mostrando os crossfades.
