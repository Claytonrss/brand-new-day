# Progresso do Plano de Bootstrap — spiderman-landing

Este documento rastreia o progresso de execução do plano definido em `harness-bootstrap-plan.md`.

**Legenda:**
- `[ ]` — pendente
- `[~]` — em progresso
- `[x]` — concluído
- `[-]` — cancelado/não aplicável

**Última atualização:** 2026-09-09

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
- [x] Look Dev v3: não disparado por nota < 4; os itens em aberto da rubrica
      dependem de revisão humana (ver `docs/memory/tech-debt.md` e Wave G)
- [x] Aprovar visualmente a primeira dobra em mobile e desktop

**Critério de saída da Fase 3.2:**
- [x] Primeira dobra tem impacto visual aprovado
- [x] Câmera, luz, contraste e texto funcionam no mobile principal
- [x] Decisão consciente sobre nível de post-processing por perfil → ADR-007
      (adaptativo por tier) e Wave C (`?fx=off|subtle|full`)
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
- [x] 6.9 — Seção: FullBody → spec retroativa criada (PR #15)
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
- [x] Criar `tests/visual/reduced-motion.spec.ts` (recriado na Wave G — PR #29)
- [x] Criar `tests/visual/credits.spec.ts` (recriado na Wave G — PR #29)
- [x] Criar `tests/visual/console.spec.ts` + `budget.spec.ts` (Wave G — PR #29)
- [x] Configurar `playwright.config.ts` com viewports obrigatórios (390x844, 430x932, 1440x900)

### 7.3 — Validação visual humana

- [ ] Definir perguntas de aprovação estética → pendente
- [ ] Registrar aprovação humana no relatório de verify ou PR → pendente
- [ ] Validar FPS em dispositivo real (iPhone 12, Android mid-tier) → pendente
      (roteiro: abrir `?debug=1`, ler o HUD, rodar `PERF_FPS_ASSERT=1` se houver GPU)
- [x] Security audit (dependências, GLB source) → licenciamento CC-BY 4.0
      validado (Fase 6.11); atribuição verificada por teste na Wave G

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

- [x] Criar `.github/workflows/ci.yml` com gates locais (PR #30)
- [x] CI falha se `scripts/verify-all.sh` falhar (job `static` chama `pnpm verify`)
- [x] Artifacts de screenshots/logs preservados em falha (jobs `static` e `visual`)

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
- [x] Atribuição Sketchfab está visível e com link correto → verificada por teste (`credits.spec.ts`, Wave G)
- [x] Não há erros de console nos testes visuais → verificada por teste (`console.spec.ts`, Wave G)
- [x] Não há segredo ou placeholder de produção → validado (assets e código revisados)

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

---

## Waves de Movimento e Efeitos 3D (2026-09-09)

Plano mestre: `docs/plans/3d-motion-upgrade-plan.md`.
Diagnóstico que originou o plano: o GLB tem `animations: 0` e o único
movimento do personagem era 1 bone (cabeça); a câmera era interpolação linear
sem easing; as 4 scenes ficavam montadas permanentemente (~10 luzes, 3
emissores de sombra).

### Wave F — Headroom (PR #17, merged)

- [x] F1 — `LightRig` + `lightCues`: 6 slots permanentes, 1 emissor de sombra,
      sem sombra de point light (substitui as 4 scenes permanentes)
- [x] F2 — `PerfProbe` (`window.__perf`) + `PerfHud` (`?debug=1`)
- [x] F3 — dpr 1.75 / 1.25 / 1 + `QualityAdapter` aplicando perfil ao renderer
- [x] F4 — auditoria do asset: texturas ok (30 webp, 3.0 MB); peso é geometria
      não comprimida (~19 MB) → item **F4b**, fora desta wave
- [x] `BeatProvider` + `beats.ts` — fonte única de beat (ADR-008)
- [x] Testes unitários: `tests/unit/beat.test.ts`, `tests/unit/lighting.test.ts`

**Medições:** draw calls 118–120 → 44–46 (−62 %) · `programs` estável em 10 ·
triângulos/frame ~506 k → ~458 k. FPS não mensurável em headless (SwiftShader).

**Pendente:** FPS em dispositivo real · aprovação visual humana de
iluminação/impacto · F4b (GLB ≤ 15 MB).

### Wave B — Câmera cinematográfica (PR #19, merged)

- [x] B1 — `camera/cameraPath.ts`: curva única de Catmull-Rom (centripetal) +
      reparam. por beat + easing por beat
- [x] B2 — Arsenal: arco gerado em coordenadas esféricas (85° de azimute,
      baseline 0,2°)
- [x] B3 — FOV punch (±2°) e dolly lag (≤0.12) por `BeatState.velocity`
- [x] B4 — handheld noise fbm (3 oitavas) em posição e lookAt
- [x] B5 — `prefers-reduced-motion` com enquadramento estático por seção
      (fim do `fullBody` global)
- [x] `CameraRig` passa a consumir o `BeatProvider` (fim do ScrollTrigger duplicado)

**Medições:** pico de mudança de direção 133,9° → **62,1°** (−54 %) · p95 20,2° ·
órbita do Beat 3 **85°** · draw calls e `programs` inalterados.

**Pendente:** aprovação visual humana (evolution/arsenal no mobile mudaram
43–65 % dos pixels) · FPS em dispositivo real · recriar `console.spec.ts` e
`credits.spec.ts` (perdidos — nunca commitados).

### Wave A — Sujeito vivo (PR #21, merged)

- [x] A1 — `rig/rigBones.ts`: rest pose capturada em runtime + mapa semântico
- [x] A2 — camadas procedurais: respiração, sway, peso, tremor, pernas
- [x] A3 — head-tracking v2: slerp de quaternion, soft clamp, follow-through
- [x] A4 — `rig/poses.ts`: poses por beat com `POSE_AMPLITUDE`
- [x] A5 — não necessário (repose no Blender fica como plano B)

**Achado crítico:** o nome do joint no `useGLTF` é sanitizado
(`mixamorigHead_06`, sem `:`), então o head-tracking do Beat 1 nunca resolveu e
o modelo inteiro girava. Corrigido; 16 joints resolvidos.

**Medições:** follow-through 0,037 > 0,004 > 0,0006 · clamp de yaw em 0,48 rad ·
draw calls e `programs` inalterados · reduced-motion com diff de 0%.

**Pendente:** olho humano nas poses de Evolution/Arsenal (se cruzar geometria,
`POSE_AMPLITUDE = 0`) · FPS em dispositivo real.

### Wave C — Efeitos autorais (PR #23, merged)

- [x] C1 — `materials/suitShader.ts`: fresnel rim + teia procedural animada
- [x] C2 — `materials/lensShader.ts`: iridescência + pulso emissivo
- [x] C3 — `EffectsStack`: DOF com foco por beat + aberração cromática
- [x] C4 — Beat 2 com banda de luz no shader
- [x] C5 — `curateMaterials` por nome real (bug do `webshotter` corrigido)
- [x] Modos `?fx=off|subtle|full` (padrão `subtle`)

**Correções na wave:** DOF sem `focusRange` desfocava tudo; `uTime` animava sob
`reduced-motion`; brilho/metal reduzidos após review.

### P0 — Calibração (PR #24, merged)

- [x] Âncoras do mundo derivadas do esqueleto (`anchorStore`)
- [x] Correção da mira de Evolution (axila → peito) e Arsenal (lançador)
- [x] Pose do Arsenal: antebraço a ~63°, câmera abaixo do punho
- [x] Cabeça: bias da rest pose + limites assimétricos (0,36 dir / 0,30 esq,
      total ≤ 0,52 rad)
- [x] Easing linear nos beats intermediários (fim do para-e-anda)

**Pendente:** aprovação visual do enquadramento/pose · FPS real.

### Wave E — Atmosfera (PR #26, merged)

- [x] E1 — partículas em GPU (turbulência, 3 camadas de parallax, 1 draw call)
- [x] E2 — motas reagindo ao spotlight do Beat 2
- [x] E3 — `FogExp2` + dessaturação por profundidade

**Medições:** 1 draw call para toda a atmosfera · draw calls desktop 44 ·
`reduced-motion` com 0% de diff de pixels.

### Wave D — Interatividade (PR #26, merged)

- [x] D1 — arrastar orbita o modelo (±12°) com mola de retorno
- [x] D2 — giroscópio no mobile com calibração na primeira leitura
- [x] D3 — teia no Beat 3 (curva pendurada, 1 draw call) + tranco de lente
- [x] D4 — luz de recorte acompanha o cursor
- [x] Piscada estilizada com pálpebras E+D (`?blink=off|subtle|full|hold`) —
      aceite medido: 98,1% de queda dos pixels de lente no ápice

### Wave G — Verificação (nesta branch)

- [x] G1 — `budget.spec.ts`: draw calls ≤ 48, `programs` ≤ 24 e sem crescimento
      de programas no scroll (FPS real fica atrás de `PERF_FPS_ASSERT`)
- [x] G2 — `console.spec.ts` recriado (zero erro na carga e no scroll completo)
- [x] G3 — `credits.spec.ts` recriado (visível sem hover, link seguro)
- [x] G4 — evidência em vídeo por viewport (`pnpm evidence:motion`)
- [ ] G5 — atualizar a rubrica com as evidências novas

---

## Portfolio Impact Plan (2026-09-10)

Plano mestre: `docs/plans/portfolio-impact-plan.md`. Origem: auditoria pós-Wave
G com 24 screenshots reais em 3 viewports (`docs/evidence/portfolio-audit/`).
Objetivo: elevar de "demo de engine 3D" para "portfólio de alto impacto".

### Wave P0 — Correções de composição, tipografia e copy (bloqueante)

- [x] P0.1 — Arsenal mobile: copy fora do pulso/lançador (`ArsenalOverlay`)
- [x] P0.2 — FullBody mobile: título fora do peito/símbolo, sem cortar palavra
- [x] P0.3 — Tipografia desktop: quebra manual de linha (`SplitTextHeadline` com `\n`)
- [x] P0.4 — Copy FullBody volta ao storyboard + data de estreia (ADR-017)
- [x] P0.5 — Rubrica re-preenchida contra `docs/evidence/portfolio-audit-p0/` (bloqueantes ≥ 4)

**Evidência:** `docs/evidence/portfolio-audit-p0/` (24 screenshots, 3 viewports ×
8 pontos) gerada por `scripts/collect-portfolio-audit.mjs`.
**Rubrica:** média ponderada 4,2; bloqueantes 5/4/4 (`visual-rubric.md`).
**Pendente:** FPS em dispositivo real (Fase 7.3).

### Wave P1a — Primeira impressão

- [x] P1a.1 — Loader como teaser (`docs/specs/loader-teaser.md`)
      — direção A (lentes da máscara acendem com o progresso; 2D/SVG, sem draw
      call novo); evidência `docs/evidence/loader-teaser/`
- [x] P1a.2 — Opening title card / Beat 0 (`docs/specs/opening-title-card.md`)
      — card tipográfico 100vh reaproveitando a câmera Hero; página 700vh → 800vh;
      evidência `docs/evidence/opening-title-card/`

### Wave P1b — Fechamento / colofon (ADR-019)

- [x] P1b.1 — Seção final Colophon (`docs/specs/colophon-outro.md`)
      — autoria + stack + CTA único + CC-BY; modelo dissolve na névoa
      (gradiente da seção + cue de luz `colophon`); página 800vh → 900vh;
      evidência `docs/evidence/colophon-outro/`

### Wave P1c — Atmosfera por beat (ritmo)

- [x] P1c.1 — Assinatura de atmosfera por beat + crossfades
      (`docs/specs/atmosphere-per-beat.md`) — densidade/opacidade de partículas,
      névoa e grão dirigidos pelo `BeatProvider`; evidência
      `docs/evidence/atmosphere-per-beat/`

### Wave P2a — Arsenal macro + HUD

- [ ] P2a.1 — Câmera macro no lançador + HUD de anotação
      (`docs/specs/arsenal-macro-hud.md`)

### Wave P2b — Diferenciação de plataforma

- [ ] P2b.1 — Desktop: pointer parallax real
      (`docs/specs/desktop-pointer-parallax.md`)
- [ ] P2b.2 — Mobile: gyro com permissão iOS + fallback (ADR-018)
      (`docs/specs/mobile-gyro-permission.md`)

### Wave P3 — Micro-interação + robustez

- [ ] P3.1 — WebShoot descobrível (`docs/specs/web-shoot-discovery.md`)
- [ ] P3.2 — Fallback WebGL como poster editorial
      (`docs/specs/webgl-static-fallback.md`)
- [ ] P3.3 — Assets 2D via Higgsfield, sem vídeo (ADR-020)
