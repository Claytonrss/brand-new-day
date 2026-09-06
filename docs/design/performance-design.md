# Performance como Decisão de Design

> Performance não é etapa técnica tardia. Em um projeto mobile-first com GLB
> pesado, ela orienta a estética desde o início.

## Metas de frame rate

| Alvo | Valor | Onde |
|---|---|---|
| Mínimo aceitável | **45 FPS** | mobile moderno |
| Ideal | **60 FPS** | desktop |
| Medição | FPS médio registrado durante o verify | ambos |

"FPS médio" significa medição real (ex: contador em `useFrame` agregado por
janela de 5s), não impressão subjetiva.

## Estratégia para o GLB (~50 MB)

Antes de implementar a experiência final, inspecionar o asset
(`scripts/inspect-glb.mjs`):

- meshes, materiais, texturas (resolução e formato);
- bones/joints (nomes — necessário para o head-tracking do Hero);
- animações embutidas;
- metadata do glTF (autor, caminhos locais, dados sensíveis);
- bounding box e escala.

Decisões de otimização (nomes de arquivo explícitos,
ex: `spider-man_brand_new_day.optimized.glb`) e documentação no
`docs/design/look-dev-report.md` ou ADR.

## Ordem de degradação (se pesado em mobile)

Reduzir **nesta ordem**:

1. Post-processing (bloom/grão primeiro).
2. Resolução/qualidade de sombra.
3. Densidade de efeitos de parallax/HUD.
4. Qualidade/tamanho de textura.
5. Geometria — apenas com ferramenta segura e comparação visual antes/depois.

**Nunca sacrificar primeiro a composição principal.** Uma versão mobile
simples e bonita é melhor que uma versão "completa" engasgando.

## Fallback visual intencional

Para dispositivos fracos (ou Mobile Low):

- Cena mais estática (menos amplitude de câmera).
- Menos efeitos de post-processing.
- Iluminação preservada — a silhueta nunca é a variável sacrificada.
- Texto bem composto.

O fallback é uma **escolha visual**, não uma página quebrada.

## Budget inicial

| Recurso | Budget mobile |
|---|---|
| GLB em produção | ≤ 15 MB (meta de otimização a partir do original) |
| Texturas | ≤ 2K, KTX2/WebP quando viável |
| Draw calls | < 50 por frame |
| Post-processing | máx. 2 efeitos ativos em mobile |

## Critérios de aceite

- [ ] Existe matriz de qualidade por dispositivo (ver `quality-matrix.md`).
- [ ] Existe ordem clara de degradação visual.
- [ ] O verify mede performance (FPS médio), não só impressão subjetiva.
