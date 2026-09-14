# STATE.md — spiderman-landing

## Estado Atual (2026-09-13)

**Fase:** Pareto Impact Plan **executado** (Waves 1–5, PRs #32–#37 mergeados).
Restante: **sessão de device no S23** (runbook:
`docs/plans/wave0-s23-runbook.md`), calibrações dependentes de device e
itens data-gated — ver `PROGRESS.md` (checklist de fechamento).

### Pareto Impact Plan (`docs/plans/archive/pareto-impact-plan.md`)

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
- **PR #41 — Spider-sense + respiração (`feat/spider-sense`):** v2
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

### Pendências consolidadas (detalhe em `PROGRESS.md`)

- **Sessão S23 (única pendência de execução):** Wave 0 (T0.1–T0.5),
  aceites das Waves 1–3 em device, T4.6 (lean × punch × lag), TD-002
  (gyro iOS), aprovação estética humana (Fase 7.3).
- **Data-gated:** FALHA-02 (threshold medium→low), FALHA-10 (syncTouch),
  F4b (GLB ≤ 15 MB), FALHA-03 (variante segura), micro-polish.

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

### PRs Merged

- PR #1–#16: bootstrap, Look Dev, seções, Waves 1–4, docs sync, fallback pós.
- PR #17–#29: 3D Motion Upgrade (Waves F/B/A/C/E/D, P0 calibração, Wave G).
- PR #30: CI (GitHub Actions) · PR #31: Portfolio Impact P0–P3.2.
- PR #32: Wave 1 — tier síncrono + idle-gate + ProgressBar rAF + gate do
  tiro + smoke tier.
- PR #33: Wave 2 — shadow throttle.
- PR #34: Wave 3 — loader determinístico (HDR + fontes) + isTap.
- PR #35: Wave 4a — a chegada (+ isTap tests perdidos do #34).
- PR #36: Wave 4b — velocity lean.
- PR #37: Wave 5 — beat chrome + chapter print.
- PR #38: pareto closeout (STATE sync + PROGRESS reestruturado).
- PR #39: auditoria de docs (arquivamento de planos, backlog, statuses).
- PR #40: DOM micro-craft · PR #41: spider-sense + respiração por beat.

## Próximos Passos (fila priorizada)

0. **Sessão de device no S23** — runbook `docs/plans/wave0-s23-runbook.md`:
   Wave 0 (T0.1–T0.5), aceites Waves 1–3, T4.6, TD-002, aprovação humana.
1. **Data-gated (decidir com os números):** FALHA-02 · FALHA-10 · F4b ·
   FALHA-03 variante segura · fila micro-polish.
2. **Nada mais planejado** — novos itens entram como plano novo.

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

## Métricas

- **PRs:** 54 (todos merged) · **Unit tests:** 168 (22 arquivos) ·
  **Visual:** 14 specs (gate de PR: 9 `@smoke` no mobile-390; deep suite na
  `main`) · **Hooks:** husky + commitlint + lint-staged
- **Rubrica visual:** 4,5/5,0 — autoatribuída por PR contra evidências;
  aprovação humana pendente (Fase 7.3)
- **Draw calls/frame:** 44–46 (high) · **30–46 no medium entre refreshes de
  sombra** (throttle, vale de 16) · 11–13 (low)
- **GLB:** ≈ 23,5 MB (geometria não comprimida — F4b, budget ≤ 15 MB, ligado
  ao gatilho FALHA-14)
- **Requests externos no load:** 0 (HDR + fontes locais)
- **Total page height:** 1070vh (ADR-025 — opening + hero + 2 cards +
  evolution + arsenal + fullbody + colofon; 970vh de scroll)
