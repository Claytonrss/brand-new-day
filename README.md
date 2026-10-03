# Spider-Man: Brand New Day — landing page 3D de animação procedural

[![CI](https://github.com/Claytonrss/brand-new-day/actions/workflows/ci.yml/badge.svg)](https://github.com/Claytonrss/brand-new-day/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![3D model: CC BY 4.0](https://img.shields.io/badge/3D_model-CC%20BY%204.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/)

Projeto de portfólio sobre animação em tempo real na web: um personagem 3D cuja cabeça
acompanha o cursor, um rig procedural de 16 joints sobre um modelo que não traz nenhuma
animação embutida e uma câmera contínua guiada pelo scroll. Projeto de fã, não comercial.

**→ [Demo ao vivo](https://brand-new-day-fan.vercel.app/)**

![Head tracking — a cabeça do personagem acompanha o cursor](docs/assets/head-tracking.gif)

## Animação

### Head tracking

A cabeça segue o cursor em dois eixos (posição do ponteiro normalizada na janela). Os
limites de rotação são definidos à mão, assimétricos: cerca de 20,6° de yaw para a direita,
17,2° para a esquerda e 13,7° de pitch, com clamp suave que dobra o movimento nas bordas em
vez de cortá-lo. A rotação se distribui por uma cadeia de três ossos — cabeça, pescoço e
tronco — com pesos decrescentes e molas de rigidez própria: o tronco acompanha menos, e mais
devagar. Sem ponteiro ativo (toque ou idle), um ruído procedural mantém um drift sutil.

O halo do spider-sense é ancorado no osso do crânio e projetado para a tela a cada frame;
com a cabeça fora do quadro, ele entra pela borda mais próxima, como na convenção dos
quadrinhos. No mobile, a inclinação do aparelho (giroscópio opt-in) orienta o corpo, e a
cabeça compensa parte do giro para manter o olhar no observador.

### Rig procedural

O GLB contém zero animações — `animations: 0` no header do asset, com 66 joints no esqueleto,
verificado com `pnpm inspect:glb`. Todo o movimento é gerado em código por um rig procedural
que manipula 16 desses joints:

- vida idle: respiração, sway, transferência de peso e micro-tremor;
- poses por beat da narrativa;
- aterrissagem por molas subamortecidas, com overshoot de 4–6%;
- lean proporcional à velocidade de scroll;
- piscada sintética: sem pálpebras no asset, um "obturador" no shader das lentes fecha sobre
  elas na cor do traje — simplificação assumida ([TD-001](docs/memory/tech-debt.md)).

Os testes unitários cobrem a matemática da animação: o overshoot das molas, o clamp suave dos
limites de rotação da cabeça e o timing dos beats.

### Câmera contínua

Uma spline Catmull-Rom para posição e outra para look-at — keyframes por breakpoint
(mobile/desktop), FOV interpolado por trechos — conduz a câmera pelos 7 beats da página,
sincronizada ao scroll com GSAP ScrollTrigger e Lenis. O pico de mudança de direção por
frame é de 62,1°, com p95 de 20,2° ([ADR-011](docs/memory/decisions.md)); o pico restante é
staging intencional, não erro de curva.

![Scroll do hero até o Arsenal](docs/assets/demo-loop.gif)

## Desenvolvimento com IA

O projeto foi construído com um orquestrador delegation-only: um agente que lê o estado do
repositório e delega — não edita arquivos nem escreve no git — para 10 agentes especializados
do [`opencode.json`](opencode.json), cada um com sua allowlist de comandos. Dependências
novas são decisão humana; operações destrutivas são negadas por padrão. As decisões de
arquitetura estão registradas como ADRs em [`decisions.md`](docs/memory/decisions.md); o
desenho completo no [case study](docs/case-study-ai-harness.md).

## Stack

| Camada    | Ferramentas                                                        |
| --------- | ------------------------------------------------------------------ |
| UI        | React 19 · TypeScript 5.9 · Tailwind CSS v4                        |
| 3D        | three.js · @react-three/fiber · drei · @react-three/postprocessing |
| Motion    | GSAP ScrollTrigger · Lenis                                         |
| Assets    | glTF + meshopt · KTX2 (Basis)                                      |
| Qualidade | Vitest · Playwright · ESLint · Prettier · Husky + commitlint       |
| Build     | Vite 8 · Vercel                                                    |

Medições de performance e limitações conhecidas: [`docs/performance.md`](docs/performance.md).

## Como rodar localmente

```bash
git clone https://github.com/Claytonrss/brand-new-day.git
cd brand-new-day
pnpm install
pnpm dev
```

Requer Node ≥ 22 e pnpm 9. `pnpm verify` roda os gates (lint, typecheck, testes e build);
`pnpm test:smoke`, a suíte smoke; `pnpm inspect:glb`, os metadados do asset; `?debug`, o HUD.

**Privacidade:** Vercel Analytics e Speed Insights (sem cookies, same-origin) e um beacon
anônimo de `webgl_unavailable` (sem PII). Fontes e ambiente HDR são self-hosted; nada
externo no load.

## Créditos e licença

- **Código:** MIT — [LICENSE](LICENSE)
- **Modelo 3D:** "Spider-Man Brand New Day" por Eskze
  ([Sketchfab](https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda)),
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), convertido e otimizado (KTX2 +
  meshopt, [ADR-029](docs/memory/decisions.md)). A atribuição aparece no app junto do modelo
  (hero, Arsenal, corpo inteiro e colophon), visível sem hover, e um spec do Playwright falha
  se ela sumir.
- **Fontes:** Space Grotesk e JetBrains Mono, SIL OFL 1.1 ([OFL.txt](public/fonts/OFL.txt))
- **Aviso:** projeto de fã, não comercial, sem afiliação ou endosso de Marvel, Sony ou
  Disney. Lista completa de terceiros: [NOTICE.md](NOTICE.md)

---

Feito por **Clayton Rafael** · [LinkedIn](https://www.linkedin.com/in/clayton-rafael/) ·
[GitHub](https://github.com/Claytonrss)
