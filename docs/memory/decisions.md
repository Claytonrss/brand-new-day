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
