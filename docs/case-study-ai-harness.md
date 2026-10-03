# Case study: building with a bespoke AI agent harness

_How this landing page was engineered by an orchestrator-and-agents workflow — and why I built my own instead of installing one._

This portfolio piece (Spider-Man: Brand New Day — a cinematic, scroll-driven 3D experience) was built with an AI agent harness designed specifically for this repository. Not a generic "AI coding assistant" bolted onto the side: a delegation-only orchestrator, specialized agents with granular permissions, and evidence-gated pull requests. This document describes how it works, what it enforces, and the trade-offs I accepted.

## The shape of the system

- **A delegation-only orchestrator.** The top-level orchestrator never edits code. It decomposes work, dispatches to specialized agents, and enforces hard stops between phases. If an agent's output lacks evidence, the orchestrator bounces it back.
- **Ten agents** (a delegation-only orchestrator plus nine specialists) with per-command permissions: implementation, verification, documentation, PR assembly, and so on. The verify agent, for example, may run `pnpm lint`, `pnpm typecheck`, `pnpm test` — and nothing destructive. Permissions live in one declarative config ([`opencode.json`](../opencode.json)); each agent's prompt lives in its own file under [`.opencode/agents/`](../.opencode/agents/) — JSON wires, markdown instructs.
- **Specs drive code.** Features start as Scene Specs (25 shipped — index in `docs/specs/README.md`) that pin camera choreography, thresholds, and copy. `mobile-gyro-permission.md §3` _is_ the state machine you'll find in `gyroController.ts`; `spec-driven-contract.md` defines the Spec → Implement → Verify → PR pipeline every change follows.
- **Evidence, not impressions.** Every PR body carries real logs (`pnpm verify`, `pnpm test:smoke`), visual evidence from three viewports, and a visual rubric score. The verify agent's instruction says it plainly: _"reporte evidências, não impressões"_ — report evidence, not impressions.
- **Dependency changes are human-reviewed.** Agents cannot run `pnpm install`/`pnpm add`: a hallucinated package name (the _slopsquatting_ vector) would execute arbitrary postinstall code before any gate sees it. The defense is layered — the permission deny, `import/no-unresolved` + `no-extraneous-dependencies` at lint time, strict `tsc` and Vite resolution in the verify gate, pnpm's isolated `node_modules` (no phantom hoisting), and `--frozen-lockfile` in CI.
- **34 ADRs with rejected alternatives.** Decisions record what was _not_ chosen and why — e.g. why the canvas is not lazy-loaded (it would break the progress-driven loading choreography), why the GLB ships meshopt-compressed instead of KTX2-first.

## Why not an off-the-shelf plugin?

Off-the-shelf creative-coding skill packs are good and I've mined them for reference. They didn't fit here for three reasons:

1. **The direction is binding, not advisory.** A design bible, a frozen narrative copy (ADR-017), and composition rules govern every pixel. A generic orchestrator proposing fresh "interaction theses" would collide with decisions already made and recorded.
2. **The harness itself is the portfolio artifact.** For AI-augmented engineering roles, "here is the declarative config, the agent prompts, and the evidence trail of a system I designed" is a stronger signal than "I installed a plugin".
3. **Gates had to match the domain.** WebGL performance budgets (draw calls, tiers), visual rubrics, and device-session accepts are not things generic pipelines know how to gate.

## What it actually produced

- 44–46 draw calls on the top tier (down from 118), three adaptive quality tiers with idle-gated degradation, and a TBT of 780 ms on throttled mobile after compressing the model 23.5 → 6.5 MB.
- 168 unit tests + 14 visual specs, Conventional Commits enforced by husky, and **72 merged PRs** with readable history.
- A Security-Policy-validated deployment (the CSP was iterated three times against headless Chrome _before_ reaching production — the validation loop is documented in PR #65).

## Honest limitations

- The human is still the bottleneck for device work: the Samsung S23 session (real-fps thresholds) and an iPhone/Safari compatibility pass remain manual, because simulators can't answer those questions.
- Agents are bad at aesthetic judgment. The visual rubric is self-assigned by agents and flagged as such; a formal human rubric pass is still pending by design, not forgotten.
- Prompt-drift is real. The fix was boring: keep prompts short, put knowledge in specs, and make the CI the enforcer rather than the prose.

— Clayton Rafael · [the result](https://brand-new-day-fan.vercel.app/) · [the harness](../opencode.json)
