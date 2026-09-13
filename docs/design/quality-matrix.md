# Matriz de Qualidade por Dispositivo

> Três perfis definidos antes da implementação. A implementação sabe
> exatamente o que desligar em cada perfil. Esta matriz entra nos critérios
> de verify.

> **Status da implementação (2026-09-12):** o código degrada
> `medium → low` abaixo de **30 fps** (não 45) — o threshold mobile-only de
> ~40 fps ficou **data-gated** (FALHA-02, decisão pós-Wave 0). O `medium`
> mantém sombras, hoje com **throttle** de 10 Hz (ADR-023). Fonte da
> verdade: `PerformanceMonitor.tsx`.

| Perfil           | Condição                                              | Modelo                                   | Luz                                                              | Post-processing                         | Motion                                                                    | Meta                         |
| ---------------- | ----------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- | ---------------------------- |
| **Desktop High** | telas largas e GPU estável                            | GLB otimizado (ou original se performar) | luz completa (key + rim + fill)                                  | Bloom + Vignette + grão discreto        | scroll rig completo + parallax + head-tracking                            | impacto máximo               |
| **Mobile Good**  | celulares modernos, FPS ≥ 45                          | GLB otimizado                            | luz simplificada, silhueta preservada (key + rim, fill opcional) | Bloom reduzido/seletivo + Vignette leve | camera rig completo, parallax contido, drift automático no lugar de hover | experiência principal        |
| **Mobile Low**   | FPS baixo, aparelho fraco ou `prefers-reduced-motion` | GLB otimizado/fallback                   | luz mínima legível (key + rim fraco)                             | sem Bloom/grão; Vignette opcional       | câmera mais estática, entradas reduzidas                                  | manter design e legibilidade |

## Detecção de perfil

- **Mobile Low**: `prefers-reduced-motion: reduce` OU FPS médio < 30 medido
  nos primeiros segundos OU device memory/hardware concurrency baixo
  (quando disponível via `navigator`).
- **Mobile Good**: viewport < 768px sem as condições acima.
- **Desktop High**: viewport ≥ 768px com FPS estável.

## Regras

- Mobile Low ainda parece uma escolha visual, não uma página quebrada.
- A degradação segue a ordem de `performance-design.md` — silhueta e
  composição nunca são as primeiras variáveis sacrificadas.
- A transição entre perfis não deve ser perceptível como "pop" visual.
