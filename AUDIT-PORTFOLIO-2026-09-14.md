# Auditoria de Portfolio-Readiness — Spider-Man: Brand New Day Landing

> **Data:** 2026-09-14 · **Auditor:** análise sênior híbrida (staff frontend/3D + consultor de carreira tech)
> **Método:** inspeção direta do código-fonte, configs, docs internas, git history, build real (`pnpm build`), `pnpm audit` e leitura crítica do fluxo de primeira visita. Toda nota citada tem evidência `arquivo:linha`.
> **Correção factual ao brief:** o GLB não tem ~70 MB — tem **22,4 MB** (`public/models/spider-man_brand_new_day-v2.glb`, medido em disco). Isso muda a análise de performance para melhor, mas não elimina os achados.
>
> **Atualização 2026-09-14 (deploy):** o projeto **está no ar** em <https://brand-new-day-fan.vercel.app/> (integração GitHub→Vercel). Verificado ao vivo: HTTP 200, HSTS ativo, GLB servido como `model/gltf-binary`, e o HTML servido é **idêntico à `main` local** — o que confirma que o deploy acompanha o repo e que os achados de OG/favicon abaixo **continuam válidos em produção**. O item "não existe deploy" foi riscado dos bloqueadores; o plano foi reordenado.
>
> **Atualização 2026-09-14 (escopo ampliado):** adicionadas quatro dimensões — **5.7 Copy & direitos autorais**, **5.8 Distribuição/lançamento**, **5.9 Observabilidade pós-lançamento** e **5.10 Marca pessoal** — fechando o funil completo: ser encontrado → impressionar → medir → vender o autor. Achado bônus via API do GitHub: o campo **Website do repo aponta para uma URL quebrada** (`brand-new-day-fawn.vercel.app` — "fawn" — retorna **404**; a correta é "fan") e a **description do repo está vazia**.
>
> **Revisão 2026-09-14 (meta-auditoria):** segunda passada de revisão sobre este documento. Acrescentou a dimensão que faltava — **5.11 Compatibilidade real de browsers** (ponto cego: 100% da suíte e evidências rodam Chromium) — e promoveu a acessibilidade a dimensão própria (**5.12**); registrou o processo de release em 5.8, desambiguou a numeração dos itens (C/A/M/B), acrescentou o item M15 e o bloco **Overkill** ao roadmap. Nota geral (6,5) e recomendação (divulgar após C1–C4) permanecem inalteradas.
>
> **Atualização 2026-09-14 (execução):** o plano `docs/plans/launch-readiness-plan.md` foi executado. **C2** fechado no PR #58 (LICENSE MIT + NOTICE + CC-BY estrita + disclaimer), **C1** no PR #59 (OG/favicon/metas — validado em produção) e **C3** no PR-3 `docs/readme-showcase` (README showcase EN-first + GIF + Lighthouse publicado em `docs/research/2026-09-14-lighthouse.md` + homepage/description do repo corrigidos). Resta **C4** (claim de performance), que aguarda a sessão de device do Bloco A — ou o fallback de copy do plano.
>
> **Atualização 2026-09-14 (pós-TD-003):** **A7 fechado** no PR #61 (GLB 23,5 → 6,5 MB, ADR-029) e segunda onda iniciada via `docs/plans/post-launch-polish-plan.md` — números públicos ressincronizados (Lighthouse: mobile 43 / desktop 94; TBT −9,4×), colofon atualizado para "6,5 MB de GLB".

---

## 1. Resumo executivo

O projeto é **engenharia de elite com embalagem inexistente**. O código, a arquitetura de performance adaptativa, a disciplina de testes/CI/ADRs e o harness de agentes de IA estão entre os melhores que um repositório de portfólio individual pode apresentar — um tech lead que abrir o repo vai encontrar substância real. A peça **já está no ar** (<https://brand-new-day-fan.vercel.app/>, integração GitHub→Vercel), o que remove o maior bloqueador de distribuição — mas ela chega ao mundo **despida**: a URL não aparece em lugar nenhum do repo/README, compartilhar o link gera preview vazio (zero Open Graph, zero favicon), não há LICENSE, e o README é um documento de setup, não um showcase. Agravante: o colofon da landing afirma _"zero janks em mobile mid-range"_ (`src/components/ui/ColophonSection.tsx:14`) enquanto o próprio `PROGRESS.md` (Bloco A) mostra a sessão de device no S23 **pendente** e o gatilho FALHA-02/FALHA-14 existindo justamente porque o tier `medium` pode estar abaixo de 45 fps — uma afirmação que um avaliador técnico consegue falsificar usando o próprio repositório. Uma segunda leitura da palavra "copy" fecha esta auditoria (dimensão 5.7): o **texto** da peça é um dos seus maiores ativos — um arco de uma única noite chuvosa em NYC, do anonimato à assinatura autoral — mas o lado **copyright** tem uma lacuna que a atribuição CC-BY do modelo **não** cobre: os direitos do personagem em si (Marvel/Disney/Sony), hoje sem nenhum disclaimer de não-afiliação, com o site já no ar parecendo marketing oficial do filme no primeiro scroll. **Veredito: o deploy existe, mas ainda não é hora de divulgar.** Com os 4 bloqueadores restantes executados (OG/favicon + LICENSE/disclaimer + README showcase com a URL + resolver o claim de performance), o projeto salta de ~6,5 para ~9 como peça de portfólio. A revisão de segunda passada fechou a última lacuna transversal do documento: **browsers reais** — toda a suíte e evidências rodam Chromium, e Safari/Firefox não têm uma única verificação registrada (5.11, item M15 de custo marginal).

---

## 2. Nota por dimensão

### 5.1 Impacto visual e "efeito wow" — **8/10**

A peça em si está muito acima de "mais uma landing com parallax". O preloader é de fato o primeiro beat narrativo — lentes da máscara em SVG que ganham preenchimento e glow conforme o progresso real do `useProgress` (`src/components/ui/CinematicLoader.tsx:90-178`), não um spinner. O Opening Title Card cria "a respiração antes da máscara" (`src/components/ui/OpeningTitleCard.tsx:9-15`). O modelo sem clipes é compensado por um rig procedural de 16 joints com respiração por beat, tremor, sway, lean por velocidade de scroll, pouso com overshoot de mola e spider-sense com halo ancorado ao crânio (`src/components/3d/rig/useProceduralRig.ts`, `docs/STATE.md:104-116`). Diferenciação real desktop (pointer parallax + drag-orbit hover-only) vs mobile (gyro com máquina de estados de permissão iOS + tap-to-shoot). Deduz-se: o wow da primeira visita fica refém de ~22 MB de GLB + HDR em redes lentas (o loader mitiga, mas os primeiros 3–5 s em 4G são o loader, não o herói); e a aprovação estética humana da própria rubrica ainda está pendente (`docs/STATE.md:122-126`).

### 5.2 Performance — **6/10**

O **sistema** é sofisticado e raramente visto em portfolios: tier inicial síncrono (mobile nunca inicia em `high` — `src/components/3d/perf/initialTier.ts:20-27`), degradação com janela de 1 s + warmup + idle-gate + histerese (`src/components/3d/perf/PerformanceMonitor.tsx:95-137`), shadow throttle com vale medido de 16 draw calls, escada de DPR 1,75/1,25/1 e MSAA 4→0 (`src/components/3d/perf/qualityContext.ts:33-65`), DOF/CA restritos ao tier high (`src/components/3d/EffectsStack.tsx:67-68`), zero requests externos (fontes e HDR self-hosted, ADR-021). O deploy na Vercel serve o GLB corretamente (`content-type: model/gltf-binary`, HSTS) — e agora **existe URL pública para medir Lighthouse/Web Vitals de verdade** (antes era impossível; ver item A9). **Mas os números não existem:** não há um único Lighthouse/Web Vitals medido em nenhum doc; o build gera **um único chunk JS de 1.573 kB (460 kB gzip) sem code-splitting** (saída real do `pnpm build`, com warning do Vite); o GLB de 22,4 MB tem geometria não comprimida (F4b/meshopt ≤ 15 MB é condicional não executado); e a causa da lentidão no S23 está **aberta por design**: o threshold `medium→low` é FPS < 30 (`PerformanceMonitor.tsx:15,124`), então um aparelho a 32–44 fps fica preso no `medium` — exatamente a faixa sintomática relatada — e a correção (FALHA-02) está data-gated na sessão de device que ainda não aconteceu (`PROGRESS.md:15-28,61-62`).

### 5.3 Segurança e compliance — **7/10**

Limpo onde a maioria falha: `pnpm audit` = **0 vulnerabilidades**; nenhum segredo/chave/`.env` tracked (busca por padrões + `git ls-files`); CI com `permissions: contents: read` (least privilege, `.github/workflows/ci.yml:10-11`); atribuição CC-BY **exemplar** — autor + fonte + licença linkados, visível sem hover, em 5 superfícies (`src/components/ui/ModelAttribution.tsx`, renderizado em Hero, Arsenal, FullBody, Colophon e StaticFallback). O deploy Vercel já traz HSTS de fábrica (`strict-transport-security: max-age=63072000; preload`, verificado via `curl -sI`), mas **sem CSP, `X-Content-Type-Options` ou `Referrer-Policy`** — configuráveis com um `vercel.json` de 15 linhas. Faltam: **LICENSE do próprio repositório (inexistente — repo público sem LICENSE é "all rights reserved")**; disclaimer de fan-made/não-afiliação à Marvel/Sony (o título usa "SPIDER-MAN: BRAND NEW DAY" e o copy cita Stark/SHIELD — risco baixo de takedown para portfólio não-comercial, mas a mitigação padrão é uma linha de disclaimer — e com o site já no ar e o repo prestes a abrir, ela deixa de ser teórica). **Resolução parcial (2026-09-14, onda W4):** `vercel.json` adiciona CSP (`default-src 'self'`, com `unsafe-inline` só em style para os style attributes do React/GSAP e `blob:` em worker para o transcoder KTX2/Basis do three), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` + `frame-ancestors 'none'` e `Permissions-Policy` bloqueando camera/mic/geolocation **sem tocar em gyroscope** (feature da peça no iOS). LICENSE + disclaimer fechados pelo PR #58. Nota desta dimensão: 7 → 9.

### 5.4 Estrutura e qualidade de código — **9/10**

A melhor dimensão. Arquitetura modular nítida (`components/3d/{perf,camera,rig,materials,interaction,lighting,beat,atmosphere}` + `design/` de tokens + `hooks/` + `lib/`), TypeScript `strict` + `noUnusedLocals` + `noUncheckedSideEffectImports` (`tsconfig.app.json`), **1 única ocorrência de `any`-like em todo `src/`**, comentários de "porquê" com referências a ADR/FALHA/spec (política vinculante, ADR-026), zero alocação por frame no rig (layers escrevem em `out` — `useProceduralRig.ts:36-48`), cleanup correto (Lenis + `gsap.context().revert()` — `LenisProvider.tsx`, `OpeningTitleCard.tsx:61`), máquina de estados do gyro como factory testável (`gyroController.ts:39`). Testes reais: **168 unitários (22 arquivos)** cobrindo lógica de câmera/rig/tier/gyro/shadow-throttle + **14 specs Playwright** com gate `@smoke` em todo PR e deep suite na main; CI em 3 jobs; husky + commitlint + lint-staged; 54 PRs com Conventional Commits e histórico legível. Deduz-se 1 ponto: ausência de code-splitting/estratégia de bundle (vite.config.ts não tem `build`) e cobertura concentrada em lógica pura (componentes de overlay/UI têm pouca verificação unitária — mitigado pela suíte visual).

### 5.5 Documentação e "portfolio-readiness" — **4/10**

A documentação **interna** é excepcional (28 ADRs com alternativas consideradas, 20+ Scene Specs, design bible, storyboard com copy fechada, STATE.md honesto que marca a rubrica como autoatribuída). A documentação **para o visitante** não existe: a demo **está no ar** (<https://brand-new-day-fan.vercel.app/>) mas **a URL não aparece em nenhum lugar do repo** — nem no README, nem no campo Website do GitHub (busca por vercel/demo na `main` = zero); README sem GIF/vídeo/screenshot, sem resumo não-técnico, sem case study — é um doc de setup (`README.md` inteiro); `index.html` **sem nenhuma meta Open Graph/Twitter e sem favicon** (`index.html:3-14`, confirmado no HTML servido em produção — compartilhar o link da Vercel gera preview vazio e a aba do browser fica sem ícone); sem LICENSE. Acessibilidade é o ponto forte aqui: `prefers-reduced-motion` respeitado de verdade (hook dedicado + 4 blocos CSS + lock de tier + spec Playwright dedicada — `tests/visual/reduced-motion.spec.ts`), `role="progressbar"` com aria no loader, `aria-label` nas seções, `focus-visible` nos CTAs, alt text no poster do fallback, eslint jsx-a11y ativo sem exceções.

### 5.6 Estrutura de IA e instruções de agentes — **8,5/10**

O harness é um diferencial de engenharia genuíno, não teatro: orquestrador delegation-only com hard stops explícitos e 10 agentes com permissões granulares por comando (`opencode.json:12-235`), prompts de agente específicos deste projeto (verify cita rubrica visual, bloqueantes de composição e "reporte evidências, não impressões" — `.opencode/agent/verify.md`), fluxo Spec → Implement → Verify → PR com evidências obrigatórias (AGENTS.md §5.8), ADRs que registram decisões reais com alternativas rejeitadas (`docs/memory/decisions.md`). Não é burocracia copiada — os specs dirigem código de fato (ex.: `gyroController.ts` implementa `mobile-gyro-permission.md §3`). Deduz-se: esse ativo está **invisível para o visitante** — nada no README conta que o projeto foi construído com um harness de agentes bem projetado, perdendo o diferencial narrativo de "AI-augmented engineering" que vagas modernas valorizam; e o modelo/pipeline não é explicado em nenhum doc voltado a fora.

### 5.7 Copy envolvente & direitos autorais — **7/10**

**O copy (texto) é de nível profissional — 9/10.** Não é "texto de landing genérico": é um arco narrativo fechado de uma única noite — os beat stamps na lombada funcionam como um field log ("NYC · 04:37 · chuva fina" → "05:00 · fim da ronda", `src/design/beatStamps.ts:15-23`), os títulos usam quebra de linha como respiração ("UM HOMEM\nSEM NOME.\nUMA CIDADE\nSEM ESCOLHA.", `FullBodyOverlay.tsx:28`), a numeração de capítulos é intencionalmente elíptica (os cards são "Capítulo 2" e "Capítulo 4" — as seções são os capítulos ímpares, `App.tsx:122,134`), e o colofon executa o pivô mais difícil: sair da ficção ("Ninguém sabe.") para o argumento de craft ("FEITO À MÃO. … a página inteira é um argumento em código", `ColophonSection.tsx:58-71`) sem quebrar o tom. O copy é "fechado, não reescrever" por ADR (`storyboard.md`, ADR-017) — disciplina rara. Ressalvas: tudo em pt-BR (recrutador internacional perde a nuance — item M10) e a linha "chega aos cinemas em 31 de julho de 2026" (`FullBodyOverlay.tsx:35`) trabalha com autoridade emprestada — no primeiro scroll, a página **lê como site oficial do filme**, o que é ótimo para imersão e ruim para as duas perguntas que importam: "isso é portfólio de quem?" (o kicker "uma peça de portfólio" mitiga) e "isso é oficial?" (nada mitiga — ver abaixo).

**O copyright está 90% resolvido no modelo e 0% resolvido no personagem — 5/10.** Três camadas:

1. **Modelo 3D (Eskze, CC-BY 4.0) — quase completo.** A atribuição tem criador + link da obra + licença linkada, visível sem hover em 5 superfícies. Contra o §3(a) da CC-BY 4.0 faltam detalhes de conformidade estrita: o **título da obra** ("Spider-Man Brand New Day" no Sketchfab) não é citado; a **indicação de modificação** (§3(a)(2)) não existe — e os sinais de que o arquivo foi convertido/otimizado são fortes (sufixo `-v2`, pipeline KTX2 configurado em `gltfKtx2Loader.ts`, F4b prevendo re-export); e o **aviso de copyright** ("© Eskze") não acompanha o texto. Correção de 15 minutos em `ModelAttribution.tsx`.
2. **Personagem (Marvel/Disney; filme Sony) — não resolvido, e é a lacuna que importa.** A licença do Eskze cobre apenas o _trabalho de modelagem dele_ — **ela não pode licenciar o personagem Spider-Man**, que é IP de terceiro; cumprir a CC-BY não limpa o direito subjacente. O projeto usa nome do personagem, título do filme real, data de estreia como fato e referências a Stark/SHIELD — e **não há uma linha de disclaimer em todo o projeto** (grep `marvel|sony|disney` em src/README/storyboard = zero). O risco prático é baixo (fan art não-comercial é amplamente tolerada; GitHub/ArtStation estão cheios), mas o enquadramento profissional exige a mitigação padrão: uma linha de "projeto fan-made, não comercial, sem afiliação/endosso da Marvel/Sony/Disney" no colofon + README + LICENSE. É também a resposta pronta para a pergunta que um bom recrutador **vai** fazer. Pontos a favor: nenhum logo oficial, nenhum asset oficial, tipografia própria — a peça é transformativa, não uma colagem.
3. **Licenças de terceiros no bundle — lacunas menores.** Fontes SIL OFL 1.1 self-hosted declaradas em comentário (`public/fonts/fonts.css:1-3`), mas **sem o arquivo de licença OFL junto aos woff2** (a OFL exige distribuir a licença com a fonte); transcoder Basis (Khronos, Apache-2.0) em `public/basis/` **sem o NOTICE/LICENSE** que a Apache-2.0 exige preservar; HDR Poly Haven é CC0 (sem exigência, ADR-021). Correção: dois arquivos de texto em `public/`.

### 5.8 Distribuição & estratégia de lançamento — **2/10**

A peça estar no ar ≠ ser vista, e o objetivo declarado é recrutador **chegando** até ela. Hoje não existe nenhum canal de entrada: a URL da demo não aparece no repo (e o único lugar que a referencia — o campo Website do GitHub — aponta para uma URL **quebrada**, ver 5.10); a `description` do repo está **vazia** (`gh repo view` → `"description":""`); não há robots.txt nem sitemap.xml em `public/`; o `<title>` é poético e impesquisável ("Ninguém Sabe.", `index.html:11`); e não há nenhum artefato de lançamento — nenhum artigo de case study, nenhum post, nenhum vídeo curto pronto para social (o pipeline de evidências `pnpm evidence:visual`/`evidence:motion` gera material bruto que poderia virar o GIF/clip de lançamento com uma tarde de edição). Faltam também as superfícies de descoberta óbvias: repo pinado no perfil, profile README, LinkedIn featured. Uma peça desse nível sem plano de lançamento é uma árvore caindo na floresta — o público-alvo nunca saberá que ela existe a menos que o autor empurre, e empurrar exige os artefatos acima prontos **antes** do post.

**Processo de release (agregado da revisão):** a integração GitHub→Vercel publica `main` direto em produção — sem staging nem gating de deploy; o rollback é um revert commit (rápido, mas manual). Os preview deployments por PR da Vercel provavelmente já cobrem o fluxo de revisão (cada PR ganha URL própria antes do merge), mas não há registro deles em doc nenhum — confirmar e anotar é uma linha. Com o smoke gate rodando por PR, o risco residual é baixo: falta transparência, não processo.

### 5.9 Observabilidade & feedback loop pós-lançamento — **2/10**

Zero instrumentação de produção: nenhum pacote de analytics/error tracking no `package.json`, nenhuma referência a analytics/Sentry/Plausible em `src/` ou `index.html` (grep = zero), sem `vercel.json` para Speed Insights. O que existe é `window.__perf`/`?debug=1` (`PerfProbe.tsx`) — excelente para debug manual em device, inútil para saber o que acontece quando um recrutador abre o link num iPhone antigo às 23h. Três cegueiras concretas: (1) **funil** — não há como saber quantos visitam, de onde vêm e onde abandonam (chegam ao colofon? saem no loader?); (2) **falhas silenciosas** — o `StaticFallback` salva o usuário quando WebGL falha (`App.tsx:58-60`), mas o autor nunca fica sabendo que a falha ocorreu, nem em quais devices; (3) **o claim de performance** — o item C4 (verificar "zero janks") viraria dado contínuo em vez de medição única: real-user metrics de FPS/tier por device fechariam a narrativa de "performance engineering" com números de campo, não de laboratório. A correção é barata e privacy-friendly: Vercel Analytics + Speed Insights (zero config no plano atual) e/ou Plausible/Umami, mais um error boundary reportando a um Sentry (ou endpoint próprio) — tudo sem cookies nem banners.

### 5.10 Marca pessoal & nomeação — **3/10**

A peça vende o filme melhor do que vende o autor. O colofon assina "Portfólio — Clayton R." com CTA duplo (GitHub + LinkedIn, `ColophonSection.tsx:55,88-106`) — bom, mas é o **último** beat: quem recebe o link e não rola até o fim nunca descobre de quem é. Os pontos de contato de maior tráfego não carregam o nome: `<title>` e `description` falam só do filme (`index.html:8-11`); o repo chama-se `brand-new-day` — nome de filme, não de projeto (compreensível, mas a description vazia desperdiça a chance de dizer "experiência 3D cinematográfica em React/Three.js — portfólio de Clayton R."); e a API do GitHub revela o pior: `homepageUrl: "https://brand-new-day-fawn.vercel.app"` — **"fawn", com W — retorna 404** (verificado via `curl -sI`; a URL correta, "fan", responde 200). Ou seja: o único campo de metadados do repo que aponta para a demo leva a uma página morta — e será o lugar mais clicado quando o repo abrir. Correções de minutos: `homepageUrl` corrigido, description preenchida, `og:title`/`title` com o nome do autor, repo pinado + profile README quando abrir.

### 5.11 Compatibilidade real de browsers — **5/10**

_(Dimensão adicionada na revisão de 2026-09-14 — a lacuna transversal que faltava.)_ Tudo o que o projeto sabe sobre browsers não-Chromium é inferência, não evidência: a suíte Playwright define exatamente **2 projetos, ambos no engine Chromium default** (`playwright.config.ts:43-52`), e um grep por `safari|webkit|firefox` em `src/` + `tests/` + configs retorna **1 único hit** — um comentário sobre a permissão de gyro exigida pelo Safari (`GyroPrompt.tsx:9`). O público-alvo declarado é recrutador recebendo link no LinkedIn: **iPhone/Safari é o par browser-device mais provável da primeira visita, e é exatamente o que nunca rodou** — nem em teste, nem em evidência, nem em sessão manual documentada. Superfícies não verificadas: WebGL2 e a taxa real de disparo do `StaticFallback` em iOS antigo, `backdrop-blur` no prompt de gyro (`GyroPrompt.tsx:69`), `100vh` + `viewport-fit=cover` sob barras dinâmicas do Safari, e a máquina de estados do gyro em Safari real — o TD-002 (`PROGRESS.md:39`) exige esse aceite em dispositivo real, mas cobre uma feature, não uma passada de compatibilidade; a sessão do Bloco A é S23, i.e. Android/Chrome. A nota é baixa por ser **ponto cego, não falha conhecida** — uma tarde de verificação (M15) pode levantá-la.

### 5.12 Acessibilidade — **7,5/10**

_(Promovida de "ponto forte" dentro de 5.5 a dimensão própria na revisão — o método deste documento é nota por dimensão, e a11y é tema recorrente de entrevista; as evidências positivas seguem em 5.5 e §3.)_ O que existe é raro em peças 3D: `prefers-reduced-motion` respeitado de ponta a ponta e não cosmético (hook dedicado + blocos CSS + lock de tier + spec Playwright própria), `role="progressbar"` com aria no loader, `aria-label` nas seções, `focus-visible` nos CTAs, alt no poster do fallback, jsx-a11y em gate sem exceções. O que **não** foi verificado e vira pergunta de entrevista: **contraste** — o token `dim` (#6b6a63, `src/index.css:11`) sobre `ink` (#0a0a0c, `src/index.css:5`) mede **≈3,6:1**, abaixo do AA 4,5:1 para texto normal (passa apenas como texto grande ≥3:1), e ninguém mapeou onde `dim` vira corpo de texto vs. label; **caminho de teclado** — a interação primária é scroll/drag/gyro e o grep por `onKeyDown|keydown|tabIndex` em `src/` = **zero**, então se a página é percorrível por Tab até o colofon é efeito colateral dos focos de CTA, não um caminho especificado ou testado. Nada disso bloqueia divulgação — são candidatos naturais a backlog pós-lançamento, e o piso já está acima da média da categoria. **Resolução parcial (2026-09-14, onda W3):** o **contraste foi fechado** — ADR-030 eleva `dim` para #7d7c74 (4,7:1) e elimina as variantes de opacidade em texto (o footer legal media 2,0:1); Lighthouse `color-contrast` resolvido, a11y 96 → **100**. O **caminho de teclado** segue em backlog.

---

## 3. ✅ Já está perfeito (não mexer)

**Impacto visual**

- Preloader como beat narrativo (lentes SVG + progresso real + `role="progressbar"`), não spinner.
- Opening Title Card como silêncio antes do 3D; hand-over com scrub (`OpeningTitleCard.tsx:32-62`).
- Rig procedural completo (respiração/lean/pouso/spider-sense) — transforma a ausência de clipes em argumento técnico.
- Fallback WebGL como pôster editorial com o mesmo copy e `<picture>` mobile/desktop (`StaticFallback.tsx`) — melhor que a página interativa de muitos portfolios.
- Copy fechada e cinematográfica, coerente com a premissa do filme (`docs/design/storyboard.md` — "fechada, não reescrever").

**Performance (sistema)**

- Tier inicial síncrono; mobile nunca `high`; degradação idle-gated com histerese; shadow throttle medido.
- Zero requests externos no load (fontes + HDR self-hosted); modo avião OK.
- DPR/MSAA/pós-processamento em escada por tier; DOF/CA só no `high`.

**Segurança**

- 0 vulnerabilidades; 0 segredos; `.gitignore` correto; CI least-privilege.
- Atribuição CC-BY acima do exigido (5 superfícies, sem hover, com links).

**Código**

- Strict TS real (1 `any` em src); modularidade; comentários de porquê; factories testáveis; cleanup correto.
- 168 testes unitários + 14 specs visuais + smoke gate em PR + deep suite na main.
- Git history profissional (54 PRs, Conventional Commits, husky/commitlint/lint-staged).

**Documentação interna / IA**

- ADRs com alternativas rejeitadas; specs que dirigem código; STATE.md honesto (rubrica marcada como autoatribuída).
- Harness de agentes com permissões granulares e gates de evidência.

**Acessibilidade**

- `prefers-reduced-motion` implementado de ponta a ponta (não cosmético); aria no loader e seções; foco visível; jsx-a11y em gate.

**Copy**

- Arco narrativo fechado de uma noite (field log 04:37→05:00 nos beat stamps); títulos com quebra como respiração; capítulos elípticos; pivô ficção→craft no colofon.
- Copy congelado por ADR (storyboard "fechado, não reescrever") — consistência de voz em 8 seções + fallback + loader.

---

## 4. 🔧 Precisa ajustar/implementar (priorizado)

### 🔴 Crítico (bloqueia divulgação)

~~**C0 — Não existe deploy nem URL pública.**~~ **✅ RESOLVIDO (2026-09-14):** deploy ao vivo em <https://brand-new-day-fan.vercel.app/> via integração GitHub→Vercel, servindo a `main` atual (HTML idêntico ao local, GLB 200, HSTS). **Resta um resíduo crítico:** a URL não está em lugar nenhum do repo — fica absorvida no C3 (README) + campo "Website" do GitHub.

1. ~~**C1 · Zero social preview: sem Open Graph, sem Twitter Card, sem favicon.**~~ **✅ RESOLVIDO (2026-09-14, PR #59):** `og.jpg` 1200×630 derivada do poster, `favicon.svg` com as lentes do loader, bloco `og:*`/`twitter:card`/canonical com URLs absolutas e `<title>` com o autor. Validado em produção (`curl`: og.jpg 200, metas no HTML servido).
   - _Evidência:_ `index.html:3-14` — só `description` e `theme-color`; nenhum `og:*`, nenhum `<link rel="icon">`, nenhuma imagem OG em `public/`. Confirmado no HTML servido em produção.
   - _Fazer:_ `og:title`, `og:description`, `og:image` 1200×630 (render off-screen do modelo — o pipeline de poster já existe, `fallback-poster-desktop.png` é base), `og:url` apontando para a URL da Vercel, `twitter:card=summary_large_image`, favicon SVG (a lente do loader já é a marca).
   - _Por quê:_ **agora que o link existe, ele vai ser compartilhado** — e o primeiro contato de um recrutador com o projeto será um cartão vazio no LinkedIn/Slack. Era o item 2; com o deploy no ar, virou o bloqueador nº 1.

2. ~~**C2 · Sem LICENSE do repositório e sem disclaimer de IP do personagem.**~~ **✅ RESOLVIDO (2026-09-14, PR #58):** LICENSE MIT + NOTICE.md de terceiros + `OFL.txt`/Apache em `public/` + atribuição CC-BY estrita (título, ©, modificação — `credits.spec.ts` verde sem edição) + disclaimer fan-made no colofon e README.
   - _Evidência:_ nenhum arquivo LICENSE na raiz; grep `marvel|sony|disney` em src/README/storyboard = **zero** — nenhuma linha de não-afiliação em lugar nenhum, com o site no ar usando título do filme real e data de estreia como fato (`FullBodyOverlay.tsx:35`).
   - _Nuance crítica:_ a atribuição CC-BY do Eskze cobre só a _modelagem_ — **não licencia o personagem Spider-Man** (IP Marvel/Disney, filme Sony). Cumprir a CC-BY não limpa o direito subjacente; o disclaimer é a mitigação padrão.
   - _Fazer:_ LICENSE (ex.: MIT para o código, com nota separando os assets de terceiros) + linha de disclaimer "projeto fan-made, não comercial, sem afiliação/endosso da Marvel/Sony/Disney; Spider-Man é propriedade de Marvel Characters, Inc." no colofon (junto ao `ModelAttribution`) e no README.
   - _Por quê:_ sem LICENSE, publicar = "all rights reserved"; sem disclaimer, a página lê como marketing oficial no primeiro scroll (risco de confusão — o cerne de trademark) e o recrutador que perguntar sobre IP encontra silêncio em vez de resposta pronta.

3. ~~**C3 · README não é um showcase — e o repo aponta para uma demo quebrada.**~~ **✅ RESOLVIDO (2026-09-14, PR-3):** `homepageUrl` fawn→fan corrigida + description preenchida (via `gh repo edit`); README reescrito EN-first com demo ao vivo, GIF de 14 s gravado do deploy, case study, números e Lighthouse publicado.
   - _Evidência:_ `README.md` inteiro = stack + comandos + tokens + links de docs internas. Sem demo, sem mídia, sem narrativa. E via API do GitHub: `homepageUrl: "https://brand-new-day-fawn.vercel.app"` retorna **404** (a correta é "fan") e `description: ""` — o campo Website, o lugar mais clicado de um repo público, leva a uma página morta.
   - _Fazer:_ reestruturar o README: (1) hero com link da demo ao vivo + GIF/vídeo de 10–15 s do scroll (hero→arsenal, gravado do próprio deploy); (2) 3 frases não-técnicas do que a peça demonstra; (3) "case study" curto — rig procedural sem clipes, câmera Catmull-Rom, 3 tiers adaptativos, harness de IA; (4) números reais (draw calls, testes, bundle, Lighthouse do deploy); (5) então o setup técnico atual. **Corrigir o `homepageUrl` (fawn→fan)** e preencher a `description` ("Experiência 3D cinematográfica — React/Three.js — portfólio de Clayton R.") antes de abrir.
   - _Por quê:_ o README e os metadados do repo são as páginas mais lidas; hoje o primeiro falha nos dois públicos e o segundo ensina o caminho errado para a única experiência que importa.

4. **C4 · Claim de performance falsificável no próprio repo.**
   - _Evidência:_ `ColophonSection.tsx:14` — _"zero janks em mobile mid-range"_; vs `PROGRESS.md:15-28` (sessão S23 pendente) e `PerformanceMonitor.tsx:15` (sem threshold 30–44 fps).
   - _Fazer:_ executar a sessão de device (Bloco A) e implementar FALHA-02 (medium→low < ~40 fps) **ou** suavizar o copy para algo verificável ("três tiers de performance adaptativa").
   - _Por quê:_ num repo público, o avaliador técnico lê o PROGRESS.md; uma afirmação de marketing desmentida pelo próprio tracking destrói credibilidade — pior que não afirmar nada.

### 🟠 Alto (diferencia "bom" de "excelente")

5. **A5 · Atribuição CC-BY 4.0 incompleta no modo estrito.**
   - _Evidência:_ `ModelAttribution.tsx:17-27` — tem criador + obra linkada + licença, mas falta o **título da obra** ("Spider-Man Brand New Day"), a **indicação de modificação** (§3(a)(2) — o arquivo é `-v2` com pipeline KTX2, sinais fortes de conversão/otimização do original) e o **aviso de copyright** ("© Eskze").
   - _Fazer:_ estender a string para algo como: `Modelo 3D "Spider-Man Brand New Day" por © Eskze · CC BY 4.0 · convertido/otimizado a partir do original` (uma linha, mesmos links).
   - _Efeito esperado:_ conformidade estrita com a licença que o projeto já trata como prioridade — e demonstração pública de que o autor lê licenças, sinal raro e valioso para tech lead.

6. ~~**A6 · Bundle único de 1.573 kB sem code-splitting.**~~ **✅ RESOLVIDO (2026-09-14, PR da onda W2):** `manualChunks` separa `vendor-3d` (three + r3f + postprocessing, 1.175 kB / 327 gzip), `vendor-motion` (gsap + lenis, 132 kB / 49 gzip) e entry de aplicação (265 kB / 85 gzip) — cache de vendor entre visitas e parse inicial 6× menor. React.lazy no canvas avaliado e **rejeitado**: o loader narrativo consome o `useProgress` do GLB que só existe dentro do canvas (`vite.config.ts` documenta a decisão e o `chunkSizeWarningLimit`).
   - _Evidência:_ saída real do `pnpm build` (`dist/assets/index-*.js 1,573.00 kB │ gzip: 460.51 kB` + warning de chunk > 500 kB); `vite.config.ts` sem `build.rollupOptions`.
   - _Fazer:_ `manualChunks` separando `three`/`@react-three`/`gsap` (cache longo de vendor) e/ou `build.rollupOptions.output`; avaliar `React.lazy` para o canvas (o `StaticFallback` já é o caminho sem WebGL).
   - _Efeito esperado:_ TTI menor e cache hit de vendor entre visitas; o warning do Vite some do log que um tech lead vai rodar.

7. ~~**A7 · GLB de 22,4 MB sem compressão de geometria.**~~ **✅ RESOLVIDO (2026-09-14, PR #61):** meshopt + quantização via glTF-Transform — 23,5 → **6,5 MB** (bem abaixo do budget ≤ 15 MB), ADR-029; loader meshopt-ready não precisou de mudança de código. Re-run Lighthouse pós-compressão: TBT mobile −9,4× (7.360 → 780 ms), desktop perf 83 → 94 (`docs/research/2026-09-14-lighthouse.md`).
   - _Evidência:_ `ls -la public/models/`; `docs/STATE.md:189-190` (F4b previsto, ≤ 15 MB, não executado); KTX2 configurado só para texturas (`gltfKtx2Loader.ts`).
   - _Fazer:_ executar F4b (meshopt ou Draco; meshopt tem melhor decode em mobile) + servir com compressão; medir antes/depois.
   - _Efeito esperado:_ corte de 30–50% no maior asset; loader visível por menos tempo em 4G — diretamente ligado ao "wow nos primeiros segundos".

8. **A8 · Lentidão mobile com causa raiz aberta (FALHA-02).**
   - _Evidência:_ `PerformanceMonitor.tsx:15,124` — `medium→low` só em FPS < 30; `PROGRESS.md:61-62` — threshold < 40 pendente de dados.
   - _Fazer:_ rodar Wave 0 no S23; se o `medium` medir 35–44 fps, implementar o threshold mobile-only; considerar `touchMultiplier`/Lenis syncTouch (FALHA-10) se o "feel" persistir.
   - _Efeito esperado:_ a maioria dos recrutadores abrirá o link no celular; a primeira impressão móvel precisa ser lisa, não "bonita mas pesada".

9. **A9 · Nenhuma métrica pública de performance.**
   - _Evidência:_ docs citam draw calls e rubrica, mas não há Lighthouse/Web Vitals em lugar nenhum.
   - _Fazer:_ rodar Lighthouse (desktop + mobile throttled) **contra o deploy ao vivo** — antes impossível, agora trivial — e publicar os 4 números no README + mencionar o `window.__perf`/`?debug=1` como feature de inspeção aberta.
   - _Por quê:_ "performance engineering" é um dos argumentos centrais do case; sem número, é alegação. Com a URL no ar, não há mais desculpa para não medir.

10. **A10 · Zero canais de distribuição — ninguém chega à peça.**
    - _Evidência:_ grep por robots/sitemap em `public/` = zero; nenhum artefato de lançamento (post, artigo, vídeo curto) existe ou está planejado em docs; superfícies de descoberta (repo pinado, profile README, LinkedIn featured) vazias.
    - _Fazer:_ checklist de lançamento **antes** do primeiro post: (a) produzir o GIF/clip de 10–15 s a partir do pipeline `pnpm evidence:visual`/`evidence:motion`; (b) artigo de case study (dev.to/Medium/LinkedIn) — o material dos ADRs + harness dá um texto forte; (c) post principal com vídeo + link; (d) repo pinado + profile README + LinkedIn featured apontando para a demo; (e) `robots.txt`/`sitemap.xml` + `<title>` pesquisável (ver B16).
    - _Efeito esperado:_ a peça deixa de depender de "quem recebe o link diretamente" — o funil passa a existir.

11. ~~**A11 · Cegueira total de produção — ninguém sabe o que acontece com os visitantes.**~~ **✅ RESOLVIDO (2026-09-14, onda W5):** Vercel Analytics + Speed Insights (cookie-free, scripts same-origin via `/_vercel/*`) + beacon de `webgl_unavailable` no ErrorBoundary para `api/log.ts` (edge, log do dashboard — zero serviço externo).
    - _Evidência:_ `package.json` sem analytics/error tracking; grep `analytics|sentry|plausible|umami` em src/index.html = zero; sem `vercel.json`.
    - _Fazer:_ Vercel Analytics + Speed Insights (zero config) ou Plausible/Umami (privacy-friendly, sem banner); error boundary reportando a Sentry/endpoint próprio (o `ErrorBoundary` já existe em `App.tsx:93` — é ligar o report); idealmente um beacon de tier/FPS (o `window.__perf` já coleta — é enviar um POST agregado).
    - _Efeito esperado:_ funil visível (visitas → profundidade de scroll → colofon), falhas silenciosas de WebGL registradas por device, e o claim de performance (C4) virando dado RUM contínuo — defesa permanente, não medição única.

### 🟡 Médio

10. **M10 · Idioma do showcase.** README, copy da landing e docs estão em pt-BR. A landing pode ficar em pt-BR (é a peça), mas o README deveria ser EN-first (ou bilíngue com EN no topo) — recrutadores internacionais são parte do público-alvo declarado.
11. **M11 · Harness de IA invisível.** Criar `docs/case-study-ai-harness.md` (ou seção no README) contando honestamente: orquestrador delegation-only, 10 agentes com permissões granulares, gates de evidência, 28 ADRs — com link para `opencode.json`. Diferencial real para vagas de AI-augmented engineering; hoje só quem fuça o repo descobre.
12. **M12 · Headers de segurança no deploy.** O deploy existe e já traz HSTS; falta o resto: CSP básico (`default-src 'self'` + `data:`/`blob:` para shaders e workers do three), `X-Content-Type-Options: nosniff`, `Referrer-Policy`. Na Vercel é um `vercel.json` com bloco `headers` de ~15 linhas — sinal barato de cuidado para avaliador técnico.
13. **M13 · Arquivos de licença de terceiros ausentes no bundle.** Fontes SIL OFL 1.1 (`public/fonts/fonts.css:1-3` declara, mas a OFL exige distribuir o texto da licença junto aos woff2) e transcoder Basis/Khronos Apache-2.0 (`public/basis/` sem LICENSE/NOTICE). _Fazer:_ `public/fonts/OFL.txt` + `public/basis/LICENSE` (Apache-2.0). Esforço de 15 minutos, fecha a conformidade de ponta a ponta.
14. **M14 · Higiene de arquivos soltos.**
    `BUG-PLAN-2026-09-13.md` (18 KB, não tracked) e `.zcode/` ficam fora do git — ok — mas confirmar antes de tornar público que nada disso vaza; `.opencode/node_modules` e `package-lock.json` (raiz usa pnpm) são ruído se tracked.
15. **M15 · Ponto cego de browsers não-Chromium (ver 5.11).**
    Safari — o browser mais provável de um recrutador com iPhone — e Firefox não têm uma única verificação registrada; toda a suíte roda Chromium (`playwright.config.ts:43-52`).
    _Fazer:_ passada manual em Safari macOS + iPhone real, de carona na sessão que o TD-002 já exige (`PROGRESS.md:39`), com veredito registrado no STATE.md; opcionalmente, um projeto `webkit` no tier `@smoke` para o caminho crítico (loader → hero → fallback).
    _Não fazer:_ matriz completa WebKit+Firefox em CI (ver bloco Overkill).

### 🟢 Baixo

16. **B16 ·** `robots.txt`/`sitemap.xml` triviais para o domínio do deploy.
17. **B17 ·** Nota no README sobre telemetria (ausência dela) — sinal positivo e gratuito.
18. **B18 ·** OG image dedicada com composição (lente + título), em vez de reusar o poster cru.

---

## 5. 🗺️ Roadmap final (prioridade × esforço)

| #     | Item                                                                                                                                    | Esforço            | Desbloqueia                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------- |
| ~~0~~ | ~~Deploy + URL pública~~                                                                                                                | —                  | ✅ **FEITO** — <https://brand-new-day-fan.vercel.app/> (GitHub→Vercel)            |
| ~~1~~ | ~~OG/Twitter/favicon + og:image com `og:url` da Vercel (C1)~~                                                                           | —                  | ✅ **FEITO** — PR #59, validado em produção                                       |
| ~~2~~ | ~~LICENSE + disclaimer fan-made (C2) + completar atribuição CC-BY (A5) + OFL/Apache em public/ (M13) — um único PR "chore(licensing)"~~ | —                  | ✅ **FEITO** — PR #58                                                             |
| ~~3~~ | ~~README showcase: URL da demo + GIF + case study + números (C3, A9, M10)~~                                                             | —                  | ✅ **FEITO** — PR-3 + `docs/research/2026-09-14-lighthouse.md` + metadata do repo |
| 4     | Sessão S23 (Bloco A) + FALHA-02 **ou** suavizar claim (C4, A8)                                                                          | 1 sessão de device | Copy verdadeiro + mobile liso                                                     |
| 5     | Lighthouse no deploy ao vivo + publicar números (A9)                                                                                    | 1 h                | Performance deixa de ser alegação                                                 |
| ~~6~~ | ~~Code-splitting vendor (A6)~~                                                                                                          | —                  | ✅ **FEITO** — onda W2 (entry 265 kB + vendor cacheável)                          |
| ~~7~~ | ~~Compressão GLB meshopt ≤ 15 MB (A7)~~                                                                                                 | —                  | ✅ **FEITO** — PR #61 (23,5 → 6,5 MB, ADR-029)                                    |
| 8     | Headers de segurança via `vercel.json` (M12)                                                                                            | 30 min             | Polish técnico                                                                    |
| 9     | Case study do harness de IA (M11)                                                                                                       | 2–3 h              | Diferencial narrativo                                                             |
| 10    | Passada manual Safari macOS + iPhone real (de carona no TD-002) + `webkit` opcional no smoke (M15)                                      | 1–2 h              | Fecha o ponto cego do browser nº 1 (5.11)                                         |

**Recomendação (atualizada na execução):** itens 1–3 **executados** (PRs #58/#59/PR-3). A divulgação fica liberada com **C4 resolvido** — via sessão de device (Bloco A + FALHA-02 ou claim sustentado) ou, se a sessão atrasar, via fallback de copy do plano. O item 10 (passada Safari/iPhone) segue recomendado de carona na mesma sessão de device. O que fica explicitamente **de fora** desta fase está no bloco Overkill abaixo.

### ❌ Overkill nesta fase (explícito, para resistir ao impulso)

A sequência acima já está certa; este bloco demarca a fronteira do que **não** fazer antes de divulgar:

- **Beacon custom de FPS/tier + Sentry completo** (o "idealmente" do A11): Vercel Analytics + Speed Insights cobrem o pré-lançamento com zero config; telemetria custom só se paga com tráfego para agregar — pós-tração.
- **SEO orgânico (B16: robots.txt/sitemap.xml) e `<title>` "pesquisável":** peça de página única distribuída por link direto (LinkedIn/post/repo); busca orgânica não é canal desta fase.
- **OG image com composição dedicada (B18):** o poster cru já destrava o compartilhamento (C1); composição autoral é refinamento pós-lançamento.
- **Matriz completa WebKit+Firefox em CI:** custo alto de manter sob SwiftShader para benefício baixo; a passada manual do M15 (+ `webkit` pontual no smoke) basta.
- **i18n da landing:** o README EN-first (M10) é o trade certo; a peça fica em pt-BR — é a voz dela.
- **"Só mais um PR de perf antes de postar" (A6/A7):** valiosos, e já corretamente posicionados como subsequentes — não são gate de lançamento.

---

## 6. Nota geral consolidada — **6,5/10**

Não é a média das dimensões (7,2); é o julgamento ponderado pelo impacto real em quem avalia. O teto deste projeto é altíssimo — a execução de código, motion e processo está no percentil superior de portfolios individuais, e a régua "excelente" está ao alcance. Com o deploy no ar, um recrutador não-técnico **que receba o link diretamente** já vive a experiência completa — a variável distribuição saiu de 0. Mas a peça continua sem embalagem: o link compartilhado não gera preview (OG/favicon), o repo não aponta para a demo nem tem LICENSE, o README não vende nada, um tech lead encontra um claim de performance desmentido pelo próprio repo, e a pergunta mais óbvia de todas — "você pode usar o Homem-Aranha assim?" — não tem resposta escrita em lugar nenhum. A experiência é 8; a engenharia é 9; o copy é 9; a embalagem é 3; a conformidade legal está a 1–2 horas de distância. O dia em que OG + LICENSE/disclaimer + README showcase + claim verificado existirem, esta auditoria se reescreve em **9/10** sem tocar em uma linha de código 3D. A meta-auditoria de 2026-09-14 acrescentou a dimensão que faltava (5.11 — browsers reais; nota baixa por ser não-verificado, não por falha conhecida) e promoveu a acessibilidade a dimensão própria (5.12, 7,5) sem alterar este consolidado: a recomendação operacional permanece idêntica. Com **C1–C3 executados** (PRs #58/#59/PR-3, ver atualização no topo), a embalagem existe: o link gera preview, o repo é publicável e aponta para a demo correta, o README vende nos dois públicos com números publicados. O que separa este consolidado do **9/10** é exclusivamente **C4** — o claim de performance sustentado por medição.

---

## Apêndice — evidências-chave consultadas

| Achado                                                       | Evidência                                                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy ao vivo, servindo a `main` atual                      | `curl -sI https://brand-new-day-fan.vercel.app/` → 200, `server: Vercel`, HSTS, HTML idêntico ao local (2026-09-14)                         |
| GLB servido corretamente em produção                         | `curl -sI …/models/spider-man_brand_new_day-v2.glb` → 200, `content-type: model/gltf-binary`                                                |
| URL da demo ausente do repo                                  | busca por vercel/demo em README/docs/index.html na `main` = zero                                                                            |
| GLB 22,4 MB (não ~70 MB)                                     | `ls -la public/models/`                                                                                                                     |
| Bundle 1.573 kB / 460 kB gzip, chunk único                   | saída real `pnpm build` (2026-09-14)                                                                                                        |
| 0 vulnerabilidades                                           | `pnpm audit`                                                                                                                                |
| Sem OG/favicon (local e produção)                            | `index.html:3-14` + HTML servido pela Vercel                                                                                                |
| Sem LICENSE                                                  | `ls LICENSE*` — no matches                                                                                                                  |
| Atribuição CC-BY em 5 superfícies                            | `ModelAttribution.tsx` + Hero/Arsenal/FullBody/Colophon/StaticFallback                                                                      |
| Tier mobile nunca `high`; threshold low só < 30 fps          | `initialTier.ts:20-27`, `PerformanceMonitor.tsx:15,124`                                                                                     |
| Claim "zero janks" não verificado                            | `ColophonSection.tsx:14` × `PROGRESS.md:15-28`                                                                                              |
| 168 testes unit / 14 specs visuais / smoke gate              | `docs/STATE.md:182-184`, `tests/unit/`, `tests/visual/`, `.github/workflows/ci.yml`                                                         |
| TS strict, 1 `any` em src                                    | `tsconfig.app.json`, grep `as any\|: any\|@ts-ignore`                                                                                       |
| Harness: orquestrador + 10 agentes, permissões granulares    | `opencode.json:12-235`, `.opencode/agent/*.md`                                                                                              |
| reduced-motion de ponta a ponta                              | `usePrefersReducedMotion.ts`, `index.css:134-200`, `PerformanceMonitor.tsx:82-86`, `tests/visual/reduced-motion.spec.ts`                    |
| Gyro iOS com máquina de estados + fallback                   | `gyroController.ts:39-119`, `GyroPrompt.tsx`                                                                                                |
| Fallback WebGL editorial                                     | `StaticFallback.tsx`, `App.tsx:58-60`                                                                                                       |
| Copy: arco de uma noite (field log nos stamps)               | `beatStamps.ts:15-23`, `storyboard.md` (copy "fechada")                                                                                     |
| CC-BY sem título/modificação/©                               | `ModelAttribution.tsx:17-27` vs CC-BY 4.0 §3(a)                                                                                             |
| Personagem sem disclaimer (CC-BY não cobre IP do personagem) | grep `marvel\|sony\|disney` em src/README/storyboard = 0; `FullBodyOverlay.tsx:35`                                                          |
| Fontes OFL e Basis Apache-2.0 sem arquivos de licença        | `public/fonts/fonts.css:1-3`, `find public -iname "*licen*"` = 0                                                                            |
| Suíte 100% Chromium; Safari/Firefox sem verificação          | `playwright.config.ts:43-52` (2 projetos, engine default); grep `safari\|webkit\|firefox` em src/tests/configs = 1 hit (`GyroPrompt.tsx:9`) |
| Contraste `dim`×`ink` ≈ 3,6:1 (AA só para texto grande)      | tokens em `src/index.css:5,11` — `#6b6a63` sobre `#0a0a0c`                                                                                  |
| Sem caminho de teclado especificado/testado                  | grep `onKeyDown\|keydown\|tabIndex` em `src/` = 0                                                                                           |
| main publica direto em produção, sem gating de deploy        | integração GitHub→Vercel servindo `main` (verificada no topo desta auditoria); nenhum registro de preview/staging em docs                   |
