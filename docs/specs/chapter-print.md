# Spec: Chapter Print — chapter cards como impressão (IDEIA-AMB-04)

## 1. Context

**Branch:** `feat/beat-chrome` · **Plan:** Pareto §Wave 5, T5.3 · **Date:** 2026-09-12

## 2. Goal

As transições (MUDANÇA, REVELAÇÃO) leem como **página de quadrinho impressa**:
trama de meios-tons, misregistration de registro de cor e um fio de teia que
se desenha na entrada. O `bg-ink` sólido permanece (contraste editorial com
as seções 3D).

## 3. Camadas (estáticas, exceto o fio)

1. **Halftone** — overlay absoluto sobre o card:
   `radial-gradient(circle, rgba(233,229,218,.55) 1px, transparent 1.4px)`
   em tile de 7 px, **opacity 0.06** (teto do plano). Nunca anima.
2. **Misregistration** — no `<h2>` do título:
   `text-shadow: 1px 0 0 rgba(122,31,36,.25), -1px 0 0 rgba(44,59,76,.25)`
   (oxide/steel a 25%, offset 1 px). Estático — não é aberração animada.
3. **Fio de teia** — SVG absoluto (viewBox 100×100, `preserveAspectRatio=
"none"`), path diagonal com barriga (`M -2 26 Q 50 44 102 18`),
   `vector-effect: non-scaling-stroke`, stroke paper a 35%:
   - com motion: `stroke-dasharray/dashoffset` via `pathLength=1`, desenha
     uma vez na entrada (ScrollTrigger `once` em `top 70%`, ease power2.out,
     ~1.2 s);
   - `prefers-reduced-motion`: **nenhum atributo de dash é aplicado** — o fio
     nasce desenhado e estático (estado final).

## 4. Não-objetivos

- Nenhuma animação contínua (o card continua parado fora da entrada).
- Nenhuma cor fora da paleta (paper/oxide/steel apenas).
- O conteúdo/copy dos cards não muda.

## 5. Aceite

- Screenshots 390/430/1440 dos dois cards (T5.4).
- `reduced-motion.spec` permanece verde (estado final estático).
- `pnpm verify` verde.
