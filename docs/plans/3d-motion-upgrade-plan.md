# Plano de Upgrade — Movimento e Efeitos do Objeto 3D

> **Status:** proposto — aguardando aprovação para execução
> **Data:** 2026-09-09
> **Escopo aprovado:** plano completo F → B → A → C → E → D → G, com shaders
> customizados sem restrição de tier, permissão para re-export/repose do GLB e
> refatoração da arquitetura de cena/luzes.

---

## 1. Diagnóstico (linha de base)

Medições feitas em 2026-09-09 sobre o estado atual (`main`, após PR #16).

### 1.1 Fatos verificados

| Fato | Evidência |
|---|---|
| GLB não possui nenhuma animação embutida | `node scripts/inspect-glb.mjs` → `animations: 0`, `skins: 1`, 66 bones, 16 meshes, 11 materiais, 30 texturas webp, 22.4 MB |
| O único movimento do personagem é 1 bone (cabeça) | `src/components/3d/SpiderManModel.tsx:150-155` |
| Câmera é interpolação linear sem easing | `src/components/3d/CameraRig.tsx:98-112` |
| Segmentos de câmera são retos, com descontinuidade de direção em 0.14/0.28/0.50/0.64/0.86 | `src/components/3d/cameraPath.ts:39-127` |
| "Orbit" do Arsenal é dolly reto, não arco | `src/components/3d/cameraKeyframes.ts:44-54` |
| Todas as 4 scenes (e ~10 luzes) ficam montadas permanentemente | `src/App.tsx:86-92` |
| Post-processing é 100% de fábrica, parâmetros fixos | `src/components/3d/EffectsStack.tsx:23-46` |
| Partículas: drift linear uniforme, sem turbulência/parallax | `src/components/3d/Particles.tsx:62-81` |
| Canvas sem interatividade (`pointer-events-none`); mobile sempre em idle | `src/components/3d/CanvasContainer.tsx:49`, `SpiderManModel.tsx:128-130` |
| Nenhum teste prova que algo se move | `tests/visual/hero.spec.ts` (1 screenshot após 3s) |
| `prefers-reduced-motion` fixa a câmera no enquadramento `fullBody` para a página inteira | `src/components/3d/CameraRig.tsx:52-61` |

### 1.2 Lacuna promessa × entrega

| Documento | Promessa | Entrega atual | Gap |
|---|---|---|---|
| `design/memorable-moments.md:9-11` | head-tracking com **slerp**, yaw 25-30°, pitch 12-15° | Euler direto, sem slerp, sem follow-through | parcial |
| `design/memorable-moments.md:19-25` | "luz atravessando a superfície" do símbolo | só intensidade de spotlight variando | alto |
| `design/memorable-moments.md:27-33` | câmera **cruzando o eixo** (órbita) | dolly reto | alto |
| `design/memorable-moments.md:35-42` | "pôster vivo", parallax de HUD em velocidades diferentes | câmera recua, HUD sem parallax real | alto |
| `design/3d-model-treatment.md:45` | "não parece viewport padrão de model viewer" | é exatamente um model viewer com câmera móvel | **crítico** |
| `design/performance-design.md:62-63` | < 50 draw calls, máx. 2 efeitos de post em mobile | ~10 luzes (várias com sombra) + 3 efeitos | alto |
| `design/visual-rubric.md` | "ritmo de scroll e câmera", "sensação cinematográfica" | nota 5/5 autoatribuída sem teste de movimento | **medição inválida** |

### 1.3 Causa raiz única

> O projeto animou a **câmera** e esqueceu o **sujeito** e a **luz**.
> Um personagem congelado filmado em movimento lê como "modelo 3D girando",
> não como cinema.

---

## 2. Princípios do plano

1. **Headroom antes de efeito.** Nenhuma wave nova entra sem que a anterior tenha devolvido orçamento de GPU (Wave F é pré-requisito de B/C/E).
2. **Uma fonte de verdade para o beat.** Fim dos `ScrollTrigger` espalhados: um `beatController` publica `{ beat, t, scrollProgress, velocity }` e câmera, luz, pose, shader e HTML consomem o mesmo estado.
3. **Movimento é hierárquico.** Corpo > cabeça > olhos. Nada de animar só a cabeça.
4. **Todo efeito tem início, ápice e saída.** Nada de parâmetro constante (`design/memorable-moments.md`).
5. **Degradação é escolha visual, não página quebrada** (`performance-design.md:46-54`): no tier `low` o personagem fica em pose forte e estática, iluminação preservada.
6. **Toda wave é mensurável.** Sem medição (FPS, draw calls, delta de pixels), a wave não passa pelo gate.
7. **Atribuição CC-BY 4.0 permanece visível sem hover** em qualquer mudança de asset.

---

## 3. Arquitetura alvo

```
src/components/3d/
├── beat/
│   ├── beatController.ts        # NOVO: estado único de beat + velocidade (Lenis)
│   ├── BeatProvider.tsx         # NOVO: context com { beat, t, progress, velocity }
│   └── beats.ts                 # NOVO: definição declarativa dos 4 beats
├── camera/
│   ├── cameraPath.v2.ts         # NOVO: CatmullRomCurve3 + easing por segmento
│   ├── CameraRig.tsx            # REESCRITO: curva + handheld noise + velocity punch
│   └── cameraKeyframes.ts       # MANTIDO (fonte dos pontos de controle)
├── rig/
│   ├── boneMap.ts               # NOVO: nomes Mixamo → função semântica
│   ├── restPose.ts              # NOVO: captura da pose original (additive-safe)
│   ├── poses.ts                 # NOVO: offsets por beat (guarda/tense/wrist/poster)
│   ├── proceduralMotion.ts      # NOVO: fbm + molas criticamente amortecidas
│   └── useProceduralRig.ts      # NOVO: aplica camadas additive no skeleton
├── materials/
│   ├── suitShader.ts            # NOVO: onBeforeCompile (fresnel rim + teia animada)
│   ├── lensShader.ts            # NOVO: iridescência + pulso emissivo
│   └── materialRegistry.ts      # NOVO: curadoria por nome de material do GLB
├── fx/
│   ├── EffectsStack.tsx         # REESCRITO: DOF + CA + streak + beat modulation
│   ├── Atmosphere.tsx           # NOVO: partículas GPU + fog exponencial
│   └── gpu/particles.glsl.ts    # NOVO: shader de drift/turbulência/parallax
├── lighting/
│   ├── LightRig.tsx             # NOVO: luzes por beat (mount condicional)
│   └── lightCues.ts             # NOVO: fade in/out por beat, sem sombras redundantes
├── interaction/
│   ├── useDragOrbit.ts          # NOVO: orbit limitado com mola de retorno
│   ├── useGyroParallax.ts       # NOVO: deviceorientation (iOS permission gate)
│   └── WebShoot.tsx             # NOVO: micro-interação Arsenal
├── SpiderManModel.tsx           # REESCRITO: composição das camadas acima
├── qualityContext.ts            # ESTENDIDO: flags de shader/rig/DOF por tier
└── PerformanceMonitor.tsx       # ESTENDIDO: HUD de draw calls/ms + budget assert
```

**Eliminados:** `HeroScene.tsx`, `EvolutionScene.tsx`, `ArsenalScene.tsx`,
`FullBodyScene.tsx` (substituídos por `LightRig` + `beatController`).

---

## 4. Waves

### Wave F — Headroom (pré-requisito)

**Objetivo:** liberar orçamento de GPU para as waves de efeito.

- **F1** `lighting/LightRig.tsx` + `lightCues.ts`: substituir as 4 scenes permanentes por **6 slots de luz permanentes** (montar/desmontar luz recompila shader: medido 200–600 ms de stall por troca de beat). Cada beat altera intensidade/posição/cor com dissolve. **Alvo: 1 único emissor de sombra (directional 1024), sombra de point light proibida (cubemap = 6 passes).**
- **F2** `PerformanceMonitor.tsx`: medir e expor FPS, ms/frame, draw calls, tri count, texture memory. HUD oculto atrás de `?debug=1`.
- **F3** `qualityContext.ts`: dpr high 1.75 / medium 1.25 / low 1.0; `multisampling` 0 em medium/low; flags novas: `shaders`, `rig`, `dof`, `particles` por tier.
- **F4** Auditoria do asset: texturas = 30 webp somando 3.0 MB (dentro do budget, nada a fazer). O peso real é **geometria não comprimida** (~19 MB dos 22.4 MB; sem Draco/meshopt) — virou item **F4b** (re-export com `meshopt`/quantização, exige ADR e decisão de dependência).

**Resultado medido (2026-09-09):** draw calls 118–120 → **44–46** (−62 %) no tier `medium`/`high` e 11–13 no `low`; `programs` estável em 10 (antes crescia 10 → 27 durante o scroll). FPS não mensurável no headless (SwiftShader). Detalhes em `docs/specs/headroom-lighting.md` §8.
**Branch/PR:** `perf/headroom-lighting` · **Risco:** baixo.

---

### Wave B — Câmera cinematográfica

**Objetivo:** matar a sensação de "slider linear".

- **B1** `camera/cameraPath.v2.ts`: `CatmullRomCurve3` por beat, reparametrização por comprimento de arco, easing por segmento (`power2.inOut` / `power1.out` conforme o beat). FOV com curva própria (não linear).
- **B2** Arsenal: interpolação **esférica** (azimute/elevação/raio) em torno do punho — arco real cruzando o eixo.
- **B3** `beatController` consome velocidade do Lenis: FOV punch (±2°), dolly lag (atraso proporcional à velocidade), desativação em `prefers-reduced-motion`.
- **B4** Handheld noise: fbm de baixa frequência em posição (±0.02) e rotação (±0.15°), com `lookAt` em lag suave.
- **B5** Correção do bug de reduced-motion: estático **por seção**, não `fullBody` global.

**Aceite:** nenhuma descontinuidade de velocidade perceptível nas 5 fronteiras; teste de movimento (G1) capta delta entre frames; rubrica "ritmo de scroll e câmera" ≥ 4.
**Branch/PR:** `feat/cinematic-camera-path` · **Risco:** médio (recalibrar keyframes).

---

### Wave A — Sujeito vivo

**Objetivo:** o personagem deixa de ser estátua. **Maior retorno de portfólio.**

- **A1** `rig/restPose.ts`: capturar quaternions/posições de repouso de todos os 66 bones na carga → base para offsets additive (nunca sobrescrever).
- **A2** `rig/proceduralMotion.ts`: camadas com pesos independentes — respiração (0.25 Hz, `Spine2`/`Spine1`/peito, amplitude 0.6–1.2°), sway de quadril (fbm, ±1.5°), micro-tremor de mãos/dedos, deslocamento de peso lento (±2° em `Hips`), follow-through de `Neck_05` (0.35) e `Spine2` (0.15) acoplados à cabeça.
- **A3** Head-tracking v2: `slerp` de quaternion (não Euler), clamp com joelho suave, lag diferente por eixo, "eye-lead" (olhos antecipam a cabeça em ~60 ms).
- **A4** `rig/poses.ts`: pose de beat — `hero` (guarda neutra), `evolution` (peito aberto, tensão), `arsenal` (punho elevado, mão em gatilho), `fullbody` (poster stance). Transição com mola criticamente amortecida.
- **A5** Somente se A4 falhar visualmente: repose do GLB em Blender (autorizado). Registrar em ADR + manter original.

**Aceite:** em repouso de 10s sem scroll, o modelo nunca congela (delta de pixels > limiar); respiração visível em close-up; nenhuma interpenetração geométrica; mobile `medium` mantém respiração + sway (sem tremor de dedos).
**Branch/PR:** `feat/procedural-rig-motion` · **Risco:** alto — mitigar com A1 e revisão visual quadro a quadro.

---

### Wave C — Efeitos autorais

**Objetivo:** sair do "kit de fábrica".

- **C1** `materials/suitShader.ts` (`onBeforeCompile`): rim light fresnel (mistura oxide/signal) modulado pela luz, **teia procedural animada** no material `Webs` (tri-weave no shader, derivado de UV + tempo), sheen direcional no traje.
- **C2** `materials/lensShader.ts`: iridescência na `Lense`, pulso emissivo acoplado à respiração e ao beat (olhos "acendem" no ápice do Beat 2).
- **C3** `fx/EffectsStack.tsx`: **DepthOfField** (distância focal = distância câmera→alvo, keyframes por beat), aberração cromática radial (modulada por beat/velocidade), streak anamórfico, scanline/glitch nas transições de capítulo. Respeitar "≤ 2 efeitos ativos em mobile" por tier.
- **C4** Beat 2 refeito: varredura de luz **no shader** do peito (banda animada) + resíduo de teia incandescente com decaimento — substitui o "só intensidade de spotlight".
- **C5** `materialRegistry.ts`: curadoria por nome real do material (`Frame`, `Lense`, `Shoe`, `Webs`, `Webshotter`), com fallback seguro.

**Aceite:** close-up do traje não parece material padrão; DOF legítimo (fundo desfocado no fullbody, sujeito nítido); efeitos mudam ao longo do scroll (teste G1 por beat).
**Branch/PR:** `feat/authorial-shaders-fx` · **Risco:** alto (shader compile em GPU mobile) — mitigar com fallback por tier e teste de console sem erro de shader.

---

### Wave E — Atmosfera com profundidade

- **E1** `fx/gpu/particles.glsl.ts` + `Atmosphere.tsx`: partículas em GPU (1 draw call), turbulência por fbm, 3 camadas de parallax com velocidades distintas, tamanho/opacidade por profundidade, wrap relativo à câmera.
- **E2** Motas reagindo ao spotlight do Beat 2 (densidade/brilho locais).
- **E3** `FogExp2` + dessaturação por profundidade: separa sujeito do fundo e cria "ar" na cena.

**Aceite:** profundidade perceptível em movimento (não em screenshot); ≤ 1 draw call adicional.
**Branch/PR:** `feat/atmosphere-depth` · **Risco:** médio.

---

### Wave D — Interatividade

- **D1** `useDragOrbit.ts`: arrastar orbita o modelo ±12° com mola de retorno (desktop e touch), desativado em reduced-motion.
- **D2** `useGyroParallax.ts`: `deviceorientation` no mobile (gate de permissão iOS 13+), substituindo "mobile sempre idle".
- **D3** `WebShoot.tsx`: toque/clique no Beat 3 dispara teia (geometria tubular) + recoil do punho + kick de câmera — restrito a tier `high`.
- **D4** Luz rim reagindo à proximidade do cursor.

**Aceite:** interação funciona nos 3 viewports; sem quebra de scroll (Lenis); reduced-motion desliga tudo.
**Branch/PR:** `feat/model-interaction` · **Risco:** médio.

---

### Wave G — Verificação de movimento (transversal, fecha o plano)

- **G1** `tests/visual/motion.spec.ts`: capturar N frames em posições fixas de scroll e asseverar **delta de pixels > limiar**; expor `window.__debug.rig` com rotação de bones para asseverar que o rig se move.
- **G2** `tests/visual/reduced-motion.spec.ts`: composição estática **correta por seção** (corrige bug atual).
- **G3** `tests/visual/budget.spec.ts`: assevera FPS médio ≥ 45 (mobile) / ≥ 60 (desktop) e draw calls < 50 via HUD de debug.
- **G4** Evidência de portfólio: captura de **webm curto por beat** em `docs/evidence/wave-x/` (superior a screenshot estático para provar movimento).
- **G5** Reexecutar a rubrica visual com notas **ancoradas nas evidências novas**.

**Branch/PR:** `test/motion-verification` · **Risco:** baixo.

---

## 5. Ordem de execução e gates

```
F (headroom) → B (câmera) → A (rig) → C (shaders/fx) → E (atmosfera) → D (interação) → G (verificação)
      ↑ gate: ms/frame e draw calls        ↑ gate: rubrica ≥ 4 + sem delta zero
```

Cada wave exige: branch `feat/<slug>` → Scene Spec (se mudar composição) → implementação → `pnpm verify` → rubrica preenchida com evidência → PR com log real + screenshots 390/430/1440 + (a partir de G) webm.

**Regra de parada:** se qualquer wave estourar o budget de mobile (FPS < 45) ou se o rig additive produzir deformação visível, a wave volta para Look Dev antes de avançar.

---

## 6. Riscos e mitigação

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Rig additive quebrar a pose Mixamo | alta | alto | A1 (rest pose capturada) + revisão quadro a quadro + fallback para repose em Blender (A5) |
| Shader não compilar em GPU mobile | média | alto | Flag `shaders` por tier, fallback silencioso, teste de console sem erro |
| Câmera spline "enlouquecer" em transições | média | médio | Manter keyframes atuais como pontos de controle; easing conservador |
| Refatoração de luzes perder o look aprovado | média | médio | Wave F com comparação antes/depois nos 3 viewports, checklist do `look-dev-report.md` |
| GLB re-export ferir licença/autoria | baixa | alto | Preservar original, manter `extras.author`, atribuição visível — ADR obrigatório |
| Testes de movimento flaky em CI | média | médio | Limiar de delta calibrado por viewport; rodar com `--repeat-each=1` e sem animação de UI |

---

## 7. ADRs a criar

- **ADR-007:** Movimento procedural do rig (sem clips no GLB) — additive sobre rest pose Mixamo.
- **ADR-008:** Câmera por curva de Catmull-Rom com easing por beat (fim do lerp linear).
- **ADR-009:** `beatController` como única fonte de verdade de estado narrativo.
- **ADR-010:** Shaders autorais via `onBeforeCompile` com fallback por tier.
- **ADR-011:** Política de luzes por beat (≤ 4 ativas, ≤ 2 shadow casters).
- **ADR-012:** (condicional) Re-export/repose do GLB — só se A4 falhar.

---

## 8. Definição de "pronto"

- [ ] Nenhum frame com o personagem congelado (G1 verde nos 3 viewports).
- [ ] Câmera sem descontinuidade de velocidade nas 5 fronteiras de segmento.
- [ ] Pelo menos 2 efeitos que não existem em nenhum template (teia animada no shader + DOF com foco por beat).
- [ ] Interação funcional sem mouse (gyro/drag) e com mouse.
- [ ] FPS ≥ 45 mobile / ≥ 60 desktop medido, não estimado.
- [ ] Rubrica visual ≥ 4 em todos os bloqueantes, com evidência âncora por critério.
- [ ] Atribuição CC-BY 4.0 visível sem hover em todas as seções.
