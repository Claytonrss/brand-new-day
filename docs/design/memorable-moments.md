# Momentos Memoráveis (Beats Visuais)

> Beats que fariam alguém querer mostrar o projeto em um portfólio. Cada beat
> tem início, ápice e saída, funciona em mobile sem mouse, e existe porque
> reforça a emoção da seção — nunca "porque é tecnicamente possível".

## Beat 1 — Hero: o olhar que segue

- **O quê:** a máscara acompanha o mouse/ponteiro com movimento sutil e
  natural (rotação do bone de cabeça/pescoço com slerp, yaw máx. 25–30°,
  pitch máx. 12–15°).
- **Mobile:** sem hover — substituir por drift automático leve (idle sway) ou
  reação sutil ao scroll.
- **Emoção:** anonimato + vigilância — "ele está lá, e está vendo você".
- **Início/ápice/saída:** começa assim que o loader revela a cena; ápice é o
  primeiro movimento percebido do ponteiro; sai quando o scroll inicia a
  descida para Evolution.

## Beat 2 — Evolution: a luz atravessa o símbolo

- **O quê:** close no símbolo do peito com luz atravessando a superfície ou
  mudança perceptível de recorte/sombra durante o push-in.
- **Emoção:** transformação interna — algo mudou por dentro e a luz entrega.
- **Início/ápice/saída:** câmera entra em push-in lento; ápice é o varrido de
  luz no símbolo; sai com a transição de eixo para Arsenal.

## Beat 3 — Arsenal: a câmera cruza o eixo

- **O quê:** revelação clara do lançador de teia/pulso, com a câmera cruzando
  o eixo do personagem (orbita para o lado oposto ao texto).
- **Emoção:** sobrevivência e improviso — o essencial, construído à mão.
- **Início/ápice/saída:** câmera inicia a travessia; ápice é o pulso/lançador
  legível em primeiro plano; sai com o início do recuo para FullBody.

## Beat 4 — FullBody: o pôster vivo

- **O quê:** composição final em corpo inteiro (ou silhueta forte), com dois
  labels de HUD mono em parallax de velocidades diferentes — profundidade
  real, não decoração.
- **Emoção:** revelação e conclusão — o frame que ficaria na parede.
- **Início/ápice/saída:** recuo e estabilização; ápice é a composição
  estabilizada com título integrado; termina na atribuição do modelo.

## Regras

- Todo beat funciona em mobile sem exigir mouse.
- Se um beat não reforça a emoção da seção, ele sai.
- Beats são validados por screenshot no verify (cada um deve render pelo
  menos uma imagem de portfólio).
