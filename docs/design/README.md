# docs/design — Índice e Decisões Pendentes

> Base de design produzida na Fase 3.1. Estes documentos são vinculantes para
> os Scene Specs e para o verify.

## Documentos

| Arquivo | Conteúdo |
|---|---|
| `reference-survey.md` | síntese das referências visuais avaliadas |
| `design-bible.md` | direção visual vinculante (intenção, cor, textura, composição, proibições) |
| `storyboard.md` | seções como planos de câmera + copy fechada |
| `mobile-first.md` | viewports, breakpoints e keyframes iniciais mobile/desktop |
| `performance-design.md` | FPS alvo, estratégia do GLB, ordem de degradação, budgets |
| `quality-matrix.md` | perfis Desktop High / Mobile Good / Mobile Low |
| `typography.md` | escala tipográfica e regras de uso das duas fontes |
| `memorable-moments.md` | 4 beats visuais com início, ápice e saída |
| `portfolio-grade.md` | checklist binário de padrão de portfólio |
| `design-as-feature.md` | design como requisito de aceite, não polimento |
| `visual-rubric.md` | rubrica 1–5 com pesos e notas mínimas |
| `look-dev-plan.md` | 3 rodadas de Look Dev com gates |
| `composition-rules.md` | zonas seguras de texto por seção e viewport |
| `3d-model-treatment.md` | tratamento de materiais, luz e otimização do GLB |
| `real-device-check.md` | checklist de validação em dispositivo real |
| `look-dev-report.md` | _(criado durante o Look Dev — Fase 3.2)_ |

## Decisões que devem virar Scene Specs

Um Scene Spec por item, em `docs/scene-specs/` (formato de FDD do FinTrack):

1. `foundation-scaffold` — scaffold, tokens, scripts, GSAP registration.
2. `foundation-asset-pipeline` — inspeção e otimização do GLB.
3. `foundation-loader` — loader cinemático.
4. `foundation-camera-rig` — motor de scroll storytelling + keyframes por breakpoint.
5. `foundation-post-processing` — EffectComposer (Bloom/Vignette/grão).
6. `foundation-lighting` — rig de iluminação dramática.
7. `section-hero` — head-tracking + copy.
8. `section-evolution` — close no símbolo + copy.
9. `section-arsenal` — órbita do pulso + copy.
10. `section-fullbody` — pôster vivo + parallax HUD + atribuição.

## Decisões que devem virar ADRs

1. **Stack frontend/WebGL** — Vite + React 19 + TS + Tailwind v4 + R3F v9 +
   Drei + GSAP ScrollTrigger (vs. Next.js, Framer Motion).
2. **Estratégia mobile-first para câmera/performance** — keyframes por
   breakpoint, matriz de qualidade, ordem de degradação.
3. **Política de crédito/licenciamento do asset 3D** — CC-BY 4.0, atribuição
   visível sem hover, link do Sketchfab.
4. **Otimização do GLB** — quando a inspeção definir a estratégia concreta.

## Estado

- Fase 3.1: **concluída** (2026-09-05).
- Próximo passo: Fase 3.2 — Look Dev da primeira dobra (protótipo visual).
