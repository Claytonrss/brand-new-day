# STATE.md — spiderman-landing

## Estado Atual (2026-09-14)

**Fase:** lançamento **concluído** — Pareto Impact (PRs #32–#38), UX polish
(#39–#57), Launch Readiness (#58–#60), TD-003 meshopt (#61), Post-Launch
Wave (#62–#69) e pareto de fechamento (#70–#72) mergeados; projeto no ar em
produção. Restante: **sessão de device no S23** (runbook:
`docs/plans/wave0-s23-runbook.md`), calibrações dependentes de device e
itens data-gated — ver `PROGRESS.md` (checklist de fechamento).

### Pareto Impact Plan (`pareto-impact-plan.md`, git history)

- **Wave 1 — PERF-A (PR #32):** tier inicial síncrono (`detectInitialTier`)
  — mobile inicia em `medium`, nunca `high` (FALHA-01); trocas de tier só em
  scroll idle (FALHA-09, `beatRuntime` + `loaderCover`); ProgressBar rAF +
  `scaleY` + ARIA 5 Hz (FALHA-05); `will-change` removido dos chars
  (FALHA-06); drive-bys LightRig/Lenis/rest; gate do web-shot alinhado com o
  hint (FALHA-12, pull-forward do T3.2); `window.__perf.tier` + PerfHud.
  ADR-022. CI: smoke tier `@smoke` como gate de PR (mobile-390), deep tier
  na `main`.
- **Wave 2 — PERF-B (PR #33):** shadow throttle no `medium` (FALHA-04) —
  `autoUpdate` off + refresh 10 Hz e imediato em beat/drag/gyro/release/
  fling (`shadowThrottle.ts` puro, 7 tests). Vale de **16 draw calls**
  medido (46 ↔ 30). ADR-023.
- **Wave 3 — FIX (PR #34):** HDR self-hosted `public/env/city_1k.hdr`
  (Potsdamer Platz, CC0 — FALHA-08); **Google Fonts self-hosted** (SIL OFL,
  descoberto pela auditoria) — **0 requests externos** no load
  (`collect-request-audit.mjs`); web-shot dispara no `pointerup` via
  `isTap` (< 8 px, < 300 ms — FALHA-13). ADR-021.
- **Wave 4a — A chegada (PR #35):** landing do herói no reveal do Hero —
  queda `y +0,6` (Spring ω 9, ζ 0,7 → overshoot ~4,6%), flexão
  hips/joelhos, camera kick 0,08 + FOV −2; trigger = primeiro pixel de
  scroll (o reveal É o pouso); `landingSnap()` para restoration profundo;
  reduced-motion nunca arma. Spec: `docs/specs/arrival-landing.md`.
- **Wave 4b — Velocity lean (PR #36):** spring criticamente amortecido
  seguindo `clamp(velocity × 0,02)` — pitch spine1/spine2 (teto 2,5°) +
  elevação espelhada de ombros; terceiro efeito acoplado à velocidade.
  Spec: `docs/specs/velocity-lean.md`.
- **Wave 5 — POL (PR #37):** beat chrome — `data-beat` + `--beat-accent` no
  `<main>` (steel/oxide/signal/paper-60/dim) aplicados só em hairlines do
  HUD, kicker rules, chip de gyro e `::selection`; chapter cards impressos —
  halftone 0,06, misregistration 1 px (25%) e fio de teia draw-on `once`
  (reduced: nasce desenhado). Specs: `docs/specs/{beat-chrome,
chapter-print}.md`.

### Micro-craft (2026-09-13)

- **PR #40 — DOM micro-craft (`feat/dom-micro-craft`):** tipografia reativa
  à velocidade (headlines 700→480, quantizada; repouso por _tempo_ >300ms
  com easing de volta — `--type-wght`); carimbo editorial por beat na
  lombada esquerda (noite contínua 04:37→05:00, MutationObserver em
  `data-beat`); CTA magnético no colofon (raio 120px, transform-only);
  trama do traje (~3,5%) no opening/colofon. Inclui trabalho paralelo
  commitado: drag-orbit hover-only (touch mantém gyro + tap) com teste
  touch corrigido (contexto mobile+touch) e glow do loader na raiz do SVG.
  Spec: `docs/specs/dom-micro-craft.md`.
- **PR #44 — Spider-sense + respiração (`feat/spider-sense`):** v2
  (redesenhada após observação em device — a v1, flash de rim ×3 em toda
  fronteira, lia como brilho ambiente). Agora com iconografia própria:
  **halo de 6 traços ondulados** hairline desenhando-se ao redor da cabeça
  projetada (clamped ao viewport — quando a cabeça sai do quadro, espiar
  pela borda), **expressão de alerta** (snap da cabeça para a lente + flare
  nas lentes via `uLensPulse` + respiração travando) e **disciplina de
  gatilho** — só na entrada dos 3 beats de perigo (Evolution/Arsenal/
  FullBody), nunca no Hero/cards, latch `senseCount` para evidência.
  Respiração dirigida por beat com fase integrada (hero 0.18 Hz ×0.7 →
  fullBody 0.14 Hz ×1.3). Zero draw calls/lights novos. Specs:
  `docs/specs/spider-sense.md`.

### Re-engrenagem do scroll (2026-09-13)

- **PR #54 — fix spider-sense (`fix/spider-sense-covered-refire`):** portão
  de direção no gatilho (chegada `velocity > 0` + ordem na `BEAT_TIMELINE`)
  — zero disparos encobertos pelo card REVELAÇÃO. ADR-024.
- **Re-engrenagem do pacing (`feat/scroll-regearing`):** alturas de seção
  movidas para tabela única (`src/components/3d/beat/sections.ts`,
  `SECTION_SPANS`) e `BEAT_TIMELINE` **derivado** delas; distribuição nova:
  Opening 100 · Hero 140 · Chapter1 70 · Evolution 210 · Chapter2 70 ·
  Arsenal 210 · FullBody 130 · Colophon 140 = **1070vh / 970vh de scroll**
  (+21% de história, cards de passagem −30%). Freio fino do Lenis no desktop
  (`wheelMultiplier: 0.8`; touch intocado, data-gated S23). Fullpage snap
  rejeitado (colide com scrub contínuo ADR-008/014 e com a suíte);
  snap magnético + nav por capítulos quedam como fase 2 potencial.
  Spec de interação do Arsenal agora deriva do bounding box da seção.
  ADR-025.

### Higiene de tooling (2026-09-13)

- **Lint + comentários (`chore/lint-comment-hygiene`):** `eslint-plugin-jsx-a11y`
  (recommended, escopo `*.tsx`), `prefer-const`, `eqeqeq` e
  `tsconfig.node.json` alinhado ao strictness de app — zero violações no
  codebase. Política de comentários vinculante (comentário = porquê não
  visível no código) + limpeza retroativa de ~110 comentários-narração
  (removidos/aparados) e 6 contas de scroll corrigidas em src/tests/scripts,
  constraints FALHA/IDEIA/spec/contrato preservados. ADR-026.

### Lançamento e pós-lançamento (2026-09-14)

- **Launch Readiness (PRs #58–#60):** LICENSE MIT + NOTICE + CC-BY estrita +
  disclaimer (#58) · OG/favicon/metas validados em produção (#59) · README
  showcase EN-first + GIF + Lighthouse publicado (#60).
- **TD-003 meshopt (PR #61):** GLB 23,5 → 6,5 MB (quantização +
  EXT_meshopt_compression, ADR-029), entrega via edge da Vercel.
- **Post-Launch Wave (PRs #62–#69):** números ressincronizados (#62/#66) ·
  vendor chunks — entry 1.573 → 265 kB (#63) · contraste AA + a11y 100
  (ADR-030, #64/#67) · headers CSP/nosniff/XFO/Permissions-Policy (#65) ·
  Vercel Analytics + beacon WebGL `/api/log` (#68) · robots/sitemap + case
  study do harness + launch checklist (#69).
- **Pareto de fechamento (PRs #70–#72):** claim "zero janks" substituído por
  fato verificável (ADR-031, #70) · consolidação da auditoria (#71) ·
  `env:doctor`/`env:teardown` como gates executáveis + worktrees aninhadas
  no repo (#72).

### Pendências consolidadas (detalhe em `PROGRESS.md`)

- **Sessão S23 (única pendência de execução):** Wave 0 (T0.1–T0.5),
  aceites das Waves 1–3 em device, T4.6 (lean × punch × lag), TD-002
  (gyro iOS), aprovação estética humana (Fase 7.3).
- **Data-gated:** FALHA-02 (threshold medium→low), FALHA-10 (syncTouch),
  FALHA-03 (variante segura), micro-polish. (F4b — GLB ≤ 15 MB — fechado:
  ADR-029.)

### Implementado (acumulado)

- 8 seções / 1070vh (ADR-025, `SECTION_SPANS`): Opening card, Hero, MUDANÇA,
  Evolution, REVELAÇÃO, Arsenal, FullBody, Colofon — com landing, lean, beat
  chrome e print.
- Câmera Catmull-Rom + handheld + FOV punch/dolly lag + pointer parallax.
- Rig procedural 16 joints (respiração, sway, poses por beat, head-tracking,
  piscada por obturador) + interação drag/gyro/teia.
- Iluminação 6 slots, shaders autorais (`?fx`), atmosfera GPU por beat,
  post-processing por tier.
- Loader teaser + opening card + colofon + fallback WebGL em poster.
- Qualidade adaptativa (tier síncrono + degradação idle-gated + shadow
  throttle), `window.__perf`/`__rig`/`__landing`/`__interaction` (debug).
- **Assets 100% same-origin** (GLB + HDR + fontes) — modo avião OK.
- CI: static gates + smoke `@smoke` em todo PR; deep suite visual na `main`;
  hooks locais (husky + commitlint + lint-staged).

### Rubrica Visual

- **Nota:** 4,5/5,0 (média ponderada) — re-preenchida por PR
  (#32–#37) contra evidências locais; bloqueantes 5/4/4.
- **Pendente:** aprovação estética humana (Fase 7.3) — as notas são
  autoatribuídas contra screenshots; o aceite final é do stakeholder.

### PRs Merged (72 — todos merged)

| Faixa   | Programa                                                                                                                                                                                                 |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1–#16  | Bootstrap, Look Dev, seções, Premium Waves 1–4, docs sync, fallback pós                                                                                                                                  |
| #17–#29 | 3D Motion Upgrade (Waves F/B/A/C/E/D, P0 calibração, Wave G)                                                                                                                                             |
| #30–#31 | CI (GitHub Actions) · Portfolio Impact P0–P3.2                                                                                                                                                           |
| #32–#38 | Pareto Impact Plan (Waves 1–5) + closeout de docs (STATE sync, PROGRESS reestruturado)                                                                                                                   |
| #39–#44 | Consolidação de docs · DOM micro-craft (#40) · attribution copy (#41) · arsenal click-reveal (#42) · spider-sense + respiração (#44)                                                                     |
| #45–#53 | Env/hygiene: dev port por checkout (#45/#53) · setup env+VS Code (#46) · refactors dead-code/primitives/structure (#47–#49) · consolidação v2 + runbook de isolamento (#43/#50/#52) · repo hygiene (#51) |
| #54–#57 | Spider-sense refire fix (#54) · scroll regearing (ADR-025, #55) · lint/comment hygiene (ADR-026, #56) · UX polish (ADR-027/028, #57)                                                                     |
| #58–#60 | Launch Readiness (C2 licensing · C1 social preview · C3 README showcase)                                                                                                                                 |
| #61     | TD-003 meshopt — GLB 6,5 MB (ADR-029)                                                                                                                                                                    |
| #62–#69 | Post-Launch Wave (números · vendor chunks · contraste AA · headers · RUM/beacon · robots/sitemap · case study)                                                                                           |
| #70–#72 | Pareto de fechamento (ADR-031 · consolidação da auditoria · env:doctor/teardown)                                                                                                                         |

> Detalhe por entrega: tabela "Arquivo — planos concluídos" no `PROGRESS.md`
> e o git history.

## Próximos Passos (fila priorizada)

0. **Sessão de device no S23** — runbook `docs/plans/wave0-s23-runbook.md`:
   Wave 0 (T0.1–T0.5), aceites Waves 1–3, T4.6, TD-002, aprovação humana;
   de carona, **M15** — passada Safari/iPhone (mesma tarde).
1. **Data-gated (decidir com os números):** FALHA-02 · FALHA-10 ·
   FALHA-03 variante segura · fila micro-polish.
2. **Publicação** seguindo `docs/plans/launch-checklist.md` (A10).
3. **Nada mais planejado** — novos itens entram como plano novo.

## Decisões Arquiteturais (ADRs)

- ADR-001: Stack (Vite 8 + React 19 + TS 5.9 + Tailwind v4 + Three 0.185 + R3F 9 + Drei 10 + GSAP 3.15 + pnpm 9)
- ADR-002: Modelo 3D Eskze (CC-BY 4.0), rig Mixamo 66 joints
- ADR-003: Playwright em viewports (390×844, 430×932, 1440×900)
- ADR-004: Camera Rig — ScrollTrigger + lerp
- ADR-005: Lenis over ScrollSmoother
- ADR-006: Wave 4 depth/chrome
- ADR-007: Adaptive post-processing per device profile
- ADR-008: BeatController como única fonte de verdade narrativa
- ADR-009: Slots de luz permanentes (proibido montar/desmontar luz em runtime)
- ADR-010: Instrumentação de performance (`window.__perf`) e política de dpr
- ADR-011: Câmera por curva única de Catmull-Rom com easing por beat
- ADR-012: Movimento procedural do rig sobre a rest pose (sem clips no GLB)
- ADR-013: Âncoras do mundo derivadas do esqueleto
- ADR-014: Easing linear nos beats intermediários da câmera
- ADR-015: Atmosfera em GPU (movimento no vertex shader)
- ADR-016: Estado de interação mutável + piscada por obturador
- ADR-017: Copy FullBody volta ao storyboard
- ADR-018: Fluxo de permissão iOS para DeviceOrientation
- ADR-019: Colofon como fechamento de portfólio
- ADR-020: Assets 2D via Higgsfield (superseded na prática — ver PROGRESS)
- ADR-021: HDR self-hosted + fontes locais (loader determinístico)
- ADR-022: Política de tier inicial síncrona + idle-gate de troca
- ADR-023: Shadow throttle no tier `medium`
- ADR-024: Portão de direção no gatilho do spider-sense
- ADR-025: Re-engrenagem do scroll (pacing por distância, sem hijack)
- ADR-026: Baseline de lint (jsx-a11y) e política de comentários
- ADR-027: Halo do spider-sense ancorado no topo do crânio e adaptativo à câmera
- ADR-028: Estado indeterminado (`null`) em `arsenalReveal` contra a race de canvas
- ADR-029: GLB comprimido com meshopt + quantização (TD-003/F4b) e entrega via edge da Vercel
- ADR-030: Token `dim` elevado para contraste AA (a11y 100) e fim de opacidade em texto
- ADR-031: Claim "zero janks" substituído por fato verificável (C4 — volta com número após o Bloco A)

## Métricas

- **PRs:** 72 (todos merged) · **Unit tests:** 168 (22 arquivos) ·
  **Visual:** 14 specs (gate de PR: 9 `@smoke` no mobile-390; deep suite na
  `main`) · **Hooks:** husky + commitlint + lint-staged
- **Rubrica visual:** 4,5/5,0 — autoatribuída por PR contra evidências;
  aprovação humana pendente (Fase 7.3)
- **Draw calls/frame:** 44–46 (high) · **30–46 no medium entre refreshes de
  sombra** (throttle, vale de 16) · 11–13 (low)
- **GLB:** 6,5 MB (meshopt + quantização, ADR-029 — TD-003/F4b fechado;
  budget ≤ 15 MB atendido; original 23,5 MB no histórico git)
- **Bundle:** entry 265 kB (85 kB gzip) + `vendor-3d` 1.175 kB (327 gzip,
  cacheável) + `vendor-motion` 132 kB (49 gzip) — code-splitting A6
- **Lighthouse (deploy de produção, 2026-09-14):** perf 43 mobile / 94
  desktop · a11y **100** (ADR-030) · best-practices 100 · SEO 100 ·
  TBT mobile 780 ms (−9,4× pós-meshopt) — detalhes e método em
  `docs/research/2026-09-14-lighthouse.md`
- **Social preview:** og.jpg 1200×630 + favicon de lentes + metas OG/Twitter
  (C1) · **Headers:** CSP/nosniff/XFO/Permissions-Policy via `vercel.json`
  (M12) · **Observabilidade:** Vercel Analytics + Speed Insights (cookie-free)
  - beacon `webgl_unavailable` → `api/log.ts` (A11)
- **Claim do colofon:** 'zero janks' suspenso por ADR-031 até medição em
  device (Bloco A); substituído por 'zero requests externos no load'
- **Requests externos no load:** 0 (HDR + fontes locais)
- **Total page height:** 1070vh (ADR-025 — opening + hero + 2 cards +
  evolution + arsenal + fullbody + colofon; 970vh de scroll)
