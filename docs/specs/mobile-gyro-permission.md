# Scene Spec: Mobile — Gyro com permissão iOS + fallback

## 1. Context

**Section:** transversal (Hero e beats com parallax)
**Wave:** P2b.2 (plano: `docs/plans/archive/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** o gyro mobile **existe** (`useInteraction.ts` faz
> `addEventListener('deviceorientation')` e calibra na primeira leitura), mas
> **não funciona no iPhone**: o Safari iOS exige
> `DeviceOrientationEvent.requestPermission()` chamado **por um gesto do
> usuário** (toque). Sem isso, o evento nunca dispara e o "parallax por
> sensor" simplesmente não existe no iOS. Além disso, não há **fallback
> orientado** quando o sensor está ausente/negado. Este spec cobre o fluxo de
> permissão, os estados e o fallback.

## 2. Visual Goal

No mobile, mover o celular produz um parallax sutil da cena (o mesmo efeito
que o gyro já implementa, hoje morto no iOS). O pedido de permissão é **parte
da experiência**, não um alerta do sistema aparecendo do nada: um prompt
pequeno, no tom da peça, que o usuário toca para ativar.

- **Emoção:** "o personagem reage ao meu movimento" — presença física.
- **Restrição:** o prompt não pode quebrar a imersão nem cobrir a máscara.

## 3. Fluxo de estados

```
                    ┌─────────────────────────────────────┐
                    │  DeviceOrientationEvent disponível? │
                    └─────────────────────────────────────┘
                          │ não / desktop
                          ▼
                    ┌──────────────┐
                    │ FALLBACK:    │  parallax por scroll + drift idle
                    │ scroll-only  │  (nenhum prompt é mostrado)
                    └──────────────┘
                          │ sim (mobile com sensor)
                          ▼
              ┌────────────────────────┐
              │ precisa de permissão?  │  typeof DeviceOrientationEvent
              │ (iOS 13+)              │  .requestPermission === 'function'
              └────────────────────────┘
                 │ não (Android)            │ sim (iOS)
                 ▼                          ▼
        ┌─────────────────┐      ┌──────────────────────┐
        │ ativa direto     │      │ mostra prompt por     │
        │ (sem prompt)     │      │ gesto (1ª visita)     │
        └─────────────────┘      └──────────────────────┘
                                        │ toque em "ativar"
                                        ▼
                          ┌──────────────────────────┐
                          │ requestPermission()       │
                          └──────────────────────────┘
                             │ granted        │ denied / erro
                             ▼                ▼
                      ┌────────────┐   ┌──────────────────┐
                      │ gyro ativo │   │ FALLBACK scroll  │
                      └────────────┘   │ + não pede de novo│
                                       └──────────────────┘
```

## 4. Prompt de permissão (iOS)

- **Gatilho:** primeira vez que o usuário toca/rola no Hero (gesto), e **só**
  se `requestPermission` existir e ainda não tiver sido respondida.
- **UI:** elemento pequeno, mono, tom da peça — ex.: um chip discreto no canto
  inferior: `mover o celular reage · ativar` com um botão. Não é modal, não
  bloqueia o scroll, e some sozinho se ignorado.
- **Copy proposta:**
  - Chip: `Esta cena reage ao movimento.`
  - Botão: `ativar` / (depois de negado) `seguir sem movimento`
- **Persistência:** a escolha (granted/denied/dismissed) fica em
  `localStorage` para não pedir de novo a cada visita.
- **`prefers-reduced-motion`:** **nunca** mostra o prompt e nunca ativa o
  gyro — o usuário já declarou que quer menos movimento.

## 5. Fallback (sensor ausente, negado ou desktop)

Quando o gyro não está disponível:

1. **Parallax por scroll** (já existe via câmera) continua sendo a experiência.
2. **Drift idle** sutil do modelo (já existe no rig) mantém a cena "viva" sem
   depender de sensor.
3. Nenhum prompt, nenhum estado quebrado, nenhuma UI morta.

O fallback deve ser **indistinguível de uma escolha de design** — quem não tem
gyro não sente que perdeu algo.

## 6. Integração técnica (direção)

- `useInteraction.ts`: encapsular o gate de permissão; expor estado
  (`gyroState: 'unavailable' | 'prompt' | 'granted' | 'denied'`) via
  `qualityContext` ou store de interação, para a UI reagir.
- O cálculo `gyroTarget(gamma, beta, origin)` já existe e é reutilizado sem
  mudança — só muda **quando** o listener é registrado (após grant).
- Amplitude do parallax por gyro: conservadora (o projeto já clamp yaw/pitch);
  calibrar no dispositivo real (TD-002).

## 7. Critérios de aceite (mensuráveis)

| #   | Critério                                                         | Medição                   |
| --- | ---------------------------------------------------------------- | ------------------------- |
| 1   | iOS: após tocar "ativar", mover o celular orbita a cena          | dispositivo real (TD-002) |
| 2   | iOS: negar → fallback por scroll, sem prompt repetido            | dispositivo real          |
| 3   | Android: gyro ativa sem prompt                                   | dispositivo real          |
| 4   | `prefers-reduced-motion`: prompt nunca aparece, gyro nunca ativa | teste de mídia + revisão  |
| 5   | Sem sensor/desktop: nenhum prompt, experiência intacta           | teste visual              |
| 6   | Nenhum listener registrado antes do grant                        | inspeção / unit test      |

## 8. Riscos

| Risco                                                | Mitigação                                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| Não verificável em headless (SwiftShader sem sensor) | aceite em dispositivo real (TD-002); lógica de estados coberta por unit test |
| Prompt quebrar a imersão do Hero                     | UI mínima, dismissável, fora da zona da máscara                              |
| Usuário nega e a experiência "perde" algo            | fallback por scroll + drift idle já é a experiência atual (não há regressão) |

## 9. Evidências

- Vídeo em dispositivo real (iOS) mostrando: prompt → grant → parallax.
- Vídeo do fallback (sensor negado/ausente).
- Screenshot do chip de permissão (não cobrindo a máscara).
