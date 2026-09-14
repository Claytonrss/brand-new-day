# Launch Readiness Plan — bloqueadores C1–C4

> **Data:** 2026-09-14 · **Fonte:** `AUDIT-PORTFOLIO-2026-09-14.md` §4 (crítico) e §5 (roadmap)
> **Objetivo:** zerar os 4 bloqueadores de divulgação (C1–C4) mantendo os gates
> de PR do contrato spec-driven (`docs/workflow/spec-driven-contract.md` §2.5).
> **Critério de sucesso:** link compartilhável com preview (OG), repo
> juridicamente publicável (LICENSE + disclaimer), README que vende nos dois
> públicos, e nenhum claim de performance desmentido pelo próprio repo.
>
> Aprovado junto (sem custo extra): A5 (CC-BY estrita), M13 (OFL/Apache em
> `public/`), M10 (README EN-first), A9 (Lighthouse público), M15 (passada
> Safari de carona na sessão de device). Fora de escopo: bloco "Overkill" da
> auditoria.

---

## 0. Regras transversais (valem para todos os PRs)

1. **Worktree própria por tarefa**, criada de `origin/main`, com `pnpm
bootstrap` dentro dela (AGENTS.md §11). Branches: `chore/licensing` ·
   `feat/social-preview` · `docs/readme-showcase` · `fix/perf-threshold-medium-low`
   ou `fix/colophon-claim`.
2. **Pre-flight de porta antes de Playwright/evidências** (obrigatório):
   `lsof -nP -iTCP:${PORT:-5173} -sTCP:LISTEN` + `lsof -p <PID> | grep cwd`.
   Server de outro checkout → não rodar. Exclusão mútua: uma suíte por vez
   (`pgrep -fl playwright` antes de abrir run).
3. **Gates por PR:** `pnpm verify` (lint + typecheck + test + build) e
   `pnpm test:smoke` com logs reais no corpo do PR; rubrica visual nota ≥ 4 e
   `pnpm evidence:visual` (390/430/1440) **nos PRs que mudam UI renderizada**
   (PR-1 muda o footer de 5 seções; PR-2/PR-3 mudam HTML/README apenas).
4. **Conventional Commits**; husky/commitlint já rodam no commit.
5. **Deploy:** merge em `main` publica direto na Vercel — cada PR mergeado é
   verificável ao vivo em <https://brand-new-day-fan.vercel.app/> logo após o
   merge (o CI de Vercel leva ~1–2 min).
6. Ao fechar cada item, **riscar a linha correspondente na auditoria**
   (`AUDIT-PORTFOLIO-2026-09-14.md` §5), como foi feito com o C0.

---

## 1. PR-1 — `chore/licensing`: LICENSE + disclaimer + CC-BY estrita (C2+A5+M13)

**Esforço:** 1–2 h · **Dependências:** nenhuma · **Merge primeiro** (é o PR que
legaliza a publicação do repo; tudo o resto pode rodar em público depois dele).

### 1.1 Arquivos novos

| Arquivo                | Conteúdo                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `LICENSE`              | MIT completo, `Copyright (c) 2026 Clayton Rafael` — cobre **o código**                                                          |
| `NOTICE.md`            | Tabela de assets de terceiros e suas licenças (ver §1.2)                                                                        |
| `public/fonts/OFL.txt` | Texto integral da SIL Open Font License 1.1 (Space Grotesk + JetBrains Mono) — a OFL exige distribuir a licença junto aos woff2 |
| `public/basis/LICENSE` | Texto Apache-2.0 (Basis Universal transcoder, © Khronos Group) — a Apache-2.0 exige preservar licença/notice na redistribuição  |

### 1.2 `NOTICE.md` — esqueleto

- Código: MIT (este repo, Clayton Rafael).
- `public/models/spider-man_brand_new_day-v3-meshopt.glb` — "Spider-Man Brand New Day"
  por Eskze (Sketchfab), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/),
  convertido/otimizado a partir do original (link da obra igual ao de
  `ModelAttribution.tsx:1-2`).
- `public/fonts/*.woff2` — SIL OFL 1.1 (ver `public/fonts/OFL.txt`).
- `public/basis/*` — Apache-2.0, © Khronos Group (ver `public/basis/LICENSE`).
- `public/*.hdr` / environment — Poly Haven, CC0 (ADR-021).
- **Disclaimer:** projeto fan-made, sem fins comerciais, não afiliado nem
  endossado por Marvel/Sony/Disney. Spider-Man e marcas relacionadas são
  propriedade da Marvel Characters, Inc.

### 1.3 `ModelAttribution.tsx` — conformidade estrita CC-BY §3(a) (A5)

Nova string (uma linha, mesmos links — mantém **exatos** os textos de link
`Eskze` e `CC BY 4.0`, que `tests/visual/credits.spec.ts:12-13` casa por nome):

```
Modelo 3D "Spider-Man Brand New Day" · © <a>Eskze</a> · <a>CC BY 4.0</a> · convertido e otimizado a partir do original
```

- `©` fica **fora** do link (senão `getByRole('link', { name: 'Eskze' })` falha:
  name matching é string completa).
- Título da obra + aviso de copyright + indicação de modificação = os 3 itens
  que faltavam vs CC-BY §3(a) (auditoria §4 A5).
- Layout: conferir que a linha não quebra feio no mobile-390 nas 5 superfícies
  (Hero, Arsenal, FullBody, Colophon, StaticFallback) — `evidence:visual`.

### 1.4 Disclaimer no colofon (C2)

Em `ColophonSection.tsx`, no `<footer>` (linhas ~109–112), abaixo de
`<ModelAttribution />`, mesma tipografia mono/10px:

```
Projeto fan-made, sem fins comerciais — sem afiliação ou endosso da Marvel/Sony/Disney.
```

Uma linha. Não mexe no copy congelado da peça (ADR-017): é camada legal do
footer, mesmo registro da atribuição CC-BY.

### 1.5 README — seção mínima já neste PR

Enquanto o README showcase não chega (PR-3), adicionar só uma seção
`## Licenças e créditos` com o disclaimer + link para `NOTICE.md` (3 linhas).

### 1.6 Verificação

- `pnpm verify` + `pnpm test:smoke` — `credits.spec.ts` deve passar sem edição
  (se o `©` fora do link for respeitado); se algum seletor quebrar, atualizar a
  spec no mesmo PR.
- `pnpm evidence:visual` (footer mudou em todas as seções) + rubrica.
- `ls LICENSE NOTICE.md public/fonts/OFL.txt public/basis/LICENSE` no PR body.

---

## 2. PR-2 — `feat/social-preview`: OG/Twitter/favicon (C1)

**Esforço:** 2–3 h · **Depende de:** nada de código; idealmente após PR-1
(deploy público já "legal"). · **É o bloqueador nº 1** (link vai ser
compartilhado).

### 2.1 `og.jpg` 1200×630 (base: poster existente)

O poster do fallback já é render autoral do modelo — reusar (composição
dedicada é B18, pós-lançamento):

```bash
ffmpeg -i public/fallback-poster-desktop.png \
  -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" \
  -q:v 4 public/og.jpg   # alvo ≤ 300 KB
```

`public/` é servido pela Vercel como estático na raiz →
`https://brand-new-day-fan.vercel.app/og.jpg`.

### 2.2 `favicon.svg`

Extrair a lente do loader (`CinematicLoader.tsx:90-178`) para um SVG
standalone: fundo `ink`, traço `glow`, 32×32 viewBox. É a marca da peça —
o loader já é a assinatura tipográfica (ADR-020/P3.3).

### 2.3 `index.html` — bloco de metas (substitui/ amplia linhas 3–14)

```html
<title>Ninguém Sabe. — Spider-Man: Brand New Day · Clayton R.</title>
<link rel="canonical" href="https://brand-new-day-fan.vercel.app/" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<meta property="og:type" content="website" />
<meta property="og:url" content="https://brand-new-day-fan.vercel.app/" />
<meta property="og:site_name" content="Brand New Day — portfólio de Clayton R." />
<meta property="og:locale" content="pt_BR" />
<meta property="og:title" content="Ninguém Sabe. — uma experiência 3D cinematográfica" />
<meta
  property="og:description"
  content="Spider-Man: Brand New Day como pretexto para craft de frontend: rig procedural sem clipes, câmera Catmull-Rom e três tiers de performance adaptativa. Portfólio de Clayton R."
/>
<meta property="og:image" content="https://brand-new-day-fan.vercel.app/og.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta
  property="og:image:alt"
  content="Homem-aranha sob chuva em NYC — render autoral do modelo 3D"
/>
<meta name="twitter:card" content="summary_large_image" />
```

Notas: `<title>` ganha o autor (5.10 — "de quem é" na aba/link); copy de
og:description é embalagem, não copy da peça (ADR-017 intocado). URLs precisam
ser **absolutas** (OG não resolve relativas). Se um dia houver domínio
próprio, é um find-replace de 5 ocorrências.

### 2.4 Verificação

- Local: `pnpm build` + conferir o `dist/index.html` renderizado (metas
  presentes); smoke segue passando (nenhum seletor afetado).
- **Pós-merge (deploy):** `curl -sI .../og.jpg` → 200 + `image/jpeg`;
  validar preview em <https://www.opengraph.xyz> (ou LinkedIn Post Inspector)
  com a URL de produção; conferir favicon na aba. Print do validador vai no
  PR-3 (README) ou no fechamento da auditoria.

---

## 3. PR-3 — `docs/readme-showcase`: README showcase + metadata + Lighthouse (C3+A9+M10)

**Esforço:** ~1 dia · **Depende de:** PR-1 (links p/ LICENSE/NOTICE) e PR-2
(preview bonito ao compartilhar o repo; Lighthouse com OG no ar).

### 3.0 Metadata do repo — fazer JÁ, independente de PR (30 s)

```bash
gh repo edit Claytonrss/brand-new-day \
  --homepage "https://brand-new-day-fan.vercel.app"        # corrige fawn→fan (404 hoje!)
gh repo edit Claytonrss/brand-new-day \
  --description "Cinematic 3D landing — React Three Fiber + GSAP — portfolio piece by Clayton Rafael"
```

É o campo mais clicado do repo e hoje aponta para página morta (auditoria 5.10).

### 3.1 Vídeo de demo (12–15 s) do deploy ao vivo

1. Pre-flight de porta + capacidade; rodar `pnpm evidence:motion` para o
   material bruto calibrado — **ou** gravar tela do deploy em
   `brand-new-day-fan.vercel.app` (hero → arsenal, scroll lento).
2. Editar: 12–15 s, 1600px de largura, 30 fps, sem áudio, H.264,
   **≤ 10 MB** → `docs/assets/demo-loop.mp4` (GitHub renderiza MP4 em README).
   Poster frame → `docs/assets/demo-loop-poster.jpg`.
3. Fallback se o MP4 renderizar mal: GIF ≤ 10 MB do mesmo corte.

### 3.2 Lighthouse contra o deploy (A9)

```bash
npx lighthouse https://brand-new-day-fan.vercel.app \
  --output=json --output-path=docs/research/lh-mobile.json --chrome-flags="--headless=new"
npx lighthouse https://brand-new-day-fan.vercel.app --preset=desktop \
  --output=json --output-path=docs/research/lh-desktop.json --chrome-flags="--headless=new"
```

Publicar os 8 números (4 categorias × mobile/desktop). Mobile throttled vai
ser duro numa peça 3D — reportar como está e somar os números reais de device
do C4 (S23) como contraponto RUM. Números em README + auditoria.

### 3.3 Estrutura do README (EN-first, M10; PT-BR completo abaixo)

```markdown
# Spider-Man: Brand New Day — a cinematic 3D landing

→ demo link + <video>

## What you're looking at (3 frases não-técnicas)

## Case study (rig procedural sem clipes; câmera

                                    Catmull-Rom por 7 beats; 3 tiers
                                    adaptativos; AI harness com 10 agentes
                                    e gates de evidência — link opencode.json)

## Numbers (draw calls 118→44-46; 168 unit tests +

                                    14 visual specs; bundle; Lighthouse §3.2)

## Setup (o README atual, condensado)

## Licenses & credits (disclaimer + NOTICE.md + CC-BY)

---

## (PT-BR) (espelho das seções)
```

- Tom: o README é showcase para os dois públicos; tech lead acha os números,
  recrutador acha o vídeo e as 3 frases.
- Telemetria: uma linha "No analytics, no cookies" (B17 — gratuito).
- A seção case study do harness (M11, doc dedicado) fica como follow-up —
  aqui só o parágrafo + link.

### 3.4 Verificação

`pnpm verify` (nada de runtime muda). No PR body: screenshot do render do
README (GitHub preview), os números do Lighthouse e o output do `gh repo view`
mostrando homepage/description corrigidas.

---

## 4. C4 — claim de performance: sessão de device OU copy verdadeiro

**Estrutura bifurcada** — a sessão de device é executada **só pelo usuário**
(Bloco A, `PROGRESS.md:15-41`); o PR é escolhido pelos números.

### 4.1 Sessão de device (usuário, ~1 h, runbook pronto)

1. **S23 (Android/Chrome):** executar Bloco A — T0.1–T0.5 do
   `docs/plans/wave0-s23-runbook.md` com `?debug=1` (PerfHud +
   `window.__perf{.tier}`) e `?fx=off` (A/B). Registrar tudo.
2. **iPhone real + Safari macOS (M15, de carona):** scroll completo do deploy
   (loader → hero → arsenal → colofon), gyro opt-in no iPhone (TD-002), e
   veredito simples: funciona/quebra/onde. Uma tarde fecha o ponto cego 5.11.

### 4.2 Árvore de decisão (agente, após os números)

| Resultado no S23                  | Ação                                                                                                                                                                                                  | Branch/PR                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| medium 35–44 fps                  | Implementar **FALHA-02**: threshold mobile-only `medium→low` em FPS < ~40 (`PerformanceMonitor.tsx:15,124`), com histerese existente + testes unitários do threshold; ADR registrando o número medido | `fix/perf-threshold-medium-low` |
| medium ≥ 45 fps                   | Threshold congela (decisão T0.5); F4b não dispara                                                                                                                                                     | nenhum PR de perf               |
| Sessão atrasar além do lançamento | **Suavizar o claim** `ColophonSection.tsx:14`: `'23 MB de GLB · 66 joints · três tiers de performance adaptativa'` (verificável; remove "zero janks")                                                 | `fix/colophon-claim`            |

Nos dois primeiros casos, atualizar `PROGRESS.md` (T0.x, Bloco C) e as métricas
em `docs/STATE.md`. O claim só permanece escrito se a medição o sustentar —
o padrão da auditoria é "copy não desmentido pelo próprio repo".

---

## 5. Sequência e cronograma

| Dia              | Trabalho                                       | Saída                  |
| ---------------- | ---------------------------------------------- | ---------------------- |
| **D1 manhã**     | §3.0 metadata (30 s) + PR-1 licensing          | PR-1 mergeado          |
| **D1 tarde**     | PR-2 OG/favicon + validação pós-deploy         | preview funcionando    |
| **D2 manhã**     | vídeo de demo (§3.1) + Lighthouse (§3.2)       | assets + números       |
| **D2 tarde**     | PR-3 README showcase                           | repo pronto para abrir |
| **Qualquer dia** | C4 §4.1 sessão (usuário) → §4.2 PR condicional | claim verdadeiro       |

C1–C3 fecham em 2 dias de trabalho de agente. C4 depende da agenda de device
do usuário; o fallback de copy (última linha da árvore) existe justamente para
não travar o lançamento na sessão.

## 6. Definition of Done (divulgação liberada)

- [ ] `LICENSE`, `NOTICE.md`, OFL/Apache em `public/`, disclaimer no colofon + README (PR-1)
- [ ] CC-BY estrita: título + © + modificação na atribuição, `credits.spec.ts` verde (PR-1)
- [ ] OG/Twitter/favicon vivos em produção, validados em preview de rede social (PR-2)
- [ ] `og.jpg` 200 + `image/jpeg` em produção (PR-2)
- [ ] README showcase EN-first com demo em vídeo, case study, números (PR-3)
- [ ] `homepageUrl` fan (não fawn) + description preenchida (§3.0)
- [ ] Lighthouse mobile+desktop publicado (PR-3)
- [ ] Claim do colofon sustentado por medição **ou** suavizado (C4)
- [ ] Auditoria atualizada: C1–C4 riscados no roadmap, §5 (recomendação) revisada
