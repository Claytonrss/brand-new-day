# PROGRESS.md — spiderman-landing

Checklist de execução do plano ativo: **Pareto Impact Plan**
(`docs/plans/pareto-impact-plan.md`, revisado criticamente em 2026-09-12).
Histórico de planos concluídos: ver seção **Arquivo** no fim deste arquivo.

**Legenda:**
- `[ ]` — pendente
- `[~]` — em progresso
- `[x]` — concluído
- `[-]` — cancelado/não aplicável

**Última atualização:** 2026-09-12

---

## Pendências carregadas (de planos anteriores)

- [ ] **FPS em dispositivo real** (Fase 7.3, pendente desde o bootstrap) →
      **absorvido pela Wave 0** abaixo (alvo: Samsung Galaxy S23)
- [ ] **Aprovação estética humana** (Fase 7.3) — definir perguntas, registrar
      veredito no PR; iluminação/poses/enquadramentos das Waves B/A/P0 ainda
      não passaram por olho humano (Look Dev v3 nunca disparou)
- [ ] **commitlint + husky + lint-staged** (Fase 7.5) — branch sugerida:
      `chore/commit-hooks`
- [ ] **G5 — rubrica atualizada com as evidências da Wave G** → fold natural
      nos PRs das Waves 1/4/5 (cada um re-preenche a rubrica)
- [ ] **P3.3 — assets 2D via Higgsfield** (ADR-020) — dependência externa
- [ ] **TD-002 — aceite do gyro iOS em dispositivo real** (P2b.2)
- [ ] **F4b — compressão do GLB** (meshopt/quantização; budget ≤ 15 MB;
      re-export + ADR) — ver gatilho FALHA-14 no plano Pareto

---

## Pareto Impact Plan (2026-09-12) — tasks

Origem: `docs/research/2026-09-12-brainstorm.md` · seleção 80-20 e prós/contras
em `docs/plans/pareto-impact-plan.md` (2ª revisão: FALHA-03 e hard cut
cortados; trigger do landing corrigido; `balanced` substituído por threshold
data-gated).

### Wave 0 — Baseline de medição no S23 (sem PR)

> Runbook pronto: `docs/plans/wave0-s23-runbook.md` (setup, procedimentos,
> template de registro e regras de decisão). Instrumentação verificada:
> `?debug=1` → PerfHud + `window.__perf` (agora inclui `tier`); `?fx=off`
> via `fxFlags.ts`. **Execução requer o dispositivo físico.**

- [ ] T0.1 — Parado no hero com `?debug=1`: registrar `fps/ms/calls/
      triangles/programs` de `window.__perf` (foto/filmagem da tela)
- [ ] T0.2 — Roldagem contínua hero → fim: mesmas métricas + capturar o
      momento do tier pop (se houver degradação)
- [ ] T0.3 — Sobre os chapter cards: fps durante o scroll coberto
- [ ] T0.4 — A/B `?fx=off` (isolar custo da camada de material)
- [ ] T0.5 — **Registro de decisão:** FPS-bound vs main-thread-bound;
      FALHA-02 entra (fps 35–44 no medium) ou fica congelada (≥ 50);
      FALHA-10 volta à mesa se fps ≥ 55 com queixa persistente
      → números viram evidência "antes" no PR da Wave 1

### Wave 1 — PERF-A: tier correto + main thread limpa
**Branch:** `fix/mobile-tier-policy` · ~0,5 dia

- [x] T1.1 — Tier inicial síncrono: `detectInitialTier()` em
      `initialTier.ts` lê `window.matchMedia` no lazy initializer do
      `useState` em `PerformanceMonitor.tsx` (guarda `typeof window`);
      hooks continuam para mudanças reativas + novo efeito rebaixa
      `high→medium` se a viewport virar mobile; unit test com mock de
      `matchMedia` (`tests/unit/initialTier.test.ts`: mobile → `medium`,
      nunca `high`; reduced-motion → `low`)
- [ ] T1.2 — *(condicional a T0.5 — segue pendente, data-gated)* FALHA-02:
      threshold mobile-only medium→low < ~40 fps (`maxTouchPoints > 0`);
      atualizar `budget.spec.ts` se comportamento testável mudar
- [x] T1.3 — FALHA-09: degradação só aplica com `|velocity| < 0,02`
      (`beatRuntime` em `beatState.ts`, mesmo objeto do `stateRef`) ou
      loader cobrindo (`loaderCover.ts`, limpo no unmount do
      `CinematicLoader`); gate cobre degradação **e** upgrade
- [x] T1.4 — FALHA-05: `ProgressBar.tsx` — rAF-throttle (scroll só marca
      dirty), `transform: scaleY(p)` (origin top), altura do doc cacheada
      no resize, `aria-valuenow`/`aria-label` a ≤ 5 Hz; paridade visual
      mantida; bônus: removido `aria-hidden` do track que escondia o
      `role="progressbar"` da árvore de acessibilidade
- [x] T1.5 — FALHA-06: `will-change` removido dos chars
      (`SplitTextHeadline.tsx`, `ChapterCard.tsx`)
- [x] T1.6 — Drive-bys: cache `Map` em `targetFor(slot, beat)` no
      `LightRig` (~360 obj/s a menos); `LenisProvider` guarda ref do
      ticker p/ cleanup (removia uma closure nova — nunca a registrada);
      `SpiderManModel` troca `restRef.current` por `useState` (rig não
      fica mais congelado com `rest` vazio até re-render alheio)
- [x] T1.8 — *(pull-forward do T3.2, FALHA-12)* gate do web-shot alinhado
      com o hint (`tier !== 'low'` em `useInteraction.ts`): com o tier
      síncrono correto, o mobile inicia em `medium` — manter o gate
      `high`-only deixaria o tiro anunciado permanentemente morto em todo
      phone; T3.3 (tap×drag) segue na Wave 3
- [~] T1.7 — Evidência + PR: `pnpm verify` verde, `pnpm test:smoke` verde
      (gate de PR), screenshots 390/430/1440, rubrica re-preenchida; ADR-022
      escrita; **falta:** números Wave 0 antes/depois no corpo (aguardam
      T0.1–T0.5 no S23) e aceite em device (tier `medium`, fps ≥ 50, 0
      commits React em scroll estabilizado)

**Critério de saída:** S23 inicia em `medium` (nunca `high`); fps no scroll
≥ 50; zero commit React em scroll estabilizado (React Profiler).

### Wave 2 — PERF-B: shadow throttle
**Branch:** `feat/shadow-throttle` · ~0,2–0,3 dia · independente (paralelizável)

- [x] T2.1 — `QualityAdapter`: high → `autoUpdate: true`; medium →
      `autoUpdate: false` + `needsUpdate` a 10 Hz e imediato em mudança de
      beat, drag/gyro movendo (mesmo par `INTERACTION.yaw/pitch`, epsilon
      0,001 rad), release do drag e fim de fling (velocity cruza 0,02);
      decisão extraída para módulo puro `shadowThrottle.ts` com 7 unit
      tests; low segue com sombras desligadas
- [x] T2.2 — Evidência local: vale de **16 calls** no medium (46 com passe ↔
      30 sem) via novo `scripts/collect-shadow-evidence.mjs`
      (`docs/evidence/wave2-shadow-throttle/calls-valley.txt`);
      `pnpm verify` verde; screenshots 3 viewports. **Falta:** vídeo do drag
      sem sombra defasada + vale de calls no S23 (re-medição Wave 0)

**Base verificada:** `curateMaterials.ts:57-58` seta cast+receive em todos os
meshes → passe existe e é visível (self-shadow).

### Wave 3 — FIX: loader determinístico + web-shot honesto
**Branch:** `fix/loader-determinism` · ~0,5 dia · independente

- [x] T3.1 — FALHA-08: `potsdamer_platz_1k.hdr` (Poly Haven, **CC0
      verificado na página do asset**) self-hosted em
      `public/env/city_1k.hdr`; `Environment` troca `preset="city"` por
      `files`; ADR-021 (origem/licença). **Bônus da auditoria:** Google
      Fonts era o único request externo restante → Space Grotesk +
      JetBrains Mono self-hosted em `public/fonts/` (SIL OFL 1.1)
- [x] T3.2 — FALHA-12: gates alinhados — **absorvido pela Wave 1 (T1.8):
      tiro em `tier !== 'low'` (`useInteraction.ts`), mesmo gate do hint**
- [x] T3.3 — FALHA-13: classificador puro `isTap(down, up)` em
      `pointerMath.ts` (< 8 px, < 300 ms, envelopes estritos) + disparo no
      `pointerup` (+ `pointercancel` limpa) + 4 unit tests. Trade-off
      aceito: tiro levemente menos "instantâneo" — validar em vídeo
- [x] T3.4 — Evidência local: auditoria de requests
      (`scripts/collect-request-audit.mjs`) → **0 requests externos**
      (`docs/evidence/wave3-loader-determinism/requests-audit.txt`);
      `pnpm verify` verde; screenshots 3 viewports. **Falta:** vídeo do
      toque no mobile medium disparando a teia (device, estilo Wave 0)

### Wave 4 — SIG: momentos assinatura
**Branches:** `feat/arrival-landing` + `feat/velocity-lean` · ~1 dia
**Depende de:** Wave 1 · specs primeiro

- [x] T4.1 — Spec `docs/specs/arrival-landing.md`: **trigger = entrada do
      Hero no viewport** (ScrollTrigger `once` em `top bottom`; o reveal do
      modelo É o pouso); edges cobertos: hero já visível pós-loader → fogo
      imediato; hero acima da viewport (restoration profundo) →
      `landingSnap()` sem animar; nunca dispara atrás de cover
      (`loaderCover`); coreografia ~0,45 s com constantes nomeadas no spec
      (`DROP 0.6`, `ω 9`, `ζ 0.7` → overshoot ~4,6%, flexão hips 6° /
      joelhos 8°, kick 0,08, FOV −2); **sem braços**; skip em reduced-motion
- [x] T4.2 — Implementar o landing: store `landing.ts` (Spring + envelopes
      de kick/flex), `LandingTrigger.tsx` no App, offset no grupo
      (`SpiderManModel`), `LANDING_POSE × flex` nos pose-springs do rig
      (POSE_ROLES estendido com hips/upLegL/upLegR), kick+FOV no
      `CameraRig`; 6 unit tests (`tests/unit/arrivalLanding.test.ts`)
- [x] T4.3 — `motion.spec.ts`: landing decai para rest (waitForFunction
      offset < 0,05); não dispara com o opening card cobrindo; dispara uma
      vez por sessão (resubida não incrementa); reduced-motion nunca arma
      — 16 passed / 2 skipped (hover) nos 2 viewports
- [ ] T4.4 — Spec `docs/specs/velocity-lean.md`: springs alvo
      `clamp(velocity × K)` em pitch de `spine1/spine2` + elevação leve de
      ombros; máx 2–3°; 0 em reduced-motion; rig passa a consumir `stateRef`
- [ ] T4.5 — Implementar o lean
- [ ] T4.6 — Calibração conjunta em device: lean × FOV punch × dolly lag
      (os três acoplados à velocidade); se compitar, reduzir o lean primeiro
- [~] T4.7 — Evidência + PRs (4a): `pnpm verify` verde, smoke 7/7,
      screenshots 3 viewports, rubrica re-preenchida, ADR-022 já escrita na
      Wave 1; **falta:** vídeo por viewport (`pnpm evidence:motion`), sinal
      de flexão/kick calibrado em device e fps no S23 re-medido (Wave 0)

### Wave 5 — POL: coesão de beat + transições impressas
**Branches:** `feat/beat-chrome` + `feat/chapter-print` (podem ser 1 PR) ·
~0,5–1 dia · independente após Wave 1

- [ ] T5.1 — `BeatProvider` publica `data-beat` no `<main>` + CSS var
      `--beat-accent` (hero `steel`, evolution `oxide`, arsenal `signal`,
      fullBody `paper/60`, colophon `dim`) com transition 300 ms
- [ ] T5.2 — Aplicar accent apenas em: hairlines do HUD do Arsenal, kicker
      rules, borda do chip de gyro, `::selection` (bible: sem fundos/textos
      coloridos)
- [ ] T5.3 — Chapter cards impressos: halftone (radial-gradient pattern,
      opacity ≤ 0,06), misregistration estático no título (text-shadow 1 px
      `oxide`/`steel` ~25%), fio de teia SVG diagonal draw-on na entrada
      (estado final estático em reduced-motion); `bg-ink` sólido permanece
- [ ] T5.4 — Evidência + PR: screenshots 390/430/1440 dos 2 cards, rubrica
      ≥ 4 nos bloqueantes, `reduced-motion.spec` verde, `pnpm verify`

### Fechamento do plano

- [ ] T6.1 — Sync `docs/STATE.md` + ADRs (021–023) · re-preencher rubrica
      global · atualizar este arquivo
- [ ] T6.2 — Reavaliar gatilhos do plano (§6): FALHA-03 variante segura,
      FALHA-10 syncTouch, FALHA-14 GLB leve, fila micro-polish

---

## Arquivo — entregas concluídas (resumo)

> Detalhe por item/pergunta: `docs/STATE.md` (estado narrativo + PRs) e git
> history até `3bd324a` (merge PR #31). O checklist completo das fases abaixo
> foi consolidado aqui em 2026-09-12 para limpar o arquivo de execução.

| Período | Plano | Entregas (todas `[x]`) |
|---|---|---|
| 2026-09-0x | **Bootstrap** (`harness-bootstrap-plan.md`, Fases 0–7) | Fases 0–6 completas (design system, specs, scaffold, gates, Playwright 3 viewports, CC-BY audit); 7.1/7.2/7.4/7.6/7.7 completas (scripts, specs visuais, template PR, CI PR #30); pendências de 7.3/7.5 carregadas acima |
| 2026-09-08 | **Premium Waves 1–4** (PRs #10–#13) | Canvas/tone mapping, iluminação física + materiais, Lenis + timeline de câmera, motion tokens + loader + SplitText, chapter cards + progress bar + partículas + monitor adaptativo |
| 2026-09-09 | **3D Motion Upgrade** (`3d-motion-upgrade-plan.md`, Waves A–G; PRs #17–#29) | Wave F headroom (draw calls 118→44-46, `window.__perf`, PerfHud) · Wave B câmera Catmull-Rom (mudança de direção −54%, órbita 85°) · Wave A rig procedural 16 joints (bug do bone sanitizado corrigido) · Wave C shaders autorais + DOF/CA + `?fx` · P0 calibração de âncoras · Wave E atmosfera GPU (1 draw call) · Wave D interatividade (drag/gyro/teia/piscada) · Wave G verificação (budget/console/credits/vídeo) |
| 2026-09-10 | **Portfolio Impact** (`portfolio-impact-plan.md`; PR #31) | P0 composição/tipografia/copy (rubrica 4,2) · P1a loader teaser + opening card · P1b colofon (900vh) · P1c atmosfera por beat · P2a Arsenal macro + HUD · P2b pointer parallax + gyro iOS (ADR-018) · P3.1 web-shoot descobrível · P3.2 fallback WebGL em poster |

**Marcos acumulados:** draw calls/frame 44–46 (medium/high) · 11–13 (low) ·
programs estável em 10 · rubrica 4,2/5,0 (bloqueantes 5/4/4) · 33+ visual
tests · 94+ unit tests · CI com gates + artifacts · página 900vh (8 seções).
