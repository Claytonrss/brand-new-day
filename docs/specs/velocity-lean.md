# Scene Spec: Velocity Lean (inclinação por velocidade de scroll)

## 1. Context

**Section:** página inteira (acoplada à velocidade, sem beat fixo)  
**Branch:** `feat/velocity-lean`  
**Plan:** `pareto-impact-plan.md` §Wave 4, PR 4b (IDEIA-3D-04)  
**Date:** 2026-09-12

## 2. Visual Goal

O corpo reage à ação que o usuário mais faz: **rolar**. Ao rolar para baixo,
o personagem inclina levemente o tronco na direção do movimento (como quem
se apressa); rolar para baixo devagar ou ficar parado devolve a postura de
repouso. A leitura é de inércia e peso — nunca de marionete.

Junta-se ao FOV punch e ao dolly lag como **terceiro efeito acoplado à
velocidade** (T4.6): se os três competirem em device, o lean é reduzido
primeiro (o mais prescindível).

## 3. Mecânica

- Fonte da velocidade: `beatRuntime.velocity` (progress-units/s — a mesma
  que alimenta FOV punch, dolly lag e o idle-gate de tier). O rig passa a
  consumi-la por frame.
- **Spring criticamente amortecido** (`Spring` de `rig/spring.ts`, sem
  overshoot — inércia, não wobble) segue o alvo `clamp(velocity × GAIN)`.
- Aplicação aditiva (nunca sobrescreve a pose de beat):
  - `spine1` pitch `+lean × 1.0`
  - `spine2` pitch `+lean × 0.6` (curvatura distribuída)
  - `shoulderL/R` elevação leve em z (sinal espelhado), proporcional a
    `|lean| / LEAN_MAX`
- `prefers-reduced-motion`: lean permanece **0** (a estátua não inclina).

## 4. Constantes nomeadas (calibráveis em Look Dev / T4.6)

| Constante            |  Valor | Unidade            | Nota                               |
| -------------------- | -----: | ------------------ | ---------------------------------- |
| `LEAN_MAX`           | 0.0436 | rad (2,5°)         | teto absoluto (plano: máx 2–3°)    |
| `LEAN_GAIN`          |   0.02 | rad / (progress/s) | velocity 2,2/s satura o lean       |
| `LEAN_STIFFNESS`     |      6 | rad/s (ω)          | segue o alvo sem delay perceptível |
| `LEAN_DAMPING`       |      1 | ζ                  | crítico: inércia sem oscilação     |
| `LEAN_SPINE2_WEIGHT` |    0.6 | —                  | distribuição da curvatura          |
| `LEAN_SHOULDER_LIFT` |  0.035 | rad (2°)           | elevação de ombros a lean pleno    |

**Sinal:** scroll para baixo (velocity > 0) → pitch positivo = inclinação à
frente. Convenção do rig a validar em Look Dev (T4.6); invertem-se os
sinais de `LEAN_GAIN` se necessário.

## 5. Integração

- `src/components/3d/rig/lean.ts` — constantes + spring + `leanStep(delta,
velocity)` (mesmo padrão `shadowThrottle`/`landing`: lógica pura,
  singleton, consumida pelo rig por frame).
- `useProceduralRig` — chama `leanStep` no useFrame e injeta os offsets no
  compose loop; `window.__rig` ganha `lean` (debug).
- Sem custo de draw calls: só rotações de bones já coletados
  (`spine1`, `spine2`, `shoulderL`, `shoulderR`).

## 6. Aceite

- Unit (`tests/unit/velocityLean.test.ts`): segue o sinal da velocidade;
  satura em `LEAN_MAX`; decai a 0 em repouso; crítico (sem overshoot);
  reset para testes.
- `motion.spec.ts`: lean > 0 rolando para baixo, < 0 rolando para cima,
  `|lean| ≤ LEAN_MAX` (clampado); 0 em reduced-motion.
- T4.6 (device): calibração conjunta lean × FOV punch × dolly lag no S23 —
  se compitirem, reduzir o lean primeiro.

## 7. Riscos

- **Wobble** com FOV punch + dolly lag (três efeitos na mesma variável) —
  mitigado por spring crítico e clamp baixo; calibração conjunta em device.
- Sinal da convenção de pitch do rig — correção de 1 constante após o
  primeiro look em device.
