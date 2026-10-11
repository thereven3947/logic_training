const $ = (id) => document.getElementById(id);

// Like real tests, stop a section after this many first-try misses in a row.
const MAX_MISSES_IN_A_ROW = 2;
// Speed rounds forgive one stray tap.
const SPEED_MISTAKES_ALLOWED = 1;

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
  results: {}, // { domain: { correct, total, streak, stopped } }
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

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1.2;
  speechSynthesis.speak(u);
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

// ── Rendering ──

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

function buildQueue(age) {
  return DOMAINS.flatMap((d) =>
    QUESTIONS.filter((q) => q.domain === d.key && age >= q.ages[0] && age <= q.ages[1])
  );
}

function startGame() {
  state.name = $("child-name").value.trim() || "Friend";
  state.queue = buildQueue(state.age);
  state.index = 0;
  state.results = {};
  state.queue.forEach((q) => (state.results[q.domain] ??= { correct: 0, total: 0, streak: 0, stopped: false }));
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

function showResult() {
  const correct = Object.values(state.results).reduce((sum, r) => sum + r.correct, 0);
  const rate = correct / state.queue.length;
  const stars = Math.max(1, Math.round(rate * 5));

  $("result-name").textContent = state.name;
  $("result-age").textContent = state.age;
  $("result-stars").textContent = "⭐".repeat(stars) + "☆".repeat(5 - stars);
  $("result-score").textContent = `~${playScore(rate)}`;
  $("result-breakdown").innerHTML = DOMAINS.filter((d) => state.results[d.key])
    .map((d) => {
      const r = state.results[d.key];
      const dots = '<i class="dot on"></i>'.repeat(r.correct) + '<i class="dot"></i>'.repeat(r.total - r.correct);
      const note = r.stopped ? `<small>stopped early</small>` : "";
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
    $("btn-start").disabled = false;
  };
});

$("btn-start").onclick = startGame;
$("btn-restart").onclick = () => showScreen("screen-start");
$("btn-home").onclick = () => {
  clearTimers();
  speechSynthesis?.cancel();
  showScreen("screen-start");
};
$("btn-speak").onclick = () => speak(state.spoken);
