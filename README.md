# Spider-Man: Brand New Day — a cinematic 3D landing

**→ [Live demo](https://brand-new-day-fan.vercel.app/)** · React Three Fiber + GSAP ScrollTrigger · portfolio piece by **Clayton Rafael**

![Demo loop — scroll from the hero into the Arsenal](docs/assets/demo-loop.gif)

## What you're looking at

A cinematic, scroll-driven 3D experience: one rainy NYC night, told as a single continuous camera move. Everything on screen is authored code — no baked animation files, no UI kit. It is a fan-made, non-commercial showcase of frontend craft.

## Case study

- **A procedural rig instead of animation clips.** The GLB ships without animations, so the character is brought to life at runtime: a 16-joint rig with spring-based landing, breathing keyed to narrative beats, velocity lean and a spider-sense halo anchored to the skull. 66 joints, zero pre-baked keyframes.
- **One continuous camera.** A Catmull-Rom spline drives the camera through 7 narrative beats, direction changes down 54% versus naive look-at, synced to scroll via GSAP ScrollTrigger + Lenis.
- **Adaptive quality, three tiers.** Synchronous initial tier (mobile never starts at `high`), idle-gated degradation with hysteresis, shadow throttling (measured 16-draw-call valley), DPR/MSAA ladders and post-processing reserved for the top tier.
- **AI-augmented engineering.** Built with a delegation-only orchestrator harness: 10 agents with granular command permissions, evidence-gated PRs, 28 ADRs — the specs actually drive the code. See [`opencode.json`](opencode.json) and [`docs/memory/decisions.md`](docs/memory/decisions.md).

## Numbers

| Metric                   | Value                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Draw calls/frame         | 44–46 (`high` tier)                                                                      |
| Tests                    | 168 unit (Vitest) + 14 visual specs (Playwright)                                         |
| Lighthouse (live deploy) | Perf **43 mobile / 94 desktop** · A11y 96 · Best practices 100 · SEO 100                 |
| Bundle                   | 265 kB entry + vendor chunks (461 kB gzip total — 3D/motion split, cached across visits) |
| Model                    | 6.5 MB GLB (meshopt + quantization, ADR-029)                                             |

The mobile performance score is the honest number for a 6.5 MB GLB under simulated slow-4G + CPU throttling — the download itself dominates the simulation; TBT dropped 9× after the meshopt compression (7,360 ms → 780 ms), and the adaptive tier system covers the real-world gap. On-device numbers (Samsung S23 session) are being collected. Want the receipts? `?debug=1` exposes a live perf HUD (`window.__perf`), and every PR ships real logs from `pnpm verify` + `pnpm test:smoke`.

## Setup

```bash
pnpm install
pnpm dev              # dev server
pnpm build            # production build (TypeScript + Vite)
pnpm verify           # all quality gates (lint + typecheck + test + build)
pnpm test:smoke       # Playwright PR gate (@smoke, mobile-390)
pnpm inspect:glb      # GLB asset metadata
```

Requires Node.js ≥ 22 and pnpm 9. Full workflow and contribution rules: [AGENTS.md](AGENTS.md). No analytics, no cookies, no external requests at load (fonts and HDR are self-hosted).

## Licenses & credits

- **Code:** MIT — see [LICENSE](LICENSE)
- **3D model:** "Spider-Man Brand New Day" by Eskze ([Sketchfab](https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda)), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), converted and optimized from the original — full attribution visible in the app
- **Fonts:** Space Grotesk and JetBrains Mono ([SIL OFL 1.1](public/fonts/OFL.txt))
- **Disclaimer:** unofficial fan-made, non-commercial project — not affiliated with or endorsed by Marvel/Sony/Disney. Full third-party list: [NOTICE.md](NOTICE.md)

---

## (PT-BR) Uma landing 3D cinematográfica

**→ [Demo ao vivo](https://brand-new-day-fan.vercel.app/)**

Uma experiência 3D guiada por scroll: uma noite chuvosa em NYC, contada como um único movimento contínuo de câmera. Tudo na tela é código autoral — sem animações pré-gravadas, sem kit de UI. Projeto fan-made, sem fins comerciais, para demonstrar craft de frontend.

**Destaques técnicos:** rig procedural de 16 joints (respiração, lean por velocidade, spider-sense) no lugar de clipes; câmera Catmull-Rom contínua por 7 beats; três tiers adaptativos de qualidade com degradação idle-gated; construído com um harness de agentes de IA delegation-only com gates de evidência (detalhes acima, em inglês).

**Números:** 44–46 draw calls · 168 testes unitários + 14 specs visuais · Lighthouse 43/94 (mobile/desktop) · GLB de 6,5 MB (meshopt) · entry de 85 kB gzip + vendor 3D cacheável. Métricas em device (S23) em coleta — `?debug=1` expõe o HUD de performance.

**Setup:** `pnpm install` · `pnpm dev` · `pnpm verify` — detalhes na seção em inglês e em [AGENTS.md](AGENTS.md). Sem analytics, sem cookies.

**Créditos:** código MIT ([LICENSE](LICENSE)) · modelo por Eskze, CC BY 4.0 · fontes SIL OFL 1.1 · **projeto fan-made não oficial, sem afiliação ou endosso da Marvel/Sony/Disney** ([NOTICE.md](NOTICE.md))
