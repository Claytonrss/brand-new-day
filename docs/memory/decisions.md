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
- ⚠️ Pico residual de 62° é de *staging* (recuo obrigatório do close-up até o
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

| Consumidor | Âncora assumida | Realidade medida |
|---|---|---|
| `cameraKeyframes` (Evolution `lookAt`) | (0; −2,0) | peito em **(1,028; −2,254)** |
| `cameraKeyframes` (Arsenal `lookAt`) | (−0,5; −3,3; 0) | antebraço em **(−1,23; −2,72; −0,38)** |
| `CHEST_Y` / `WRIST_POSITION` | literais | idem |

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
duas pontas** — a câmera *parava* em cada fronteira de beat, seis vezes por
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
**Status:** ✅ Aprovado (auditoria portfolio-impact)

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
