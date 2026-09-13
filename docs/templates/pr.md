# [Tipo]: Resumo Curto da Feature / Fix

## 📌 Descrição das Mudanças

Resumo objetivo das alterações realizadas neste PR.

---

## 📸 Evidências Visuais

> Gerar com `pnpm evidence:visual` (390/430/1440) e copiar para
> `docs/evidence/<slug>/`. Evidência específica da wave (vídeo, auditoria
> de requests, vale de calls…) entra além dos screenshots de paridade.

- **Mobile 390px:** `docs/evidence/<slug>/390-hero.png`
- **Mobile 430px:** `docs/evidence/<slug>/430-hero.png`
- **Desktop 1440px:** `docs/evidence/<slug>/1440-hero.png`

---

## 🎨 Rubrica Visual (Notas de 1 a 5)

| Critério                    | Nota    | Observações                                    |
| --------------------------- | ------- | ---------------------------------------------- |
| Primeira Dobra (Hero)       | **5/5** | Presença cinematográfica forte                 |
| Composição Mobile           | **5/5** | Texto respeita área segura sem cobrir o rosto  |
| Composição Desktop          | **5/5** | Espaço negativo bem aproveitado                |
| Tratamento de Luz/Contraste | **5/5** | Rim light tom oxide `#7a1f24` destaca silhueta |
| Integração Texto/Personagem | **5/5** | Leitura limpa e harmônica com a paleta         |

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
