# Plano Pareto (80-20) — Fluidez + Momentos Assinatura

> **Status:** ✅ executado — Waves 1–5 mergeadas nos PRs #32–#37 (arquivado em 2026-09-13; pendências vivem em `PROGRESS.md`)
> **Data:** 2026-09-12 · **Revisão crítica:** 2026-09-12 (2ª passada, item a item)
> **Origem:** `docs/research/2026-09-12-brainstorm.md` (16 falhas + 30 ideias)
> **Princípio:** selecionar a minoria vital que produz a maioria da diferença
> percebida — priorizando (1) a queixa explícita de fluidez no mobile e
> (2) o impacto de portfólio nos primeiros segundos e no ritmo do scroll.

**Registro da 2ª revisão (self-audit):** 3 erros corrigidos —
(1) trigger do landing disparava atrás do opening card opaco (animação
invisível); (2) hard cut derrubado — destruía a assinatura contínua do Beat 3
por ganho marginal; (3) tier `balanced` era complexidade especulativa antes da
medição — substituído por threshold tweak data-gated. FALHA-04 verificada
ponta a ponta (`curateMaterials` seta cast+receive em todos os meshes).
Impactos de FALHA-05/06 rebaixados a "hygiene menor" (honestidade sobre
magnitude).

---

## 1. Lente de seleção

Duas perguntas, nesta ordem:

1. **"O usuário sente isso em toda sessão?"** → problemas de fluidez e bugs de
   interação sentem-se a cada scroll, em cada device mobile. Nada de novo
   conteúdo supera uma experiência que engasga.
2. **"Isso muda a primeira impressão ou o ritmo?"** → os critérios 1 e 2 do
   portfolio-impact-plan (reação nos 5s; scroll até o fim por variação).

Fora da seleção: tudo que é polish isolado de baixa visibilidade, precisa de
asset autoral novo, ou tem payoff incerto sem medição em device.

---

## 2. Matriz de seleção (prós × contras na escolha)

### Selecionados (a minoria vital)

| Item                                                                             | Ganho esperado                                                                                       | Custo     | Prós                                                                                                                                                                                                              | Contras (e por que entra mesmo assim)                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FALHA-01** tier inicial errado no mobile                                       | Provável causa nº 1 da falta de fluidez no S23                                                       | ~0,2 dia  | Fix mecânico; elimina dpr 1.75 + MSAA 4× + sombras do aparelho inteiro; resolve FALHA-11 de graça                                                                                                                 | Nenhum real — o quality-matrix já dizia "mobile = medium"; hoje o código é que não cumpre a própria spec                                                                                                                                |
| **FALHA-02** zona morta 30–45 fps                                                | Fecha o gap onde dispositivos médios possam estar                                                    | ~0,1 dia  | **Revisado:** em vez do tier `balanced` (complexidade especulativa antes da medição), basta um threshold mobile-only (medium→low < ~40 fps no touch) — 1 linha + teste                                            | Cliff medium→low maior que um tier intermediário — só vale se a Wave 0 mostrar devices no gap; **data-gated**                                                                                                                           |
| **FALHA-04** shadow map por frame                                                | Remove um passe completo de skinning (~500k tris) no medium                                          | ~0,2 dia  | **Verificado ponta a ponta:** `curateMaterials.ts:57-58` seta cast+receive em todos os meshes → o passe existe e a sombra é visível (self-shadow no traje); sujeito quase estático → 10 Hz é visualmente idêntica | Sombra defasada durante drag/gyro — mitigado com needsUpdate imediato nos eventos                                                                                                                                                       |
| **FALHA-05** ProgressBar por scroll event                                        | Main thread mais limpa durante o scroll                                                              | ~0,1 dia  | Trivial; remove layout thrash read/write por frame                                                                                                                                                                | **Impacto honesto (rebaixado):** é 1 componente pequeno — hygiene real, não silver bullet de fluidez; manter ARIA correto (throttle no `aria-valuenow`)                                                                                 |
| **FALHA-06** will-change permanente                                              | Menos layers/memória no compositor mobile                                                            | ~0,05 dia | **Fix simplificado (revisado):** remover `will-change` dos chars entirely — browsers promovem layers por heurística durante a animação; a dança onStart/onComplete era complexidade desnecessária                 | **Impacto honesto (rebaixado):** ~143 spans pequenos ≈ ~1 MB de layers — melhoria modesta de memória/compositing                                                                                                                        |
| **FALHA-08** HDR via CDN                                                         | Elimina modo de falha catastrófico (loader travado / fallback sem motivo)                            | ~0,2 dia  | Portfolio vive de link compartilhado; determinismo do loader                                                                                                                                                      | +~1,5 MB em `public/` (load não é prioridade); licença do HDRI a documentar em ADR (Polyhaven = CC0)                                                                                                                                    |
| **FALHA-12/13** web-shot: gate errado + tap×drag                                 | Consistência sinal↔comportamento                                                                     | ~0,2 dia  | O hint promete e o toque não entrega hoje — bug de UX puro                                                                                                                                                        | Nenhum; o tiro é 1 draw call, não justifica tier high                                                                                                                                                                                   |
| **IDEIA-3D-01** A chegada (landing)                                              | Momento assinatura no reveal do Hero — critério dos 5s                                               | ~0,7 dia  | Reusa `Spring`, FOV punch e pose-springs existentes; custo runtime desprezível; **trigger corrigido (ver contras)**                                                                                               | **Erro do rascunho corrigido:** o fim do fade do loader deixa o modelo **atrás do opening card opaco** — o landing disparado ali seria invisível. Trigger correto: entrada do Hero no viewport (ScrollTrigger once, ao levantar o card) |
| **IDEIA-3D-04** Lean por velocidade de scroll                                    | O corpo reage à ação que o usuário mais faz                                                          | ~0,3 dia  | `velocity` já existe no beat state; caminho aditivo já existe                                                                                                                                                     | Compounding com FOV punch + dolly lag (os 3 reagem à velocidade) — calibrar amplitudes juntas em device (clamp ~2–3°)                                                                                                                   |
| **IDEIA-PAG-05** Acento de beat no chrome DOM                                    | Página inteira coesa com a atmosfera 3D por beat                                                     | ~0,2 dia  | CSS var + `data-beat`; custo zero; multiplica o valor da atmosfera por beat já entregue (P1c.1)                                                                                                                   | Risco de violar a paleta se aplicado largo — spec restringe a rules/bordas/HUD/selection                                                                                                                                                |
| **IDEIA-AMB-04** Chapter cards como impressão (halftone + misregistration + fio) | Ataca o ponto fraco conhecido (transições estáticas — item #10 da auditoria antiga, nunca resolvido) | ~0,5 dia  | CSS puro; identidade de quadrinho impresso; distingue as transições do 3D                                                                                                                                         | Halftone em excesso barateia — opacity ≤ 0,06 no spec; `bg-ink` sólido permanece (contraste editorial com as seções 3D)                                                                                                                 |

### Rejeitados (a maioria trivial — e por quê)

| Item                                                                       | Por que ficou de fora                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IDEIA-3D-03** hard cut no Arsenal                                        | **Erro de julgamento do rascunho, derrubado na 2ª revisão:** a ideia soa bem ("ritmo de trailer") mas (1) qualquer corte visível precisa estar dentro de um beat transparente, e os beats têm assinaturas **contínuas por design** (ADR-011, calibração P0) — cortar o Arsenal no t≈0,42 destruiria exatamente a órbita + push macro que o P2a.1 construiu; (2) os boundaries entre beats já são "cortes ocultos" de graça (a câmera reposiciona atrás do chapter card coberto); (3) a queixa original de "monotonia" já foi atacada pela atmosfera por beat (P1c.1). Ganho marginal, risco real de piorar                                                                                                                                                                                                                                                                                                                                                                                |
| **FALHA-03** render gating quando coberto                                  | **Cortado após challenge (2026-09-12):** dois problemas. (1) O risco de flicker é real: canvas pausado mantém o **último frame** (não fica preto), então um resume tardio num fling mostra um frame stale de enquadramento errado por 1–2 frames antes do jump — e o `resumeSnap` planejado transformaria o catch-up suave do lerp numa descontinuidade visível. (2) A estimativa "~44% do scroll coberto" estava **errada**: os chapter cards têm `h-dvh` numa viewport de ~`100dvh`, então cobertura total é um instante durante o trânsito, não uma faixa — num fling (o cenário do flicker) não há nada para pausar de qualquer forma. As janelas reais (loader + repouso sobre cards) valem pouco: pausar durante o load empurra a compilação de shaders (~200–600 ms) para dentro do fade do reveal. Uma variante segura existe (pausar só em repouso com resume em `touchstart`/`wheel`, que precedem o movimento) mas o ganho não paga o risco agora — ver gatilho de reavaliação |
| FALHA-10 touch smoothing (`syncTouch`)                                     | Payoff incerto e trade-off real (latência de input); só faz sentido medir DEPOIS das waves de perf — se a queixa persistir com FPS bom, entra como experimento                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| FALHA-14 variantes GLB no mobile                                           | Exige verificação de paridade de materiais + churn de baseline dos testes visuais; ganho vem depois de 01/02/03/04                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| FALHA-07 (parcial) GC churn completo                                       | Só o pedaço barato entra (memo de `targetFor` no LightRig, ~360 obj/s); o resto é micro-otimização com payoff menor que qualquer item selecionado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| FALHA-15/16 (drive-bys)                                                    | Entram como bônus de 10 linhas dentro dos PRs das waves 1 e 3 — não justificam wave própria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| IDEIA-3D-02 dedos                                                          | Visibilidade limitada fora do macro do Arsenal; depende de verificação de nomes de bones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| IDEIA-3D-07 contraposto, 3D-08 PiP, 3D-05 pupilas, 3D-06 fio, 3D-09, 3D-10 | Cada uma é polish incremental; competem pela mesma atenção que 3D-01/03 e perdem no custo-benefício                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| IDEIA-AMB-02/03 skyline                                                    | Asset autoral novo + risco contra "o personagem é o primeiro sinal visual"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| IDEIA-AMB-06 áudio                                                         | Asset externo + política de autoplay + decisão de tom — projeto separado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Bundle micro-polish (PAG-01/02/06/07/08/09/10, AMB-01/05/07/08/09/10)      | 80% do esforço total da lista para <20% do valor; colher depois, se sobrar energia                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

---

## 3. Waves de execução

Ordem por dependência e risco (perf antes dos momentos — o landing acontece
exatamente na janela que hoje está sobrecarregada no mobile).

### Wave 0 — Baseline de medição (sem PR)

Medir antes de mexer, no S23 com `?debug=1`:

1. Parado no hero: `fps/ms/calls/triangles/programs` via `window.__perf`.
2. Roldagem contínua (hero → fim): mesmas métricas + momento do tier pop.
3. Sobre os chapter cards: fps durante o scroll coberto.
4. `?fx=off` A/B para isolar a camada de material.

Saída: números "antes" para o corpo dos PRs (regra de ouro de evidência) e
confirmação do diagnóstico (FPS-bound vs main-thread-bound).

**Decisões que dependem da Wave 0:**

- Se o fps no tier high estiver ≥ 55: a FALHA-01 continua sendo bug (spec
  mobile = medium), mas a expectativa de ganho em fluidez baixa — e a queixa
  provavelmente é input-feel (voltar à FALHA-10).
- Se o fps pós-fix no medium estiver na faixa 35–44: ativa o threshold tweak
  da FALHA-02. Se ≥ 50: FALHA-02 fica congelada.

---

### Wave 1 — PERF-A: tier correto + main thread limpa

**Branch:** `fix/mobile-tier-policy` · **Estimativa:** 0,5 dia
**Itens:** FALHA-01, FALHA-05, FALHA-06, FALHA-09 (mitigação),
drive-bys FALHA-07a (memo LightRig), FALHA-15, FALHA-16.
FALHA-02 vira **threshold tweak condicional** aplicado só se a Wave 0 mostrar
devices na faixa 35–44 fps (decisão registrada acima).

**Implementação:**

1. **Tier inicial síncrono** (`PerformanceMonitor.tsx`): trocar o inicializador
   que depende do estado do hook por leitura direta de
   `window.matchMedia('(max-width: 767px)').matches` /
   `'(prefers-reduced-motion: reduce)'` dentro do lazy initializer (componente
   é client-only; guardar `typeof window`). Os hooks continuam para mudanças
   reativas (resize/reduced-motion).
2. **FALHA-02 (se ativada pela Wave 0):** threshold mobile-only para
   medium→low (< ~40 fps com pointer coarse / maxTouchPoints > 0) — sem novo
   perfil, sem tocar os gates por tier. Atualizar `budget.spec.ts` só se o
   threshold mudar comportamento testável.
3. **Degradação adia para scroll idle** (FALHA-09): no tick de 1 s, só aplicar
   degradação se `|state.velocity| < 0.02` ou loader cobrindo — evita pop no
   meio do movimento; quando parado, aplica e o usuário não está olhando
   movimento.
4. **ProgressBar** (`ProgressBar.tsx`): rAF-throttle; barra cheia com
   `transform: scaleY(p)` (origin top) em vez de `height`; altura do documento
   cacheada no resize; `aria-valuenow` atualizado a ≤5 Hz. Paridade visual
   mantida (mesma barra de 1 px na borda direita).
5. **will-change** (`SplitTextHeadline.tsx`, `ChapterCard.tsx`): **remover o
   `will-change` dos chars** (o browser promove layers por heurística durante
   a animação de transform; o hint permanente só custa memória). Se a evidência
   mostrar raster jank nos reveals, reintroduzir escopado (onStart →
   clearProps no onComplete) como fallback.
6. **Drive-bys:** memo de `targetFor(slot, beat)` em cache `Map` no LightRig;
   `LenisProvider` guarda a referência do ticker p/ remover no cleanup;
   `SpiderManModel` troca `restRef.current` por `useState` populado no effect
   (remove a fragilidade do closure vazio).

**Aceite:**

- No S23 (`?debug=1`): tier inicial `medium` (nunca `high`); fps no scroll
  ≥ 50 (alvo 55+); nenhum commit React durante scroll estabilizado
  (React Profiler).
- `budget.spec.ts` refletindo o threshold mobile (se ativado); `pnpm verify`
  verde; screenshots
  390/430/1440 sem regressão de composição; rubrica re-preenchida (≥4
  bloqueantes).

---

### Wave 2 — PERF-B: shadow throttle

**Branch:** `feat/shadow-throttle` · **Estimativa:** 0,2–0,3 dia
**Itens:** FALHA-04
**Independente da Wave 1** (pode paralelizar)

> **Nota de revisão (2026-09-12):** esta wave originalmente continha o render
> gating da FALHA-03, cortado após challenge — o risco de flicker em fling é
> real (frame stale + descontinuidade no resume) e a janela de cobertura total
> é muito menor que o estimado (cards `h-dvh` numa viewport `100dvh` só cobrem
> tudo num instante de trânsito). Detalhes na matriz de rejeitados.

**Implementação:**

1. **Shadow throttle** (`QualityAdapter`): `high` → `autoUpdate: true`;
   `medium` → `autoUpdate: false` + `needsUpdate = true` a 10 Hz
   (contador no useFrame) e imediato em: mudança de beat, `INTERACTION.dragging`
   ativo, delta de gyro acima de threshold.

**Aceite:**

- S23 (`?debug=1`): no tier medium, `gl.info.render.calls` no vale do passe
  de sombra cai ~metade nos frames entre atualizações (instrumentar via
  `window.__perf`); nenhuma sombra visivelmente defasada durante drag (vídeo);
  `pnpm verify` + screenshots 3 viewports.

**Risco monitorado:** stale shadow em interações não cobertas pelos gatilhos —
cobrir com needsUpdate também no release do drag e no fim do fling de scroll
(velocity cruza zero).

---

### Wave 3 — FIX: loader determinístico + web-shot honesto

**Branch:** `fix/loader-determinism` · **Estimativa:** 0,5 dia
**Itens:** FALHA-08, FALHA-12, FALHA-13

**Implementação:**

1. **HDR self-host:** baixar `potsdamer_platz_1k.hdr` (Polyhaven, CC0) para
   `public/env/city_1k.hdr`; `Environment` passa de `preset="city"` para
   `files="/env/city_1k.hdr"`. Loader passa a depender só de assets locais.
   ADR-021 documenta origem/licença.
2. **Gates do web-shot alinhados** (`useInteraction.ts`, `WebShootHint.tsx`):
   tiro permitido em `tier !== 'low'` (hoje: só high) — mesmo gate do hint.
3. **Tap × drag** (`useInteraction.ts`): tiro dispara no `pointerup` com
   deslocamento < 8 px e duração < 300 ms (extrair classificador puro
   `isTap(down, up)` para unit test). Drag continua no pointerdown/move.

**Aceite:**

- Modo avião (fresh load): loader completa e experiência funciona (GLB e HDR
  locais); sem erro de console.
- Mobile medium: anel pulsa → toque dispara a teia (vídeo); drag não dispara
  tiro; unit tests do classificador; `pnpm verify` + evidências.

---

### Wave 4 — SIG: momentos assinatura

**Branch:** `feat/arrival-landing` + `feat/velocity-lean` · **Estimativa:** 1 dia
**Itens:** IDEIA-3D-01, IDEIA-3D-04 (hard cut **removido** na 2ª revisão — ver matriz de rejeitados)
**Depende de:** Wave 1 (headroom no reveal do mobile)
**Specs primeiro** (contrato dirigido pela workflow): `arrival-landing.md`,
`velocity-lean.md`.

**PR 4a — A chegada (`feat/arrival-landing`):**

1. **Trigger corrigido (2ª revisão):** o fim do fade do loader revela o
   **opening title card** (opaco), não o modelo — disparar ali seria
   animação invisível. Trigger correto: entrada do Hero no viewport
   (ScrollTrigger `once` no topo da seção Hero), ou seja, o landing acontece
   **enquanto o card levanta** — o reveal do modelo É o pouso.
   - Edge: usuário que entra na página já rolando rápido (scroll restoration
     ou link com anchor) — se o hero já está visível no primeiro frame após
     `loaded`, disparar imediatamente; nunca disparar atrás de seção opaca.
2. Coreografia (~0,45 s): grupo do modelo desce de `y +0,6` com `Spring`
   (k≈9, overshoot 4–6%); pose transitória "landing" (flexão de
   hips/joelhos ~6–8°) decai para rest pelos pose-springs existentes;
   câmera: kick vertical 0,08 + FOV punch −2 assentando pelo acoplamento de
   velocidade existente. **Sem braços** (evita interpenetração — risco
   mapeado no plano anterior).
3. `prefers-reduced-motion`: nada acontece (estátua por design). Custo =
   ossos, desprezível em qualquer tier.
4. Amplitudes como constantes nomeadas no spec (calibráveis em Look Dev).

**PR 4b — Velocity lean (`feat/velocity-lean`):**

1. **Lean por velocidade** (`useProceduralRig`): novo par de springs alvo
   `clamp(velocity × K)` aplicado como pitch em `spine1/spine2` + leve elevação
   de ombros; amplitude máxima 2–3°; 0 em reduced-motion. `stateRef` passa a
   ser consumido pelo rig (context já expõe).
2. **Calibração conjunta:** o lean soma-se ao FOV punch e ao dolly lag (três
   efeitos acoplados à velocidade) — validar os três juntos em device para
   não virar "wobble"; se compitar, reduzir o lean primeiro (é o mais
   prescindível dos três).

**Aceite:**

- `motion.spec.ts`: landing decai para rest (quaternion → identidade do
  offset) e NÃO dispara enquanto o opening card cobre o viewport; lean segue
  o sinal da velocidade e é clampado.
- Vídeo por viewport (`pnpm evidence:motion`); rubrica: primeira dobra ≥ 5;
  sem regressão mobile (fps no S23 re-medido).
- Screenshots 390/430/1440; `pnpm verify`.

---

### Wave 5 — POL: coesão de beat + transições impressas

**Branch:** `feat/beat-chrome` + `feat/chapter-print` (podem ser 1 PR)
**Estimativa:** 0,5–1 dia · **Itens:** IDEIA-PAG-05, IDEIA-AMB-04

**Implementação:**

1. **Acento de beat no DOM:** `BeatProvider` publica `data-beat` no `<main>` e
   uma CSS var `--beat-accent` (mapa beat→token da paleta: hero `steel`,
   evolution `oxide`, arsenal `signal`, fullBody `paper/60`, colophon `dim`).
   Aplicação restrita: hairlines do HUD do Arsenal, kicker rules, borda do
   chip de gyro, `::selection`. Nada de fundos/texto coloridos (bible).
2. **Chapter cards impressos:** overlay halftone (radial-gradient pattern,
   opacity ≤ 0,06), misregistration estático no título (text-shadow 1 px
   `oxide`/`steel` a ~25%), e um fio de teia SVG diagonal que se desenha uma
   vez na entrada (stroke-dashoffset; estado final estático em
   reduced-motion). `bg-ink` sólido permanece (contraste editorial).

**Aceite:** screenshots 390/430/1440 dos 2 cards; rubrica ≥ 4 nos
bloqueantes; `reduced-motion` mostra estado final sem animação; `pnpm verify`.

---

## 4. Ordem, dependências e gates

```
Wave 0 (medição S23)
  └► Wave 1 PERF-A ──► Wave 4 SIG (reveal com headroom no mobile)
        │
        └► Wave 2 PERF-B (independente; pode paralelizar com 3)
        └► Wave 3 FIX (independente)
Wave 5 POL (independente; qualquer momento após 1)
```

- Todo PR: `bash scripts/verify-all.sh` + rubrica ≥ 4 (bloqueantes) +
  screenshots 390/430/1440 + evidência específica da wave (números de FPS,
  vídeo, ou modo avião) — regra de ouro do projeto.
- Specs em `docs/specs/` antes de cada PR da Wave 4/5 (workflow dirigido por
  spec); ADRs: ADR-021 (HDR self-host), ADR-022 (política de tier inicial
  síncrona + threshold mobile), ADR-023 (shadow throttle).
- Ao final: sync de `PROGRESS.md` / `docs/STATE.md`.

## 5. Métricas globais de aceite

| Métrica                                      | Alvo                          | Medição                       |
| -------------------------------------------- | ----------------------------- | ----------------------------- |
| FPS no S23 (scroll contínuo, `?debug=1`)     | ≥ 50 estável (alvo 55)        | PerfHud antes/depois          |
| Tier inicial no mobile                       | `medium` (nunca `high`)       | `?debug=1` no load            |
| Commits React em scroll estabilizado         | 0                             | React Profiler                |
| Draw calls no medium entre updates de sombra | queda visível vs baseline     | `window.__perf`               |
| Loader em modo avião                         | completa, 0 erros de console  | smoke manual                  |
| Mobile medium: toque no Arsenal              | dispara a teia (hint honesto) | vídeo                         |
| Rubrica — primeira dobra                     | ≥ 5                           | rubrica real contra evidência |
| Rubrica média ponderada                      | ≥ 4,5                         | idem                          |

## 6. Gatilhos de reavaliação (itens rejeitados que voltam)

- **FALHA-03 (render gating, variante segura):** apenas se, após Waves 1–2,
  medição de térmica/bateria em device mostrar que o duty cycle em repouso
  sobre seções opacas ainda dói — e aí **somente** na versão pause-em-repouso
  com resume em `touchstart`/`wheel` (eventos de input precedem qualquer
  movimento de pixel, eliminando a janela de flicker).
- **FALHA-10 (syncTouch):** se após Waves 1–2 o FPS do S23 estiver ≥ 55 e a
  queixa de "feel" persistir → experimento isolado em device.
- **FALHA-14 (GLB leve no mobile):** se o tier medium ainda não segurar
  ≥ 45 fps
  em devices médios → verificar paridade das variantes e adotar.
- **Micro-polish (ticker, teias de canto, áudio…):** só após Wave 5, como
  fila separada de baixo risco.
