# PROGRESS.md — spiderman-landing

Checklist de fechamento do **Pareto Impact Plan**
(`docs/plans/pareto-impact-plan.md`): as Waves 1–5 estão **entregues e
mergeadas** (PRs #32–#37). O que resta está organizado em três blocos:
**device** (só você executa), **housekeeping** (executável por agente) e
**condicionais** (decididos com os números do device).

**Legenda:** `[ ]` pendente · `[~]` em progresso · `[x]` concluído · `[-]` não aplicável

**Última atualização:** 2026-09-13

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

**Decisões pós-sessão (T6.2):** reavaliar gatilhos — F4b/FALHA-14 (GLB
≤ 15 MB se medium < 45 fps), FALHA-03 (variante segura), micro-polish.

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
- [ ] F4b — GLB comprimido (meshopt, budget ≤ 15 MB, re-export + ADR): só se
      FALHA-14 disparar (medium < 45 fps em devices médios)
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

| Período    | Plano                                                                       | Entregas (todas `[x]`)                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-0x | **Bootstrap** (`docs/plans/archive/harness-bootstrap-plan.md`, Fases 0–7)   | Design system, specs, scaffold, gates, Playwright, CC-BY audit; CI (PR #30); 7.3/7.5 carregadas (7.5 fechada no Bloco B; 7.3 no Bloco A)                                                                                                                                                                                                                                                       |
| 2026-09-08 | **Premium Waves 1–4** (PRs #10–#13)                                         | Canvas/tone mapping, iluminação física + materiais, Lenis + timeline de câmera, motion tokens + loader + SplitText, chapter cards + progress bar + partículas + monitor adaptativo                                                                                                                                                                                                             |
| 2026-09-09 | **3D Motion Upgrade** (`3d-motion-upgrade-plan.md`, Waves A–G; PRs #17–#29) | Wave F headroom (draw calls 118→44-46, `window.__perf`, PerfHud) · Wave B câmera Catmull-Rom (mudança de direção −54%, órbita 85°) · Wave A rig procedural 16 joints · Wave C shaders autorais + DOF/CA + `?fx` · P0 calibração de âncoras · Wave E atmosfera GPU · Wave D interatividade · Wave G verificação                                                                                 |
| 2026-09-10 | **Portfolio Impact** (`portfolio-impact-plan.md`; PR #31)                   | P0 composição/tipografia/copy (rubrica 4,2) · P1a loader teaser + opening card · P1b colofon (900vh) · P1c atmosfera por beat · P2a Arsenal macro + HUD · P2b pointer parallax + gyro iOS (ADR-018) · P3.1 web-shoot descobrível · P3.2 fallback WebGL em poster                                                                                                                               |
| 2026-09-12 | **Pareto Impact Plan** (`pareto-impact-plan.md`; PRs #32–#37)               | W1 PERF-A: tier síncrono (mobile nunca `high`) + idle-gate + ProgressBar rAF + drive-bys + smoke tier · W2 PERF-B: shadow throttle (vale 16 calls) · W3 FIX: HDR/fontes self-hosted (0 requests externos) + isTap · W4a SIG: a chegada · W4b SIG: velocity lean · W5 POL: beat chrome + chapter cards impressos · ADRs 021–023 · specs arrival-landing/velocity-lean/beat-chrome/chapter-print |

**Marcos acumulados:** draw calls 44–46 (high) · 30–46 medium com vale de
sombra · 11–13 (low) · tier inicial síncrono (mobile = medium) · 0 requests
externos · rubrica 4,5/5,0 (auto; humana pendente) · 134 unit tests · 12
specs visuais (7 `@smoke` no gate de PR) · hooks de commit · página 900vh.
