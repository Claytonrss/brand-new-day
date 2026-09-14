# Lighthouse — deploy de produção (2026-09-14)

Fechamento do item **A9** da auditoria (`AUDIT-PORTFOLIO-2026-09-14.md`): as
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

**Ação ligada:** README publica estes números (C3); A6/A7 seguem no roadmap
como os alvos diretos para subir o mobile/desktop performance.
