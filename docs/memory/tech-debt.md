# Débito Técnico

Registro de limitações conhecidas que foram aceitas conscientemente, com o
motivo, o impacto e o caminho de saída.

---

## TD-001: Piscada da máscara é estilizada, não anatômica

**Aberto em:** 2026-09-09 (PR #26)
**Status:** aceito como débito — baseline entregue
**Impacto:** baixo (detalhe de acabamento, não afeta composição nem performance)

### O que existe hoje

O asset **não tem pálpebras**: os olhos são as lentes (`Lense`, `LEDl`, `LEDr`),
geometria rígida. A piscada atual é um **obturador no shader**
(`materials/lensShader.ts` + `materials/blink.ts`): o emissivo fecha numa fenda
central e reabre, com cadência aleatória de 2,6–7,2 s e duração de 180 ms.
Controlável por `?blink=off|subtle|full`; desligado em `prefers-reduced-motion`.

Verificado: 7 testes unitários (curva, cadência, determinismo) + 6 testes de
browser (dispara em janela razoável; zerado em reduced-motion).

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
