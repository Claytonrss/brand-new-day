# PROGRESS.md — spiderman-landing

Checklist de fechamento do projeto: todos os programas já executados e
arquivados (Pareto Impact PRs #32–#38 · UX polish #39–#57 · Launch
Readiness #58–#60 · TD-003 meshopt #61 · Post-Launch #62–#69 · pareto de
fechamento #70–#72 — resumo no arquivo de planos concluídos abaixo). O que
resta está organizado em três blocos: **device** (só você executa),
**housekeeping** (executável por agente) e **condicionais** (decididos com
os números do device).

**Legenda:** `[ ]` pendente · `[~]` em progresso · `[x]` concluído · `[-]` não aplicável

**Última atualização:** 2026-09-14 (auditoria v2: F4b fechado, DoD do
pareto de fechamento absorvido no Bloco A, planos concluídos arquivados;
Bloco A de device é a pendência de execução restante)

---

## Bloco A — Sessão de device no S23 (única pendência de execução)

> Runbook: `docs/plans/wave0-s23-runbook.md` · Instrumentação: `?debug=1`
> (PerfHud + `window.__perf{.tier}`/`__rig.lean`/`__landing`) · `?fx=off`.

**Medição Wave 0 (baseline "depois" das Waves 1–2):**

- [ ] T0.1 — Hero parado: `fps/ms/calls/triangles/programs/tier`
- [ ] T0.2 — Roldagem contínua: fps mínimo + momento do tier pop
- [ ] T0.3 — Scroll coberto (chapter cards): fps
- [ ] T0.4 — A/B `?fx=off`
- [ ] T0.5 — Registro de decisão: FPS-bound vs main-thread-bound;
      **FALHA-02** (threshold medium→low < 40 fps) entra ou congela;
      **FALHA-10** volta se fps ≥ 55 com queixa de "feel"

**Aceites em device que dependem dele:**

- [ ] Wave 1 — tier inicial `medium` (nunca `high`); fps ≥ 50; 0 commits
      React em scroll estabilizado (React Profiler)
- [ ] Wave 2 — vale de calls entre refreshes de sombra; vídeo do drag sem
      sombra defasada
- [ ] Wave 3 — vídeo do toque no Arsenal disparando a teia (drag não atira)
- [ ] T4.6 — Calibração conjunta: lean × FOV punch × dolly lag (reduzir o
      lean primeiro se compitirem); vídeo por viewport (`pnpm evidence:motion`)
- [ ] TD-002 — Aceite do gyro iOS em dispositivo real
- [ ] Fase 7.3 — **Aprovação estética humana**: landing, lean, beat chrome,
      chapter print + perguntas do rubrica; registrar veredito em PR/docs
- [ ] M15 — Passada Safari/iPhone (scroll completo + gyro TD-002, mesma
      tarde da sessão S23) — veredito registrado no `docs/STATE.md`
      (absorvido do DoD do pareto de fechamento)

**Depois da sessão:** publicar seguindo
`docs/plans/launch-checklist.md` (A10) e restaurar (ou não) o claim de
performance **com número medido** (ADR-031).

**Decisões pós-sessão (T6.2):** reavaliar gatilhos — FALHA-02, FALHA-03
(variante segura), micro-polish. (F4b — GLB ≤ 15 MB — já fechado: PR #61,
ADR-029.)

## Bloco B — Housekeeping executável (agente)

- [x] T6.1 — `docs/STATE.md` sincronizado (Pareto #32–#37, ADRs 021–023,
      métricas reais) · rubrica re-preenchida por PR · PROGRESS reestruturado
- [x] Fase 7.5 — `commitlint` + `husky` + `lint-staged` (pre-commit roda
      lint-staged; commit-msg valida Conventional Commits)
- [x] G5 — rubrica re-preenchida nos PRs #32–#37 (fold concluído)
- [x] FIX — drag-orbit hover-only (gate `(hover: hover)`): swipe de scroll no
      touch tremia o modelo (condição de escala prevista em
      `model-interaction.md` §7.1, disparada em uso real). Mobile mantém gyro +
      tap-to-shoot + drift idle; desktop intocado. Vídeos de device que usavam
      drag (Bloco A, Waves 2–3) passam a valer drag de desktop

## Bloco C — Condicionais / data-gated (não executar sem os números)

- [ ] T1.2 — FALHA-02: threshold mobile-only medium→low < ~40 fps — só se
      T0.5 mostrar o medium na faixa 35–44
- [ ] FALHA-10 — syncTouch: só se fps ≥ 55 com queixa de "feel" persistente
- [x] F4b — GLB comprimido (meshopt, budget ≤ 15 MB): executado
      antecipadamente, fora do gatilho (PR #61, ADR-029 — 23,5 → 6,5 MB)
- [ ] FALHA-03 — render gating (variante pause-em-repouso): só se térmica/
      bateria dóiem após as Waves 1–2
- [x] Micro-polish quick wins — executados (2026-09-13): PR #40
      (tipografia reativa, carimbo por beat, CTA magnético, trama do traje) + PR #41 (spider-sense, respiração por beat). Restantes na fila
      (`docs/plans/backlog.md`) são médios/grandes, para calibrar em device
      junto com o Bloco A

## Removidos — não mais relevantes (decisão 2026-09-12)

- [-] **P3.3 — assets 2D via Higgsfield (ADR-020):** as três necessidades
  originais foram cobertas por outros meios — poster do fallback
  entregue com renders off-screen do modelo real (P3.2, "Opção A" da
  própria ADR), grão coberto pelo `Noise` do postprocessing, marca
  tipográfica entregue pelo loader teaser SVG + fontes self-hosted.
  Dependência externa paga sem demanda; reavaliar só se surgir
  necessidade real de asset gerado.
- [-] **G5 (rubrica Wave G):** incorporada ao fluxo — cada PR re-preenche a
  rubrica; ver Bloco B.

---

## Arquivo — planos concluídos (resumo)

> Estado narrativo por entrega: `docs/STATE.md`. Detalhe de execução: git
> history e PRs.

| Período    | Plano                                                                              | Entregas (todas `[x]`)                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-0x | **Bootstrap** (`docs/plans/archive/harness-bootstrap-plan.md`, Fases 0–7)          | Design system, specs, scaffold, gates, Playwright, CC-BY audit; CI (PR #30); 7.3/7.5 carregadas (7.5 fechada no Bloco B; 7.3 no Bloco A)                                                                                                                                                                                                                                                       |
| 2026-09-08 | **Premium Waves 1–4** (PRs #10–#13)                                                | Canvas/tone mapping, iluminação física + materiais, Lenis + timeline de câmera, motion tokens + loader + SplitText, chapter cards + progress bar + partículas + monitor adaptativo                                                                                                                                                                                                             |
| 2026-09-09 | **3D Motion Upgrade** (`3d-motion-upgrade-plan.md`, Waves A–G; PRs #17–#29)        | Wave F headroom (draw calls 118→44-46, `window.__perf`, PerfHud) · Wave B câmera Catmull-Rom (mudança de direção −54%, órbita 85°) · Wave A rig procedural 16 joints · Wave C shaders autorais + DOF/CA + `?fx` · P0 calibração de âncoras · Wave E atmosfera GPU · Wave D interatividade · Wave G verificação                                                                                 |
| 2026-09-10 | **Portfolio Impact** (`portfolio-impact-plan.md`; PR #31)                          | P0 composição/tipografia/copy (rubrica 4,2) · P1a loader teaser + opening card · P1b colofon (900vh) · P1c atmosfera por beat · P2a Arsenal macro + HUD · P2b pointer parallax + gyro iOS (ADR-018) · P3.1 web-shoot descobrível · P3.2 fallback WebGL em poster                                                                                                                               |
| 2026-09-12 | **Pareto Impact Plan** (`pareto-impact-plan.md`; PRs #32–#37)                      | W1 PERF-A: tier síncrono (mobile nunca `high`) + idle-gate + ProgressBar rAF + drive-bys + smoke tier · W2 PERF-B: shadow throttle (vale 16 calls) · W3 FIX: HDR/fontes self-hosted (0 requests externos) + isTap · W4a SIG: a chegada · W4b SIG: velocity lean · W5 POL: beat chrome + chapter cards impressos · ADRs 021–023 · specs arrival-landing/velocity-lean/beat-chrome/chapter-print |
| 2026-09-13 | **UX Polish** (`fix/ux-polish-2026-09-14`; PRs #54–#57)                            | B1 halo do spider-sense (ADR-027) · B2 race do HUD do Arsenal + hint de clique (ADR-028) · B3 colofon autoral (kicker autor + CTA duplo) · lint/comment hygiene (ADR-026)                                                                                                                                                                                                                      |
| 2026-09-14 | **Launch Readiness** (`archive/launch-readiness-plan.md`; PRs #58–#60)             | C2/A5/M13 licensing (LICENSE MIT, NOTICE, CC-BY estrita, disclaimer) · C1 social preview (OG 1200×630 + favicon de lentes + metas) · C3/A9/M10 README showcase EN-first + GIF + Lighthouse 29/83 + metadata do repo (homepage fawn→fan)                                                                                                                                                        |
| 2026-09-14 | **TD-003 meshopt** (`archive/glb-meshopt-td003-plan.md`; PR #61)                   | GLB 23,5 → 6,5 MB (quantização + EXT_meshopt_compression, ADR-029) · decisão de entrega via edge da Vercel · KTX2 em fase 2                                                                                                                                                                                                                                                                    |
| 2026-09-14 | **Post-Launch Wave** (`archive/post-launch-polish-plan.md`; PRs #62–#65, #68, #69) | W1 números pós-meshopt (Lighthouse 43/94, TBT −9,4×) · W2 vendor chunks (entry 1.573→265 kB, A6) · W3 contraste AA (dim #7d7c74, a11y 96→100, ADR-030, 5.12) · W4 headers de segurança CSP validada (M12, 5.3→9) · W5 RUM cookie-free + beacon WebGL (`/api/log`, A11) · W6 robots/sitemap + case study do harness + launch checklist (A10-artefatos, M11, B16)                                |
| 2026-09-14 | **Pareto de Fechamento** (`archive/pareto-closing-plan.md`; PRs #70–#72)           | Claim "zero janks" → fato verificável (ADR-031, #70) · consolidação da auditoria com re-score (#71) · `env:doctor`/`env:teardown` como gates executáveis + worktrees aninhadas no repo (#72) · merges #68/#69 confirmados                                                                                                                                                                      |

**Marcos acumulados:** ver `docs/STATE.md` (Métricas) — fonte única de
números; este arquivo mantém apenas o checklist executável.
