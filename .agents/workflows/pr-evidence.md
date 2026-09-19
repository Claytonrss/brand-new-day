# Workflow: pr-evidence

Entry point intencional para coletar evidências de PR (detalhe completo na
skill `pr-evidence`; regra no `docs/workflow/spec-driven-contract.md` §2.5).

1. `pnpm env:doctor` — bloqueado (exit 1)? Pare e veja a skill `test-isolation`.
2. `bash scripts/verify-all.sh` — colar log real no PR.
3. `pnpm test:smoke` — gate rápido (`mobile-390`).
4. `pnpm env:doctor --fix && pnpm evidence:visual` — screenshots 390/430/1440.
5. Rubrica visual (`docs/design/visual-rubric.md`) — nota ≥ 4 nos bloqueantes.
6. Abrir PR: título/descrição pt-BR, commits Conventional (EN), template
   `docs/templates/pr.md`. Chores/docs-only → prefixo `[EXCEPTION]`.
7. `pnpm env:teardown` — liberar a porta no fim.
