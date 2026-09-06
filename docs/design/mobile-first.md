# Sistema Mobile-First

> Mobile é o viewport principal. Desktop é uma expansão cinematográfica da
> mesma ideia — nunca o contrário.

## Viewports de validação (obrigatórios)

| Nome | Tamanho | Uso |
|---|---|---|
| mobile base | `390x844` | viewport principal de design e verify |
| mobile alto | `430x932` | variação de proporção |
| desktop | `1440x900` | expansão cinematográfica |

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

## Keyframes iniciais (ponto de partida — validar no Look Dev)

### Desktop (1440x900)

| Seção | Posição | Alvo (lookAt) | FOV |
|---|---|---|---|
| hero | `[0, 0.2, 4.2]` | `[0, 0.4, 0]` | 35 |
| evolution | `[0.15, 0.55, 0.9]` | `[0, 0.5, 0]` | 28 |
| arsenal | `[-1.1, -0.15, 0.85]` | `[-0.55, -0.2, 0.05]` | 30 |
| fullbody | `[0, 0.1, 6.2]` | `[0, 0.1, 0]` | 40 |

### Mobile (390x844 — base)

Em portrait, o assunto precisa de FOV mais aberto ou distância maior para
caber verticalmente. Pontos de partida:

| Seção | Posição | Alvo (lookAt) | FOV |
|---|---|---|---|
| hero | `[0, 0.3, 3.6]` | `[0, 0.45, 0]` | 42 |
| evolution | `[0.1, 0.52, 1.0]` | `[0, 0.48, 0]` | 34 |
| arsenal | `[-0.9, -0.1, 0.95]` | `[-0.45, -0.15, 0.05]` | 36 |
| fullbody | `[0, 0.2, 6.8]` | `[0, 0.25, 0]` | 50 |

Estes valores são hipóteses de partida. O Look Dev v1 deve validá-los com
screenshots reais nos três viewports e ajustá-los antes de qualquer expansão.

## Critérios de aceite

- [ ] Existem keyframes mobile e desktop separados para cada seção.
- [ ] O breakpoint de troca de câmera está declarado (768px).
- [ ] O verify captura screenshots nos três viewports nos pontos-chave.
- [ ] Resize não produz salto perceptível de câmera.
