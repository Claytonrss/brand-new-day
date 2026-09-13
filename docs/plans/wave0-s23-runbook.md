# Wave 0 — Runbook de baseline no Samsung Galaxy S23

> Plano: `docs/plans/archive/pareto-impact-plan.md` §Wave 0 · **sem PR** — a saída
> são números "antes" que entram no corpo do PR da Wave 1
> (`fix/mobile-tier-policy`) e decidem FALHA-02 / FALHA-10 / FALHA-14.
>
> **Medir contra `main` (pré-fix, `3bd324a`)** — este é o baseline. A
> re-medição "depois" usa o branch `fix/mobile-tier-policy` já com a Wave 1.

## Setup (uma vez)

1. No Mac: `pnpm dev --host` → anotar o URL de rede (ex.: `http://192.168.0.15:5173`).
2. No S23, no Chrome (mesma rede): abrir `http://<ip-do-mac>:5173/?debug=1`.
   - Alternativa por USB: `adb reverse tcp:5173 tcp:5173` → `http://localhost:5173/?debug=1`.
3. `chrome://inspect` no Mac para ver console/warnings do dispositivo.
4. O PerfHud (canto inferior esquerdo) mostra `fps · ms`, `tier · draw calls`,
   `tris`, `programs`. Para números exatos, no console do device:
   `copy(JSON.stringify(window.__perf))` (cola fora) ou leia o overlay.

## Medições (T0.1–T0.4)

Para cada cenário: aguardar o loader sumir + 10 s de assentamento, anotar
`fps/ms/calls/triangles/programs` e o `tier`.

| #    | Cenário                              | Procedimento                                  | O que registrar                                                                                        |
| ---- | ------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| T0.1 | **Hero parado**                      | Sem tocar, 30 s; 3 amostras espaçadas         | média/desvio de fps e ms; `tier` inicial (anote se `high`!)                                            |
| T0.2 | **Roldagem contínua** hero → colofon | Flings contínuos e constantes até o fim, 2×   | fps mínimo observado; **o momento do tier pop** (overlay `tier` muda / console `[PerformanceMonitor]`) |
| T0.3 | **Scroll coberto** (chapter cards)   | Scroll lento atravessando MUDANÇA e REVELAÇÃO | fps durante a travessia                                                                                |
| T0.4 | **A/B `?fx=off`**                    | Recarregar com `&fx=off`, repetir T0.1 e T0.2 | mesma tabela — isola o custo da camada de material                                                     |

Preencher (uma linha por cenário):

```
T0.1 hero parado        fps __·__·__   ms __   calls __   tris __k   programs __   tier __
T0.2 rolagem contínua   fps mín __     ms __   calls __   tris __k   programs __   tier pop em: __
T0.3 cards cobertos     fps __         ms __
T0.4 idem T0.1/T0.2 com ?fx=off
T0.1' hero parado       fps __         ms __
T0.2' rolagem contínua  fps mín __     ms __
```

## T0.5 — Registro de decisão

1. **FPS-bound vs main-thread-bound:**
   - fps baixo com ms alto (~consistente) → GPU-bound (tier/material/dpr).
   - fps oscilante com ms baixo e jank irregular → main thread (JS/layout).
2. **FALHA-02 (threshold mobile-only medium→low < ~40 fps):**
   - tier `medium` pós-fix em 35–44 fps → **ativa** (implementar no follow-up
     de 1 linha + `budget.spec.ts`).
   - ≥ 50 fps → **permanece congelada** (registrar aqui a decisão).
3. **FALHA-10 (syncTouch):** fps ≥ 55 com queixa de "feel" persistente →
   volta à mesa como experimento isolado.
4. Colar esta tabela preenchida no corpo do PR da Wave 1 (coluna "antes") e
   re-medir com o branch da Wave 1 para a coluna "depois".

## Aceite da Wave 1 (re-medição com `fix/mobile-tier-policy`)

- `tier` no primeiro load: **`medium`** (nunca `high`) — ler o PerfHud.
- fps no scroll contínuo ≥ 50 (alvo 55).
- Zero commit React em scroll estabilizado (React Profiler no DevTools).
