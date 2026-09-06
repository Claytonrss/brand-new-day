# [Tipo]: Resumo Curto da Feature / Fix

## 📌 Descrição das Mudanças

Resumo objetivo das alterações realizadas neste PR.

---

## 📸 Evidências Visuais

- **Mobile 390px (iPhone 14):** `test-results/visual/mobile-390-hero.png`
- **Mobile 430px (Pro Max):** `test-results/visual/mobile-430-hero.png`
- **Desktop 1440px:** `test-results/visual/desktop-1440-hero.png`

---

## 🎨 Rubrica Visual (Notas de 1 a 5)

| Critério | Nota | Observações |
|---|---|---|
| Primeira Dobra (Hero) | **5/5** | Presença cinematográfica forte |
| Composição Mobile | **5/5** | Texto respeita área segura sem cobrir o rosto |
| Composição Desktop | **5/5** | Espaço negativo bem aproveitado |
| Tratamento de Luz/Contraste | **5/5** | Rim light tom oxide `#7a1f24` destaca silhueta |
| Integração Texto/Personagem | **5/5** | Leitura limpa e harmônica com a paleta |

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

## 🧪 Testes Visuais (`pnpm test:visual`)

```text
Running 3 tests using 3 workers
  ✓ 1 [desktop-1440] › tests/visual/hero.spec.ts
  ✓ 2 [mobile-430] › tests/visual/hero.spec.ts
  ✓ 3 [mobile-390] › tests/visual/hero.spec.ts

  3 passed (8.9s)
```
