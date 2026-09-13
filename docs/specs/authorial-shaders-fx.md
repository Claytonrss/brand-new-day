# Scene Spec — Efeitos Autorais (Wave C)

> **Status:** pronto para implementação
> **Branch:** `feat/authorial-shaders-fx`
> **Plano de origem:** `docs/plans/archive/3d-motion-upgrade-plan.md` §4 Wave C
> **Data:** 2026-09-09

## 1. Context

Depois de Waves F (headroom), B (câmera) e A (rig), o que ainda denuncia
"template" é o **acabamento**: todo o post-processing é de fábrica
(`EffectsStack.tsx`: somente Bloom + Vignette + Noise, parâmetros fixos) e
nenhum material do GLB tem tratamento autoral — a curadoria atual
(`SpiderManModel.tsx:68-104`) só ajusta `roughness`, `metalness` e `emissive`
por nome de material.

Consequências verificadas:

- Nada no traje reage ao tempo, ao beat ou ao ângulo de visão: a malha do
  traje (`Webs`) é uma textura estática, e o traje não tem separação de
  silhueta própria (depende só das luzes).
- Não existe **profundidade de campo**: o fundo tem a mesma nitidez do sujeito
  em todos os enquadramentos — o que mais denuncia CGI em close-up.
- O Beat 2 depende só de um `SpotLight` variando intensidade
  (`lightCues.ts`), porque não há varredura na superfície.
- Nenhum efeito reage à velocidade do scroll (Wave B publicou `velocity`; a
  câmera consome, o post-processing não).

## 1.1 Modos de intensidade (`?fx=`)

Como a camada muda a leitura da silhueta, ela é controlável por URL — o
review humano usa isso para A/B:

| Modo         | Comportamento                                         |
| ------------ | ----------------------------------------------------- |
| `?fx=off`    | sem camada de shader, sem DOF/CA (baseline da Wave B) |
| `?fx=subtle` | **padrão**: camada a 22% de intensidade, sem DOF      |
| `?fx=full`   | camada a 60% + DOF + aberração cromática              |

Medição isolada no hero (390×844), `off` vs `subtle`: delta médio de
**5,2/255** — a camada é sutil por construção. A primeira passada (45%) foi
rejeitada no review por "iluminado/metalizado demais"; além da redução de
intensidade, o rim de metal caiu de 1,3 para 0,5, a iridescência da lente de
0,35 para 0,06 e o pulso de 0,25 para 0,05.

## 2. Visual Goal

O traje precisa parecer **tecnologia vestida**, não plástico pintado:

- A malha do traje tem vida própria: um brilho tênue percorre a teia no ápice
  do Beat 2 e fica quase invisível no resto do tempo.
- A silhueta ganha um rim light de fresnel que não depende da direção da luz —
  o personagem "separa" do fundo mesmo nas seções escuras.
- As lentes da máscara têm iridescência que muda com o ângulo de visão e pulsam
  com a respiração.
- Close-ups têm profundidade de campo: o que está fora do foco desaparece num
  bokeh suave, e o foco persegue o alvo do beat (cabeça → peito → punho →
  corpo inteiro).

## 3. Composition

Sem mudança de enquadramento, keyframes, câmera ou rig. A onda mexe em
**material e post-processing**. As zonas seguras de `composition-rules.md` não
são afetadas (o DOF é sutil o bastante para não borrar texto — o texto é HTML,
fora do canvas, e nunca é afetado).

## 4. 3D Assets

Nenhum asset novo. Materiais usados do GLB (11), curados por nome real:

| Material                | Uso               | Tratamento nesta wave                    |
| ----------------------- | ----------------- | ---------------------------------------- |
| `Webs`                  | malha do traje    | teia procedural animada + rim de fresnel |
| `Lense`                 | lentes da máscara | iridescência + pulso emissivo            |
| `Frame`                 | armação           | rim de fresnel                           |
| `Webshotter`            | lançador          | rim metálico                             |
| `Shoe`, `material_4..8` | resto             | rim de fresnel sutil                     |

Nomes confirmados por `pnpm inspect:glb`.

## 5. Lighting

A iluminação por beat (Wave F) permanece. O rim de fresnel **complementa** o
rim light das luzes e é modulado por beat (ver 7.2), nunca substitui a luz.

## 6. Camera

Sem mudança. O DOF usa a própria câmera: `target` do `DepthOfField` aponta para
a âncora do beat (`CHEST_Y`, `WRIST_POSITION`, centro do modelo).

## 7. Interações e efeitos

### 7.1 Camada de material (`onBeforeCompile`)

Injeção na chunk `dithering_fragment` (final do fragment shader) e
`project_vertex` (varyings de mundo), com `uniforms` compartilhados:

- **Teia procedural:** três conjuntos de linhas paralelas a 0°, 60° e 120°,
  amostrados por UV (com fallback para posição de mundo quando não há `USE_UV`),
  animados por `uTime` e com intensidade `uWebStrength`.
- **Rim de fresnel:** `pow(1 - dot(N, V), 3)` × `uRimStrength`, na cor `signal`
  para o traje e `oxide` nos metais.
- **Iridescência (lentes):** deslocamento de matiz por ângulo de visão.
- **Pulso das lentes:** `uLensPulse` acoplado à fase da respiração do rig
  (`window.__rig.breath` é a mesma função de `uTime`).

Falha segura: se a chunk âncora não existir, o material fica sem efeito e um
`console.warn` é emitido — nunca um shader quebrado.

### 7.2 Modulação por beat (`MaterialFxDriver`)

| Beat                    | `uRimStrength` | `uWebStrength` | `uLensPulse` | Alvo do DOF              |
| ----------------------- | :------------: | :------------: | :----------: | ------------------------ |
| `hero`                  |      0.35      |      0.10      |     1.0      | cabeça                   |
| `chapter1` / `chapter2` |      0.25      |      0.06      |     0.8      | cabeça/peito             |
| `evolution`             |      0.55      |    **0.30**    |     1.4      | peito (`CHEST_Y`)        |
| `arsenal`               |      0.45      |      0.18      |     1.1      | punho (`WRIST_POSITION`) |
| `fullBody`              |      0.70      |      0.22      |     1.2      | centro do modelo         |

Transição por suavização exponencial (`1 - exp(-3·delta)`).

### 7.3 Post-processing (`EffectsStack`)

- **DepthOfField** com `target` perseguindo a âncora do beat, `bokehScale`
  entre 2 e 5 por beat. **Tier `high` apenas** (custo de passes). O primeiro
  rascunho não definia `focusRange` — o padrão é uma faixa minúscula e o
  sujeito aparecia **desfocado** (regressão reportada no review). Agora usa
  `worldFocusRange={4}` + `focusRange={0.25}` e só existe em `?fx=full`.
- **ChromaticAberration** radial com `offset` proporcional à velocidade do
  scroll (limite 0.0015). **Tier `high` apenas**, zero em
  `prefers-reduced-motion`.
- Bloom, Vignette e Noise mantêm o comportamento adaptativo da Wave F; o
  `luminanceThreshold` do bloom é reduzido no `evolution` para o brilho da teia
  participar.

### 7.4 Beat 2 no shader

A varredura de luz do Beat 2 passa a existir também **na superfície**: uma banda
luminosa percorre o peito no shader (`uWebStrength` no pico + banda por
`vWorldPosition.y`), sincronizada com o `SpotLight` da Wave F.

## 8. Performance Budget

| Recurso                   | Custo                      | Política               |
| ------------------------- | -------------------------- | ---------------------- |
| Material (fresnel + teia) | ~12 instruções de fragment | todos os tiers         |
| DOF                       | +3 passes                  | **tier `high` apenas** |
| Aberração cromática       | +1 pass                    | **tier `high` apenas** |
| Draw calls                | +4 no máximo (desktop)     | mobile mantém 44–46    |

Meta mobile preservada: **≤ 2 efeitos de post ativos** (`performance-design.md`
§Budget). Desktop passa a ter bloom + vignette + noise + DOF + CA.

## 9. Accessibility

- `prefers-reduced-motion`: o driver **congela** `uTime` e zera teia/sweep
  (sem isso o shader continuava animando e a composição deixava de ser
  pixel-idêntica — pego pelo teste `motion.spec.ts`). Sem aberração cromática,
  sem pulso, DOF desligado.
- Nada de DOM novo; nenhum impacto em ARIA, foco ou teclado.
- Contraste do texto não é afetado (HTML fora do canvas).

## 10. Stop Conditions

- [x] `pnpm verify` verde (lint, typecheck, test, build).
- [x] Nenhum erro/warning de shader no console (verificado com Playwright:
      nenhuma mensagem `THREE.WebGLProgram` ou `[suitShader] ... skipped`).
- [x] **Teia reage ao beat:** `uWebStrength` medido 0,035 no `hero` e 0,16 no
      `evolution` (modo `subtle`), 0,096/0,44 no `full`.
- [x] **DOF só no `full` e só em tier `high`** (mobile medium: ausente).
- [x] `prefers-reduced-motion`: `uTime` congelado, teia/sweep zerados,
      composição pixel-idêntica (teste em `motion.spec.ts`, 3 viewports).
- [~] Draw calls: desktop 53–59 (DOF + CA no `full`); mobile **44–46** mantido
  quando DOF/CA estão off — dentro do budget mobile.
- [x] Testes unitários da camada: 9 novos (`tests/unit/materials.test.ts`) —
      injeção, fallback seguro com warn, `uWebScale`, intenção por material.
- [x] Subconjunto visual (`hero` + `motion`, 3 viewports): 18 passed / 3 skipped.
- [ ] **Suíte visual completa nos 3 viewports** — o último run completo passou
      (48/48) antes dos ajustes finais de constante; um run posterior estourou o
      timeout de 120 s em 8 testes por contenção de CPU da máquina (não por
      asserção). Reexecutar quando a máquina estiver livre.
- [ ] Rubrica: "Iluminação e silhueta" ≥ 4, "Sensação cinematográfica" ≥ 4,
      "Originalidade de portfólio" ≥ 4 — **todos exigem olho humano**, usando o
      A/B `?fx=off|subtle|full`.

**Escalar para humano se:** o shader não compilar em GPU mobile ou o DOF
deixar o sujeito fora de foco em qualquer beat.
