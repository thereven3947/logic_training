// Question bank for ages 3–7.
//
// Domains mirror the WPPSI-IV primary indexes (Fluid Reasoning, Verbal
// Comprehension, Visual Spatial, Working Memory, Processing Speed) plus the
// Stanford-Binet 5 Quantitative Reasoning factor. Items are original, not
// taken from any published test. Within a domain, items run easy → hard.
//
// Common fields
//   domain   key from DOMAINS
//   ages     [min, max] age in years (inclusive) the item is shown to
//   type     "choice" (default) | "memory" | "speed"
//   prompt   text on screen; `say` overrides what is read aloud
//   visual   items shown in the visual box; `grid: n` lays them out n×n
//   choices  answer options; `choiceGrid: n` lays them out n×n
//   answer   index of the correct choice, or array of indices (tap all)
//
// memory: `study` items (laid out with `studyGrid`) are shown for `studyMs`,
//         then hidden before the question appears.
// speed:  a field of `cells` items with `targets` copies of `target` mixed
//         with `distractors`; tap every target within `seconds`.
//
// Item formats: "🍎" emoji/text · "?" blank slot · "" empty cell ·
//   { e, size, rot, flip, shadow } styled emoji · { e, label } emoji with a caption ·
//   { shape, color, size, rot } CSS shape (circle|square|triangle|house|star) ·
//   { blocks, rot } red/white block pattern, 1, 4 or 9 cells:
//     R red · W white · a/b/c/d half red in top-left/top-right/bottom-right/bottom-left · ? blank

const DOMAINS = [
  { key: "fluid", name: "Reasoning", icon: "🧩" },
  { key: "verbal", name: "Words & Knowledge", icon: "💬" },
  { key: "spatial", name: "Shapes & Space", icon: "🔷" },
  { key: "memory", name: "Memory", icon: "🧠" },
  { key: "speed", name: "Speed", icon: "⚡" },
  { key: "quant", name: "Numbers", icon: "🔢" },
];

const sized = (e, size) => ({ e, size });
const turned = (e, rot) => ({ e, rot });
const shadow = (e) => ({ e, shadow: true });
const shape = (shape, color, rot = 0, size) => ({ shape, color, rot, size });
const blocks = (blocks, rot = 0) => ({ blocks, rot });

const QUESTIONS = [
  // ── Fluid reasoning: patterns, matrices, picture concepts ──
  {
    domain: "fluid", ages: [3, 3],
    prompt: "What comes next?",
    visual: ["🔴", "🔵", "🔴", "🔵", "🔴", "?"],
    choices: ["🔴", "🔵", "🟢"],
    answer: 1,
  },
  {
    domain: "fluid", ages: [3, 4],
    prompt: "Which one does NOT belong?",
    choices: ["🍎", "🍌", "🚗", "🍇"],
    answer: 2,
  },
  {
    domain: "fluid", ages: [3, 4],
    prompt: "Which one goes with these?",
    visual: ["🐶", "🐱", "🐰"],
    choices: ["🍕", "🐷", "🚲"],
    answer: 1,
  },
  {
    domain: "fluid", ages: [3, 4],
    prompt: "What comes next?",
    visual: ["🐶", "🐱", "🐱", "🐶", "🐱", "?"],
    choices: ["🐱", "🐶", "🐭"],
    answer: 0,
  },
  {
    domain: "fluid", ages: [4, 5],
    prompt: "Which one fills the empty box?",
    grid: 2,
    visual: ["🍎", "🍎🍎", "🍌", "?"],
    choices: ["🍌", "🍎🍎", "🍌🍌"],
    answer: 2,
  },
  {
    domain: "fluid", ages: [4, 5],
    prompt: "Which one fills the empty box?",
    grid: 2,
    visual: [sized("🐟", 1.3), sized("🐟", 0.6), sized("🐢", 1.3), "?"],
    choices: [sized("🐢", 1.3), sized("🐢", 0.6), sized("🐟", 0.6)],
    answer: 1,
  },
  {
    domain: "fluid", ages: [5, 5],
    prompt: "What comes next?",
    visual: ["⭐", "⭐⭐", "⭐⭐⭐", "?"],
    choices: ["⭐⭐", "⭐⭐⭐⭐", "⭐"],
    answer: 1,
  },
  {
    domain: "fluid", ages: [5, 7],
    prompt: "Which one fills the empty box?",
    grid: 2,
    visual: ["👉", "👈", "👆", "?"],
    choices: ["👆", "👉", "👇"],
    answer: 2,
  },
  {
    domain: "fluid", ages: [5, 6],
    prompt: "Which one does NOT belong?",
    choices: ["🍩", "🎂", "🥦", "🍪"],
    answer: 2,
  },
  {
    domain: "fluid", ages: [6, 7],
    prompt: "Which one goes with these?",
    visual: ["✏️", "🖍️", "🖌️"],
    choices: ["🥄", "🖊️", "🧦"],
    answer: 1,
  },
  {
    domain: "fluid", ages: [6, 7],
    prompt: "Which one fills the empty box?",
    grid: 3,
    visual: ["🍎", "🍌", "🍇", "🍌", "🍇", "🍎", "🍇", "🍎", "?"],
    choices: ["🍇", "🍎", "🍌"],
    answer: 2,
  },
  {
    domain: "fluid", ages: [6, 7],
    prompt: "What comes next?",
    visual: ["⭐", "🌙", "⭐⭐", "🌙🌙", "⭐⭐⭐", "?"],
    choices: ["⭐⭐⭐⭐", "🌙🌙🌙", "🌙🌙"],
    answer: 1,
  },
  {
    domain: "fluid", ages: [7, 7],
    prompt: "Which one fills the empty box?",
    grid: 3,
    visual: ["🔵", "🟢🟢", "🟣🟣🟣", "🟢", "🟣🟣", "🔵🔵🔵", "🟣", "🔵🔵", "?"],
    choices: ["🟣🟣🟣", "🟢🟢🟢", "🟢🟢"],
    answer: 1,
  },

  // ── Verbal comprehension: vocabulary, knowledge, comprehension, similarities ──
  {
    domain: "verbal", ages: [3, 3],
    prompt: "Tap the ball.",
    choices: ["🍌", "⚽", "🐶"],
    answer: 1,
  },
  {
    domain: "verbal", ages: [3, 4],
    prompt: "Which one do you wear on your feet?",
    choices: ["🎩", "🧤", "👟"],
    answer: 2,
  },
  {
    domain: "verbal", ages: [3, 4],
    prompt: "What do you use when it rains?",
    choices: ["🕶️", "☂️", "🧤"],
    answer: 1,
  },
  {
    domain: "verbal", ages: [3, 5],
    prompt: "Which one can fly?",
    choices: ["🐢", "🦋", "🐌"],
    answer: 1,
  },
  {
    domain: "verbal", ages: [4, 4],
    prompt: "Which one goes with the sock?",
    visual: ["🧦", "➕", "?"],
    choices: ["👟", "🍕", "📚"],
    answer: 0,
  },
  {
    domain: "verbal", ages: [4, 5],
    prompt: "Which animal gives us milk?",
    choices: ["🐔", "🐷", "🐄"],
    answer: 2,
  },
  {
    domain: "verbal", ages: [5, 6],
    prompt: "What do you do when you are sleepy?",
    choices: ["🍦", "🛏️", "⚽"],
    answer: 1,
  },
  {
    domain: "verbal", ages: [5, 6],
    prompt: "What is the opposite of hot?",
    visual: ["🔥"],
    choices: ["☀️", "🍕", "❄️"],
    answer: 2,
  },
  {
    domain: "verbal", ages: [5, 6],
    prompt: "Which one is a vehicle?",
    choices: ["🚌", "🏠", "🌳"],
    answer: 0,
  },
  {
    domain: "verbal", ages: [6, 7],
    prompt: "An apple and a banana are both things you…",
    say: "An apple and a banana. They are both things you... wear, ride, or eat?",
    visual: ["🍎", "🍌"],
    choices: ["👕", "🚲", "🍽️"],
    answer: 2,
  },
  {
    domain: "verbal", ages: [6, 7],
    prompt: "Which one is a tool?",
    choices: ["🧸", "🔨", "🍰"],
    answer: 1,
  },
  {
    domain: "verbal", ages: [7, 7],
    prompt: "If you see a fire, what should you do?",
    say: "If you see a fire, what should you do? Hide, get help, or eat popcorn?",
    choices: ["🙈", "📞", "🍿"],
    answer: 1,
  },
  {
    domain: "verbal", ages: [7, 7],
    prompt: "A fish lives in water. A bird lives in a…",
    visual: ["🐟", "🌊", "🐦", "?"],
    choices: ["🚗", "🌳", "🌊"],
    answer: 1,
  },
  {
    domain: "verbal", ages: [7, 7],
    prompt: "A puppy is a baby dog. A kitten is a baby…",
    choices: ["🐶", "🐮", "🐱"],
    answer: 2,
  },

  // ── Visual-spatial: size, shape, rotation, shadows, block design ──
  {
    domain: "spatial", ages: [3, 3],
    prompt: "Which one is the BIGGEST?",
    choices: [sized("🐶", 0.6), sized("🐶", 1.4), sized("🐶", 0.9)],
    answer: 1,
  },
  {
    domain: "spatial", ages: [3, 4],
    prompt: "Which one is the same shape?",
    visual: [shape("triangle", "#e74c3c")],
    choices: [shape("square", "#3498db"), shape("circle", "#f1c40f"), shape("triangle", "#2ecc71")],
    answer: 2,
  },
  {
    domain: "spatial", ages: [3, 4],
    prompt: "Which one is upside down?",
    choices: ["🐱", turned("🐱", 180), "🐱"],
    answer: 1,
  },
  {
    domain: "spatial", ages: [3, 3],
    prompt: "Which one is the SMALLEST?",
    choices: [shape("circle", "#9b59b6", 0, 0.9), shape("circle", "#9b59b6", 0, 0.4), shape("circle", "#9b59b6", 0, 1.3)],
    answer: 1,
  },
  {
    domain: "spatial", ages: [4, 5],
    prompt: "Which one looks exactly the same?",
    visual: [blocks("RWWR")],
    choices: [blocks("RWWR"), blocks("WRRW"), blocks("RRWW")],
    answer: 0,
  },
  {
    domain: "spatial", ages: [4, 4],
    prompt: "Which shape is the same, just turned?",
    visual: [shape("house", "#e67e22")],
    choices: [shape("triangle", "#e67e22", 90), shape("house", "#e67e22", 90), shape("square", "#e67e22", 45)],
    answer: 1,
  },
  {
    domain: "spatial", ages: [4, 5],
    prompt: "Which shadow belongs to the elephant?",
    visual: ["🐘"],
    choices: [shadow("🦒"), shadow("🐇"), shadow("🐘")],
    answer: 2,
  },
  {
    domain: "spatial", ages: [5, 6],
    prompt: "Which one looks exactly the same?",
    visual: [blocks("aWWc")],
    choices: [blocks("bWWd"), blocks("aWWc"), blocks("aWWa")],
    answer: 1,
  },
  {
    domain: "spatial", ages: [5, 6],
    prompt: "Which piece fills the hole?",
    visual: [blocks("cdb?")],
    choices: [blocks("c"), blocks("a"), blocks("R")],
    answer: 1,
  },
  {
    domain: "spatial", ages: [5, 7],
    prompt: "Which shadow belongs to the cat?",
    visual: ["🐈"],
    choices: [shadow("🐕"), shadow("🐈"), shadow("🐆")],
    answer: 1,
  },
  {
    domain: "spatial", ages: [6, 7],
    prompt: "Which one is the same picture, just turned?",
    visual: [blocks("RaWW")],
    choices: [blocks("bRWW", 90), blocks("RaWW", 90), blocks("RRWW", 90)],
    answer: 1,
  },
  {
    domain: "spatial", ages: [6, 7],
    prompt: "Which piece fills the hole?",
    visual: [blocks("cWdWRWbW?")],
    choices: [blocks("c"), blocks("d"), blocks("a")],
    answer: 2,
  },
  {
    domain: "spatial", ages: [7, 7],
    prompt: "Which one is what you'd see in a mirror?",
    visual: [blocks("RaWW"), "🪞"],
    choices: [blocks("RaWW", 180), blocks("bRWW"), blocks("WWRa")],
    answer: 1,
  },

  // ── Working memory: picture memory, locations, order ──
  {
    domain: "memory", ages: [3, 3], type: "memory",
    study: ["🐶"], studyMs: 3000,
    prompt: "Which one did you see?",
    choices: ["🐱", "🐶", "🐰"],
    answer: 1,
  },
  {
    domain: "memory", ages: [3, 4], type: "memory",
    study: ["🚗"], studyMs: 3000,
    prompt: "Which one did you see?",
    choices: ["🚲", "🚌", "🚗"],
    answer: 2,
  },
  {
    domain: "memory", ages: [3, 4], type: "memory",
    studyGrid: 2, study: ["", "🐵", "", ""], studyMs: 3500,
    prompt: "Where was the monkey?",
    choiceGrid: 2, choices: ["", "", "", ""],
    answer: 1,
  },
  {
    domain: "memory", ages: [4, 5], type: "memory",
    study: ["🍎", "🐟"], studyMs: 4000,
    prompt: "Tap BOTH pictures you saw.",
    choices: ["🐟", "🍌", "🍎", "🐸"],
    answer: [0, 2],
  },
  {
    domain: "memory", ages: [4, 5], type: "memory",
    studyGrid: 2, study: ["🦁", "", "", "🐵"], studyMs: 4000,
    prompt: "Where was the lion?",
    choiceGrid: 2, choices: ["", "", "", ""],
    answer: 0,
  },
  {
    domain: "memory", ages: [5, 6], type: "memory",
    study: ["⚽", "🌸", "🐢"], studyMs: 5000,
    prompt: "Tap ALL 3 pictures you saw.",
    choices: ["🌸", "🐞", "⚽", "🐢", "🍓", "🚀"],
    answer: [0, 2, 3],
  },
  {
    domain: "memory", ages: [5, 7], type: "memory",
    studyGrid: 3, study: ["", "🐘", "", "", "", "", "🐼", "", ""], studyMs: 5000,
    prompt: "Where was the elephant?",
    choiceGrid: 3, choices: ["", "", "", "", "", "", "", "", ""],
    answer: 1,
  },
  {
    domain: "memory", ages: [6, 7], type: "memory",
    study: ["🐶", "🐱", "🐰"], studyMs: 4000,
    prompt: "Which animal was in the MIDDLE?",
    choices: ["🐰", "🐱", "🐶"],
    answer: 1,
  },
  {
    domain: "memory", ages: [6, 7], type: "memory",
    study: ["🍌", "🚀", "🎈", "🐸"], studyMs: 6000,
    prompt: "Tap ALL 4 pictures you saw.",
    choices: ["🎈", "🍎", "🐸", "🚗", "🍌", "🌟", "🚀", "🐢"],
    answer: [0, 2, 4, 6],
  },
  {
    domain: "memory", ages: [7, 7], type: "memory",
    studyGrid: 3, study: ["🦒", "", "", "", "", "🐵", "", "🐧", ""], studyMs: 6000,
    prompt: "Where was the penguin?",
    choiceGrid: 3, choices: ["", "", "", "", "", "", "", "", ""],
    answer: 7,
  },
  {
    domain: "memory", ages: [7, 7], type: "memory",
    study: ["⭐", "🍎", "🚗", "🐟"], studyMs: 5000,
    prompt: "What came right AFTER the apple?",
    choices: ["⭐", "🐟", "🚗"],
    answer: 2,
  },

  // ── Processing speed: timed cancellation (not given to 3-year-olds, as in WPPSI-IV) ──
  {
    domain: "speed", ages: [4, 5], type: "speed",
    prompt: "Tap all the 🐞 as fast as you can!",
    say: "Tap all the ladybugs as fast as you can!",
    target: "🐞", distractors: ["🐜", "🦋"], cells: 12, targets: 4, seconds: 30,
  },
  {
    domain: "speed", ages: [4, 6], type: "speed",
    prompt: "Tap all the ⭐ as fast as you can!",
    say: "Tap all the stars as fast as you can!",
    target: "⭐", distractors: ["🌙", "☀️"], cells: 12, targets: 4, seconds: 25,
  },
  {
    domain: "speed", ages: [5, 7], type: "speed",
    prompt: "Tap all the 🐞 as fast as you can!",
    say: "Tap all the ladybugs as fast as you can!",
    target: "🐞", distractors: ["🐜", "🕷️", "🐛", "🦗"], cells: 16, targets: 5, seconds: 30,
  },
  {
    domain: "speed", ages: [6, 7], type: "speed",
    prompt: "Tap all the 🍎 as fast as you can!",
    say: "Tap all the apples as fast as you can!",
    target: "🍎", distractors: ["🍅", "🍒", "🍓"], cells: 20, targets: 6, seconds: 30,
  },
  {
    domain: "speed", ages: [7, 7], type: "speed",
    prompt: "Tap all the 🐟 as fast as you can!",
    say: "Tap all the blue fish as fast as you can!",
    target: "🐟", distractors: ["🐠", "🐡", "🦈"], cells: 20, targets: 6, seconds: 25,
  },

  // ── Quantitative reasoning: counting, comparing, adding, number sense ──
  {
    domain: "quant", ages: [3, 3],
    prompt: "Which picture has 2 ducks?",
    choices: ["🐤", "🐤🐤", "🐤🐤🐤"],
    answer: 1,
  },
  {
    domain: "quant", ages: [3, 4],
    prompt: "Which group has MORE?",
    choices: ["🍓🍓", "🍓🍓🍓🍓🍓", "🍓🍓🍓"],
    answer: 1,
  },
  {
    domain: "quant", ages: [3, 4],
    prompt: "How many apples?",
    visual: ["🍎", "🍎", "🍎", "🍎"],
    choices: ["3", "4", "5"],
    answer: 1,
  },
  {
    domain: "quant", ages: [4, 4],
    prompt: "Which group has FEWER?",
    choices: ["🐟🐟🐟", "🐟", "🐟🐟"],
    answer: 1,
  },
  {
    domain: "quant", ages: [4, 5],
    prompt: "2 birds. 1 more comes. How many birds now?",
    visual: ["🐦", "🐦", "➕", "🐦"],
    choices: ["2", "4", "3"],
    answer: 2,
  },
  {
    domain: "quant", ages: [5, 6],
    prompt: "Which group has MORE animals?",
    choices: [sized("🐘🐘", 1.3), sized("🐭🐭🐭🐭", 0.6)],
    answer: 1,
  },
  {
    domain: "quant", ages: [5, 5],
    prompt: "How many stars?",
    visual: ["⭐", "⭐", "⭐", "⭐", "⭐", "⭐", "⭐"],
    choices: ["6", "8", "7"],
    answer: 2,
  },
  {
    domain: "quant", ages: [5, 6],
    prompt: "You have 4 cookies and eat 1. How many are left?",
    visual: ["🍪", "🍪", "🍪", "🍪"],
    choices: ["3", "4", "2"],
    answer: 0,
  },
  {
    domain: "quant", ages: [6, 7],
    prompt: "What number comes next?",
    visual: ["2", "4", "6", "?"],
    choices: ["7", "8", "9"],
    answer: 1,
  },
  {
    domain: "quant", ages: [6, 7],
    prompt: "How many apples in all?",
    visual: ["🍎🍎🍎", "➕", "🍎🍎🍎🍎"],
    choices: ["6", "7", "8"],
    answer: 1,
  },
  {
    domain: "quant", ages: [6, 7],
    prompt: "Which number comes right before 10?",
    choices: ["11", "8", "9"],
    answer: 2,
  },
  {
    domain: "quant", ages: [7, 7],
    prompt: "5 birds. 2 fly away, then 1 more comes. How many birds now?",
    visual: ["🐦", "🐦", "🐦", "🐦", "🐦"],
    choices: ["3", "4", "5"],
    answer: 1,
  },
  {
    domain: "quant", ages: [7, 7],
    prompt: "Which number is the BIGGEST?",
    choices: ["12", "9", "21"],
    answer: 2,
  },
];
