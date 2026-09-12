# Brainstorm & Falhas — 2026-09-12

> Sessão livre (não é auditoria formal nem plano priorizado). Volume de ideias e
> mapeamento de problemas; curadoria vem depois.

## Metadata

- **Data:** 2026-09-12
- **Escopo desta rodada:**
  1. Pontos de falha (bugs visuais, transições, polimento) com investigação
     dedicada de **fluidez no mobile** (Galaxy S23 — frame rate, não load time).
  2. Brainstorm em três frentes: vida do modelo 3D, animação de elementos de
     página, ambientação Spider-Man — **apenas ideias que não existem hoje**.
- **Commits revisados:** `3bd324a` (HEAD, merge PR #31) e o histórico
  `1291d2f…3bd324a` — todas as ondas P0–P3.2 do
  `docs/plans/portfolio-impact-plan.md` já entregues (só P3.3 pendente) e as
  waves A–G do `docs/plans/3d-motion-upgrade-plan.md` merged. As ideias abaixo
  foram cruzadas contra esses dois planos para não repetir o já mapeado/aplicado.
- **Assets inventariados:** `public/models/` tem **três** GLBs — o `v2.glb`
  (22,4 MB, único referenciado no código) e as variantes `-512.glb` e
  `-webp1024.glb` **sem nenhuma referência no src** (ver FALHA-14);
  `public/basis/` (transcoder KTX2), `fallback-poster-{desktop,mobile}.png`
  (usados pelo `StaticFallback`). Não há sons, HDRs locais nem SVGs de
  ambientação no projeto — qualquer ideia desse tipo parte do zero.
- **Dependências:** nenhuma ideia abaixo exige pacote novo, exceto onde marcado
  (a maioria é Three.js puro, CSS/SVG ou WebAudio nativo).

---

## Pontos de falha

### Investigação dedicada — fluidez no mobile (S23)

Os itens FALHA-01…FALHA-11 formam o diagnóstico da "animação menos fluida no
mobile". Suspeito que a causa dominante seja **FALHA-01 + FALHA-02** (tier
errado + zona morta de adaptação), com contribuição de FALHA-03/04 (trabalho
GPU desperdiçado) e FALHA-05/06/07 (custo de main thread).

**Roteiro de confirmação no dispositivo** (antes de qualquer fix):
`?debug=1` no S23 e ler `window.__perf` / `PerfHud` em três momentos —
(a) parado no hero, (b) rolando continuamente, (c) sobre os chapter cards.
Comparar `fps`, `ms`, `calls`, `triangles` e `programs`. Se `fps` cai só
rolando e `calls/triangles` estão estáveis, é fill-rate/tier (FALHA-01/02/04);
se `ms` do frame JS (React) acompanha a queda, é main thread (FALHA-05/06/07).
Cobrir também o teste A/B `?fx=off` para isolar o custo da camada de material.

---

**FALHA-01 — Mobile inicia (e possivelmente passa a sessão toda) no tier `high`**
- **Onde:** `src/components/3d/PerformanceMonitor.tsx` + `src/hooks/useMediaQuery.ts`
- `useMediaQuery` é SSR-safe (`false` inicial) e o tier inicial é computado
  **uma única vez** no inicializador do `useState`, durante o primeiro render —
  quando `isMobile` ainda é `false`. O flip de `isMobile` após o mount **não
  re-avalia o tier** (só `prefers-reduced-motion` tem effect de correção).
- Consequência no S23: os primeiros ~2–3 s (warmup de 120 frames + janela de
  1 s) rodam a **dpr 1.75 (~2× os pixels do medium) + MSAA 4× + sombras + 420
  partículas** — exatamente na janela do reveal pós-loader.
- Agravante: se o S23 segurar ≥ 45 fps no high (plausível, é Adreno 740), ele
  **nunca degrada** — sessão inteira no tier máximo. É o candidato nº 1 para
  "mobile menos fluido mesmo em aparelho potente".

**FALHA-02 — Zona morta de adaptação: 30–45 fps no mobile não degrada nada**
- **Onde:** `PerformanceMonitor.tsx` (thresholds 45/30) + `qualityContext.ts`
- Mesmo quando degrada para `medium`, o degrau seguinte só acontece abaixo de
  30 fps. Um device cravado em 35–44 fps fica eternamente com **sombras +
  180 partículas + bloom**, sem nunca aliviar — e o `medium` mantém
  `shadows: true`, que custa um passe completo de skinning (ver FALHA-04).
- Não existe perfil intermediário mobile (ex.: dpr 1.1, sombras off, 90
  partículas) entre medium e low.

**FALHA-03 — Canvas renderiza a custo total enquanto está 100% coberto (~44% do scroll)**
> **Correção (2026-09-12, após challenge):** a estimativa de cobertura acima
> está **inflada**. Os chapter cards e o opening têm `h-dvh` numa viewport de
> ~`100dvh` — cobertura *total* do viewport só existe num instante durante o
> trânsito (e em repouso sobre o card); num fling, a cobertura média é
> parcial (~50%), o que não permite pausar o render. As janelas reais de
> cobertura sustentada são: o loader (overlay fixo) e o repouso sobre seções
> opacas. Além disso, pausar traz risco real de flicker (frame stale no
> resume tardio; descontinuidade se houver snap) e empurraria a compilação de
> shaders para dentro do fade do reveal se pausado durante o load. Item
> reclassificado como **não prioritário**; uma variante segura (pause só em
> repouso + resume em `touchstart`/`wheel`, que precedem o movimento) ficou
> como gatilho de reavaliação no `docs/plans/pareto-impact-plan.md`.
- **Onde:** `App.tsx` (estrutura) + `OpeningTitleCard`/`ChapterCard`/`ColophonSection` (seções opacas `bg-ink`)
- Opening (100vh) + 2 chapter cards (100vh cada) + colophon (gradiente chega a
  98% de opacidade a 28% da seção) ≈ **400vh dos 900vh** com o canvas fixo
  totalmente encoberto — e mesmo assim renderizando ~500k triângulos, sombras
  e pós por frame. O mesmo vale durante o `CinematicLoader` (cobre tudo
  enquanto o 3D queima GPU no tier alto).
- No mobile isso compete com o scroll exatamente onde o usuário está rolando
  sobre cards de texto. Fix: gate de render (IntersectionObserver nas seções
  opacas → `frameloop="never"` ou early-return), com resume antecipado pela
  direção do scroll antes de descobrir.

**FALHA-04 — Shadow map re-renderiza o modelo skinned a cada frame sem necessidade**
- **Onde:** `LightRig.tsx` (directional 512, único caster) + `qualityContext.ts` (`medium.shadows: true`)
- Sujeito quase estático + luz-chave fixa por beat ⇒ o shadow map quase não
  muda entre frames, mas é recomputado com o mesh inteiro (a documentação do
  headroom registra ~458–506k triângulos/frame — o passe de sombra duplica o
  custo de skinning). Fix: `shadowMap.autoUpdate = false` +
  `needsUpdate` sob demanda (troca de beat, release do drag, delta de gyro
  acima de threshold), ou `castShadow` só no tier high.

**FALHA-05 — ProgressBar faz `setState` por evento de scroll + transition de `height`**
- **Onde:** `src/components/ui/ProgressBar.tsx`
- Cada scroll event → `setProgress` → re-render React + write de
  `style.height` com transition de 150 ms (height = layout) + leitura de
  `document.documentElement.scrollHeight` por evento ⇒ layout thrash
  (read/write intercalado) a cada frame de scroll no mobile, com a GPU já
  saturada. Fix: `transform: scaleY` em barra de altura cheia (compositor),
  cache da altura do documento no resize, atualizar ARIA throttled.

**FALHA-06 — `will-change: transform` permanente em centenas de spans**
- **Onde:** `SplitTextHeadline.tsx` + `ChapterCard.tsx`
- Cada caractere vira `<span>` com `will-change` fixo; **todas** as seções
  estão no DOM ao mesmo tempo ⇒ dezenas/centenas de layers promovidas no
  compositor mobile (memória + custo de compositing), mesmo muito depois da
  animação de entrada terminar. Fix: `clearProps`/remover `will-change` no
  `onComplete` da animação.

**FALHA-07 — Alocações por frame no caminho quente (GC churn = micro-stutters)**
- **Onde:** `LightRig.tsx` (`targetFor` cria `{ ...slot.base, ...override }`
  por slot por frame ≈ 360 obj/s), `useProceduralRig.ts` (`Object.entries`
  ×2 por frame + `headSprings.find` por bone), `useInteraction.ts` (literal
  de `gyroTarget` por frame), `WebShoot.tsx` (`webStrandPoints` cria array de
  Vector3 por frame durante o tiro).
- Individualmente barato; somado, força minor-GCs periódicos que no mobile
  aparecem como stutter irregular. Fix: memoizar cues por (slot, beat),
  iterar um array estático de roles, reusar objetos scratch.

**FALHA-08 — `Environment preset="city"` depende de CDN externa em runtime** *(precisa verificar o modo exato de falha)*
- **Onde:** `CanvasContainer.tsx` + drei `useEnvironment` (confirmado no
  `node_modules`: baixa `potsdamer_platz_1k.hdr` de
  `raw.githack.com/pmndrs/drei-assets`).
- O HDR conta no `useProgress` — o loader espera a CDN. Offline/CDN
  bloqueada pode (a) travar o loader em <100% ou (b) derrubar no
  ErrorBoundary → poster estático mesmo com WebGL funcionando. Fix:
  self-host do `.hdr` em `public/`.

**FALHA-09 — Transições de tier de qualidade são "pops" instantâneos**
- **Onde:** `QualityAdapter` + `EffectsStack` (multisampling 4→0, dpr
  1.75→1.25 num frame só, desmonte de efeitos).
- Quando a degradação acontece (~2–3 s após o reveal), a mudança de
  resolução/MSAA é visível como um degrau — quebra a sensação de polimento
  mesmo sendo "tecnicamente correto". Ideal: decidir o tier final ainda sob
  o loader (esconder a transição) ou degradar em passos animados.

**FALHA-10 — Scroll touch sem suavização: parte do "feel" menos fluido é input, não só FPS** *(precisa verificar em device)*
- **Onde:** `LenisProvider.tsx` — `syncTouch` não habilitado (default false)
  ⇒ touch usa scroll nativo; desktop tem `smoothWheel` + easing.
- Mesmo com FPS idêntico, o input mobile vem em passos discretos de touchmove
  enquanto o desktop é contínuo — a câmera lerp (k=2) mascara parte, mas não
  tudo. Testar `syncTouch: true` com `syncTouchLerp` moderado no S23
  (trade-off: latência de input); alternativa é subir o k do lerp só no touch.

**FALHA-11 — Janela inicial `dpr={[1,2]}` renderiza a 2.0 no S23 antes do adapter**
- **Onde:** `CanvasContainer.tsx` — os primeiros frames (antes do efeito do
  `QualityAdapter`) rodam a dpr 2 num aparelho dpr 3. Janela curta, mas no
  pior momento (durante o load/reveal). Menor prioridade; some com o fix da
  FALHA-01 se o tier for decidido antes da primeira renderização pesada.

### Outros pontos de falha

**FALHA-12 — Gesto do web-shot no tier errado: o hint promete, o clique não entrega**
- **Onde:** `useInteraction.ts` (tiro exige `profile.tier === 'high'`) vs
  `WebShootHint.tsx` (anel pulsante para `tier !== 'low'`).
- No mobile — que roda em `medium` — o anel de descoberta pulsa sobre o
  pulso, mas o toque **não dispara nada**. Mesmo num desktop degradado para
  medium. Inconsistência direta entre sinal e comportamento; corrigir
  alinhando os gates (o tiro é 1 draw call, não justifica tier high).

**FALHA-13 — Toque no mobile durante o Arsenal dispara tiro E drag simultaneamente**
- **Onde:** `useInteraction.ts` — ambos os handlers escutam `pointerdown` na
  janela; um tap-que-vira-drag no Beat 3 solta a teia e orbita o modelo ao
  mesmo tempo. Pequeno, mas perceptível como "comportamento duplo".

**FALHA-14 — Variantes otimizadas do GLB existem e não são usadas**
- **Onde:** `public/models/*-512.glb` e `*-webp1024.glb` sem nenhuma
  referência no código (`grep` confirma). No mobile, texturas 1024+ sobram
  para ~390 CSS px a dpr 1.25 — usar a variante leve no tier mobile reduz
  memória GPU e sampling. *(precisa verificar paridade de materiais entre as
  variantes antes de adotar)*

**FALHA-15 — Cleanup do Lenis nunca remove o ticker do gsap**
- **Onde:** `LenisProvider.tsx` — `gsap.ticker.remove` recebe uma arrow
  function **nova** (referência diferente da adicionada). Hoje inócuo (o App
  não desmonta), mas vaza em testes/HMR.

**FALHA-16 — Padrão frágil: rest pose chega ao rig como valor de render** *(precisa verificar)*
- **Onde:** `SpiderManModel.tsx` passa `rest: restRef.current` (Map vazio no
  render da resolução do Suspense). Funciona hoje só porque o flip de
  `loaded` no `App` re-renderiza a árvore **depois** do efeito que captura a
  pose — o `if (rest.size === 0) return` do rig é o sintoma silencioso.
  Qualquer refator que remova esse re-render congela o modelo sem erro.
  Fix barato: `useState`/`useMemo` para o Map em vez de ref lida em render.

---

## Ideias de brainstorm

### a) Animação do modelo 3D (sem clipes)

| ID | Título | Descrição | Complexidade | Dep nova |
|---|---|---|---|---|
| IDEIA-3D-01 | **A chegada (landing)** | Ao fim do loader, o modelo "pousa" no frame: queda curta amortecida por springs em hips/joelhos + kick vertical de câmera e recuo de FOV — como se tivesse acabado de aterrissar na teia | médio | — |
| IDEIA-3D-02 | **Dedos procedurais** | O rig usa 16 joints mas o esqueleto tem 66 (Mixamo com dedos): curl lento por noise + punho que fecha no instante do web-shot | médio | — (verificar nomes dos bones de dedo) |
| IDEIA-3D-03 | **Um cut autoral** | Um único hard cut na experiência (ex.: chapter2 → Arsenal: close da lente → corte seco → macro do lançador) — quebrar deliberadamente a curva contínua cria ritmo de trailer | simples | — |
| IDEIA-3D-04 | **Contra-movimento por velocidade de scroll** | Hoje `velocity` só afeta FOV/dolly; estender para lean de tronco/ombros — o corpo "resiste" ao scroll rápido e reassenta quando para | simples-médio | — |
| IDEIA-3D-05 | **Olhar na lente (pupilas shader)** | Hotspot especular nas lentes desloca sutilmente com o ponteiro — o olhar lê-se pelo brilho da máscara, não só pela rotação da cabeça | simples | — |
| IDEIA-3D-06 | **Fio em tensão no Arsenal** | Linha fina permanente do pulso para fora do frame, vibrando com fbm — prontidão, a mão que sempre pode atirar | simples-médio | — |
| IDEIA-3D-07 | **Contraposto idle de ciclo longo** | Ciclo de 12–20 s de transferência de peso quadril×ombros com rotação oposta — o pôster vivo nunca repete o mesmo frame | médio | — |
| IDEIA-3D-08 | **Wrist-cam PiP** | Durante o macro do Arsenal, um insert de "câmera do lançador" (scissor render da mesma cena de outro ângulo) num canto do HUD | complexo | — |
| IDEIA-3D-09 | **Respiração dirigida por beat** | Amplitude/fase da respiração muda por beat (hero: contida; fullBody: aliviada) — hoje é constante | simples | — |
| IDEIA-3D-10 | **"Tismo" nos boundaries** | Ao cruzar um limite de beat: 2 frames de rim light 3× + micro-inclinação de cabeça — o arrepio de spider-sense | simples-médio | — |

### b) Animação de elementos de página

| ID | Título | Descrição | Complexidade | Dep nova |
|---|---|---|---|---|
| IDEIA-PAG-01 | **Tipografia reativa à velocidade** | Tracking/weight das headlines modulados pela velocidade de scroll (fonte variável) — o texto resiste ao movimento | médio | — (verificar se o Space Grotesk servido é variável) |
| IDEIA-PAG-02 | **Ticker de rádio da polícia** | Linha mono fina com chamados fictícios que mudam por beat ("…suspeito de maiô vermelho na 5ª…") — narrativa ambiente, puro DOM | simples | — |
| IDEIA-PAG-03 | **Web-wipe entre capítulos** | Transição de chapter card com clip-path diagonal + fio de teia SVG desenhando (em vez do fade/scale atual) | simples-médio | — |
| IDEIA-PAG-04 | **Fio-guia do cursor (desktop)** | Linha catenária sutil do cursor até a borda mais próxima, com "snap" ao mover rápido — a página é tecida | médio | — |
| IDEIA-PAG-05 | **Acento de beat no chrome DOM** | `--beat-accent` (steel→oxide→signal) tingindo rules, bordas, HUD e progress bar por beat, sincronizado com a atmosfera 3D | simples | — |
| IDEIA-PAG-06 | **CTA magnético no colofon** | O link "ver o código" atrai-se suavemente ao cursor num raio de ~120 px | simples | — |
| IDEIA-PAG-07 | **Boot de terminal no HUD mobile** | Labels do HUD do Arsenal aparecem caractere a caractere com cursor — o beat técnico "liga" o instrumento | simples | — |
| IDEIA-PAG-08 | **Metadados que respiram** | Kickers/datas mono com oscilação de opacity/letter-spacing em ciclo de 6–8 s (fora de reduced-motion) | simples | — |
| IDEIA-PAG-09 | **Progress bar como fio de teia** | Re-estilizar a barra como strand serrilhado com leve sag em SVG + nó que sobe | simples | — |
| IDEIA-PAG-10 | **Modo attract** | 20 s sem input no hero → drift suave de câmera + pulse no hint "role" — convida ao scroll sem UI extra | médio | — |

### c) Ambientação temática (Spider-Man)

| ID | Título | Descrição | Complexidade | Dep nova |
|---|---|---|---|---|
| IDEIA-AMB-01 | **Teias de canto reativas** | SVG fixo em 1–2 cantos com fios que flexionam sutilmente ao cursor (desktop) / gyro (mobile) — como se tocadas | simples-médio | — |
| IDEIA-AMB-02 | **Skyline em silhueta** | 2–3 planos SVG (torres de água, antenas, parapeitos) na base do frame com parallax lento — NYC sem modelo de cidade | médio | asset SVG autoral |
| IDEIA-AMB-03 | **Janelas acesas piscando** | No plano mais distante do skyline, janelas `signal/steel` com flicker estocástico — a cidade viva ao fundo | simples | (sobre AMB-02) |
| IDEIA-AMB-04 | **Chapter cards como impressão** | Halftone + misregistration cromático vermelho/azul nos cards de capítulo — nod aos quadrinhos impressos, distingue as transições do 3D | simples-médio | — |
| IDEIA-AMB-05 | **Thwip de partículas no impacto** | Micro-burst de faíscas/poeira no ponto de impacto do web-shot, reutilizando o sistema de partículas GPU | simples-médio | — |
| IDEIA-AMB-06 | **Áudio diegético opcional** | Toggle discreto: "thwip" no tiro, ruído de cidade distante, sirene rara por beat — WebAudio nativo, opt-in por gesto (autoplay policy) | médio | assets de áudio a licenciar |
| IDEIA-AMB-07 | **Trama do traje no chrome** | Textura CSS sutil de malha/hex a 3–4% atrás do colofon/opening — o material do herói vira papel da página | simples | — |
| IDEIA-AMB-08 | **Carimbo editorial por beat** | "NYC · 04:37 · chuva fina" muda por seção — detalhe que fã nota | simples | — |
| IDEIA-AMB-09 | **Colofon webbed shut** | Fios de teia SVG desenhando (stroke-dashoffset) sobre o colofon conforme ele entra — a página se fecha em teia | simples-médio | — |
| IDEIA-AMB-10 | **Retículo web-shooter como cursor** | Crosshair mínimo no desktop que "aperta" sobre elementos interativos | simples | — |

Notas de restrição: tudo acima foi checado contra as proibições da
`design-bible.md` (sem bokeh decorativo, sem fundos abstratos, texto nunca
sobre máscara/símbolo/lançador; skyline é figurativo, não "fundo abstrato").
Ideias com movimento contínuo (PAG-08, AMB-03) precisam do gate
`prefers-reduced-motion` como o resto do projeto.

---

## Fontes revisadas

### Código (lidos na íntegra ou em parte relevante)
- `src/App.tsx`
- `src/components/3d/CanvasContainer.tsx`, `CameraRig.tsx`, `Stage.tsx`,
  `Atmosphere.tsx`, `EffectsStack.tsx`, `PerformanceMonitor.tsx`,
  `SpiderManModel.tsx`
- `src/components/3d/camera/cameraPath.ts` (início + spans)
- `src/components/3d/beat/BeatProvider.tsx`
- `src/components/3d/lighting/LightRig.tsx`
- `src/components/3d/materials/MaterialFxDriver.tsx`
- `src/components/3d/atmosphere/particles.ts`
- `src/components/3d/rig/rigBones.ts`, `useProceduralRig.ts`,
  `anchorStore.ts`, `windowPointer.ts`
- `src/components/3d/interaction/useInteraction.ts`, `WebShoot.tsx`,
  `WebShootHint.tsx`, `gyroController.ts` (início)
- `src/components/3d/qualityContext.ts`
- `src/components/LenisProvider.tsx`, `PointerParallax.tsx`
- `src/components/ui/SplitTextHeadline.tsx`, `ChapterCard.tsx`,
  `OpeningTitleCard.tsx`, `ColophonSection.tsx`, `HeroOverlay.tsx`,
  `EvolutionOverlay.tsx`, `ArsenalOverlay.tsx`, `FullBodyOverlay.tsx`,
  `CinematicLoader.tsx`, `ProgressBar.tsx`
- `src/hooks/useMediaQuery.ts`
- `src/design/fxFlags.ts` (+ `grep` em `index.css` pelas camadas parallax)
- `node_modules/@react-three/drei/core/useEnvironment.js` +
  `helpers/environment-assets.cjs.js` (confirmar URL da CDN do preset)

### Docs consultados
- `docs/STATE.md`, `PROGRESS.md`
- `docs/plans/portfolio-impact-plan.md` (na íntegra — para não repetir ideias),
  `docs/plans/3d-motion-upgrade-plan.md` (grep de escopo/proibições)
- `docs/design/memorable-moments.md`, `docs/design/design-bible.md`
  (proibições), `docs/specs/headroom-lighting.md` (números de triângulos)

### Ferramentas
- `node scripts/inspect-glb.mjs` (contagens do GLB: 16 meshes, 30 texturas,
  66 joints, 0 clipes, 22,4 MB)
- `grep` por uso das variantes `-512`/`-webp1024` (nenhuma referência)

### Não revisados nesta rodada
- `GyroPrompt.tsx`, `StaticFallback.tsx`, `PerfHud.tsx`,
  `cameraKeyframes.ts` (valores), `interactionStore.ts`, `pointerMath.ts`,
  `spring.ts`, `poses.ts`, `blink.ts`, `lensShader.ts`, `suitShader.ts`,
  `curateMaterials.ts`, `gltfKtx2Loader.ts`, `beats.ts` — e nenhum teste em
  execução (leitura estática apenas; sem screenshots/scroll recording anexados
  pelo usuário nesta rodada).
