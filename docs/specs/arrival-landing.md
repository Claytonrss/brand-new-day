# Scene Spec: A Chegada (arrival landing)

## 1. Context

**Section:** Opening → Hero (transição)  
**Branch:** `feat/arrival-landing`  
**Plan:** `pareto-impact-plan.md` §Wave 4, PR 4a (IDEIA-3D-01)  
**Date:** 2026-09-12

## 2. Visual Goal

O primeiro sinal visual do personagem é **o pouso**. Enquanto o opening title
card levanta, o herói desce de fora de quadro e assenta no chão com uma
flexão breve de quadril/joelhos; a câmera sente o impacto (kick vertical +
FOV punch) e assenta. O reveal do modelo **é** o pouso — não há pose
"flutuante" visível em nenhum momento com o card levantado.

Cinemática, não acrobático: uma queda curta com overshoot sutil (4–6%),
lida como peso e confiança. Sem braços (risco de interpenetração mapeado no
plano anterior).

## 3. Trigger (contrato)

- **`ScrollTrigger.create({ trigger: heroSection, start: 'top bottom', once: true })`**
  — dispara no instante em que o topo da seção Hero encosta na borda inferior
  da viewport, ou seja, **no primeiro pixel de scroll** a partir do opening
  card. O pouso acontece enquanto o card levanta.
- **Edge — hero já visível no primeiro frame pós-loader** (scroll restoration
  / âncora): disparar imediatamente ao levantar a cobertura, sem esperar
  scroll. Nunca disparar atrás de seção opaca: o disparo é adiado enquanto
  `loaderCover.covering` (loader) e só re-avaliado quando o loader sobe.
- **Uma vez por sessão:** `once: true` + guarda `fired` no store.
- **`prefers-reduced-motion`:** nada acontece — o modelo está em rest desde o
  primeiro frame (estátua por design) e o trigger nem é criado.
- Implementação: `src/components/3d/LandingTrigger.tsx` (montado no `App`),
  store `src/components/3d/landing.ts`.

## 4. Coreografia (~0,45 s)

| Fase             | O que acontece                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Antes do disparo | Grupo do modelo mantido em `y = rest + DROP` (no ar), invisível atrás do opening card                            |
| Queda            | Spring leva `y` de `DROP` a `0` (semi-implícito, `Spring` de `rig/spring.ts`)                                    |
| Impacto          | Flexão de quadril/joelhos via pose-springs existentes; kick de câmera + FOV punch no pico da velocidade da queda |
| Assentamento     | Overshoot de 4–6% (quique sutil do joelho) e flexão decai a rest (~1 s, amortecido pelos pose-springs)           |

**Sem braços:** a pose transitória toca apenas `hips`, `upLegL`, `upLegR`.

## 5. Constantes nomeadas (calibráveis em Look Dev)

| Constante                 | Valor | Unidade     | Nota                                                    |
| ------------------------- | ----: | ----------- | ------------------------------------------------------- |
| `LANDING_DROP`            |   0.6 | world units | altura inicial da queda (`y +0,6`)                      |
| `LANDING_STIFFNESS`       |     9 | rad/s (ω)   | "k ≈ 9" do plano                                        |
| `LANDING_DAMPING`         |   0.7 | ζ           | ζ < 1 → overshoot ≈ 4,6% (dentro dos 4–6%)              |
| `LANDING_FLEX_HIPS`       | 0.105 | rad (~6°)   | flexão de quadril                                       |
| `LANDING_FLEX_KNEE`       |  0.14 | rad (~8°)   | flexão de joelhos (`upLegL/R`)                          |
| `LANDING_FLEX_DECAY`      |     3 | 1/s         | decaimento da flexão pós-impacto (~1 s)                 |
| `LANDING_KICK`            |  0.08 | world units | kick vertical de câmera no impacto (dip para baixo)     |
| `LANDING_FOV_PUNCH`       |    −2 | graus       | punch de FOV no impacto                                 |
| `LANDING_KICK_NORMALIZER` |     4 | units/s     | velocidade de queda que satura o kick (ω·DROP·0,75 ≈ 4) |

Sinais de flexão/calibração fina pertencem ao Look Dev; os valores acima são
o ponto de partida vinculante do plano.

## 6. Integração

- **Modelo:** `SpiderManModel` soma `landing.offset()` ao `position[1]` do
  grupo (nunca muta o `position` declarativo).
- **Rig:** `useProceduralRig` chama `landingStep(delta)` uma vez por frame e
  injeta `LANDING_POSE × flex` nos alvos dos pose-springs (decaem a rest).
- **Câmera:** `CameraRig` soma `LANDING_KICK × kick` em `position.y` e
  `LANDING_FOV_PUNCH × kick` em `fov`, dentro do branch `effectsEnabled`
  existente (tier ≠ low) e fora de reduced-motion.
- **Debug:** `window.__landing = { fired, fireCount, offset, flex, kick }`
  com `?debug=1`.

## 7. Aceite

- `motion.spec.ts`:
  - **não dispara** com o opening card cobrindo a viewport (`fired === false`
    após o load, sem scroll);
  - **dispara uma vez por sessão** (scroll até o hero → `fireCount === 1`;
    voltar e resubir não incrementa);
  - **decai para rest** (offset → ~0 após o pouso);
  - reduced-motion: `fired` permanece `false` após scroll completo.
- Unit: `tests/unit/arrivalLanding.test.ts` (disparo único, hold antes do
  disparo, overshoot dentro de 4–6%, assentamento < 0,8 s, flex sobe e decai,
  kick pica no impacto).
- Vídeo por viewport (`pnpm evidence:motion`) + rubrica primeira dobra ≥ 5.

## 8. Riscos

- **Sinal de flexão** (para frente vs. para trás) depende da convenção do
  rig no quadril — calibrar em Look Dev antes do merge final.
- **Card lento:** um scroll muito lento pode revelar a parte final da queda —
  aceito: a queda começa no primeiro pixel de scroll e dura ~0,45 s.
- **FPS baixo:** Spring clampa `dt` a 1/10 s (integrador estável); em devices
  lentos o pouso acontece em tempo simulado — sem teleporte.
