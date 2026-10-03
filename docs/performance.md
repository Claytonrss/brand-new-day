# Performance, medida

Cada número abaixo foi medido em **2026-09-15** contra o deploy ao vivo ou um build de
produção fresco deste exato código — nada carregado de docs internos antigos, nada que você
não possa re-medir com um comando. Lighthouse 13.4.1; os scores mobile usam o throttling
simulado do Lighthouse, três execuções reportadas como faixa.

| Métrica                                          | Valor (2026-09-15)                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse Performance                           | **mobile 58–67** (3 execuções, mediana 66) · **desktop 93–97** (3 execuções, mediana 97)                                  |
| Lighthouse Acessibilidade / Best Practices / SEO | 100 / 100 / 100 nos dois perfis                                                                                           |
| Total Blocking Time (mobile, simulado)           | 800–850 ms                                                                                                                |
| Bundle JS                                        | entry 270 kB (86 kB gzip) · vendor-3d 1.175 kB (327 kB gzip, cacheável entre visitas) · vendor-motion 132 kB (49 kB gzip) |
| Modelo 3D                                        | GLB de 6,5 MB — meshopt + quantização de vértices (ADR-029)                                                               |
| Draw calls                                       | 44–46 no tier alto (ADR-011) · gate automatizado valida ≤ 48 (headless)                                                   |
| Testes                                           | 168 unitários (Vitest) + 14 specs visuais (Playwright), todos verdes                                                      |

**A leitura honesta.** O score mobile é limitado pelo formato: a rede lenta simulada do
Lighthouse precisa baixar o modelo de 6,5 MB, e esse download domina a simulação — o loader
cinematográfico mostra progresso real durante ela. O TBT de ~0,8 s diz que a main thread está
saudável.

O que os números do Lighthouse **não** dizem: **não existe validação de FPS em device real**
([TD-002](memory/tech-debt.md)). Todos os números de FPS automatizados deste repo vêm de
renderizador headless (SwiftShader) e ficam de fora dos gates de propósito — os proxies
fiscalizados são draw calls, programs e triângulos. Em um device real, o HUD `?debug` mostra
o que os proxies não cobrem.

## Qualidade adaptativa em três tiers

O primeiro frame pintado já carrega o custo real do dispositivo, então o tier é resolvido de
forma síncrona ([`initialTier.ts`](../src/components/3d/perf/initialTier.ts)): viewport mobile
ou `prefers-reduced-motion` nunca começam no tier alto. A degradação é idle-gated com
histerese ([`PerformanceMonitor.tsx`](../src/components/3d/perf/PerformanceMonitor.tsx)): os
tiers só mudam com o scroll parado, e voltar para cima exige um FPS mais alto do que cair
(desce abaixo de 45, sobe acima de 55). No tier médio, o passe de sombra atualiza a 10 Hz em
vez de a cada frame, com refresh imediato em mudança real de pose — um vale medido de ~16
draw calls entre refreshes (46 com o passe vs. 30 sem, [ADR-023](memory/decisions.md)).
Escada de DPR 1,75 / 1,25 / 1,00, MSAA 4× / 0 / 0, e depth-of-field + aberração cromática só
no tier alto e sob `?fx=full` (o padrão é o modo `subtle`).

## Recibos

[`?debug`](https://brand-new-day-fan.vercel.app/?debug) no site ao vivo expõe o HUD de
performance (`window.__perf`: fps, ms/frame, draw calls, triângulos, programs). Lint,
typecheck, testes unitários, build de produção e specs visuais do Playwright rodam como gates
automatizados do projeto (`pnpm verify`); o orçamento de draw calls (≤ 48) é validado por um
spec Playwright headless ([`budget.spec.ts`](../tests/visual/budget.spec.ts)).
