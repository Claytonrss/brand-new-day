# scripts/ — gates e coletores de evidência

Todos os coletores usam Playwright/Chromium, honram o `.env` do checkout
(`scripts/lib/env.mjs` — porta isolada por worktree) e gravam em
`docs/evidence/` (**local-only**: diretório gitignored, ~187 MB — anexe a
evidência relevante no corpo do PR, não no repo).

Antes de qualquer coleta: `pnpm env:doctor` (exit 1 bloqueia — server de
outro checkout na porta contamina a evidência).

## Gates de ambiente

| Script            | Função                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `verify-all.sh`   | lint + typecheck + test + build, log por gate em `test-results/logs/`                                             |
| `doctor.sh`       | pre-flight de porta/suíte ativa/capacidade (`pnpm env:doctor`)                                                    |
| `envctl.sh`       | ciclo de vida leve do server: `init` (bootstrap+up), `up` (idempotente), `health`, `logs`, `ps`                   |
| `setup.sh`        | bootstrap do checkout: deps, `.env` com porta isolada, VS Code (`pnpm bootstrap`; `--no-editor` para automação)   |
| `teardown.sh`     | stop do server **deste** checkout (`--force` órfãos seus, `--clean` artefatos, `--deep` = --clean + node_modules) |
| `inspect-glb.mjs` | metadata do GLB (joints, materiais, extensões) — `pnpm inspect:glb`                                               |

## Coletores de evidência (por feature)

| Script                          | Evidência                                                      | Spec de origem                |
| ------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| `collect-visual-evidence.sh`    | paridade 390/430/1440 (`pnpm evidence:visual`)                 | todas (gate de PR)            |
| `collect-motion-evidence.mjs`   | vídeo de scroll por viewport (`pnpm evidence:motion`)          | calibrações de motion         |
| `collect-portfolio-audit.mjs`   | stills nos checkpoints de scroll × 3 viewports                 | `composition-rules` + rubrica |
| `collect-loader-evidence.mjs`   | loader teaser em 3 estados de progresso (rede throttled)       | `loader-teaser`               |
| `collect-request-audit.mjs`     | auditoria de requests do load — zero hosts externos (FALHA-08) | `loader-teaser` (ADR-021)     |
| `collect-beat-chrome.mjs`       | acento `--beat-accent` aplicado no chrome DOM por beat         | `beat-chrome`                 |
| `collect-micro-craft.mjs`       | tipografia reativa, carimbo por beat, CTA magnético            | `dom-micro-craft`             |
| `collect-parallax-evidence.mjs` | mesmo frame com cursor em dois extremos (desktop)              | `desktop-pointer-parallax`    |
| `collect-gyro-evidence.mjs`     | chip de permissão iOS de gyro (requestPermission injetado)     | `mobile-gyro-permission`      |
| `collect-webshoot-evidence.mjs` | hint pulsante + teia após clique                               | `web-shoot-discovery`         |
| `collect-spider-sense.mjs`      | halo de 6 traços + expressão de alerta (`senseCount`)          | `spider-sense`                |
| `collect-shadow-evidence.mjs`   | vale de draw calls do shadow throttle no medium (FALHA-04)     | ADR-023                       |
| `collect-fallback-evidence.mjs` | fallback WebGL com `getContext` anulado                        | `webgl-static-fallback`       |
| `collect-fallback-poster.mjs`   | posters do fallback (render off-screen do modelo real)         | `webgl-static-fallback` §3    |

Uso: `node scripts/collect-<nome>.mjs [baseUrl] [outDir]` — `baseUrl` default
vem do `.env`; só faz sentido com o dev server **deste** checkout no ar.
