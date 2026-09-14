# Post-Launch Wave Plan — números sincronizados, performance e distribuição

> **Data:** 2026-09-14 · **Fonte:** `AUDIT-PORTFOLIO-2026-09-14.md` (itens A6, A8–A11,
> M11, M12, M15, B16 e achado 5.12) + estado pós-TD-003
> **Gatilho:** o PR #61 comprimiu o GLB de 23,5 → **6,5 MB** (ADR-029) e tornou
> obsoletos os números publicados no PR #60 — e abriu a janela para os itens de
> performance que a auditoria deixou como "PRs subsequentes".
> **Pré-requisitos satisfeitos:** C1–C3 mergeados (#58/#59/#60), A5/M13 (#58),
> A7 (#61). **Critério de sucesso:** números públicos verdadeiros, bundle
> vendor-split, a11y 96→100, headers de segurança, telemetria privacy-friendly
> e o kit de distribuição pronto para o post.

## 0. Estado consolidado da auditoria (o que resta)

| Item                         | Estado                                                            | Onda |
| ---------------------------- | ----------------------------------------------------------------- | ---- |
| C4 — claim "zero janks"      | ⏳ device (usuário) — **mas "23 MB de GLB" já é falso hoje** (W1) | W1   |
| A6 — code-splitting 1.573 kB | ❌ aberto (`vite.config.ts` sem `build`)                          | W2   |
| A8 — FALHA-02 threshold      | ⏳ device (usuário, Bloco A)                                      | —    |
| A10 — canais de distribuição | ❌ aberto (artefatos falta; ações finais são do usuário)          | W6   |
| A11 — observabilidade        | ❌ aberto (zero instrumentação)                                   | W5   |
| M11 — case study do harness  | ❌ aberto                                                         | W6   |
| M12 — headers de segurança   | ❌ aberto (só HSTS de fábrica)                                    | W4   |
| M15 — passada Safari/iPhone  | ⏳ device (usuário, de carona no TD-002)                          | —    |
| B16 — robots/sitemap         | ❌ aberto (liberado pós-lançamento)                               | W6   |
| **5.12 — contraste**         | ❌ **novo, confirmado pelo Lighthouse** (ver W3)                  | W3   |
| M14 — higiene de arquivos    | ✅ verificado em 2026-09-14: nada ruidoso tracked                 | —    |

**Regras transversais:** idênticas ao plano anterior (worktree, pre-flight de
porta, gates de evidência por PR, Conventional Commits, riscar item na
auditoria ao fechar). Observação: o CI do GitHub Actions segue bloqueado por
**billing da conta** — gates locais verdes + ressalva registrada no PR, como
em #59/#60, até o dono resolver em Settings → Billing.

---

## W1 — PR `chore/numbers-sync`: a verdade pós-TD-003 (C4 parcial, ~1 h) — ✅ executada

O #61 mudou um fato público e nenhum número acompanhou. Este PR sincroniza:

1. **Colofon** (`ColophonSection.tsx:14`): `'23 MB de GLB · 66 joints · zero janks…'`
   → `'6,5 MB de GLB · 66 joints · …'`. O "zero janks" **fica como está** neste PR —
   a palavra "janks" só sai/aplica-se na sessão de device (C4). O número, esse,
   é falsificável **hoje** e sai agora.
2. **Re-run Lighthouse** mobile+desktop contra o deploy (o LCP 9,8 s do mobile
   era o GLB; espera-se salto significativo) → atualizar
   `docs/research/2026-09-14-lighthouse.md` (seção "pós-TD-003") e a tabela do
   README (GLB 6,5 MB; novos scores; remover "meshopt queued").
3. **`docs/STATE.md`**: confirmar que o #61 já sincronizou métricas/TD-003/ADR-029
   (o PR trazia ADR-029); corrigir o que tiver ficado para trás (ex.: seção
   Métricas, referências a 22,4 MB em docs de design/specs — grep `22,4\|22.4\|23 MB`).
4. README: linha do modelo passa a citar meshopt entregue (A7 riscado na auditoria).

**Verificação:** verify + smoke (copy do colofon muda — nenhum seletor cobre
essa linha; conferir `micro-craft`/colophon specs verdes).

---

## W2 — PR `perf/code-splitting`: vendor chunks (A6, 1–2 h) — ✅ executada

**Baseline medido em 2026-09-14 pós-#61:** `dist/assets/index-*.js 1.573,22 kB │ gzip: 460,64 kB` (chunk único + warning do Vite).

1. `vite.config.ts` ganha `build.rollupOptions.output.manualChunks`:
   `three` + `@react-three/*` + `postprocessing` num chunk vendor-3D;
   `gsap` (e `lenis`, se vier) em chunk motion; resto no index.
2. Avaliar `React.lazy` no canvas com o `StaticFallback` como rota imediata
   (a auditoria aponta ~189 KiB unused-javascript no desktop; lazy do canvas
   é o candidato natural — medir ganho real antes de aceitar complexidade).
3. Medir antes/depois (tabela no PR: chunk sizes + gzip), conferir que o
   loader não regrediu (ordem de imports, Suspense intacto) e que o warning
   do Vite sumiu.

**Por quê agora:** com o GLB a 6,5 MB, o JS de 460 kB gzip virou o segundo
maior custo de primeira visita — e o warning no log do build é o que um tech
lead vê primeiro.

**Não fazer:** micro-bundling de tudo (Overkill) — só os vendors que dominam.

---

## W3 — PR `fix/contrast`: legibilidade do texto pequeno (5.12, 2–3 h) — ✅ executada

Achado novo, confirmado pelo Lighthouse desktop (`color-contrast` = a dedução
do a11y 96). Duas famílias medidas em produção:

1. **`text-dim` (#6b6a63) sobre fundo escuro = 3,64:1** — kickers, linha de
   stack e atribuição no colofon (mono 10–11px = texto normal, exige 4,5:1).
2. **`text-dim/60` = ~#444440, 2,02:1** — o footer do colofon inteiro:
   atribuição CC-BY e disclaimer. **O texto legal da página é o menos legível**
   — inaceitável para justamente a camada jurídica.

**Fazer:**

- Novo token `dim-raised` no `@theme` (`src/index.css`), alvo ≈ **#7d7c74**
  (4,7:1 sobre ink — passa AA com folga; manter o hue quente do dim).
  O `dim` original permanece para usos decorativos/ambientais onde o tom é
  intencional (design bible é vinculante — registrar ADR curto da decisão).
- Aplicar `dim-raised` em: texto corrente pequeno do colofon (lista de
  desafios, linha de stack), kickers de seção e **footer legal inteiro
  (remove o `/60`)** — atribuição e disclaimer são obrigatórios "legíveis sem
  hover"; 2,02:1 contradiz o próprio requisito.
- Re-run Lighthouse → meta **a11y 96 → 100** nos dois perfis (publicar no doc
  de Lighthouse; o README ganha um número melhor que é auditável).

**Verificação:** `evidence:visual` (mudança de UI renderizada — rubrica ≥ 4;
checar que o tom "dim" da peça não virou cinza genérico: a hierarquia
paper/dim tem de continuar legível como escala) + smoke.

---

## W4 — PR `chore/security-headers`: vercel.json (M12, 30 min)

1. `vercel.json` com bloco `headers` para todas as rotas:
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (gyro:
     **não** bloquear `gyroscope` — é feature da peça em iOS)
   - `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`
     (`unsafe-inline` em style é necessário para os style attributes do React/GSAP;
     `blob:` em worker para o pipeline KTX2/Basis do three).
2. **Validar no preview deployment do PR** antes do merge (cada PR ganha URL
   na Vercel — abrir o preview, jogar a peça inteira, conferir console limpo
   e gyro/canvas funcionando) + `curl -sI` no preview listando os headers.
3. Não duplicar HSTS (a Vercel já injeta; se o header explícito conflitar,
   prevalece o de fábrica — documentar a escolha no PR).

**Por quê:** sinal barato de cuidado para avaliador técnico; fecha a dimensão
5.3 (nota sobe de 7 para 8–9 com A6+M12).

---

## W5 — PR `feat/observability`: saber o que acontece com o visitante (A11, 2–3 h) — ✅ executada

1. **`@vercel/analytics`** (cookie-free, sem banner — mantém a nota do README
   verdadeira): `<Analytics />` em `main.tsx`. **Requer o toggle no dashboard
   Vercel** — ação de 1 clique do dono; listar no PR como passo pós-merge.
2. **`@vercel/speed-insights`**: `<SpeedInsights />` idem — Web Vitals reais
   (RUM) por device, o contraponto que o doc de Lighthouse pede.
3. **Error reporting mínimo:** o `ErrorBoundary` já captura (`App.tsx:93`) e
   hoje só troca de UI. Adicionar beacon próprio leve (POST agregado,
   sem PII) para um endpoint Vercel Function contando `{webglFailed, tier,
ua-plain}` — ou, se o dono preferir conta Sentry, deixá-lo como follow-up
   explícito. **Decisão no PR, não depois.**
4. `window.__perf` já coleta tier/fps em `?debug=1` — NÃO ligar beacon de FPS
   em produção nesta onda (Overkill da auditoria); RUM de Vitals basta para o
   pré-lançamento.

**Duas dependências novas entram no package.json** — este plano é a aprovação;
alternativa zero-dep: só o toggle de Web Analytics no dashboard (menos dados).

**Verificação:** verify + smoke; conferir no preview que nenhum request
externo novo aparece no load crítico (analytics carrega lazy/after-event).

---

## W6 — PR `docs/launch-kit`: distribuição e narrativa (A10+M11+B16, 1 dia)

1. **`public/robots.txt` + `public/sitemap.xml`** (B16, trivial — só agora faz
   sentido: há algo indexável e linkável).
2. **`docs/case-study-ai-harness.md`** (M11, EN): orquestrador delegation-only,
   10 agentes com permissões granulares, gates de evidência, 28→30 ADRs, specs
   que dirigem código — com o contraponto honesto "por que não um plugin de
   mercado". Linkar do README (seção Case study).
3. **`docs/plans/launch-checklist.md`** (A10 — a parte que é do usuário):
   - rascunho do post de LinkedIn (PT) + tweet/X curto (EN) usando o GIF/OG;
   - snippet pronto do profile README (GitHub) com a peça pinada;
   - checklist: repo pinado → profile README → LinkedIn featured → post.
     Ações externas são do dono; o PR entrega os artefatos prontos para colar.
4. Auditoria: A10/B16/M11 riscados; roadmap atualizado.

**Verificação:** verify (docs-only); render do README no preview do GitHub.

---

## Sequência e custo

| Onda | PR                       | Esforço | Desbloqueia                               |
| ---- | ------------------------ | ------- | ----------------------------------------- |
| W1   | `chore/numbers-sync`     | 1 h     | Números públicos verdadeiros + C4 parcial |
| W2   | `perf/code-splitting`    | 1–2 h   | A6; segundo maior custo de load           |
| W3   | `fix/contrast`           | 2–3 h   | 5.12; a11y 96→100 auditável               |
| W4   | `chore/security-headers` | 30 min  | M12; dimensão 5.3 sobe                    |
| W5   | `feat/observability`     | 2–3 h   | A11; RUM + falhas silenciosas             |
| W6   | `docs/launch-kit`        | 1 dia   | A10+M11+B16; kit do post                  |

Ordem sugerida: **W1 → W2 → W3 → W4** (todas executáveis por agente, ~1 dia
total; W3 antes de W4 porque o re-run de Lighthouse da W3 deve ser o número
final publicado). W5 depende da decisão de dependências/endpoint (pergunta
única ao dono). W6 fecha o kit; o post em si é do usuário.

**Paralelo (usuário, inalterado):** Bloco A no S23 → C4/A8; passada Safari
(iPhone real, TD-002) → M15/5.11. São os únicos itens que o plano não cobre.

## Non-goals (Overkill mantido da auditoria)

OG image com composição dedicada (B18) · Sentry completo antes de haver
conta/escolha do dono · beacon custom de FPS em produção · i18n da landing ·
matriz WebKit/Firefox em CI · micro-bundling além dos vendors dominantes.
