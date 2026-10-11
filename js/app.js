const $ = (id) => document.getElementById(id);

// Like real tests, stop a section after this many first-try misses in a row.
const MAX_MISSES_IN_A_ROW = 3;
// Speed rounds forgive one stray tap.
const SPEED_MISTAKES_ALLOWED = 1;

// Items per area in one game, by age. Each game draws this many from the much
// larger bank, so repeat players see different puzzles. The areas follow the
// WPPSI-IV layout: under 4 it uses only words, shapes and memory; from 4 it
// adds reasoning and speed, with every area weighted the same.
const ITEMS_PER_TEST = {
  3: { fluid: 0, verbal: 6, spatial: 6, memory: 6, speed: 0, quant: 0 },
  4: { fluid: 6, verbal: 6, spatial: 6, memory: 6, speed: 4, quant: 4 },
  5: { fluid: 6, verbal: 6, spatial: 6, memory: 6, speed: 4, quant: 4 },
  6: { fluid: 6, verbal: 6, spatial: 6, memory: 6, speed: 4, quant: 4 },
  7: { fluid: 6, verbal: 6, spatial: 6, memory: 6, speed: 4, quant: 4 },
};

// Numbers come from the Stanford-Binet, not the WPPSI, so they're played and
// shown but left out of the play score.
const UNSCORED = new Set(["quant"]);

// Play score: an IQ-style number with NO norms behind it. 100 is pinned to an
// assumed (not measured) first-try rate for a typical child on age-matched items;
// each 10% above/below moves it 10 points, clamped to 70–130 and rounded to 5s.
const TYPICAL_FIRST_TRY_RATE = 0.7;
const POINTS_PER_RATE = 100;

function playScore(rate) {
  const raw = 100 + (rate - TYPICAL_FIRST_TRY_RATE) * POINTS_PER_RATE;
  return Math.round(Math.min(130, Math.max(70, raw)) / 5) * 5;
}

const state = {
  name: "",
  age: null,
  queue: [],
  index: 0,
  current: null, // question being answered (speed items get generated choices)
  spoken: "",
  found: new Set(),
  mistakes: 0,
  results: {}, // { domain: { planned, correct, total, streak, stopped } }
  timers: [],
};

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

// Many speakers (Bluetooth ones especially) sleep when idle and swallow the
// first words of a sentence while waking up. A near-silent tone keeps them on.
// Browsers only allow audio after a tap, so this runs from the age/start buttons.
let audioCtx;
function keepAudioAwake() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (audioCtx) return audioCtx.resume();
  audioCtx = new AudioContext();
  const tone = audioCtx.createOscillator();
  const volume = audioCtx.createGain();
  tone.frequency.value = 30;
  volume.gain.value = 0.0005; // inaudible
  tone.connect(volume).connect(audioCtx.destination);
  tone.start();
}

// Speaking straight after cancel() clips the start of the sentence in
// Chrome/Edge, so wait a moment between stopping old speech and starting new.
const SPEECH_GAP_MS = 250;
let speechTimer;
let utterance; // kept referenced so it isn't garbage-collected mid-sentence

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  clearTimeout(speechTimer);
  const busy = speechSynthesis.speaking || speechSynthesis.pending;
  speechSynthesis.cancel();
  speechTimer = setTimeout(() => {
    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    speechSynthesis.speak(utterance);
  }, busy ? SPEECH_GAP_MS : 50);
}

function stopSpeech() {
  clearTimeout(speechTimer);
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

function later(fn, ms) {
  state.timers.push(setTimeout(fn, ms));
}

function clearTimers() {
  state.timers.forEach(clearTimeout);
  state.timers = [];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Show choices in a new order each time so the right answer's position can't be
// memorised. Grids keep their layout (the position is the answer), and items
// whose spoken prompt lists the choices keep the order it reads them in.
function shuffledChoices(q) {
  if (q.choiceGrid || q.type === "speed" || q.say) return q;
  const order = shuffle(q.choices.map((_, i) => i));
  const moved = (i) => order.indexOf(i);
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    answer: Array.isArray(q.answer) ? q.answer.map(moved).sort((a, b) => a - b) : moved(q.answer),
  };
}

// ── Rendering ──

// Dot positions (cells of a 3×3 grid) for dice faces 1–6.
const DICE_DOTS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

function renderItem(item) {
  if (item === "?") return el("span", "blank", "?");
  if (typeof item === "string") return el("span", "", item);

  let node;
  if (item.blocks) {
    node = el("span", "blocks");
    node.style.setProperty("--n", Math.sqrt(item.blocks.length));
    for (const code of item.blocks) {
      node.appendChild(code === "?" ? el("span", "blank", "?") : el("span", `block b-${code}`));
    }
  } else if (item.dots) {
    node = el("span", "dice");
    for (let i = 0; i < 9; i++) node.appendChild(el("i", DICE_DOTS[item.dots].includes(i) ? "on" : ""));
  } else if (item.label) {
    node = el("span", "labelled");
    node.append(el("span", "", item.e), el("small", "", item.label));
  } else if (item.shape) {
    node = el("span", `shape shape-${item.shape}`);
    node.style.background = item.color;
  } else {
    node = el("span", "", item.e);
  }

  if (item.shadow) node.classList.add("shadow");
  if (item.size) node.style.fontSize = `${item.size}em`;
  const transform = [item.rot && `rotate(${item.rot}deg)`, item.flip && "scaleX(-1)"].filter(Boolean).join(" ");
  if (transform) node.style.transform = transform;
  return node;
}

function fillBox(box, items, grid) {
  box.innerHTML = "";
  box.classList.toggle("grid", !!grid);
  box.style.setProperty("--cols", grid || "");
  items.forEach((item) => {
    const node = renderItem(item);
    if (!grid) return box.appendChild(node);
    // Fixed-size cells so a small item doesn't shrink its grid square.
    const cell = el("div", "cell");
    cell.appendChild(node);
    box.appendChild(cell);
  });
}

function setPrompt(text, say = text) {
  $("q-prompt").textContent = text;
  state.spoken = say;
  speak(say);
}

function runTimer(ms) {
  const bar = $("timer-bar");
  $("timer").classList.add("active");
  bar.style.transition = "none";
  bar.style.width = "100%";
  bar.offsetWidth; // restart the transition
  bar.style.transition = `width ${ms}ms linear`;
  bar.style.width = "0%";
}

function hideTimer() {
  $("timer").classList.remove("active");
}

// ── Game flow ──

const levelOf = (q) => q.level ?? (q.ages[0] + q.ages[1]) / 2;
const kindOf = (q) => q.kind ?? "classic";

// Random items running easy → hard: sort the age-matched pool by difficulty,
// cut it into `count` bands and take one item from each, preferring a kind of
// puzzle not used yet in this area.
function pickItems(pool, count) {
  const sorted = shuffle([...pool]).sort((a, b) => levelOf(a) - levelOf(b));
  const used = new Set();
  return Array.from({ length: Math.min(count, sorted.length) }, (_, i) => {
    const band = sorted.slice(Math.floor((i * sorted.length) / count), Math.floor(((i + 1) * sorted.length) / count));
    const kinds = [...new Set(band.map(kindOf))];
    const fresh = kinds.filter((k) => !used.has(k));
    const kind = pickOne(fresh.length ? fresh : kinds);
    used.add(kind);
    return pickOne(band.filter((q) => kindOf(q) === kind));
  });
}

function buildQueue(age) {
  return DOMAINS.flatMap((d) =>
    pickItems(
      QUESTIONS.filter((q) => q.domain === d.key && age >= q.ages[0] && age <= q.ages[1]),
      ITEMS_PER_TEST[age][d.key]
    )
  );
}

function startGame() {
  keepAudioAwake();
  state.name = $("child-name").value.trim() || "Friend";
  state.queue = buildQueue(state.age);
  state.index = 0;
  state.results = {};
  state.queue.forEach((q) => {
    state.results[q.domain] ??= { planned: 0, correct: 0, total: 0, streak: 0, stopped: false };
    state.results[q.domain].planned++;
  });
  showScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  clearTimers();
  hideTimer();
  const q = state.queue[state.index];
  const domain = DOMAINS.find((d) => d.key === q.domain);

  $("progress-bar").style.width = `${(state.index / state.queue.length) * 100}%`;
  $("q-category").textContent = `${domain.icon} ${domain.name} · ${state.index + 1} / ${state.queue.length}`;

  if (q.type === "memory") startMemory(q);
  else if (q.type === "speed") startSpeed(q);
  else askChoices(q);
}

function startMemory(q) {
  state.current = q;
  $("q-choices").innerHTML = "";
  fillBox($("q-visual"), q.study, q.studyGrid);
  setPrompt("Look carefully and remember!");
  runTimer(q.studyMs);
  later(() => {
    hideTimer();
    askChoices(q);
  }, q.studyMs);
}

function startSpeed(q) {
  const distractorCount = q.cells - q.targets;
  const field = shuffle([
    ...Array(q.targets).fill(q.target),
    ...Array.from({ length: distractorCount }, (_, i) => q.distractors[i % q.distractors.length]),
  ]);
  const answer = field.flatMap((e, i) => (e === q.target ? [i] : []));
  askChoices({ ...q, choices: field, answer, choiceGrid: q.cells > 16 ? 5 : 4 });
  runTimer(q.seconds * 1000);
  later(() => finishItem(false, "Time's up! Nice try!"), q.seconds * 1000);
}

function askChoices(q) {
  q = shuffledChoices(q);
  state.current = q;
  state.found = new Set();
  state.mistakes = 0;

  fillBox($("q-visual"), q.visual || [], q.grid);

  const choices = $("q-choices");
  choices.innerHTML = "";
  choices.classList.toggle("grid", !!q.choiceGrid);
  choices.style.setProperty("--cols", q.choiceGrid || "");
  q.choices.forEach((c, i) => {
    const btn = el("button", "choice");
    if (c === "") btn.classList.add("cell");
    if (q.type === "speed") btn.classList.add("small");
    btn.appendChild(renderItem(c));
    btn.onclick = () => handleTap(btn, i);
    choices.appendChild(btn);
  });

  setPrompt(q.prompt, q.say);
}

function handleTap(btn, i) {
  const q = state.current;
  const answers = [].concat(q.answer);

  if (!answers.includes(i)) {
    btn.classList.add("wrong");
    btn.disabled = true;
    state.mistakes++;
    if (q.type !== "speed") speak("Try again!");
    return;
  }

  btn.classList.add("correct");
  btn.disabled = true;
  state.found.add(i);
  if (state.found.size < answers.length) return;

  const allowed = q.type === "speed" ? SPEED_MISTAKES_ALLOWED : 0;
  const correct = state.mistakes <= allowed;
  finishItem(correct, correct ? "Great job!" : "You got it!");
}

function finishItem(correct, message) {
  clearTimers();
  hideTimer();
  document.querySelectorAll(".choice").forEach((b) => (b.disabled = true));

  const r = state.results[state.current.domain];
  r.total++;
  if (correct) {
    r.correct++;
    r.streak = 0;
  } else if (++r.streak >= MAX_MISSES_IN_A_ROW) {
    r.stopped = true;
  }

  speak(message);
  later(nextQuestion, 1200);
}

function nextQuestion() {
  do state.index++;
  while (state.index < state.queue.length && state.results[state.queue[state.index].domain].stopped);

  if (state.index < state.queue.length) renderQuestion();
  else showResult();
}

// Like a real test, each area is scored on its own and the areas count equally.
// Items skipped after a section stopped early count as misses.
function overallRate() {
  const rates = Object.entries(state.results)
    .filter(([domain]) => !UNSCORED.has(domain))
    .map(([, r]) => r.correct / r.planned);
  return rates.reduce((sum, x) => sum + x, 0) / rates.length;
}

function showResult() {
  const rate = overallRate();
  const stars = Math.max(1, Math.round(rate * 5));

  $("result-name").textContent = state.name;
  $("result-age").textContent = state.age;
  $("result-stars").textContent = "⭐".repeat(stars) + "☆".repeat(5 - stars);
  $("result-score").textContent = `~${playScore(rate)}`;
  $("result-breakdown").innerHTML = DOMAINS.filter((d) => state.results[d.key])
    .map((d) => {
      const r = state.results[d.key];
      const dots = '<i class="dot on"></i>'.repeat(r.correct) + '<i class="dot"></i>'.repeat(r.planned - r.correct);
      const notes = [r.stopped && "stopped early", UNSCORED.has(d.key) && "extra, not in score"].filter(Boolean);
      const note = notes.length ? `<small>${notes.join(" · ")}</small>` : "";
      return `<div><span>${d.icon} ${d.name}</span><span>${dots} ${note}</span></div>`;
    })
    .join("");

  showScreen("screen-result");
  speak(`Great job, ${state.name}! You earned ${stars} stars!`);
}

// ── Wiring ──

document.querySelectorAll("#age-picker button").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll("#age-picker button").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.age = Number(btn.dataset.age);
    keepAudioAwake();
    $("btn-start").disabled = false;
  };
});

$("btn-start").onclick = startGame;
$("btn-restart").onclick = () => showScreen("screen-start");
$("btn-home").onclick = () => {
  clearTimers();
  stopSpeech();
  showScreen("screen-start");
};
$("btn-speak").onclick = () => speak(state.spoken);
