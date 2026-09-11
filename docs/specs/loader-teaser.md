# Scene Spec: Loader como Teaser (primeira impressão)

## 1. Context

**Section:** preloader (antes do Hero)
**Wave:** P1a.1 (plano: `docs/plans/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** o preloader atual é funcional ("SPIDER-MAN / barra / %") mas
> não é o **teaser cinematográfico** que o próprio projeto pede — pelo oposto,
> a restrição do projeto diz que o carregamento *pode e deve* ser tratado como
> parte da experiência, não como obstáculo. O GLB pesa ~22 MB; esse tempo
> existe de qualquer jeito. A decisão é transformá-lo em **build-up**.

## 2. Visual Goal

O load é o primeiro momento memorável, não a espera. Enquanto o modelo carrega,
**algo do personagem surge aos poucos** — o visitante já entende o tom antes de
ver a primeira dobra.

Duas direções possíveis (escolher no Look Dev; A é preferida por não depender
de o GLB estar pronto):

- **A — o olho acende com o progresso.** Um elemento gráfico 2D (SVG/canvas)
  das lentes da máscara, inicialmente apagadas; à medida que o progresso sobe,
  os olhos ganham emissivo (o `signal`/`paper` dos tokens), como o LED subindo.
  Simples, legível em qualquer viewport, não requer WebGL.
- **B — teia se desenhando.** Uma linha fina de teia se desenha progressivamente
  (stroke-dashoffset) enquanto carrega. Mais sutil, menos icônico.

Em ambos: a barra de progresso convencional some ou vira um elemento secundário
mínimo (o número `%` pode ficar). O **gradual reveal é o progresso**.

- **Emoção:** antecipação. "Algo está acordando."
- **Saída:** quando `progress = 100` e `active = false`, o loader faz fade-out
  e **assenta com a primeira dobra** — o olho aceso do loader "entrega" o olho
  aceso do Hero, sem corte.

Reference: `docs/design/design-bible.md` ("nos primeiros 5s deve sentir que
abriu um frame de filme").

## 3. Composition

- Centro do frame; tipografia `display` para `SPIDER-MAN` + `BRAND NEW DAY`
  (já existe), com o elemento de olho/teia acima ou integrado.
- Mobile e desktop iguais em estrutura (o loader não tem composição dupla) —
  apenas escala tipográfica muda.
- Nada na tela além de: marca + elemento de progresso + `%` pequeno. Sem
  fundo decorativo (proibido por design-bible: sem bokeh/orbs/stock).

## 4. Comportamento / Animação

- Progresso vem de `useProgress` (drei) — já é a fonte atual.
- O emissive do olho (A) mapeia `progress` 0→100 (e o "hold" em 100 por ~300ms
  antes do fade, como hoje).
- Fade-out do loader: `MOTION.duration.slow`, `opacity` para 0, depois
  `onLoaded()` desmonta.
- **Costura com o Hero:** idealmente o fade do loader coincide com o início do
  drift idle do modelo, para a transição ler como "continuação", não "troca de
  tela".
- **`prefers-reduced-motion`:** comportamento atual se mantém — sem animação
  de reveal; o loader desmonta imediatamente ao completar (já implementado em
  `CinematicLoader`).

## 5. Copy

- Manter `Carregando` (kicker mono) ou substituir por algo no tom, ex.:
  `preparando a cena`. Decisão de copy no Look Dev; não pode virar marketing.
- `%` permanece como dado mono pequeno.

## 6. Performance

- O elemento de teaser é 2D (SVG/canvas), **não** aguarda o GLB — custo
  desprezível e independente do asset pesado.
- Nenhum draw call WebGL novo.

## 7. Critérios de aceite (mensuráveis)

| # | Critério | Medição |
|---|---|---|
| 1 | Quem vê só o loader já entende o tom do site | revisão humana |
| 2 | Progresso legível (elemento de reveal ou %) | screenshot em 3 estados: 0%, ~50%, 100% |
| 3 | Transição loader→Hero sem corte perceptível | vídeo / revisão |
| 4 | `prefers-reduced-motion`: sem reveal, desmonta ao completar | teste |
| 5 | Nenhum asset pesado novo no loader | inspeção de rede |
| 6 | Rubrica "primeira dobra / impacto imediato" ≥ 4 | rubrica |

## 8. Stop Conditions

- [ ] Teaser depende de o GLB estar carregado → refazer (o teaser é o que
      preenche a espera, não pode esperar).
- [ ] Elemento decorativo genérico (orbs/bokeh) → proibido por design-bible.
- [ ] Fade corta com a primeira dobra → ajustar timing.

## 9. Evidências

- `docs/evidence/loader-teaser/{0,50,100}.png` + vídeo do fade→Hero.
