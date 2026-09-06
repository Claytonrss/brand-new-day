# Regras Explícitas de Composição

> Zonas de composição para evitar posicionamento por tentativa aleatória.
> Cada Scene Spec define zona segura de texto em mobile e desktop; cada
> screenshot do verify é avaliado contra estas zonas.

## Mobile (390px base)

| Regra | Valor |
|---|---|
| Margem horizontal mínima de texto | 24px |
| Bloco de texto principal | máx. 82vw |

### Zonas por seção

- **Hero:** rosto/máscara ocupa a região superior ou central; copy em área
  segura inferior ou lateral curta, sem cobrir olhos.
- **Evolution:** símbolo do peito é o foco; texto deslocado para área
  escura/negativa, nunca cruzando o símbolo.
- **Arsenal:** pulso/lançador é o foco; texto no lado oposto ao detalhe.
- **FullBody:** se corpo inteiro não couber com texto, priorizar silhueta
  forte + título em blocos curtos.

### Regras gerais mobile

- Evitar centralizar todos os textos — alternar alinhamentos com intenção,
  seguindo o storyboard (Hero: inferior; Evolution: direita; Arsenal:
  esquerda; FullBody: centralizado).

## Desktop (1440px base)

- Usar espaço negativo para aumentar drama — não preencher a tela com texto.
- Texto nunca cobre rosto, olhos, símbolo do peito, mãos ou lançador.
- Personagem domina a composição mesmo quando deslocado.
- Evitar layout split-screen óbvio — o Canvas é o palco, não uma coluna ao
  lado do texto.

## Verificação

- [ ] Cada Scene Spec declara zona segura de texto (mobile + desktop).
- [ ] Screenshots do verify são avaliados contra estas zonas.
- [ ] Snapshot do Playwright com `--boxes` confirma texto dentro do viewport.
