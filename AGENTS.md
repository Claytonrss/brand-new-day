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
| `dim`      | `#6b6a63` | texto secundário          |

Fontes: **Space Grotesk** (display), **JetBrains Mono** (HUD/labels).

## 4. Documentos sob Demanda

Carregar apenas quando a tarefa exigir:

| Documento                                      | Conteúdo                                        |
| ---------------------------------------------- | ----------------------------------------------- |
| `docs/design/design-bible.md`                  | direção visual vinculante                       |
| `docs/design/storyboard.md`                    | seções como planos de câmera + copy             |
| `docs/design/mobile-first.md`                  | keyframes por breakpoint                        |
| `docs/design/composition-rules.md`             | zonas seguras de texto                          |
| `docs/design/quality-matrix.md`                | perfis de qualidade por dispositivo             |
| `docs/design/visual-rubric.md`                 | rubrica de avaliação estética                   |
| `docs/design/performance-design.md`            | FPS alvo, budgets, degradação                   |
| `docs/plans/archive/harness-bootstrap-plan.md` | plano completo de bootstrap                     |
| `docs/agents/test-isolation.md`                | runbook: isolar ambiente/porta 5173 para testes |

**Regra:** NUNCA carregar todos preemptivamente.

## 5. Workflow

1. Ler `PROGRESS.md` para estado atual.
2. Consultar Scene Spec relevante antes de implementar.
3. Criar branch: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>` — de preferência em **worktree própria** (ver §11).
4. Implementar seguindo Design Bible e composition rules.
5. Rodar `bash scripts/verify-all.sh` antes de push.
6. Commit com Conventional Commits.
7. Antes de Playwright/evidências: **pre-flight da porta 5173** (ver §11) — server de outro checkout contamina a suíte silenciosamente.
8. **PR Obrigatório com Evidências:** Todo PR DEVE obrigatoriamente incluir no seu corpo/descrição o log de saída real do `pnpm verify` (lint, typecheck, unit test, build) **e** do `pnpm test:smoke` (tier Playwright rápido, mobile-390), a tabela de rubrica visual preenchida com nota >= 4 e a relação de evidências (screenshots dos viewports 390px, 430px e 1440px via `pnpm evidence:visual`). O suite visual completo (`pnpm test:visual`) roda no CI em push para `main`.

## 6. Comandos

```bash
pnpm dev              # Dev server
pnpm build            # TypeScript + Vite build
pnpm typecheck        # Type check only
pnpm lint             # ESLint
pnpm test             # Vitest unit tests
pnpm test:smoke       # Playwright tier rápido (@smoke, mobile-390) — gate de PR
pnpm test:visual      # Playwright suite completo (deep tier) — CI na main / sob demanda
pnpm verify           # All gates (lint + typecheck + test + build)
pnpm inspect:glb      # Inspect GLB asset metadata
```

## 7. Qualidade Visual & Regra de PRs

- Design é a feature principal — implementação funcional sem impacto visual não está pronta.
- Verify revisa composição, hierarquia visual e impressão de portfólio.
- Rubrica visual com nota mínima 4 para bloqueantes (ver `docs/design/visual-rubric.md`).
- Playwright roda nos viewports 390x844 e 1440x900; evidências visuais dos 3 viewports (390/430/1440) vêm de `pnpm evidence:visual`.
- **Regra de Ouro do PR:** PR sem evidências anexadas no corpo (logs de teste + rubrica + evidências visuais) não pode ser aberto nem aprovado.

## 8. Asset 3D

- Modelo: `public/models/spider-man_brand_new_day-v2.glb` (50.4 MB)
- Autor: Eskze (Sketchfab), licença CC-BY 4.0
- Atribuição obrigatória visível sem hover
- Rig: Mixamo (66 joints, incluindo `mixamorig:Head_06` e `mixamorig:Neck_05`)
- Inspeção: `pnpm inspect:glb`

## 9. Memória Persistente

- `PROGRESS.md` — checklist de execução do plano
- `docs/STATE.md` — estado atual (a criar)
- `docs/memory/decisions.md` — ADRs (a criar)

## 10. ACI Rules

### Paths

- Sempre usar paths absolutos ou relativos ao root do projeto.

### Ações Destrutivas (confirmar com usuário)

- `rm -rf` em qualquer diretório
- `git push --force` ou `git reset --hard`
- Alterações em `opencode.json` ou configs de agente

### Ações Seguras (proceder autonomamente)

- Criar novos arquivos
- Editar arquivos existentes (exceto configs de agente)
- Rodar `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm typecheck`
- Criar branches locais

## 11. Isolamento de Ambiente para Testes (obrigatório)

O Playwright local reusa **qualquer** server que responda na porta **5173**
(`reuseExistingServer: !CI`), e `pnpm evidence:visual` fotografa o que estiver
servido lá — de **qualquer checkout**. Um dev server de outro worktree contamina
a suíte silenciosamente. Regras:

1. **Worktree própria por tarefa**, criada de `origin/main`, com `pnpm install`
   dentro dela; todos os comandos rodam a partir da worktree.
2. **Porta por worktree:** vite, Playwright e evidências honram `PORT`
   (default 5173 = checkout principal). Em worktree, fixe uma porta livre e
   use em todos os comandos — `PORT=5200 pnpm test:smoke` sobe o vite na 5200
   e testa nela.
3. **Pre-flight antes de Playwright/evidências** (barato e obrigatório):

   ```bash
   lsof -nP -iTCP:${PORT:-5173} -sTCP:LISTEN  # a porta alvo está ocupada?
   lsof -p <PID> | grep cwd                   # de qual checkout o server serve?
   ```

   - Porta livre → pode rodar.
   - Server do **seu** checkout → ok.
   - Server de **outro** checkout → não rode: mate se for processo órfão de
     agent; coordene se for sessão do usuário.

4. **Exclusão mútua:** só uma suíte Playwright/evidência por vez na máquina.
   Vitest unit, typecheck, lint e build são seguros em paralelo.
5. **Capacidade — cheque antes de abrir novos runs** (cada worker sobe um
   Chromium com WebGL por software; duas suítes travam a máquina):

   ```bash
   pgrep -fl "playwright" | head -10   # já há suíte rodando?
   uptime                              # load vs núcleos
   ```

   Já há suíte rodando? **Aguarde a liberação**: poll de 30s com teto de
   15 min; se continuar ocupada após o teto, reporte ao usuário — não empilhe
   processos. Nunca aumente `--workers`.

6. **Sintomas de contaminação** (`element(s) not found` para seletores que você
   adicionou; snapshot mostrando features de outra branch) → checar a porta
   **antes** de debugar código. Timeouts aleatórios em cascata → checar se há
   **outra suíte** comendo a máquina.
7. **Limpeza:** mate servers e browsers que você subiu (confirmando os PIDs) e
   remova worktrees de rascunho.

Runbook completo com tabelas de comandos e decisão: `docs/agents/test-isolation.md`.
