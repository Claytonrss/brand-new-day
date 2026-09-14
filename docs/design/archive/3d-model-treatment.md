# Tratamento do Modelo 3D e Materiais

> Não aceitar o GLB "como veio" se os materiais ficarem lavados, planos ou sem
> presença. Carregar o asset corretamente não é suficiente.

## Composição do modelo

- Ajustar escala, rotação e posição para servir à composição de cada seção
  (ver keyframes em `mobile-first.md`).
- O modelo serve o frame — nunca o contrário.

## Materiais e luz

- Avaliar materiais **depois** de aplicar tone mapping (ACES filmic) e luzes
  — nunca isoladamente.
- Se o traje perder força, ajustar nesta ordem: exposição → intensidade das
  luzes → roughness/metalness (quando seguro) → color management.
- Preservar vermelho/azul do traje, com sombras profundas o bastante para dar
  massa gráfica.
- Rim light quente (oxide/signal) para separar a silhueta do fundo escuro.

## Post-processing

- Bloom seletivo: threshold alto (~0.85) — destacar olhos/pontos claros,
  nunca lavar o traje.
- Vignette presente (não sutil demais).
- Grão discreto, textura de filme — não de photoshop.

## Otimização

- Se otimizar texturas/geometria, comparar screenshot antes/depois em mobile
  (390x844) — a otimização não pode degradar a leitura visual.
- Preservar o GLB original; versões otimizadas com nome explícito
  (`*.optimized.glb`).

## Documentação

- Qualquer ajuste de material, luz ou otimização é registrado no
  `docs/design/look-dev-report.md`.

## Critérios de aceite

- [ ] Silhueta legível em fundo escuro.
- [ ] Traje mantém cor e textura suficientes para close-ups.
- [ ] O visual não parece viewport padrão de model viewer.
