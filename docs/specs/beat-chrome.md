# Spec: Beat Chrome — acento de beat no chrome DOM (IDEIA-PAG-05)

## 1. Context

**Branch:** `feat/beat-chrome` · **Plan:** Pareto §Wave 5, T5.1–T5.2 · **Date:** 2026-09-12

## 2. Goal

A página inteira lê o beat corrente: o chrome DOM (hairlines, kicker rules,
borda do chip, `::selection`) respira com a atmosfera 3D por beat — sem
fundos coloridos, sem texto colorido (design-bible).

## 3. Contrato

1. **Publicação:** `BeatProvider` publica no `<main>`:
   - atributo `data-beat="<beatId>"` (gancho de CSS/testes);
   - CSS var `--beat-accent` (transition 300 ms nos consumidores).

2. **Mapa de acentos** (`src/design/beatAccents.ts`):

| Beat        | Accent        | Racional                 |
| ----------- | ------------- | ------------------------ |
| `hero`      | `steel`       | frio, contido            |
| `chapter1`  | `oxide`       | antecipa o beat seguinte |
| `evolution` | `oxide`       | quente do símbolo        |
| `chapter2`  | `signal`      | antecipa o beat seguinte |
| `arsenal`   | `signal`      | acento máximo do Arsenal |
| `fullBody`  | `paper @ 60%` | poster neutro            |
| `colophon`  | `dim`         | recolhimento             |

3. **Aplicações permitidas (exaustivas):**
   - hairlines do HUD do Arsenal (SVG call-outs + borda da legenda mobile);
   - kicker rules (fio de 28×1 px antes do kicker de cada seção — novo);
   - borda do chip de gyro (`GyroPrompt`, 45% do accent);
   - `::selection` global.
     Nada mais recebe accent. `::selection` não transiciona (instantâneo).

4. **Fallbacks:** todo consumo usa `var(--beat-accent, …)` com o valor
   pré-hidratação atual (signal/steel) — a página nunca fica sem cor.

## 4. Aceite

- Unit: mapa cobre todos os `BeatId`s; chapterN antecipa o beat seguinte.
- `data-beat` muda com o scroll (inspecionável em device).
- `reduced-motion`: sem efeito (o accent é estático por beat, não animação
  contínua; a transição de 300 ms é CSS-only).
