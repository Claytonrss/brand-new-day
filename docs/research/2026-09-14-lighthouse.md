# Lighthouse — deploy de produção (2026-09-14)

Fechamento do item **A9** da auditoria de portfólio (arquivo no git
history): as
métricas públicas de performance, até hoje inexistentes, medidas contra o
deploy ao vivo <https://brand-new-day-fan.vercel.app/> (após PRs #58/#59 —
licensing + social preview).

**Comando:**

```bash
npx lighthouse@latest https://brand-new-day-fan.vercel.app \
  --output=json --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new"                       # mobile (default)
npx lighthouse@latest https://brand-new-day-fan.vercel.app --preset=desktop \
  --output=json --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new"                       # desktop
```

## Resultados

| Categoria      | Mobile (throttled) | Desktop |
| -------------- | ------------------ | ------- |
| Performance    | **29**             | **83**  |
| Accessibility  | 96                 | 96      |
| Best Practices | 100                | 100     |
| SEO            | 100                | 100     |

## Leitura honesta dos números

- **Mobile 29 é o número esperado para a peça:** LCP 9,8 s e TBT 7.360 ms vêm
  do parse/execução do GLB de 22,4 MB e do boot do WebGL sob CPU throttled de
  simulação — muito abaixo de qualquer device real do público. É exatamente a
  lacuna que o sistema de tiers adaptativos cobre em devices reais; os números
  de device (S23, sessão do Bloco A) serão o contraponto RUM.
- **Desktop 83:** deduções dominadas por `unused-javascript` (~189 KiB
  estimados) e ausência de source maps — ambos atacam com o code-splitting de
  vendor (A6) já enfileirado no roadmap.
- **Accessibility 96 nos dois perfis:** a dedução é `color-contrast` — o
  token `dim` (#6b6a63) sobre `ink`, já documentado como achado 5.12 da
  auditoria. Confirmação externa do mesmo diagnóstico.
- **SEO 100 e Best Practices 100** pós-OG (PR #59) — o "cartão vazio" que a
  auditoria flagrou como C1 está fechado.

**Ação ligada:** os números vivem em `docs/performance.md` (C3; movidos do README); A6/A7
seguem no roadmap como os alvos diretos para subir o mobile/desktop performance.

---

## Re-run pós-TD-003 — meshopt (2026-09-14, PR #61)

Mesmo comando, deploy já servindo o `spider-man_brand_new_day-v3-meshopt.glb`
(23,5 → **6,5 MB**, quantização + EXT_meshopt_compression):

| Categoria      | Mobile (throttled) | Desktop         |
| -------------- | ------------------ | --------------- |
| Performance    | **43** (era 29)    | **94** (era 83) |
| Accessibility  | 96                 | 96              |
| Best Practices | 100                | 100             |
| SEO            | 100                | 100             |

**Vitals:** mobile TBT **7.360 ms → 780 ms** (−9,4×); desktop LCP **0,6 s**.
O LCP mobile simulado (38,4 s) é o download do GLB sob slow-4G simulado —
o loader da peça mostra progresso real durante essa janela; TBT desabando
mostra o main-thread liberado pelo meshopt (decode em vez de parse de
geometria crua).

**Leitura:** o ganho de score veio do main-thread (TBT); o próximo alvo
de mobile é o peso em rede — KTX2 nas texturas (fase 2 do plano TD-003) e
code-splitting do JS (A6, 460 kB gzip) são os restantes. Accessibility 96
segue na espera do contraste (achado 5.12, onda W3 do pós-lançamento,
PRs #64/#67).

---

## Re-run pós-W3 — contraste AA (2026-09-14, onda W3)

Medido contra **build local de preview** (`vite preview`, mesmo bundle de
produção) porque o deploy só recebe esta mudança no merge. ADR-030: token
`dim` #6b6a63 → **#7d7c74** (3,64:1 → 4,7:1 sobre ink) e fim das variantes
de opacidade em texto (`dim/60` media 2,0:1 — era o footer legal do colofon).

| Categoria      | Desktop (local preview)                                        |
| -------------- | -------------------------------------------------------------- |
| Performance    | 94 (estável vs produção)                                       |
| Accessibility  | **100** (era 96)                                               |
| Best Practices | 100                                                            |
| SEO            | 92 (artefato local: `canonical` aponta para a URL de produção) |

`color-contrast`: score 0 → **1** (resolvido). Produção deve refletir a11y 100
assim que esta onda mergear.
