# AGENTS.md — spiderman-landing

## 1. Identidade do Projeto

- **Nome:** spiderman-landing
- **Tipo:** Landing page 3D cinematográfica de portfólio — Spider-Man: Brand New Day
- **Objetivo:** demonstrar direção de arte, engenharia WebGL e craft de frontend
- **Regra de ouro:** o MVP é "ter presença visual de portfólio", não "funcionar"

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Framework | Vite 8 + React 19 + TypeScript 5.9 |
| Estilo | Tailwind CSS v4 |
| 3D | Three.js + @react-three/fiber v9 + @react-three/drei v10 |
| Post-processing | @react-three/postprocessing |
| Animação | GSAP ScrollTrigger |
| Testes | Vitest (unit) + Playwright (visual) |
| Package manager | **pnpm 9** — nunca npm/yarn |
| Runtime | Node.js >= 22 |

## 3. Design Tokens

Definidos em `src/index.css` via `@theme` (Tailwind v4):

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#0a0a0c` | fundo principal |
| `concrete` | `#141417` | superfícies secundárias |
| `steel` | `#2c3b4c` | detalhes frios |
| `oxide` | `#7a1f24` | acento quente (rim light) |
| `signal` | `#c23b34` | acento máximo |
| `paper` | `#e9e5da` | texto principal |
| `dim` | `#6b6a63` | texto secundário |

Fontes: **Space Grotesk** (display), **JetBrains Mono** (HUD/labels).

## 4. Documentos sob Demanda

Carregar apenas quando a tarefa exigir:

| Documento | Conteúdo |
|---|---|
| `docs/design/design-bible.md` | direção visual vinculante |
| `docs/design/storyboard.md` | seções como planos de câmera + copy |
| `docs/design/mobile-first.md` | keyframes por breakpoint |
| `docs/design/composition-rules.md` | zonas seguras de texto |
| `docs/design/quality-matrix.md` | perfis de qualidade por dispositivo |
| `docs/design/visual-rubric.md` | rubrica de avaliação estética |
| `docs/design/performance-design.md` | FPS alvo, budgets, degradação |
| `harness-bootstrap-plan.md` | plano completo de bootstrap |

**Regra:** NUNCA carregar todos preemptivamente.

## 5. Workflow

1. Ler `PROGRESS.md` para estado atual.
2. Consultar Scene Spec relevante antes de implementar.
3. Criar branch: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`.
4. Implementar seguindo Design Bible e composition rules.
5. Rodar `bash scripts/verify-all.sh` antes de push.
6. Commit com Conventional Commits.
7. **PR Obrigatório com Evidências:** Todo PR DEVE obrigatoriamente incluir no seu corpo/descrição o log de saída real do `pnpm verify` (lint, typecheck, unit test, build e test:visual), a tabela de rubrica visual preenchida com nota >= 4 e a relação de evidências (screenshots dos viewports 390px, 430px e 1440px).

## 6. Comandos

```bash
pnpm dev              # Dev server
pnpm build            # TypeScript + Vite build
pnpm typecheck        # Type check only
pnpm lint             # ESLint
pnpm test             # Vitest unit tests
pnpm test:visual      # Playwright visual tests
pnpm verify           # All gates (lint + typecheck + test + build)
pnpm inspect:glb      # Inspect GLB asset metadata
```

## 7. Qualidade Visual & Regra de PRs

- Design é a feature principal — implementação funcional sem impacto visual não está pronta.
- Verify revisa composição, hierarquia visual e impressão de portfólio.
- Rubrica visual com nota mínima 4 para bloqueantes (ver `docs/design/visual-rubric.md`).
- Playwright screenshots em 390x844, 430x932 e 1440x900.
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
