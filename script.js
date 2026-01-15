const params = new URLSearchParams(window.location.search);

const title = params.get("title") || "Delay vs Orador";
const seconds = Math.max(3, parseInt(params.get("seconds") || "30", 10));
const domain = (params.get("domain") || "http://localhost:3900").replace(/\/$/, "");

const phrasesParam = params.get("phrases") || "";
const defaultPhrases = [
  "Vamos esperar… mas com estilo.",
  "Já agora, alguém sabe quanto tempo dura o delay no YouTube?",
  "As respostas estão a caminho… mas deve ser por carta.",
  "Ainda está alguém por aí?.",
  "Enquanto espero, vou refletir sobre o sentido da vida.",
  "O delay deve gostar de suspense, mas eu não!",
  "Será que estão a pensar ou só a olhar para o ecrã?",
  "Alguém viu um comentário? Está desaparecido.",
  "Tempo é relativo… mas no YouTube parece infinito.",
  "Já pareço um quadro. Escrevam algo!",
  "Se o delay fosse um filme, seria um drama.",
  "A culpa deve ser do Wi-Fi. Ou têm um gato no router?"
];

let phrases = defaultPhrases;

if (phrasesParam.trim()) {
  // frases separadas por |
  phrases = phrasesParam.split("|").map(s => decodeURIComponent(s).trim()).filter(Boolean);
  if (!phrases.length) phrases = defaultPhrases;
}

const $title = document.getElementById("title");
const $phrase = document.getElementById("phrase");
const $bar = document.getElementById("barFill");
const $status = document.getElementById("status");

$title.textContent = decodeURIComponent(title);

let idx = 0;
let startTs = performance.now();
let running = true;
let seenAnyChat = false;

// Troca de frase (suave, sem “saltos” visuais)
function showPhrase(text){
  $phrase.style.animation = "none";
  // força reflow para reiniciar a animação
  void $phrase.offsetWidth;
  $phrase.textContent = text;
  $phrase.style.animation = "";
}

function cyclePhrase(){
  idx = (idx + 1) % phrases.length;
  showPhrase(phrases[idx]);
}

showPhrase(phrases[0]);

// Barra progressiva 0 -> 100% em "seconds"
function tickProgress(now){
  if (!running) return;

  const elapsed = (now - startTs) / 1000;
  const pct = Math.min(100, (elapsed / seconds) * 100);
  $bar.style.width = pct.toFixed(2) + "%";

  if (elapsed >= seconds) {
    startTs = now;
    $bar.style.width = "0%";
    cyclePhrase();
  }

  requestAnimationFrame(tickProgress);
}

// Detecta “primeiro comentário” via wordcloud
async function pollWordcloud(){
  if (!running) return;

  try{
    const r = await fetch(`${domain}/wordcloud`, { cache: "no-store" });
    const data = await r.json();

    const raw = (data.wordcloud || "").trim();
    if (raw.length > 0 && !seenAnyChat){
      seenAnyChat = true;
      stopOnFirstComment();
      return;
    }
  }catch(e){
    // Não rebenta a overlay; só avisa
    $status.textContent = "Sem ligação ao wordcloud (verifica domain/3900).";
  }

  setTimeout(pollWordcloud, 650);
}

function stopOnFirstComment(){
  running = false;
  $bar.style.width = "100%";
  $status.textContent = "Chegou o primeiro comentário ✅";
  $status.classList.add("good");
  showPhrase("Ok… agora sim. Bora lá. 🎬");
}

// (Opcional) reset ao arrancar, se quiseres começar “limpo”
// Comenta se não quiseres limpar.
fetch(`${domain}/clear-chat`, { mode: "no-cors" }).catch(()=>{});

requestAnimationFrame(tickProgress);
pollWordcloud();
