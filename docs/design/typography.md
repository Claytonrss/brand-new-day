# Sistema Tipográfico

> A tipografia comunica gosto visual e direção editorial — o projeto não
> depende só do 3D.

## Fontes

| Família            | Uso                                          | Pesos   |
| ------------------ | -------------------------------------------- | ------- |
| **Space Grotesk**  | títulos e copy principal                     | 400–700 |
| **JetBrains Mono** | labels diegéticos/HUD e metadados narrativos | 400–500 |

> **Entrega (2026-09-12):** fontes **self-hosted** em `public/fonts/`
> (subset latin, SIL OFL — ADR-021). Space Grotesk é **variável (400–700)**
> — aberto a weight/tracking dirigidos por velocidade (IDEIA-PAG-01,
> `docs/plans/backlog.md`).

**Proibido:** cream + serif, eyebrow em caixa-alta decorativo, qualquer fonte
fora dessas duas.

## Papel dos labels mono

Labels mono devem parecer **instrumentos narrativos de vigilância/anonimato**
(ex: timestamps, coordenadas, designações de arquivo) — não decoração
tecnológica genérica. Se um label mono não faz sentido diegético, ele não
existe.

## Escala tipográfica

### Mobile (390px base)

| Elemento       | Tamanho | Line-height | Tracking           | Peso    |
| -------------- | ------- | ----------- | ------------------ | ------- |
| Kicker (mono)  | 11px    | 1.4         | +0.18em, uppercase | 500     |
| Título display | 40–52px | 1.02–1.08   | -0.02em            | 600–700 |
| Corpo          | 16–17px | 1.55        | 0                  | 400     |

### Desktop (1440px base)

| Elemento       | Tamanho  | Line-height | Tracking          | Peso    |
| -------------- | -------- | ----------- | ----------------- | ------- |
| Kicker (mono)  | 12px     | 1.4         | +0.2em, uppercase | 500     |
| Título display | 72–110px | 1.0–1.05    | -0.025em          | 600–700 |
| Corpo          | 18–20px  | 1.5         | 0                 | 400     |

## Quebras de linha intencionais (fechadas)

- Evolution: `Algo nele\nestá mudando.`
- Arsenal: `Sem apoio.\nSó o essencial.`
- FullBody: `Um homem\nsem nome.\nUma cidade\nsem escolha.`

Quebras são especificadas no Scene Spec de cada seção e renderizadas com
`<br/>` ou `white-space: pre-line` — nunca deixadas ao acaso do wrap.

## Regras

1. Títulos podem ser grandes, mas devem caber no mobile sem quebra acidental.
2. Evitar texto longo dentro do viewport — cada seção tem uma ideia verbal
   forte e curta.
3. Contraste e espaçamento com precisão: texto legível sobre o 3D **sem**
   virar caixa/card.
4. Não usar cards para explicar o projeto — a interface é pôster vivo, não
   dashboard.

## Critérios de aceite

- [ ] Cada seção tem escala tipográfica mobile e desktop definida no Scene Spec.
- [ ] Cada título tem quebra de linha intencional.
- [ ] Verify confirma que não há texto estourando, sobrepondo o foco visual
      ou competindo com o personagem.
