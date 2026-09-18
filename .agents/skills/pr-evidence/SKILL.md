---
name: pr-evidence
description: Coleta as evidências obrigatórias de PR deste repo — gates verify, smoke no mobile-390, rubrica visual com nota ≥ 4 e screenshots 390/430/1440. Use quando for abrir um PR de feature/fix, anexar evidências ou decidir se um PR pode ser aberto sem violar o contrato spec-driven.
---

# PR Evidence — evidências obrigatórias de PR

Fonte única da regra: `docs/workflow/spec-driven-contract.md` §2.5. **PR sem
evidências não abre.**

## Quando usar

- Antes de abrir qualquer PR de feature/fix com impacto visual ou de código.
- Quando o usuário pedir "evidências de PR", "rubrica visual" ou "screenshots
  dos 3 viewports".
- Exceção: chores e docs-only não exigem rubrica/screenshots (contrato §5),
  mas o PR deve levar o prefixo `[EXCEPTION]` no título.

## Passos

1. **Isolamento** — `pnpm env:doctor` (exit 1 = pare; veja a skill
   `test-isolation`). Nunca `pnpm doctor` (builtin do pnpm, sombreia o script).
2. **Gates técnicos** — `bash scripts/verify-all.sh` (lint + typecheck + test
   - build). Logs completos ficam em `test-results/logs/`.
3. **Smoke** — `pnpm test:smoke` (tier rápido, projeto `mobile-390`).
4. **Evidência visual** — `pnpm env:doctor --fix` e depois
   `pnpm evidence:visual` (fotografa 390/430/1440 a partir da porta do `.env`).
5. **Rubrica visual** — preencha `docs/design/visual-rubric.md` com nota ≥ 4
   em todos os bloqueantes e cole a tabela no PR.
6. **PR** — título e descrição em pt-BR, commits em inglês (Conventional
   Commits), template `docs/templates/pr.md`, link para a Scene Spec.

## Regras

- Logs no PR são copy-paste reais, nunca resumidos.
- Nota < 4 em qualquer bloqueante = voltar a iterar, não abrir PR.
- Higiene de fim de tarefa: `pnpm env:teardown` (runbook §7).
