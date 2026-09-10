# Scene Spec — Verificação (Wave G)

> **Status:** implementado
> **Branch:** `test/wave-g-verification`
> **Plano de origem:** `docs/plans/3d-motion-upgrade-plan.md` §4 Wave G
> **Data:** 2026-09-09

## 1. Context

As ondas F, B, A, C, E e D entregaram movimento, câmera calibrada, shaders,
atmosfera e interação — mas a **verificação** ficou incompleta:

- `tests/visual/console.spec.ts` e `credits.spec.ts` **não existiam** (foram
  perdidos no meio do processo, nunca commitados).
- Não havia gate de **orçamento de render** (draw calls / recompilação de
  shader): a regressão que a Wave F corrigiu (mount/unmount de luz fazendo
  `programs` crescer de 10 para 27) não tinha teste.
- A rubrica visual era preenchida sem evidência de **movimento**, e parallax,
  teia e piscada não se avaliam por screenshot.

## 2. Visual Goal

Nenhuma mudança visual. O objetivo é que os defeitos de movimento e de custo
**não possam voltar sem alguém perceber**.

## 3. Composition

Sem mudança.

## 4. 3D Assets

Nenhum asset novo. Os vídeos de evidência são gerados por script.

## 5. Lighting

Sem mudança.

## 6. Camera

Sem mudança.

## 7. Interações e gates

### 7.1 Console (`console.spec.ts`)

Zero `console.error` e zero `pageerror` na carga e durante um scroll completo
(11 posições). Ruído conhecido é filtrado explicitamente: deprecações do
three.js (`Clock`, `PCFSoftShadowMap`), mensagens de driver do headless
(`GPU stall due to ReadPixels`) e o aviso de perda de contexto WebGL que o
próprio app trata.

### 7.2 Atribuição (`credits.spec.ts`)

A atribuição CC-BY 4.0 tem de estar **visível sem hover** (opacidade computada
> 0,3) no Hero e no FullBody, com `href` para o Sketchfab, `target="_blank"` e
`rel` contendo `noopener` e `noreferrer`.

### 7.3 Orçamento (`budget.spec.ts`)

| Métrica | Limite | Onde |
|---|---|---|
| Draw calls por frame | **≤ 48** | Hero e Arsenal (`fx=subtle`) |
| `programs` | **≤ 24** | idem |
| Triângulos | > 100 k | garante que a cena renderizou |
| Crescimento de `programs` no scroll | **≤ +2** | hero → fullBody |
| FPS | ≥ 45 mobile / ≥ 55 desktop | **só com `PERF_FPS_ASSERT=1`** |

O FPS fica atrás de uma flag porque este runner usa **SwiftShader** (1–5 FPS
para qualquer versão do projeto): uma asserção de FPS aqui seria ruído, não
gate. Em dispositivo real: `PERF_FPS_ASSERT=1 pnpm test:visual budget.spec.ts`.

### 7.4 Evidência em vídeo (`pnpm evidence:motion`)

`scripts/collect-motion-evidence.mjs` grava um scroll completo por viewport
(390 / 430 / 1440) em WebM, porque parallax, câmera, teia e piscada só existem
em movimento. Saída: `docs/evidence/wave-g-verification/*.webm`.

## 8. Performance Budget

O próprio conteúdo da wave. Sem custo de runtime (são testes e um script).

## 9. Accessibility

`console.spec.ts` roda também em viewport mobile; nenhum teste novo altera DOM.
A verificação de reduced-motion continua nos specs de movimento, interação e
piscada.

## 10. Stop Conditions

- [x] `pnpm verify` verde.
- [x] `console.spec.ts`: 6 testes (2 × 3 viewports), zero erro.
- [x] `credits.spec.ts`: 9 testes (3 × 3 viewports) — visível sem hover, link
      seguro.
- [x] `budget.spec.ts`: 9 testes, com o de FPS pulado por padrão (3 viewports).
- [x] `evidence:motion` gera 3 vídeos (1,7 / 2,0 / 3,0 MB).
- [ ] Suíte visual **completa** verde na mesma execução (a máquina tem estado
      carregada; rodar com `--timeout=300000`).
- [ ] Rubrica atualizada com as evidências novas (olho humano).
