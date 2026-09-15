# Scene Spec: Colophon — Outro (fechamento de portfólio)

## 1. Context

**Section:** Colophon (nova seção, depois do FullBody)
**Wave:** P1b.1 (plano: `portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** a experiência termina hoje de forma abrupta — o FullBody mostra
> o modelo e a atribuição CC-BY, e acaba. Não há nada sobre **quem fez**, com
> o quê, ou para onde ir. Para uma peça de portfólio, isso é o problema
> central: o visitante não sai sabendo que foi feito à mão. O colofon é o
> fechamento editorial que transforma "demo de engine" em "peça de autor".

## 2. Visual Goal

Depois do "pôster vivo" do FullBody, o modelo **sai de cena** e o frame vira
uma página editorial quieta — quase um letreiro de fim de filme. É o único
momento em que o texto (não o personagem) é o primeiro sinal visual, e isso é
intencional: a revelação já aconteceu; agora é a assinatura.

- **Emoção:** resolução, autoria, sobriedade.
- **Ritmo:** o mais lento da página. Nada se move rápido. O scroll "assenta".
- **Contraste:** depois de 700vh de vermelho/preto denso, o colofon usa mais
  espaço vazio e menos luz — o descanso que faz a assinatura ler como
  intencional.

**Copy aceita (2026-09-14, BUG-PLAN B3 — tom: sóbrio, autoral, técnico; pt-BR):**

- Kicker: `Portfólio — Clayton R.` (a assinatura lê sem scroll extra na seção)
- Título: `Feito à mão.`
- Corpo §1 (o argumento do craft):
  > Um personagem icônico como pretexto para resolver problemas verdadeiros:
  > rig procedural sem clipes, câmera scroll-driven com Catmull-Rom e
  > degradação adaptativa por tier de hardware.
- Corpo §2 (o movimento como tese):
  > 66 joints, zero animações pré-gravadas. Todo o movimento é gerado em
  > runtime — a página inteira é um argumento em código.
- Desafios técnicos (lista mono, `11px`, `dim/70`, bullet `·`):
  - Rig procedural com molas, respiração e spider-sense em runtime
  - Câmera Catmull-Rom sincronizada com 7 beats de narrativa
  - Três tiers de performance sem corte visual brusco
  - 23 MB de GLB · 66 joints · zero janks em mobile mid-range
- Linha de stack (mono, pequena; inalterada):
  `React 19 · Three.js · GSAP ScrollTrigger · Lenis · WebGL`
- Atribuição (obrigatória, visível sem hover):
  > Modelo 3D "Spider-Man Brand New Day" · © Eskze · CC BY 4.0 · convertido e otimizado a partir do original
  > ("Eskze" linkado à página do modelo no Sketchfab; "CC BY 4.0" linkado ao legal code da licença; conformidade estrita CC-BY §3(a) — título da obra, © e indicação de modificação)
- Disclaimer fan-made (obrigatório, mesma tipografia da atribuição):
  > Projeto fan-made, sem fins comerciais — sem afiliação ou endosso da Marvel/Sony/Disney.
- CTAs (dois pesos; a regra antiga do "CTA único" evolui: o segundo destino
  existe, mas nunca com o peso do primário):
  - Primário: `ver o código →` (repositório, `signal` + `.magnetic-cta`)
  - Secundário: `Clayton no LinkedIn →` (LinkedIn, `dim`, sublinhado discreto)

**Narrativa:** encerra o arco (Hero → Evolution → Arsenal → FullBody) com a
voz do autor. O herói sai de cena; quem fica é quem construiu a cena.

Reference: `docs/design/design-bible.md`, `docs/design/storyboard.md`

## 3. Composition

**Mobile (390×844, 430×932):**

- O modelo **não** precisa estar visível; se estiver, é silhueta distante no
  topo, quase apagada pela névoa.
- Bloco de texto centralizado verticalmente, max `82vw`, margem ≥ `24px`.
- Atribuição no rodapé, sempre visível.

**Desktop (1440×900):**

- Muito espaço negativo. Texto em bloco estreito (max ~`480px`), alinhado à
  esquerda ou centralizado — decisão no Look Dev, mas **não** split-screen.
- Se o modelo aparecer, é uma presença residual (silhueta longínqua, escala
  pequena, quase fora de foco) — nunca competindo com o texto.

Reference: `docs/design/composition-rules.md` (regra geral: texto nunca cobre
rosto/símbolo — aqui não há momento-chave do personagem, então a zona segura é
livre, mas o espaço negativo é obrigatório).

## 4. 3D / Câmera

**Comportamento do modelo:** durante o scroll FullBody → Colophon, o modelo
**recede e apaga**. Opções (decidir no Look Dev, registrar em ADR se mudar o
asset):

- **A (preferida):** a câmera recua para um plano muito distante e o `FogExp2`
  - dessaturação por profundidade apagam a silhueta; o modelo some na névoa.
- **B:** fade de opacidade/emissivo do modelo até sumir; câmera estática.

Em ambos, o último frame 3D é uma **composição intencional**, não o modelo
cortado ao meio. Se o modelo permanecer visível no colofon, é como memória —
não como sujeito.

**Câmera:** estática no colofon (sem scroll-driven). O recuo acontece na
transição, não dentro da seção.

**Altura de scroll:** adicionar ~`100vh` à página (700vh → ~800vh). Atualizar o
mapa de beats/`cameraPath` para o novo segmento final.

Reference: `docs/specs/fullbody-living-poster.md` (de onde o colofon parte),
`src/components/3d/cameraPath.ts`

## 5. Lighting / Atmosphere

- Luz mínima e quieta: manter apenas o suficiente para a silhueta residual ler
  como "presença", não como "assunto".
- Atmosfera mais limpa que os beats anteriores (ver `atmosphere-per-beat.md`):
  densidade de partículas no mínimo, sem reação de luz a pointer.
- Nenhuma luz nova. Reusar `LightRig` com um cue `colophon` de baixa energia.

## 6. Interactions

- **Head-tracking / drag / gyro:** desligados ou com amplitude quase nula —
  o modelo não é mais o foco interativo.
- **Pointer parallax (desktop, se `desktop-pointer-parallax.md` estiver
  implementado):** apenas nos elementos de HUD/texto do colofon, muito sutil.
- **Links:** CTA e atribuição focáveis por teclado, com `:focus-visible`
  visível.
- **`prefers-reduced-motion`:** transição de saída do modelo vira corte
  suave/dissolve sem movimento de câmera; nenhum parallax.

## 7. Performance Budget

| Metric          | Target                 | Note                                         |
| --------------- | ---------------------- | -------------------------------------------- |
| Draw calls      | ≤ baseline (44–46)     | o modelo continua montado; nada novo em cena |
| Novas luzes     | 0                      | reusar `LightRig`                            |
| Post-processing | inalterado ou reduzido | sem passe novo                               |
| Memória         | ≤ +2 MB vs FullBody    | só DOM/texto novo                            |

Reference: `docs/design/performance-design.md`

## 8. Accessibility

- `<section aria-labelledby="colophon-title">` landmark.
- `<h2 id="colophon-title">Feito à mão.</h2>` acessível.
- Links com `rel="noopener noreferrer"` e texto descritivo.
- Ordem de leitura: kicker → título → corpo → stack → atribuição → CTA.
- `prefers-reduced-motion`: sem animação de entrada sequencial; conteúdo visível.

## 9. Critérios de aceite (mensuráveis)

| #   | Critério                                                                        | Medição                                   |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | Visitante identifica autor, stack e próximo passo sem scroll extra              | revisão humana + screenshot               |
| 2   | Atribuição CC-BY visível sem hover                                              | `credits.spec.ts`                         |
| 3   | Último frame 3D é composição intencional (não modelo cortado)                   | screenshot `*-scroll-100` nos 3 viewports |
| 4   | Rubrica "sensação cinematográfica/editorial" e "originalidade de portfólio" ≥ 4 | rubrica                                   |
| 5   | Nenhum draw call/luz novo                                                       | `budget.spec.ts`                          |
| 6   | `prefers-reduced-motion` sem movimento de saída                                 | `reduced-motion.spec.ts`                  |
| 7   | CTA focável e funcional                                                         | teste de a11y / manual                    |

## 10. Stop Conditions

- [ ] Spec ambíguo → voltar a @plan.
- [ ] Colofon lê como "página sobre mim" genérica → refazer copy (é assinatura
      de obra, não bio).
- [ ] Modelo residual compete com o texto → reduzir presença até o texto vencer.
- [ ] Visual < 4 após 3 iterações → escalar para humano.

## 11. Evidências

- `docs/evidence/colophon-outro/{390,430,1440}-scroll-100.png`
- Vídeo do scroll final (transição FullBody → Colophon) por viewport.
