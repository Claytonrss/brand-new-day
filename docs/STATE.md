# STATE.md — spiderman-landing

## Estado Atual (2026-09-10)

**Fase:** Portfolio Impact — P0/P1a/P1b/P1c entregues; próximo P2a (Arsenal
macro + HUD)

### Upgrade de Movimento (plano: `docs/plans/3d-motion-upgrade-plan.md`)

- **Wave F — Headroom (PR #17, merged):** `BeatProvider` como fonte única de
  beat; `LightRig` com 6 slots de luz permanentes; `Stage`; remoção das 4
  scenes; `window.__perf` + `PerfHud` (`?debug=1`); dpr 1.75/1.25/1.
  - Draw calls por frame: **118–120 → 44–46** (−62 %)
  - `programs` estável em 10 (antes crescia 10 → 27 no scroll)
  - Evidências: `docs/evidence/wave-f-headroom/` (36 screenshots before/after)
- **Wave B — Câmera (PR #19, merged):** curva única de Catmull-Rom com easing
  por beat; Beat 3 com 85° de órbita real em torno do punho (antes 0,2°);
  handheld noise fbm; FOV punch + dolly lag por velocidade; correção do
  `prefers-reduced-motion` (antes travava a câmera em `fullBody`)
  - Pico de mudança de direção: **133,9° → 62,1°** (−54 %), p95 20,2°
  - Evidências: `docs/evidence/wave-b-camera/` (38 arquivos)
- **Wave A — Sujeito vivo (PR #21, merged):** camada procedural aditiva sobre a
  rest pose — respiração, sway, deslocamento de peso, micro-tremor, poses por
  beat e head-tracking com slerp + follow-through.
  - **Achado:** o lookup de joints usava o nome cru do glTF (`mixamorig:Head_06`)
    mas o loader sanitiza para `mixamorigHead_06` — o Beat 1 "olhar que segue"
    nunca existiu; o modelo inteiro girava ~4°. Agora 16 joints são resolvidos.
  - Evidências: `docs/evidence/wave-a-rig/` (38 arquivos)
- **Wave C — Efeitos autorais (PR #23, merged):** camada autoral de material
  (rim de fresnel, teia procedural animada, iridescência na lente) e
  post-processing por beat (DOF com foco no alvo do beat + aberração cromática).
  Modos `?fx=off|subtle|full`, padrão `subtle` (22%).
- **P0 — Calibração (PR #24, merged):** âncoras derivadas do esqueleto
  (`anchorStore`) corrigem a mira de Evolution (era a axila) e Arsenal (não
  mostrava o lançador); pose do antebraço a ~63°; cabeça com bias e limites
  assimétricos; easing linear nos beats intermediários.
  - Evidências: `docs/evidence/wave-p0-calibration/`
- **Wave E — Atmosfera (PR #26, merged):** partículas em GPU (turbulência +
  3 camadas de parallax, **1 draw call**), névoa exponencial e reação ao Beat 2.
  - `reduced-motion`: 0% de diff de pixels
- **Wave D — Interatividade (PR #26, merged):** arrastar para orbitar com mola
  de retorno, giroscópio no mobile, teia no Beat 3, luz de recorte no cursor.
- **Piscada estilizada:** pálpebras E+D por obturador de shader
  (`?blink=off|subtle|full|hold`); aceite medido em 98,1% de queda dos pixels
  de lente no ápice.
- **Próxima:** Wave G — verificação (gates de orçamento/console/atribuição e
  evidência em vídeo)

### Implementado
- 4 seções: Hero, Evolution, Arsenal, FullBody
- Camera rig com master timeline (ScrollTrigger + lerp k=2)
- Lenis smooth scroll
- Head-tracking Beat 1 (yaw ±0.48 rad, idle drift)
- Physical lighting (dual-rim, candela units)
- Post-processing pipeline (Bloom, Vignette, Noise)
- Environment map (PBR reflections)
- Material curation (per-material intent, emissive)
- Motion tokens system (durations, easings, staggers)
- Cinematic loader (progress bar + fade-out)
- SplitText headlines (caractere por caractere)
- Chapter cards (MUDANÇA + REVELAÇÃO)
- Progress bar (scroll indicator)
- L1 particles (atmospheric depth)
- Performance monitor (adaptive quality high/medium/low)
- 27/27 visual tests passing (3 viewports × 4 seções + chapter cards)

### Rubrica Visual
- **Nota:** 4,2/5,0 (média ponderada) — re-preenchida na Wave P0
- **Bloqueantes:** primeira dobra 5, composição mobile 4, integração texto/personagem 4
- **Evidências:** `docs/evidence/portfolio-audit-p0/` (24 screenshots novos)
- **Pendente:** FPS em dispositivo real (Fase 7.3)

### PRs Merged
- PR #1: Look Dev v1 hero section (feat/look-dev-hero)
- PR #2: fix quality blockers (Look Dev v2)
- PR #3: spec-driven contract
- PR #4: Hero spec
- PR #5: Hero implementation
- PR #6: Evolution spec
- PR #7: Evolution implementation
- PR #8: Arsenal spec
- PR #9: Arsenal implementation
- PR #10: Wave 1 (3D presentation)
- PR #11: Wave 2 (scroll experience)
- PR #12: Wave 3 (motion & narrative)
- PR #13: Wave 4 (depth & chrome)
- PR #14: docs sync (PROGRESS, STATE, ADRs)
- PR #15: FullBody spec retroativa (Fase 6.9)
- PR #16: adaptive post-processing (Fase 3.2)
- PR #17: Wave F — headroom (iluminação por beat com slots fixos)
- PR #18: docs sync pós-Wave F (ADR-008/009/010)
- PR #19: Wave B — câmera cinematográfica (curva, órbita, velocidade)
- PR #20: docs sync pós-Wave B (ADR-011)
- PR #21: Wave A — rig procedural (sujeito vivo)
- PR #22: docs sync pós-Wave A (ADR-012)
- PR #23: Wave C — efeitos autorais (shaders + DOF por beat)
- PR #24: P0 — calibração de âncoras, cabeça e suavidade
- PR #25: docs sync pós-Wave C e P0 (ADR-013/014)
- PR #26: Waves E e D — atmosfera em GPU, interatividade e piscada

## Próximos Passos (fila priorizada)

0. **Portfolio Impact Plan** (`docs/plans/portfolio-impact-plan.md`)
   - **Ponto de entrada para implementação:** `docs/plans/implementation-kickoff.md`
     (ordem, gates e contrato por feature)
   - ✅ **P0 (composição/tipografia/copy) entregue:** `fix/portfolio-p0-composition`
     — copy do Arsenal/FullBody fora do foco, quebras manuais, copy FullBody
     alinhada ao storyboard (ADR-017), rubrica re-preenchida (4,2; bloqueantes ≥4)
   - ✅ **P1a.1 (loader teaser) entregue:** lentes da máscara acendem com o
     progresso (SVG 2D, sem WebGL novo); evidência `docs/evidence/loader-teaser/`
   - ✅ **P1a.2 (opening title card) entregue:** card tipográfico 100vh antes do
     Hero (Beat 0 compartilha a câmera Hero); página 700vh → 800vh; evidência
     `docs/evidence/opening-title-card/`
   - ✅ **P1b.1 (colofon) entregue:** seção final editorial com autoria, stack,
     CTA único e CC-BY; modelo dissolve via gradiente da seção + cue `colophon`;
     página 800vh → 900vh; evidência `docs/evidence/colophon-outro/`
   - ✅ **P1c.1 (atmosfera por beat) entregue:** partículas (`uDensity`),
     `FogExp2` e grão dirigidos por beat com crossfade; `Atmosphere` passou
     para dentro do `BeatProvider`; evidência `docs/evidence/atmosphere-per-beat/`
   - **Próximo:** P2a (Arsenal macro + HUD) → P2b (plataforma) → P3 (robustez)
   - Specs: `docs/specs/{loader-teaser, opening-title-card, arsenal-macro-hud,
     colophon-outro, atmosphere-per-beat, desktop-pointer-parallax,
     mobile-gyro-permission, web-shoot-discovery, webgl-static-fallback}.md`
   - ADRs: ADR-017 (copy FullBody), ADR-018 (gyro iOS), ADR-019 (colofon),
     ADR-020 (assets Higgsfield)
   - Evidências da auditoria: `docs/evidence/portfolio-audit/` (baseline) e
     `docs/evidence/portfolio-audit-p0/` (pós-P0)
0. **Wave G — verificação** (`test/wave-g-verification`, em PR)
   - Gates de orçamento (`budget.spec.ts`), console e atribuição
   - Evidência em vídeo por viewport (`pnpm evidence:motion`)
0. **F4b — comprimir geometria do GLB** (meshopt/quantização; exige re-export + ADR)
0. **FPS em dispositivo real** (iPhone 12 / Android mid) — bloqueia critério de performance

1. **Testes visuais faltantes** (Fase 7.2)
   - `reduced-motion.spec.ts`
   - `credits.spec.ts`
   - `console.spec.ts`
   - Branch: `test/visual-gaps`

2. **commitlint + husky + lint-staged** (Fase 7.5)
   - Pre-commit hooks para qualidade
   - Branch: `chore/commit-hooks`

3. **CI do GitHub** (Fase 7.7)
   - GitHub Actions para verify + visual tests
   - Branch: `ci/github-actions`

4. **Validação humana** (Fase 7.3)
   - FPS em dispositivo real (iPhone 12, Android mid-tier)
   - Security audit (dependências, GLB source)
   - Aprovação final do stakeholder

## Decisões Arquiteturais (ADRs)

- ADR-001: Stack (Vite 8 + React 19 + TS 5.9 + Tailwind v4 + Three 0.185 + R3F 9 + Drei 10 + GSAP 3.15 + pnpm 9)
- ADR-002: Modelo 3D Eskze (CC-BY 4.0), rig Mixamo 66 joints
- ADR-003: Playwright em 3 viewports (390×844, 430×932, 1440×900)
- ADR-004: Camera Rig — ScrollTrigger + lerp k=3 + debounce resize
- ADR-005: Lenis over ScrollSmoother (smooth scroll premium)
- ADR-006: Wave 4 depth/chrome (chapter cards, particles, performance monitor)
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

## Métricas

- **Commits:** 35+ (4 iniciais + 31 waves/specs/fixes/docs)
- **PRs:** 16 (todos merged)
- **Visual tests:** 27 (+6 de reduced-motion) — ⚠️ `console.spec.ts` e
  `credits.spec.ts` (fila `test/visual-gaps`) foram perdidos: nunca foram
  commitados e não estão mais no working tree. Precisam ser recriados.
- **Unit tests:** 94 (beat · iluminação · câmera · rig · âncoras · materiais · atmosfera · interação · piscada)
- **Movimento verificado:** 15 asserções em `motion.spec.ts` (respiração avança,
  ponteiro é clampado, follow-through ordenado, reduced-motion congela)
- **Rubrica visual:** 4,2/5,0 (média ponderada) — re-preenchida na Wave P0
  contra `docs/evidence/portfolio-audit-p0/`; bloqueantes 5/4/4. FPS em
  dispositivo real ainda não medido.
- **Draw calls/frame:** 44–46 (tier medium/high) · 11–13 (low) — antes 118–120
- **GLB size:** 22.4 MB (22.4 MB dos quais ~19 MB são geometria **não
  comprimida** — item F4b em aberto; budget é ≤ 15 MB)
- **Total page height:** 700vh (4 seções + 2 chapter cards)