# Spec-Driven Development Contract

## 1. Purpose

This document defines the mandatory contract for every feature implementation in the spiderman-landing project. No feature can be merged without following this sequence.

## 2. Mandatory Sequence

Every feature MUST follow this exact sequence:

```
Scene Spec → Implement → Verify → Security Audit (if applicable) → PR
```

### 2.1 Scene Spec (Planning Phase)

**Owner:** `@plan` agent  
**Deliverable:** `docs/specs/<feature-slug>.md`

A Scene Spec MUST contain:

| Section | Required | Description |
|---|---|---|
| **Context** | ✅ | Which section of the landing page (Hero, Evolution, Arsenal, FullBody, Credits) |
| **Visual Goal** | ✅ | What the user should see/feel (reference design-bible.md) |
| **Composition** | ✅ | Safe zones, rule-of-thirds, mobile/desktop framing (reference composition-rules.md) |
| **3D Assets** | ✅ | Which GLB model, textures, animations required |
| **Lighting** | ✅ | Light types, positions, intensities, colors (use design tokens) |
| **Camera** | ✅ | Position, FOV, lookAt, mobile vs desktop keyframes |
| **Interactions** | ✅ | Mouse tracking, scroll triggers, GSAP animations |
| **Performance Budget** | ✅ | Target FPS, max draw calls, texture size limits (reference performance-design.md) |
| **Accessibility** | ✅ | ARIA labels, keyboard navigation, reduced-motion support |
| **Stop Conditions** | ✅ | When to stop iterating (see §4) |

**Template:** Use `docs/templates/scene-spec.md` (create if missing).

### 2.2 Implement (Development Phase)

**Owner:** `@implement` agent  
**Branch naming:** `feat/<feature-slug>`, `fix/<feature-slug>`, `chore/<feature-slug>`

Implementation rules:
- Follow the Scene Spec exactly — no deviations without updating the spec first
- Use design tokens from `src/design/tokens.ts` (no hardcoded hex)
- Use breakpoints from `src/design/breakpoints.ts`
- Apply frame-rate-independent animations (`1 - Math.exp(-k * delta)`)
- Add Error Boundaries for 3D components
- Ensure CC-BY attribution remains visible (if model is visible)

### 2.3 Verify (Quality Gate Phase)

**Owner:** `@verify` agent  
**Command:** `pnpm verify`

All gates MUST pass:
- ✅ Lint (zero errors)
- ✅ Typecheck (zero errors)
- ✅ Unit tests (all passing)
- ✅ Build (successful, warnings acceptable if documented)

Additionally:
- ✅ Visual tests (`pnpm test:visual`) at 3 viewports (390×844, 430×932, 1440×900)
- ✅ No visual regressions (compare against baseline screenshots)

### 2.4 Security Audit (Conditional)

**Owner:** `@security-audit` agent  
**When required:**
- Feature introduces new external dependencies
- Feature handles user input (forms, URL params)
- Feature loads external resources (CDN, third-party APIs)
- Feature modifies authentication/authorization (not applicable to this project)

**Deliverable:** Security review comment on the PR.

### 2.5 PR (Merge Request Phase)

**Owner:** Human (with agent assistance)  
**Template:** Use `docs/templates/pr.md`

PR body MUST include:
1. ✅ Full `pnpm verify` log (copy-paste, not summarized)
2. ✅ Visual rubric table filled with scores ≥ 4 for blockers
3. ✅ Screenshots from 3 viewports (390px, 430px, 1440px)
4. ✅ Link to the Scene Spec document
5. ✅ Conventional Commits in English
6. ✅ PR title and description in pt-BR

**Approval criteria:**
- All gates green
- Rubric score ≥ 4 on all blockers
- Visual evidence attached
- Scene Spec linked
- No unresolved review comments

## 3. Scene Spec Quality Criteria

A Scene Spec is considered "ready for implementation" when:

| Criterion | Threshold |
|---|---|
| **Completeness** | All 10 required sections filled |
| **Clarity** | No ambiguous language ("maybe", "perhaps", "could") |
| **Traceability** | Every visual decision references design-bible.md or storyboard.md |
| **Testability** | Stop conditions are measurable (e.g., "FPS ≥ 55 on iPhone 12") |
| **Accessibility** | ARIA labels and keyboard navigation explicitly defined |

## 4. Stop Conditions

Stop iterating and merge the PR when ALL of the following are true:

| Condition | Measurement |
|---|---|
| **Visual quality** | Rubric score ≥ 4 on all blockers (see visual-rubric.md) |
| **Performance** | FPS ≥ 55 on mid-tier mobile (iPhone 12 or equivalent) |
| **Accessibility** | Lighthouse a11y score ≥ 90 |
| **Code quality** | Zero lint/typecheck errors, all tests passing |
| **Legal compliance** | CC-BY attribution visible (if 3D model used) |

**When to stop and escalate:**
- Scene Spec is ambiguous or incomplete → return to `@plan`
- Gate technical fails after 3 iterations → escalate to human
- Visual quality < 4 after 3 iterations → escalate to human
- Performance budget exceeded by > 20% → escalate to human

## 5. Exceptions

This contract can be bypassed ONLY for:
- **Hotfixes:** Critical bugs in production (must be documented in PR)
- **Docs-only changes:** No code changes, only documentation updates
- **Chores:** Dependency updates, config changes (no visual impact)

All exceptions must be explicitly marked in the PR title with `[EXCEPTION]` prefix.

## 6. Enforcement

The orchestrator (`@orchestrator`) is responsible for:
1. Ensuring every task starts with a Scene Spec (or qualifies for exception)
2. Delegating to the correct agent in the correct sequence
3. Blocking PR creation if any gate fails
4. Escalating to human when stop conditions are met

**No PR can be opened without following this contract.**

## 7. Related Documents

- `docs/design/design-bible.md` — Visual direction
- `docs/design/storyboard.md` — Section-by-section breakdown
- `docs/design/composition-rules.md` — Safe zones and framing
- `docs/design/performance-design.md` — FPS targets and budgets
- `docs/design/visual-rubric.md` — Scoring criteria
- `docs/templates/scene-spec.md` — Scene Spec template
- `docs/templates/pr.md` — PR template