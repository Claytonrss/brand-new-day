# STATE.md — spiderman-landing

## Estado Atual (2026-09-09)

**Fase:** Upgrade de movimento/efeitos 3D — Wave F (headroom) entregue, Wave B (câmera) em seguida

### Upgrade de Movimento (plano: `docs/plans/3d-motion-upgrade-plan.md`)

- **Wave F — Headroom (PR #17, merged):** `BeatProvider` como fonte única de
  beat; `LightRig` com 6 slots de luz permanentes; `Stage`; remoção das 4
  scenes; `window.__perf` + `PerfHud` (`?debug=1`); dpr 1.75/1.25/1.
  - Draw calls por frame: **118–120 → 44–46** (−62 %)
  - `programs` estável em 10 (antes crescia 10 → 27 no scroll)
  - Evidências: `docs/evidence/wave-f-headroom/` (36 screenshots before/after)
- **Próxima:** Wave B — câmera cinematográfica (curva de Catmull-Rom, orbit
  esférico no Arsenal, punch de FOV por velocidade, correção do
  `prefers-reduced-motion`)

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
- **Nota:** 5.0/5.0 (máxima)
- **Critérios:** 14/14 com nota 5
- **Evidências:** `docs/evidence/wave-4-depth-chrome/`

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

## Próximos Passos (fila priorizada)

0. **Wave B — câmera cinematográfica** (`feat/cinematic-camera-path`)
   - Curva de Catmull-Rom com reparam. por arco + easing por beat
   - Orbit esférico no Arsenal (fim do dolly reto)
   - FOV punch / dolly lag por velocidade do Lenis
   - Correção do `prefers-reduced-motion` (hoje trava em `fullBody`)
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

## Métricas

- **Commits:** 35+ (4 iniciais + 31 waves/specs/fixes/docs)
- **PRs:** 16 (todos merged)
- **Visual tests:** 48 (47 + 1 reexecutado isolado por timeout de ambiente)
- **Unit tests:** 11 (beat timeline + invariantes de iluminação)
- **Rubrica visual:** 5.0/5.0 (autoatribuída nas waves 1–4, sem medição) —
  critérios de iluminação/impacto da Wave F aguardam aprovação humana
- **Draw calls/frame:** 44–46 (tier medium/high) · 11–13 (low) — antes 118–120
- **GLB size:** 22.4 MB (22.4 MB dos quais ~19 MB são geometria **não
  comprimida** — item F4b em aberto; budget é ≤ 15 MB)
- **Total page height:** 700vh (4 seções + 2 chapter cards)