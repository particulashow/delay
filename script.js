const params = new URLSearchParams(window.location.search);

const title = params.get("title") || "Delay vs Orador";
const seconds = Math.max(3, parseInt(params.get("seconds") || "30", 10));          // duração do ciclo da barra
const phraseEvery = Math.max(2, parseInt(params.get("phraseEvery") || "4", 10));  // troca de frase
const domain = (params.get("domain") || "http://localhost:3900").replace(/\/$/, "");

// frases por URL (separadas por |)
const phrasesParam = params.get("phrases") || "";
const defaultPhrases = [
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

let phrases = defaultPhrases;
if (phrasesParam.trim()) {
  phrases = phrasesParam
    .split("|")
    .map(s => decodeURIComponent(s).trim())
    .filter(Boolean);

  if (!phrases.length) phrases = defaultPhrases;
}

const EMOJIS = [
  "⏳","🛰️","📡","🧠","🫠","🫡","🤹‍♂️","🧃","🍿","🫧",
  "👀","🧩","🌀","✨","💬","📨","🐢","🚀","🎭","🕰️"
];

const $title = document.getElementById("title");
const $phrase = document.getElementById("phrase");
const $bar = document.getElementById("barFill");
const $status = document.getElementById("status");

$title.textContent = decodeURIComponent(title);

let running = true;
let seenAnyChat = false;

let phraseIndex = 0;
let barStartTs = performance.now();
let phraseTimer = null;

// =====================
// Frases
// =====================
function showPhrase(text) {
  $phrase.style.animation = "none";
  void $phrase.offsetWidth; // reflow
  $phrase.textContent = text;
  $phrase.style.animation = "";
}

function withRandomEmoji(text) {
  const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const mode = Math.random();
  if (mode < 0.33) return `${e} ${text}`;
  if (mode < 0.66) return `${text} ${e}`;
  return `${e} ${text} ${e}`;
}

function nextPhrase() {
  if (!running) return;
  phraseIndex = (phraseIndex + 1) % phrases.length;
  showPhrase(withRandomEmoji(phrases[phraseIndex]));
}

function startPhraseLoop() {
  // primeira frase
  showPhrase(withRandomEmoji(phrases[0]));
  // loop independente
  phraseTimer = setInterval(nextPhrase, phraseEvery * 1000);
}

// =====================
// Barra progressiva (loop)
// =====================
function tickBar(now) {
  if (!running) return;

  const elapsed = (now - barStartTs) / 1000;
  const pct = Math.min(100, (elapsed / seconds) * 100);
  $bar.style.width = pct.toFixed(2) + "%";

  if (elapsed >= seconds) {
    barStartTs = now;
    $bar.style.width = "0%";
  }

  requestAnimationFrame(tickBar);
}

// =====================
// Emojis flutuantes (subtil)
// =====================
function spawnFloatingEmoji() {
  if (!running) return;

  const emoji = document.createElement("div");
  emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  emoji.style.position = "fixed";
  emoji.style.left = `${Math.random() * 92 + 4}vw`;
  emoji.style.bottom = `-24px`;
  emoji.style.fontSize = `${Math.floor(Math.random() * 18) + 18}px`;
  emoji.style.opacity = "0";
  emoji.style.pointerEvents = "none";
  emoji.style.filter = "drop-shadow(0 10px 22px rgba(0,0,0,0.55))";
  emoji.style.transition = "transform 3.2s linear, opacity 600ms ease";

  document.body.appendChild(emoji);

  requestAnimationFrame(() => {
    emoji.style.opacity = "0.85";
    emoji.style.transform = `translateY(-${Math.random() * 55 + 55}vh)`;
  });

  setTimeout(() => { emoji.style.opacity = "0"; }, 2600);
  setTimeout(() => { emoji.remove(); }, 3400);

  const nextIn = Math.floor(Math.random() * 500) + 700; // 700–1200ms
  setTimeout(spawnFloatingEmoji, nextIn);
}

// =====================
// Wordcloud: pára no 1º comentário
// =====================
async function pollWordcloud() {
  if (!running) return;

  try {
    const r = await fetch(`${domain}/wordcloud`, { cache: "no-store" });
    const data = await r.json();
    const raw = (data.wordcloud || "").trim();

    if (raw.length > 0 && !seenAnyChat) {
      seenAnyChat = true;
      stopOnFirstComment();
      return;
    }

    $status.textContent = "À espera do primeiro comentário…";
  } catch (e) {
    $status.textContent = "Sem ligação ao wordcloud (confirma domain/3900).";
  }

  setTimeout(pollWordcloud, 650);
}

function stopOnFirstComment() {
  running = false;

  if (phraseTimer) clearInterval(phraseTimer);

  $bar.style.width = "100%";
  $status.textContent = "Chegou! ✅";
  $status.classList.add("good");

  showPhrase("Ok… agora sim. Bora lá. 🎬✨");
}

// (Opcional) limpar no arranque
fetch(`${domain}/clear-chat`, { mode: "no-cors" }).catch(() => {});

// start
startPhraseLoop();
requestAnimationFrame(tickBar);
spawnFloatingEmoji();
pollWordcloud();
