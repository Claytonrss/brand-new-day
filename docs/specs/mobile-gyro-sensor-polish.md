# Scene Spec: mobile-gyro-sensor-polish

> **Status:** em implementação
> **Branch:** `fix/mobile-gyro-sensor-polish` (worktree isolada, porta 5279)
> **Author:** @plan
> **Date:** 2026-09-27
> **Specs relacionadas:** `mobile-gyro-permission.md` (ADR-018, git history), `model-interaction.md` (git history, gyroTarget), FALHA-04/ADR-023 (shadow throttle)

## 1. Context

**Seção:** Hero (chip de permissão, cue e parallax por sensor) · Colophon (opt-out) · todas as seções (offset de pose do modelo e throttle de sombra no tier `medium`)

Auditoria de sensor mobile encontrou 1 bug crítico e 8 lacunas de craft. Fatos medidos (com evidência de probe):

- `shouldRefreshShadow` compara a pose contra o **frame anterior** com ε = 0,001 rad (`src/components/3d/perf/shadowThrottle.ts:63-72`). O gyro entrega graus inteiros (degrau de 1° = 0,0175 rad) e tremor de mão comigo: **refresh de sombra em ~100% dos frames** no tier medium (probe: 33/33 frames com 46 draw calls vs 30 em repouso) — o throttling da ADR-023 é anulado exatamente quando o gyro está ativo.
- O stream bruto entra sem filtro (`handleOrientation` escreve graus quantizados direto em `gyroReading`, `src/components/3d/interaction/gyroController.ts:130-137`) — ruído de sensor vira tremor visível no modelo.
- Baseline capturada 1× na 1ª leitura, nunca recalibrada; delta sem wrap de ±180° (cruzar a fronteira vira salto de ~350°).
- Sem compensação de `screen.orientation` (em landscape o Chrome remapeia gamma/beta).
- Sinal invertido vs drag desktop: drag para a direita → yaw positivo ("toward the pointer", `pointerMath.ts:44-51`); tilt para a direita (gamma+) → yaw **negativo**.
- Listener attach-once, nunca removido: segue ligado no colophon (onde o modelo saiu de cena) e com a aba escondida.
- Chip de permissão: ignorá-lo uma vez é **terminal** para sempre (persiste `'dismissed'`), aparece no 1º gesto (momento aleatório da narrativa), 9s de vida, texto de 10px. Com Chromium recente expondo `requestPermission` (medido), o fluxo de chip tende a virar default de todo o mobile.

## 2. Visual Goal

O "a página reage ao aparelho na mão" é a assinatura mobile da peça (paridade com o drag do desktop) e hoje ela está comprometida em três frentes, todas visíveis:

1. **Presença estável.** O modelo deve responder ao tilt como responde ao drag: contido, com peso, sem tremor de sensor — a "ameaça silenciosa" da Design Bible exige que o personagem observe, não que vibre. Filtro adaptativo + histerese de sombra devolvem a leitura de "corpo sólido sob luz recortada" (o custo extra de sombra por frame também queimava o orçamento do tier medium).
2. **Convite honesto, não interrupção.** O pedido de permissão passa a acontecer no **beat hero** — o momento narrativo em que a cena se apresenta — com chip maior (12px), entrada animada de 200ms e saída que nunca pune o visitante: ignorar custa no máximo 3 aparições ao longo de sessões; recusar de fato (botão "não") é que é definitivo. No colophon, uma linha mono discreta devolve o controle ("movimento ativo · desativar" / "movimento desativado · reativar") — o fechamento editorial do portfólio também é o lugar de revisar escolhas.
3. **Descobribilidade.** No Android (grant silencioso, sem chip), um micro-hint mono de 6s ("incline o aparelho") revela a affordance que ninguém adivinha — no tom da peça, não como tooltip de tutorial.

Referência: `docs/design/design-bible.md` (atmosfera, regras de cor, "ameaça silenciosa"), ADR-018 (chip nunca modal), ADR-023 (sombra sob demanda).

## 3. Composition

**Mobile (390×844, 430×932):**

- **Chip gyro (GyroPrompt):** `fixed bottom-20 left-1/2 -translate-x-1/2`, `w-[82vw] max-w-[320px]`, z-30 — slot atual, mantido. Não cobre a copy do hero nem a atribuição CC-BY. Margem horizontal ≥ 24px garantida por `82vw` em 390px.
- **Cue (GyroTiltCue):** posicionada na base do hero (`absolute` dentro do `HeroOverlay`, zona segura inferior, alinhamento central), mono 10px, `aria-hidden` — nunca cruza a máscara nem o headline.
- **Linha do colophon:** no bloco de texto do `ColophonSection`, entre a linha de stack e os CTAs; mono, alinhamento herdado, sem invadir o footer de atribuição.

**Desktop (1440×900):**

- Nenhum dos três elementos aparece com affordance ativa (chip só existe em `prompt` — iOS/touch; cue exige `granted`; desktop mostra o gyro como `unavailable` no PerfHud). Única superfície nova em desktop: 1 linha a mais no HUD de debug (`?debug`).

Reference: `docs/design/composition-rules.md`; ADR-018 (chip centralizado é exceção já sancionada).

## 4. 3D Assets

**Model:** `public/models/spider-man_brand_new_day-v3-meshopt.glb` — **sem alteração** (6,52 MB, meshopt + quantização, ADR-029).
**Textures:** KTX2 (via loader estendido), inalteradas.
**Animations:** 0 clipes (rig procedural); a feature não toca no rig — apenas no offset de grupo `INTERACTION.yaw/pitch` aplicado em `SpiderManModel.tsx:103-104`.

## 5. Lighting

Nenhuma luz muda de posição/intensidade/cor. A única mudança é **quando o shadow map atualiza** no tier `medium` (`shadowThrottle.ts`): de "frame anterior + ε 0,001" para "última atualização da sombra + ε 0,005" (histerese — §7.1). Tabela de luzes inalterada e mantida por rastreabilidade:

| Light Type | Position                               | Intensity | Color (token)   | Purpose               |
| ---------- | -------------------------------------- | --------- | --------------- | --------------------- |
| Key        | keyframe por beat (CameraRig/LightRig) | atual     | `paper`/`steel` | modelado              |
| Rim        | idem                                   | atual     | `oxide`         | recorte da silhueta   |
| Accent     | idem                                   | atual     | `signal`        | acento (olhos/pontos) |

**Shadows:** habilitadas; no `medium` o passe roda a 10 Hz + refresh imediato por histerese — **bug corrigido aqui**: com gyro ativo o custo voltava a ser por frame.

## 6. Camera

Sem mudança. Câmera Catmull-Rom por beat (`CameraRig`), keyframes mobile/desktop existentes. O gyro atua no **grupo do modelo**, nunca na câmera — paridade com o drag (ADR-018/`model-interaction.md`).

**Animation:** scroll storytelling (GSAP ScrollTrigger, `BeatProvider`) + offset de interação `1 - Math.exp(-k * delta)` com `RETURN_K = 4` (existente).

## 7. Interactions

### 7.1 Histerese no shadow throttle — [Crítico/bug]

`src/components/3d/perf/shadowThrottle.ts`

- `SHADOW_MOVE_EPSILON`: 0,001 → **0,005 rad**.
- O estado passa a carregar `refreshedYaw`/`refreshedPitch` (pose **da última atualização da sombra**, não do frame anterior).
- `shouldRefreshShadow` refresca imediatamente quando `|inputs.yaw − state.refreshedYaw| > ε` ou idem pitch; **ao refrescar** (imediato **ou** heartbeat de 10 Hz), avança `refreshedYaw/refreshedPitch` para a pose corrente.
- Drag (`dragging`/release), beat change e fling-end mantêm a semântica atual.
- Testes existentes de `shadowThrottle.test.ts` são **atualizados para a nova semântica sem enfraquecer asserção**.

### 7.2 Stream filtrado adaptativo

`src/components/3d/interaction/gyroController.ts` + `pointerMath.ts`

- `handleOrientation` deixa de escrever bruto: aplica `remapForOrientation` (§7.5) e um **low-pass por eixo com α adaptativo**:
  - salto `|raw − filtrado| > 4°` = movimento real → α = **0,35** (resposta rápida);
  - senão (tremor de sensor) → α = **0,08** (morte do jitter);
  - 1º evento: filtrado = bruto (sem salto de partida).
- Constantes puras exportadas de `pointerMath.ts`: `GYRO_JUMP_DEG = 4`, `GYRO_ALPHA_FAST = 0.35`, `GYRO_ALPHA_SLOW = 0.08`; função pura `adaptiveLowPass(prev, raw)` (sem DOM/React — testável).
- `gyroReading` passa a guardar **bruto e filtrado**: `{ rawGamma, rawBeta, fGamma, fBeta, origin: { gamma, beta } | null, hz }` (origin em espaço remapeado+filtrado). `hz` = contador de eventos por janela de 1s calculado no handler (sem timer, sem alocação por evento).
- `useInteraction` alimenta `gyroTarget` com **`fGamma`/`fBeta`** (hoje: brutos). Padrão store mutável mantido — zero re-render por evento.

### 7.3 Baseline: wrap, recenter e auto-recenter

- **Wrap ±180°** dentro de `gyroTarget`: `d = ((valor − origem + 540) % 360) − 180` por eixo, antes de converter para radianos.
- **`recenterGyro()`** exportado de `gyroController.ts`: `origin = { gamma: fGamma, beta: fBeta }` atuais (valores filtrados). Chamado:
  - em `orientationchange` (wiring de `getGyroController`);
  - **auto-recenter** no `useFrame` de `useInteraction`: quando `|yaw| > 0.8 × GYRO_LIMITS.yaw` ou `|pitch| > 0.8 × GYRO_LIMITS.pitch` por **2,5s contínuos** (acumulador em segundos de frame; zera quando a saída sai da faixa). Constantes `GYRO_SATURATION_RATIO = 0.8`, `GYRO_SATURATION_S = 2.5` exportadas de `pointerMath.ts`; acumulador extraído em helper puro testável.

### 7.4 Ciclo de vida do listener

`gyroController.ts` + `useInteraction.ts`

- Novos métodos no `GyroController`: **`suspend(source)` / `resume(source)`** com fonte taggada (`'tab' | 'scene'`, Set interno). O listener está anexado **sse** `state === 'granted'` **e** `Set` vazio. Evita a corrida: aba volta a `visible` durante o colophon e re-anexaria contra a intenção do `useInteraction`.
- Novo dep `onDetach?: () => void` (remove o listener `deviceorientation`; hoje só existe `onAttach`).
- `suspend()`/`decline()`/qualquer detach também fazem `gyroReading.origin = null` → o alvo do gyro vai a 0 e o lerp existente (`RETURN_K`) traz o modelo ao repouso sem código novo de retorno.
- `resume()` só re-anexa se `state === 'granted'`; o próximo evento recria a baseline (origin veio null).
- Wiring em `getGyroController()`: `document.addEventListener('visibilitychange')` — `hidden → suspend('tab')`, `visible → resume('tab')`.
- `useInteraction`: `useEffect` sobre o beat (`useBeat()`) — `beat === 'colophon' → suspend('scene')`, saída → `resume('scene')`.

### 7.5 Landscape + unificação de sinal

`pointerMath.ts` — função pura `remapForOrientation(gamma, beta, angleDeg)` aplicada no handler antes do filtro, por `screen.orientation?.angle ?? 0`:

| angle | eixo yaw (x) | eixo pitch (y) |
| ----- | ------------ | -------------- |
| 0     | `gamma`      | `beta`         |
| 90    | `beta`       | `−gamma`       |
| 180   | `−gamma`     | `−beta`        |
| 270   | `−beta`      | `gamma`        |

- `gyroTarget` inverte o sinal para casar com o drag: `−dGamma → +dGamma`, `−dBeta → +dBeta` (comentário no código documenta a paridade "tilt à direita = drag à direita = yaw+"). Testes do `gyroTarget` atualizados.

### 7.6 Re-trabalho do pedido de permissão

`src/components/ui/GyroPrompt.tsx` + `gyroController.ts`

- **(a) Momento:** o chip aparece quando `state === 'prompt'` **e** `needsChip()` **e** beat atual `=== 'hero'` — canal `data-beat` em `<main>` via MutationObserver (mesmo padrão de `BeatStamp.tsx`/`ArsenalClickHint.tsx`; é o mesmo estado que `beatRuntime` publica, lido fora do Canvas). Sem listener de "1º gesto" para revelar chip.
- **(b) Permanência — ignorar deixa de ser terminal:**
  - `dismiss()` **não** persiste mais `'dismissed'` em `spiderman-landing:gyro`; incrementa contador em **`spiderman-landing:gyro-dismissals`** (chave nova) e mantém state `denied` na sessão;
  - `needsChip()`: `true` sse storage principal não é `'granted'`/`'denied'` **e** contador `< 3`;
  - migração de legado: `init()` lendo `'dismissed'` antigo trata como contador inicial 1 (sem reescrever a chave) e segue para `prompt`;
  - contador ≥ 3 em `init()` → state `denied` (fallback scroll), sem persistir `'denied'` na chave principal;
  - **negação explícita**: novo botão "não" no chip → `decline()` persiste `'denied'` em `spiderman-landing:gyro` (terminal para o chip, como hoje) e desanexa;
  - negação no prompt do SO (`requestPermission` resolve `'denied'`) permanece terminal — comportamento atual de `request()`, inalterado.
- **(c) Duração:** **15s de visibilidade acumulada no hero** substituem o timer cego de 9s. Acumulação em ticks de 1s que só correm com: beat `hero` **e** chip na viewport (IntersectionObserver) **e** `!document.hidden`. Sair do hero esconde o chip **sem penalidade** (tempo acumulado preservado); voltar, reaparece na mesma sessão. Ao completar 15s acumulados → `dismiss()` (contador +1) e some da sessão. Constante `CHIP_PATIENCE_S = 15` exportada.
- **(d) Destaque:** entrada animada fade + rise ~200ms (utility `.gyro-chip-enter` + keyframes em `src/index.css`, com `animation: none` sob `prefers-reduced-motion`); copy sobe de 10px → **12px**; mantém não-modal, fora da máscara, `fixed bottom-20`, copy "Esta cena reage ao movimento." + "ativar" (signal) + **"não"** discreto (dim). Mantém `role="status"`/`aria-live="polite"`.
- **(e) Re-ask silencioso** de grant armazenado **no 1º gesto**: mantido exatamente como hoje (returning visitor sem chip; primeiro gesto re-requesta sem prompt).

### 7.7 HUD de sensor (`?debug`)

`useInteraction.ts` (publish) + `src/components/ui/PerfHud.tsx`

- `window.__interaction.gyro` publicado no `publish()` existente (só com `?debug`): `{ state, eventsHz, rawGamma, rawBeta, fGamma, fBeta, originGamma, originBeta, targetYaw, targetPitch }` — `targetYaw/Pitch` = saída do `gyroTarget`; a pose aplicada (`appliedYaw/Pitch`) segue publicada no `yaw`/`pitch` de nível raiz de `window.__interaction` (contrato pré-existente, consumido pelo HUD).
- `PerfHud` estende o poll de 500ms para ler também `window.__interaction` e renderiza 1–2 linhas mono, ex.: `gyro granted · 62 Hz · γ +03°→+2.7° · yaw −0.041`. Desktop mostra `gyro unavailable` — correto e esperado.
- Tipo `InteractionDebugState` estendido; `tests/visual/window.d.ts` já importa o tipo de `src` (propagação automática).

### 7.8 Opt-out / reativar no colophon

`src/components/ui/ColophonSection.tsx`

- Linha mono discreta (10–11px, `dim`, ação com acento `signal`/underline como os CTAs), `data-testid="gyro-colophon-toggle"`, com `useSyncExternalStore` no controller (mesmo padrão de `GyroPrompt`):
  - `state === 'granted'` → "movimento ativo · desativar" → clique chama `decline()` (persiste `'denied'` terminal no storage, desanexa, state `denied`);
  - `state === 'denied'` + suportado + `!reduced-motion` → "movimento desativado · reativar" → clique chama `request()` (gesto válido para o Safari);
  - `unavailable` ou `reduced-motion` → **nada renderiza**.
- `request()` ganha o caminho Android: sem `requestPermission` disponível e state `denied`, um `request()` explícito resolve como grant (persist `'granted'` + re-anexa) — é a reativação de quem optou out no Android.

### 7.9 Cue de descobribilidade (Android)

Novo componente **`src/components/ui/GyroTiltCue.tsx`**, montado dentro de `HeroOverlay` (fica na seção hero; sai da viewport naturalmente ao rolar).

- Mostrado apenas se: `state === 'granted'` (que já implica touch+suporte) **e** `!reduced-motion` **e** ainda não visto na sessão (flag em `sessionStorage`, chave `spiderman-landing:gyro-cue`).
- Micro-hint mono 10px, tom da peça ("incline o aparelho"), animação de entrada sutil (mesmo utilitário de entrada do chip), some após **~6s** (`GYRO_CUE_S = 6`), `aria-hidden="true"`.
- Chip e cue são mutuamente exclusivos por construção de estado (`prompt` vs `granted`).

### 7.10 Interações existentes preservadas

Drag orbit (hover-only), tap-to-shoot no Arsenal, idle drift, rim light e `cameraKick` inalterados. O gyro soma ao drag como hoje (`target = drag + gyro`).

## 8. Performance Budget

| Métrica                                | Alvo                                                                   | Medição                                                           |
| -------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| FPS mobile (medium)                    | ≥ 45 (piso 30 antes de degradar)                                       | device real, `?debug` (TD-002: headless não mede FPS)             |
| Draw calls com gyro ativo, tier medium | **p50 ≤ 40** em janela de 5s (bug: 46 em 100% dos frames; repouso: 30) | probe `window.__perf.calls` em device                             |
| Draw calls geral                       | ≤ 48                                                                   | `tests/visual/budget.spec.ts` (regressão)                         |
| Recompilação de shader                 | não cresce com scroll                                                  | `budget.spec.ts` (regressão)                                      |
| Custo do filtro por evento             | aritmética escalar, zero alocação, zero re-render                      | revisão do handler + padrão store mutável (`interactionStore.ts`) |
| Rate de publicação debug               | publish() continua 1×/frame, só com `?debug`                           | código                                                            |

Reference: `docs/design/performance-design.md`, `docs/design/quality-matrix.md`.

## 9. Accessibility

**ARIA labels:**

- Chip: container mantém `role="status"` + `aria-live="polite"`; botão "ativar" com texto visível; botão "não" com `aria-label="Não ativar o sensor de movimento"`.
- Cue: `aria-hidden="true"` (decorativa — a experiência não depende dela).
- Colophon: `<button>` com `aria-label` completo ("Desativar reação ao movimento do dispositivo" / "Reativar reação ao movimento do dispositivo").
- PerfHud: inalterado (`data-testid="perf-hud"`, dev-only).

**Keyboard navigation:**

- Chip: ordem de tab "ativar" → "não"; foco visível via regra global `:focus-visible` (`src/index.css`).
- Colophon: botão focusable com outline signal existente; sem traps.

**Reduced motion (`prefers-reduced-motion: reduce`):**

- Gyro **nunca** ativa nem pede permissão (controller init → `unavailable`; testes existentes mantidos).
- Chip não aparece (state `unavailable`); cue não aparece (gate explícito); linha do colophon não renderiza; keyframes `.gyro-chip-enter` recebem `animation: none`.

Reference: ADR-018.

## 10. Stop Conditions

Esta Scene Spec está "done" quando:

| Condição            | Medição                                                                                       | Status |
| ------------------- | --------------------------------------------------------------------------------------------- | ------ |
| Qualidade visual    | Rubrica ≥ 4 nos bloqueantes contra evidências 390/430/1440                                    | [ ]    |
| Performance         | `budget.spec.ts` verde + device: p50 draw calls com gyro ativo ≤ 40 e FPS ≥ 45 no tier medium | [ ]    |
| Acessibilidade      | Lighthouse a11y ≥ 90; gates de reduced-motion verdes                                          | [ ]    |
| Qualidade de código | `pnpm verify` (lint + typecheck + unit + build) zero erros; `pnpm test:smoke` verde           | [ ]    |
| Conformidade legal  | CC-BY visível (inafastado — `ModelAttribution` intocado)                                      | [ ]    |
| EARS                | Todo critério do §12 com veredito PASS/FAIL **e prova anexada**                               | [ ]    |

**Gatilhos de escalada:** spec ambígua → voltar ao @plan; gate falhando após 3 iterações → humano; rubrica < 4 após 3 iterações → humano; budget de performance estourado > 20% → humano.

**Security audit:** não aplicável — sem dependência externa nova, sem formulário/URL input, apenas `localStorage` same-origin sem PII (contadores e estados de permissão).

## 11. ADR-031 (emenda à ADR-018 e à ADR-023)

**ADR-031: Ciclo de vida do gyro e re-engajamento de permissão (histerese de sombra, stream filtrado, suspend/resume, dismissal counter)** — rascunho para `docs/memory/decisions.md`.

- **Contexto:** auditoria do sensor mobile — throttle de sombra anulado pelo gyro (refresh por frame no medium), stream bruto tremendo, baseline nunca recalibrada, listener imortal, e política "ignorar o chip = recusa para sempre" matava a assinatura mobile em iOS.
- **Decisão:** (1) histerese de sombra contra a pose da última atualização (ε 0,005 rad) em vez de frame anterior; (2) low-pass adaptativo (α 0,35/0,08, limiar 4°) + wrap ±180° + recenter em `orientationchange` e auto-recenter por saturação (80%/2,5s); (3) `suspend/resume(source)` taggado (`tab`/`scene`) no controller — anexado sse granted e sem suspensões; detach zera a baseline (retorno a 0 pelo lerp existente); (4) ignorar o chip vira contador (máx. 3 aparições, chave própria), recusa explícita ("não" ou prompt do SO) permanece terminal; chip aparece no beat hero com 15s de visibilidade acumulada; (5) sinal do gyro unificado com o drag e remapeado por `screen.orientation.angle`.
- **Alternativas rejeitadas:** filtro Madgwick/Kalman completo (custo/complexidade sem retorno visível para 2 eixos); re-ask infinito de chip (spam); remover o gyro do medium (mata a feature no tier mais comum).
- **Consequências:** + draw calls estáveis no medium com gyro; + paridade drag/tilt; + controle do visitante (opt-out/opt-in no colophon); ⚠️ verificação de sensor em headless segue impossível — comportamento provado por unit (funções puras) + stub de `DeviceOrientationEvent` no Playwright + captura em device (padrão TD-002).

## 12. Critérios de Aceite (EARS) — cada critério com prova

Formato: "Quando `<trigger>`, o sistema deve `<resposta observável>`". Prova = teste, comando ou captura. Sem prova não é critério.

### Grupo A — Shadow throttle

| #   | Critério EARS                                                                                                                                                                                                                          | Prova                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Quando a pose (`yaw`/`pitch`) se afastar mais que `SHADOW_MOVE_EPSILON` da pose da **última atualização** da sombra, o sistema deve refrescar o shadow map imediatamente e avançar `refreshedYaw/refreshedPitch` para a pose corrente. | Unit: `tests/unit/shadowThrottle.test.ts` — "refreshes when rotation exceeds the epsilon from the last-refresh pose (hysteresis)" (atualizado) |
| A2  | Quando o gyro produzir apenas drift sub-ε entre frames consecutivos, o sistema deve limitar os refreshes ao heartbeat de 10 Hz (nenhum refresh por frame).                                                                             | Unit: mesmo arquivo — "does not refresh on consecutive sub-epsilon drift (gyro noise keeps the heartbeat)" (novo)                              |
| A3  | Quando ocorrer refresh por heartbeat, o sistema deve avançar a baseline de histerese para a pose corrente.                                                                                                                             | Unit: "advances the hysteresis baseline on heartbeat refresh" (novo)                                                                           |
| A4  | Quando o módulo for carregado, `SHADOW_MOVE_EPSILON` deve valer 0,005 rad.                                                                                                                                                             | Unit: import da constante                                                                                                                      |
| A5  | Quando a suíte de budget rodar, os draw calls devem continuar ≤ 48 sem recompilação no scroll.                                                                                                                                         | Comando: `pnpm test:visual tests/visual/budget.spec.ts` (regressão verde)                                                                      |

### Grupo B — Stream filtrado

| #   | Critério EARS                                                                                                                                                                                          | Prova                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| B1  | Quando um evento chegar com salto > 4° vs. o filtrado, o sistema deve cobrir o grosso do tilt rápido (≥ 85% em ≤ 5 eventos, α = 0,35) e convergir a cauda final (últimos 4°) pelo α lento, por design. | Unit: `tests/unit/gyroStream.test.ts` (novo) — `adaptiveLowPass`: cobertura rápida + cauda lenta |
| B2  | Quando o evento variar < 4° (tremor de ±1,5° por evento), o sistema deve limitar o deslocamento do filtrado a ≤ 0,15°/evento (α = 0,08).                                                               | Unit: `adaptiveLowPass` com ruído quantizado                                                     |
| B3  | Quando o primeiro evento chegar, o filtrado deve iniciar igual ao bruto (sem salto de partida).                                                                                                        | Unit: caso "first sample"                                                                        |
| B4  | Quando o gyro estiver publicando, o `gyroTarget` deve ser alimentado com `fGamma/fBeta` (nunca brutos).                                                                                                | Unit: handler + asserção de que bruto ≠ entrada do target                                        |
| B5  | Quando o stream rodar a ~60 Hz de eventos, o sistema deve manter zero re-render React por evento.                                                                                                      | Unit/estrutural: handler é função de módulo mutando `gyroReading` (sem setState)                 |

### Grupo C — Baseline/wrap/recenter

| #   | Critério EARS                                                                                                                     | Prova                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| C1  | Quando gamma ou beta cruzar ±180°, o delta usado pelo `gyroTarget` deve ser o caminho curto (módulo ±180°).                       | Unit: `tests/unit/interaction.test.ts` — "wraps the delta across the ±180° boundary"                                     |
| C2  | Quando `recenterGyro()` for chamado, a origin deve passar a ser o par filtrado atual e o alvo deve convergir a 0.                 | Unit: `tests/unit/gyro.test.ts` — "recenterGyro rebaselines origin to the filtered reading"                              |
| C3  | Quando `orientationchange` disparar, o sistema deve recenter a baseline no próximo evento.                                        | Unit: handler de orientationchange exportado/testado                                                                     |
| C4  | Quando a saída saturar (> 80% do limite por eixo) por 2,5s contínuos, o sistema deve auto-recentrar (origin = filtrado corrente). | Unit: helper puro do acumulador de saturação (2,49s → sem recenter; 2,51s → recenter) em `tests/unit/gyroStream.test.ts` |

### Grupo D — Ciclo de vida

| #   | Critério EARS                                                                                                                                                        | Prova                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Quando a aba for escondida, o sistema deve remover o listener; ao voltar, re-anexar somente se state `granted`.                                                      | Unit: `tests/unit/gyro.test.ts` — "suspend('tab') detaches and resume('tab') reattaches only when granted" (spies `onAttach`/`onDetach`) |
| D2  | Quando o beat for `colophon`, o `useInteraction` deve suspender via fonte `scene`; ao sair, retomar — e a visibilidade da aba durante o colophon não deve re-anexar. | Unit: multi-fonte — `suspend('scene')` + `resume('tab')` → segue desanexado; `resume('scene')` → anexa                                   |
| D3  | Quando qualquer suspend/decline ocorrer, a origin deve ir a `null` e o alvo do gyro a 0 (retorno pelo lerp existente).                                               | Unit: origin null após suspend                                                                                                           |
| D4  | Quando `state !== 'granted'`, `resume()` deve ser no-op (nunca anexa em `denied`/`prompt`/`unavailable`).                                                            | Unit: caso negativo do D1                                                                                                                |

### Grupo E — Landscape + sinal

| #   | Critério EARS                                                                                                                                                  | Prova                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| E1  | Quando `screen.orientation.angle` for 0/90/180/270, `remapForOrientation` deve mapear gamma/beta para os eixos yaw/pitch exatamente conforme a tabela do §7.5. | Unit: `tests/unit/gyroStream.test.ts` — 4 casos exatos (um por ângulo)                                       |
| E2  | Quando o aparelho inclinar para a direita (eixo yaw positivo pós-remap), o alvo do gyro deve ser yaw **positivo** — mesmo sinal do drag desktop.               | Unit: `tests/unit/interaction.test.ts` atualizado — "maps tilt toward the tilt direction (parity with drag)" |
| E3  | Quando o tilt for extremo, o alvo deve permanecer dentro de `GYRO_LIMITS` (softClamp).                                                                         | Unit: caso existente "stays clamped for extreme tilts" mantido e verde                                       |

### Grupo F — Permissão

| #   | Critério EARS                                                                                                                                                                                        | Prova                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Quando o beat ativo for diferente de `hero`, o chip não deve renderizar; quando o beat for `hero` (state `prompt`, `needsChip()`), deve renderizar.                                                  | Visual: `tests/visual/gyro.spec.ts` (mobile-390 + stub `DeviceOrientationEvent.requestPermission`, padrão de `scripts/collect-gyro-evidence.mjs`) |
| F2  | Quando o visitante ignorar o chip por 15s de visibilidade acumulada no hero, o sistema deve chamar `dismiss()`, incrementar `spiderman-landing:gyro-dismissals` e não reapresentar o chip na sessão. | Unit: controller — "dismiss increments the dismissal counter and stays session-denied" + helper puro do acumulador                                |
| F3  | Quando o contador reach 3, `needsChip()` deve retornar `false` em sessões futuras (chip nunca mais).                                                                                                 | Unit: storage pré-populado → `init()` → state `denied`, `needsChip() === false`                                                                   |
| F4  | Quando o visitante tocar "não", o sistema deve persistir `'denied'` em `spiderman-landing:gyro` (terminal), nunca anexar o listener e nunca mais mostrar o chip.                                     | Unit: "decline persists terminal denial without attaching"                                                                                        |
| F5  | Quando o prompt do SO negar (`requestPermission` → `'denied'`), o comportamento terminal atual deve se manter.                                                                                       | Unit existente mantido                                                                                                                            |
| F6  | Quando o visitante retornar com grant armazenado, o sistema deve re-requestar silenciosamente no 1º gesto, sem chip.                                                                                 | Unit existente mantido                                                                                                                            |
| F7  | Quando sair do hero, o chip deve sumir sem penalidade (sem incremento de contador) e reaparecer ao voltar na mesma sessão.                                                                           | Visual do F1 (mesmo teste cobre ida e volta)                                                                                                      |
| F8  | Quando o chip entrar, deve animar fade+rise ~200ms, com copy a 12px, botão "não" discreto, não-modal e fora das zonas de copy.                                                                       | Visual: `getComputedStyle` (font-size 12px; `animationName`; reduced-motion → `'none'`); captura 390                                              |
| F9  | Quando `prefers-reduced-motion`, o chip nunca deve aparecer (state `unavailable`).                                                                                                                   | Unit existente mantido + visual reduced-motion → count 0                                                                                          |

### Grupo G — HUD

| #   | Critério EARS                                                                                                                                                                                            | Prova                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| G1  | Quando `?debug` estiver ativo, `window.__interaction.gyro` deve publicar `{ state, eventsHz, rawGamma, rawBeta, fGamma, fBeta, origin, targetYaw, targetPitch, appliedYaw, appliedPitch }` a cada frame. | Visual: `?debug` → todas as chaves presentes; desktop → `state === 'unavailable'` |
| G2  | Quando o PerfHud estiver visível, deve renderizar a linha mono do gyro; desktop: `gyro unavailable`.                                                                                                     | Visual: `[data-testid=perf-hud]` contém `/gyro/`                                  |

### Grupo H — Colophon opt-out

| #   | Critério EARS                                                                                                                                                   | Prova                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| H1  | Quando o state for `granted`, o colophon deve mostrar "movimento ativo · desativar"; o clique deve persistir `'denied'`, desanexar o listener e trocar a linha. | Visual (mobile-390 + stub granted): `[data-testid=gyro-colophon-toggle]` → clique → texto troca → `window.__interaction.gyro.state === 'denied'` |
| H2  | Quando o state for `denied` (suportado, !reduced-motion), o clique em "reativar" deve chamar `request()` e retornar a `granted` com o listener anexado.         | Visual: segundo clique → state `granted`; Unit: "request() re-attaches on Android (no requestPermission) when previously denied"                 |
| H3  | Quando `unavailable` ou `prefers-reduced-motion`, nenhuma linha deve renderizar.                                                                                | Visual: desktop-1440 → count 0; suíte reduced-motion → count 0                                                                                   |

### Grupo I — Cue

| #   | Critério EARS                                                                                                                                                         | Prova                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| I1  | Quando touch + `granted` + `!reduced-motion` + hero em viewport e cue não vista na sessão, o `GyroTiltCue` deve aparecer e sumir após ~6s, marcando `sessionStorage`. | Visual (mobile-390 + stub): `[data-testid=gyro-tilt-cue]` visível → some em ≤ 8s → `sessionStorage['spiderman-landing:gyro-cue']` presente |
| I2  | Quando a página recarregar na mesma sessão, a cue não deve reaparecer.                                                                                                | Visual: reload → count 0                                                                                                                   |
| I3  | Quando state for `prompt`/`denied`/`unavailable` ou reduced-motion, a cue nunca deve aparecer.                                                                        | Visual: desktop (unavailable) e reduced-motion → count 0                                                                                   |

### Grupo J — Gates gerais

| #   | Critério EARS                                                                                                                                                     | Prova                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| J1  | Quando `pnpm verify` rodar, lint + typecheck + unit + build devem passar sem erro.                                                                                | Comando: `pnpm verify`                                                                  |
| J2  | Quando o gate de PR rodar, a suíte smoke deve passar nos projetos `mobile-390` e `desktop-1440`.                                                                  | Comando: `pnpm test:smoke`                                                              |
| J3  | Quando as evidências forem coletadas, os 3 viewports devem ser fotografados sem regressão de composição.                                                          | Comando: `pnpm evidence:visual` + `node scripts/collect-gyro-evidence.mjs` (atualizado) |
| J4  | Quando o runbook de device rodar, o HUD `?debug` em aparelho real deve mostrar p50 de draw calls ≤ 40 com gyro ativo no tier medium (bug era 46/100% dos frames). | Captura device — limitação TD-002 documentada                                           |

## 13. Tarefas de implementação (ordenadas)

| #   | Tarefa                                                                                                                                                                                                                                             | Arquivos                                                                 | Depende de |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------- |
| 1   | **Matemática pura do gyro**: `remapForOrientation`, `adaptiveLowPass`, wrap ±180° e troca de sinal em `gyroTarget`, constantes + helper de saturação.                                                                                              | `src/components/3d/interaction/pointerMath.ts`                           | —          |
| 2   | **Histerese do shadow throttle**: ε 0,005, `refreshedYaw/refreshedPitch`, avanço da baseline em todo refresh.                                                                                                                                      | `src/components/3d/perf/shadowThrottle.ts`                               | —          |
| 3   | **Controller**: stream no handler (remap → filtro → raw+filtered+hz), `recenterGyro()`, `suspend/resume(source)` + `onDetach`, `decline()`, contador de dismissals + migração, `request()` Android, wiring `visibilitychange`/`orientationchange`. | `src/components/3d/interaction/gyroController.ts`                        | 1          |
| 4   | **useInteraction**: consumir filtrado, auto-recenter por saturação, suspend/resume(`'scene'`) no colophon, payload `gyro` no `publish()`.                                                                                                          | `src/components/3d/interaction/useInteraction.ts`                        | 3          |
| 5   | **GyroPrompt re-trabalhado**: gate por beat, 15s acumulados, contador, botão "não", entrada animada, copy 12px.                                                                                                                                    | `src/components/ui/GyroPrompt.tsx`; `src/index.css`                      | 3          |
| 6   | **GyroTiltCue**: componente novo + montagem no `HeroOverlay`.                                                                                                                                                                                      | `src/components/ui/GyroTiltCue.tsx`; `src/components/ui/HeroOverlay.tsx` | 4          |
| 7   | **PerfHud**: linha do gyro.                                                                                                                                                                                                                        | `src/components/ui/PerfHud.tsx`                                          | 4          |
| 8   | **Colophon opt-out**: linha mono com `useSyncExternalStore`.                                                                                                                                                                                       | `src/components/ui/ColophonSection.tsx`                                  | 3          |
| 9   | **Testes**: atualizar `shadowThrottle.test.ts` e `interaction.test.ts`; expandir `gyro.test.ts`; criar `gyroStream.test.ts`; criar `tests/visual/gyro.spec.ts`; atualizar `scripts/collect-gyro-evidence.mjs`.                                     | `tests/…`                                                                | 1–8        |
| 10  | **Docs**: ADR-031 em `docs/memory/decisions.md`; esta spec.                                                                                                                                                                                        | `docs/…`                                                                 | 5–8        |
| 11  | **Verificação**: `pnpm verify` → `pnpm test:smoke` → `pnpm evidence:visual` → rubrica → captura em device.                                                                                                                                         | —                                                                        | 9–10       |

Notas de implementação:

- Commits em Conventional Commits; PR em PT-BR com log integral de `pnpm verify` + `pnpm test:smoke` + evidências (contrato §2.5).
- Nada de re-render por evento: todo o stream segue store mutável; os únicos `setState` novos são de UI (chip/cue/colophon), reagindo a eventos raros.
- Playwright: stub de `DeviceOrientationEvent` via `addInitScript` (padrão de `scripts/collect-gyro-evidence.mjs`); eventos sintéticos via `new DeviceOrientationEvent('deviceorientation', { gamma, beta })` em `window` exercitam o stream real.
- Não enfraquecer nenhuma asserção existente; os testes de `shadowThrottle` e de sinal do `gyroTarget` mudam de semântica, não de rigor.
