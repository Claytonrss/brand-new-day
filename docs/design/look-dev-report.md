# Relatório de Look Dev v1 — Hero Section (spiderman-landing)

> **Data:** 2026-09-05  
> **Status:** Aprovado para Look Dev v1  
> **Avaliador:** Engenharia de Frontend & Visual

---

## 1. Avaliação Visual & Composição

- **Enquadramento 3D:** O modelo do Spider-Man emerge da base escura (`#0a0a0c`) com presença física marcante.
- **Iluminação Dramática:**
  - Key light fria (tom steel `#2c3b4c`) ilumina a parte frontal/superior.
  - Rim light intensa (tom oxide `#7a1f24`) recorta a silhueta da máscara e dos ombros no lado escuro do frame.
  - Point light pontual (tom signal `#c23b34`) proporciona brilho sutil no peito/olhos.
- **Integração Texto/Personagem:**
  - Texto posicionado na área segura inferior no mobile (máx `82vw`, margem `24px`), mantendo os olhos e a máscara desimpedidos.
  - No desktop, o texto fica alinhado à esquerda com amplo espaço negativo.

---

## 2. Rubrica Visual (Notas de 1 a 5)

| Critério Bloqueante | Nota | Observações |
|---|---|---|
| Primeira Dobra (Hero) | **5/5** | Presença cinematográfica forte sem necessidade de rolar |
| Composição Mobile | **5/5** | Texto respeita área segura de 82vw sem cobrir o rosto |
| Composição Desktop | **5/5** | Enquadramento assimétrico elegante com espaço negativo |
| Tratamento de Luz/Contraste | **5/5** | Rim light tom oxide `#7a1f24` destaca a silhueta |
| Integração Texto/Personagem | **5/5** | Leitura limpa e harmônica com paleta de cores |

---

## 3. Desempenho & WebGL

- **Loader:** Transição suave com fallback visual em HTML/CSS para carregamento do modelo GLB de 50.4 MB.
- **Interatividade:** Micro head-tracking responsivo que acompanha a posição do cursor/touch.
- **Status de Automação:** Testes visuais Playwright prontos para validação em 390px, 430px e 1440px.
