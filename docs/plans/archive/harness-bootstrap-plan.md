# Plano de Bootstrap — Harness de Engenharia com IA

### Projeto: `spiderman-landing`

Objetivo: replicar aqui o mesmo padrão de harness de 5 agentes (explore,
plan, implement, verify, security-audit) + fluxo doc-driven (PRD/HLD/FDD +
ADRs) já validado no **FinTrack** e no **our-journey**, adaptado ao escopo
real deste projeto — que é majoritariamente frontend/WebGL, sem backend,
sem banco de dados.

Este documento é o prompt de bootstrap para rodar dentro do OpenCode, no
mesmo diretório do projeto. As lacunas marcadas com `<<< >>>` são de
propósito — o agente `explore` deve descobrir essas estruturas lendo os
projetos de referência de verdade, não a partir do que eu tenho anotado de
memória sobre eles (que é só um resumo de alto nível, não a estrutura de
arquivos literal).

**Escopo deste documento:** isto é só o plano e os prompts. Quem constrói
a app é o harness rodando dentro do OpenCode — este arquivo não contém
código, só instruções para os agentes `plan` e `implement` executarem.

---

## Fase 0 — Revisão crítica do plano antes de iniciar

Antes de rodar a descoberta nos projetos de referência ou criar qualquer
arquivo de harness/app, o agente `plan` deve revisar este próprio plano como
objeto de trabalho. Esta fase existe para evitar execução automática de um
plano incompleto, stack mal escolhido ou premissas visuais/técnicas ainda
fracas.

Objetivos desta fase:

- Fazer uma revisão detalhada do plano inteiro, procurando lacunas,
  contradições, dependências implícitas, riscos de execução e pontos em que
  o plano está prescrevendo solução cedo demais.
- Validar se a escolha tecnológica proposta está aderente ao objetivo:
  Vite + React 19 + TypeScript + Tailwind v4, Three.js/R3F v9/Drei,
  post-processing e GSAP ScrollTrigger para uma landing 3D cinematográfica
  sem backend.
- Comparar alternativas quando fizer sentido (ex: Framer Motion vs. GSAP,
  CSS puro vs. Tailwind, Vite vs. Next.js, animação declarativa vs. rig de
  câmera compartilhado), deixando claro o trade-off e a recomendação.
- Conduzir uma entrevista de brainstorming com o usuário antes de congelar o
  plano: intenção criativa, referências visuais, nível de fidelidade ao
  filme/personagem, tolerância a peso/performance, escopo mobile, tom da
  copy, CTA real e limites legais/licenciamento.
- Produzir uma lista de ajustes recomendados no plano, separando o que é
  bloqueante para começar do que pode virar decisão posterior/ADR.

Prompt pronto para o agente `plan`:

```
[plan] Antes de iniciar a execução, revise criticamente este documento de
bootstrap inteiro.

Entregue:
1. Diagnóstico do plano atual: o que está claro, o que está ambíguo, o que
   falta e quais premissas precisam ser confirmadas.
2. Revisão da arquitetura e do stack: confirme se Vite + React 19 +
   TypeScript + Tailwind v4 + Three.js/R3F v9/Drei + GSAP ScrollTrigger é a
   escolha mais aderente para uma landing page 3D cinematográfica, sem
   backend. Quando houver alternativa relevante, compare brevemente e
   recomende uma opção.
3. Mapa de riscos: performance, responsividade, acessibilidade,
   prefers-reduced-motion, licenciamento do asset 3D, custo de manutenção e
   complexidade do rig de câmera.
4. Entrevista de brainstorming para o usuário responder antes da execução.
   Faça perguntas abertas e objetivas sobre direção visual, referências,
   copy, CTA, experiência mobile, limites de performance e nível de
   fidelidade desejado.
5. Proposta de ajustes no plano: classifique cada ajuste como
   "bloqueante antes de começar", "recomendado antes de implementar" ou
   "pode virar ADR depois".

Não crie arquivos de código, não rode scaffold e não execute prompts de
implementação nesta fase. O resultado esperado é uma revisão acionável do
plano e uma entrevista para destravar decisões antes da Fase 1.
```

Critério de saída da Fase 0:

- O usuário respondeu à entrevista de brainstorming.
- O stack foi confirmado ou ajustado conscientemente.
- O plano foi atualizado com os ajustes bloqueantes.
- Decisões que não precisam bloquear o início foram registradas como
  candidatas a ADR.

Decisões já tomadas nesta revisão:

- Runtime alvo: Node.js 22.
- Stack base: React 19 + Vite + TypeScript + Tailwind v4 +
  Three.js/@react-three/fiber v9/Drei + GSAP ScrollTrigger.
- Mobile é prioridade de produto, não apenas adaptação responsiva. A maioria
  dos acessos esperados será por celular, então câmera, composição, peso do
  asset, tipografia, espaçamento e verificações precisam nascer mobile-first.
- A experiência é um projeto de portfólio. O ponto alto deve ser o design:
  direção visual, composição cinematográfica, movimento de câmera, iluminação,
  ritmo do scroll e acabamento visual devem ser tratados como decisões
  centrais, não como polimento final.
- Não é necessário CTA real para trailer nesta etapa.
- O modelo 3D deve receber crédito com o link informado pelo usuário:
  https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda

Plano de ataque para fechar a Fase 0:

- Atualizar este documento com as decisões bloqueantes acima.
- Criar um bloco forte de definição de design antes dos prompts de
  implementação, cobrindo referências, grid, ritmo narrativo, contraste,
  composição mobile/desktop e estados de movimento reduzido.
- Promover três decisões para ADR assim que a estrutura documental real for
  confirmada na Fase 1: stack frontend/WebGL, estratégia mobile-first para
  câmera/performance, e política de crédito/licenciamento do asset 3D.
- Tratar ajustes finos de copy, valores exatos de câmera e intensidade dos
  efeitos como decisões de Scene Spec, não como suposições globais.

---

## Fase 1 — Descoberta (agente `explore`)

Caminhos dos projetos de referência:

- FinTrack: `/Users/clayton/Documents/develop/fintrack`
- our-journey: `/Users/clayton/Documents/develop/our-journey`

Prompt pronto para o agente `explore`:

```
Explore os dois diretórios de projeto abaixo e documente a estrutura de
harness de IA literalmente, lendo os arquivos-fonte — não resuma de
memória nem assuma convenções de outros projetos que você conheça.

1. /Users/clayton/Documents/develop/fintrack
2. /Users/clayton/Documents/develop/our-journey

Para cada projeto, extraia e reporte:
- Estrutura de pastas ligada ao harness (ex: agents/, .opencode/,
  docs/adr/, prompts/, skills/)
- Conteúdo e formato de cada arquivo de agente (explore, plan, implement,
  verify, security-audit) — nome do arquivo, formato (system prompt puro,
  frontmatter + prompt, etc.) e o que cada um recebe/produz
- Onde ficam e como são nomeados PRD, HLD, FDD e ADRs
- Regras de workflow git tal como estão escritas nos arquivos-fonte
  (branch por feature, quando rodar guardrails, quando abrir PR, o que
  fazer com arquivos de plano depois de concluídos)
- Scripts ou hooks de automação amarrados ao harness (package.json,
  husky, CI, Makefile)

Ao final, produza uma tabela comparando os dois projetos: o que é IDÊNTICO
nos dois (isso é o padrão real a extrair) vs. o que é específico de cada
um (isso não deve ser copiado para um projeto novo sem adaptação).
```

## Relatório de Descoberta — Fase 1 Completa

### Estrutura de Harness de IA — Comparativo

| Tema                        | FinTrack                                                                                                                                                                                                                                                                              | our-journey                                                                                                                                                         | Padrão para spiderman-landing                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Gerenciador de pacotes**  | pnpm workspaces                                                                                                                                                                                                                                                                       | pnpm 9 obrigatório                                                                                                                                                  | usar pnpm; não usar npm/yarn                                                                                                                     |
| **Runtime**                 | Node >= 22                                                                                                                                                                                                                                                                            | CI usa Node 20, mas app moderno React 19/Next 16                                                                                                                    | Node 22                                                                                                                                          |
| **Configuração de agentes** | `.opencode/agent/*.md` com frontmatter YAML                                                                                                                                                                                                                                           | `opencode.json` inline + plugins Superpowers/ECC                                                                                                                    | usar `.opencode/agent/*.md` com frontmatter (padrão FinTrack)                                                                                    |
| **Agentes base**            | orchestrator, explore, planner, implement-backend, implement-frontend, implement-general, test-writer, verify, security-audit, git, architecture-analyst, docs, scout                                                                                                                 | orchestrator, explore, plan, implement, verify, security-audit, test-writer                                                                                         | manter 5 agentes base (explore, plan, implement, verify, security-audit) + git/docs/test-writer; orquestrador delegation-only                    |
| **Documentos permanentes**  | `docs/product/`, `docs/architecture/`, `docs/design/`, `docs/engineering/`                                                                                                                                                                                                            | `docs/ARCHITECTURE.md`, `docs/BACKLOG.md`, `docs/CHANGELOG.md`, `docs/ENGINEERING.md`, `docs/ROADMAP.md`, `docs/superpowers/`                                       | usar `docs/*` para decisões permanentes e `specs/000N-*` para unidades implementáveis                                                            |
| **PRD**                     | `docs/product/prd.md`                                                                                                                                                                                                                                                                 | não encontrado (projeto menor)                                                                                                                                      | criar `docs/prd.md`                                                                                                                              |
| **HLD**                     | `docs/architecture/hld.md`                                                                                                                                                                                                                                                            | `docs/ARCHITECTURE.md`                                                                                                                                              | criar `docs/hld.md`                                                                                                                              |
| **FDD/Specs**               | `specs/000N-*/spec.md` + `tasks.md`                                                                                                                                                                                                                                                   | `docs/superpowers/specs/` + `docs/superpowers/plans/`                                                                                                               | usar `specs/000N-*/spec.md` (padrão FinTrack) — para este projeto, "Scene Spec"                                                                  |
| **ADRs**                    | `docs/architecture/adr/000N-*.md`                                                                                                                                                                                                                                                     | `docs/superpowers/memory/decisions.md`                                                                                                                              | usar `docs/architecture/adr/` + memória resumida em `docs/STATE.md`                                                                              |
| **Memória persistente**     | `docs/STATE.md`, `docs/engineering/memory/decisions.md`, `docs/engineering/memory/patterns.md`, `docs/engineering/memory/known-issues.md`                                                                                                                                             | `docs/superpowers/memory/architecture.md`, `docs/superpowers/memory/decisions.md`, `docs/superpowers/memory/patterns.md`, `docs/superpowers/memory/known-issues.md` | criar `docs/STATE.md` + `docs/memory/decisions.md`                                                                                               |
| **Scripts de validação**    | `scripts/validate-*.mjs` (domain, build, coverage, spec, storybook), `scripts/audit-docs.mjs`, `scripts/eval-spec-fidelity.mjs`                                                                                                                                                       | `scripts/generate-memories.ts`, `scripts/organize-photos.ts`                                                                                                        | criar scripts shell obrigatórios: `setup.sh`, `verify-all.sh`, `collect-visual-evidence.sh` + scripts de inspeção                                |
| **CI**                      | `.github/workflows/ci.yml` + `docs-gate.yml` — lint, test, build, validate-domain, validate-coverage, validate-storybook, docs-audit                                                                                                                                                  | `.github/workflows/ci.yml` — format, lint, test:coverage, build, test:e2e, upload artifacts                                                                         | format, lint, typecheck, unit, coverage, build, visual tests, docs/spec audit                                                                    |
| **Workflow git**            | Branch por feature (`feat/*`, `fix/*`, `chore/*`), Conventional Commits, PR com checklist, CI verde obrigatório                                                                                                                                                                       | Branch por feature (`feat/*`, `fix/*`, `chore/*`, `docs/*`), Conventional Commits, commitlint enforced, PR com CI verde                                             | branch obrigatória (`feat/*`, `fix/*`, `docs/*`, `chore/*`), Conventional Commits, PR com evidência real                                         |
| **Hooks**                   | `.husky/` + `.lintstagedrc` + `commitlint.config.js`                                                                                                                                                                                                                                  | `.husky/` + `.lintstagedrc` + `commitlint.config.js`                                                                                                                | usar husky + lint-staged + commitlint                                                                                                            |
| **Formato de agente**       | Markdown com frontmatter YAML (description, mode, model, temperature) + prompt                                                                                                                                                                                                        | Configuração inline em `opencode.json`                                                                                                                              | usar formato FinTrack: `.opencode/agent/*.md` com frontmatter                                                                                    |
| **Permissões**              | Definidas em `opencode.json` por agente (edit, bash, task)                                                                                                                                                                                                                            | Definidas em `opencode.json` por agente                                                                                                                             | definir permissões restritivas por agente em `opencode.json`                                                                                     |
| **Modelos**                 | orchestrator: deepseek-v4-pro, explore: deepseek-v4-flash, planner: glm-5.2, implement-*: qwen3.7-plus, test-writer: mimo-v2.5, verify: deepseek-v4-flash, security-audit: deepseek-v4-pro, git: deepseek-v4-flash, docs: deepseek-v4-flash, scout: openrouter/cohere/north-mini-code | orchestrator: qwen3.7-plus, explore: deepseek-v4-flash, plan: glm-5, implement: qwen3.7-plus, verify: glm-5, security-audit: glm-5, test-writer: deepseek-v4-flash  | usar modelos recomendados no plano (Fase 4.1)                                                                                                    |
| **Template de PR**          | `docs/templates/pr.md`                                                                                                                                                                                                                                                                | não encontrado                                                                                                                                                      | criar `docs/templates/pr.md`                                                                                                                     |
| **Design**                  | `docs/design/direction.md`, `docs/design/tokens.md`, `docs/design/component-library-plan.md`, Storybook                                                                                                                                                                               | `docs/superpowers/memory/patterns.md` (design system)                                                                                                               | design é feature principal; criar `docs/design/` com Design Bible, storyboard, quality matrix, visual rubric, composition rules, look-dev-report |
| **Testes visuais**          | Storybook visual/a11y gate                                                                                                                                                                                                                                                            | Playwright E2E                                                                                                                                                      | Playwright para validação visual + screenshots mobile/desktop                                                                                    |

### Padrões IDÊNTICOS (devem ser replicados)

1. **pnpm como contrato** — ambos usam pnpm, nunca npm/yarn
2. **Branch por feature obrigatória** — `feat/*`, `fix/*`, `chore/*`, `docs/*`
3. **Conventional Commits** — mensagens em inglês, commitlint enforced
4. **PR com CI verde** — Definition of Done é PR aberto com pipeline passando
5. **Documentos de planejamento efêmeros** — specs/tasks.md não são commitados como artefato isolado; decisões viram ADR
6. **Memória persistente** — `STATE.md` + `memory/decisions.md` + `memory/patterns.md`
7. **Orquestrador delegation-only** — não implementa, não testa, não roda comandos pesados
8. **Agentes especializados** — explore, plan, implement, verify, security-audit como base
9. **Permissões restritivas** — agentes têm permissões explícitas (edit, bash, task)
10. **Scripts de validação determinísticos** — retornam exit code 0/1, output objetivo
11. **CI com artifacts** — upload de coverage, playwright report, test-results
12. **Husky + lint-staged + commitlint** — hooks pré-commit e commit-msg
13. **Contexto sob demanda** — não carregar todos os docs preemptivamente

### Específicos de cada projeto (NÃO copiar sem adaptação)

**FinTrack:**

- Clean Architecture com Domain/Application/Infrastructure/Presentation
- NestJS + Next.js + Prisma + PostgreSQL + Redis + BullMQ
- Monorepo Turborepo com `apps/web`, `apps/api`, `packages/*`
- Storybook para componentes UI
- Scripts `validate-*.mjs` para validação arquitetural
- Docker Compose para infra local
- Foco em backend e regras de negócio

**our-journey:**

- Next.js standalone (não monorepo)
- Mapbox + Cloudinary + Spotify API
- Foco em experiência visual/emocional
- Playwright E2E para testes visuais
- Superpowers + ECC plugins
- `docs/superpowers/` para memória e specs
- Foco em frontend e design

### Recomendações para spiderman-landing

1. **Estrutura de agentes**: seguir padrão FinTrack (`.opencode/agent/*.md` com frontmatter)
2. **Documentos**: criar `docs/prd.md`, `docs/hld.md`, `docs/architecture/adr/`, `docs/design/`, `docs/STATE.md`
3. **Specs**: usar `specs/000N-*/spec.md` — para este projeto, chamar de "Scene Spec" em `docs/scene-specs/`
4. **Scripts**: criar scripts shell obrigatórios (`setup.sh`, `verify-all.sh`, `collect-visual-evidence.sh`) + scripts de inspeção (`inspect-glb.mjs`, `check-performance.mjs`)
5. **CI**: adaptar padrão our-journey (format, lint, typecheck, test, build, visual tests) + upload de artifacts
6. **Testes visuais**: Playwright com screenshots em 3 viewports (390x844, 430x932, 1440x900)
7. **Design**: tratar como feature principal — criar Design Bible, storyboard, quality matrix, visual rubric, composition rules
8. **Modelos**: usar recomendação da Fase 4.1 do plano
9. **Workflow**: branch obrigatória, Conventional Commits, PR com evidência real (screenshots, FPS, rubrica visual)
10. **Memória**: `docs/STATE.md` + `docs/memory/decisions.md` para ADRs e decisões

Decisões incorporadas a partir das referências:

- `pnpm` vira contrato do projeto.
- `format:check` e `test:coverage` entram nos gates.
- PR deve copiar output real dos gates; checklist vazio ou não verificado
  bloqueia abertura do PR.
- CI deve preservar artifacts de coverage, Playwright report e test-results.
- O orquestrador não deve implementar, testar nem rodar comandos pesados; ele
  deve delegar para agentes especializados.
- Contexto deve ser carregado sob demanda; modelos menores não devem ler toda
  a árvore de docs antes de cada tarefa.

---

## Fase 2 — Regras que já sabemos que valem aqui (não re-descobrir)

Testadas em produção no our-journey, tratar como não-negociáveis a menos
que o relatório da Fase 1 mostre o contrário:

- Toda feature nasce em branch nova — regra automática, sem exceção.
- Nome de branch obrigatório:
  - `feat/<slug-curto>` para nova funcionalidade ou seção visual
  - `fix/<slug-curto>` para correção
  - `docs/<slug-curto>` para documentação/planos/ADRs
  - `chore/<slug-curto>` para automação, configuração ou manutenção
- Commits devem seguir Conventional Commits:
  - `feat: add cinematic loader`
  - `feat: implement mobile camera rig`
  - `fix: prevent hero text overlap on mobile`
  - `docs: add design bible`
  - `test: add visual viewport checks`
- Guardrails (lint, typecheck, build, suíte de testes) rodam **uma vez
  antes do push**, não a cada commit.
- Se qualquer guardrail falhar, parar a sequência, corrigir o problema,
  rodar novamente o guardrail que falhou e só então seguir.
- Todo plano termina obrigatoriamente com PR aberto + confirmação de que
  o pipeline passou.
- Arquivos de plano são efêmeros — não são commitados como artefato
  isolado; decisões viram ADR ou design doc.
- PR deve conter resumo, screenshots ou links para screenshots quando houver
  mudança visual, comandos de validação executados e notas de performance.

---

## Fase 3 — O que muda de escopo neste projeto

Diferenças reais entre uma SaaS com backend (FinTrack) / um app full-stack
(our-journey) e uma landing page de portfólio majoritariamente 3D:

| Aspecto                               | FinTrack / our-journey                     | spiderman-landing                                                                                                                                 |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| FDD (Feature Design Doc)              | por feature de produto                     | provavelmente vira um **Scene Spec** por seção de scroll (Hero, Evolution, Arsenal, FullBody) — câmera, iluminação, copy, animação                |
| security-audit                        | segredos de API/DB, auth                   | licenciamento do asset 3D (CC-BY, atribuição obrigatória), chaves de terceiros (analytics/CDN se houver), nada de segredo de banco                |
| Clean Architecture / Ports & Adapters | núcleo do FinTrack                         | não se aplica — é componentização React + lógica de câmera/scroll                                                                                 |
| verify                                | testes de integração/E2E de fluxo de dados | verificação visual (screenshots por seção em mobile e desktop), performance de frame rate, checagem de que o head-tracking/scroll-rig não quebrou |
| design                                | suporte ao fluxo de produto                | fase central do projeto: direção visual, composição, ritmo, câmera, luz, contraste e acabamento cinematográfico                                   |
| mobile                                | responsividade de app                      | prioridade de experiência; deve ter câmera, enquadramento, densidade textual e orçamento de performance próprios                                  |

A Fase 1 deve confirmar se isso é modelado como um "tipo de FDD alternativo"
nos projetos de referência ou se é melhor um documento novo — não inventar
isso antes de ver como eles resolvem variação de escopo entre projetos.

---

## Fase 3.1 — Definição forte de design e experiência mobile

Antes dos Scene Specs e antes de qualquer scaffold, o agente `plan` deve
produzir uma definição de design específica para este projeto de portfólio.
Esta definição é bloqueante porque o design é o ponto alto da experiência e
porque mobile precisa orientar a composição desde o começo.

Esta fase deve ser escrita de forma extremamente explícita, assumindo que um
modelo menos poderoso pode executar o plano depois. Evitar instruções vagas
como "deixar bonito", "caprichar no visual" ou "fazer cinematográfico" sem
traduzir isso em decisões verificáveis de layout, câmera, luz, movimento,
tipografia e performance.

### 3.1.0 — Referências visuais pesquisadas e avaliadas

Não pedir referências visuais ao usuário como bloqueio. O agente `plan` deve
partir das referências online abaixo, já avaliadas, e só perguntar ao usuário
quando houver conflito de direção ou dúvida estética realmente bloqueante.

Fontes e aprendizados:

| Fonte                                                         | O que absorver                                                                                                                                                              | O que evitar                                                                                |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Sony Pictures — página oficial de `Spider-Man: Brand New Day` | Tema narrativo: Peter atua sozinho em um mundo que não lembra dele; pressão, transformação e ameaça invisível devem aparecer como solidão, vigilância e tensão visual.      | Copiar página promocional tradicional com CTA comercial, cards e layout institucional.      |
| Sony Pictures Japan — release/trailer oficial                 | A ideia "ninguém conhece Peter" e a transformação física depois de quatro anos devem orientar copy, close-ups e progressão de câmera.                                       | Recontar sinopse longa na landing; usar texto expositivo demais.                            |
| ILM — página do projeto/VFX                                   | Tratar a página como experiência de imagem e VFX, não como landing informativa; personagem, luz e movimento vêm antes de blocos de UI.                                      | Deixar o 3D parecer apenas asset carregado em fundo escuro.                                 |
| Digital Camera World / entrevista de cinematografia           | Direção visual: vermelho e azul saturados protegidos por pretos profundos, sombra como massa gráfica, curva de filme clássica/contemporânea, lentes com caráter mas limpas. | Neon vermelho genérico, cena lavada, excesso de bloom, roxo/azul dominante sem intenção.    |
| Framemode LLC / Three.js Resources                            | Inspiração estrutural: portfolio scroll-driven com cena Three.js real-time, iluminação dinâmica e narrativa espacial.                                                       | Copiar tema espacial/lunar; o aprendizado é o método, não o assunto.                        |
| Maurice Däppen ThreeJS Portfolio                              | Inspiração técnica: React 19 + R3F + GSAP, câmera cinematográfica, ACES filmic tone mapping, cena componentizada e caminhos de câmera definidos.                            | Usar OrbitControls livre como experiência principal; aqui a câmera deve ser dirigida.       |
| Praxxys Three.js/R3F portfolio performance                    | Inspiração de performance: experiência 3D precisa carregar e rodar bem em mobile; reduzir dependências e peso antes de sacrificar a experiência.                            | Aceitar GLB de 50 MB sem plano de otimização/mobile.                                        |
| Marco Ayuste portfolio case study                             | Inspiração de ambição: o portfolio em si deve provar capacidade de design/engenharia; R3F fixo atrás de HTML com scroll cinematográfico é padrão adequado.                  | Virar currículo animado ou lista de skills; o projeto é a peça principal.                   |
| landing.love / Three.js collection                            | Usar como varredura secundária de repertório para padrões de 3D websites e portfolios.                                                                                      | Copiar tendências superficiais como glassmorphism, excesso de chrome visual ou UI genérica. |

Direção sintetizada a partir da pesquisa:

- O visual deve combinar **preto profundo + vermelho/azul preservados + luz
  recortando material**.
- A sensação principal é **isolamento heroico**, não espetáculo colorido.
- O scroll deve parecer **montagem cinematográfica controlada**, não galeria
  de componentes.
- O mobile precisa ter **composição própria**, pois o impacto de portfólio
  provavelmente será julgado primeiro no celular.
- O acabamento deve parecer **filmic/editorial**, evitando visual de demo
  Three.js ou landing comercial.

Links de referência:

- https://www.sonypictures.com/movies/spidermanbrandnewday
- https://www.sonypictures.jp/corp/press/2026-03-18-0
- https://www.ilm.com/vfx/spider-man-brand-new-day/
- https://www.digitalcameraworld.com/cameras/cinema-cameras/neither-of-us-could-quite-put-our-finger-on-it-but-we-both-agreed-there-was-something-special-spider-man-brand-new-day-cinematographer-talks-shooting-with-a-large-format-camera-prototype-lenses-and-comic-book-inspired-luts
- https://threejsresources.com/showcase/framemode-llc
- https://daeppen.dev/work/portfolio_x1
- https://discourse.threejs.org/t/only-4-1mb-small-lightweight-highly-performant-three-js-r3f-drei-portfolio-website/56747
- https://marcoayuste.com/projects/personal-site
- https://www.landing.love/collection/threejs/

Critério de saída:

- A Design Bible deve citar quais aprendizados destas referências foram
  adotados.
- Qualquer escolha visual nova deve respeitar a síntese acima ou justificar
  conscientemente o desvio.
- Se uma referência conflitar com mobile/performance, mobile/performance
  vencem.

### 3.1.1 — Design Bible curta

Criar um documento de direção visual antes dos Scene Specs. Ele deve ser
curto, mas concreto o suficiente para impedir uma implementação genérica.

Conteúdo obrigatório:

- Frase de intenção: definir em uma frase como a experiência deve ser
  percebida nos primeiros 5 segundos. Exemplo de tom esperado: "uma cena
  interativa de portfólio, sombria e cinematográfica, centrada em isolamento,
  tensão e presença física do personagem".
- Atmosfera: noite urbana, contraste alto, sensação de solidão, ameaça
  silenciosa, materialidade do traje e luz recortando a silhueta.
- Regras de cor: usar `ink` e `concrete` como base escura; `signal` e
  `oxide` como acento dramático; evitar vermelho neon genérico, azul roxo
  dominante, gradientes decorativos e visual de template SaaS.
- Regras de textura: pode haver grão sutil, vinheta e pequenos ruídos
  cinematográficos; não usar bokeh/orbs decorativos, blur pesado ou fundo
  abstrato que pareça stock.
- Regras de composição: o personagem precisa ser o primeiro sinal visual,
  não um elemento secundário; texto nunca deve cobrir rosto, símbolo do peito
  ou lançador de teia em momentos-chave.
- Lista do que evitar: landing page explicativa, hero de marketing,
  excesso de cards, layout dividido texto/imagem, copy longa demais,
  animações que parecem demo técnica em vez de direção de arte.

Critério de saída:

- Qualquer implementador consegue ler a Design Bible e saber o que deve ser
  preservado visualmente mesmo sem contexto da conversa original.
- Existem regras negativas claras, para evitar escolhas genéricas.
- A primeira dobra tem uma promessa visual objetiva: rosto/máscara,
  silhueta ou presença do corpo devem dominar a percepção.

### 3.1.2 — Storyboard por seção

Antes dos componentes, definir as seções como planos de câmera. Cada seção
deve ter uma intenção emocional, um enquadramento mobile, um enquadramento
desktop e um risco visual.

Formato obrigatório:

| Seção     | Emoção                            | Enquadramento mobile                                                 | Enquadramento desktop                                      | Movimento                                  | Texto                    | Risco                                         |
| --------- | --------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ | ------------------------ | --------------------------------------------- |
| Hero      | impacto, anonimato, solidão       | máscara/torso dominam, copy em área segura inferior ou lateral curta | personagem com mais respiro lateral e presença de silhueta | micro head-tracking + leve drift de câmera | curto, alto contraste    | texto cobrir rosto ou parecer pôster estático |
| Evolution | tensão, transformação interna     | close no peito/símbolo, texto em bloco compacto                      | close assimétrico com mais espaço negativo                 | push-in lento ou pequena mudança de eixo   | frase quebrada com ritmo | close perder legibilidade no mobile           |
| Arsenal   | sobrevivência, improviso          | pulso/lançador legível, texto sem competir com braço                 | órbita lateral mais ampla                                  | câmera atravessa para revelar detalhe      | direto, seco             | detalhe ficar pequeno demais                  |
| FullBody  | revelação, conclusão, pôster vivo | corpo inteiro se possível; se não couber, priorizar silhueta forte   | corpo inteiro com composição final memorável               | recuo e estabilização                      | punch final              | parecer tela de créditos sem impacto          |

Critério de saída:

- Cada seção precisa poder virar uma screenshot boa em mobile.
- Cada seção precisa ter um motivo visual diferente, não quatro variações do
  mesmo enquadramento.
- O texto deve ser tratado como parte da composição, não como camada jogada
  sobre o Canvas.

### 3.1.3 — Mobile-first real

Mobile é o viewport principal deste projeto. Não adaptar desktop para mobile.
Desenhar mobile primeiro e expandir para desktop.

Regras obrigatórias:

- Definir keyframes mobile antes dos keyframes desktop finais.
- Usar pelo menos estes viewports de validação: `390x844` como mobile base,
  `430x932` como mobile alto, e `1440x900` como desktop.
- Em mobile, aceitar que nem sempre corpo inteiro e texto completo cabem no
  mesmo momento. Priorizar composição, legibilidade e presença.
- Reservar áreas seguras para copy por seção. O texto não deve atravessar
  rosto, olhos, símbolo do peito, mãos ou pulso em momentos narrativos.
- Usar condicionais por breakpoint no camera rig. Não usar apenas CSS para
  resolver uma câmera que foi pensada para desktop.
- Em resize/orientation change, recalcular keyframe alvo e atualizar
  ScrollTrigger sem salto perceptível.

Critério de saída:

- Existem keyframes mobile e desktop separados para cada seção.
- O plano declara qual breakpoint troca de câmera.
- O verify captura screenshots mobile e desktop nos pontos-chave do scroll.

### 3.1.4 — Performance como decisão de design

Performance não é etapa técnica tardia. Em um projeto mobile-first com GLB
pesado, ela precisa orientar a estética.

Regras obrigatórias:

- Definir FPS alvo: mínimo aceitável de 45 FPS em mobile moderno; alvo ideal
  de 60 FPS em desktop; registrar FPS médio durante verify.
- Definir estratégia para o GLB de ~50 MB: inspecionar meshes, materiais,
  texturas, bones, animações e metadata antes de implementar a experiência
  final.
- Se o asset ficar pesado em mobile, reduzir nesta ordem:
  1. post-processing;
  2. resolução/qualidade de sombra;
  3. densidade de efeitos de parallax/HUD;
  4. qualidade/tamanho de textura;
  5. geometria, se houver ferramenta segura.
- Não sacrificar primeiro a composição principal. Uma versão mobile simples
  e bonita é melhor que uma versão "completa" engasgando.
- Definir fallback visual intencional para dispositivos fracos: cena mais
  estática, menos efeitos, iluminação preservada e texto bem composto.

Critério de saída:

- Existe uma matriz de qualidade por dispositivo.
- Existe uma ordem clara de degradação visual.
- O verify mede performance, não só impressão subjetiva.

### 3.1.5 — Matriz de qualidade por dispositivo

Definir três níveis de qualidade antes da implementação.

Formato obrigatório:

| Perfil       | Condição                                    | Modelo                                 | Luz                                   | Post-processing                            | Motion                                   | Meta                         |
| ------------ | ------------------------------------------- | -------------------------------------- | ------------------------------------- | ------------------------------------------ | ---------------------------------------- | ---------------------------- |
| Desktop High | telas largas e GPU estável                  | GLB otimizado ou original se performar | luz completa                          | Bloom + Vignette + grão discreto           | scroll rig completo + parallax           | impacto máximo               |
| Mobile Good  | celulares modernos                          | GLB otimizado                          | luz simplificada, silhueta preservada | Bloom reduzido ou seletivo + Vignette leve | camera rig completo, parallax contido    | experiência principal        |
| Mobile Low   | FPS baixo, aparelho fraco ou reduced-motion | GLB otimizado/fallback                 | luz mínima legível                    | sem Bloom/grão, Vignette opcional          | câmera mais estática, entradas reduzidas | manter design e legibilidade |

Critério de saída:

- A implementação sabe exatamente o que desligar em cada perfil.
- Mobile Low ainda parece uma escolha visual, não uma página quebrada.
- A matriz entra nos critérios de verify.

### 3.1.6 — Tipografia como parte do impacto

O projeto não deve depender só do 3D. A tipografia precisa comunicar gosto
visual e direção editorial.

Regras obrigatórias:

- `Space Grotesk` para títulos e copy principal; `JetBrains Mono` apenas para
  labels diegéticos/HUD e metadados narrativos.
- Títulos podem ser grandes, mas precisam caber no mobile sem quebrar de
  forma acidental. Quebras de linha importantes devem ser especificadas no
  Scene Spec.
- Evitar texto longo dentro do viewport. Cada seção deve ter uma ideia
  verbal forte e curta.
- Usar contraste e espaçamento com precisão: texto deve ser legível sem virar
  caixa/card sobre o 3D.
- Não usar cards para explicar o projeto. A interface deve parecer pôster
  vivo, não dashboard.
- Labels mono devem parecer instrumentos narrativos de vigilância/anonimato,
  não decoração tecnológica genérica.

Critério de saída:

- Cada seção tem escala tipográfica mobile e desktop definida.
- Cada título tem quebra de linha intencional.
- O verify confirma que não há texto estourando, sobrepondo ou competindo
  com o foco visual.

### 3.1.7 — Momentos memoráveis

Definir pelo menos três beats visuais que fariam alguém querer mostrar o
projeto em um portfólio.

Beats mínimos esperados:

- Hero: a máscara acompanha o mouse/ponteiro com movimento sutil e natural;
  em touch/mobile, substituir por drift automático leve ou reação ao scroll,
  sem depender de hover.
- Evolution: close no símbolo do peito com luz atravessando a superfície ou
  mudança perceptível de recorte/sombra, transmitindo transformação.
- Arsenal: revelação clara do lançador de teia/pulso, com a câmera cruzando
  o eixo do personagem.
- FullBody: composição final em corpo inteiro ou silhueta forte, parecendo
  um pôster vivo com texto integrado.

Critério de saída:

- Cada beat tem início, ápice e saída.
- O beat funciona em mobile sem exigir mouse.
- O efeito não deve existir só porque é tecnicamente possível; ele precisa
  reforçar a emoção da seção.

### 3.1.8 — Critério "portfolio-grade"

Antes de implementar, definir o padrão mínimo para considerar o projeto bom
o suficiente para portfólio.

Critérios obrigatórios:

- A primeira dobra deve impressionar sem o usuário precisar rolar.
- Cada seção deve gerar pelo menos uma screenshot forte em mobile e uma em
  desktop.
- Mobile deve parecer intencional, não uma versão comprimida do desktop.
- O usuário entende a experiência sem instruções visíveis de uso.
- O texto não pode competir com rosto, corpo ou detalhes narrativos.
- A página não deve parecer template de landing, dashboard, SaaS ou demo de
  biblioteca 3D.
- O design deve continuar forte com motion reduzida.
- A atribuição do asset deve ser visível e elegante, sem parecer rodapé
  esquecido.

Critério de saída:

- O verify usa estes itens como checklist visual.
- Se qualquer seção não produzir uma screenshot boa, ela volta para ajuste
  de Scene Spec antes de seguir.

### 3.1.9 — Design é a feature principal

Registrar explicitamente que o MVP deste projeto não é "a página funcionar".
O MVP é "a página ter presença visual de portfólio".

Regras obrigatórias:

- Implementação funcional sem impacto visual não deve ser considerada pronta.
- O agente `verify` deve revisar composição, hierarquia visual e impressão
  de portfólio, não apenas ausência de erro técnico.
- O agente `implement` deve evitar criar componentes genéricos antes de
  entender o enquadramento e o ritmo definidos nos Scene Specs.
- Sempre que houver conflito entre adicionar mais conteúdo e melhorar a
  composição, priorizar composição.
- Qualquer nova seção, efeito ou texto precisa justificar como aumenta o
  impacto visual ou narrativo.

Critério de saída:

- O plano e os Scene Specs declaram design como requisito de aceite.
- O fluxo de implementação permite voltar para design quando a tela não
  atingir o padrão visual.

### 3.1.10 — Rubrica visual com nota

Criar uma rubrica objetiva para reduzir subjetividade na aprovação estética.
Cada item recebe nota de `1` a `5`.

Escala:

- `1`: fraco, genérico, parece template ou demo técnica.
- `2`: funcional, mas sem presença visual.
- `3`: aceitável, porém ainda comum.
- `4`: forte, intencional, digno de portfólio.
- `5`: memorável, com identidade clara e execução refinada.

Itens avaliados:

| Critério                           | Peso | Nota mínima |
| ---------------------------------- | ---: | ----------: |
| Primeira dobra / impacto imediato  |    3 |           4 |
| Composição mobile                  |    3 |           4 |
| Integração texto + personagem      |    3 |           4 |
| Iluminação e silhueta              |    2 |           4 |
| Tipografia e hierarquia            |    2 |           4 |
| Ritmo de scroll e câmera           |    2 |           4 |
| Sensação cinematográfica/editorial |    2 |           4 |
| Originalidade de portfólio         |    2 |           4 |
| Performance percebida mobile       |    3 |           4 |
| Motion reduzida ainda bonita       |    1 |           3 |

Regra:

- Nenhuma implementação visual pode ir para PR se primeira dobra, composição
  mobile ou integração texto/personagem ficarem abaixo de `4`.
- Se a média ponderada ficar abaixo de `4`, voltar para Look Dev ou Scene
  Spec.
- Registrar a tabela de notas no relatório de verify ou PR.

### 3.1.11 — Rodadas obrigatórias de Look Dev

O Look Dev não é uma tentativa única. Para buscar resultado de portfólio,
prever até três rodadas curtas e focadas.

Rodadas:

1. **Look Dev v1 — câmera e luz**
   - Objetivo: personagem com presença forte na primeira dobra.
   - Validar: posição, fov, alvo, silhueta, key/rim/fill light.
   - Não gastar tempo refinando microcopy nesta rodada.
2. **Look Dev v2 — tipografia e composição**
   - Objetivo: texto e personagem parecerem uma única peça editorial.
   - Validar: escala, quebras de linha, áreas seguras, contraste e
     hierarquia.
3. **Look Dev v3 — polimento**
   - Objetivo: ajustar sensação cinematográfica.
   - Validar: bloom, vinheta, grão, transições, FPS e reduced-motion.

Regra:

- Se v1 atingir nota visual suficiente, v2 ainda é obrigatória.
- v3 é obrigatória se qualquer item crítico da rubrica ficar com nota `3`.
- Não expandir para todas as seções antes de v1 e v2 passarem.

### 3.1.12 — Regras explícitas de composição

Definir zonas de composição para evitar que modelos menores posicionem texto
e personagem por tentativa aleatória.

Regras mobile:

- Margem mínima horizontal de texto: `24px`.
- Bloco de texto principal: máximo de `82vw`.
- Hero: rosto/máscara ocupa a região superior ou central; copy deve ficar em
  área segura inferior ou lateral sem cobrir olhos.
- Evolution: símbolo do peito é o foco; texto deve ficar deslocado para uma
  área escura/negativa e não cruzar o símbolo.
- Arsenal: pulso/lançador é o foco; texto fica no lado oposto do detalhe.
- FullBody: se corpo inteiro não couber com texto, priorizar silhueta forte
  e título em blocos curtos.
- Evitar centralizar todos os textos. Alternar alinhamentos com intenção,
  seguindo o storyboard.

Regras desktop:

- Usar espaço negativo para aumentar drama, não preencher a tela com texto.
- Texto nunca deve cobrir rosto, olhos, símbolo do peito, mãos ou lançador.
- Personagem deve dominar a composição mesmo quando deslocado.
- Evitar layout split-screen óbvio. O Canvas é o palco, não uma coluna ao
  lado do texto.

Critério de saída:

- Cada Scene Spec define zona segura de texto em mobile e desktop.
- Cada screenshot do verify deve ser avaliado contra estas zonas.

### 3.1.13 — Tratamento do modelo 3D e materiais

Não aceitar o GLB "como veio" se os materiais ficarem lavados, planos ou sem
presença. O carregamento correto do asset não é suficiente.

Regras:

- Ajustar escala, rotação e posição do modelo para servir à composição.
- Avaliar materiais depois de aplicar tone mapping e luzes, não isoladamente.
- Se o traje perder força, ajustar exposição, roughness/metalness quando
  seguro, intensidade das luzes e color management antes de trocar paleta.
- Preservar vermelho/azul do traje, mas deixar sombras profundas o bastante
  para dar massa gráfica.
- Usar rim light quente para separar silhueta do fundo.
- Evitar bloom forte em toda a cena. Bloom deve destacar olhos/pontos claros,
  não lavar o traje.
- Se otimizar texturas/geometria, comparar screenshot antes/depois em mobile.
- Se mexer em materiais, documentar no Look Dev Report.

Critério de saída:

- O modelo tem silhueta legível em fundo escuro.
- O traje mantém cor e textura suficientes para close-ups.
- O visual não parece viewport padrão de model viewer.

### 3.1.14 — Check em dispositivo real

Playwright emula viewport, mas WebGL em celular real pode se comportar de
forma diferente. Antes da entrega final, fazer pelo menos um teste manual em
dispositivo real quando houver preview/local network disponível.

Checklist:

- Abrir em um celular real.
- Verificar tempo percebido de carregamento.
- Rolar do início ao fim sem travamentos graves.
- Conferir se toque/scroll não conflita com Canvas.
- Conferir se texto permanece legível sob brilho comum de tela.
- Conferir se o aparelho não aquece de forma perceptível em uso curto.
- Conferir se a atribuição final é acessível sem hover.

Regra:

- Se não houver dispositivo real disponível, registrar isso no PR como risco
  residual.
- Teste em dispositivo real não substitui Playwright; ele complementa a
  validação de performance percebida.

Prompt pronto para o agente `plan`:

```
[plan] Produza uma definição de design para a landing 3D antes de qualquer
implementação.

Trate mobile como viewport principal. Desktop deve ser uma expansão
cinematográfica da mesma ideia, não o contrário.

Entregue:
1. Síntese das referências pesquisadas, seguindo a seção 3.1.0.
2. Design Bible curta, seguindo a seção 3.1.1.
3. Storyboard por seção, seguindo a tabela da seção 3.1.2.
4. Sistema mobile-first, seguindo a seção 3.1.3.
5. Performance como decisão de design, seguindo a seção 3.1.4.
6. Matriz de qualidade por dispositivo, seguindo a seção 3.1.5.
7. Sistema tipográfico, seguindo a seção 3.1.6.
8. Momentos memoráveis, seguindo a seção 3.1.7.
9. Critério portfolio-grade, seguindo a seção 3.1.8.
10. Regras explícitas mostrando que design é a feature principal, seguindo
    a seção 3.1.9.
11. Rubrica visual com nota, seguindo a seção 3.1.10.
12. Plano de rodadas de Look Dev, seguindo a seção 3.1.11.
13. Regras explícitas de composição, seguindo a seção 3.1.12.
14. Tratamento esperado do modelo 3D/materiais, seguindo a seção 3.1.13.
15. Plano de check em dispositivo real, seguindo a seção 3.1.14.
16. Lista final de decisões que devem virar Scene Specs e ADRs.

Não implemente nada nesta fase. Gere uma base de design clara o suficiente
para orientar os Scene Specs.
```

Critério de saída da Fase 3.1:

- Existe uma decisão explícita de composição mobile e desktop por seção.
- Existem keyframes iniciais separados por breakpoint.
- Existem critérios de aceite visual para pelo menos um viewport mobile e
  um viewport desktop.
- O tratamento de motion reduzida está definido antes da implementação.
- Existe uma Design Bible curta.
- Existe um storyboard por seção.
- Existe uma matriz de qualidade por dispositivo.
- Existem pelo menos três momentos memoráveis definidos.
- Existe um checklist portfolio-grade para o agente `verify`.
- Existe uma rubrica visual com nota mínima.
- Existem regras de composição por viewport.
- Existe plano de tratamento do modelo 3D/materiais.
- Existe plano para check em dispositivo real ou risco residual documentado.

---

## Fase 3.2 — Look Dev / Protótipo visual antes da landing completa

Antes de construir todas as seções, criar uma cena experimental mínima para
validar o visual. Esta fase existe para não construir a landing inteira em
cima de uma estética fraca.

O Look Dev pode ser feito como um protótipo descartável ou como uma primeira
iteração da cena real, conforme a convenção encontrada na Fase 1. O objetivo
não é completar a aplicação, é acertar presença visual.

Rodadas obrigatórias:

- `Look Dev v1`: câmera, enquadramento, escala do modelo e luz.
- `Look Dev v2`: tipografia, composição e integração texto/personagem.
- `Look Dev v3`: obrigatória se a rubrica visual tiver qualquer item crítico
  com nota menor que `4`; foco em polimento, performance e motion reduzida.

Prompt pronto para o agente `implement`:

```
[implement] Crie um protótipo visual mínimo para validar a direção de arte
antes da landing completa.

Escopo permitido:
- Carregar o GLB.
- Posicionar o personagem em uma cena escura.
- Testar câmera mobile e desktop para Hero.
- Testar iluminação principal: key light fria, rim light quente, fill mínima.
- Testar Bloom/Vignette/grão em desktop e versão reduzida mobile.
- Exibir apenas uma camada simples de texto da Hero para testar composição.
- Não implementar todas as seções.
- Não adicionar conteúdo novo.

Validação obrigatória:
- Screenshot mobile 390x844 da primeira dobra.
- Screenshot mobile 430x932 da primeira dobra.
- Screenshot desktop 1440x900 da primeira dobra.
- Conferir se o personagem é o primeiro sinal visual.
- Conferir se texto não cobre rosto/olhos/símbolo.
- Registrar FPS médio aproximado em mobile e desktop.
- Preencher a rubrica visual com notas de 1 a 5.
- Definir se o visual atingiu padrão portfolio-grade ou se precisa voltar
  para Fase 3.1.
```

Critério de saída da Fase 3.2:

- A primeira dobra tem impacto visual aprovado antes de expandir para as
  demais seções.
- Câmera, luz, contraste e texto funcionam no mobile principal.
- Existe uma decisão consciente sobre nível de post-processing por perfil de
  dispositivo.
- Look Dev v1 e v2 foram concluídos; v3 foi concluído quando exigido pela
  rubrica.
- Primeira dobra, composição mobile e integração texto/personagem receberam
  nota mínima `4`.
- Se o visual ainda parecer genérico, a implementação para e retorna para
  definição de design.

---

## Fase 4 — Estrutura proposta (rascunho — confirmar contra a Fase 1)

```
spiderman-landing/
  AGENTS.md                  <<< formato exato a confiar no que a Fase 1 trouxer
  docs/
    prd.md
    hld.md
    adr/
    design/
      reference-survey.md
      design-bible.md
      storyboard.md
      quality-matrix.md
      visual-rubric.md
      composition-rules.md
      look-dev-report.md
      real-device-check.md
    scene-specs/             <<< nome a confirmar — pode já existir um padrão equivalente
  public/
    models/
      spider-man_brand_new_day-v2.glb
  scripts/
    setup.sh
    verify-all.sh
    collect-visual-evidence.sh
    inspect-glb.mjs
    check-performance.mjs
  .playwright/
    cli.config.json
  tests/
    unit/
    visual/
  test-results/
    visual/
  .github/
    workflows/
      ci.yml               <<< confirmar padrão final contra FinTrack/our-journey na Fase 1 >>>
  <<< pasta dos agentes: .opencode/agent/ ou outra — confirmar na Fase 1 >>>
    explore.md
    plan.md
    implement.md
    verify.md
    security-audit.md
```

### 4.1 — Orquestrador e modelos do OpenCode

Este projeto deve usar `opencode.json` como contrato operacional do harness.
Como ele será executado por modelos menores em várias etapas, o arquivo deve
ter permissões restritas, agentes com responsabilidades estreitas e modelos
escolhidos por custo/benefício.

Modelos disponíveis considerados:

- Kimi K3
- Grok 4.6
- Hy4 preview
- GPT 5.6 Luna
- GLM-5.3-Flash
- MiniMax M3
- Qwen3.7 Plus
- Hy3
- Qwen3.8 Flash
- DeepSeek V4 Flash
- LongCat-2.0
- Omen Alpha
- MiMo-V2.5
- Muse Spark 1.3 Contributor (regiões limitadas)

Recomendação de uso:

| Agente               | Modelo recomendado                 | Motivo                                                                              |
| -------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `orchestrator`       | `DeepSeek V4 Flash`                | bom equilíbrio para seguir regras, delegar e manter fluxo sem gastar modelo premium |
| `explore`            | `Kimi K3` ou `GLM-5.3-Flash`       | tarefa read-only, barata, adequada para mapear arquivos e padrões                   |
| `plan`               | `GPT 5.6 Luna`                     | decisões de design/arquitetura têm alto impacto; usar modelo mais forte aqui        |
| `design-review`      | `GPT 5.6 Luna` ou `Hy4 preview`    | julga rubrica visual, composição e trade-offs estéticos                             |
| `implement-frontend` | `Qwen3.7 Plus`                     | bom custo/benefício para React/TypeScript/R3F                                       |
| `implement-general`  | `MiniMax M3`                       | scripts, CI, configs, docs estruturais e automação                                  |
| `test-writer`        | `Qwen3.8 Flash` ou `GLM-5.3-Flash` | testes e Playwright são mecânicos, mas precisam precisão                            |
| `verify`             | `DeepSeek V4 Flash`                | checagem objetiva, leitura de logs e bloqueio de falso positivo                     |
| `security-audit`     | `DeepSeek V4 Flash`                | escopo de segurança é limitado, mas exige disciplina                                |
| `docs`               | `Kimi K3` ou `GLM-5.3-Flash`       | atualização documental e resumos de evidência                                       |
| `git`                | `Kimi K3`                          | commits/PRs com checklist são tarefa mecânica e barata                              |

Regra de economia:

- Não usar `Muse Spark 1.3 Contributor` como padrão por ter regiões
  limitadas.
- Não usar modelos caros para exploração, git, docs ou execução mecânica de
  scripts.
- Promover para `GPT 5.6 Luna` apenas quando houver decisão de design,
  arquitetura, rubrica visual reprovada ou conflito entre performance e
  impacto.

Prompt do orquestrador:

```
YOU ARE A DELEGATION-ONLY ORCHESTRATOR FOR A DESIGN-FIRST 3D PORTFOLIO.

Never implement code, edit files, run build/test commands, write docs, or
perform visual judgment yourself. Your job is to route work to the correct
agent, enforce phase order, and stop the workflow when a gate is red.

Phase order:
1. explore reference projects and current repo
2. plan docs/specs/ADRs/design direction
3. implement only from approved specs
4. verify with deterministic gates and Playwright evidence
5. security-audit for assets, links, env, dependencies
6. git agent opens PR only with real evidence

Hard stops:
- No implementation without approved Scene Spec.
- No PR with failing or empty validation evidence.
- No visual approval before Playwright screenshots/evidence exist.
- No desktop-only solution; mobile is primary.
- No npm/yarn; use pnpm.
- No direct push to main.

Delegate model:
- Use explore for read-only mapping.
- Use plan for architecture, Design Bible, Scene Specs and ADRs.
- Use implement-frontend for React/R3F/UI work.
- Use implement-general for scripts, CI, config and asset pipeline.
- Use test-writer for unit/visual tests.
- Use verify for all gates and evidence reports.
- Use security-audit for license, secrets, external links and GLB metadata.
- Use docs to update durable documentation.
- Use git for commits, push and PR.
```

Permissões recomendadas:

- `orchestrator`: pode ler no máximo poucos arquivos e delegar; não pode
  rodar `pnpm`, `git add`, `git commit`, `git push`, `gh` ou editar.
- `explore`: read-only; permitir `rg`, `find`, `ls`, `cat`, `sed`, `git
status`, `git diff`, `git log`.
- `plan`: sem bash e sem edit, a menos que o fluxo do OpenCode exija salvar
  docs por meio de agente `docs`.
- `implement-frontend`: pode editar e rodar `pnpm run lint`, `pnpm run
typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run test:visual`,
  `pnpm install`, `pnpm exec playwright *`; não pode push/reset/rm.
- `implement-general`: pode editar scripts/config/CI e rodar validações;
  não pode ações destrutivas.
- `verify`: read-only; pode rodar `bash scripts/verify-all.sh`, `pnpm run
*`, `pnpm exec playwright *`, `bash scripts/collect-visual-evidence.sh`,
  `node scripts/*.mjs`, `git diff`, `git status`.
- `security-audit`: read-only; pode rodar `rg`, `find`, `sed`, `cat`,
  `node scripts/inspect-glb.mjs`, `git diff`, `git status`.
- `git`: só operações git/gh não destrutivas; negar `push --force` e
  `reset --hard`.

Critério de saída:

- `opencode.json` criado com agentes e permissões acima.
- `AGENTS.md` aponta para este fluxo e para os documentos de memória.
- A escolha de modelos está registrada em ADR ou `docs/engineering/agent-models.md`.

---

## Fase 5 — Loop por feature (Spec-Driven Development)

Mesmo ciclo do FinTrack: **PRD → HLD → Scene Spec (equivalente ao FDD) →
implement → verify → security-audit → PR**, com o plano de cada etapa
descartado ao final (efêmero) e as decisões realmente importantes
promovidas a ADR.

Contrato obrigatório para cada feature:

1. Criar ou atualizar o Scene Spec antes de mexer em código.
2. Implementar apenas o escopo descrito no Scene Spec aprovado.
3. Adicionar ou atualizar testes proporcionais ao risco da mudança.
4. Rodar `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`,
   `pnpm run build` e, quando houver impacto visual, `pnpm run test:visual`.
5. Rodar security-audit quando tocar asset, link externo, dependência,
   configuração, script, analytics/CDN ou qualquer superfície pública.
6. Abrir PR com checklist preenchido e evidências de validação.

Regra de parada:

- Se spec estiver ausente, ambíguo ou contraditório, parar e voltar para
  `plan`.
- Se qualquer gate técnico falhar, parar e corrigir antes de seguir.
- Se o visual não atingir o checklist portfolio-grade, voltar para Design
  Bible/Scene Spec antes de expandir a implementação.

Contrato dos agentes:

| Agente         | Entrada                             | Saída                                               | Não pode                                       |
| -------------- | ----------------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| explore        | caminhos dos projetos de referência | relatório comparativo literal                       | inventar convenção ou criar arquivos finais    |
| plan           | relatório do explore + plano atual  | PRD/HLD/Scene Specs/ADRs/design docs                | implementar código                             |
| implement      | Scene Spec aprovado                 | código, testes e scripts necessários                | mudar escopo sem atualizar spec                |
| verify         | app implementada + specs            | relatório de gates técnicos e visuais               | aprovar visual quebrado só porque build passou |
| security-audit | app/config/assets                   | relatório de licença, segredos e superfície pública | ignorar crédito/licença do asset               |

---

## Fase 6 — Prompts prontos, um por seção/etapa animada

Cada bloco abaixo é um prompt autocontido para o agente `implement`
executar, na ordem listada (cada um depende do anterior). Os valores
concretos (cores, posições de câmera, copy) já foram fechados nesta
conversa — o agente não precisa inventá-los, só implementá-los. Onde
depende de convenção dos projetos de referência, deixei `<<< >>>`.

Antes de rodar qualquer um destes, a Fase 0 precisa ter aprovado/ajustado
o plano, a Fase 1 precisa ter confirmado as convenções dos projetos de
referência, a Fase 3.1 precisa ter produzido a Design Bible/storyboard/matriz
de qualidade, e a Fase 3.2 precisa ter validado o Look Dev da primeira dobra.
Depois disso, o agente `plan` deve gerar os Scene Specs correspondentes em
`docs/scene-specs/` (ou onde a Fase 1 apontar) — prompt para isso primeiro:

```
[plan] Gere um Scene Spec para cada etapa/seção abaixo, salvos em
<<< docs/scene-specs/ ou convenção equivalente encontrada na Fase 1 >>>,
seguindo o formato de FDD já usado no FinTrack/our-journey. Use estes
dados como conteúdo base de cada spec — não redesenhe do zero. Os Scene
Specs devem incorporar a Design Bible, o storyboard, a matriz de qualidade
por dispositivo, os momentos memoráveis, a rubrica visual, as regras de
composição e os critérios portfolio-grade.

Design tokens iniciais:
- Cores: ink #0a0a0c, concrete #141417, steel #2c3b4c, oxide #7a1f24,
  signal #c23b34, paper #e9e5da, dim #6b6a63
- Tipografia: display = Space Grotesk (peso 400–700), mono = JetBrains
  Mono (labels de HUD diegéticos, não decorativos)
- Princípio: nada de cream+serif, nada de vermelho-neon genérico, nada de
  eyebrow em caixa-alta decorativo — só o HUD mono quando faz sentido
  narrativo (vigilância/anonimato do Peter)

Etapas: fundação (scaffold, loader, camera-rig, post-processing) e seções
de conteúdo (hero, evolution, arsenal, fullbody) — uma spec por item,
usando os dados de cada bloco de prompt abaixo.

Para cada Scene Spec, incluir obrigatoriamente:
- intenção emocional da seção;
- composição mobile e desktop;
- keyframes mobile e desktop;
- área segura de texto;
- escala tipográfica mobile e desktop;
- beat visual memorável, quando aplicável;
- degradação visual para Mobile Good e Mobile Low;
- ajustes esperados de materiais/iluminação do GLB;
- critérios da rubrica visual que precisam atingir nota mínima;
- critérios de screenshot e FPS para verify.
```

### 6.1 — Fundação: Scaffold & Design Tokens

```
[implement] Scaffold do projeto: Vite + React 19 + TypeScript + Tailwind v4.
Instale @react-three/fiber, @react-three/drei, @react-three/postprocessing,
gsap, three, vitest e @playwright/test. Usar Node.js 22. Configurar
Tailwind v4 com o plugin @tailwindcss/vite e tokens vindos do Scene Spec de
fundação. Registre GSAP ScrollTrigger uma única vez, em um ponto central
(não repetir o registro em cada componente). Estrutura de pastas:
<<< confirmar convenção de src/ do FinTrack/our-journey na Fase 1, senão
usar components/ sections/ hooks/ lib/ data/ >>>.

Gerenciador de pacotes:
- Usar `pnpm`, seguindo o padrão dos projetos de referência.
- Não usar `npm` ou `yarn` para instalar/rodar scripts do projeto, exceto
  fallback explícito `npx playwright cli` quando o binário global
  `playwright-cli` não existir.

Scripts obrigatórios no package.json:
- "dev": "vite"
- "build": "tsc -b && vite build"
- "typecheck": "tsc -b --noEmit"
- "lint": "eslint ."
- "test": "vitest run"
- "test:unit": "vitest run"
- "test:visual": "playwright test"
- "evidence:visual": "bash scripts/collect-visual-evidence.sh"
- "verify": "bash scripts/verify-all.sh"

Se algum script exigir ajuste por causa do template real do Vite/React 19,
registrar o motivo no PR. Não remover script obrigatório sem substituir por
equivalente.

Scripts shell obrigatórios:
- `scripts/setup.sh`: instala dependências, instala browsers do Playwright e
  valida versões de Node/pnpm.
- `scripts/verify-all.sh`: roda lint, typecheck, testes unitários, build e
  testes visuais; no final imprime `STATUS: PASS` ou `STATUS: FAIL` e lista
  exatamente quais comandos falharam.
- `scripts/collect-visual-evidence.sh`: sobe/usa o app local, coleta
  screenshots/snapshots/console/requests com Playwright CLI e salva tudo em
  `test-results/visual/`.

Playwright CLI:
- Instalar como dependência/devDependency se disponível para o projeto, ou
  usar globalmente com `pnpm add -g @playwright/cli@latest` quando esse
  for o padrão do ambiente.
- Se o comando global `playwright-cli` não existir, tentar fallback local:
  `npx playwright cli`.
- Antes de usar em automação, rodar `playwright-cli --help` ou
  `npx playwright cli --help` e ajustar comandos se a versão instalada
  divergir.
```

### 6.1.1 — Fundação: Asset pipeline do GLB

```
[implement] Antes de criar a experiência completa, inspecione o asset
spider-man_brand_new_day-v2.glb.

Criar script em scripts/inspect-glb.mjs para reportar:
- tamanho do arquivo;
- quantidade de scenes/nodes/meshes/materials/textures/animations;
- nomes dos bones ou joints encontrados;
- dimensões aproximadas/bounding box do modelo;
- metadata relevante do glTF;
- aviso se houver caminhos locais, autores/metadados sensíveis ou dados
  inesperados.

Regras:
- Não substituir o GLB original sem manter uma cópia preservada ou sem
  documentar claramente a origem.
- Se criar versão otimizada, salvar com nome explícito, por exemplo
  spider-man_brand_new_day.optimized.glb.
- Documentar qualquer compressão/otimização aplicada no look-dev-report ou
  ADR correspondente.
- Se o modelo não tiver bones úteis de cabeça/pescoço, registrar fallback
  para o Hero antes de implementar head-tracking.
```

### 6.2 — Fundação: Loader cinemático

```
[implement] Componente de pre-loader bloqueante usando useProgress do
drei. Tela escura (bg ink), contador percentual suavizado (interpole o
número em vez de deixá-lo saltar), barra de progresso fina na cor signal.
Só libera a página (fade-out do véu, ~0.9s, opacity) quando progress===100
e active===false. Não bloquear o carregamento em si — só a revelação da UI.
```

### 6.3 — Fundação: Camera Rig / Motor de Scroll Storytelling

```
[implement] Motor de câmera compartilhado entre todas as seções — a cena
3D nunca desmonta, só a câmera se move. Regras:
- Um objeto mutável (não React state) guarda o alvo de câmera atual
  (posição x/y/z, alvo de lookAt tx/ty/tz, fov).
- Cada seção registra seu próprio ScrollTrigger (scrub) que interpola
  esse objeto do keyframe anterior para o seu próprio, conforme a seção
  cruza o viewport — seções ficam independentes entre si.
- Dentro do Canvas, um componente lê esse objeto a cada frame (useFrame)
  e aplica lerp na câmera real do three.js — essa segunda camada de
  suavização é o que dá o drag cinematográfico, não o scrub puro do GSAP.

Keyframes desktop (ajustar depois de ver o modelo real, mas usar estes
como ponto de partida):
- hero: posição [0, 0.2, 4.2], alvo [0, 0.4, 0], fov 35
- evolution (close no símbolo do peito): posição [0.15, 0.55, 0.9],
  alvo [0, 0.5, 0], fov 28
- arsenal (órbita no lançador de teia do pulso): posição
  [-1.1, -0.15, 0.85], alvo [-0.55, -0.2, 0.05], fov 30
- fullbody: posição [0, 0.1, 6.2], alvo [0, 0.1, 0], fov 40

Keyframes mobile:
- Não reaproveitar automaticamente os keyframes desktop.
- Definir posições/alvos/fov no Scene Spec de design, priorizando leitura do
  personagem e da copy em telas estreitas.
- Usar condicionais por breakpoint no rig de câmera, com transição estável
  em resize/orientation change.
- Se performance mobile não sustentar post-processing completo, reduzir
  efeitos antes de sacrificar enquadramento/composição.
```

### 6.4 — Fundação: Post-processing (efeito blockbuster)

```
[implement] EffectComposer envolvendo a cena com: Bloom (threshold alto,
~0.85, intensidade moderada — só os pontos mais claros da máscara/olhos
estouram, não a cena inteira), Vignette (bordas escurecidas, não sutil
demais), e opcionalmente um grão/chromatic aberration bem discreto para
textura de "filme", não de photoshop. Testar em conjunto com a iluminação
da Fase 6.5 antes de fechar os valores — os dois se afetam.
```

### 6.5 — Fundação: Iluminação dramática

```
[implement] Ambiente majoritariamente escuro. Ambient light bem baixa e
fria (evita silhueta "lavada"). Uma key light direcional fria/branca-azul
vindo de cima-frente. Uma rim light quente (tom oxide/signal do design
system) vindo de trás/lado, para separar o personagem do fundo escuro e
acender o vermelho do traje. Uma fill point light bem fraca para os olhos
da máscara nunca ficarem 100% pretos.
```

### 6.6 — Seção: Hero (mouse tracking)

```
[implement] Seção de 100vh. Carregue o modelo (GLB). Identifique o(s)
bone(s) de cabeça/pescoço do rig por nome — não assuma convenção Mixamo,
este modelo é um rig custom do Sketchfab. Na primeira execução, logue no
console todos os nomes de bone encontrados no traverse do modelo para
descoberta manual. Capture a posição do mouse normalizada (-1 a 1, fora
de React state — só em ref, lido no useFrame) e rotacione o bone
encontrado com slerp, clampando o ângulo máximo (algo como 25–30° de yaw,
12–15° de pitch) para não quebrar a naturalidade do pescoço.

Copy da seção (não reescrever, já validado):
- Kicker: "Julho de 2026"
- Título: "NINGUÊM SABE."
- Subtítulo: "Quatro anos depois de desaparecer da memória de todos que
  ama, Peter Parker ainda está lá em cima, sozinho, sob a máscara."
```

### 6.7 — Seção: Evolution (close-up do símbolo do peito)

```
[implement] Seção alta o bastante para dar espaço de scroll ao
movimento de câmera (~150vh). Texto alinhado à direita, assimétrico em
relação ao close-up centralizado no personagem.

Copy:
- Kicker: "A mudança"
- Título: "Algo nele\nestá mudando."
- Corpo: "Anos de noites sem nome cobraram um preço. O que começou como
  cansaço virou outra coisa — algo que nem Peter consegue explicar."
```

### 6.8 — Seção: Arsenal (lançadores de teia)

```
[implement] Seção ~150vh, texto alinhado à esquerda (câmera orbita para
o lado oposto, pulso esquerdo do personagem).

Copy:
- Kicker: "O que sobrou"
- Título: "Sem apoio.\nSó o essencial."
- Corpo: "Sem Stark, sem SHIELD, sem ninguém para ligar. Só o que ele
  mesmo construiu nos pulsos — e a cidade que continua escolhendo
  proteger."
```

### 6.9 — Seção: FullBody (paralaxe + CTA + atribuição)

```
[implement] Seção final, corpo inteiro visível, texto centralizado. Dois
labels de HUD (mono, diegéticos) fazem parallax em velocidades diferentes
em relação ao scroll (um mais lento, um mais rápido que o conteúdo
central) — efeito real de profundidade, não decoração.

Copy:
- Kicker: "31 de julho"
- Título: "Um homem\nsem nome.\nUma cidade\nsem escolha."
- Corpo: "SPIDER-MAN: BRAND NEW DAY chega aos cinemas em 31 de julho de
  2026."
- CTA: opcional; não há URL real obrigatória nesta etapa. Se existir botão,
  tratar como ação de portfólio/placeholder consciente, não como link
  quebrado para trailer.

Atribuição obrigatória no rodapé desta seção (licença CC-BY do modelo):
'Modelo 3D "Spider-Man Brand New Day" por Eskze, licenciado sob CC-BY
4.0' com link para:
https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda
```

### 6.10 — Verify: critérios de aceite

```
[verify] Para cada seção acima, confirmar usando Playwright e inspeção
registrada:
- A câmera chega no keyframe correto ao final do scroll da seção em desktop
  e mobile (sem overshoot nem ficar presa no keyframe anterior)
- O head-tracking do Hero não ultrapassa o clamp de ângulo definido
- Nenhuma seção causa layout shift perceptível durante a animação de
  entrada (RevealBlock ou equivalente)
- prefers-reduced-motion é respeitado (motion reduzida ou desligada)
- Frame rate se mantém estável com Bloom + Vignette ativos em desktop e com
  a configuração mobile definida no Scene Spec — registrar FPS médio, não
  só "parece fluido"
- Screenshots mobile e desktop confirmam que texto e personagem não se
  atropelam em nenhum ponto-chave de scroll

Viewports obrigatórios:
- 390x844 (mobile base)
- 430x932 (mobile alto)
- 1440x900 (desktop)

Validação automatizada obrigatória com Playwright:
- Abrir a página em cada viewport.
- Aguardar o loader finalizar ou o estado visual pronto ficar disponível.
- Capturar screenshot da Hero sem scroll.
- Capturar screenshots nos pontos-chave de Evolution, Arsenal e FullBody.
- Verificar que não há erros de console.
- Verificar que o canvas existe, está visível e não está em branco.
- Verificar que os textos principais estão visíveis dentro do viewport.
- Verificar que a atribuição do modelo aparece no final em mobile e desktop.
- Executar um teste com prefers-reduced-motion ativado.

Validação humana obrigatória:
- Depois dos screenshots gerados por Playwright, pedir revisão do usuário
  apenas para aprovação estética: impacto visual, composição, presença de
  portfólio e sensação cinematográfica.
- A aprovação humana não substitui os gates automáticos. Ela é o gate final
  de direção de arte.
- A revisão humana deve preencher ou confirmar a rubrica visual com nota de
  1 a 5 para os critérios definidos na Fase 3.1.10.

Se qualquer screenshot não atingir o critério portfolio-grade, voltar para
Scene Spec ou Design Bible antes de seguir para PR.
```

### 6.11 — Security-audit: escopo deste projeto

```
[security-audit] Não há segredo de banco/API aqui, mas checar:
- Atribuição CC-BY do modelo 3D está visível e com link correto
  (obrigação legal da licença, não só boa prática)
- Nenhuma chave de terceiro (analytics, CDN) commitada em texto plano
- O asset .glb não expõe metadata sensível (autor original, caminho de
  arquivo local de quem exportou) que não devesse ir para produção
- A atribuição aparece também em mobile, sem depender de hover.
- Links externos usam URL real, não placeholder.
- Não há `.env`, token, chave de analytics/CDN ou segredo em arquivos
  versionados.
- Se novas dependências forem adicionadas, justificar no PR por que são
  necessárias.
```

---

## Fase 7 — Guardrails, validação visual, PR e entrega

Esta fase é obrigatória antes de considerar qualquer implementação pronta.
Ela transforma "parece bom" em evidência verificável.

### 7.1 — Scripts e gates técnicos

Scripts obrigatórios:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:visual": "playwright test",
    "evidence:visual": "bash scripts/collect-visual-evidence.sh",
    "verify": "bash scripts/verify-all.sh"
  }
}
```

Scripts shell obrigatórios:

- `bash scripts/setup.sh`
- `bash scripts/verify-all.sh`
- `bash scripts/collect-visual-evidence.sh`

Gate obrigatório antes de push/PR:

- [ ] `pnpm run lint` passou
- [ ] `pnpm run typecheck` passou
- [ ] `pnpm run test` passou
- [ ] `pnpm run build` passou
- [ ] `pnpm run test:visual` passou quando houve mudança visual
- [ ] screenshots mobile/desktop foram geradas e revisadas
- [ ] FPS médio foi registrado
- [ ] rubrica visual preenchida
- [ ] dispositivo real testado ou risco residual registrado
- [ ] atribuição Sketchfab está visível e com link correto
- [ ] não há erros de console nos testes visuais
- [ ] não há segredo ou placeholder de produção

Regra:

- `pnpm run verify` não substitui `pnpm run test:visual`; o visual gate roda
  separadamente porque depende de servidor/browser e screenshots.
- Se qualquer item falhar, não abrir PR como pronto. Corrigir e repetir o
  gate.
- `scripts/verify-all.sh` deve ser o comando único para uso humano/CI local:
  ele roda os gates em ordem, preserva logs e imprime uma conclusão objetiva.

### 7.2 — Validação visual com Playwright CLI

Usar Playwright como ferramenta objetiva de validação visual. O objetivo não
é substituir o julgamento humano, é produzir evidência confiável para revisão.

Testes mínimos em `tests/visual/`:

- `hero.spec.ts`: carrega a primeira dobra, espera loader finalizar,
  valida canvas visível/não branco, texto da Hero visível e captura
  screenshot.
- `sections.spec.ts`: rola até Evolution, Arsenal e FullBody, captura
  screenshots e valida que textos principais aparecem dentro do viewport.
- `reduced-motion.spec.ts`: abre a página com `prefers-reduced-motion:
reduce` e confirma que motion pesada/parallax/head-tracking foram
  reduzidos ou desligados.
- `credits.spec.ts`: confirma que a atribuição do modelo e o link do
  Sketchfab aparecem no final em mobile e desktop.
- `console.spec.ts` ou fixture compartilhada: falhar teste se houver
  `console.error`, exceção de runtime ou asset 404.

Viewports obrigatórios:

- `390x844`
- `430x932`
- `1440x900`

Screenshots devem ser salvos em `test-results/visual/` ou no diretório
padrão do Playwright, conforme configuração final.

Configuração mínima esperada em `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  outputDir: 'test-results/playwright',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm run dev -- --host 127.0.0.1',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'mobile-390',
      use: { viewport: { width: 390, height: 844 }, isMobile: true },
    },
    {
      name: 'mobile-430',
      use: { viewport: { width: 430, height: 932 }, isMobile: true },
    },
    {
      name: 'desktop-1440',
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
});
```

Se usar `devices`, manter mesmo assim os tamanhos explícitos de viewport
acima para comparabilidade dos screenshots.

Critérios objetivos:

- Canvas existe, está visível e tem pixels renderizados não uniformes.
- Textos principais estão dentro do viewport.
- Loader desaparece após carregamento.
- Nenhum texto cobre os pontos narrativos definidos no Scene Spec, tanto
  quanto possível por checagem automatizada; o restante vai para revisão
  humana.
- FullBody exibe atribuição do asset em mobile e desktop.

Comandos Playwright CLI para coleta manual/agent-friendly de evidências:

```bash
# 1. Confirmar CLI disponível. Se falhar, tentar fallback local.
playwright-cli --help
npx playwright cli --help

# 2. Abrir app local em sessão nomeada.
playwright-cli -s=spiderman open http://localhost:5173

# 3. Coletar Hero mobile base.
playwright-cli -s=spiderman resize 390 844
playwright-cli -s=spiderman snapshot --filename=test-results/visual/390-hero.snapshot.yml --boxes
playwright-cli -s=spiderman screenshot --filename=test-results/visual/390-hero.png --hires
playwright-cli -s=spiderman console error
playwright-cli -s=spiderman requests

# 4. Coletar Hero mobile alto.
playwright-cli -s=spiderman resize 430 932
playwright-cli -s=spiderman snapshot --filename=test-results/visual/430-hero.snapshot.yml --boxes
playwright-cli -s=spiderman screenshot --filename=test-results/visual/430-hero.png --hires

# 5. Coletar Hero desktop.
playwright-cli -s=spiderman resize 1440 900
playwright-cli -s=spiderman snapshot --filename=test-results/visual/1440-hero.snapshot.yml --boxes
playwright-cli -s=spiderman screenshot --filename=test-results/visual/1440-hero.png --hires

# 6. Validar textos principais por snapshot/search.
playwright-cli -s=spiderman find "NINGUÊM SABE."
playwright-cli -s=spiderman find "SPIDER-MAN: BRAND NEW DAY"
playwright-cli -s=spiderman find "Sketchfab"

# 7. Usar eval para evidência técnica que snapshot não cobre bem.
playwright-cli -s=spiderman eval "() => ({
  url: location.href,
  title: document.title,
  canvasCount: document.querySelectorAll('canvas').length,
  visibleCanvas: [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect();
    return { width: r.width, height: r.height, visible: r.width > 0 && r.height > 0 };
  }),
  bodyHeight: document.body.scrollHeight,
  viewport: { width: innerWidth, height: innerHeight }
})"

# 8. Abrir dashboard para revisão humana assistida quando necessário.
playwright-cli show --annotate

# 9. Encerrar sessão.
playwright-cli -s=spiderman close
```

Observações:

- Usar `playwright-cli open --device="iPhone 15"` apenas para inspeção
  exploratória. Para evidência comparável, preferir `resize 390 844`,
  `resize 430 932` e `resize 1440 900`.
- `snapshot --boxes` é obrigatório quando a evidência precisa demonstrar
  que texto está dentro do viewport.
- `console error` e `requests` devem ser salvos ou copiados para o relatório
  de verify quando houver falha.
- `show --annotate` é útil para revisão visual acompanhada, mas não substitui
  screenshots versionáveis no relatório.

### 7.3 — Validação visual humana

Depois que Playwright gerar screenshots e passar nos checks objetivos,
solicitar revisão do usuário para os critérios estéticos.

Perguntas de aprovação:

- A primeira dobra impressiona sem scroll?
- A versão mobile parece desenhada para celular, ou parece desktop
  comprimido?
- Cada seção tem uma screenshot forte o bastante para portfólio?
- O personagem é o foco visual antes do texto?
- A iluminação e o contraste parecem cinematográficos, não genéricos?
- O design ainda funciona quando motion é reduzida?

Regra:

- Se Playwright falhar, corrigir antes de pedir aprovação humana.
- Se Playwright passar mas o usuário rejeitar o impacto visual, voltar para
  Fase 3.1 ou Scene Spec.
- Aprovação humana deve ser registrada no relatório de verify ou PR.

### 7.4 — Template de PR

Todo PR deve usar este formato:

```md
## Summary

-

## Scope

-

## Validation

- [ ] pnpm run lint
- [ ] pnpm run typecheck
- [ ] pnpm run test
- [ ] pnpm run build
- [ ] pnpm run test:visual

## Visual QA

- [ ] 390x844 screenshot reviewed
- [ ] 430x932 screenshot reviewed
- [ ] 1440x900 screenshot reviewed
- [ ] prefers-reduced-motion checked
- [ ] visual rubric recorded
- [ ] real device checked or residual risk documented
- [ ] user/design approval recorded when visual scope changed

## Performance

- Mobile FPS average:
- Desktop FPS average:
- Asset size notes:

## Security / License

- [ ] Sketchfab attribution visible
- [ ] Sketchfab link correct
- [ ] no secrets/placeholders committed

## Notes

-
```

### 7.5 — Conventional Commits

Usar Conventional Commits em todos os commits:

- `feat: scaffold react 19 landing`
- `feat: add design bible`
- `feat: add mobile camera rig`
- `fix: prevent hero text overlap on mobile`
- `test: add visual viewport checks`
- `docs: add scene specs`
- `chore: configure playwright`

Não misturar documentação, scaffold, implementação visual e correção de
gates no mesmo commit quando isso dificultar revisão.

### 7.6 — Scripts operacionais obrigatórios

Os scripts abaixo devem existir para que um modelo menor consiga preparar,
validar e coletar evidências sem decidir comandos por conta própria.

`scripts/setup.sh` deve:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap 'echo "STATUS: FAIL"; exit 1' ERR

echo "== Setup: checking runtime =="
node --version
pnpm --version
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" != "22" ]; then
  echo "Expected Node.js 22.x, got $(node --version)"
  exit 1
fi

echo "== Setup: installing dependencies =="
pnpm install --frozen-lockfile

echo "== Setup: installing Playwright browsers =="
pnpm exec playwright install --with-deps

echo "== Setup: checking Playwright CLI =="
if command -v playwright-cli >/dev/null 2>&1; then
  playwright-cli --help >/dev/null
else
  npx playwright cli --help >/dev/null
fi

echo "STATUS: PASS"
```

`scripts/verify-all.sh` deve:

```bash
#!/usr/bin/env bash
set -u

mkdir -p test-results/logs
failed=()

run_gate() {
  name="$1"
  shift
  echo "== Running $name =="
  if "$@" > "test-results/logs/$name.log" 2>&1; then
    echo "PASS: $name"
  else
    echo "FAIL: $name"
    failed+=("$name")
  fi
}

run_gate lint pnpm run lint
run_gate typecheck pnpm run typecheck
run_gate test pnpm run test
run_gate build pnpm run build
run_gate visual pnpm run test:visual

if [ "${#failed[@]}" -eq 0 ]; then
  echo "STATUS: PASS"
  exit 0
fi

echo "STATUS: FAIL"
echo "Failed gates:"
printf '%s\n' "${failed[@]}"
echo "See logs in test-results/logs/"
exit 1
```

`scripts/collect-visual-evidence.sh` deve:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap 'echo "STATUS: FAIL"; exit 1' ERR

mkdir -p test-results/visual test-results/logs

SESSION="spiderman"
BASE_URL="${BASE_URL:-http://localhost:5173}"

if command -v playwright-cli >/dev/null 2>&1; then
  PWC=(playwright-cli)
else
  PWC=(npx playwright cli)
fi

echo "== Visual evidence: checking app at $BASE_URL =="

"${PWC[@]}" -s="$SESSION" open "$BASE_URL"

collect_viewport() {
  label="$1"
  width="$2"
  height="$3"

  echo "== Collecting $label ${width}x${height} =="
  "${PWC[@]}" -s="$SESSION" resize "$width" "$height"
  "${PWC[@]}" -s="$SESSION" snapshot --filename="test-results/visual/${label}-hero.snapshot.yml" --boxes
  "${PWC[@]}" -s="$SESSION" screenshot --filename="test-results/visual/${label}-hero.png" --hires
  "${PWC[@]}" -s="$SESSION" console error > "test-results/visual/${label}-console-error.log"
  "${PWC[@]}" -s="$SESSION" requests > "test-results/visual/${label}-requests.log"
}

collect_viewport "390" 390 844
collect_viewport "430" 430 932
collect_viewport "1440" 1440 900

"${PWC[@]}" -s="$SESSION" find "NINGUÊM SABE." > test-results/visual/find-hero-title.log
"${PWC[@]}" -s="$SESSION" find "Sketchfab" > test-results/visual/find-sketchfab.log

"${PWC[@]}" -s="$SESSION" eval "() => ({
  canvasCount: document.querySelectorAll('canvas').length,
  viewport: { width: innerWidth, height: innerHeight },
  bodyHeight: document.body.scrollHeight
})" > test-results/visual/page-evidence.json

"${PWC[@]}" -s="$SESSION" close

echo "STATUS: PASS"
echo "Evidence saved in test-results/visual/"
```

Regras para estes scripts:

- Usar `set -u` no mínimo. Se usar `set -e`, garantir que o script ainda
  consiga imprimir qual gate falhou.
- Todos os logs devem ir para `test-results/logs/` ou
  `test-results/visual/`.
- `verify-all.sh` deve retornar exit code `0` quando tudo passa e `1` quando
  algum gate falha.
- `collect-visual-evidence.sh` assume que o servidor já está rodando em
  `BASE_URL`; se decidir iniciar o servidor dentro do script, precisa
  garantir cleanup do processo ao final.
- O texto final deve ser sempre `STATUS: PASS` ou `STATUS: FAIL`.

### 7.7 — CI do GitHub

O CI final deve ser confirmado contra os padrões reais de FinTrack e
our-journey durante a Fase 1. Até lá, este projeto deve reservar um workflow
mínimo em `.github/workflows/ci.yml` com os mesmos gates locais.

Workflow base recomendado:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Verify
        run: bash scripts/verify-all.sh

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          if-no-files-found: ignore

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          if-no-files-found: ignore
```

Regras:

- Se FinTrack/our-journey tiverem padrão de CI mais específico, adaptar este
  YAML para o padrão deles na Fase 1.
- CI deve falhar se `scripts/verify-all.sh` falhar.
- Artifacts de screenshots/logs devem ser preservados em falha para revisão.
- O PR só pode ser considerado pronto quando CI e validação visual local
  estiverem verdes, ou quando houver justificativa explícita no PR.

---

## Checklist do que falta para executar este plano

- [x] Rodar a Fase 0: revisão crítica do próprio plano
- [x] Fazer a entrevista de brainstorming e incorporar respostas
      bloqueantes ao plano antes de iniciar
- [x] Confirmar ou ajustar conscientemente a escolha tecnológica
      (Vite/React/TS/Tailwind/Three/R3F/Drei/GSAP)
- [x] Caminho absoluto do FinTrack
- [x] Caminho absoluto do our-journey
- [ ] Rodar o prompt da Fase 1 e revisar o relatório do `explore` antes de
      criar qualquer arquivo
- [ ] Decidir: reaproveitar literalmente os 5 prompts de agente, ou
      adaptar tom/escopo para um projeto majoritariamente visual?
- [ ] Confirmar se "Scene Spec" é o nome certo ou se já existe convenção
      equivalente nos projetos de referência
- [ ] Rodar a Fase 3.1 para definir direção de design, composição
      mobile-first e keyframes separados por breakpoint
- [ ] Produzir síntese das referências visuais pesquisadas
- [ ] Produzir a Design Bible curta
- [ ] Produzir o storyboard por seção
- [ ] Definir o sistema tipográfico mobile/desktop
- [ ] Definir pelo menos três momentos memoráveis
- [ ] Definir a matriz de qualidade por dispositivo
- [ ] Definir critérios portfolio-grade para o `verify`
- [ ] Definir rubrica visual com nota mínima
- [ ] Definir regras explícitas de composição mobile/desktop
- [ ] Definir tratamento esperado do modelo 3D/materiais
- [ ] Planejar check em dispositivo real ou registrar risco residual
- [ ] Definir orçamento de performance mobile antes de implementar
- [ ] Rodar a Fase 3.2 de Look Dev e aprovar visualmente a primeira dobra
      em mobile e desktop antes de expandir para todas as seções
- [ ] Rodar o prompt de `plan` da Fase 6 para gerar os Scene Specs antes
      de qualquer prompt de `implement`
- [ ] Criar scripts obrigatórios de lint/typecheck/test/build/test:visual
- [ ] Criar `scripts/setup.sh`
- [ ] Criar `scripts/verify-all.sh` com saída objetiva `STATUS: PASS/FAIL`
- [ ] Criar `scripts/collect-visual-evidence.sh` usando Playwright CLI
- [ ] Criar testes visuais Playwright para Hero, seções, reduced-motion,
      créditos e console errors
- [ ] Rodar Fase 7 antes de qualquer push/PR
- [ ] Gerar screenshots Playwright em 390x844, 430x932 e 1440x900
- [ ] Solicitar aprovação visual humana depois dos gates automáticos
- [ ] Criar `.github/workflows/ci.yml` após confirmar/adaptar padrão de CI
      contra FinTrack/our-journey
- [ ] Abrir PR usando o template da Fase 7.4
- [x] Pegar a URL real do modelo no Sketchfab antes do prompt 6.9
      (atribuição não pode ir com placeholder pra produção)
- [ ] Descobrir os nomes reais dos bones do rig (prompt 6.6 já inclui o
      passo de descoberta via console, mas alguém precisa rodar e ler)
