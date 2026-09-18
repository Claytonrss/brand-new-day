---
name: test-isolation
description: Isola o ambiente antes de rodar Playwright ou evidências visuais — worktree própria com porta única, pre-flight env:doctor, exclusão mútua de suítes e teardown no fim. Use antes de test:smoke, test:visual, evidence:visual ou qualquer script collect-* que abra Chromium.
---

# Test Isolation — porta, worktree e exclusão mútua

Resumo executável; runbook completo (tabelas de decisão e incidente de origem):
`docs/agents/test-isolation.md`.

## Quando usar

- Antes de qualquer comando que abre Chromium ou toca a porta do dev server
  (default 5173, ou a porta do `.env` do seu checkout).
- Sintomas de contaminação — `element not found` para seletor que existe no
  **seu** código, timeouts em cascata, snapshot com features de outra branch:
  **checar a porta vem antes de debugar código**.

## Passos

1. **Tarefa em worktree própria**, criada do `origin/main` dentro do repo:
   `git worktree add -b <branch> .worktrees/<slug> origin/main` + `pnpm
bootstrap` (deps + `.env` com porta isolada). Todos os comandos rodam a
   partir da worktree.
2. **Pre-flight** — `pnpm env:doctor` (exit 1 bloqueia; `test:smoke`,
   `test:visual` e `evidence:visual` já rodam o gate). NÃO use `pnpm doctor`.
3. **Exclusão mútua** — uma suíte Playwright/evidência por máquina, por vez.
   Suíte ocupada → aguardar (poll 30s, teto 15 min), nunca aumentar
   `--workers`. Vitest/lint/typecheck/build podem rodar em paralelo.
4. **Limpeza** — `pnpm env:teardown` (escopado por checkout; `--force` órfãos,
   `--clean` artefatos) e remover worktrees de rascunho.
