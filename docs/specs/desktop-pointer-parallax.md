# Scene Spec: Desktop — Pointer Parallax (profundidade real)

## 1. Context

**Section:** transversal (Hero, beats com HUD, FullBody/Colophon)
**Wave:** P2b.1 (plano: `docs/plans/archive/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** no desktop, o mouse hoje só move a **cabeça** do modelo
> (head-tracking Beat 1). O `memorable-moments.md` (Beat 4) prometia "labels
> de HUD em parallax de velocidades diferentes — profundidade real, não
> decoração" e isso não foi entregue. Desktop é onde há pointer; este spec faz
> o cursor gerar **profundidade de verdade** entre camadas (modelo, HUD,
> fundo), sem exigir hover sobre nenhum elemento específico.

## 2. Visual Goal

Mover o mouse no desktop cria uma sensação sutil de **paralaxe de câmera +
camadas** — o modelo, o HUD/texto e o fundo deslocam em velocidades diferentes,
como um frame de filme com profundidade. É quase imperceptível isoladamente,
mas dá "vida" e separa a peça de um model viewer.

- **Emoção:** presença física, cena viva.
- **Restrição:** nunca tão forte a ponto de parecer "efeito de mouse" barato.
  Subtleza é o requisito.

## 3. Comportamento (três camadas de profundidade)

| Camada                | Resposta ao pointer                                         | Amplitude (guias)                                   |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| **Modelo / câmera**   | micro-parallax aditivo na câmera (além do head-tracking)    | deslocamento ≤ ~0.5–1% da posição; muito amortecido |
| **HUD / texto**       | parallax próprio, velocidade diferente do modelo            | alguns px; elementos mais "perto" movem mais        |
| **Fundo / atmosfera** | parallax mais lento (já parcialmente existe via partículas) | mínimo                                              |

- **Implementação:** offset de pointer **aditivo** no `CameraRig` (somado ao
  scroll-driven, nunca substituindo), e uma camada de HUD com parallax por
  velocidade. O estado de pointer já existe (`windowPointer`); reusar.
- **Amortecimento:** mola/lerp generoso — o parallax "assenta" quando o mouse
  para; sem jitter.
- **Head-tracking (Beat 1) permanece** como está; o parallax de câmera é um
  incremento separado e menor.

## 4. Degradação

- **Somente Desktop High.** Mobile usa gyro (P2b.2); Mobile Low /
  `prefers-reduced-motion` desliga todo parallax de pointer.
- Sem pointer (`hover: none`), nada muda.

## 5. Critérios de aceite (mensuráveis)

| #   | Critério                                                           | Medição                                |
| --- | ------------------------------------------------------------------ | -------------------------------------- |
| 1   | Mover o mouse cria profundidade perceptível entre modelo/HUD/fundo | revisão humana + vídeo                 |
| 2   | Sem mouse, tudo assenta em repouso (sem drift residual)            | observação                             |
| 3   | Amplitude sutil — não lê como "efeito"                             | rubrica "sensação cinematográfica" ≥ 4 |
| 4   | `prefers-reduced-motion`: parallax desligado                       | teste                                  |
| 5   | Nenhum custo de GPU relevante (offsets, não passes)                | `budget.spec.ts`                       |

## 6. Stop Conditions

- [ ] Parallax fica perceptível demais / enjoa → reduzir amplitude até sutil.
- [ ] Conflita com o head-tracking (movimento duplo estranho) → separar
      responsabilidades (cabeça segue olhar; câmera faz parallax) e calibrar.

## 7. Evidências

- Vídeo 1440 mostrando movimento de mouse e resposta das camadas.
- Par de screenshots com o cursor em posições extremas (diff sutil):
  `docs/evidence/desktop-pointer-parallax/1440-hero-{left,right}.png`
  (`scripts/collect-parallax-evidence.mjs`).

> Nota de verificação: o Chromium headless reporta `hover: none`, então o gate
> de pointer é emulado no coletor via CDP (`Emulation.setEmulatedMedia`) para
> gerar a evidência. Em dispositivo real com mouse, o gate `(hover: hover)` já
> é verdadeiro.
