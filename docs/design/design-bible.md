# Design Bible — spiderman-landing

> Documento curto e vinculante. Qualquer implementador deve conseguir ler isto
> e saber o que preservar visualmente, sem contexto da conversa original.

## Frase de intenção

> Uma cena interativa de portfólio, sombria e cinematográfica, centrada em
> isolamento, tensão e presença física do personagem.

Nos primeiros 5 segundos, o visitante deve sentir que abriu um frame de filme —
não que carregou uma página.

## Atmosfera

- Noite urbana, contraste alto, sensação de solidão.
- Ameaça silenciosa: nada grita, tudo observa.
- Materialidade do traje: textura, costura e brilho controlado devem ser
  legíveis nos close-ups.
- Luz recortando a silhueta: o personagem emerge do preto, nunca está
  "colado" sobre um fundo.

## Regras de cor

| Token      | Hex       | Uso                                             |
| ---------- | --------- | ----------------------------------------------- |
| `ink`      | `#0a0a0c` | fundo principal, base escura                    |
| `concrete` | `#141417` | superfícies secundárias, variação de fundo      |
| `steel`    | `#2c3b4c` | detalhes frios, sombras azuladas                |
| `oxide`    | `#7a1f24` | acento dramático quente, rim light              |
| `signal`   | `#c23b34` | acento máximo (olhos, pontos de luz, UI mínima) |
| `paper`    | `#e9e5da` | texto principal                                 |
| `dim`      | `#7d7c74` | texto secundário, metadados                     |

**Proibições de cor:**

- Vermelho neon genérico.
- Azul/roxo dominante sem intenção narrativa.
- Gradientes decorativos.
- Qualquer paleta que remeta a template SaaS.

## Regras de textura

**Permitido:** grão de filme sutil, vinheta, pequenos ruídos cinematográficos.

**Proibido:** bokeh/orbs decorativos, blur pesado de fundo, fundos abstratos
com cara de stock.

## Regras de composição

1. O personagem é o **primeiro sinal visual** em todas as seções — nunca um
   elemento secundário.
2. Texto nunca cobre rosto/máscara, símbolo do peito ou lançador de teia em
   momentos-chave.
3. O texto é parte da composição (posição e escala decididas no Scene Spec),
   não uma camada jogada sobre o Canvas.

## Lista do que evitar

- Landing page explicativa / hero de marketing.
- Excesso de cards.
- Layout dividido texto/imagem (split-screen óbvio).
- Copy longa demais.
- Animações que parecem demo técnica em vez de direção de arte.

## Promessa da primeira dobra

Rosto/máscara, silhueta ou presença do corpo devem **dominar a percepção**
sem que o usuário precise rolar. Se a primeira dobra não impressiona, a
página falhou — independente de estar tecnicamente correta.
