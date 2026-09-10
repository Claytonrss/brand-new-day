# Débito Técnico

Registro de limitações conhecidas que foram aceitas conscientemente, com o
motivo, o impacto e o caminho de saída.

---

## TD-001: Piscada da máscara é estilizada, não anatômica

**Aberto em:** 2026-09-09 (PR #26)
**Status:** **mitigado** — opções E+D implementadas; caminho definitivo (B) segue aberto
**Impacto:** baixo (detalhe de acabamento, não afeta composição nem performance)

### O que existe hoje (E+D)

O asset **não tem pálpebras**: os olhos são as lentes (`Lense`), geometria
rígida. A piscada é um **obturador no shader** (`materials/lensShader.ts` +
`materials/blink.ts`):

- **E** — pálpebra superior e inferior na cor do traje fecham até se encontrar
  no meio (cobertura total no ápice), sombreadas pelo normal da lente para não
  parecer adesivo.
- **D** — a lente comprime verticalmente em direção ao próprio centro (30% no
  ápice), então lê como olho fechando, não como brilho sumindo.
- O eixo da pálpebra vem do **bounding box real do mesh** (`measureLidBounds`),
  não do UV — elimina o risco de fenda horizontal em mesh com UV rotacionado.
- Cadência aleatória de 2,6–7,2 s, duração 180 ms. `?blink=off|subtle|full|hold`
  (`hold` prende fechado para revisão). Desligado em `prefers-reduced-motion`.

**Medição de aceite:** na região do rosto, os pixels com luminância >200 caem
**98,1%** e os >240 caem **99,6%** no ápice (critério era ≥80%).
Evidência: `docs/evidence/wave-d-interaction/{1440,390}-lens-{off,subtle,hold}.png`.

Verificado: 11 testes unitários (curva, cadência, determinismo, bounds, uniforms)
+ 6 testes de browser.

### Achado durante a medição

O brilho visível dos olhos **não** vem do `Lense` — os meshes `LEDl/LEDr`
compartilham um material sem nome, mapeado como tecido. A pálpebra fecha o
`Lense` (que cobre as duas lentes num mesh só) e isso já apaga o brilho; mapear
os `LED` como lente é possível, mas hoje eles não emitem. Fica anotado para
quando o material for renomeado no re-export.

### Por que é débito

1. **Lê como "diminuir o brilho", não como piscar.** Sem uma superfície que
   cubra a lente, não há "pálpebra descendo" — só a luz encolhendo.
2. **Frágil a frame rate baixo.** A janela de 180 ms pode cair entre dois frames
   (em 2 FPS isso acontece sempre; a 30 FPS são ~5 frames, ok). No headless a
   verificação é por agendador, não visual.
3. **Depende da orientação de UV da lente** (`vLensUv.y`) para o eixo da fenda;
   se o UV estiver rotacionado em algum mesh, a fenda sai na horizontal.

### Opções de evolução (ordenadas por custo/benefício)

| # | Abordagem | Custo | Risco | Resultado |
|---|---|---|---|---|
| **E** | **Pálpebra desenhada no shader** (superfície na cor do traje cobrindo a lente de cima para baixo, em vez de só apagar o brilho) | baixo (~1 dia) | baixo | Bom; é o upgrade natural do que existe |
| **D** | **Squash da lente** (escalar `Lense`/`LED` em Y até ~0,1 no ápice, somado ao shader) | baixo | médio (revela o encaixe da lente) | Bom em combinação com E |
| **A** | **Lids geométricos** (dois capuzes finos por lente, gerados a partir do bounding box do mesh `Lense` e animados por rotação) | médio (~2–3 dias) | médio (pode parecer flaps plásticos) | Muito bom se modelado com cuidado |
| **B** | **Pálpebras de verdade no Blender** (geometria esculpida + skin no osso da cabeça) | alto (~3–5 dias + re-export) | alto (muda o asset) | Definitivo |

**Recomendação:** **E + D** como próximo incremento (sem tocar no asset),
medindo o eixo da fenda a partir do bounding box real do `Lense` em vez de
depender do UV. Se o resultado ainda não convencer, ir para **B** — que exige
ADR e preserva o GLB original (mesmo processo autorizado no item A5 do plano).

### Como validar quando for feito

- Métrica objetiva: no ápice, a fração de pixels "lente" visível deve cair
  ≥ 80%; a superfície de cobertura deve usar a cor do traje, não preto.
- Screenshots em 3 momentos (aberto, meio, fechado) nos 3 viewports.
- Olho humano: "parece piscar?" — o critério que o baseline atual não passa.

---

## TD-002: FPS em dispositivo real não medido

**Aberto em:** 2026-09-09
**Status:** aberto desde a Fase 7.3

Todos os números de FPS deste repositório vêm de Chromium headless
(SwiftShader, 1–5 FPS), **inválidos em absoluto**. O orçamento medido é
indireto (draw calls, `programs`, triângulos). Falta medir em iPhone 12 /
Android mid-tier com o HUD `?debug=1`.

---

## TD-003: GLB com geometria não comprimida

**Aberto em:** 2026-09-09 (item F4b)
**Status:** aberto

`public/models/spider-man_brand_new_day-v2.glb` tem 22,4 MB, dos quais ~19 MB
são geometria **sem Draco/meshopt** (273k vértices). O budget documentado é
≤ 15 MB. Texturas estão dentro (30 webp, 3,0 MB). Exige re-export com
quantização + ADR.
