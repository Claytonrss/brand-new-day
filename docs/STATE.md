# STATE.md — spiderman-landing

## Estado Atual (2026-09-08)

**Fase:** Premium upgrade completo (4 waves entregues)

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

## Próximos Passos (fila priorizada)

1. **Scene Spec retroativa do FullBody** (Fase 6.9)
   - FullBody foi implementado na wave-3 sem spec
   - Criar spec retroativa para validar implementação
   - Branch: `docs/fullbody-spec-retroactive`

2. **Post-processing por perfil de dispositivo** (Fase 3.2)
   - EffectsStack atualmente incondicional
   - Degradar conforme quality-matrix.md (mobile vs desktop)
   - Branch: `feat/adaptive-post-processing`

3. **Testes visuais faltantes** (Fase 7.2)
   - `reduced-motion.spec.ts`
   - `credits.spec.ts`
   - `console.spec.ts`
   - Branch: `test/visual-gaps`

4. **commitlint + husky + lint-staged** (Fase 7.5)
   - Pre-commit hooks para qualidade
   - Branch: `chore/commit-hooks`

5. **CI do GitHub** (Fase 7.7)
   - GitHub Actions para verify + visual tests
   - Branch: `ci/github-actions`

6. **Validação humana** (Fase 7.3)
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

## Métricas

- **Commits:** 29+ (4 iniciais + 25 waves/specs/fixes)
- **PRs:** 13 (todos merged)
- **Visual tests:** 27/27 passing
- **Rubrica visual:** 5.0/5.0
- **GLB size:** 22.4 MB (optimized)
- **Total page height:** 700vh (4 seções + 2 chapter cards)