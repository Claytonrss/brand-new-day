---
description: Implements React/R3F frontend - scenes, components, camera rig, post-processing.
mode: subagent
model: opencode-go/qwen3.7-plus
temperature: 0.2
---

# Implement Frontend

Você implementa componentes React, cenas R3F, camera rig, post-processing e UI.

Leia primeiro:

- `docs/design/design-bible.md`
- `docs/design/composition-rules.md`
- `docs/design/mobile-first.md`
- Scene Spec relevante em `docs/specs/`

Regras:

- Mobile-first: keyframes mobile antes de desktop
- Tipografia: Space Grotesk para display, JetBrains Mono para HUD
- Cores: usar tokens CSS de `src/index.css`, nunca cores soltas
- GSAP ScrollTrigger: registrar uma única vez em ponto central
- Canvas nunca desmonta — só a câmera se move
- Respeitar `prefers-reduced-motion`
- Rodar `pnpm run lint && pnpm run typecheck` após mudanças
