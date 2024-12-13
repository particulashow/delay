// Simular a espera pelo delay
let delayTimeout;
let commentsArrived = false;

// Mensagens engraçadas para exibir enquanto se espera
const funnyMessages = [
  "O delay está a decidir a sua resposta...",
  "A Internet está em modo tartaruga hoje...",
  "Será que já escreveram?",
  "A pensar... Ou não!",
  "Quase lá... Ou não!"
];

function startDelayAnimation() {
  const delayMessage = document.getElementById("delay-message");
  let messageIndex = 0;

  // Trocar mensagens a cada 2 segundos
  delayTimeout = setInterval(() => {
    if (!commentsArrived) {
      delayMessage.textContent = funnyMessages[messageIndex];
      messageIndex = (messageIndex + 1) % funnyMessages.length;
    }
  }, 2000);
}

// Simular chegada de comentários em tempo real (usando WebSocket no futuro)
function simulateComments() {
  const commentsStatus = document.getElementById("comments-status");
  setTimeout(() => {
    commentsArrived = true;
    clearInterval(delayTimeout);
    document.getElementById("animation").style.display = "none";
    commentsStatus.textContent = "Chegaram as respostas!";
    commentsStatus.style.display = "block";
  }, 8000); // Simula 8 segundos de delay
}

// Iniciar animação ao carregar a página
startDelayAnimation();
simulateComments();
