# DOM Micro Craft — tipografia reativa, carimbo, CTA magnético, trama

> Wave "micro-craft" DOM (backlog `docs/plans/backlog.md`: IDEIA-PAG-01,
> IDEIA-AMB-08, IDEIA-PAG-06, IDEIA-AMB-07). Tudo consome sinais que já
> existem (`beatRuntime.velocity`, `data-beat`) — nenhuma dependência nova,
> nenhum request novo. Princípio: acabamento que fã nota, custo que o
> orçamento de performance não sente.

## §1 — Tipografia reativa à velocidade (PAG-01)

As headlines "resistem" ao scroll junto com o lean 3D: em repouso seguram o
peso pôster (**700**); com a página em movimento, perdem peso até **480** e
voltam quando o scroll assenta.

- Fonte: Space Grotesk **variável 400–700 self-hosted** (ADR-021) — zero
  download novo.
- Fonte do sinal: `beatRuntime.velocity` (progress-units/s), mapeamento em
  `src/design/velocityType.ts`: deflection cheia em 3.0 progress/s com
  ease-in quadrático (scroll lento quase não afina).
- Publicação: `VelocityType` escreve `--type-wght` no `documentElement`
  (padrão ProgressBar: scroll (re)arma o loop rAF, 1 write por frame).
- **Repouso é tempo, não velocity**: depois de 300ms sem evento de scroll o
  alvo volta a 700 e o peso escrito faz easing (0.25/frame) até casa —
  depender do decay da velocity do ScrollTrigger deixava headline fina
  "estaleada" após o primeiro scroll. Em repouso o loop **termina** (zero
  rAF parado).
- **Quantização em passos de 20** (12 valores): mudança de `wght` reflowa a
  headline — o custo fica limitado aos cruzamentos de passo, exatamente
  quando o efeito é visível.
- Consumo: `.velocity-type { font-variation-settings: 'wght'
var(--type-wght, 700) }` aplicada pelo `SplitTextHeadline`.
- `prefers-reduced-motion`: o controlador **nunca arma**.
- Direção: afina (não engrossa) — mais peso = máscura; o movimento pede leveza.

## §2 — Carimbo editorial por beat (AMB-08)

Um diário de campo na **lombada esquerda** (fixo, vertical, `writing-mode:
vertical-rl`): `NYC · 04:37 · chuva fina` → `05:00 · fim da ronda`. A página
inteira acontece numa única noite chuvosa de NYC; `fullBody` carrega a data
do filme (`31 de julho`, kicker do storyboard).

- Fonte do sinal: `data-beat` no `<main>` via **MutationObserver**
  (`attributeFilter: ['data-beat']`) — desacoplado da árvore React 3D, dispara
  ~6× por scroll completo.
- Crossfade de 180ms (troca de texto no ponto transparente);
  `prefers-reduced-motion` troca seco.
- `aria-hidden="true"` — chrome decorativo; a copy é fechada em
  `src/design/beatStamps.ts` e **nunca repete** headlines de seção.
- Posição: borda esquerda (10–16px), fora de todas as zonas seguras de texto
  (`composition-rules.md`), equilibrando a ProgressBar da direita. Sem cor de
  destaque — `text-dim`, não compete com o beat accent.

## §3 — CTA magnético no colofon (PAG-06)

O único CTA da página (`ver o código →`) atrai o cursor num raio de **120px**,
inclinandose até 32% do offset do ponteiro.

- Matemática pura em `src/design/magnetic.ts`; gancho em
  `useMagnetic` (transform-only, compositor).
- Só arma com `pointer: fine`; `prefers-reduced-motion` nunca arma.
- Scroll reseta o puxão — o link nunca derrete da posição de layout.
- Easing pela transição `.magnetic-cta` (180ms, `cubic-bezier(0.22,1,0.36,1)`);
  sem loop de rAF.
- Acessibilidade inalterada: o alvo de toque continua o link inteiro; o
  outline de foco não é transformado.

## §4 — Trama do traje (AMB-07)

A malha do traje vira papel da página atrás do **opening card** e do
**colofon**: três famílias de linhas (`repeating-linear-gradient` a
0°/±60°, passo de 12px) a `opacity: 0.05` (~3.5% efetivo, dentro da faixa
3–4% da ideia; mesmo espírito do `.halftone` do chapter print, capped a 6%).

- Camada `aria-hidden` atrás do conteúdo (`absolute inset-0`); paint-only,
  zero custo de layout.
- No colofon fica **sobre** o gradiente de dissolução, então a trama aparece
  mais forte na metade inferior — onde o texto assina.

## §5 — Verificação

- Unit: `tests/unit/velocityType.test.ts` (faixa da fonte, simetria,
  quantização, monotonia), `tests/unit/magnetic.test.ts` (raio, direção,
  defaults), `tests/unit/beatStamps.test.ts` (cobertura dos 7 beats, noite
  contínua, sem repetição).
- Visual: `tests/visual/micro-craft.spec.ts` — carimbo segue os beats
  (`@smoke`, mobile-390), peso volta a 700 no repouso, trama presente no
  colofon.
- Evidências: `node scripts/collect-micro-craft.mjs` →
  `docs/evidence/dom-micro-craft/` (390/430/1440 + log de carimbo por beat,
  peso sob roldagem e puxão magnético no desktop).
