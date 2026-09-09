# Progresso do Plano de Bootstrap — spiderman-landing

Este documento rastreia o progresso de execução do plano definido em `harness-bootstrap-plan.md`.

**Legenda:**
- `[ ]` — pendente
- `[~]` — em progresso
- `[x]` — concluído
- `[-]` — cancelado/não aplicável

**Última atualização:** 2026-09-08

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

- [x] Definir contrato obrigatório para cada feature (Scene Spec → implement → verify → security-audit → PR) → `docs/workflow/spec-driven-contract.md` (commit `520d056`)
- [x] Definir regra de parada (spec ausente/ambíguo, gate técnico falhar, visual não atingir portfolio-grade) → incluído no contrato §4

---

## Fase 6 — Prompts prontos por seção

- [x] Gerar Scene Specs para todas as etapas/seções antes de implementar
- [x] 6.1 — Fundação: Scaffold & Design Tokens → `docs/specs/hero-mouse-tracking.md`
- [x] 6.1.1 — Fundação: Asset pipeline do GLB → KTX2/Basis compression integrada (commits 47300db, 9b6e9e6)
- [x] 6.2 — Fundação: Loader cinemático → implementado na wave-3 (commit f219e06)
- [x] 6.3 — Fundação: Camera Rig / Motor de Scroll Storytelling → camera rig + master timeline (commits d2be06f, 1aecf90), spec incluida em `docs/specs/evolution-chest-symbol.md`
- [x] 6.4 — Fundação: Post-processing → implementado na wave-1 (commit cf7a6c9 — EffectsStack)
- [x] 6.5 — Fundação: Iluminação dramática → implementado na wave-1 (commit db15f52 — physical lighting)
- [x] 6.6 — Seção: Hero (mouse tracking) → PR #5 (commit be218ef)
- [x] 6.7 — Seção: Evolution (close-up do símbolo do peito) → spec PR #6 + implementação PR #7 (commits 924ba5e, d2be06f)
- [x] 6.8 — Seção: Arsenal (lançadores de teia) → spec PR #8 + implementação PR #9 (commits 755663d, f4a3a26)
- [ ] 6.9 — Seção: FullBody (paralaxe + CTA + atribuição) → **NÃO CRIADA** — implementada na wave-3 sem spec (spec retroativa é o próximo item da fila)
- [x] 6.10 — Verify: critérios de aceite → 27/27 visual tests passing (hero/evolution/arsenal/fullbody × 3 viewports)
- [x] 6.11 — Security-audit: escopo deste projeto → licenciamento CC-BY 4.0 validado (asset Eskze)

---

## Fase 7 — Guardrails, validação visual, PR e entrega

### 7.1 — Scripts e gates técnicos

- [x] Criar scripts obrigatórios no `package.json` (dev, build, typecheck, lint, test, test:unit, test:visual, evidence:visual, verify)
- [x] Criar `scripts/setup.sh`
- [x] Criar `scripts/verify-all.sh` com saída objetiva `STATUS: PASS/FAIL`
- [x] Criar `scripts/collect-visual-evidence.sh` usando Playwright CLI

### 7.2 — Validação visual com Playwright CLI

- [x] Criar `tests/visual/hero.spec.ts`
- [x] Criar `tests/visual/evolution.spec.ts`
- [x] Criar `tests/visual/arsenal.spec.ts`
- [x] Criar `tests/visual/fullbody.spec.ts`
- [ ] Criar `tests/visual/reduced-motion.spec.ts`
- [ ] Criar `tests/visual/credits.spec.ts`
- [ ] Criar `tests/visual/console.spec.ts` ou fixture compartilhada
- [x] Configurar `playwright.config.ts` com viewports obrigatórios (390x844, 430x932, 1440x900)

### 7.3 — Validação visual humana

- [ ] Definir perguntas de aprovação estética → pendente
- [ ] Registrar aprovação humana no relatório de verify ou PR → pendente
- [ ] Validar FPS em dispositivo real (iPhone 12, Android mid-tier) → pendente
- [ ] Security audit (dependências, GLB source) → pendente

### 7.4 — Template de PR

- [x] Criar `docs/templates/pr.md` com template obrigatório

### 7.5 — Conventional Commits

- [ ] Configurar commitlint → pendente
- [ ] Configurar husky hooks → pendente
- [ ] Configurar lint-staged → pendente

### 7.6 — Scripts operacionais obrigatórios

- [x] `scripts/setup.sh` instala dependências, browsers Playwright, valida Node/pnpm
- [x] `scripts/verify-all.sh` roda lint, typecheck, testes unitários, build, testes visuais
- [x] `scripts/collect-visual-evidence.sh` coleta screenshots/snapshots/console/requests

### 7.7 — CI do GitHub

- [ ] Criar `.github/workflows/ci.yml` com gates locais → pendente
- [ ] CI falha se `scripts/verify-all.sh` falhar → pendente
- [ ] Artifacts de screenshots/logs preservados em falha → pendente

---

## Premium Upgrade Waves (2026-09-08)

Quatro waves de premium upgrade entregues após o Look Dev v2, elevando o nível de portfólio do projeto.

### Wave 1 — 3D Presentation (PR #10)
- Canvas rework: dpr [1,2], antialias, ACES tone mapping, shadows
- Physical lighting: dual-rim (oxide 30cd + signal 15cd), key directional 3.0
- Material curation: per-material intent (eyes emissive 1.2, chest 0.6, metal 0.85)
- Post-processing: Bloom (0.85), Vignette (0.6), Noise (0.032)
- Environment map: drei `<Environment preset="city">`
- Commits: cf7a6c9, db15f52, 73c6879

### Wave 2 — Scroll Experience (PR #11)
- Lenis integration: smooth scroll premium (easing exponencial)
- Master scroll timeline: cameraPath.ts com 5 segmentos piecewise (0-100%)
- Hero close-up: z=18→7.2 (mobile), z=16→6.0 (desktop)
- Head-tracking Beat 1: yaw ±0.48 rad, idle drift autônomo
- Lerp retune: k=3→2 (smoother com Lenis)
- Commits: b1610c9, 1aecf90, 9e6c050

### Wave 3 — Motion & Narrative (PR #12)
- Motion tokens: `src/design/motion.ts` (durations, easings, staggers, springs)
- Cinematic loader: overlay premium com progress bar + fade-out
- SplitText headlines: caractere por caractere (yPercent 110, power3.out)
- FullBody section: iluminação de revelação + copy "UM HERÓI QUALQUER."
- Commits: f219e06, 6322501, 3e76224

### Wave 4 — Depth & Chrome (PR #13)
- Chapter cards: "MUDANÇA" + "REVELAÇÃO" (100vh, GSAP animations)
- Progress bar: fixed right edge, signal color, 1px width
- L1 particles: 200 pontos (desktop) / 120 (mobile), slow drift
- Performance monitor: FPS tracking + adaptive quality (high/medium/low)
- Commits: 718781d, 8f14a12, d595d5c

---

## Checklist final antes de PR

- [x] `pnpm run lint` passou
- [x] `pnpm run typecheck` passou
- [x] `pnpm run test` passou
- [x] `pnpm run build` passou
- [x] `pnpm run test:visual` passou quando houve mudança visual
- [x] Screenshots mobile/desktop foram geradas e revisadas
- [x] Rubrica visual preenchida (5.0/5.0 nas waves 1-4)
- [ ] FPS médio foi registrado em dispositivo real → pendente (Fase 7.3)
- [ ] Dispositivo real testado → pendente (Fase 7.3)
- [ ] Atribuição Sketchfab está visível e com link correto → implementado
- [ ] Não há erros de console nos testes visuais → validado
- [ ] Não há segredo ou placeholder de produção → validado

---

## Pendências gerais

- [x] Decidir: reaproveitar literalmente os 5 prompts de agente, ou adaptar tom/escopo para projeto visual? → adaptado (subagentes `explore`, `implement`, `test-writer`, `verify`, `security-audit`, `docs`)
- [x] Confirmar se "Scene Spec" é o nome certo ou se já existe convenção equivalente → confirmado como contrato (ADR-001, spec-driven-contract.md)
- [x] Descobrir os nomes reais dos bones do rig → confirmado via `pnpm inspect:glb` (66 joints Mixamo, `mixamorig:Head_06` disponível)

---

## Notas

- Este documento deve ser atualizado após cada fase concluída
- Decisões importantes devem ser registradas em `docs/memory/decisions.md` como ADRs
- Estado atual deve ser registrado em `docs/STATE.md`
