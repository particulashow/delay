const params = new URLSearchParams(window.location.search);

const title = params.get("title") || "Delay vs Orador";
const seconds = Math.max(3, parseInt(params.get("seconds") || "30", 10));
const phraseEvery = Math.max(2, parseInt(params.get("phraseEvery") || "4", 10));
const domain = (params.get("domain") || "http://localhost:3900").replace(/\/$/, "");
const debug = params.get("debug") === "1"; // ?debug=1

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

const EMOJIS = ["⏳","🛰️","📡","🧠","🫠","🫡","🤹‍♂️","🧃","🍿","🫧","👀","🧩","🌀","✨","💬","📨","🐢","🚀","🎭","🕰️"];

const $title = document.getElementById("title");
const $phrase = document.getElementById("phrase");
const $bar = document.getElementById("barFill");
const $status = document.getElementById("status");

$title.textContent = decodeURIComponent(title);

let running = true;

// --- baseline (estado inicial do wordcloud)
let baseline = "";        // conteúdo inicial normalizado
let baselineSet = false;  // já definimos baseline?
let lastCloud = "";       // último cloud visto (normalizado)

let phraseIndex = 0;
let barStartTs = performance.now();
let phraseTimer = null;

// ---------- helpers ----------
function normalizeCloud(s) {
  // normaliza para comparar: lowercase + remove espaços redundantes
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function showPhrase(text) {
  $phrase.style.animation = "none";
  void $phrase.offsetWidth;
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
  showPhrase(withRandomEmoji(phrases[0]));
  phraseTimer = setInterval(nextPhrase, phraseEvery * 1000);
}

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

  const nextIn = Math.floor(Math.random() * 500) + 700;
  setTimeout(spawnFloatingEmoji, nextIn);
}

function stopOnFirstComment() {
  running = false;
  if (phraseTimer) clearInterval(phraseTimer);

  $bar.style.width = "100%";
  $status.textContent = "Chegou! ✅";
  showPhrase("Ok… agora sim. Bora lá. 🎬✨");
}

// ---------- debug overlay ----------
let $debug;
if (debug) {
  $debug = document.createElement("div");
  $debug.style.position = "fixed";
  $debug.style.left = "12px";
  $debug.style.bottom = "12px";
  $debug.style.padding = "8px 10px";
  $debug.style.borderRadius = "12px";
  $debug.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto";
  $debug.style.fontSize = "12px";
  $debug.style.color = "rgba(255,255,255,0.92)";
  $debug.style.background = "rgba(0,0,0,0.45)";
  $debug.style.border = "1px solid rgba(255,255,255,0.18)";
  $debug.style.backdropFilter = "blur(8px)";
  $debug.style.maxWidth = "46vw";
  $debug.style.whiteSpace = "pre-wrap";
  document.body.appendChild($debug);
}

function setDebug(text) {
  if ($debug) $debug.textContent = text;
}

// ---------- wordcloud polling ----------
async function pollWordcloud() {
  if (!running) return;

  try {
    const r = await fetch(`${domain}/wordcloud`, { cache: "no-store" });
    const data = await r.json();

    const cloud = normalizeCloud(data.wordcloud || "");
    const total = (data.totalAttendees ?? "");
    const viewOnly = (data.viewOnly ?? "");

    // 1) Definir baseline ao arrancar (primeira leitura)
    if (!baselineSet) {
      baseline = cloud;          // baseline é o estado “antigo”
      lastCloud = cloud;
      baselineSet = true;

      $status.textContent = "À espera do primeiro comentário…";
      setDebug(`DEBUG\nbaselineSet: true\nbaseline(len): ${baseline.length}\ncloud(len): ${cloud.length}\ntotalAttendees: ${total}\nviewOnly: ${viewOnly}`);
      setTimeout(pollWordcloud, 650);
      return;
    }

    // 2) Só dispara se o conteúdo mudou desde o baseline (ou desde a última leitura)
    //    Isto evita saltar logo para “chegou” por histórico antigo.
    const changedFromBaseline = cloud !== baseline && cloud.length >= baseline.length;
    const changedFromLast = cloud !== lastCloud;

    setDebug(
      `DEBUG\nbaseline(len): ${baseline.length}\ncloud(len): ${cloud.length}\nchangedFromBaseline: ${changedFromBaseline}\nchangedFromLast: ${changedFromLast}\nlastCloud(len): ${lastCloud.length}\n(total: ${total} / viewOnly: ${viewOnly})`
    );

    lastCloud = cloud;

    if (changedFromBaseline && changedFromLast && cloud.length > 0) {
      stopOnFirstComment();
      return;
    }

    $status.textContent = "À espera do primeiro comentário…";
  } catch (e) {
    $status.textContent = "Sem ligação ao wordcloud (confirma domain/3900).";
    setDebug(`DEBUG\nErro: ${String(e?.message || e)}`);
  }

  setTimeout(pollWordcloud, 650);
}

// (Opcional) tentar limpar no arranque
// Nota: pode falhar no OBS se houver bloqueio de mixed content.
// Mesmo que falhe, o baseline evita disparar por histórico.
fetch(`${domain}/clear-chat`, { mode: "no-cors" }).catch(() => {});

startPhraseLoop();
requestAnimationFrame(tickBar);
spawnFloatingEmoji();
pollWordcloud();
