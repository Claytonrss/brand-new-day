# Registro de Decisões de Arquitetura (ADR) — Spider-Man: Brand New Day

## ADR-001: Escolha da Stack de Frontend e 3D

- **Data:** 2026-09-05
- **Status:** Aprovado
- **Contexto:** Necessidade de criar uma landing page 3D cinematográfica de alto nível de portfólio.
- **Decisão:**
  - **Framework:** Vite 8 + React 19 + TypeScript 5.9
  - **Estilo:** Tailwind CSS v4 (tokens `@theme` em `src/index.css`)
  - **Engine 3D:** Three.js 0.185 + `@react-three/fiber` v9 + `@react-three/drei` v10
  - **Post-processing:** `@react-three/postprocessing` v3
  - **Animação/Scroll:** GSAP ScrollTrigger
  - **Package Manager:** `pnpm` (versão 9) obrigatório
- **Consequências:** Desempenho alto em tempo de execução, tipagem estrita no R3F e DX moderno com Vite 8.

---

## ADR-002: Modelo 3D, Rigging e Asset Pipeline

- **Data:** 2026-09-05
- **Status:** Aprovado
- **Contexto:** Escolha do asset 3D principal do Spider-Man e garantia de compatibilidade com animações e head tracking.
- **Decisão:**
  - Asset baixado do Sketchfab (autor Eskze, licença CC-BY 4.0).
  - Armazenado em `public/models/spider-man_brand_new_day-v2.glb`.
  - Rig verificado com 66 joints (Mixamo), com destaque para `mixamorig:Head_06` e `mixamorig:Neck_05` para rotação orientada ao cursor/touch.
  - Atribuição obrigatória e visível sem hover mantida no rodapé/CTA da página.

---

## ADR-003: Estratégia de Testes Visuais e Viewports Mobil-First

- **Data:** 2026-09-05
- **Status:** Aprovado
- **Contexto:** Garantir que o enquadramento, contraste e tipografia funcionem perfeitamente tanto em telas móbiles pequenas quanto em monitores desktop.
- **Decisão:**
  - Playwright configurado com 3 viewports padrão:
    - Mobile iPhone 14/15: `390x844`
    - Mobile Pro Max: `430x932`
    - Desktop Standard: `1440x900`
  - Gate visual acionado via `pnpm verify` / `pnpm test:visual`.

---

## ADR-004: Camera Rig — Motor de Scroll Storytelling

**Data:** 2026-09-06  
**Status:** ✅ Aprovado

### Contexto

O projeto precisa de um motor de câmera que responda ao scroll para criar
narrativas cinematográficas entre as seções (Hero → Evolution → Arsenal →
FullBody). A câmera atual é estática (Hero apenas).

### Decisão

Implementar um camera rig baseado em:
- **Objeto mutável alvo** (position, lookAt, fov) atualizado por GSAP ScrollTrigger
- **Suavização** via lerp no useFrame com k=3 (frame-rate independent)
- **Condicionais por breakpoint** (768px) para keyframes mobile/desktop
- **Resize sem teleporte** com debounce ~150ms e transição suave

### Alternativas Consideradas

1. **GSAP ScrollTrigger direto na câmera** — rejeitado: sem suavização, teleporte
   em resize
2. **useFrame puro sem ScrollTrigger** — rejeitado: sem sincronização precisa com
   scroll position
3. **Biblioteca externa (react-scroll-parallax)** — rejeitado: dependência
   desnecessária, GSAP já está no stack

### Consequências

- ✅ Reutilizável em Evolution, Arsenal, FullBody
- ✅ Suavização consistente (lerp k=3)
- ✅ Resize sem teleporte (debounce + transição)
- ⚠️ Complexidade adicional no HeroCamera.tsx
- ⚠️ Necessita validação de performance (scroll smoothness ≥ 55 FPS)

---

## ADR-005: Lenis over ScrollSmoother

**Data:** 2026-09-08  
**Status:** ✅ Aprovado

### Contexto
O projeto precisava de smooth scroll premium para a wave 2. GSAP ScrollSmoother é a solução oficial, mas tem conflitos conhecidos com Lenis e é pago (GSAP Premium).

### Decisão
Adotar Lenis v1.3.x para smooth scroll.

**Rationale:**
- Open source (MIT license)
- Integração nativa com GSAP ScrollTrigger
- Easing exponencial `1.001 - 2^(-10t)` — curva "premium" da indústria
- Performance superior (GPU-accelerated)
- Comunidade ativa (Awwwards, GSAP showcase sites usam)

### Alternativas Consideradas
1. **GSAP ScrollSmoother** — rejeitado: pago, conflitos com Lenis
2. **CSS scroll-behavior: smooth** — rejeitado: não é "premium", não integra com ScrollTrigger
3. **Locomotive Scroll** — rejeitado: menos maintainable, comunidade menor

### Consequências
- ✅ Smooth scroll premium implementado
- ✅ Integração com ScrollTrigger (Lenis ↔ GSAP sync)
- ⚠️ Dependência externa (Lenis) — monitorar updates
- ⚠️ Removeu `scroll-behavior: smooth` do CSS (Lenis handle)

---

## ADR-006: Wave 4 Depth & Chrome

**Data:** 2026-09-08  
**Status:** ✅ Aprovado

### Contexto
A wave 4 adiciona elementos de profundidade e polish final: chapter cards, progress bar, particles, performance monitor.

### Decisão
Implementar 4 componentes independentes:

1. **ChapterCard** — transições cinematográficas entre seções (100vh, GSAP animations)
2. **ProgressBar** — indicador de scroll fixo na borda direita (1px, signal color)
3. **Particles** — atmosfera de partículas (200 desktop / 120 mobile, slow drift)
4. **PerformanceMonitor** — FPS tracking + adaptive quality (high/medium/low)

**Rationale:**
- Chapter cards marcam atos narrativos (MUDANÇA, REVELAÇÃO)
- Progress bar dá feedback de scroll (1px, não intrusivo)
- Particles criam profundidade atmosférica (design-bible §Atmosfera)
- Performance monitor garante experiência consistente em dispositivos low-end

### Alternativas Consideradas
1. **Chapter cards como overlays** — rejeitado: não integra com camera path
2. **Progress bar horizontal (top)** — rejeitado: intrusivo, compete com copy
3. **Particles como post-processing** — rejeitado: performance cost, não é "grão sutil"
4. **Performance monitor externo (Lighthouse)** — rejeitado: não é real-time, não adapta

### Consequências
- ✅ Chapter cards integrados ao camera path (700vh total)
- ✅ Progress bar acessível (role="progressbar", ARIA labels)
- ✅ Particles quality-aware (high=200, medium=120, low=0)
- ✅ Performance monitor com histerese (evita oscilação)
- ⚠️ Camera path recalculado (percentagens mudaram)
- ⚠️ Visual tests atualizados (scroll amounts)

---

## ADR-007: Adaptive Post-Processing per Device Profile

**Data:** 2026-09-08  
**Status:** ✅ Aprovado

### Contexto
O EffectsStack era incondicional (bloom + vignette + noise sempre ativos), causando performance ruim em mobile e desperdício de GPU em dispositivos que não precisam de todos os efeitos.

### Decisão
Implementar post-processing adaptativo baseado em quality profile:

**Quality Presets:**
- **High** (desktop): bloom 0.85/0.8, vignette 0.6, noise 0.032, MSAA 4x
- **Medium** (mobile): bloom 0.45/0.9, vignette 0.45, noise disabled, MSAA 0
- **Low** (reduced-motion): bloom disabled, vignette 0.3, noise disabled, MSAA 0

**Initial Tier Detection:**
- `prefers-reduced-motion` → low
- mobile (max-width: 768px) → medium
- desktop → high

**FPS Degradation:**
- Mantida lógica de histerese (evita oscilação)
- Degradação automática high → medium → low baseada em FPS

**Rationale:**
- Desktop mantém qualidade máxima (rubrica 5.0)
- Mobile reduz carga GPU (≤2 efeitos ativos)
- Reduced-motion respeita preferências de acessibilidade
- Performance monitor já existia, só precisava integrar com EffectsStack

### Alternativas Consideradas
1. **EffectsStack incondicional** — rejeitado: performance ruim em mobile
2. **CSS media queries para desabilitar efeitos** — rejeitado: não integra com quality context
3. **User agent detection** — rejeitado: frágil, não considera preferências do usuário
4. **Lighthouse CI thresholds** — rejeitado: não é real-time, não adapta dinamicamente

### Consequências
- ✅ Desktop 1440×900 pixel-identical (rubrica 5.0 preservada)
- ✅ Mobile 390/430 com bloom reduzido (0.45 vs 0.85)
- ✅ Noise desabilitado em mobile (performance)
- ✅ MSAA desabilitado em mobile (performance)
- ✅ Reduced-motion respeitado (bloom desabilitado)
- ✅ FPS degradation funcional (high → medium → low)
- ⚠️ Visual tests mobile mostram bloom reduzido (esperado)
- ⚠️ EffectsStack agora depende de quality context (acoplamento)

---

## ADR-008: BeatController como única fonte de verdade narrativa

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #17)

### Contexto

Cada cena controlava seu próprio `ScrollTrigger` (o `EvolutionScene` tinha um
privado; `CameraRig` tinha o master), e as demais seções não tinham nenhum —
então luz, câmera e overlays não compartilhavam estado. Qualquer efeito novo
(Wave B: câmera; Wave A: rig; Wave C: shaders) precisaria de mais um trigger.

### Decisão

Um único `BeatProvider` com um master `ScrollTrigger` (`document.body`,
`top top` → `bottom bottom`, `scrub: true`) publicando
`{ beat, t, progress, velocity }`:

- `beat` — id do beat, dispara re-render do React (6 vezes por scroll completo)
- `t` — progresso local dentro do beat (0-1), lido por frame via ref
- `progress` — progresso global
- `velocity` — progresso/segundo (`self.getVelocity()` normalizado pela altura
  da viewport), groundwork para a Wave B (FOV punch, dolly lag)

A timeline (`beats.ts`) usa exatamente as mesmas fronteiras de `cameraPath.ts`,
garantindo luz e câmera em sincronia por construção.

### Alternativas Consideradas

1. **Manter um trigger por cena** — rejeitado: estado duplicado, ordem de
   atualização imprevisível
2. **Contexto de React atualizado por frame** — rejeitado: re-render a 60fps
3. **Store externo (zustand)** — rejeitado: dependência nova para um estado que
   é lido quase todo dentro de `useFrame`

### Consequências

- ✅ Um único ponto de extensão para as waves B, A, C, D
- ✅ Luz e câmera sempre no mesmo beat
- ⚠️ Todo consumidor novo depende de `BeatProvider` estar montado

---

## ADR-009: Slots de luz permanentes (proibido montar/desmontar luz em runtime)

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #17)

### Contexto

A primeira implementação da Wave F montava o conjunto de luzes de cada beat e
desmontava o anterior com dissolve de 450 ms. A medição mostrou o oposto do
esperado: `gl.info.programs` crescia de 10 para 27 ao longo do scroll, com
stalls de 200–600 ms — porque adicionar/remover luz muda os defines do shader
(`NUM_POINT_LIGHTS`) e força recompilação de programa.

### Decisão

Seis slots de luz permanentes (`ambient`, `key`, `rim`, `accent`, `fill`,
`sweep`). Beats alteram **apenas** intensidade, posição, cor e distância, com
dissolve `1 - Math.exp(-6·delta)`. Nenhuma luz é montada ou desmontada após o
primeiro frame.

Regras derivadas, cobertas por `tests/unit/lighting.test.ts`:

- exatamente **1** emissor de sombra (`key` directional, 1024)
- **nenhuma** point light com `castShadow` (cubemap = 6 passes)
- todo slot declara `base` (valores sempre ativos) + overrides por beat

O rig base reproduz o composite aprovado no Look Dev v2 — o rig do Hero ficava
aceso em todas as seções —, de modo que a mudança é neutra visualmente.

### Alternativas Consideradas

1. **Mount por beat com dissolve** — rejeitado: recompilação de shader, stalls
   medidos de 200–600 ms
2. **Desligar luzes ociosas com `visible = false`** — rejeitado: três continua
   excluindo a luz do `lightsArray`, com o mesmo efeito de recompilação
3. **Reduzir intensidade a zero e manter sombras** — rejeitado: passes de sombra
   são o custo dominante, não a contagem de luzes

### Consequências

- ✅ Draw calls por frame: 118–120 → 44–46 (−62 %)
- ✅ `programs` estável em 10 durante todo o scroll
- ⚠️ Contagem de luzes não cai por beat (6 constantes) — o custo de fragment
  shader permanece; a alavanca real eram as passes de sombra
- ⚠️ Beat 2 perde a auto-sombra do spot nesta wave; volta na Wave C via shader
  dedicado

---

## ADR-010: Instrumentação de performance e política de dpr

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #17)

### Contexto

Não havia como medir o custo real da cena: o `PerformanceMonitor` só rastreava
FPS para degradar o tier, e os PRs anteriores registravam rubrica 5.0 sem
evidência mensurável. O dpr também era fixo em `[1, 2]` no Canvas, ignorando o
perfil.

### Decisão

- `PerfProbe` publica `window.__perf` com
  `{ fps, ms, calls, triangles, programs, geometries, textures }`, lendo
  `gl.info` com `autoReset = false`
- `PerfHud` (DOM, fora do canvas) exibe as métricas com `?debug=1`
- `QualityAdapter` aplica `profile.dpr` e `gl.shadowMap.enabled` ao renderer
- Política de dpr: **1.75 (high) / 1.25 (medium) / 1 (low)**

### Alternativas Consideradas

1. **Medir só FPS** — rejeitado: não explica *onde* está o custo
2. **HUD dentro do canvas** — rejeitado: não é DOM, não serve a testes
3. **Manter dpr 2 / 1.5** — rejeitado: fill rate é o gargalo em mobile e a
   diferença de nitidez é marginal

### Consequências

- ✅ Orçamento passível de asserção automatizada (Wave G)
- ✅ Evidência mensurável nos PRs em vez de impressão subjetiva
- ⚠️ FPS medido em headless é inválido (SwiftShader) — exige dispositivo real
