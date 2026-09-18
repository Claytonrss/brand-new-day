---
name: spec-driven
description: Fluxo vinculante de feature neste repo — Scene Spec com critérios EARS e checks pareados com prova, implementação sem desvio, verificação independente e PR com evidências. Use ao planejar ou implementar qualquer feature visual/3D; docs-only e chores são exceção marcada com [EXCEPTION].
---

# Spec-Driven — contrato de feature

Fonte única: `docs/workflow/spec-driven-contract.md`. Sequência obrigatória:

```
Scene Spec → Implement → Verify → Security Audit (se aplicável) → PR
```

## Quando usar

- Qualquer feature/fix com impacto visual ou de código — antes de escrever a
  primeira linha.
- NÃO usar para docs-only, chores de config sem impacto visual ou hotfixes
  documentados (contrato §5 — PR com prefixo `[EXCEPTION]`).

## Fases

1. **PLAN — Scene Spec** (agente `plan`): seções obrigatórias do contrato
   §2.1. Critérios de aceite em formato **EARS** ("Quando `trigger`, o sistema
   deve `resposta observável`") e cada check **pareado com uma prova** — teste,
   comando ou captura que o demonstra. Critério sem prova não é critério.
   Ambiguidade → volta para o plan.
2. **IMPLEMENT** (agentes `implement-*`): segue a spec sem desvio; se o plano
   mudar, atualiza a spec primeiro (contrato §2.2).
3. **VERIFY** (agente `verify`, independente do autor): cada critério EARS
   recebe PASS/FAIL com a prova executada anexada — gates `pnpm verify`,
   smoke, rubrica e evidências (skill `pr-evidence`).
4. **PR**: evidências completas + rubrica ≥ 4 nos bloqueantes (contrato §2.5).

## Stop conditions (contrato §4)

Rubrica ≥ 4 nos bloqueantes · FPS ≥ 55 em mobile mid-tier · Lighthouse a11y
≥ 90 · gates verdes. Escalar para o humano: spec ambígua, gate falhando após
3 iterações, qualidade < 4 após 3 iterações, budget de performance estourado

> 20%.
