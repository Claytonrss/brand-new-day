# Scene Spec — Sujeito Vivo (Wave A)

> **Status:** pronto para implementação
> **Branch:** `feat/procedural-rig-motion`
> **Plano de origem:** `docs/plans/archive/3d-motion-upgrade-plan.md` §4 Wave A
> **Data:** 2026-09-09

## 1. Context

O GLB não tem nenhuma animação (`node scripts/inspect-glb.mjs` →
`animations: 0`, 1 skin, 66 joints). Todo o "movimento" do personagem hoje é
**um único osso**: `SpiderManModel.tsx:150-155` escreve `rotation.x/y` direto
em `mixamorig:Head_06`. Os outros 65 joints nunca se movem.

É literalmente a situação que `3d-model-treatment.md:45` manda evitar ("o
visual não parece viewport padrão de model viewer"): o personagem é uma estátua
filmada por uma câmera que se move. O Beat 1 (`memorable-moments.md:9-11`)
também pede **slerp** para a cabeça e não menciona limitar o movimento a ela.

**Achado crítico durante a implementação:** `pnpm inspect:glb` imprime os nomes
crus do glTF (`mixamorig:Head_06`), mas `THREE.PropertyBinding.sanitizeNodeName`
remove caracteres reservados — incluindo `:` —, então o mapa de nós do
`useGLTF` é chaveado por `mixamorigHead_06`. O head-tracking anterior buscava
o nome cru, nunca encontrava, e caía silenciosamente no fallback que girava o
**modelo inteiro** (`SpiderManModel.tsx:153-155`) — ou seja, o "olhar que
segue" do Beat 1 nunca existiu: o corpo todo girava ~4°. `BONE_NAMES` usa os
nomes sanitizados, verificados no browser (16 joints resolvidos).

Nomes dos joints confirmados (66): `mixamorig:Hips_01`, `Spine_02`,
`Spine1_03`, `Spine2_04`, `Neck_05`, `Head_06`, `Left/RightShoulder_07/_026`,
`Left/RightArm_08/_027`, `Left/RightForeArm_09/_028`, `Left/RightHand_010/_029`,
`Left/RightUpLeg_045/_049`, `Left/RightLeg_046/_050`, `Left/RightFoot_047/_051`.

## 2. Visual Goal

Em repouso, sem scroll e sem ponteiro, o personagem nunca deve parecer
congelado: respira, desloca o peso, corrige a postura. Com o ponteiro, a
cabeça **conduz** e o pescoço/tronco **seguem** — nunca o contrário.

- Respiração visível em close-up (Evolution), invisível em corpo inteiro
  (FullBody) — a amplitude é a mesma, a leitura muda com o enquadramento.
- Nenhum osso deve cruzar geometria: amplitudes conservadoras, validadas por
  screenshot nos 3 viewports.
- Em `prefers-reduced-motion`: **nenhum** movimento procedural (estátua
  intencional, composição preservada).

## 3. Composition

Sem mudança de enquadramento, escala, posição ou rotação do modelo. O modelo
continua posicionado por `heroModelLayout.ts` e a câmera pela Wave B. A camada
de rig mexe apenas rotações **locais** dos joints, partindo da rest pose.

Atribuição CC-BY 4.0 permanece no overlay HTML, intocada.

## 4. 3D Assets

Nenhum asset novo; nenhuma alteração no GLB nesta wave. O item A5 (repose no
Blender) só entra se A4 falhar visualmente — e aí exige ADR próprio e preserva
o arquivo original.

A rest pose é capturada **em runtime** no primeiro frame após o load
(`rig/restPose.ts`), de modo que qualquer troca futura de asset não quebra a
camada additive.

## 5. Lighting

Sem mudança. A iluminação por beat da Wave F permanece; a Wave A não toca em
luz. (A reação de luz ao movimento — olhos pulsando com a respiração — é Wave
C, via shader.)

## 6. Camera

Sem mudança. O head-tracking continua sendo do modelo, não da câmera; a Wave B
já entregou o passeio.

## 7. Interactions

### 7.1 Camadas procedurais (`rig/proceduralMotion.ts`)

Todas **additivas** sobre a rest pose, com ruído fbm compartilhado e molas
criticamente amortecidas:

| Camada               | Joints                     | Amplitude           | Frequência     |
| -------------------- | -------------------------- | ------------------- | -------------- |
| Respiração           | `Spine1_03`, `Spine2_04`   | ±0.006 / ±0.004 rad | 0.25 Hz        |
| Sway                 | `Hips_01` (yaw/pitch)      | ±0.020 / ±0.008 rad | ~0.05 Hz (fbm) |
| Deslocamento de peso | `Hips_01` (roll)           | ±0.015 rad          | ~0.09 Hz (fbm) |
| Micro-tremor         | `Left/RightHand_010/_029`  | ±0.010 rad          | 2.5 Hz + fbm   |
| Assentar das pernas  | `Left/RightUpLeg_045/_049` | ±0.004 rad          | 0.05 Hz        |

### 7.2 Head-tracking v2 (`SpiderManModel` + `rig/`)

- Alvo vem do ponteiro em nível de janela (já existente), com **clamp suave**
  por joelho: `max · tanh(x / max)` — nunca um corte duro.
- Interpolação por **slerp de quaternion** (fim do Euler direto), fator
  `1 - exp(-k·delta)`, com `k` diferente por osso para produzir follow-through:
  `Head_06` k=6 (conduz), `Neck_05` k=3.2 com peso 0.35, `Spine2_04` k=1.8 com
  peso 0.15.
- Limites do Beat 1 preservados: yaw ±0.48 rad, pitch ±0.24 rad.
- Sem hover (touch): drift autônomo lento, já existente, agora aplicado às
  mesmas três articulações em vez de só à cabeça.

### 7.3 Poses por beat (`rig/poses.ts`)

Offsets aditivos por joint, alternados por beat com mola criticamente
amortecida (≈1.2 s):

| Beat        | Pose                                                      |
| ----------- | --------------------------------------------------------- |
| `hero`      | guarda neutra — ombros 0.03, cotovelos 0.10, cabeça nível |
| `evolution` | peito aberto — `Spine2_04` −0.03, ombros −0.05            |
| `arsenal`   | punho elevado — antebraço direito −0.25, cabeça +0.10 yaw |
| `fullBody`  | poster — ombros −0.04, braços 0.06, coluna ereta          |

Amplitudes intencionalmente conservadoras porque a rest pose do asset é
desconhecida até a validação visual; um multiplicador `POSE_AMPLITUDE`
permite zerar a camada sem recompilar.

### 7.4 Tiers

| Tier                     | Camadas ativas                                                 |
| ------------------------ | -------------------------------------------------------------- |
| `high`                   | todas (respiração, sway, peso, tremor, poses, follow-through)  |
| `medium`                 | respiração + sway + peso + follow-through (sem tremor de mãos) |
| `low`                    | respiração apenas                                              |
| `prefers-reduced-motion` | nenhuma — pose estática                                        |

## 8. Performance Budget

- Custo por frame: ~12 joints × 1 slerp + 8 leituras de fbm ≈ **< 0.05 ms**,
  nenhuma alocação (vetores/quaternions reutilizados via `useMemo`).
- Nenhum draw call adicional: rig é CPU, não muda passes de render.
- Meta mantida: draw calls 44–46, `programs` 10, FPS ≥ 45 mobile / ≥ 55 desktop
  (medição em dispositivo real — não mensurável em headless).

## 9. Accessibility

- `prefers-reduced-motion`: **zero** movimento procedural, incluindo respiração
  — a composição estática precisa continuar bela (rubrica peso 1, mínimo 3).
- Nada de DOM novo; nenhum impacto em ARIA, foco ou teclado.
- Debug: com `?debug=1`, `window.__rig` expõe o quaternion da cabeça e a fase
  da respiração — usado pelos testes, sem efeito para o visitante.

## 10. Stop Conditions

- [x] `pnpm verify` verde (lint, typecheck, test, build).
- [x] `pnpm test:visual` verde nos 3 viewports (inclui 15 asserções de movimento,
      3 puladas por ausência de ponteiro no dispositivo emulado).
- [x] **Teste de movimento** (`tests/visual/motion.spec.ts`): a respiração
      avança com a página parada; com `prefers-reduced-motion`, o rig congela
      (head quaternion idêntico **e** composição pixel a pixel idêntica).
- [x] **Teste de follow-through:** com o ponteiro, `|yaw(Head_06)| >
    |yaw(Neck_05)| > |yaw(Spine2_04)|` — medido 0,037 > 0,004 > 0,0006 — e o
      alvo respeita o clamp do Beat 1 (|yaw| ≤ 0,48 rad).
- [ ] Nenhuma interpenetração visível nos screenshots de close-up
      (Evolution/Arsenal nos 3 viewports) — **requer olho humano**.
- [ ] Rubrica: "Primeira dobra" ≥ 4, "Iluminação e silhueta" ≥ 4, média ≥ 4.

**Escalar para humano se:** qualquer osso cruzar geometria de forma visível —
nesse caso, `POSE_AMPLITUDE = 0` e A4 volta para Look Dev antes de A5.
