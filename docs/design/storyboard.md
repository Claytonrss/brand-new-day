# Storyboard por Seção

> Cada seção é um plano de câmera, não um bloco de layout. Cada uma precisa
> gerar pelo menos uma screenshot forte em mobile e uma em desktop, com um
> motivo visual diferente das demais.

| Seção         | Emoção                            | Enquadramento mobile                                               | Enquadramento desktop                                      | Movimento                                    | Texto                    | Risco                                       |
| ------------- | --------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------- | ------------------------ | ------------------------------------------- |
| **Hero**      | impacto, anonimato, solidão       | máscara/torso dominam o frame; copy em área segura inferior        | personagem com mais respiro lateral e presença de silhueta | micro head-tracking + leve drift de câmera   | curto, alto contraste    | texto cobrir rosto; parecer pôster estático |
| **Evolution** | tensão, transformação interna     | close no peito/símbolo; texto em bloco compacto                    | close assimétrico com mais espaço negativo                 | push-in lento ou pequena mudança de eixo     | frase quebrada com ritmo | close perder legibilidade no mobile         |
| **Arsenal**   | sobrevivência, improviso          | pulso/lançador legível; texto sem competir com o braço             | órbita lateral mais ampla                                  | câmera atravessa o eixo para revelar detalhe | direto, seco             | detalhe ficar pequeno demais                |
| **FullBody**  | revelação, conclusão, pôster vivo | corpo inteiro se possível; se não couber, priorizar silhueta forte | corpo inteiro com composição final memorável               | recuo e estabilização                        | punch final              | parecer tela de créditos sem impacto        |

## Progressão narrativa

```
Hero (quem é?) → Evolution (o que mudou?) → Arsenal (com o que conta?) → FullBody (revelação)
```

A câmera começa perto e íntima (máscara), mergulha no detalhe (peito, pulso)
e só no final recua para o corpo inteiro — a revelação é o pagamento do scroll.

## Copy por seção (fechada — não reescrever)

### Hero

- Kicker: `Julho de 2026`
- Título: `NINGUÊM SABE.`
- Subtítulo: `Quatro anos depois de desaparecer da memória de todos que ama, Peter Parker ainda está lá em cima, sozinho, sob a máscara.`

### Evolution

- Kicker: `A mudança`
- Título: `Algo nele\nestá mudando.`
- Corpo: `Anos de noites sem nome cobraram um preço. O que começou como cansaço virou outra coisa — algo que nem Peter consegue explicar.`

### Arsenal

- Kicker: `O que sobrou`
- Título: `Sem apoio.\nSó o essencial.`
- Corpo: `Sem Stark, sem SHIELD, sem ninguém para ligar. Só o que ele mesmo construiu nos pulsos — e a cidade que continua escolhendo proteger.`

### FullBody

- Kicker: `31 de julho`
- Título: `Um homem\nsem nome.\nUma cidade\nsem escolha.`
- Corpo: `SPIDER-MAN: BRAND NEW DAY chega aos cinemas em 31 de julho de 2026.`
- Atribuição: `Modelo 3D por Eskze · CC BY 4.0` — "Eskze" linkado ao modelo (https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda) e "CC BY 4.0" linkado à licença (https://creativecommons.org/licenses/by/4.0/)

> **Nota (ADR-017):** a implementação usava "UM HERÓI QUALQUER." divergente da
> copy fechada abaixo. A decisão é **voltar ao storyboard** e incluir a data —
> a única informação concreta do filme.

### Colophon (novo — ADR-019, fechamento de portfólio)

- Kicker: `Colofon`
- Título: `Feito à mão.`
- Corpo: `Uma cena interativa construída com React Three Fiber, GSAP e um modelo de 66 joints sem um único clipe de animação — todo o movimento é procedural.`
- Stack: `React 19 · Three.js · GSAP ScrollTrigger · Lenis · WebGL`
- Atribuição CC-BY permanente + CTA único (`ver o código →`).

## Regras

- O texto é tratado como parte da composição — posição, escala e alinhamento
  definidos por seção, nunca uma camada genérica sobre o Canvas.
- Nenhuma seção pode ser variação de enquadramento de outra.
- Alturas de scroll (ADR-025 — fonte da verdade:
  `src/components/3d/beat/sections.ts`): Opening 100vh; Hero 140vh;
  Chapter cards 70vh; Evolution 210vh; Arsenal 210vh; FullBody 130vh;
  Colophon 140vh (1070vh de documento / 970vh de scroll).
