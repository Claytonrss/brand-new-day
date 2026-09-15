# [Tipo]: Resumo Curto da Feature / Fix

## 📌 Descrição das Mudanças

Resumo objetivo das alterações realizadas neste PR.

---

## 📸 Evidências Visuais

> Gerar com `pnpm evidence:visual` (390/430/1440) e **anexar no corpo deste
> PR**. `docs/evidence/` é local-only (gitignored) — o PR é o veículo da
> evidência. Evidência específica da wave (vídeo, auditoria de requests, vale
> de calls…) entra além dos screenshots de paridade.

- **Mobile 390px:** `390-hero.png`
- **Mobile 430px:** `430-hero.png`
- **Desktop 1440px:** `1440-hero.png`

---

## 🎨 Rubrica Visual (1–5, pesos de `docs/design/visual-rubric.md`)

> Preencher **todos os 10 critérios** da rubrica viva (fonte única:
> `docs/design/visual-rubric.md` — escala, pesos e regras de bloqueio).
> Bloqueantes (primeira dobra, composição mobile, integração
> texto/personagem) < 4 → PR não abre.

| Critério                           | Peso | Nota | Evidência (screenshot/spec) |
| ---------------------------------- | ---: | ---: | --------------------------- |
| Primeira dobra / impacto imediato  |    3 |      |                             |
| Composição mobile                  |    3 |      |                             |
| Integração texto + personagem      |    3 |      |                             |
| Iluminação e silhueta              |    2 |      |                             |
| Tipografia e hierarquia            |    2 |      |                             |
| Ritmo de scroll e câmera           |    2 |      |                             |
| Sensação cinematográfica/editorial |    2 |      |                             |
| Originalidade de portfólio         |    2 |      |                             |
| Performance percebida mobile       |    3 |      |                             |
| Motion reduzida ainda bonita       |    1 |      |                             |
| **Média ponderada**                |      |      | **≥ 4 obrigatório**         |

---

## 🛠️ Saída Real dos Gates de Verificação (`pnpm verify`)

```text
== Running lint ==
PASS: lint
== Running typecheck ==
PASS: typecheck
== Running test ==
PASS: test
== Running build ==
PASS: build
STATUS: PASS
```

---

## 🧪 Testes Visuais

**Gate de PR — `pnpm test:smoke` (@smoke, mobile-390):**

```text
✓ 7 passed (39.8s)
  [mobile-390] budget · console · credits · fallback · hero ·
               interaction · motion (reduced freeze) — todos @smoke
```

O suite completo (`pnpm test:visual`) roda no CI em push para `main`
(deep tier).
