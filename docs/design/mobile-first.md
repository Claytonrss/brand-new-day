# Sistema Mobile-First

> Mobile é o viewport principal. Desktop é uma expansão cinematográfica da
> mesma ideia — nunca o contrário.

## Viewports de validação (obrigatórios)

| Nome        | Tamanho    | Uso                                   |
| ----------- | ---------- | ------------------------------------- |
| mobile base | `390x844`  | viewport principal de design e verify |
| mobile alto | `430x932`  | variação de proporção                 |
| desktop     | `1440x900` | expansão cinematográfica              |

## Regras obrigatórias

1. **Keyframes mobile primeiro.** Definir posições de câmera mobile antes dos
   keyframes desktop finais.
2. **Aceitar restrição de frame.** Em mobile, nem sempre corpo inteiro e texto
   completo cabem no mesmo momento. Priorizar: composição > legibilidade >
   presença.
3. **Áreas seguras de copy por seção.** O texto não atravessa rosto, olhos,
   símbolo do peito, mãos ou pulso em momentos narrativos.
4. **Condicionais por breakpoint no camera rig.** Não usar apenas CSS para
   resolver uma câmera pensada para desktop.
5. **Resize/orientation change:** recalcular keyframe alvo e atualizar
   ScrollTrigger sem salto perceptível (invalidar e reconstruir triggers com
   debounce ~150ms).

## Breakpoint do camera rig

- `mobile`: largura < 768px → keyframes mobile.
- `desktop`: largura >= 768px → keyframes desktop.
- A troca de breakpoint reinicializa os keyframes com interpolação suave a
  partir do progresso de scroll atual — nunca teleporte.

## Keyframes da câmera

> As hipóteses de partida da Fase 3.1 foram substituídas pelo track calibrado
> (P0 + Waves B/4a). A fonte da verdade é `src/components/3d/cameraKeyframes.ts`
> (e `camera/cameraPath.ts`) — não manter tabelas de valores aqui.

## Critérios de aceite

- [ ] Existem keyframes mobile e desktop separados para cada seção.
- [ ] O breakpoint de troca de câmera está declarado (768px).
- [ ] O verify captura screenshots nos três viewports nos pontos-chave.
- [ ] Resize não produz salto perceptível de câmera.
