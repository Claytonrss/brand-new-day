# AGENTS.md — spiderman-landing

## 1. Identidade do Projeto

- **Nome:** spiderman-landing
- **Tipo:** Landing page 3D cinematográfica de portfólio — Spider-Man: Brand New Day
- **Objetivo:** demonstrar direção de arte, engenharia WebGL e craft de frontend
- **Regra de ouro:** o MVP é "ter presença visual de portfólio", não "funcionar"

## 2. Stack

| Camada          | Tecnologia                                               |
| --------------- | -------------------------------------------------------- |
| Framework       | Vite 8 + React 19 + TypeScript 5.9                       |
| Estilo          | Tailwind CSS v4                                          |
| 3D              | Three.js + @react-three/fiber v9 + @react-three/drei v10 |
| Post-processing | @react-three/postprocessing                              |
| Animação        | GSAP ScrollTrigger                                       |
| Testes          | Vitest (unit) + Playwright (visual)                      |
| Package manager | **pnpm 9** — nunca npm/yarn                              |
| Runtime         | Node.js >= 22                                            |

## 3. Design Tokens

Definidos em `src/index.css` via `@theme` (Tailwind v4):

| Token      | Hex       | Uso                       |
| ---------- | --------- | ------------------------- |
| `ink`      | `#0a0a0c` | fundo principal           |
| `concrete` | `#141417` | superfícies secundárias   |
| `steel`    | `#2c3b4c` | detalhes frios            |
| `oxide`    | `#7a1f24` | acento quente (rim light) |
| `signal`   | `#c23b34` | acento máximo             |
| `paper`    | `#e9e5da` | texto principal           |
| `dim`      | `#7d7c74` | texto secundário          |
| `glow`     | `#eaf4ff` | brilho frio (teia/lente)  |

Fontes: **Space Grotesk** (display), **JetBrains Mono** (HUD/labels). Direção
visual vinculante: `docs/design/design-bible.md`.

## 4. Documentos sob Demanda

Carregar apenas quando a tarefa exigir — **nunca preemptivamente**:

| Documento                                      | Conteúdo                                          |
| ---------------------------------------------- | ------------------------------------------------- |
| `docs/design/design-bible.md`                  | direção visual vinculante                         |
| `docs/design/storyboard.md`                    | seções como planos de câmera + copy               |
| `docs/design/composition-rules.md`             | zonas seguras de texto                            |
| `docs/design/quality-matrix.md`                | perfis de qualidade por dispositivo               |
| `docs/design/visual-rubric.md`                 | rubrica de avaliação estética                     |
| `docs/design/performance-design.md`            | FPS alvo, budgets, degradação                     |
| `docs/specs/` (índice: `docs/specs/README.md`) | Scene Specs por feature                           |
| `docs/workflow/spec-driven-contract.md`        | contrato Spec → Implement → Verify → PR           |
| `docs/STATE.md`                                | estado narrativo atual (entregas, ADRs, métricas) |
| `docs/memory/decisions.md`                     | registro completo de ADRs                         |
| `docs/memory/tech-debt.md`                     | débitos aceitos conscientemente                   |
| `docs/plans/backlog.md`                        | ideias não implementadas (curadas)                |
| `docs/plans/wave0-s23-runbook.md`              | runbook ativo da sessão de device (S23)           |
| `docs/agents/test-isolation.md`                | runbook: isolar ambiente/porta para testes        |

## 5. Workflow

1. Ler `PROGRESS.md` para estado atual.
2. Consultar Scene Spec relevante antes de implementar.
3. Criar branch: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>` — de preferência em **worktree própria** (ver §10).
4. Implementar seguindo Design Bible e composition rules.
5. Rodar `bash scripts/verify-all.sh` antes de push.
6. Commit com Conventional Commits.
7. **PR obrigatoriamente com evidências** — logs reais de `pnpm verify` +
   `pnpm test:smoke`, rubrica visual (nota ≥ 4) e os 3 viewports
   (`pnpm evidence:visual`). Fonte única da regra:
   `docs/workflow/spec-driven-contract.md` §2.5 — sem evidências, o PR não abre.

## 6. Comandos

```bash
pnpm dev              # Dev server
pnpm build            # TypeScript + Vite build
pnpm typecheck        # Type check only
pnpm lint             # ESLint (inclui import/no-unresolved)
pnpm test             # Vitest unit tests
pnpm test:smoke       # Playwright tier rápido (@smoke, mobile-390) — gate de PR
pnpm test:visual      # Playwright suite completo (deep tier) — CI na main / sob demanda
pnpm verify           # All gates (lint + typecheck + test + build)
pnpm evidence:visual  # Screenshots 390/430/1440 (evidência de PR)
pnpm evidence:motion  # Vídeos de motion (calibração em device)
pnpm inspect:glb      # Inspect GLB asset metadata
pnpm env:doctor       # Pre-flight de ambiente (porta/suíte/capacidade) — exit 1 bloqueia
pnpm env:teardown     # Stop escopado por checkout (--force órfãos, --clean artefatos)
```

Coletores de evidência avulsos (por feature): `scripts/collect-*.mjs` —
inventário em `scripts/README.md`.

## 7. Qualidade Visual & Regra de PRs

- Design é a feature principal — implementação funcional sem impacto visual não está pronta.
- Rubrica visual com nota mínima 4 para bloqueantes (`docs/design/visual-rubric.md`).
- Playwright roda nos projetos `mobile-390` e `desktop-1440` (fonte única:
  `playwright.config.ts`); evidências dos 3 viewports vêm de `pnpm evidence:visual`.

## 8. Asset 3D

- Modelo: `public/models/spider-man_brand_new_day-v3-meshopt.glb` (≈ 6,5 MB; meshopt + quantização, ADR-029)
- Autor: Eskze (Sketchfab), licença CC-BY 4.0 — atribuição obrigatória visível sem hover
- Rig: Mixamo (66 joints, incluindo `mixamorig:Head_06` e `mixamorig:Neck_05`)
- Inspeção: `pnpm inspect:glb`

## 9. Memória Persistente

- `PROGRESS.md` — checklist de fechamento (o que falta, não o que foi feito)
- `docs/STATE.md` — estado narrativo atual (entregas, ADRs resumidos, métricas)
- `docs/memory/decisions.md` — ADRs completos
- `docs/memory/tech-debt.md` — débitos aceitos
- `docs/plans/backlog.md` — fila de ideias não implementadas
- Planos concluídos: `docs/plans/archive/` (referência histórica indexada)

## 10. Isolamento de Ambiente para Testes (obrigatório)

O Playwright local reusa **qualquer** server na porta do `.env` (default 5173) — um dev server de outro checkout contamina a suíte silenciosamente.
Resumo vinculante (runbook completo com tabelas de decisão:
`docs/agents/test-isolation.md`):

1. **Worktree própria por tarefa**, criada de `origin/main` dentro do repo:
   `git worktree add -b <branch> .worktrees/<slug> origin/main` + `pnpm
bootstrap` (deps + `.env` com porta isolada). Todos os comandos rodam a
   partir da worktree.
2. **Pre-flight antes de Playwright/evidências:** `pnpm env:doctor` (exit 1
   bloqueia; `test:smoke`/`test:visual`/`evidence:visual` já rodam o gate).
   NÃO use `pnpm doctor` — builtin do pnpm, sombreia o script.
3. **Exclusão mútua:** uma suíte Playwright/evidência por vez na máquina
   (Vitest/lint/typecheck/build podem paralelizar). Suíte ocupada → aguardar
   (poll 30s, teto 15 min), nunca aumentar `--workers`.
4. **Contaminação suspeita** (`element not found` para seletor novo, timeouts
   em cascata): checar a porta **antes** de debugar código.
5. **Limpeza:** `pnpm env:teardown` (nunca processos de outro checkout) e
   remover worktrees de rascunho.

## 11. Limites de Ação (ACI)

- **Confirmar com o usuário antes:** `rm -rf` em qualquer diretório ·
  `git push --force` / `git reset --hard` · alterações em `opencode.json`,
  `.opencode/**` ou outras configs de agente · `pnpm install`/`add`
  (mudança de dependência é operação revisada por humano).
- **Autônomo:** criar/editar arquivos (exceto configs de agente) · rodar
  `pnpm lint`/`test`/`build`/`typecheck` · criar branches locais.
- Paths sempre absolutos ou relativos ao root do projeto.
