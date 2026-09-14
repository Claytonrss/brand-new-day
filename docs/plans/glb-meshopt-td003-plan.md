# Plano — TD-003: Compressão meshopt do GLB + Decisão de Entrega (CDN)

> **Data:** 2026-09-14
> **Branch proposta:** `feat/glb-meshopt-td003` (a partir de `origin/main`, em worktree própria — §11)
> **Status:** ✅ executado (2026-09-14) — resultado: 23,48 → 6,52 MB, ADR-029

---

## 1. Objetivo

Fechar o **TD-003**: reduzir o GLB de **22,4 MB → ≤ 15 MB** (esperado: **7–10 MB**)
via **quantização + `EXT_meshopt_compression`**, sem perda visual perceptível,
com validação objetiva pelo pipeline existente (evidências + rubrica).

Em paralelo, documentar a decisão de entrega do asset: **Vercel Hobby já
distribui `public/` via edge CDN global** — CDN externo é escape hatch, não
necessidade hoje (detalhes na §7).

## 2. Não objetivos

- Não trocar o modelo por outro asset (head-tracking, piscada e licença dependem do atual).
- Não migrar de host.
- **KTX2 fica para fase 2** (ganho de VRAM em mobile, ganho de arquivo mínimo — as 30 WebP somam só 3 MB).
- Não tocar em Draco (o loader tem Draco desligado de propósito).

## 3. Premissas verificadas

| #   | Premissa                                                        | Evidência                                                                                                   |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| P1  | Loader já é meshopt-ready — zero mudança de código além do path | `useGLTF(MODEL_PATH, false, true, extendLoader)` em `SpiderManModel.tsx:47` (draco **off**, meshopt **on**) |
| P2  | Única referência ao filename no código é `MODEL_PATH`           | `SpiderManModel.tsx:18`; `inspect-glb.mjs:11` usa o path só como default de argv                            |
| P3  | Asset já nasceu de glTF-Transform (v4.5.0)                      | metadata do GLB (`pnpm inspect:glb`)                                                                        |
| P4  | Texturas já em WebP (3,0 MB / 30 imagens) — fora do escopo      | `pnpm inspect:glb`                                                                                          |
| P5  | Geometria não comprimida: ~19 MB dos 22,4 MB (273k vértices)    | TD-003 em `docs/memory/tech-debt.md`                                                                        |

## 4. Etapas

### Fase 0 — Setup e baseline

1. Criar worktree + branch `feat/glb-meshopt-td003` de `origin/main`; rodar `pnpm bootstrap` (§11.1).
2. **Pre-flight da porta 5173** (§11.3) antes de qualquer Playwright/evidência.
3. Capturar **baseline visual** (`pnpm evidence:visual` no estado atual) para comparação 1:1 depois. Se as evidências do último PR forem recentes e na mesma branch-base, podem ser reutilizadas — julgar na hora.

### Fase 1 — Gerar e validar a variante

4. Confirmar flags da CLI antes de rodar (`optimize` pode incluir etapas destrutivas como `simplify` — **tem de ficar OFF**; a topologia não pode mudar):

   ```bash
   npx @gltf-transform/cli optimize --help   # confirmar que --simplify default é off

   npx @gltf-transform/cli optimize \
     public/models/spider-man_brand_new_day-v2.glb \
     public/models/spider-man_brand_new_day-v3-meshopt.glb \
     --compress meshopt \
     --texture-compress webp
   ```

   Se o `optimize` não permitir garantir `--simplify off`, usar o caminho granular:
   `quantize` → `meshopt` (flags explícitas de bits por atributo).

5. **Nome novo versionado** (`-v3-meshopt`), nunca sobrescrever o original: cache-busting na Vercel + rollback trivial.
6. **Integridade estrutural** (`pnpm inspect:glb public/models/spider-man_brand_new_day-v3-meshopt.glb`):
   - [ ] 66 joints Mixamo preservados (`mixamorig:Head_06`, `mixamorig:Neck_05` — head-tracking do Hero)
   - [ ] Meshes `Lense`, `LEDl/LEDr` preservados (sistema de piscada, TD-001)
   - [ ] Nomes de materiais preservados (`Webshotter`, `Webs`, `Lense`, …)
   - [ ] `extras` de licença intactos (autor Eskze, CC-BY-4.0, source URL) — crítico no contexto de `chore/licensing`
   - [ ] Draw calls ≤ 16; bounding box igual (±1%)
   - [ ] Tamanho: alvo **≤ 15 MB** (esperado 7–10 MB)

### Fase 2 — Integração e gates

7. Swap de **1 linha**: `MODEL_PATH` → `-v3-meshopt` (`SpiderManModel.tsx:18`). `useGLTF.preload` na linha 59 não muda.
8. `grep -r "brand_new_day-v2"` no repo inteiro para achar referências remanescentes (NOTICE.md, README, atribuições) e atualizar onde fizer sentido.
9. `pnpm verify` (lint + typecheck + test + build). Confirmar que `dist/models/` contém **só** a variante nova.
10. `pnpm test:smoke` com exclusão mútua de suíte (§11.4–11.5).

### Fase 3 — Validação visual e documentação

11. `pnpm evidence:visual` nos 3 viewports; comparação lado a lado com o baseline. Atenção especial: rosto/lente (shader de blink usa bounds + UV), tecido do traje (normal maps quantizados), silhueta contra o rim light.
12. **Rubrica visual ≥ 4** (`docs/design/visual-rubric.md`) — sem regressão em nenhum critério.
13. Documentação:
    - ADR novo em `docs/memory/decisions.md` (números antes/depois, por que meshopt e não Draco, por que KTX2 fica para depois)
    - Fechar TD-003 em `docs/memory/tech-debt.md`
    - Atualizar budget em `docs/design/performance-design.md` (GLB produção: 22,4 → X MB)
    - Atualizar `docs/STATE.md`
14. Remover o GLB original de `public/` **no mesmo PR** (fica no histórico do git; evita 30 MB de asset morto no deploy). Rollback = reverter o PR inteiro.
15. PR com evidências obrigatórias (§5.8): logs de `pnpm verify` + `pnpm test:smoke`, rubrica, evidências 390/430/1440.

## 5. Critérios de aceite

- [ ] GLB em produção ≤ 15 MB (meta 7–10 MB)
- [ ] `pnpm verify` e `pnpm test:smoke` verdes
- [ ] Diferença visual imperceptível nos 3 viewports; rubrica ≥ 4
- [ ] 66 joints + `Lense` + materiais + extras de licença preservados
- [ ] ADR registrado, TD-003 fechado, STATE.md e performance-design.md atualizados
- [ ] PR com evidências completas

## 6. Riscos e rollback

| Risco                                                                | Mitigação                                                                                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Artefato de quantização visível em close-up (normal maps do tecido)  | Comparação com zoom no rosto/edu lenta em 1440; se aparecer, regenerar com bits maiores (position 16, normal 12) e revalidar |
| `optimize` altera topologia (weld/simplify) sem perceber             | Checklist estrutural da Fase 1 (joints, meshes, draw calls, bbox) pega qualquer mudança                                      |
| Nome de material dedupado some e quebra mapeamento do `extendLoader` | Inspect compara lista de materiais antes/depois; `extendLoader` é lido nos testes unitários                                  |
| Regressão de cache na Vercel por sobrescrever filename               | Mitigado por design: nome novo versionado, arquivo novo                                                                      |

**Rollback:** reverter `MODEL_PATH` para o original (1 linha) — o arquivo original permanece no histórico do git e, durante o desenvolvimento, em `public/` até o merge.

## 7. Decisão de entrega — CDN

**Conclusão: a Vercel já resolve no plano gratuito. CDN externo é escape hatch, não ação.**

- Todo `public/` na Vercel já é distribuído pelo **edge CDN global** deles — não existe "subir para um CDN" separado a menos que se migre o asset de host.
- **Hobby (gratuito): ~100 GB/mês de Fast Data Transfer** (fontes na PR/discussão). Estimar o excedente pode **pausar o projeto** até o ciclo seguinte.
- Matemática com o modelo como principal asset:
  - Hoje (22,4 MB): ~4,5k downloads completos/mês antes de estourar.
  - Pós-TD-003 (~8 MB): **~12,5k/mês** — e visitante recorrente com cache quente não re-transferre (304). Para portfólio, folga ampla.
- **Gatilho de migração** (documentar no ADR): se o dashboard da Vercel mostrar > ~50% do limite em 2 meses seguidos, mover o GLB para **Cloudflare R2** (10 GB storage, **egress gratuito**, 10M leituras/mês no free tier; exige domínio próprio + CORS + `Cache-Control: immutable`; o `*.r2.dev` público não é para produção). Alternativa paga barata: bunny.net.

## 8. Fase 2 (fora deste PR)

- KTX2/BasisU nas texturas — ganho de VRAM/bandwidth de GPU em mobile.
- Medição de FPS em device real (TD-002) para validar o ganho ponta a ponta.
