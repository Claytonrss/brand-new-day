# Scene Spec — Atmosfera com Profundidade (Wave E)

> **Status:** implementado
> **Branch:** `feat/atmosphere-depth`
> **Plano de origem:** `docs/plans/archive/3d-motion-upgrade-plan.md` §4 Wave E
> **Data:** 2026-09-09

## 1. Context

O `Particles.tsx` anterior movia um buffer fixo **na CPU**: 200 pontos (120 no
mobile) subindo na vertical com velocidade, tamanho e opacidade **uniformes**,
sem turbulência e sem qualquer relação com a câmera. O resultado é uma "cortina
de poeira" chapada: não cria profundidade, e em close-up cada ponto é um
quadrado do mesmo tamanho.

Além disso não há atmosfera volumétrica nenhuma: o fundo é uma cor sólida
(`<color attach="background">`), então nada separa o sujeito do cenário por
profundidade.

## 2. Visual Goal

- Três **camadas de parallax** com velocidades e escalas diferentes: o
  movimento da câmera deve revelar profundidade (não é perceptível em
  screenshot parado — é movimento).
- Turbulência suave: as motas derivam em curvas, não em linhas.
- No Beat 2, as motas dentro da faixa de luz do spotlight **acendem** —
  integrando partícula e beat.
- O fundo ganha **névoa exponencial**: o que recua perde contraste e saturação,
  criando "ar" na cena.

## 3. Composition

Sem mudança de enquadramento, keyframes ou rig. As motas ficam atrás do sujeito
(`depthWrite: false`, blending aditivo) e nunca devem competir com o texto — o
texto é HTML, fora do canvas.

## 4. 3D Assets

Nenhum asset novo. A atmosfera é procedural (atributos gerados uma vez, sem
textura).

## 5. Lighting

Sem luz nova. O Beat 2 reutiliza `FX.uSweepY` / `FX.uSweep` (já modulados pelo
`MaterialFxDriver` a partir do peito medido — ADR-013), agora também consumidos
pelo shader das partículas.

## 6. Camera

Sem mudança. As partículas leem `camera.position` por frame para o parallax.

## 7. Interações e efeitos

### 7.1 Partículas em GPU (`atmosphere/`)

| Item                 | Valor                                                 |
| -------------------- | ----------------------------------------------------- |
| Contagem por tier    | high **420** · medium **180** · low **0**             |
| Camadas              | **3** (near/mid/far) com drift 0,16 / 0,10 / 0,06 u/s |
| Parallax por camada  | 0,85 / 0,60 / 0,35                                    |
| Tamanho por camada   | 0,05 / 0,075 / 0,11                                   |
| Opacidade por camada | 0,28 / 0,20 / 0,13                                    |
| Draw calls           | **1** (independe da contagem)                         |

Todo o movimento é feito no **vertex shader**: drift vertical com wrap no
volume, turbulência por senos defasados por partícula, parallax proporcional à
posição da câmera e fade por distância (sem `pop` nas bordas do volume).

### 7.2 Reação ao Beat 2

`uSpot` e `uSpotY` vêm dos uniforms compartilhados; motas dentro de 1,4
unidades da altura do peito recebem `uGlowColor` proporcional à intensidade da
varredura.

### 7.3 Névoa exponencial

`<fogExp2 args={[ink, 0.022]}>` na cena. A dessaturação por profundidade vem da
própria névoa (cor = cor de fundo), **sem custo de passe**.

### 7.4 Reduced motion

`uTime` **não avança** (motes congeladas em posição determinística).

## 8. Performance Budget

| Recurso    | Custo                         | Política                  |
| ---------- | ----------------------------- | ------------------------- |
| Partículas | 1 draw call, 0 alocação/frame | todos os tiers (0 no low) |
| Névoa      | 0 passe (chunk de fog)        | todos os tiers            |
| Texturas   | nenhuma                       | —                         |

Meta mobile mantida: ≤ 2 efeitos de post ativos, draw calls 44–46.

## 9. Accessibility

`prefers-reduced-motion` congela as motas (tempo parado) — composição estática
determinística. Sem DOM novo.

## 10. Stop Conditions

- [x] `pnpm verify` verde (lint, typecheck, test, build).
- [x] Nenhum erro de shader no console.
- [x] 1 draw call para toda a atmosfera (verificado por medição).
- [x] Contagem por tier: 420/180/0; `low` não monta o componente.
- [x] `prefers-reduced-motion` congela (`uTime` não avança).
- [x] `pnpm verify` verde; 71 testes unitários (10 novos de atmosfera) e
      `motion.spec.ts` 15 passed.
- [x] Draw calls no desktop `fx=subtle`: **44** (a atmosfera entra em 1).
- [x] Diff antes/depois coerente: hero 3,6% · capítulos 2–4% · evolution 21–41%
      (close-up com névoa e motas) · arsenal 15% · fullBody 5–23%.
- [x] `reduced-motion`: **0%** de pixels alterados (motes congeladas).
- [ ] **Profundidade perceptível em movimento** — exige olho humano (não
      aparece em screenshot estático; ver §2).
- [ ] Rubrica: "Sensação cinematográfica" ≥ 4 — olho humano.

**Escalar para humano se:** as motas atrapalharem a leitura do texto ou a
silhueta em qualquer viewport, ou se o custo no tier `medium` afetar o FPS.
