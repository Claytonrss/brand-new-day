# Scene Specs — índice

Uma spec por feature. Status canônico vive **aqui** (não edite status em
spec individual); o estado narrativo por entrega é `docs/STATE.md`, o
contrato de processo é `docs/workflow/spec-driven-contract.md`.

## Implementadas

| Spec                                | Feature                                    | Entrega                         |
| ----------------------------------- | ------------------------------------------ | ------------------------------- |
| `headroom-lighting.md`              | Slots de luz + orçamento de draw calls     | Wave F (PRs #17–#29)            |
| `procedural-rig-motion.md`          | Rig procedural sobre a rest pose           | Wave A (PRs #17–#29)            |
| `cinematic-camera-path.md`          | Câmera Catmull-Rom single-track            | Wave B (PRs #17–#29)            |
| `authorial-shaders-fx.md`           | Shaders autorais + `?fx`                   | Wave C (PRs #17–#29)            |
| `atmosphere-depth.md`               | Atmosfera GPU                              | Wave E (PRs #17–#29)            |
| `model-interaction.md`              | Drag / gyro / teia                         | Wave D (PRs #17–#29)            |
| `beat-anchors-and-head-tracking.md` | Calibração P0 de âncoras                   | P0 pós-Waves (PRs #17–#29)      |
| `loader-teaser.md`                  | Loader cinematográfico (máscaras)          | Portfolio Impact P1a.1 (PR #31) |
| `opening-title-card.md`             | Beat 0 — card de título                    | Portfolio Impact P1a.2 (PR #31) |
| `colophon-outro.md`                 | Colofon / encerramento (900vh)             | Portfolio Impact P1b (PR #31)   |
| `atmosphere-per-beat.md`            | Assinatura de atmosfera por beat           | Portfolio Impact P1c.1 (PR #31) |
| `arsenal-macro-hud.md`              | Macro do shooter + HUD técnico             | Portfolio Impact P2a.1 (PR #31) |
| `desktop-pointer-parallax.md`       | Parallax de ponteiro no desktop            | Portfolio Impact P2b.1 (PR #31) |
| `mobile-gyro-permission.md`         | Permissão iOS de gyro (ADR-018)            | Portfolio Impact P2b.2 (PR #31) |
| `web-shoot-discovery.md`            | Web-shoot descobrível                      | Portfolio Impact P3.1 (PR #31)  |
| `webgl-static-fallback.md`          | Fallback estático em poster                | Portfolio Impact P3.2 (PR #31)  |
| `arrival-landing.md`                | A chegada (queda + kick)                   | Pareto Wave 4a (PR #35)         |
| `velocity-lean.md`                  | Velocity lean                              | Pareto Wave 4b (PR #36)         |
| `beat-chrome.md`                    | Acento de beat no chrome DOM               | Pareto Wave 5 (PR #37)          |
| `chapter-print.md`                  | Chapter cards impressos                    | Pareto Wave 5 (PR #37)          |
| `dom-micro-craft.md`                | Tipografia reativa, carimbo, CTA magnético | PR #40                          |
| `spider-sense.md`                   | Spider-sense + respiração por beat         | PR #44                          |

## Bootstrap (implementadas; detalhe superseded pelas calibrações posteriores)

| Spec                        | Feature                            | Observação                                  |
| --------------------------- | ---------------------------------- | ------------------------------------------- |
| `evolution-chest-symbol.md` | Símbolo do peito no beat Evolution | Calibração final: `beat-anchors` / Look Dev |
| `arsenal-web-shooters.md`   | Web shooters (eixo/órbita)         | Refinada pelo macro HUD (P2a) e P3.1        |
| `fullbody-living-poster.md` | FullBody como pôster vivo          | Copy final: storyboard + ADR-017            |

## Superseded / histórico

| Spec                             | Motivo                                                    |
| -------------------------------- | --------------------------------------------------------- |
| `archive/hero-mouse-tracking.md` | Substituído pelo head-tracking do rig procedural (Wave A) |

## Arquivadas

| Spec                             | Motivo                                                  |
| -------------------------------- | ------------------------------------------------------- |
| `archive/wave-g-verification.md` | Registro histórico — os gates vivem em `tests/visual/*` |
