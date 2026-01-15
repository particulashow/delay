const params = new URLSearchParams(window.location.search);

const title = params.get("title") || "Delay vs Orador";
const seconds = Math.max(3, parseInt(params.get("seconds") || "30", 10));
const domain = (params.get("domain") || "http://localhost:3900").replace(/\/$/, "");

// Frases por URL (se vier vazio, usa as default)
// Separador: |
const phrasesParam = params.get("phrases") || "";
const defaultPhrases = [
  "Vamos esperar… mas com estilo.",
  "As respostas estão a caminho… mas deve ser por carta.",
  "O delay deve gostar de suspense, mas eu não!",
  "Já pareço um quadro. Escrevam algo!",
  "Se o delay fosse um filme, seria um drama.",
  "Tempo é relativo… mas no YouTube parece infinito.",
  "Ainda está alguém por aí?",
  "Alguém viu um comentário? Está desaparecido.",
  "Enquanto espero, vou refletir sobre o sentido da vida."
];

let phrases = defaultPhrases;
if (phrasesParam.trim()) {
  phrases = phrasesParam
    .split("|")
    .map(s => decodeURIComponent(s).trim())
    .filter(Boolean);
  if (!phrases.length) phrases = defaultPhrases;
}

// Emojis: mistura “leve” (sem excesso visual)
const EMOJIS = [
  "⏳","🛰️","📡","🧠","🫠","🫡","🤹‍♂️","🧃","🍿","🫧",
  "👀","🧩","🌀","✨","💬","📨","🐢","🚀","🎭","🕰️"
];

const $title = document.getElementById("title");
const $phrase = document.getElementById("phrase");
const $bar = document.getElementById("barFill");
const $status = document.getElementById("status");

$title.textContent = decodeURIComponent(title);

let idx = 0;
let startTs = performance.now();
let running = true;
let seenAnyChat = false;

// =====================
// Frases (loop) + animação
// =====================
function showPhrase(text) {
  $phrase.style.animation = "none";
  void $phrase.offsetWidth; // reflow
  $phrase.textContent = text;
  $phrase.style.animation = "";
}

function withRandomEmoji(text) {
  // 70% das vezes mete emoji no fim, 30% no início
  const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const mode = Math.random();
  if (mode < 0.3) return `${e} ${text}`;
  if (mode < 0.7) return `${text} ${e}`;
  return `${e} ${text} ${e}`;
}

function cyclePhrase() {
  idx = (idx + 1) % phrases.length;
  showPhrase(withRandomEmoji(phrases[idx]));
}

// Primeira frase
showPhrase(withRandomEmoji(phrases[0]));

// =====================
// Barra progressiva
// =====================
function tickProgress(now) {
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

// =====================
// Emojis flutuantes (subtil)
// =====================
function spawnFloatingEmoji() {
  if (!running) return;

  const emoji = document.createElement("div");
  emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  emoji.style.position = "fixed";
  emoji.style.left = `${Math.random() * 92 + 4}vw`;
  emoji.style.bottom = `-20px`;
  emoji.style.fontSize = `${Math.floor(Math.random() * 18) + 16}px`;
  emoji.style.opacity = "0";
  emoji.style.pointerEvents = "none";
  emoji.style.filter = "drop-shadow(0 10px 22px rgba(0,0,0,0.55))";
  emoji.style.transition = "transform 3.2s linear, opacity 600ms ease";

  document.body.appendChild(emoji);

  // entrada
  requestAnimationFrame(() => {
    emoji.style.opacity = "0.85";
    emoji.style.transform = `translateY(-${Math.random() * 55 + 55}vh)`;
  });

  // saída
  setTimeout(() => {
    emoji.style.opacity = "0";
  }, 2600);

  // cleanup
  setTimeout(() => {
    emoji.remove();
  }, 3400);

  // ritmo: 1 emoji a cada 700–1200ms (subtil)
  const nextIn = Math.floor(Math.random() * 500) + 700;
  setTimeout(spawnFloatingEmoji, nextIn);
}

// =====================
// Wordcloud: detecta primeiro comentário
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

    // Se não houver comentários ainda, continua a sondar
    $status.textContent = "À espera do primeiro comentário…";
  } catch (e) {
    $status.textContent = "Sem ligação ao wordcloud (confirma domain/3900).";
  }

  setTimeout(pollWordcloud, 650);
}

function stopOnFirstComment() {
  running = false;
  $bar.style.width = "100%";
  $status.textContent = "Chegou! ✅";
  showPhrase("Ok… agora sim. Bora lá. 🎬✨");
}

// (Opcional) limpar no arranque
fetch(`${domain}/clear-chat`, { mode: "no-cors" }).catch(() => {});

requestAnimationFrame(tickProgress);
spawnFloatingEmoji();
pollWordcloud();
