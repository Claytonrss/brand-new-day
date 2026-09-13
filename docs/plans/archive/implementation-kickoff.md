# Kickoff de Implementação — Portfolio Impact

> **Para quem vai implementar:** este é o documento de entrada. Leia-o por
> inteiro antes de abrir qualquer branch. O plano mestre é
> `docs/plans/archive/portfolio-impact-plan.md`; este arquivo é apenas o roteiro de
> execução.

---

## 1. Leitura obrigatória antes de começar

1. `docs/plans/archive/portfolio-impact-plan.md` — contexto, critérios de sucesso,
   waves, métricas, riscos.
2. `docs/design/design-bible.md` — paleta, regras de cor/textura/composição
   (vinculante).
3. `docs/design/storyboard.md` — copy por seção (fechada; não reescrever).
4. `docs/design/composition-rules.md` + `docs/design/mobile-first.md` —
   zonas seguras por viewport.
5. O Scene Spec da wave em `docs/specs/<nome>.md` — contrato da feature.
6. `docs/memory/decisions.md` — ADR-017 a ADR-020 (decisões deste plano).

Evidências da auditoria (baseline visual): `docs/evidence/portfolio-audit/`
(24 screenshots, 3 viewports × 8 pontos de scroll).

---

## 2. Ordem de implementação (não pular etapas)

| #   | Branch sugerida                 | O quê                                                                                                  | Spec / referência                           | Wave |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ---- |
| 1   | `fix/portfolio-p0-composition`  | Composição mobile (Arsenal/FullBody), quebra tipográfica desktop, copy FullBody, rubrica re-preenchida | plano §5 · ADR-017                          | P0   |
| 2   | `feat/loader-teaser`            | Preloader como teaser (olho/teia, 2D)                                                                  | `specs/loader-teaser.md`                    | P1a  |
| 3   | `feat/opening-title-card`       | Beat 0 tipográfico antes do Hero                                                                       | `specs/opening-title-card.md`               | P1a  |
| 4   | `feat/colophon-outro`           | Seção final: autoria + stack + CTA + CC-BY                                                             | `specs/colophon-outro.md` · ADR-019         | P1b  |
| 5   | `feat/atmosphere-per-beat`      | Assinatura de atmosfera por beat + crossfades                                                          | `specs/atmosphere-per-beat.md`              | P1c  |
| 6   | `feat/arsenal-macro-hud`        | Câmera macro no lançador + HUD técnico                                                                 | `specs/arsenal-macro-hud.md`                | P2a  |
| 7   | `feat/desktop-pointer-parallax` | Parallax de cursor (desktop)                                                                           | `specs/desktop-pointer-parallax.md`         | P2b  |
| 8   | `feat/mobile-gyro-permission`   | Gyro iOS com permissão + fallback                                                                      | `specs/mobile-gyro-permission.md` · ADR-018 | P2b  |
| 9   | `feat/web-shoot-discovery`      | WebShoot descobrível                                                                                   | `specs/web-shoot-discovery.md`              | P3   |
| 10  | `feat/webgl-fallback`           | Fallback como poster editorial                                                                         | `specs/webgl-static-fallback.md` · ADR-020  | P3   |

**Regras de dependência:**

- P0 (item 1) é pré-requisito absoluto de tudo.
- Itens 2–4 podem ser paralelos entre si; item 6 depende dos itens 1 e 5.
- Item 10 depende do asset 2D definido em ADR-020.
- Se o escopo precisar encurtar: **1, 4 e 5** são o mínimo para "portfólio".

---

## 3. Contrato por feature (todo item segue o mesmo ciclo)

1. Criar branch (`feat/<slug>` ou `fix/<slug>`).
2. Implementar seguindo o Scene Spec + Design Bible + composition rules.
3. Rodar `pnpm verify` (lint + typecheck + test + build) antes de push —
   via `bash scripts/verify-all.sh`.
4. Screenshots nos 3 viewports (390×844, 430×932, 1440×900) +
   `pnpm test:visual` se houve mudança visual.
5. Rubrica visual preenchida com nota ≥ 4 nos bloqueantes (contra evidência
   real, não autoatribuída).
6. PR com corpo contendo: log real das gates, tabela da rubrica, screenshots.
   **PR sem evidências não abre** (regra do projeto).
7. Commit em Conventional Commits (inglês).

---

## 4. O que NÃO fazer

- Não implementar fora da ordem (P0 primeiro, sempre).
- Não alterar copy do `storyboard.md` sem ADR.
- Não remover/atenuar a atribuição CC-BY (visível sem hover, sempre).
- Não adicionar luzes/draw calls fora do budget (`budget.spec.ts` na Wave G).
- Não implementar vídeo gerado por Higgsfield (ADR-020: poster/grão/marca,
  sem vídeo).
- Não tocar em compressão do GLB (TD-003 / F4b — fora de escopo).
- Se o spec estiver ambíguo ou gate falhar: **parar e escalar**, não
  improvisar (contrato spec-driven, `docs/workflow/spec-driven-contract.md`).

---

## 5. Definição de "pronto" por item

Cada Scene Spec tem seção "Critérios de aceite" mensuráveis. O item só está
pronto quando: gates passam + critérios do spec medidos + evidências anexadas
no PR + rubrica ≥ 4 nos bloqueantes.

Ordem íntegra e contexto completo: `docs/plans/archive/portfolio-impact-plan.md`.
