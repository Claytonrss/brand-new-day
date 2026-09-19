# Workflow: test-isolation

Entry point intencional antes de qualquer Playwright/evidência (detalhe na
skill `test-isolation`; runbook completo em `docs/agents/test-isolation.md`).

1. Está numa worktree própria (`git worktree add -b <branch> .worktrees/<slug>
origin/main` + `pnpm bootstrap`)? Se não, crie antes de rodar.
2. `pnpm env:doctor` — exit 1 = não rode agora (porta contaminada, suíte
   ativa, máquina saturada ou órfãos).
3. Há outra suíte Playwright na máquina? Aguarde (poll 30s, teto 15 min).
4. Rode a suíte/evidência a partir da worktree, na porta do `.env`.
5. `pnpm env:teardown` + remover worktrees de rascunho ao encerrar.
