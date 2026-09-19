# Scene Spec: Hero Mouse Cue — ping de luz ambiente

## 1. Context

**Section:** Hero
**Branch:** `feat/hero-mouse-cue`
**Author:** @plan
**Date:** 2026-09-18

O hero tem mouse-tracking do rosto (yaw/pitch da cabeça via `windowPointer`), mas ele só
é percebido se a pessoa mover o mouse. Quem rola a página só via wheel/trackpad nunca
descobre o efeito. Este spec cria um **micro cue**: um ponto de luz ambiente perto dos
olhos que aparece uma vez, deriva horizontalmente (mesmo eixo do tracking) e some —
induzindo por reflexo o movimento do cursor. É um gatilho de descoberta, não um tutorial:
se parecer UI hint, falhou.

**Natureza:** feature 100% DOM sobreposta ao canvas — zero mudanças na cena R3F
(leitura apenas do module store `landing`).

## 2. Visual Goal

Um "vaga-lume" frio (`var(--color-glow)`, núcleo levemente quente) âncorado ao lado dos
olhos do personagem, ~1.5s após o settle da chegada. Fade-in suave, drift horizontal
`power2.inOut` de ~48px, fade-out — ciclo total ≤ 3.5s, pico de opacidade 0.35
(quase imperceptível conscientemente, capturado pela visão periférica). Deve ler como
parte da atmosfera (a mesma luz das lentes), nunca como ícone/afordância.

## 3. Composition

Âncora por breakpoint, derivada da projeção da câmera hero (FOV vertical fixo ⇒ posição
de tela linear em `vh`; a forma `calc(50vw + K·vh)` acompanha a projeção em qualquer
largura — 67% em 1440, 61% em 2560):

| Breakpoint                      | `left`              | `top`               | Observação                                                                                                                                                                  |
| ------------------------------- | ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop (≥768, `pointer: fine`) | `calc(50vw + 29vh)` | `calc(50vh + 18vh)` | ponto médio dos olhos; calibrado visualmente em 1024/1440/2560 (erro ≤ ~35px, modelo `vh`-linear confirmado — o head joint fica ~24vh acima dos olhos na cabeça estilizada) |
| mobile                          | —                   | —                   | cue nunca dispara (gate `pointer: fine`)                                                                                                                                    |

- Valores calibrados em 1024/1440/2560 via congelamento do dot (`calibrate-anchor.mjs`,
  removido após o uso — screenshots `test-results/visual/calib-*.png`): modelo
  `vh`-linear confirmado; sonda de centróide das lentes (verify independente)
  mediu 14/21/35px de erro nas três larguras — dentro do orçamento ≤ ~35px.
- Drift para a direita (da esquerda do olho em direção ao espaço vazio à direita),
  afastando-se da zona de copy (inferior-esquerda no desktop).
- Camada: `fixed`, `z-20`, `pointer-events-none`, `aria-hidden` — abaixo do HUD z-30,
  acima do conteúdo z-10.

## 4. 3D Assets

**N/A** — nenhum asset novo; o cue é um elemento DOM. O modelo, rig e materiais não são
tocados (a cor espelha o emissive das lentes: `COLORS.glow`, `curateMaterials.ts`).

## 5. Lighting

**N/A** — o cue é luz "diegética" falsa (radial-gradient DOM), não uma luz da cena.
Sem efeito no pipeline WebGL.

## 6. Camera

**N/A** — câmera intocada. A âncora CSS assume o keyframe hero (segurado durante todo o
span hero pelo `CameraRig`); o pointer-parallax da câmera (±0.08 mundo ≈ ±20px) é
irrelevante para um dot difuso de 34px.

## 7. Interactions

**Máquina de estados** (`src/design/heroCue.ts` — lógica pura; componente fino):

```
idle → armed → scheduled → active → done
```

| Transição             | Condição                                                                                                                                                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| idle→armed            | mount + `(pointer: fine)` + !reduced-motion + sessionStorage sem flag                                                                                                                                                                                                       |
| armed→scheduled       | poll 150ms: `landing.fired` && spring settle (`                                                                                                                                                                                                                             | value | < LANDING_SETTLE_EPS`) && `scrollY ∈ [0.55, 1.8]·innerHeight`→ timer`CUE_DELAY_MS` 1500ms |
| scheduled→active      | timer completa (sem cancelamento) → monta o dot + timeline GSAP                                                                                                                                                                                                             |
| →done (mouse real)    | deslocamento acumulado do ponteiro > 12px (baseline no 1º evento — entrada na viewport não cancela); se ativo: fade-out 250ms; **grava flag**                                                                                                                               |
| →done (scroll)        | delta de scroll > 8px: durante **scheduled**, sai da janela do hero → aborta (sem flag, sem re-arme — tentativa única por sessão); ainda dentro da janela → **reinicia o delay** (usuário ainda se posicionando / momentum do Lenis); durante **active** → dismiss com fade |
| →done (touchstart)    | dismiss imediato (híbridos touch+mouse)                                                                                                                                                                                                                                     |
| active→done (natural) | fim da timeline → grava flag + unmount                                                                                                                                                                                                                                      |

**Sessão:** flag `spiderman-landing:heroMouseHintShown` gravada **no momento da
ativação** (ou no cancelamento por mouse real) — re-scrolls nunca repetem; nova
aba/visitação repete (nativo do sessionStorage).

**Timeline GSAP** (elemento único, só `opacity` + `transform: translateX` —
compositor puro, sem layout): fade-in 500ms → drift 2200ms `power2.inOut` → fade-out
600ms. Pico de opacidade 0.35.

## 8. Performance Budget

| Métrica         | Alvo                                                                                | Medição                       |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| Draw calls      | +0                                                                                  | n/a — DOM puro, sem cena      |
| Custo por frame | 2 tweens compositor (opacity/transform) em 1 elemento por ≤3.3s, uma vez por sessão | inspeção + PerfHud `?debug=1` |
| Layout shift    | 0                                                                                   | elemento `fixed` fora do flow |
| Listeners idle  | 0 após `done` (poll/timers/listeners removidos)                                     | inspeção + unitário           |

## 9. Accessibility

- `aria-hidden="true"` + `pointer-events-none` — decorativo, não intercepta foco/pointer.
- `prefers-reduced-motion: reduce`: nunca arma (guard JS) + `display: none` CSS
  (belt-and-braces). O cue é 100% descoberta, não conteúdo.
- Touch primário (`pointer: coarse`): nunca arma.

## 10. Stop Conditions

| Condition                                                    | Measurement                                                          | Status |
| ------------------------------------------------------------ | -------------------------------------------------------------------- | ------ |
| EARS §11 todos PASS com prova                                | `tests/unit/heroCue.test.ts` + `tests/visual/hero-mouse-cue.spec.ts` | [ ]    |
| Visual quality (rubrica ≥ 4 no bloco "parece parte da cena") | screenshot 1440 + revisão                                            | [ ]    |
| Gates                                                        | `pnpm verify` + `pnpm test:smoke` verdes                             | [ ]    |
| Âncora calibrada em 3 larguras                               | screenshots 1024/1440/2560                                           | [ ]    |

## 11. Critérios EARS (cada um pareado com prova)

1. **When** a chegada settle em dispositivo `pointer: fine`, sem flag de sessão, sem
   reduced-motion e com o primeiro viewport do hero visível, **the system shall** exibir
   o cue perto dos olhos e encerrá-lo sozinho em ≤ 3.5s.
   _Proof: `hero-mouse-cue.spec.ts` (desktop-1440): atributo `data-hero-cue`
   `active→done` dentro do bound + screenshot._
2. **When** o usuário mover o ponteiro de fato (> 12px acumulados) a qualquer momento
   (armed/scheduled/active), **the system shall** desativá-lo em ≤ 300ms (fade 250ms se
   visível) e gravar a flag de sessão.
   _Proof: `page.mouse.move` no spec visual + unitário do `createPointerMovementDetector`._
3. **When** a página rolar para fora da janela do hero (delta > 8px) antes/durante o
   ciclo, **the system shall** abortar/desativar o cue sem persistir flag
   (pré-ativação); scroll **dentro** da janela durante o delay apenas o reinicia
   (quiescência — momentum do Lenis não é uma decisão de scroll).
   _Proof: `page.evaluate(scrollTo)` no spec visual + unitário do `createScrollTracker`._
4. **When** o dispositivo for touch-primário ou `prefers-reduced-motion: reduce`,
   **the system shall** nunca montar o cue.
   _Proof: mobile-390 run do spec visual (attr ausente) + `emulateMedia` + unitário do
   `canSchedule`._
5. **When** o cue já foi visto (ou o mouse já moveu) na sessão, **the system shall**
   não exibi-lo novamente.
   _Proof: reload no mesmo tab (sessionStorage persiste) no spec visual + unitário do
   wrapper de storage (DI, `memoryStorage`)._
6. **When** o componente desmontar, **the system shall** remover todos os listeners,
   timers e tweens.
   _Proof: auditoria de simetria no cleanup (3×`addEventListener` ↔ 3×`removeEventListener`
   com as mesmas refs; `clearInterval`/`clearTimeout` no cleanup e no `finish`;
   `tl.kill()` + `gsap.killTweensOf`) — inspeção de código do verificador independente._

**Escalation triggers:** âncora não calibrável em 3 larguras → voltar ao @plan; gates
vermelhos após 3 iterações → humano.
