// Simular a espera pelo delay
let delayTimeout;
let commentsArrived = false;

// Mensagens engraçadas para exibir enquanto se espera
const funnyMessages = [
  "Estamos a esperar… mas com estilo.",
  "Talvez a Internet esteja a tomar um café.",
  "Já agora, alguém sabe quanto tempo dura um delay no YouTube?",
  "O apresentador está a segurar o riso. Escrevam rápido.",
  "A resposta está a caminho… pelo correio.",
  "Acho que o delay foi para férias. Volta já.",
  "Se o delay fosse mais rápido, chamava-se resposta.",
  "Enquanto isso, podemos refletir sobre o sentido da vida.",
  "O delay gosta de suspense. Nós não.",
  "Será que estão a pensar ou só a olhar para o ecrã?",
  "Pessoal, o delay está em greve. Força nos comentários!",
  "Alguém viu um comentário? Está desaparecido.",
  "Tempo é relativo… no YouTube, é infinito.",
  "O apresentador parece um quadro. Escrevam algo.",
  "Enquanto esperamos, porque não fazer um Sudoku?",
  "Já agora, qual é o vosso prato preferido? Só para passar o tempo.",
  "A Internet é lenta. Mas nós acreditamos em vocês.",
  "Se o delay fosse um filme, seria um drama.",
  "A culpa é sempre do Wi-Fi. Ou do gato no router."
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
    commentsStatus.textContent = "Chegaram as respostas! Finalmente!";
    commentsStatus.style.display = "block";
  }, 30000); // Simula 30 segundos de delay
}

// Iniciar animação ao carregar a página
startDelayAnimation();
simulateComments();
