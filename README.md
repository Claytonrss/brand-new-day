# Spider-Man: Brand New Day — 3D Portfolio Experience

Uma experiência web 3D cinematográfica construída para demonstrar direção de arte moderna, engenharia WebGL e frontend de alta performance.

> **Visual & Technical Showcase**  
> Inspirado na atmosfera urbana e isolada de Peter Parker pós-No Way Home, integrando o modelo 3D do Spider-Man a uma narrativa interativa guiada por scroll.

---

## 🛠️ Tech Stack

| Camada             | Tecnologia                                                   |
| ------------------ | ------------------------------------------------------------ |
| Framework          | Vite 8 + React 19 + TypeScript 5.9                           |
| Estilo             | Tailwind CSS v4                                              |
| 3D Engine          | Three.js + `@react-three/fiber` v9 + `@react-three/drei` v10 |
| Efeitos Visuais    | `@react-three/postprocessing` v3                             |
| Animações & Scroll | GSAP ScrollTrigger                                           |
| Testes             | Vitest (Unit) + Playwright (Visual Regression)               |
| Package Manager    | `pnpm` (v9+)                                                 |

---

## 🚀 Comandos

```bash
pnpm dev              # Iniciar servidor de desenvolvimento
pnpm build            # Build de produção (TypeScript + Vite)
pnpm verify           # Rodar todos os gates de qualidade (lint + typecheck + test + build)
pnpm test             # Testes unitários com Vitest
pnpm test:smoke       # Gate de PR Playwright (@smoke, mobile-390)
pnpm test:visual      # Suíte visual completa com Playwright
pnpm inspect:glb      # Inspeção de metadados do modelo GLB
```

A lista completa de comandos e o workflow de contribuição estão em
[AGENTS.md](AGENTS.md).

---

## 🎨 Palette & Design Tokens

- `ink` (`#0a0a0c`) — Fundo principal profundo
- `concrete` (`#141417`) — Superfícies e cards
- `steel` (`#2c3b4c`) — Detalhes secundários e iluminação fria
- `oxide` (`#7a1f24`) — Accent de iluminação rim light
- `signal` (`#c23b34`) — Accent máximo de destaque
- `paper` (`#e9e5da`) — Texto e tipografia principal
- `dim` (`#6b6a63`) — Texto secundário

> Fonte única dos tokens: `src/index.css` (`@theme`) · direção visual
> vinculante: [docs/design/design-bible.md](docs/design/design-bible.md)

---

## 📚 Documentação

| Documento                                                  | Conteúdo                              |
| ---------------------------------------------------------- | ------------------------------------- |
| [AGENTS.md](AGENTS.md)                                     | workflow, comandos e regras de PR     |
| [PROGRESS.md](PROGRESS.md)                                 | checklist de fechamento (o que falta) |
| [docs/STATE.md](docs/STATE.md)                             | estado atual, ADRs e métricas         |
| [docs/design/design-bible.md](docs/design/design-bible.md) | direção visual vinculante             |
| [docs/specs/README.md](docs/specs/README.md)               | índice de Scene Specs                 |

---

## 📜 Créditos e Licença dos Assets 3D

- Modelo 3D: **Spider-Man: Brand New Day (v2)**
- Autor: Eskze ([Sketchfab](https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda))
- Licença: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (atribuição curta `Modelo 3D por Eskze · CC BY 4.0` mantida visível na aplicação)
