# Plano de Rodadas de Look Dev

> Look Dev não é tentativa única. Até três rodadas curtas e focadas, em ordem.
> Não expandir para todas as seções antes de v1 e v2 passarem.

## Look Dev v1 — câmera e luz

- **Objetivo:** personagem com presença forte na primeira dobra.
- **Validar:** posição, fov, alvo de lookAt, silhueta, key/rim/fill light.
- **Não gastar tempo** refinando microcopy nesta rodada.
- **Evidência:** screenshots 390x844, 430x932 e 1440x900 da primeira dobra.

## Look Dev v2 — tipografia e composição

- **Objetivo:** texto e personagem parecerem uma única peça editorial.
- **Validar:** escala tipográfica, quebras de linha intencionais, áreas
  seguras, contraste e hierarquia.
- **Obrigatória mesmo se v1 atingir nota suficiente.**

## Look Dev v3 — polimento

- **Objetivo:** ajustar sensação cinematográfica.
- **Validar:** bloom, vinheta, grão, transições, FPS e reduced-motion.
- **Obrigatória se** qualquer item crítico da rubrica ficar com nota 3.

## Regras

1. Rodadas em ordem — não pular v1 para polir v3.
2. Cada rodada produz evidência (screenshots) e preenche a rubrica.
3. Se após v3 algum bloqueante (primeira dobra, composição mobile, integração
   texto/personagem) continuar < 4, volta para a Design Bible — não forçar
   implementação sobre base fraca.
4. Ajustes de materiais/iluminação são documentados no
   `docs/design/look-dev-report.md`.
