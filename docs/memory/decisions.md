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
  - Playwright com dois projetos de teste (fonte única: `playwright.config.ts`):
    - Mobile iPhone 14/15: `390x844` (projeto `mobile-390`, gate de PR)
    - Desktop Standard: `1440x900` (projeto `desktop-1440`, deep suite na main)
  - O terceiro viewport (`430x932`) é coberto pelas evidências de PR
    (`pnpm evidence:visual` fotografa 390/430/1440), não por um projeto de teste.

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

1. **Medir só FPS** — rejeitado: não explica _onde_ está o custo
2. **HUD dentro do canvas** — rejeitado: não é DOM, não serve a testes
3. **Manter dpr 2 / 1.5** — rejeitado: fill rate é o gargalo em mobile e a
   diferença de nitidez é marginal

### Consequências

- ✅ Orçamento passível de asserção automatizada (Wave G)
- ✅ Evidência mensurável nos PRs em vez de impressão subjetiva
- ⚠️ FPS medido em headless é inválido (SwiftShader) — exige dispositivo real

---

## ADR-011: Câmera por curva única de Catmull-Rom com easing por beat

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #19)

### Contexto

`CameraRig` interpolava posição, `lookAt` e `fov` linearmente sobre o progresso
de cada segmento de `cameraPath.ts`. Isso produzia velocidade constante e uma
descontinuidade de direção (C1) em cada uma das cinco fronteiras de beat —
medido: pico de **133,9°** entre deslocamentos consecutivos amostrados a cada
1% de scroll, contra 0° no interior dos segmentos (que eram retos). Além disso,
os keyframes do Arsenal moviam **0,2°** de azimute em relação ao punho: o
"orbit" do Beat 3 era um dolly reto.

Aplicar apenas easing por segmento não resolve: com easing que zera a derivada
nas duas pontas, a câmera para em cada fronteira e o pico de direção continua.

### Decisão

Uma **única** `CatmullRomCurve3` (`centripetal`, que lida bem com espaçamento
irregular de pontos) por breakpoint, atravessando todos os pontos de controle
na ordem do passeio. Cada beat mapeia para uma faixa de índices da curva e
aplica seu próprio easing ao progresso local antes de amostrar:

- `hero` estático · `chapter1` smoothstep · `evolution` easeInOutCubic ·
  `chapter2` smoothstep · `arsenal` smoothstep · `fullBody` easeOutCubic

Beat 3 passa a ser gerado em coordenadas esféricas em torno de
`WRIST_POSITION`: **85° de varredura de azimute** (spec exige ≥ 60°).

Pontos auxiliares distribuem as duas reversões de percurso: `OVERSHOOT` (a
câmera continua o push-in após o close-up do peito), `APPROACH` (aproximação
aberta antes do arco) e `RELEASE` (início do recuo antes do FullBody).

Complementos: ruído fbm de 3 oitavas em posição/lookAt (handheld), `FOV punch`
(±2°) e `dolly lag` (≤ 0.12) por velocidade do scroll — ambos desligados em
tier `low` e em `prefers-reduced-motion`.

### Alternativas Consideradas

1. **Easing por segmento mantendo segmentos retos** — rejeitado: medido, o pico
   de direção não cai (a câmera apenas passa a parar em cada fronteira)
2. **Curva única sem easing por beat** — rejeitado: todos os beats teriam o
   mesmo ritmo, perdendo o "assentar" do recuo final
3. **Catmull-Rom `catmullrom` (uniforme)** — rejeitado: com espaçamento irregular
   entre pontos de controle produzia kinks de até 97°
4. **Keyframes do Arsenal mantidos** — rejeitado: 0,2° de azimute não é órbita

### Consequências

- ✅ Pico de mudança de direção 133,9° → **62,1°** (−54 %); p95 20,2°
- ✅ Beat 3 com 85° de varredura — a travessia de eixo que o beat exigia
- ✅ `prefers-reduced-motion` corrigido: enquadramento estático por seção em vez
  de `fullBody` na página inteira (o Hero era exibido como corpo inteiro)
- ✅ Draw calls e `programs` inalterados (44–46 e 10)
- ⚠️ Pico residual de 62° é de _staging_ (recuo obrigatório do close-up até o
  punho), não de implementação
- ⚠️ Evolution/Arsenal/FullBody mudaram muito visualmente (43–65 % dos pixels
  no mobile) — exigiu aprovação visual humana

---

## ADR-012: Movimento procedural do rig sobre a rest pose (sem clips no GLB)

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #21)

### Contexto

O GLB não tem clips de animação (`animations: 0`, 66 joints). Todo o movimento
do personagem era **um osso** — e, na prática, nem isso: o código buscava
`mixamorig:Head_06`, nome que o loader nunca expõe (ver abaixo), e caía no
fallback que rotacionava o modelo inteiro.

### Decisão

Camada procedural **aditiva** sobre a rest pose capturada em runtime:

- `rig/rigBones.ts` — mapa semântico de joints, captura da rest pose, `softClamp`
- `rig/spring.ts` — mola criticamente amortecida (`dt` clampado em 1/10 s)
- `rig/proceduralMotion` — respiração, sway, deslocamento de peso, micro-tremor
- `rig/poses.ts` — offsets por beat com multiplicador único `POSE_AMPLITUDE`
- head-tracking por **slerp de quaternion**, com rigidez por joint para que a
  cabeça conduza e pescoço/coluna sigam (follow-through)

Nada sobrescreve a pose autoral: todo joint é escrito como `rest * offset`.

### Achado que mudou o diagnóstico do projeto

`pnpm inspect:glb` imprime os nomes crus do glTF (`mixamorig:Head_06`), mas
`THREE.PropertyBinding.sanitizeNodeName` remove caracteres reservados —
inclusive `:` —, então o mapa de nós do `useGLTF` é chaveado por
`mixamorigHead_06`. O lookup anterior falhava sempre (0 de 16 joints
resolvidos) e o Beat 1 "olhar que segue" nunca existiu: o corpo girava ~4°.

**Consequência para o projeto:** nomes de joint vindos da inspeção do GLB
precisam ser sanitizados antes de virarem lookup, e qualquer feature de rig
precisa de um teste que prove que o joint foi resolvido — não basta "não dar
erro".

### Alternativas Consideradas

1. **Animar no Blender e reexportar** — rejeitado nesta wave: exige re-export do
   asset e ADR próprio; continua como plano B (A5) se as poses falharem
2. **Escrever rotações absolutas nos joints** — rejeitado: destrói a rest pose
3. **Suavização exponencial em vez de mola** — rejeitado: sem velocidade, a
   troca de pose desliza em linha reta em vez de assentar

### Consequências

- ✅ 16 joints resolvidos; follow-through medido (0,037 > 0,004 > 0,0006)
- ✅ `prefers-reduced-motion` congela o rig de forma determinística
- ✅ Nenhum draw call adicional (rig é CPU)
- ⚠️ Amplitudes das poses são conservadoras até validação visual — a rest pose
  do asset ainda não foi inspecionada pose a pose
- ⚠️ Em dispositivos muito lentos (~2 FPS) o clamp de `dt` faz o tempo simulado
  avançar devagar; aceito, porque o alvo é 45+ FPS

---

## ADR-013: Âncoras do mundo derivadas do esqueleto (fim das âncoras hardcoded)

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #24)

### Contexto

O review visual apontou que o Beat 2 enquadrava a axila (desktop) e o Beat 3
não mostrava o lançador de teia. A medição no runtime mostrou a causa: cada
consumidor tinha a própria âncora hardcoded e elas discordavam.

| Consumidor                             | Âncora assumida | Realidade medida                       |
| -------------------------------------- | --------------- | -------------------------------------- |
| `cameraKeyframes` (Evolution `lookAt`) | (0; −2,0)       | peito em **(1,028; −2,254)**           |
| `cameraKeyframes` (Arsenal `lookAt`)   | (−0,5; −3,3; 0) | antebraço em **(−1,23; −2,72; −0,38)** |
| `CHEST_Y` / `WRIST_POSITION`           | literais        | idem                                   |

O modelo no desktop fica em `x ≈ 1,02` por **composição intencional** (texto à
esquerda) — o erro não era o offset, era a câmera ignorá-lo.

### Decisão

`rig/anchorStore.ts` é a **fonte única de âncoras do mundo** (peito, cabeça,
punho, quadril), atualizada do esqueleto a cada frame (4–6 `getWorldPosition`,
sem alocação). Consumidores:

- **Câmera:** para `evolution` e `arsenal`, o segmento inteiro é deslocado por
  `(medido − autoral)`. Isso corrige a mira **preservando o offset de
  composição** — `hero` e `fullBody` não são tocados (há teste provando).
- **Iluminação:** o spotlight do Beat 2 mira `ANCHORS.chest.y`.
- **Post-processing:** a âncora de foco do DOF segue peito/punho medidos.

A pose do Arsenal também foi calibrada por medição: `foreArmR` −0,25 → **−1,1
rad** (~63° de flexão), que sobe a mão ~0,55 unidades e deixa o antebraço
horizontal — a câmera fica abaixo do punho porque o lançador está na parte de
baixo do antebraço.

### Alternativas Consideradas

1. **Ajustar os literais dos keyframes** — rejeitado: conserta um breakpoint e
   quebra no próximo asset/escala; o erro voltaria sem aviso
2. **Reposicionar o modelo em x = 0** — rejeitado: destrói a composição
   aprovada (texto à esquerda, sujeito à direita)
3. **Contexto React com as âncoras** — rejeitado: re-render por frame; um
   objeto mutável lido em `useFrame` é o padrão já usado pelos uniforms de FX

### Consequências

- ✅ Peito e punho enquadrados pelo joint real; verificado por teste unitário
- ✅ Qualquer troca de asset/escala não quebra os enquadramentos
- ⚠️ Primeiro frame antes do load usa fallback literal (desktop) — coberto pelo
  loader cinemático
- ⚠️ Cabeça agora com bias `−0,6·baseYaw` e limites assimétricos (0,42/0,30):
  decisão estética registrada, revisável

---

## ADR-014: Easing linear nos beats intermediários da câmera

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #24)

### Contexto

O review reportou movimento "duro". A causa não era amplitude: os segmentos
usavam `smoothstep`/`easeInOutCubic`, e **todo ease-in-out zera a derivada nas
duas pontas** — a câmera _parava_ em cada fronteira de beat, seis vezes por
página.

### Decisão

Beats intermediários (`chapter1`, `evolution`, `chapter2`, `arsenal`) usam
**`linear`**. O suavizador exponencial do `useFrame` (k=2) já arredonda as
quinas, então o movimento fica contínuo sem parar. Apenas a aterrissagem final
(`fullBody`) mantém `easeOutCubic`, para "assentar".

Consequência metodológica: a métrica de suavidade do teste foi trocada de
**ângulo p95 entre amostras** (dependente de velocidade, ficou sem sentido com
o easing novo) para **curvatura** (graus por unidade percorrida). Medido:
14–16°/unidade de mediana; limite do teste 30.

### Alternativas Consideradas

1. **Manter ease-in-out por beat** — rejeitado: para-e-anda por construção
2. **Ease global único na página** — rejeitado: perde o assentamento final e
   exige refatorar o mapeamento beat → curva
3. **Aumentar o damping do lerp** — rejeitado: mascararia o problema e deixaria
   a câmera "flutuante" em scroll rápido

---

## ADR-015: Atmosfera em GPU (movimento no vertex shader)

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #26)

### Contexto

O `Particles.tsx` anterior movia um buffer fixo **na CPU**: pontos subindo na
vertical com velocidade, tamanho e opacidade uniformes, sem turbulência e sem
relação com a câmera. Em close-up cada ponto era um quadrado do mesmo tamanho —
cortina de poeira chapada, incapaz de criar profundidade.

### Decisão

Todo o movimento vai para o **vertex shader** (`atmosphere/particlesShader.ts`):
drift com wrap no volume, turbulência por senos defasados por partícula,
**parallax por camada** relativo a `camera.position`, fade por distância e
sprite circular. A CPU gera os atributos estáticos uma vez. Três camadas com
drift/parallax/tamanho/opacidade independentes; budget 420/180/0; **um draw
call** para toda a atmosfera. `<fogExp2>` na cor de fundo acrescenta separação
e dessaturação por profundidade **sem passe extra**.

### Alternativas Consideradas

1. **Mais partículas na CPU** — rejeitado: o problema era o modelo de movimento
2. **Textura de sprite** — rejeitado: forma circular no shader evita asset
3. **God rays como passe de post** — adiado: custo de passe com o orçamento
   mobile já no limite

### Consequências

- ✅ 1 draw call; contagem por tier sem custo de CPU
- ⚠️ Parallax não aparece em screenshot → evidência por vídeo (Wave G)

---

## ADR-016: Estado de interação mutável + piscada por obturador

**Data:** 2026-09-09
**Status:** ✅ Aprovado (PR #26)

### Contexto

O canvas é `pointer-events: none` (as seções HTML rolam por cima), então não
havia interação direta com o personagem. E o asset **não tem pálpebras**: os
olhos são lentes rígidas.

### Decisão

**Interação** com estado mutável (`interaction/interactionStore.ts`), no padrão
de `anchorStore` e dos uniforms de FX — escrever estado React a cada
`pointermove` re-renderizaria a árvore. Listeners no `window`: arrastar orbita
o grupo do modelo (±12°) com clamp suave e mola de retorno; `deviceorientation`
calibrado na primeira leitura; teia no Beat 3 (`THREE.Line` reutilizado, origem
na âncora medida, queda quadrática) + tranco de FOV; luz de recorte seguindo o
cursor.

**Piscada** por obturador de shader (não há pálpebra): pálpebras superior e
inferior na cor do traje (E) + compressão da lente (D), eixo medido do
bounding box real do mesh — não do UV.

### Alternativas Consideradas

1. **Estado React por evento de ponteiro** — rejeitado: re-render a 60 Hz
2. **`pointer-events: auto` no canvas** — rejeitado: quebra o scroll storytelling
3. **Piscada por UV** — rejeitado: UV rotacionado produziria fenda horizontal
4. **Pálpebras no Blender agora** — adiado: exige re-export e ADR; TD-001

### Consequências

- ✅ Arrastar, giroscópio, teia e piscada verificados por testes de browser
- ✅ Nada roda em `prefers-reduced-motion`
- ✅ Piscada fecha 98,1% dos pixels de lente no ápice (critério ≥ 80%)
- ⚠️ Giroscópio não é verificável em headless — pendente de dispositivo real
- ⚠️ Resultado definitivo da piscada é a opção B (TD-001)

---

## ADR-017: Copy de FullBody volta ao storyboard (fim da divergência)

**Data:** 2026-09-10
**Status:** ✅ Aprovado (auditoria portfolio-impact)

### Contexto

O `storyboard.md` (que declara "copy fechada — não reescrever") define o
FullBody como `Um homem sem nome. / Uma cidade sem escolha.` + data `31 de
julho`. A implementação em `FullBodyOverlay.tsx` usa `UM HERÓI QUALQUER.` com
outra copy, e a **data de estreia não aparece em lugar nenhum** — a única
informação concreta do filme, perdida. O spec retroativo
`fullbody-living-poster.md` codificou a divergência.

### Decisão

Voltar à copy do storyboard como fonte de verdade e **incluir a data**. O spec
retroativo passa a ser corrigido, e o storyboard permanece a referência de copy.

- Título: `Um homem sem nome. / Uma cidade sem escolha.`
- Data: `31 de julho` (no kicker ou no corpo, conforme storyboard)

### Alternativas Consideradas

1. **Manter `UM HERÓI QUALQUER.`** — rejeitado: é genérica e perde a data, a
   única informação concreta do filme.
2. **Fundir as duas copys** — rejeitado: o storyboard manda não reescrever;
   juntar viola a regra e dilui o tom.

### Consequências

- ✅ Data de estreia volta a existir na página.
- ✅ Storyboard e implementação realinhados (divergência documental fechada).
- ⚠️ O spec retroativo `fullbody-living-poster.md` precisa ser corrigido para
  não reintroduzir a divergência.

---

## ADR-018: Fluxo de permissão iOS para DeviceOrientation (gesto-gated)

**Data:** 2026-09-10
**Status:** ✅ Aprovado (auditoria portfolio-impact)

### Contexto

O gyro mobile (`useInteraction.ts`) só faz `addEventListener('deviceorientation')`.
No Safari iOS isso **nunca dispara**: o acesso ao sensor exige
`DeviceOrientationEvent.requestPermission()` chamado por um **gesto do usuário**
(toque). Resultado: no iPhone o "parallax por sensor" não existe, e não há
fallback orientado quando o sensor está ausente/negado.

### Decisão

Encapsular o gate de permissão com estados explícitos
(`unavailable | prompt | granted | denied`), mostrando um **prompt por gesto**
apenas quando `requestPermission` existe (iOS 13+) e ainda não respondida.
Escolha persistida em `localStorage`. `prefers-reduced-motion` **nunca** pede
nem ativa. Sem sensor ou negado → fallback por scroll + drift idle (a
experiência atual, sem regressão).

### Alternativas Consideradas

1. **Pedir permissão no load** — rejeitado: precisa de gesto; e um prompt na
   chegada quebra a imersão.
2. **Não suportar gyro no iOS** — rejeitado: é a principal diferenciação de
   plataforma pedida; o custo é baixo.
3. **Prompt modal bloqueante** — rejeitado: o gate é um chip discreto,
   dismissável, nunca modal.

### Consequências

- ✅ Gyro passa a funcionar no iOS (após grant); Android sem prompt.
- ✅ Fallback garante que negar/ausência de sensor não regride a experiência.
- ⚠️ Não verificável em headless — aceite exige dispositivo real (TD-002).

---

## ADR-019: Colofon/outro como fechamento de portfólio (nova seção)

**Data:** 2026-09-10
**Status:** ✅ Aprovado (auditoria portfolio-impact)

### Contexto

A experiência termina de forma abrupta: o FullBody mostra o modelo + CC-BY e
acaba. Não há nada sobre **quem fez**, com o quê, ou para onde ir — para uma
peça de **portfólio**, isso é o problema central. A atribuição do modelo é o
único texto além de 4 títulos; nada diz autoria.

### Decisão

Adicionar uma seção final de ~100vh (**Colofon**) em que o modelo **sai de
cena** (recede/apaga na névoa) e entra um fechamento editorial: autoria
("Feito à mão."), stack, atribuição CC-BY permanente e **um** CTA. É a
assinatura da obra. Spec: `docs/specs/colophon-outro.md`.

### Alternativas Consideradas

1. **Footer simples no FullBody** — rejeitado: não tem peso editorial; o fim
   continuaria abrupto.
2. **Página "sobre" separada** — rejeitado: fragmenta a peça; o portfólio é
   uma cena só.
3. **CTA múltiplos (código, projetos, contato)** — rejeitado: um portfólio
   forte manda para um lugar; secundários ficam mono e discretos.

### Consequências

- ✅ A peça ganha dono: "feito à mão" + stack + próximo passo.
- ✅ Contraste de ritmo: depois de 700vh denso, o colofon é o descanso que faz
  a assinatura ler como intencional.
- ⚠️ Risco de "quebrar o clima" com UI — mitigado por copy curta e tipografia
  mono/display, revisado pela rubrica.

---

## ADR-020: Assets 2D via Higgsfield (poster, grão, marca) — sem vídeo

**Data:** 2026-09-10
**Status:** ⛔ Superseded (2026-09-12) — as três necessidades originais foram cobertas
por outros meios (poster = render off-screen do modelo real, grão = `Noise` do
postprocessing, marca = loader teaser SVG + fontes self-hosted); ver
`PROGRESS.md` (Removidos). Reavaliar só se surgir demanda real de asset gerado.

### Contexto

O fallback WebGL (`webgl-static-fallback.md`) precisa de um **poster 2D**; o
grão/vinheta hoje usa o genérico do `postprocessing`; e não há marca
tipográfica. Geração de mídia via Higgsfield pode cobrir parte disso.

### Decisão

Usar Higgsfield para: (a) **poster** do fallback (silhueta/poster estilizado,
se a Opção A "render off-screen do modelo real" não for preferida); (b)
**grão de filme proprietário** (textura, se valer a pena substituir o
`Noise`); (c) **marca/logotipo tipográfico** para preloader e colofon.
**Vídeo: não.** Toda saída passa por curadoria contra `design-bible.md`
(proibições de cor/textura) — e o poster do fallback usa, por preferência, o
render off-screen do próprio modelo (Opção A).

### Alternativas Consideradas

1. **Vídeo gerado (Higgsfield)** — rejeitado: conflita com o 3D e com o budget
   de atenção no scroll; decisão consciente.
2. **Asset de terceiros/stock** — rejeitado por design-bible (sem stock).
3. **Sem assets 2D** — rejeitado para o fallback, que precisa de um poster.

### Consequências

- ✅ Fallback deixa de ser "mensagem de erro" (tem poster).
- ✅ Possível grão/marca proprietários elevando acabamento.
- ⚠️ Qualquer saída fora da paleta é descartada na curadoria (design-bible).

---

## ADR-021: HDR de ambiente self-hosted (FALHA-08 — loader determinístico)

**Data:** 2026-09-12
**Status:** ✅ Aprovado (Wave 3 do Pareto Impact Plan)

### Contexto

O `Environment` do drei usava `preset="city"`, que baixa o HDR
`potsdamer_platz_1k.hdr` de um CDN externo (assets do pmndrs) em tempo de
runtime. O portfólio vive de link compartilhado: CDN fora do ar, bloqueado
ou lento deixava o loader travado (ou a experiência sem reflexos) — um modo
de falha catastrófico fora do nosso controle.

### Decisão

1. **HDRI:** self-host do mesmo asset — `public/env/city_1k.hdr`
   (`potsdamer_platz_1k.hdr`, Poly Haven, **CC0 / domínio público**,
   verificado na página do asset em 2026-09-12); `Environment` passa de
   `preset="city"` para `files="/env/city_1k.hdr"`.
2. **Fontes (descoberto pela auditoria de requests):** o Google Fonts
   (`fonts.googleapis.com`/`fonts.gstatic.com`) era o único request externo
   restante. Space Grotesk (variável 400–700) e JetBrains Mono (400/500,
   subset latin, ~53 KB) migraram para `public/fonts/` com `@font-face`
   local (`public/fonts/fonts.css`); licença **SIL OFL 1.1** permite
   self-host. A entrega tipográfica muda; as fontes são as mesmas tokens.

O loader passa a depender **só de assets da própria origem** — auditoria:
`docs/evidence/wave3-loader-determinism/requests-audit.txt`
(0 requests externos).

### Alternativas Consideradas

1. **Manter preset (CDN pmndrs)** — rejeitado: dependência externa em hora
   crítica (primeiro load).
2. **Trocar de HDRI** — rejeitado: o look calibrado (P0/Look Dev) usa o
   Potsdamer Platz; trocar reabriria calibração de materiais sem ganho.
3. **Gerar HDRI autoral** — rejeitado para agora: asset novo com custo de
   direção; CC0 permite uso comercial sem atribuição obrigatória (crédito
   mantido por cortesia neste ADR).

### Consequências

- ✅ Loader determinístico: **zero requests externos** no primeiro load
  (auditoria: `docs/evidence/wave3-loader-determinism/requests-audit.txt`).
- ✅ Smoke "modo avião" passa a depender só da origem; fontes renderizam
  offline (font-display: swap vira irrelevante sem rede).
- ⚠️ +1,5 MB (HDR) + ~53 KB (fontes) em `public/` (fora do bundle JS).
- ℹ️ Créditos: "Potsdamer Platz" por Greg Zaal / Poly Haven (CC0);
  Space Grotesk (Florian Karsten) e JetBrains Mono (JetBrains), SIL OFL 1.1.

## ADR-022: Política de tier inicial síncrona (mobile nunca inicia em `high`)

**Data:** 2026-09-12
**Status:** ✅ Aprovado (Wave 1 do Pareto Impact Plan — FALHA-01; FALHA-09 incluída)

### Contexto

O tier inicial era derivado de `useMediaQuery`, cujo estado default é `false`
e só sincroniza no efeito de mount. Resultado: o `useState` inicial resolvia
sempre para `high` (dpr 1.75 + MSAA 4× + sombras) — no S23, que nunca dispara
resize, o aparelho passava a sessão inteira no perfil errado (FALHA-01,
provável causa nº 1 da falta de fluidez no mobile). A quality-matrix já
especificava "mobile = medium"; o código é que não cumpria a própria spec.

Além disso, a degradação por FPS media a cada 1 s e aplicava o tier pop a
qualquer momento — inclusive no meio de um fling, onde a troca de dpr/sombras
lê como glitch (FALHA-09).

### Decisão

1. **Tier inicial síncrono:** `detectInitialTier()` (`initialTier.ts`) lê
   `window.matchMedia` diretamente no lazy initializer do `useState` em
   `PerformanceMonitor` (reduced-motion → `low`, viewport < 768px →
   `medium`, resto → `high`; guarda `typeof window`). Os hooks
   `useMediaQuery` continuam montados para mudanças reativas — incluindo um
   novo efeito que rebaixa `high` → `medium` se a viewport se tornar mobile
   (a invariante "mobile nunca em high" agora vale para a sessão toda).
2. **Idle-gate para troca de tier (FALHA-09):** no tick de 1 s, qualquer
   mudança de tier só aplica se `|beatRuntime.velocity| < 0.02` ou se o
   loader ainda cobre a viewport (`loaderCover`). O pop fica para o instante
   em que o scroll assenta.
3. **FALHA-02 (threshold mobile-only medium→low < ~40 fps) permanece
   congelada, data-gated:** só entra se a Wave 0 (S23) mostrar o tier
   `medium` pós-fix operando na faixa 35–44 fps. Sem novo perfil
   intermediário (`balanced` foi rejeitado na 2ª revisão do plano).
4. **Observabilidade:** `PerfSnapshot` ganha `tier` (`window.__perf.tier`,
   exibido no PerfHud com `?debug=1`) para a verificação em device
   ("inicia em `medium`, nunca `high`") sem depender de console.

### Alternativas Consideradas

1. **Tier `balanced` intermediário** — rejeitado na 2ª revisão do plano:
   complexidade especulativa antes de medição; um threshold mobile-only
   cobre o mesmo gap com 1 linha, se a evidência pedir.
2. **Mover `BeatProvider` para fora do canvas** para expor velocity via
   contexto — rejeitado nesta wave: depende de context bridging do R3F para
   todo o tree interno; o espelho de módulo `beatRuntime` (padrão já usado
   por `INTERACTION`/`ANCHORS`) dá o mesmo acesso sem tocar estrutura.
3. **Manter detecção assíncrona + downgrade rápido** — rejeitado: o custo
   errado já foi pago no primeiro frame (o que é exatamente o bug).

### Consequências

- ✅ S23 inicia em `medium`: dpr 1.25, sem MSAA, sem custo residual de `high`.
- ✅ Nenhum tier pop visível durante scroll (aplica só em idle/loader).
- ✅ Tier legível em device via `window.__perf.tier` (evidência Wave 0/1).
- ⚠️ Degradação pode adiar alguns segundos durante scroll contínuo — aceito:
  o estado estacionário é o mesmo e o usuário não está olhando movimento
  quando aplica.
- ⚠️ Se a Wave 0 medir ≥ 55 fps com queixa de "feel" persistente, o problema
  é input-feel (FALHA-10 volta à mesa), não tier.

---

## ADR-023: Shadow throttle — passe de sombra sob demanda no tier `medium`

**Data:** 2026-09-12
**Status:** ✅ Aprovado (Wave 2 do Pareto Impact Plan — FALHA-04)

### Contexto

`curateMaterials` seta cast+receive em todos os meshes do personagem, então o
passe de sombra (self-shadow do traje) renderiza **todo frame** mesmo com o
sujeito quase estático: ~16 draw calls extras por frame no tier `medium`
(medido: 46 calls com passe ↔ 30 sem, SwiftShader local, 390×844). É um passe
completo de skinning (~500k tris) pago 60×/s para uma pose que muda pouco.

### Decisão

No `QualityAdapter`: `high` mantém `shadowMap.autoUpdate = true`; `medium`
passa a `autoUpdate = false` com refresh sob demanda (`shadowThrottle.ts`):

- **heartbeat de 10 Hz** — captura respiração/sway, visualmente idêntica em
  sujeito quase estático;
- **refresh imediato** em: mudança de beat, drag/gyro movendo (ambos escrevem
  o mesmo par `INTERACTION.yaw/pitch`; epsilon 0,001 rad filtra jitter),
  release do drag (borda de descida) e fim de fling (velocidade de scroll
  cruzando para idle, mesmo threshold 0,02 do idle-gate de tier);
- `low` continua com sombras desligadas (`enabled = false`).

A lógica de decisão é um módulo puro (`shouldRefreshShadow`) com unit tests;
o `QualityAdapter` só injeta `beatRuntime`/`INTERACTION` e escreve
`needsUpdate = true`.

### Alternativas Consideradas

1. **Status quo (passe por frame)** — rejeitado: custo fixo alto para sujeito
   estático; é exatamente a FALHA-04.
2. **Refresh só por heartbeat (sem gatilhos imediatos)** — rejeitado: sombra
   visivelmente defasada durante drag/gyro (o plano exige paridade em vídeo).
3. **Congelar sombra em repouso total (sem heartbeat)** — rejeitado: a rig
   procedural (respiração/sway) nunca para de mover os ossos; sem heartbeat a
   sombra defasaria em repouso, que é a maior parte do tempo.

### Consequências

- ✅ Vale de ~16 calls no `medium` entre refreshes (evidência:
  `docs/evidence/wave2-shadow-throttle/calls-valley.txt`; em device, ler o
  vale no `window.__perf` do S23).
- ✅ Drag/gyro continuam com sombra sincronizada (refresh por frame durante o
  gesto — o custo volta só enquanto interage).
- ⚠️ Trigger não coberto deixaria sombra defasada — mitigação: release de drag
  e fim de fling também disparam; novos canais de pose devem ser adicionados
  aos inputs do throttle.
- ⚠️ Aceite em device (vídeo do drag no S23, vale de calls) pendente da
  re-medição da Wave 0.

## ADR-024: Portão de direção no gatilho do spider-sense

**Data:** 2026-09-13
**Status:** ✅ Aprovado (fix do bug "disparo encoberto" pós-redesign v2)

### Contexto

O redesign v2 (PR #41) dispara o sense em _qualquer_ mudança de beat para um
beat de perigo — inclusive entrando **por baixo** (rolando para cima).
Reprodução em desktop 1440×900: a fronteira `chapter2 → evolution`
(progress 0.5625) coincide **exatamente** com o scroll em que o card
"REVELAÇÃO" cobre 100% da viewport (o card ocupa página 450–550vh e o beat
chapter2 é 450–550vh por construção). Toda re-entrada subindo gastava o fire
atrás do card opaco: halo clampeado num canto (`SenseAnchor`), snap/lentes/
respiração invisíveis. As outras duas re-entradas subindo
(`colophon → fullBody` em 0.95, `fullBody → arsenal` em 0.86) disparam no
meio de transições — as fronteiras 0.86/0.95 não coincidem com as bordas
reais das seções (700/800vh). Nenhum teste cobria cruzamento para cima.

### Decisão

`spiderSenseStep(delta, beat, velocity)` só dispara numa **chegada**:
`DANGER.has(beat) && velocity > 0 && isForwardEntry(previous, beat)` —
sinal da velocity normalizada de `beatRuntime` **e** beat alvo depois do
anterior na `BEAT_TIMELINE`. As duas condições se completam: a timeline
bloqueia re-entrada subindo mesmo quando a velocity defasada é positiva
(salto programático), e a velocity bloqueia viradas sem scroll (jitter de
refresh do ScrollTrigger). Re-armar continua natural: sair e voltar rolando
para **baixo** re-dispara. GSAP garante o sinal no frame da virada:
`getVelocity()` usa o scroll ao vivo menos a amostra anterior
(`(scrollFunc() - scroll2) / Δt`), e `lenis.on('scroll', ScrollTrigger.update)`
passa a instância como argumento, mantendo `recordVelocity` truthy.

### Alternativas Consideradas

1. **Portão só por velocity** — rejeitado sozinho: `getVelocity()` num salto
   programático pode ler 0/defasado no frame da virada e a janela de uma
   virada real depende do easing do Lenis; a timeline é determinística.
2. **Portão só por timeline** — rejeitado sozinho: jitter de refresh
   (resize/fontes) cruzando uma fronteira para frente dispararia sem scroll.
3. **Adiar o fire até a cabeça projetada estar em quadro** — rejeitado:
   estado novo ("fire pendente") com janela de expiração ambígua; resolve um
   problema diferente (cabeça fora de quadro nos close-ups, já aceito no
   clamp do `SenseAnchor`).

### Consequências

- ✅ Zero disparos encobertos: subir nunca dispara; o fire volta na próxima
  descida visível (re-arm preservado).
- ✅ Custo zero: dois booleanos avaliados só em mudança de beat (~6×/scroll).
- ⚠️ Re-entrar num beat subindo não toca o sense — decisão consciente: é
  releitura de conteúdo já anunciado na descida.
- ✅ Testes: 3 casos unitários novos (subindo, velocity 0, re-arm para
  frente) + 1 visual `@smoke` de regressão (mobile-390 + desktop-1440).

## ADR-025: Re-engrenagem do scroll (pacing por distância, sem hijack)

**Data:** 2026-09-13
**Status:** ✅ Aprovado (fase 1 do plano de pacing; snap magnético/nav por
capítulos ficam como fase 2 potencial)

### Contexto

O relato de uso era "o scroll passa rápido demais para navegar o site". Hoje
o pacing é dado pelas alturas de seção (900vh de documento, 800vh de scroll)
somadas ao damping do Lenis (`duration: 1.2`, ADR-005). Duas propostas foram
avaliadas: (1) travar uma seção inteira por gesto (fullpage/snap de hijack) e
(2) "forçar um scroll mais lento". A (1) colide com a arquitetura: o site é um
**scrub contínuo** — um único ScrollTrigger master em `document.body`
(ADR-008) alimenta câmera/luz/rig por frações, Evolution e Arsenal têm
coreografia **interna** (fade da narrativa 0.28–0.44, HUD 0.42–0.6, auto-reveal
0.8 do progresso local) e o ADR-014 já removeu "paradas" de easing de
propósito. Hijack também briga com momentum touch e com a suíte (jumps secos
`window.scrollTo` + settle por timeout; o spec de reduced-motion compara
screenshots byte a byte). Frear mais o Lenis (aumentando `duration`) não dá
tempo de leitura — só adiciona atraso elástico entre gesto e resposta.

### Decisão

**Re-engrenar a distância**: mesma rotação de input avança menos história.
As alturas passam a viver numa **tabela única** —
`src/components/3d/beat/sections.ts` (`SECTION_SPANS`) — da qual `App.tsx`
dimensiona as seções e `beats.ts` **deriva** `BEAT_TIMELINE` (fim da
duplicação manual de frações entre layout e narrative). Distribuição:
Opening 100 (contrato do landing, intocado) · Hero 140 · Chapter1 70 ·
Evolution 210 · Chapter2 70 · Arsenal 210 · FullBody 130 · Colophon 140 =
**1070vh de documento / 970vh de scroll** (+21% de história; os beats de
passagem caem 30%). Complemento de freio fino: `wheelMultiplier: 1 → 0.8` no
Lenis (só roda de desktop; touch segue intocado — qualquer mudança de touch
fica data-gated na sessão S23, FALHA-10). `beatLocalProgress`/consumidores
não mudam: as frações novas são ~hero 0–0.247 · chapter1 –0.320 · evolution
–0.536 · chapter2 –0.608 · arsenal –0.825 · fullBody –0.959 · colophon –1.0.

### Alternativas Consideradas

1. **Fullpage/snap de hijack (uma seção por gesto)** — rejeitada: comprime a
   coreografia interna de Evolution/Arsenal ou exige scroll interno;
   reintroduz paradas que o ADR-014 removeu; hard cut (3D-03) já havia sido
   rejeitado por quebrar a assinatura contínua; hijack é anti-pattern de
   acessibilidade e instável em mobile com WebGL; quebraria o contrato
   dry-scroll da suíte visual.
2. **`snap` nativo do ScrollTrigger (magnético direcional)** — adiado para
   fase 2: dá "aterrissagem" por capítulo sem hijack, mas a integração
   snap×Lenis exige aterrisar via `lenis.scrollTo` (o snap nativo escreve
   scrollTop por fora), gates (reduced-motion off, escape hatch e2e) e
   validação em device.
3. **Aumentar `duration` do Lenis** — rejeitado como resposta ao pacing:
   delay percebido, não tempo de leitura.
4. **Nav por capítulos (dots + teclado)** — complemento de fase 2, não
   substitui a re-engrenagem.

### Consequências

- ✅ +21% de scroll para a mesma história; leitura de Hero/Evolution/Arsenal/
  FullBody ~40% mais longa; cards de transição cruzam mais rápido.
- ✅ Fonte única de verdade: re-engrenar de novo = editar `SECTION_SPANS`;
  `BEAT_TIMELINE`, câmera, luzes e overlays acompanham por construção.
  O teste unitário da timeline também deriva das spans.
- ✅ Spec de interação do Arsenal refatorado para derivar o scroll do
  bounding box de `#arsenal-section` (robusto a qualquer re-engrenagem
  futura).
- ⚠️ `getVelocity()` normalizado por viewport sobe por gesto (mais px
  percorridos) — FOV punch/dolly lag/lean disparam com mais facilidade.
  Observar na sessão S23; ajuste de threshold é data-gated.
- ⚠️ Frações de maxScroll mudaram de significado: stops dos scripts de
  evidence (`collect-beat-chrome`, `collect-micro-craft`) recalibrados em
  múltiplos de viewport; specs que usam frações conferidos contra a nova
  timeline.

---

## ADR-026: Baseline de lint (jsx-a11y) e política de comentários

**Data:** 2026-09-13
**Status:** ✅ Aprovado

### Contexto

Auditoria do tooling de lint (flat config ESLint 9 + Prettier + husky/lint-
staged + commitlint, `verify-all.sh` e job `static` do CI) confirmou three-
layer enforcement e zero supressões (`eslint-disable`/`@ts-ignore`) no
codebase — mas com lacunas: (1) nenhum lint de acessibilidade num projeto
ARIA-heavy (overlays, `aria-label`, atribuição CC-BY visível sem hover);
(2) `tsconfig.node.json` menos estrito que `tsconfig.app.json`/`tests.json`
(sem `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch`/
`noUncheckedSideEffectImports`); (3) regras baratas ausentes (`prefer-const`,
`eqeqeq`). A mesma auditoria inventariou **784 comentários** no código: ~46%
eram narração/obviedade ("// Wait for canvas", "/** Advance the spring. */"),
convivendo com 132 constraints legítimos (FALHA-xx, IDEIA-xx, refs de spec,
contratos cross-file).

### Decisão

1. **Lint:** `eslint-plugin-jsx-a11y` (config `recommended`, escopo
   `**/*.tsx`), `prefer-const: error` e `eqeqeq: ['error', 'smart']` no bloco
   `**/*.{ts,tsx}`; `tsconfig.node.json` recebe o mesmo strictness de
   `tsconfig.app.json`.
2. **Política de comentários** (vinculante para código novo e retroativa
   nesta limpeza): comentário só existe para declarar um **porquê** não
   visível no código — constraints (FALHA-xx/IDEIA-xx/ADR/spec), contratos
   cross-file (CSS vars, `window.__rig`, `data-beat`), quirks de ambiente de
   teste (SwiftShader, `hover: none`) e licença. Proibido: narração do que a
   linha seguinte faz, JSDoc que repete o identificador, divisor de seção sem
   informação e label JSX que duplica `aria-label`/props. Com comentário meio
   informativo, aparar a parte óbvia e manter só a cláusula informativa.

### Consequências

- ✅ Zero violações no codebase atual com as regras novas (lint e typecheck
  passam sem nenhuma correção de código além da config).
- ✅ Regressões de a11y passam a ser capturadas no lint/pre-commit, não só na
  suíte visual.
- ✅ `tsconfig.node.json` uniforme — configs de build herdam a mesma rede de
  proteção de código morto/parâmetro solto.
- ⚠️ Nova devDependency (`eslint-plugin-jsx-a11y` 6.10.2) — impacto só em dev.
- ⚠️ Limpeza retroativa aplicada na mesma branch (`chore/cleanup` commits):
  109 comentários removidos, 10 aparados e 6 contas de scroll desatualizadas
  corrigidas (efeito do re-engrenagem do ADR-025). A estimativa prévia de
  ~300–380 caiu na inspeção direta: grande parte do que o inventário classificou
  como óbvio carregava unidade/semântica/porquê. Risco de conflito trivial de
  comentários em merges paralelos.

## ADR-027: Halo do spider-sense ancorado no topo do crânio e adaptativo à câmera

**Data:** 2026-09-14
**Status:** ✅ Aprovado

### Contexto

O halo do spider-sense lia como deslocado em relação à cabeça — sobretudo no
zoom dos beats de perigo. Duas causas independentes (BUG-PLAN-2026-09-13 B1):
(1) `SenseAnchor` projetava o centro do bone `mixamorig:Head_06`, que fica no
**meio** do crânio, enquanto os "emanata" nascem do **topo** da cabeça; e
(2) a caixa do halo era fixa em CSS (230px / 300px no breakpoint `md`), então
quando a câmera chega perto a cabeça cresce na tela e o halo fica pequeno e
desproporcional — tamanho não é função da distância da câmera.

### Decisão

1. Âncora deslocada: `SenseAnchor` soma **+0.12u world-space em `y`** ao
   `ANCHORS.head` antes de projetar (topo do crânio; o bone fica ~12cm abaixo
   da coroa na escala do modelo).
2. Raio por projeção: no mesmo frame, um segundo ponto (coroa, +0.27u) é
   projetado e a distância em px até a âncora ×4 (fator do leque dos
   emanata, raios 0.32–0.46 da caixa) define `--sense-radius`, clamp
   **80–180px**. O CSS dimensiona a caixa com
   `calc(var(--sense-radius) * 2)`; o breakpoint de tamanho fixo some.
3. Custo inalterado: as duas projeções e três escritas de CSS var acontecem
   apenas enquanto o envelope vive (~600ms por disparo).

### Consequências

- ✅ Halo centrado no topo da cabeça e proporcional ao zoom em todos os
  viewports; nada muda na disciplina de gatilho (ADR-024).
- ✅ Contrato cross-file novo: `--sense-radius` publicado por `SenseAnchor`,
  consumido por `.sense-halo` (`index.css`), documentado na spec §1.
- ⚠️ Os magic numbers (0.12u, 0.27u, ×4, clamp 80–180) são calibração visual
  do modelo atual — revisitá-los se o asset ou a escala da cena mudarem.

## ADR-028: Estado indeterminado (`null`) em `arsenalReveal` contra a race de canvas

**Data:** 2026-09-14
**Status:** ✅ Aprovado

### Contexto

O HUD técnico do Arsenal às vezes aparecia só de rolar, sem clique, em perfis
gesture-capable (BUG-PLAN-2026-09-13 B2). Race: `arsenalReveal.gestureCapable`
nascia `false` ("perfil sem gesto") e só era publicado como `true` pelo
`useEffect` do `WebShootHint` **depois** da montagem do canvas. Durante o load
do GLB (1–3s), o `ArsenalOverlay` lia `false` e tomava o caminho de reveal por
scroll; quando o gate chegava, um `opacity > 0` já podia ter sido escrito.
Um rótulo booleano não distingue "sem gesto" de "ainda não sei".

### Decisão

1. `gestureCapable: boolean | null` — inicial **`null`** (indeterminado);
   `WebShootHint` publica `true`/`false` no mount (e `false` no unmount),
   como já fazia.
2. `ArsenalOverlay.apply()` trata `null` como "HUD permanece em 0": nem o
   envelope por scroll (0.42–0.6) nem o auto-reveal (≥ 0.8) rodam até o gate
   existir. Perfis `reduced-motion`/tier `low` são intocados — o caminho
   scroll-driven deles continua correto durante e após o load.
3. Afrodade explícita: `ArsenalClickHint` (DOM) — label "clique no anel ·"
   visível apenas com `data-beat === 'arsenal'`, `gestureCapable === true` e
   HUD não revelado; some no mesmo tap que dispara a teia. O anel 3D sozinho
   não era affordance suficiente em mobile.

### Consequências

- ✅ Perfis capáveis não veem o HUD antes do gesto; quem não descobre o
  gesto continua atendido pelo auto-reveal em 0.8.
- ⚠️ Durante a janela `null` (só durante o load do canvas) o auto-reveal
  fica suspenso — aceito: a publicação ocorre imediatamente após o mount e
  o próximo `onUpdate` do ScrollTrigger resolve o estado.
- ⚠️ Consumidores novos de `gestureCapable` precisam lidar com os três
  estados (`null`/`false`/`true`) — o tipo obriga.

## ADR-029: GLB comprimido com meshopt + quantização (TD-003/F4b) e entrega via edge da Vercel

**Data:** 2026-09-14
**Status:** ✅ Aprovado

### Contexto

O asset `spider-man_brand_new_day-v2.glb` tinha 23,48 MB, dos quais ~19 MB de
geometria float32 **sem compressão** (273k vértices) — fora do budget de
≤ 15 MB (TD-003, item F4b). O loader já era _meshopt-ready_: `useGLTF(path,
false, true, extendLoader)` liga o decoder `EXT_meshopt_compression` e mantém
Draco desligado. Texturas já estavam em WebP (30 imagens, 3,0 MB) — o alvo era
só geometria.

### Decisão

1. Re-export com **glTF-Transform CLI** (`meshopt`, level `high`,
   quantização: position 14 bits, normal/tangent 10, texcoord 12, weights 8)
   → `spider-man_brand_new_day-v3-meshopt.glb`, **nome novo versionado**
   (cache-busting na Vercel; rollback = reverter 1 linha em
   `SpiderManModel.tsx`).
2. O original sai de `public/` no mesmo PR (recuperável do histórico git) —
   evita 22 MB de asset morto no deploy.
3. **Entrega:** a Vercel já distribui `public/` pelo edge CDN global — não há
   CDN externo. Gatilho de migração documentado: Fast Data Transfer > ~50% dos
   100 GB/mês do Hobby por 2 meses seguidos → mover o GLB para Cloudflare R2
   (egress gratuito; exige domínio próprio + CORS + `Cache-Control: immutable`).

### Consequências

- ✅ **23,48 MB → 6,52 MB (−72%)**, dentro do budget, com folga.
- ✅ HUD `?debug=1` idêntico antes/depois no close-up do Arsenal (1440):
  draw calls 44, tris 440k, programs 15, geo 31 — custo de runtime inalterado.
- ✅ Diferença visual imperceptível: mobile 390/430 pixel-idênticos no estado
  de intro; close-up do traje/webshooter indistinguível (evidência local
  `test-results/visual/closeup-{before,after}.png`).
- ⚠️ Estrutura de skins mudou de 1 → 16 (um por mesh), todas com o **mesmo
  conjunto de 66 joints Mixamo** verificado por diff — custo ~64 KB de
  bone textures, head-tracking e piscada intactos (`collectRigBones` lê
  `nodes` por nome).
- ⚠️ `inspect-glb.mjs` reporta bounding box ±32767 em assets quantizados
  (lê min/max cru do accessor, que fica em espaço quantizado) — limitação do
  script, não do asset; o three.js calcula bbox da geometria decodificada.
- ⚠️ O HUD reporta `tex` 66 → 51 (objetos de textura na GPU, contagem
  transitória) sem correlato visual — nenhuma textura removida do arquivo
  (30 imagens antes/depois).

## ADR-030: Token `dim` elevado para contraste AA e fim das variantes de opacidade em texto

**Data:** 2026-09-14 · **Contexto:** auditoria 5.12 + dedução `color-contrast`
do Lighthouse (a11y 96) · **Onda:** W3 do `post-launch-polish-plan.md`

### Decisão

- `--color-dim` passa de `#6b6a63` para **`#7d7c74`** — contraste sobre `ink`
  (#0a0a0c) vai de **3,64:1** para **≈4,7:1**, passando WCAG AA (4,5:1) para
  texto normal. Todo uso de `text-dim` na peça é label informativo de 10–12px
  (kickers, datas, atribuição, hints) — nenhum puramente decorativo.
- **Variantes de opacidade em texto eliminadas** (`text-dim/60`, `text-dim/70`
  → `text-dim`): mesmo com o token base claro, `dim/60` sobre ink mede
  ≈2,0:1 — e o footer legal do colofon (atribuição CC-BY + disclaimer,
  obrigatórios "legíveis sem hover") era o pior caso da página.
- `decoration-dim/40` (sublinhado decorativo dos links) permanece — não é
  texto.

### Alternativas consideradas

- **Segundo token `dim-raised`** mantendo o `dim` original: rejeitado — dois
  cinzas vizinhos com fronteiras sutis é hierarquia difícil de manter
  consistente em 11 arquivos, e nenhum uso atual pede o tom mais escuro.
- **Aumentar só o footer legal:** rejeitado — o problema é sistêmico
  (todos os labels de 10–12px falham AA), não local.

### Consequências

- Hierarquia paper → dim preservada (dim continua visivelmente abaixo de
  paper #e9e5da); tom levemente mais quente/claro nos metadados.
- `AGENTS.md` e `design-bible.md` sincronizados com o novo hex.
- Lighthouse `color-contrast` deve sair da lista de deduções (a11y 96 → 100
  esperado; medido no PR).

## ADR-031: Claim "zero janks" substituído por fato verificável (C4)

**Data:** 2026-09-14 · **Contexto:** C4 da auditoria — sessão de device S23
ainda não realizada; "zero janks em mobile mid-range" era a única afirmação
da página falsificável sem medição em mãos · **Onda:** PR-A do
`pareto-closing-plan.md`

### Decisão

O 4º argumento do colofon passa de
`6,5 MB de GLB · 66 joints · zero janks em mobile mid-range` para
`6,5 MB de GLB · 66 joints · zero requests externos no load`.

- **Por que "zero requests externos":** fato verificável por qualquer um via
  aba Network (ADR-021 — fontes + HDR locais; RUM da Vercel é same-origin
  `/_vercel/*`), sem redundância com o 3º argumento (tiers).
- **"Zero janks" pode voltar — mais forte:** se a sessão S23 (Bloco A)
  sustentar o claim, a linha é restaurada **com número**
  ("zero janks medidos: X fps"), o que argumenta melhor que a versão atual.
- **"Três tiers de performance adaptativa"** (fallback do plano) foi
  descartado: redundante com o 3º argumento da mesma lista.

### Consequências

- A página fica sem nenhuma afirmação não-evidenciável; FALHA-02 segue
  data-gated no Bloco A (threshold só entra com número).

## ADR-032: Harness de agente versionado — skills `.agents/`, agentes OpenCode no caminho canônico e MCP Context7

**Data:** 2026-09-18 · **Contexto:** `harness-score` em 74/108 (L1) com
Skills & Commands e Hooks zerados; workflows repetidos (evidência de PR,
isolamento de testes, contrato spec-driven) viviam apenas em prosa;
subagentes OpenCode em `.opencode/agent/` (singular), fora do caminho canônico
documentado `.opencode/agents/`; nenhum servidor MCP configurado.

### Decisão

- **Skills do projeto em `.agents/skills/`** (`pr-evidence`, `test-isolation`,
  `spec-driven`) — caminho tool-agnostic (lido pelo ZCode e pelo scanner),
  empacotando procedimentos que já eram vinculantes em docs.
- **Entry points intencionais em `.agents/workflows/`** (`pr-evidence.md`,
  `test-isolation.md`) como checklists disparáveis sob demanda.
- **Scoped rules em `.agents/rules/`** (`three-r3f.md`, `tests-playwright.md`)
  — não-negociáveis por área com ativação por globs; a ativar skills/MCP o
  scanner passou a detectar Claude Code/OpenCode/Antigravity e a exigir CTX-03
  a CTX-06.
- **`.opencode/agent/` → `.opencode/agents/`** + `name:` explícito no
  frontmatter dos 10 agentes (alinhamento com o caminho documentado do
  OpenCode; o `opencode.json` inline permanece a fonte de config).
- **MCP Context7** (docs atualizadas de R3F v9/drei v10/Tailwind v4/Vite 8)
  em três configs, cada uma com consumidor real: `.mcp.json`
  (compat Claude Code/Codex), `.agents/mcp.json` (fallback do ZCode —
  `.zcode/` é gitignored) e chave `mcp` do `opencode.json`. Keyless (rate
  limit gratuito); nenhuma credencial commitada.
- **Critérios EARS + checks pareados com prova** incorporados ao
  `docs/workflow/spec-driven-contract.md` (§2.1, §2.3, §3) — inspirados na
  skill externa `tlc-spec-lean`, avaliada e rejeitada como instalação por
  duplicar o contrato existente (segunda fonte de verdade + dependência de
  Python).

### Consequências

- harness-score 74 → 94/108 (L3) nesta decisão; skills viram a camada
  executável e os docs continuam a fonte única.
- Mudança de servidor MCP exige tocar 3 configs (custo aceito do multi-tool;
  consolidável se um formato vencer).
- Hooks (HKS, +14 pts) entraram no mesmo delivery via ADR-033, apesar do
  formato ser de ferramenta fora do stack atual.

## ADR-033: Hooks de guardrail no formato Claude Code (gate + feedback)

**Data:** 2026-09-18 · **Contexto:** dimensão Hooks do harness-score em 0/14;
os limites de ação (AGENTS.md §11) eram prosa — nenhum mecanismo determinístico
os executava. Complementa o ADR-032 no mesmo delivery (planejado como PR
separado por tocar formato de ferramenta fora do stack; combinado a pedido do
mantenedor).

### Decisão

- `.claude/settings.json` com dois hooks, scripts commitados em
  `scripts/hooks/` (nenhuma dependência nova):
  - **PreToolUse (Bash)** → `guard-shell.mjs`: espelho do §11 — bloqueia
    `rm -rf`, `git push --force/-f` (exceto `--force-with-lease`),
    `git reset --hard`, install/add de dependência (pnpm/npm/yarn/bun) e
    escrita via redirect em configs de agente. Exit 2 = deny; payload
    inválido = fail-open (não trava o loop do agente).
  - **PostToolUse (Edit|Write|MultiEdit)** → `format-edited.mjs`: prettier no
    arquivo editado (mesma config do lint-staged); nunca bloqueia.
- Guard é heurístico (split por `&&/||/;/|` + parser de flags para `rm`), não
  um parser shell completo.

### Consequências

- HKS 14/14; combinado com o ADR-032 o score chega a 108/108.
- Hooks ativos sob Claude Code; para ZCode a proteção equivalente é client-side
  (`.zcode/` é gitignored — não versionável aqui).
- Falso-positivo aceitável para um gate: `echo "rm -rf"` é bloqueado.

## ADR-034: Frota de subagentes portada para o ZCode (`.zcode/agents/`)

**Data:** 2026-09-18 · **Contexto:** OpenCode saiu do stack de trabalho; os 10
subagentes viviam em `.opencode/agents/` com config inline no `opencode.json`
(modelos e permissões por comando). O ZCode lê subagentes de
`.zcode/agents/**/*.md` (workspace, recursivo) — caminho até então ignorado
pelo `.gitignore`.

### Decisão

- **9 agentes portados** para `.zcode/agents/` (explore-repo, plan,
  implement-frontend, implement-general, test-writer, verify, security-audit,
  git, docs) com frontmatter nativo do ZCode: `name`, `description`,
  `tools` (restrição por ferramenta, não por comando), `skills:` amarrando os
  agentes às skills do ADR-032 (verify→pr-evidence/test-isolation etc.) e
  `injectAgentsMd: true` para contexto do projeto.
- **`orchestrator` não foi portado:** no ZCode o agente principal é o
  orquestrador (subagente não delega) — a função já existe nativamente.
- **Sem `model:` nos arquivos:** o usuário tem 2 modelos (GLM-5.3 e
  GLM-5.3-Flash); IDs de entitlement não são estáveis para hardcode. Agentes
  herdam o modelo da sessão; override por agente fica no Settings →
  Subagents (grava o ID correto).
- **`.gitignore`**: `.zcode/*` + `!.zcode/agents/` — plans/ de sessão
  continuam fora, a frota fica versionada.
- Prompts atualizados: referências a arquivos removidos (`docs/STATE.md`,
  `docs/specs/`, `harness-bootstrap-plan.md`) substituídas por paths vivos;
  plan/verify ganham EARS + proof-backed checks (ADR-032).

### Consequências

- Permissões deixam de ser por comando bash (opencode) e passam a ser por
  ferramenta + disciplina de prompt; o gate determinístico equivalente é o
  hook `guard-shell` (ADR-033) sob Claude Code, e no ZCode o modo de
  permissão da sessão.
- `.opencode/` permanece no repo (inerte, mantém AGT-01 do harness-score);
  remoção é decisão futura — remover custa 5 pts de score e deve vir com
  substituição do caminho canônico.
- Descoberta de user scope (`~/.zcode/agents/`) só existe no runtime desktop;
  a frota versionada no workspace funciona em qualquer runtime.

## ADR-035: Wave first-frame-legibility — presença na primeira dobra, badge de atribuição, sticky reparado e Colophon 115

**Data:** 2026-09-19 · **Contexto:** avaliação visual ao vivo (2026-09-18,
browser, 390/1440) contra a Design Bible encontrou: (1) a primeira dobra não
tinha o personagem — cartão `OpeningTitleCard` opaco escondia a cena; (2) a
atribuição CC-BY, duplicada em 4 seções, cruzava o personagem e colidia com a
copy (Arsenal mobile); (3) texto sem scrim sobre o traje (Evolution) e título
central cobrindo o símbolo do peito no hold do FullBody; (4) bordas duras dos
ChapterCards e ~40% de viewport morto no fim do Colophon; (5) scrollbar nativa,
ProgressBar lendo como linha solta, hint "clique no anel" quase invisível,
moiré no close do traje. Spec: `docs/specs/first-frame-legibility.md`.

### Decisão

- **Opening translúcido:** gradiente vertical (opaco no topo para o título,
  `0.55` na base) deixa a máscara fantasma na primeira dobra. O contrato do
  landing fica intacto (`LandingTrigger` `top bottom`, mola/fire-once
  inalterados) — emenda à spec `arrival-landing`.
- **Atribuição vira chrome único:** `AttributionBadge` (`fixed`, chip
  `bg-ink/70`, direita no mobile com texto compacto — título/nota de
  modificação seguem para leitores de tela e desktop). Instâncias por seção
  removidas de Hero/Arsenal/FullBody; Colophon mantém o rodapé legal
  permanente (ADR-019) e o badge se esconde no beat `colophon`. StaticFallback
  segue com o seu bloco inline.
- **Sticky reparado (root cause):** `main` tinha `overflow-x-hidden`, virava
  scroll container sem scroll e **desligava todos os overlays `sticky`** — os
  holds de Evolution/Arsenal/FullBody nunca grudaram de fato. O corte
  horizontal é feito só pelo `body` (propaga ao viewport). FullBodyOverlay
  ganha hold sticky com título no terço inferior + `.scrim-b`; Evolution ganha
  `.scrim-r`; Hero ganha `.scrim-b` no mobile. Scrims são funcionais
  (legibilidade), não decorativos.
- **Bordas suaves:** ChapterCards trocam `bg-ink` sólido por gradiente
  (núcleo opaco 16–84%, bordas dissolvendo); scrim de topo do Colophon
  dissolve mais tarde (40%/60%).
- **Colophon 140→115dvh** na tabela `SECTION_SPANS` (beats derivam por
  construção): fim da página sem viewport morto. Emenda ao ADR-025.
- **Polish:** scrollbar `thin` ink/steel; ProgressBar `w-0.5`; hint do anel em
  `text-signal` com text-shadow; anisotropy (cap 8) nas texturas KTX2 do
  traverse (`curateMaterials`).

### Consequências

- Primeira dobra passa a ter presença do personagem (critério bloqueante da
  rubrica) sem mudar o gearing do scroll; landing testes existentes continuam
  válidos sem alteração de comportamento.
- Holds de seção funcionam pela primeira vez como especificado — copy de
  Evolution/Arsenal/FullBody sustenta durante o beat em vez de passar rápido.
- Baselines visuais de `reduced-motion` e stills de evidência mudam (mudança
  intencional, documentada na spec §11).
- Badge compacto no mobile mostra © + creator + licença; título do trabalho e
  nota de modificação permanecem acessíveis (SR) e visíveis ≥ `sm` e no
  rodapé permanente do Colophon + `NOTICE.md`.
