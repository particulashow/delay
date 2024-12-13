// Lista de emojis
const emojis = ["🤔", "🎉", "😅", "😂", "🔥", "👏", "👍", "❤️", "😍", "💪", "🤩", "🌟", "🎯"];

// Lista de cores de fundo
const backgroundColors = ["#FF5733", "#33C1FF", "#8D33FF", "#FF33A2", "#33FF57", "#FFC733", "#FF5733"];

// Atualiza o emoji exibido
function updateEmoji() {
  const emojiDisplay = document.getElementById("emoji-display");
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  emojiDisplay.textContent = randomEmoji;
}

// Atualiza a cor de fundo
function updateBackgroundColor() {
  const gameContainer = document.getElementById("game-container");
  const randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
  gameContainer.style.backgroundColor = randomColor;
}

// Atualiza a barra de progresso
function updateProgressBar(duration) {
  const progressBar = document.getElementById("progress-bar");
  let startTime = Date.now();

  function step() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min((elapsedTime / duration) * 100, 100);
    progressBar.style.width = `${progress}%`;

    if (progress < 100) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

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

  // Atualiza mensagens, emojis e cor de fundo a cada 2 segundos
  delayTimeout = setInterval(() => {
    delayMessage.textContent = funnyMessages[messageIndex];
    updateEmoji();
    updateBackgroundColor();
    messageIndex = (messageIndex + 1) % funnyMessages.length;
  }, 2000);

  // Inicia a barra de progresso (30s)
  updateProgressBar(30000);
}

// Simular chegada de comentários em tempo real
function simulateComments() {
  const commentsStatus = document.getElementById("comments-status");
  setTimeout(() => {
    clearInterval(delayTimeout);
    document.getElementById("animation").style.display = "none";
    commentsStatus.textContent = "Chegaram as respostas! Finalmente!";
    commentsStatus.style.display = "block";
  }, 30000); // Simula 30 segundos de delay
}

// Inicia animação ao carregar a página
startDelayAnimation();
simulateComments();
