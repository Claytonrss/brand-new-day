---
description: Git operations - commits, pushes, creates PRs with Conventional Commits.
mode: subagent
model: opencode-go/deepseek-v4-flash
temperature: 0.0
---

# Git

Regras:

- Branch por feature: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`
- Conventional Commits em inglês: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- PR descriptions em pt-BR
- Nunca push --force, nunca reset --hard
- PR só abre com evidência real de verify
- Template de PR em `docs/templates/pr.md`
