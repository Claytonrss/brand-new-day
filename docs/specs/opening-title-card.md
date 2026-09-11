# Scene Spec: Opening Title Card (Beat 0)

## 1. Context

**Section:** novo — antes do Hero (entre o preloader e a primeira dobra 3D)
**Wave:** P1a.2 (plano: `docs/plans/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** hoje o preloader desmonta direto no Hero, que já chega com o
> modelo + título + copy de uma vez. Não há **respiração**. As referências
> (trailers, jazeancoffee) usam um beat tipográfico seco antes do conteúdo —
> um card de título que cria silêncio e faz o frame seguinte bater mais forte.

## 2. Visual Goal

Um card de título estilo trailer, ~100vh, **antes** do modelo aparecer. O
primeiro frame 3D (a máscara) acontece **depois** deste beat de silêncio
tipográfico — e por isso carrega mais peso.

- **Emoção:** antecipação contida. Sem imagem, só voz.
- **Relação com o modelo:** nenhuma. O Canvas ainda está em fundo de névoa /
  preto (ou a câmera no keyframe Hero inicial, modelo ainda apagado). O
  personagem **não** compete com o título.

**Copy proposta (sequência, seco, pt-BR):**

> (kicker mono) `uma peça de portfólio`
> (título display) `SPIDER-MAN:`
> (segunda linha) `BRAND NEW DAY`
> (hint mono, pequeno, canto) `role`

Decisão no Look Dev entre (a) este card de título do filme ou (b) um card de
intenção ("uma cena interativa"). O (a) é mais trailer; o (b) é mais
portfólio. Não usar os dois.

## 3. Composition

- Centralizado, muito espaço negativo (design-bible proíbe preencher com texto).
- Mobile e desktop: mesma estrutura; só escala tipográfica muda (Hero usa
  `44px→80px`; aqui pode ir maior ainda, já que não há modelo disputando).
- Hint `role` no canto inferior, mono, sutil, some após o primeiro scroll.

## 4. Comportamento / Animação

- Entrada: SplitText por caractere (reusar `SplitTextHeadline`), disparado no
  mount (não por scroll, pois é o primeiro beat).
- Saída: ao começar o scroll, o texto sobe/sai (yPercent) e funde com o Hero —
  o usuário sente que o scroll "acorda" a cena.
- **Câmera:** neste beat a câmera está no keyframe Hero inicial, mas o modelo
  pode estar em névoa/sem luz forte (ver `atmosphere-per-beat.md` — o Beat 0
  teria atmosfera mínima). O "acender" do Hero acontece ao entrar no beat 1.
- **`prefers-reduced-motion`:** texto visível sem animação de entrada; hint
  estático.

## 5. Performance

- +100vh de altura de página (700vh → ~800vh junto com o colofon; atualizar
  mapa de beats/`cameraPath`).
- Nenhum draw call novo (o modelo já está montado).

## 6. Critérios de aceite

| # | Critério | Medição |
|---|---|---|
| 1 | O primeiro frame 3D (máscara) acontece **depois** do card, não junto | revisão de scroll |
| 2 | Card lê como respiração, não como "mais um título" | rubrica "sensação cinematográfica" ≥ 4 |
| 3 | Não compete com o Hero (o Hero continua o momento de impacto) | comparativo de capturas |
| 4 | `prefers-reduced-motion`: sem animação de entrada | teste |

## 7. Stop Conditions

- [ ] O card vira "tela de título de marketing" → cortar (é trailer, não hero).
- [ ] Rouba o impacto do Hero em vez de prepará-lo → ajustar duração/tom.

## 8. Evidências

- `docs/evidence/opening-title-card/{0}-scroll.png` (3 viewports) + vídeo do
  scroll card→Hero.
