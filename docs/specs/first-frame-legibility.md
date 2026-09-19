# Scene Spec: First Frame & Legibility Wave

## 1. Context

**Section:** Cross-section (Opening, Hero, Evolution, Arsenal, FullBody, Colophon + chrome)
**Branch:** `feat/first-frame-legibility`
**Author:** @plan
**Date:** 2026-09-18

Wave de correção originada da avaliação visual ao vivo (2026-09-18) contra a
Design Bible. Quatro gaps P1/P2 e um pacote de polish P3, em uma única PR:

1. A primeira dobra não exibe o personagem (cartão 100% opaco esconde a cena).
2. A atribuição CC-BY, duplicada em 4 seções, cruza o personagem em
   momentos-chave e chega a colidir com body copy (Arsenal mobile).
3. Texto das seções assenta sobre olhos/símbolo do peito sem scrim (FullBody),
   com contraste insuficiente sobre o traje (Evolution).
4. Bordas duras: retângulo `bg-ink` dos ChapterCards contra a cena; corte das
   pernas no FullBody mobile; Colophon com ~40% de viewport morto.
5. Polish: scrollbar nativa clara, ProgressBar lendo como linha solta, hint
   "clique no anel" quase invisível, moiré na textura do traje em close-up.

Decisões de arte aprovadas pelo usuário (2026-09-18): **cartão translúcido**
no Opening, **badge fixo de chrome** para atribuição, **Colophon 140→115dvh**.

## 2. Visual Goal

O primeiro frame deve já conter presença do personagem — "abriu um frame de
filme", não "carregou uma página" (Design Bible, Promessa da primeira dobra).
Atribuição legal presente como chrome discreto de HUD, nunca como linha
flutuante sobre o render. Todo texto legível em área segura, sem competir com
rosto, olhos, símbolo do peito ou lançador (`composition-rules.md`). Transições
entre zonas dissolvem em gradiente, nunca linha reta — "o personagem emerge do
preto, nunca está colado sobre um fundo".

## 3. Composition

**Mobile (390×844, 430×932):**

- Safe zone: margens horizontais ≥ 24px; bloco de texto ≤ 82vw.
- Opening: título na zona opaca do cartão (topo); máscara fantasma na base.
- Hero: máscara/torso dominam os ⅔ inferiores; copy superior esquerda.
- Evolution: texto à direita, hold centrado, nunca cruzando o símbolo.
- Arsenal: pulso/lançador foco; copy lado oposto; callouts no terço inferior.
- FullBody: corpo nos ⅔ superiores; título centralizado no terço inferior.
- Badge de atribuição: `fixed` no canto inferior — **direita no mobile,
  esquerda no desktop** — compacto em telas pequenas (© + creator + licença;
  título e nota de modificação permanecem para leitores de tela e no desktop),
  nunca sobre a copy das seções.

**Desktop (1440×900):**

- Safe zone: texto nas laterais; espaço negativo preservado.
- Evolution: bloco à direita com scrim de borda direita.
- FullBody: título no terço inferior centralizado; símbolo acima dele.
- Badge de atribuição: canto inferior esquerdo, linha única completa.

Reference: `docs/design/composition-rules.md`

## 4. 3D Assets

**Model:** `public/models/spider-man_brand_new_day-v3-meshopt.glb` (≈ 6,5 MB,
meshopt + quantização, ADR-029; inalterado nesta wave).
**Textures:** KTX2/Basis via `gltfKtx2Loader.ts`; única mudança = anisotropy
aplicada no traverse de `curateMaterials.ts` (≤ max do renderer, alvo 8).
**Animations:** nenhuma (rig procedural, 66 joints — inalterado).
**Rig:** Mixamo (`mixamorig:Head_06`, `mixamorig:Neck_05`, âncoras de pulso
inalteradas).

## 5. Lighting

Sem mudança de slots ou cues (`LightRig.tsx`, `lightCues.ts`). Efeitos
indiretos aceitos: o cartão translúcido do Opening revela o hero lighting já
existente (key/rim acesos desde o load); `FX_STRENGTH` em `fxFlags.ts` pode
reduzir `uWebStrength` no tier `subtle` apenas se o moiré persistir após
anisotropy — registrada como contingência, não como mudança de direção.

**Shadows:** inalterado (por tier, `QualityAdapter.tsx`).

## 6. Camera

Nenhuma alteração de keyframes autorais, salvo micro-ajuste opcional do beat
`fullBody` (`cameraKeyframes.ts:25-57`, tabelas mobile/desktop) para o corpo
ocupar os ⅔ superiores do frame e o terço inferior receber o título. O contrato
do landing permanece intacto: `LandingTrigger` continua `start: 'top bottom'`
na seção Hero, `LANDING_DROP`/mola/overshoot inalterados (`landing.ts`), e a
câmera segue segurando o keyframe `hero` estático durante o Opening — agora
visível através do cartão translúcido.

## 7. Interactions

**Mouse tracking:** inalterado (parallax de ponteiro desktop, `CameraRig`).

**Scroll triggers:**

- Opening: scrub de evasão do título mantido (`OpeningTitleCard.tsx:34-44`).
- **Root cause fix (criterion 3):** `main` carregava `overflow-x-hidden`, o que
  o tornava scroll container sem scroll e **desligava todos os overlays
  `sticky`** — os holds de Evolution/Arsenal/FullBody nunca grudavam; a copy
  saía de cena logo no início da seção. O corte horizontal passa a ser feito
  apenas pelo `body` (cuja regra propaga ao viewport); verificado
  `overlayTop = 0` no meio do hold e ausência de overflow horizontal.
- Evolution/Arsenal: thresholds de fade da copy revisados para que heading,
  body e badge nunca coexistam sobrepostos em posição de leitura (Arsenal
  `smoothstep(progress, 0.28, 0.44)` re-avaliado com a atribuição removida).
- Badge de atribuição: visibilidade controlada por `main[data-beat]`
  (esconde em `colophon`, onde o rodapé legal é o bloco permanente).

## 8. Performance Budget

| Metric        | Target | Measurement                       |
| ------------- | ------ | --------------------------------- |
| FPS (desktop) | ≥ 60   | rAF probe (medido 61 antes)       |
| FPS (mobile)  | ≥ 55   | stop condition do contrato        |
| Draw calls    | ≤ 48   | `budget.spec.ts` (gate existente) |
| GLB load      | ≤ 8s   | inalterado (6,5 MB meshopt)       |

Anisotropy não altera memória de textura (mesmas KTX2); scrims/gradientes são
CSS puro. Nenhuma dependência nova.

Reference: `docs/design/performance-design.md`

## 9. Accessibility

**ARIA labels:**

- Badge de atribuição: mantém `role="contentinfo"`-equivalente semântico do
  `<footer>`/`<p>` atual; links `Eskze`/`CC BY 4.0` com `rel="noopener noreferrer"`.
- ProgressBar: ARIA existente mantido (≤ 5 Hz).

**Keyboard navigation:** links do badge focáveis (Tab); `pointer-events-auto`
somente nos links, como hoje em `ModelAttribution.tsx`.

**Reduced motion:**

- Nenhum movimento novo é introduzido (scrims são estáticos; badge é estático).
- `reduced-motion.spec.ts` (composição pixel-identical) recebe novos baselines
  após as mudanças visuais — o freeze em si permanece.
- Opening translúcido sob reduced motion mantém o mesmo gradiente estático.

Reference: `docs/design/mobile-first.md`

## 10. Stop Conditions

This Scene Spec is "done" when:

| Condition        | Measurement                             | Status |
| ---------------- | --------------------------------------- | ------ |
| Visual quality   | Rubric score ≥ 4 on all blockers        | [ ]    |
| Performance      | FPS ≥ 55 mobile mid-tier / ≥ 60 desktop | [ ]    |
| Accessibility    | Lighthouse a11y ≥ 90                    | [ ]    |
| Code quality     | Zero lint/typecheck errors              | [ ]    |
| Legal compliance | CC-BY attribution visível sem hover     | [ ]    |

**Escalation triggers:**

- [ ] Spec is ambiguous → return to @plan
- [ ] Gate fails after 3 iterations → escalate to human
- [ ] Visual < 4 after 3 iterations → escalate to human
- [ ] Performance exceeded by > 20% → escalate to human

## 11. Aceite (EARS + prova pareada)

| #   | Critério EARS                                                                                                                                | Prova                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Quando a página carrega sem scroll, o sistema deve exibir presença perceptível da máscara atrás do cartão de título em 390 e 1440.           | Stills `portfolio-audit-after/*-scroll-0.png` vs `-before`; rubrica "Primeira dobra" ≥ 4.                                                                                      |
| 2   | Quando qualquer seção mostra o modelo, o sistema deve exibir a atribuição CC-BY sem hover, sem sobrepor personagem nem copy das seções.      | `tests/visual/credits.spec.ts` atualizado (`@smoke`); stills dos checkpoints de scroll.                                                                                        |
| 3   | Quando Evolution, Arsenal ou FullBody estão em hold, o sistema deve manter texto fora de olhos, símbolo do peito e lançador nos 2 viewports. | Stills por checkpoint (`portfolio-audit-after` 45/60/75/90) + verificação independente; limites horizontais de copy cobertos por `arsenal.spec.ts:76` e `fullbody.spec.ts:77`. |
| 4   | Quando um ChapterCard cruza a viewport, o sistema deve renderizar bordas de gradiente, sem linha reta contra a cena.                         | Stills mobile (Hero→Ch1) e desktop (Evolution→Ch2) antes/depois.                                                                                                               |
| 5   | Quando o documento termina, o sistema deve totalizar 1045vh e o viewport final do Colophon não deve ter ~40% de área morta.                  | `tests/unit/beat.test.ts` ("gears the document to the contracted 1045vh"); still `1440-scroll-100.png` before/after.                                                           |
| 6   | Quando o traje é visto em close na Evolution, o sistema deve reduzir moiré sem apagar a trama.                                               | Still `1440-scroll-45/60` before/after; rubrica "Tipografia/Materialidade".                                                                                                    |
| 7   | Quando o SO renderiza a scrollbar, o sistema deve usar tema ink/steel discreto.                                                              | Still desktop com scrollbar estilizada (verificação visual no PR).                                                                                                             |
| 8   | Quando o scroll chega ao Hero, o sistema deve disparar o landing exatamente uma vez e decair ao repouso (contrato intacto).                  | `tests/unit/arrivalLanding.test.ts` + `tests/visual/motion.spec.ts` sem mudança de comportamento.                                                                              |
