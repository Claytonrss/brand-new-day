# Pareto de Fechamento — o que sobrou do report, ranqueado por ganho × esforço

> **Data:** 2026-09-14 · **Fonte:** estado atual vs. `AUDIT-PORTFOLIO-2026-09-14.md`
> **Premissa:** ~90% dos itens do report já estão em produção (C0–C3, A5–A7,
> A9, M10/M12–M14, B16/B17, contraste 5.12). O que sobra é pouco — o trabalho
> desta fase é **recusar trabalho**, executando só o topo da razão ganho/esforço.

## 1. Estado atual consolidado (verificado em produção, não em doc)

| Em produção agora                                         | Evidência                                     |
| --------------------------------------------------------- | --------------------------------------------- |
| OG/favicon/metas (C1)                                     | preview de rede social validado em 2026-09-14 |
| LICENSE + NOTICE + disclaimer (C2, A5, M13)               | #58; `credits.spec` verde                     |
| README showcase EN-first + GIF + Lighthouse (C3, A9, M10) | #60                                           |
| GLB 6,5 MB meshopt (A7)                                   | #61; LCP desktop 0,6 s                        |
| Números ressincronizados (colofon "6,5 MB")               | #62/#66                                       |
| Vendor chunks: entry 265 kB + `vendor-3d` cacheável (A6)  | #63; chunk vivo no edge                       |
| Contraste AA, a11y 100 (5.12)                             | #64/#67; `#7d7c74` no CSS de produção         |
| Headers de segurança CSP+nosniff+XFO (M12, 5.3 → 9)       | #65; headers ativos no curl                   |
| Bloco Overkill respeitado                                 | nada do "não fazer" foi feito                 |

| Pendente de merge (só apertar botão)                                                           | Fecha         |
| ---------------------------------------------------------------------------------------------- | ------------- |
| **#68** — Vercel Analytics + Speed Insights + beacon WebGL (A11)                               | 5.9           |
| **#69** — robots/sitemap + case study do harness + checklist de post (A10-artefatos, M11, B16) | 5.8 (parcial) |

| Pendente do report — nada planejado ainda                                                                          | Onde está            |
| ------------------------------------------------------------------------------------------------------------------ | -------------------- |
| **C4** — "zero janks em mobile mid-range" segue **ao vivo e falsificável** (`ColophonSection.tsx:14`)              | Bloco A / §4 crítico |
| **A8** — FALHA-02: threshold `medium→low` ainda em FPS < 30                                                        | Bloco C              |
| **M15** — passada Safari/iPhone (5.11 = ponto cego browser nº 1)                                                   | roadmap row 10       |
| **5.12-teclado** — caminho por Tab não especificado/testado                                                        | 5.12                 |
| **B18** — OG com composição dedicada                                                                               | Baixo                |
| **A10-ações** — post, pin, profile README, featured                                                                | launch-checklist.md  |
| **Docs desatualizados** — PROGRESS.md parado em 2026-09-13; STATE.md sem Lighthouse 43/94, bundle split e a11y 100 | §9/AGENTS            |

---

## 2. Matriz de Pareto (ganho para a avaliação × esforço)

### 🟢 Q1 — Faça agora (alto ganho, baixo esforço) · **≈ 2 h no total**

| #   | Item                                                                                                                                                   | Esforço     | Ganho                                                                                  | Por quê é o topo                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | ~~**Merge #68 e #69**~~ ✅ mergeados                                                                                                                   | 5 min       | Fecha A11, M11, B16 + artefatos de A10                                                 | 100% do trabalho já feito; falta o botão. Observabilidade transforma claim de perf em dado contínuo                                                                      |
| 2   | **C4-suavizar**: `'6,5 MB de GLB · 66 joints · três tiers de performance adaptativa'`                                                                  | 30 min + PR | **Remove o único bloqueador crítico restante** — a última frase falsificável da página | A sessão de device pode demorar; o claim pode ser **restaurado com força** depois, com número medido ("zero janks medidos no S23: X fps"). Suavizar agora não perde nada |
| 3   | **Sync PROGRESS.md + STATE.md** (Bloco A intacto; métricas Lighthouse 43/94, a11y 100, bundle split; arquivar waves de lançamento)                     | 1 h         | Coerência interna — o tech lead que lê o tracking encontra o repo que o README promete | É a "fonte única de verdade" do projeto; defasada, contradiz o case study                                                                                                |
| 4   | **Consolidação da auditoria**: notas por dimensão pós-fixes (5.3→9, 5.5→8, 5.8→6*, 5.9→6*, 5.12→9) + nota geral → **8,5** com C4 aberto, **9** fechado | 45 min      | A auditoria é artefato de portfólio em si — mostrar o ciclo audit→fix→re-score         | *5.8/5.9 sobem de 2 só quando os PRs above mergear e o post sair                                                                                                         |

### 🟡 Q2 — Agende (alto ganho, alto esforço) · **1 tarde de device, só você**

| #   | Item                                                                                                                                             | Esforço             | Ganho                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 5   | **Sessão S23 (Bloco A)**: T0.1–T0.5 → decide FALHA-02 (A8), sustenta ou refuta o claim (C4-restaurar), Fase 7.3 rubrica humana, calibrações T4.6 | ~4 h de device      | O maior ganho único restante: claim forte + verdadeiro, mobile liso para a maioria (recrutador abre no celular), aprovação estética formal |
| 6   | **M15 — Safari/iPhone na mesma tarde**: scroll completo + gyro (TD-002) + veredito no STATE.md                                                   | 1–2 h (mesma saída) | Fecha 5.11 — o browser mais provável do avaliador deixa de ser aposta                                                                      |

> **Regra de ouro do Q2:** não compacte. As duas únicas decisões que exigem
> device real (threshold e claim) são exatamente as que o projeto se recusou
> a adivinhar — é isso que o harness conta como diferencial.

### ⚪ Q3 — Backlog consciente (baixo ganho, baixo esforço) · não agendar

- **5.12-teclado** (2–3 h): Tab até o colofon especificado + testado. Ganho: pergunta de entrevista, não de recrutador.
- **B18 OG composta** (2 h): lente + título. Ganho marginal sobre o poster atual.

### ⛔ Q4 — Recusar explicitamente (baixo ganho, alto esforço)

KTX2 fase 2 (ganho de arquivo ~0, VRAM só em devices baixos) · beacon custom de FPS em produção (esperar tráfego) · Sentry (decisão de conta; beacon do #68 cobre) · matriz WebKit/Firefox CI (SwiftShader caro, M15 manual basta) · i18n da landing (README EN já cobre o público) · refazer GIF/OG (existe).

---

## 3. Execução (agente → você)

### PR-A `chore/closing-sync` (Q1 itens 2+3, ~1,5 h) — ✅ executada (PR #70)

1. `ColophonSection.tsx:14` → `'6,5 MB de GLB · 66 joints · três tiers de performance adaptativa'` (o "zero janks" **volta depois com número**, se a sessão sustentar — ADR curto registrando a troca e o motivo: copy não pode ser mais forte que a evidência disponível).
2. PROGRESS.md: Bloco A intacto; registrar ondas de lançamento + pós-lançamento no arquivo de planos concluídos; "Última atualização" = hoje.
3. STATE.md: Métricas ganham Lighthouse 43/94 (TBT 780 ms mobile), a11y 100, bundle 265 kB + vendor, GLB 6,5 MB; ADRs 029–030 no resumo.
4. Gates + smoke (porta isolada; 5173 segue ocupada pelo `process-dashboard`).

### PR-B `docs/audit-consolidation` (Q1 item 4) — ✅ executada (PR deste branch)

Re-score das dimensões com as evidências de produção, nova nota geral
(projeção honesta: **8,5** — o caminho até 9 é a sessão de device, não mais
código). Referência cruzada plan→PR→produção no apêndice.

### Você (em paralelo)

1. ~~Merge #68 → #69~~ ✅ mergeados (via #68/#69).
2. Agendar a tarde de device (Q2) — runbook pronto (`wave0-s23-runbook.md` + M15).
3. Toggle Web Analytics na Vercel (pós-#68).
4. Seguir `docs/plans/launch-checklist.md` quando o C4 fechar.

## 4. Definition of Done final

- [x] #68 e #69 mergeados (A11, M11, B16, artefatos A10)
- [x] Claim do colofon sem afirmação não-evidenciável (PR-A)
- [ ] PROGRESS/STATE/auditoria contando a mesma história (PR-A/B)
- [ ] Sessão S23 feita → FALHA-02 decidida + claim restaurado **com número** ou permanentemente suave
- [ ] Safari/iPhone verificado → 5.11 fechada
- [ ] Post publicado seguindo o checklist → A10 fechada de verdade

**Nota projetada ao fim do Q1+Q2: 9/10** — sem nenhuma linha nova de código 3D.
