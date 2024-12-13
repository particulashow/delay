// Lista de emojis
const emojis = ["🤔", "🎉", "😅", "😂", "🔥", "👏", "👍", "❤️", "😍", "💪", "🤩", "🌟", "🎯"];

// Atualiza o emoji exibido
function updateEmoji() {
  const emojiDisplay = document.getElementById("emoji-display");
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  emojiDisplay.textContent = randomEmoji;
}

// Simular a espera pelo delay
let delayTimeout;
let commentsArrived = false;

// Mensagens engraçadas para exibir enquanto se espera
const funnyMessages = [
  "Vamos esperar… mas com estilo.",
  "Já agora, alguém sabe quanto tempo dura o delay no YouTube?",
  "As respostas estão a caminho… mas deve ser por carta.",
  "Ainda está alguém por aí?",
  "Enquanto espero, vou refletir sobre o sentido da vida.",
  "O delay deve gostar de suspense, mas eu não!",
  "Será que estão a pensar ou só a olhar para o ecrã?",
  "Alguém viu um comentário? Está desaparecido.",
  "Tempo é relativo… mas no YouTube parece infinito.",
  "Já pareço um quadro. Escrevam algo!",
  "Se o delay fosse um filme, seria um drama.",
  "A culpa deve ser do Wi-Fi. Ou têm um gato no router?"
];

function startDelayAnimation() {
  const delayMessage = document.getElementById("delay-message");
  let messageIndex = 0;

  // Atualiza mensagens e emojis a cada 2 segundos
  delayTimeout = setInterval(() => {
    if (!commentsArrived) {
      delayMessage.textContent = funnyMessages[messageIndex];
      updateEmoji();
      messageIndex = (messageIndex + 1) % funnyMessages.length;
    }
  }, 2000);
}

// Simular chegada de comentários em tempo real
function simulateComments() {
  const commentsStatus = document.getElementById("comments-status");
  setTimeout(() => {
    commentsArrived = true;
    clearInterval(delayTimeout);
    document.getElementById("animation").style.display = "none";
    commentsStatus.textContent = "Chegaram as respostas! Finalmente!";
    commentsStatus.style.display = "block";
  }, 30000); // Simula 30 segundos de delay
}

// Inicia animação ao carregar a página
startDelayAnimation();
simulateComments();
