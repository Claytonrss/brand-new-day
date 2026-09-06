# Progresso do Plano de Bootstrap — spiderman-landing

Este documento rastreia o progresso de execução do plano definido em `harness-bootstrap-plan.md`.

**Legenda:**
- `[ ]` — pendente
- `[~]` — em progresso
- `[x]` — concluído
- `[-]` — cancelado/não aplicável

**Última atualização:** 2026-09-05

---

## Fase 0 — Revisão crítica do plano

- [x] Rodar a Fase 0: revisão crítica do próprio plano
- [x] Fazer a entrevista de brainstorming e incorporar respostas bloqueantes ao plano antes de iniciar
- [x] Confirmar ou ajustar conscientemente a escolha tecnológica (Vite/React/TS/Tailwind/Three/R3F/Drei/GSAP)
- [x] Caminho absoluto do FinTrack
- [x] Caminho absoluto do our-journey

---

## Fase 1 — Descoberta (explore)

- [x] Rodar o prompt da Fase 1 e revisar o relatório do `explore` antes de criar qualquer arquivo
- [x] Mapear estrutura de agentes em FinTrack e our-journey
- [x] Identificar documentos de planejamento (PRD, HLD, FDD, ADRs)
- [x] Identificar regras de workflow git
- [x] Identificar scripts e automações
- [x] Produzir relatório comparativo
- [x] Atualizar `harness-bootstrap-plan.md` com descobertas

**Decisões incorporadas:**
- [x] `pnpm` como contrato do projeto
- [x] `format:check` e `test:coverage` entram nos gates
- [x] PR deve copiar output real dos gates; checklist vazio bloqueia abertura
- [x] CI deve preservar artifacts de coverage, Playwright report e test-results
- [x] Orquestrador não deve implementar, testar nem rodar comandos pesados
- [x] Contexto deve ser carregado sob demanda

---

## Fase 2 — Regras não-negociáveis

- [x] Toda feature nasce em branch nova
- [x] Nome de branch obrigatório: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`
- [x] Commits seguem Conventional Commits
- [x] Guardrails rodam uma vez antes do push
- [x] Se guardrail falhar, parar e corrigir
- [x] Todo plano termina com PR aberto + confirmação de pipeline
- [x] Arquivos de plano são efêmeros
- [x] PR contém resumo, screenshots, comandos de validação, notas de performance

---

## Fase 3 — Escopo do projeto

- [x] Diferenças entre SaaS/full-stack e landing 3D mapeadas
- [x] Scene Spec definido como equivalente a FDD para este projeto
- [x] Security-audit focado em licenciamento do asset 3D
- [x] Clean Architecture não se aplica
- [x] Verify focado em verificação visual e performance
- [x] Design é feature principal
- [x] Mobile é prioridade de experiência

---

## Fase 3.1 — Definição de design e experiência mobile

- [x] Produzir síntese das referências visuais pesquisadas (seção 3.1.0)
- [x] Produzir Design Bible curta (seção 3.1.1)
- [x] Produzir storyboard por seção (seção 3.1.2)
- [x] Definir sistema mobile-first (seção 3.1.3)
- [x] Definir performance como decisão de design (seção 3.1.4)
- [x] Definir matriz de qualidade por dispositivo (seção 3.1.5)
- [x] Definir sistema tipográfico mobile/desktop (seção 3.1.6)
- [x] Definir pelo menos três momentos memoráveis (seção 3.1.7)
- [x] Definir critérios portfolio-grade para o verify (seção 3.1.8)
- [x] Definir regras explícitas mostrando que design é a feature principal (seção 3.1.9)
- [x] Definir rubrica visual com nota mínima (seção 3.1.10)
- [x] Definir plano de rodadas de Look Dev (seção 3.1.11)
- [x] Definir regras explícitas de composição mobile/desktop (seção 3.1.12)
- [x] Definir tratamento esperado do modelo 3D/materiais (seção 3.1.13)
- [x] Planejar check em dispositivo real ou registrar risco residual (seção 3.1.14)

**Critério de saída da Fase 3.1:**
- [x] Existe decisão explícita de composição mobile e desktop por seção
- [x] Existem keyframes iniciais separados por breakpoint
- [x] Existem critérios de aceite visual para pelo menos um viewport mobile e um desktop
- [x] Tratamento de motion reduzida está definido
- [x] Design Bible curta existe
- [x] Storyboard por seção existe
- [x] Matriz de qualidade por dispositivo existe
- [x] Pelo menos três momentos memoráveis definidos
- [x] Checklist portfolio-grade para o verify existe
- [x] Rubrica visual com nota mínima existe
- [x] Regras de composição por viewport existem
- [x] Plano de tratamento do modelo 3D/materiais existe
- [x] Plano para check em dispositivo real ou risco residual documentado existe

---

## Fase 3.2 — Look Dev / Protótipo visual

- [x] Criar protótipo visual mínimo para validar direção de arte
- [x] Completar Look Dev v1 (câmera, enquadramento, escala, luz)
- [x] Completar Look Dev v2 (tipografia, composição, integração texto/personagem)
- [ ] Completar Look Dev v3 se rubrica visual tiver item crítico < 4
- [x] Aprovar visualmente a primeira dobra em mobile e desktop

**Critério de saída da Fase 3.2:**
- [x] Primeira dobra tem impacto visual aprovado
- [x] Câmera, luz, contraste e texto funcionam no mobile principal
- [ ] Decisão consciente sobre nível de post-processing por perfil
- [x] Primeira dobra, composição mobile e integração texto/personagem receberam nota mínima 4

---

## Fase 4 — Estrutura do projeto

- [x] Criar estrutura de diretórios conforme rascunho
- [x] Criar `opencode.json` com agentes e permissões
- [x] Criar `.opencode/agent/*.md` para cada agente (explore, plan, implement, verify, security-audit, git, docs, test-writer)
- [x] Criar `AGENTS.md` apontando para fluxo e documentos de memória
- [x] Registrar escolha de modelos em ADR ou `docs/engineering/agent-models.md`

**Notas da Fase 4:**
- Scaffold manual com pnpm (Vite 8 + React 19 + TS 5.9 + Tailwind v4)
- `@vitejs/plugin-react` 6.1.1 para compatibilidade com Vite 8
- typescript-eslint 8.69.0 para ESLint flat config
- GLB copiado para `public/models/spider-man_brand_new_day-v2.glb` (50.4 MB)
- Rig Mixamo confirmado: 66 joints, `mixamorig:Head_06` disponível para head-tracking
- Scripts criados: `setup.sh`, `verify-all.sh`, `collect-visual-evidence.sh`
- Playwright config com 3 viewports (390x844, 430x932, 1440x900)
- Todos os 4 gates passando (lint, typecheck, test, build)

---

## Fase 5 — Loop por feature (Spec-Driven Development)

- [ ] Definir contrato obrigatório para cada feature (Scene Spec → implement → verify → security-audit → PR)
- [ ] Definir regra de parada (spec ausente/ambíguo, gate técnico falhar, visual não atingir portfolio-grade)

---

## Fase 6 — Prompts prontos por seção

- [ ] Gerar Scene Specs para todas as etapas/seções antes de implementar
- [ ] 6.1 — Fundação: Scaffold & Design Tokens
- [ ] 6.1.1 — Fundação: Asset pipeline do GLB
- [ ] 6.2 — Fundação: Loader cinemático
- [ ] 6.3 — Fundação: Camera Rig / Motor de Scroll Storytelling
- [ ] 6.4 — Fundação: Post-processing
- [ ] 6.5 — Fundação: Iluminação dramática
- [ ] 6.6 — Seção: Hero (mouse tracking)
- [ ] 6.7 — Seção: Evolution (close-up do símbolo do peito)
- [ ] 6.8 — Seção: Arsenal (lançadores de teia)
- [ ] 6.9 — Seção: FullBody (paralaxe + CTA + atribuição)
- [ ] 6.10 — Verify: critérios de aceite
- [ ] 6.11 — Security-audit: escopo deste projeto

---

## Fase 7 — Guardrails, validação visual, PR e entrega

### 7.1 — Scripts e gates técnicos

- [x] Criar scripts obrigatórios no `package.json` (dev, build, typecheck, lint, test, test:unit, test:visual, evidence:visual, verify)
- [x] Criar `scripts/setup.sh`
- [x] Criar `scripts/verify-all.sh` com saída objetiva `STATUS: PASS/FAIL`
- [x] Criar `scripts/collect-visual-evidence.sh` usando Playwright CLI

### 7.2 — Validação visual com Playwright CLI

- [x] Criar `tests/visual/hero.spec.ts`
- [ ] Criar `tests/visual/sections.spec.ts`
- [ ] Criar `tests/visual/reduced-motion.spec.ts`
- [ ] Criar `tests/visual/credits.spec.ts`
- [ ] Criar `tests/visual/console.spec.ts` ou fixture compartilhada
- [x] Configurar `playwright.config.ts` com viewports obrigatórios (390x844, 430x932, 1440x900)

### 7.3 — Validação visual humana

- [ ] Definir perguntas de aprovação estética
- [ ] Registrar aprovação humana no relatório de verify ou PR

### 7.4 — Template de PR

- [x] Criar `docs/templates/pr.md` com template obrigatório

### 7.5 — Conventional Commits

- [ ] Configurar commitlint
- [ ] Configurar husky hooks
- [ ] Configurar lint-staged

### 7.6 — Scripts operacionais obrigatórios

- [x] `scripts/setup.sh` instala dependências, browsers Playwright, valida Node/pnpm
- [x] `scripts/verify-all.sh` roda lint, typecheck, testes unitários, build, testes visuais
- [x] `scripts/collect-visual-evidence.sh` coleta screenshots/snapshots/console/requests

### 7.7 — CI do GitHub

- [ ] Criar `.github/workflows/ci.yml` com gates locais
- [ ] CI falha se `scripts/verify-all.sh` falhar
- [ ] Artifacts de screenshots/logs preservados em falha

---

## Checklist final antes de PR

- [ ] `pnpm run lint` passou
- [ ] `pnpm run typecheck` passou
- [ ] `pnpm run test` passou
- [ ] `pnpm run build` passou
- [ ] `pnpm run test:visual` passou quando houve mudança visual
- [ ] Screenshots mobile/desktop foram geradas e revisadas
- [ ] FPS médio foi registrado
- [ ] Rubrica visual preenchida
- [ ] Dispositivo real testado ou risco residual registrado
- [ ] Atribuição Sketchfab está visível e com link correto
- [ ] Não há erros de console nos testes visuais
- [ ] Não há segredo ou placeholder de produção

---

## Pendências gerais

- [ ] Decidir: reaproveitar literalmente os 5 prompts de agente, ou adaptar tom/escopo para projeto visual?
- [ ] Confirmar se "Scene Spec" é o nome certo ou se já existe convenção equivalente
- [ ] Descobrir os nomes reais dos bones do rig (prompt 6.6 já inclui passo de descoberta)

---

## Notas

- Este documento deve ser atualizado após cada fase concluída
- Decisões importantes devem ser registradas em `docs/memory/decisions.md` como ADRs
- Estado atual deve ser registrado em `docs/STATE.md`
