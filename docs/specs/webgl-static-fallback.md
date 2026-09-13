# Scene Spec: Fallback WebGL — poster editorial estático

## 1. Context

**Section:** transversal (toda a página quando WebGL falha)
**Wave:** P3.2 (plano: `docs/plans/archive/portfolio-impact-plan.md`)
**Author:** @plan
**Date:** 2026-09-10

> **Motivação:** hoje, sem WebGL, o `ErrorBoundary` em `App.tsx` renderiza um
> fundo preto com a frase "3D unavailable" em mono cinza. É o mínimo de
> polidez, mas não é o "fallback minimamente apresentável" que o projeto pede
> (`performance-design.md`: "o fallback é uma escolha visual, não uma página
> quebrada"). Uma peça de portfólio não pode mostrar uma mensagem de erro —
> mesmo no pior caso ela deve continuar bonita.

## 2. Visual Goal

Sem WebGL, a página vira uma **landing editorial estática** coerente: um
**poster 2D** (imagem do modelo renderizada uma vez) + o mesmo copy das
seções em layout editorial + a atribuição. Quem não tem WebGL ainda vê a peça
— só que como um pôster, não como cena.

- **Emoção:** a mesma — sombria, cinematográfica — em forma estática.
- **Decisão:** o fallback é um _poster_, não um "modo degradado do 3D".

## 3. Estratégia do asset 2D

Gerar **uma** imagem estática de alta qualidade do modelo (ver ADR-020 —
Higgsfield, ou render off-screen único do próprio modelo):

- **Opção A (preferida):** render off-screen do modelo real (headless,
  `preserveDrawingBuffer` ou render-to-texture), capturado uma vez, servido
  como poster. Mantém a "verdade" do asset.
- **Opção B:** imagem gerada via Higgsfield (silhueta/poster estilizado).
- **Opção C:** SVG da silhueta (mais leve, menos rico).

Servir como `webp`/`avif` com fallback; pré-carregar com `<link rel="preload">`
no fallback apenas.

## 4. Comportamento

- `App.tsx` `ErrorBoundary`: em vez do "3D unavailable", monta uma versão
  estática das seções (Hero/Evolution/Arsenal/FullBody) com a imagem como
  fundo/decor e o copy em layout editorial.
- **Detecção proativa (melhor que boundary):** checar suporte a WebGL antes de
  montar o Canvas (`canvas.getContext('webgl2')`/`'webgl'`) e renderizar o
  poster de cara, sem tentar o 3D.
- Sem Canvas, sem Lenis pesado opcional, sem GSAP de scroll 3D — o conteúdo
  rola como página editorial normal.
- **`prefers-reduced-motion`:** irrelevante aqui (não há cena), mas o layout
  já é estático por definição.

## 5. Copy no fallback

- Manter o copy das 4 seções (alinhado à decisão do P0.4 no FullBody).
- Um aviso discreto, no tom, de que a versão interativa usa WebGL — ex. uma
  linha mono no rodapé: `a versão interativa requer WebGL`. Não um alerta.

## 6. Critérios de aceite (mensuráveis)

| #   | Critério                                                        | Medição                           |
| --- | --------------------------------------------------------------- | --------------------------------- |
| 1   | Sem WebGL, a página é uma landing editorial coerente (não erro) | screenshot com WebGL desabilitado |
| 2   | Copy das seções e atribuição presentes                          | revisão                           |
| 3   | Aviso sobre WebGL no tom, não alerta                            | revisão                           |
| 4   | Nenhum erro de console no caminho de fallback                   | `console.spec.ts` com WebGL off   |
| 5   | Imagem do poster dentro da paleta (ink/oxide/signal)            | curadoria vs design-bible         |

## 7. Stop Conditions

- [ ] Fallback é só "mensagem de erro bonita" → adicionar poster + layout
      editorial.
- [ ] Imagem gerada fere a paleta (design-bible) → recuar para render
      off-screen do modelo.

## 8. Evidências

- `docs/evidence/webgl-fallback/screenshot.png` (com WebGL desabilitado).
