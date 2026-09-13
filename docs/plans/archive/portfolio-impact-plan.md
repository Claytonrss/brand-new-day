# Plano Mestre — Portfolio Impact (spiderman-landing)

> **Status:** proposto — aguardando aprovação para execução
> **Data:** 2026-09-10
> **Origem:** auditoria pós-Wave G (24 screenshots reais em 3 viewports)
> **Escopo pedido:** elevar a peça de "demo de engine 3D" para "portfólio de
> alto impacto", com tratamento distinto por plataforma e robustez mínima.

---

## 1. Contexto

O projeto já tem uma base técnica forte (ver §3). O que falta não é engine —
é **direção editorial e voz de autor**. A experiência atual é uma única nota
contínua de vermelho/preto/título-grande por 700vh, sem variação de ritmo, sem
contexto do filme além de frases de efeito, e sem nada que diga **quem fez**.
O resultado é tecnicamente impressionante e narrativamente anônimo — o oposto
do que uma peça de portfólio precisa ser.

Este plano corrige primeiro o que viola as próprias regras do projeto
(composição mobile, tipografia, copy divergente), depois adiciona o que falta
para funcionar como portfólio (primeira impressão, fechamento, ritmo) e por
fim diferencia as plataformas (pointer no desktop, gyro no mobile).

---

## 2. Critério de sucesso (o que faz "funcionar")

Três testes, em ordem de prioridade. Toda wave é avaliada contra eles.

1. **Reação nos 5s iniciais.** Alguém abre o link, vê o preloader e, quando a
   máscara aparece, pensa "isso não é um site normal".
2. **Scroll até o fim por variação, não por comprimento.** A experiência
   segura a atenção porque muda de tom, escala e textura entre beats — não
   porque é longa.
3. **Convicção de autoria.** O visitante termina sabendo que foi feito à mão
   por alguém com domínio técnico, e sabe para onde ir depois. Hoje isso
   falha: o único texto além de 4 títulos é a atribuição CC-BY do modelo.

---

## 3. Diagnóstico — promessa × entrega

Base técnica (manter): `BeatProvider`/`beats.ts` (fonte única de beat),
`CameraRig`/`cameraPath.ts` (Catmull-Rom, órbita 85°), rig procedural
(respiração/sway/poses/head-tracking slerp), `LightRig` (6 slots, 1 shadow
caster, 44–46 draw calls), `EffectsStack` (Bloom/Vignette/Noise/DOF/CA por
beat), `CinematicLoader`, `SplitTextHeadline`, atmosfera GPU (1 draw call),
`WebShoot`, `useInteraction` (drag+gyro+rim), piscada, 33 testes visuais, 94
unit tests, CI.

| #   | Problema real (evidência)                                    | Gravidade            | Onde                            |
| --- | ------------------------------------------------------------ | -------------------- | ------------------------------- |
| 1   | Arsenal mobile: copy cobre o lançador/pulso                  | alta (viola regra)   | `390/430-scroll-75`             |
| 2   | FullBody mobile: título corta + cobre o peito/símbolo        | alta (viola regra)   | `390-scroll-100`                |
| 3   | Títulos desktop quebram palavra no meio (`ESTÁ M/UDANDO.`)   | média                | `1440-scroll-45/75`             |
| 4   | Copy FullBody diverge do storyboard; data de estreia ausente | média                | storyboard vs `FullBodyOverlay` |
| 5   | Gyro mobile sem permissão iOS → não funciona no iPhone       | alta (feature morta) | `useInteraction.ts`             |
| 6   | Fallback WebGL = "3D unavailable" mono cinza                 | média                | `App.tsx` ErrorBoundary         |
| 7   | Rubrica 5.0/5.0 autoatribuída sem evidência                  | média (processo)     | `visual-rubric.md`              |
| 8   | Fim abrupto: sem autor, sem CTA, sem fechamento              | alta (portfólio)     | `1440/390-scroll-100`           |
| 9   | Atmosfera é uma nota contínua; sem variação por beat         | média                | todas as capturas               |
| 10  | Transições = chapter cards estáticos, sem crossfade          | baixa-média          | `1440-scroll-15/60`             |
| 11  | Preloader é "barra + %", não teaser cinematográfico          | média                | `CinematicLoader`               |
| 12  | Desktop e mobile são a mesma experiência redimensionada      | média                | comparativo 1440 vs 390         |
| 13  | WebShoot não é descobrível                                   | baixa-média          | `useInteraction`                |

Evidências: `docs/evidence/portfolio-audit/` (24 PNGs).

---

## 4. Princípios do plano

1. **Composição antes de feature nova.** Nenhuma wave de conteúdo entra antes
   de o mobile estar dentro das próprias regras de composição (P0).
2. **Copy é parte da composição.** Quebra de linha, posição e escala são
   decididas no spec, não "onde couber".
3. **Cada beat tem uma assinatura de atmosfera.** Variação de densidade/luz/
   textura por beat, dirigida pelo `BeatProvider` — nunca um parâmetro global
   constante.
4. **Plataforma é uma decisão, não um resize.** Desktop usa pointer/parallax;
   mobile usa gyro (com permissão) + gestos. Onde a mesma ideia não couber,
   cada plataforma tem a sua.
5. **Degradação é escolha visual.** `prefers-reduced-motion` e ausência de
   WebGL produzem uma peça bonita, não uma página quebrada
   (`performance-design.md`).
6. **Toda wave é mensurável.** Screenshot por viewport + rubrica real (≥4 nos
   bloqueantes) + gates (`pnpm verify`). Sem evidência, não abre PR.
7. **Atribuição CC-BY visível sem hover** em qualquer mudança (ADR-002).

---

## 5. Waves de execução

Ordem sugerida (dependências em §6). Cada item aponta para o spec em
`docs/specs/` quando houver comportamento/composição nova; correções puras de
copy/tipografia não têm spec próprio (detalhadas aqui).

### Wave P0 — Correções de composição, tipografia e copy (bloqueante)

Objetivo: o mobile volta a cumprir as próprias regras; a rubrica é re-preenchida
com evidência real.

| Item | O quê                                                                                            | Componente                                   | Complexidade | Plataforma |
| ---- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- | ------------ | ---------- |
| P0.1 | Arsenal mobile: mover copy para zona negativa, longe do pulso                                    | `ArsenalOverlay.tsx`, talvez `cameraPath.ts` | baixa        | mobile     |
| P0.2 | FullBody mobile: título fora do peito/símbolo, sem cortar palavra                                | `FullBodyOverlay.tsx`, `cameraPath.ts`       | baixa        | mobile     |
| P0.3 | Tipografia desktop: quebra manual de linha por breakpoint (sem cortar palavra)                   | `SplitTextHeadline.tsx`, overlays            | baixa        | desktop    |
| P0.4 | Copy FullBody volta ao storyboard (`Um homem sem nome./Uma cidade sem escolha.` + `31 de julho`) | `FullBodyOverlay.tsx`, `storyboard.md`       | baixa        | ambos      |
| P0.5 | Re-preencher rubrica contra `portfolio-audit/`; gate: bloqueantes ≥4                             | `visual-rubric.md`, `docs/evidence/`         | baixa        | processo   |

**Critério de saída P0:** em 390/430, lançador e símbolo do peito 100%
desobstruídos em todos os pontos do beat; nenhum título corta palavra em
1440; storyboard e código dizem a mesma coisa; rubrica real ≥4 nos bloqueantes.

### Wave P1a — Primeira impressão

| Item  | O quê                                                                            | Spec                    | Complexidade | Plataforma |
| ----- | -------------------------------------------------------------------------------- | ----------------------- | ------------ | ---------- |
| P1a.1 | Preloader como teaser (olho da máscara acende com o progresso / teia se desenha) | `loader-teaser.md`      | média        | ambos      |
| P1a.2 | Card de abertura tipográfico (Beat 0, respiração antes do Hero)                  | `opening-title-card.md` | baixa        | ambos      |

### Wave P1b — Fechamento / colofon (o que faz ser portfólio)

| Item  | O quê                                                                                          | Spec                | Complexidade | Plataforma |
| ----- | ---------------------------------------------------------------------------------------------- | ------------------- | ------------ | ---------- |
| P1b.1 | Seção final 100vh: modelo sai de cena, entra colofon editorial com autoria, stack, CTA e CC-BY | `colophon-outro.md` | média        | ambos      |

> **Este é o item de maior alavancagem para "portfólio".** Sem ele, o site é
> uma demo; com ele, vira uma peça com dono.

### Wave P1c — Atmosfera por beat (ritmo)

| Item  | O quê                                                                                                             | Spec                     | Complexidade | Plataforma |
| ----- | ----------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------ | ---------- |
| P1c.1 | Assinatura de atmosfera por beat (densidade/luz/textura dirigidas pelo `BeatProvider`) + crossfade nas transições | `atmosphere-per-beat.md` | média        | ambos      |

### Wave P2a — Arsenal macro + HUD (o beat mais técnico)

| Item  | O quê                                                          | Spec                   | Complexidade | Plataforma           |
| ----- | -------------------------------------------------------------- | ---------------------- | ------------ | -------------------- |
| P2a.1 | Câmera macro no lançador + HUD de anotação (linhas de chamada) | `arsenal-macro-hud.md` | média-alta   | ambos (HUD adaptado) |

### Wave P2b — Diferenciação de plataforma

| Item  | O quê                                                                     | Spec                          | Complexidade | Plataforma |
| ----- | ------------------------------------------------------------------------- | ----------------------------- | ------------ | ---------- |
| P2b.1 | Desktop: parallax de cursor real (câmera + HUD em velocidades diferentes) | `desktop-pointer-parallax.md` | média        | desktop    |
| P2b.2 | Mobile: gyro com permissão iOS + prompt por gesto + fallback por scroll   | `mobile-gyro-permission.md`   | média        | mobile     |

### Wave P3 — Micro-interação + robustez

| Item | O quê                                                                                              | Spec                       | Complexidade | Plataforma |
| ---- | -------------------------------------------------------------------------------------------------- | -------------------------- | ------------ | ---------- |
| P3.1 | WebShoot descobrível (hint no pulso; gesto de toque no mobile)                                     | `web-shoot-discovery.md`   | baixa-média  | ambos      |
| P3.2 | Fallback WebGL apresentável (poster 2D + copy editorial + CC-BY)                                   | `webgl-static-fallback.md` | média        | ambos      |
| P3.3 | Assets 2D via Higgsfield (poster do fallback, grão proprietário, marca tipográfica; **não** vídeo) | ADR-020                    | baixa        | ambos      |

---

## 6. Dependências e ordem

```
P0 (bloqueia tudo)
 ├─► P1a (primeira impressão) ──┐
 ├─► P1b (colofon)              ├─► P1c (atmosfera) ─► P2a (Arsenal macro)
 └─► P2b (plataforma) ──────────┘        └─► P3 (robustez)
```

- **P0** é pré-requisito absoluto — nada de conteúdo novo em cima de
  composição quebrada.
- **P1b (colofon)** e **P1c (atmosfera)** são independentes entre si; podem
  rodar em paralelo depois de P0.
- **P2a** depende de P1c (a assinatura de atmosfera do Arsenal é parte do
  macro) e de P0 (composição mobile).
- **P3.2** depende de P3.3 (o poster do fallback vem do asset Higgsfield).

Ordem de execução sugerida (PRs):

1. `fix/portfolio-p0-composition` — P0
2. `feat/loader-teaser` + `feat/opening-title-card` — P1a
3. `feat/colophon-outro` — P1b
4. `feat/atmosphere-per-beat` — P1c
5. `feat/arsenal-macro-hud` — P2a
6. `feat/platform-parallax` (desktop) + `feat/mobile-gyro-permission` — P2b
7. `feat/web-shoot-discovery` + `feat/webgl-fallback` (+ assets) — P3

Se só três waves forem possíveis: **P0, P1b, P1c** — atacam diretamente os
três critérios de sucesso (mobile correto, autoria, ritmo).

---

## 7. Métricas de aceite (globais)

| Métrica                                                                              | Alvo                             | Medição                       |
| ------------------------------------------------------------------------------------ | -------------------------------- | ----------------------------- |
| Rubrica bloqueantes (primeira dobra, composição mobile, integração texto/personagem) | ≥ 4                              | rubrica real contra evidência |
| Rubrica média ponderada                                                              | ≥ 4                              | `visual-rubric.md`            |
| Draw calls/frame (tier medium/high)                                                  | ≤ 48                             | `budget.spec.ts`              |
| Erros de console                                                                     | 0                                | `console.spec.ts`             |
| Testes visuais                                                                       | passam nos 3 viewports           | `pnpm test:visual`            |
| `prefers-reduced-motion`                                                             | 0% diff de pixels onde aplicável | `reduced-motion.spec.ts`      |
| CC-BY visível sem hover                                                              | sempre                           | `credits.spec.ts`             |
| Novas seções com screenshot de portfólio                                             | ≥ 1 por seção, mobile + desktop  | verify                        |

---

## 8. Riscos

| Risco                                            | Mitigação                                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Macro do Arsenal revela costura/limite do modelo | validar em Look Dev antes; `POSE_AMPLITUDE=0` se cruzar geometria (ver TD/Wave A)                     |
| Gyro iOS não verificável em headless             | aceite em dispositivo real (TD-002); fallback por scroll garante experiência                          |
| Colofon "quebrar o clima" com UI demais          | copy curta, tipografia mono/display, sem cards; revisão pela rubrica                                  |
| Atmosfera por beat virar "efeito por efeito"     | cada assinatura precisa reforçar a emoção do beat (`memorable-moments.md`); se não reforça, sai       |
| Higgsfield gerar asset fora da paleta            | curadoria contra `design-bible.md` (proibições de cor/textura); grão/poster em tom `ink/oxide/signal` |
| Escopo crescer além do "impacto por esforço"     | cada wave é independente e mergeable; parar depois de P1b ainda entrega portfólio funcional           |

---

## 9. Fora de escopo (consciente)

- Compressão de geometria do GLB (F4b / TD-003) — performance de load não é
  prioridade deste plano.
- Vídeo gerado por Higgsfield — conflita com o 3D e com o budget de atenção.
- Internacionalização (i18n) — copy em pt-BR apenas.
- Backend/CMS — conteúdo é estático por decisão.

---

## 10. Referências

- `docs/design/storyboard.md`, `design-bible.md`, `composition-rules.md`,
  `mobile-first.md`, `quality-matrix.md`, `performance-design.md`,
  `visual-rubric.md`, `memorable-moments.md`
- `docs/plans/3d-motion-upgrade-plan.md` (diagnóstico técnico da base)
- `docs/memory/decisions.md` (ADR-017 a ADR-020)
- `docs/evidence/portfolio-audit/` (24 screenshots da auditoria)
