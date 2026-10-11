// Generated question bank: grows the hand-written items in questions.js into a
// large pool so every game draws a different set of puzzles.
//
// Each family below fills one item template from pools of everyday pictures.
// Everything is original (no content from any published test). A fixed seed
// makes the bank identical on every load, so answers can be checked offline.
// Extra item fields:
//   kind   template name; one game avoids repeating a kind within an area
//   level  difficulty in years of age; a game picks items easy → hard by level

(() => {
  // ── Seeded random helpers ──
  let seed = 20261010;
  function rand() {
    // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const randInt = (n) => Math.floor(rand() * n);
  const pick = (arr) => arr[randInt(arr.length)];
  const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  // n distinct random elements of arr, skipping any in `exclude`.
  function sample(arr, n, exclude = []) {
    const pool = arr.filter((x) => !exclude.includes(x));
    const out = [];
    while (out.length < n && pool.length) out.push(pool.splice(randInt(pool.length), 1)[0]);
    return out;
  }

  // { choices, answer } with the right answer at a random position.
  function mix(right, wrongs) {
    const choices = [...wrongs];
    const answer = randInt(choices.length + 1);
    choices.splice(answer, 0, right);
    return { choices, answer };
  }

  // Tap-all version: every one of `rights` is an answer.
  function mixAll(rights, wrongs) {
    const choices = sample([...rights, ...wrongs], rights.length + wrongs.length);
    return { choices, answer: rights.map((r) => choices.indexOf(r)).sort((a, b) => a - b) };
  }

  // Number choices: the answer plus nearby wrong numbers (never negative or repeated).
  function mixNums(right, wrongs) {
    const ok = [...new Set(wrongs)].filter((n) => n >= 0 && n !== right);
    return mix(String(right), ok.slice(0, 2).map(String));
  }

  const rep = (e, n) => e.repeat(n);

  const key = (q) =>
    JSON.stringify([q.prompt, q.visual, q.study, q.target, q.cells, (q.choices || []).map((c) => JSON.stringify(c)).sort()]);
  const seen = new Set(QUESTIONS.map(key));
  function add(domain, kind, ages, level, item) {
    const q = { domain, kind, ages, level, ...item };
    if (seen.has(key(q))) return;
    seen.add(key(q));
    QUESTIONS.push(q);
  }

  // ── Picture pools ──
  // `group`: categories that overlap in meaning (a bird and a dog are both
  // animals), so easy foils always come from a different group. `hard` lists
  // nearby categories used as foils in the harder versions.
  const CATS = {
    fruit: {
      group: "food", hard: ["veg", "sweet"], is: "Which one is a fruit?", use: "eat",
      items: [["🍎", "apple"], ["🍌", "banana"], ["🍇", "grapes"], ["🍓", "strawberry"], ["🍊", "orange"], ["🍐", "pear"],
        ["🍒", "cherries"], ["🍉", "watermelon"], ["🍍", "pineapple"], ["🍑", "peach"], ["🍋", "lemon"], ["🥝", "kiwi"]],
    },
    veg: {
      group: "food", hard: ["fruit", "sweet"], is: "Which one is a vegetable?", use: "eat",
      items: [["🥕", "carrot"], ["🥦", "broccoli"], ["🌽", "corn"], ["🥔", "potato"], ["🧅", "onion"], ["🥬", "lettuce"], ["🧄", "garlic"]],
    },
    sweet: {
      group: "food", hard: ["fruit", "veg"], is: "Which one is a sweet treat?", use: "eat",
      items: [["🍩", "donut"], ["🍪", "cookie"], ["🧁", "cupcake"], ["🍦", "ice cream"], ["🍭", "lollipop"], ["🍫", "chocolate"],
        ["🎂", "birthday cake"], ["🍰", "piece of cake"]],
    },
    animal: {
      group: "living", hard: ["bird", "bug"], is: "Which one is an animal?",
      items: [["🐶", "dog"], ["🐱", "cat"], ["🐰", "rabbit"], ["🐷", "pig"], ["🐮", "cow"], ["🐵", "monkey"], ["🦁", "lion"],
        ["🐯", "tiger"], ["🐻", "brown bear"], ["🐼", "panda"], ["🐴", "horse"], ["🦊", "fox"], ["🐭", "mouse"], ["🐨", "koala"],
        ["🦒", "giraffe"], ["🐘", "elephant"], ["🦓", "zebra"]],
    },
    bird: {
      group: "living", hard: ["animal", "bug"], is: "Which one is a bird?",
      items: [["🐔", "chicken"], ["🦆", "duck"], ["🦉", "owl"], ["🦅", "eagle"], ["🦜", "parrot"], ["🐧", "penguin"], ["🦢", "swan"],
        ["🦩", "flamingo"], ["🦚", "peacock"]],
    },
    sea: {
      group: "living", hard: ["animal", "bug"], is: "Which one lives in the sea?",
      items: [["🐟", "fish"], ["🐙", "octopus"], ["🦀", "crab"], ["🐳", "whale"], ["🐬", "dolphin"], ["🦈", "shark"], ["🦑", "squid"],
        ["🦞", "lobster"]],
    },
    bug: {
      group: "living", hard: ["animal", "bird"], is: "Which one is a bug?",
      items: [["🐞", "ladybug"], ["🐜", "ant"], ["🐝", "bee"], ["🦋", "butterfly"], ["🐛", "caterpillar"], ["🕷️", "spider"], ["🦗", "cricket"]],
    },
    vehicle: {
      group: "things", is: "Which one is a vehicle?", use: "ride",
      items: [["🚗", "car"], ["🚌", "bus"], ["🚲", "bike"], ["🚂", "train"], ["✈️", "airplane"], ["🚀", "rocket"], ["🚁", "helicopter"],
        ["🛻", "pickup truck"], ["🚜", "tractor"], ["🚒", "fire truck"], ["🚑", "ambulance"], ["🛴", "scooter"]],
    },
    toy: {
      group: "things", is: "Which one is a toy?", use: "play",
      items: [["⚽", "ball"], ["🧸", "teddy bear"], ["🪁", "kite"], ["🎈", "balloon"], ["🪀", "yo-yo"], ["🎲", "dice"], ["🧩", "puzzle"],
        ["🤖", "robot"]],
    },
    instrument: {
      group: "things", is: "Which one makes music?", use: "music",
      items: [["🎸", "guitar"], ["🎹", "piano"], ["🥁", "drum"], ["🎺", "trumpet"], ["🎻", "violin"], ["🎷", "saxophone"], ["🪗", "accordion"]],
    },
    clothes: {
      group: "clothes", is: "Which one do you wear?", use: "wear",
      items: [["👕", "T-shirt"], ["👖", "jeans"], ["👗", "dress"], ["🧦", "socks"], ["👟", "sneaker"], ["🧢", "cap"], ["🎩", "top hat"],
        ["🧤", "gloves"], ["🧣", "scarf"], ["👢", "boot"], ["🩳", "shorts"]],
    },
    tool: {
      group: "tools", is: "Which one is a tool?", use: "fix",
      items: [["🔨", "hammer"], ["🔧", "wrench"], ["🪛", "screwdriver"], ["🪚", "saw"], ["✂️", "scissors"], ["🪓", "axe"], ["🧹", "broom"],
        ["🪜", "ladder"]],
    },
  };
  const CAT_KEYS = Object.keys(CATS);
  const ALL = CAT_KEYS.flatMap((k) => CATS[k].items.map(([e, name]) => ({ e, name, k })));
  const NAME = Object.fromEntries(ALL.map((it) => [it.e, it.name]));
  const emojis = (k) => CATS[k].items.map(([e]) => e);
  const otherGroups = (k) => CAT_KEYS.filter((o) => CATS[o].group !== CATS[k].group);
  const foilsFrom = (keys) => keys.flatMap(emojis);
  const ANIMALS = emojis("animal");

  // Easy to count: [emoji, one, many]
  const COUNT = [["🍎", "apple", "apples"], ["🐤", "chick", "chicks"], ["⭐", "star", "stars"], ["🐟", "fish", "fish"],
    ["🌸", "flower", "flowers"], ["🍪", "cookie", "cookies"], ["🎈", "balloon", "balloons"], ["🐞", "ladybug", "ladybugs"],
    ["🚗", "car", "cars"], ["🍓", "strawberry", "strawberries"], ["⚽", "ball", "balls"], ["🐸", "frog", "frogs"],
    ["🦋", "butterfly", "butterflies"], ["🐢", "turtle", "turtles"], ["🐦", "bird", "birds"], ["🧁", "cupcake", "cupcakes"]];
  const COUNT_EMOJI = COUNT.map(([e]) => e);

  const PATTERN = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⭐", "🌙", "❤️", "🐶", "🐱", "🍎", "🍌", "🚗", "🌸", "⚽", "🐸", "🎈"];
  const COLOR_SETS = [["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"], ["🟥", "🟦", "🟩", "🟨", "🟪", "🟧"], ["❤️", "💙", "💚", "💛", "💜", "🧡"]];
  // Pictures with an obvious top and bottom.
  const UPRIGHT = ["🐱", "🐶", "🏠", "🌳", "⛄", "🎄", "🍦", "🦒", "🧁", "🌷", "🚀", "☕", "🏆", "🍄", "🐧", "🦉", "🌵", "🕯️"];
  // Side-view animals that clearly face one way.
  const FACING = ["🐕", "🐈", "🐎", "🐖", "🐄", "🐇", "🐿️", "🐊", "🐢", "🐌", "🦕", "🐓", "🐁", "🦔", "🚂"];
  const SIZE_POOL = [...ANIMALS, ...emojis("fruit")];

  // ── Fluid reasoning: patterns, matrices, picture concepts ──

  for (let i = 0; i < 70; i++) {
    const [a, b, c] = sample(PATTERN, 3);
    const seq = i % 2 ? [a, b, a, b, a] : [a, b, a, b];
    const right = seq.length % 2 ? b : a;
    add("fluid", "pattern-ab", [3, 4], 3.3, {
      prompt: "What comes next?", visual: [...seq, "?"], ...mix(right, [right === a ? b : a, c]),
    });
  }

  for (let i = 0; i < 70; i++) {
    const [a, b, c] = sample(PATTERN, 3);
    const unit = i % 2 ? [a, a, b] : [a, b, b];
    const cut = 5 + randInt(2);
    const seq = range(0, cut - 1).map((k) => unit[k % 3]);
    const right = unit[cut % 3];
    add("fluid", "pattern-aab", [4, 5], 4.4, {
      prompt: "What comes next?", visual: [...seq, "?"], ...mix(right, [right === a ? b : a, c]),
    });
  }

  for (let i = 0; i < 60; i++) {
    const [a, b, c, d] = sample(PATTERN, 4);
    const unit = [a, b, c];
    const cut = 5 + randInt(3);
    const seq = range(0, cut - 1).map((k) => unit[k % 3]);
    const right = unit[cut % 3];
    add("fluid", "pattern-abc", [5, 6], 5.4, {
      prompt: "What comes next?", visual: [...seq, "?"], ...mix(right, [...sample(unit, 1, [right]), d]),
    });
  }

  for (const e of COUNT_EMOJI) {
    add("fluid", "growing", [5, 6], 5.2, {
      prompt: "What comes next?", visual: [e, rep(e, 2), rep(e, 3), "?"], ...mix(rep(e, 4), [rep(e, 2), rep(e, 5)]),
    });
    add("fluid", "shrinking", [5, 7], 5.8, {
      prompt: "What comes next?", visual: [rep(e, 4), rep(e, 3), rep(e, 2), "?"], ...mix(e, [rep(e, 2), rep(e, 3)]),
    });
  }

  for (let i = 0; i < 90; i++) {
    const k = pick(CAT_KEYS);
    const odd = pick(foilsFrom(otherGroups(k)));
    add("fluid", "odd-one-out", [3, 5], 3.8, { prompt: "Which one does NOT belong?", ...mix(odd, sample(emojis(k), 3)) });
  }
  for (let i = 0; i < 70; i++) {
    const k = pick(CAT_KEYS.filter((c) => CATS[c].hard));
    const odd = pick(foilsFrom(CATS[k].hard));
    add("fluid", "odd-one-out-hard", [6, 7], 6.4, { prompt: "Which one does NOT belong?", ...mix(odd, sample(emojis(k), 3)) });
  }

  for (let i = 0; i < 70; i++) {
    const k = pick(CAT_KEYS);
    const [x, y, z, right] = sample(emojis(k), 4);
    add("fluid", "goes-with", [3, 5], 4.0, {
      prompt: "Which one goes with these?", visual: [x, y, z], ...mix(right, sample(foilsFrom(otherGroups(k)), 2)),
    });
  }
  for (let i = 0; i < 50; i++) {
    const k = pick(CAT_KEYS.filter((c) => CATS[c].hard));
    const [x, y, z, right] = sample(emojis(k), 4);
    add("fluid", "goes-with-hard", [6, 7], 6.2, {
      prompt: "Which one goes with these?", visual: [x, y, z], ...mix(right, sample(foilsFrom(CATS[k].hard), 2)),
    });
  }

  for (let i = 0; i < 45; i++) {
    const [a, b] = sample(COUNT_EMOJI, 2);
    const n = 2 + randInt(2);
    add("fluid", "matrix-count", [4, 5], 4.6, {
      prompt: "Which one fills the empty box?", grid: 2,
      visual: [a, rep(a, n), b, "?"], ...mix(rep(b, n), [b, rep(a, n)]),
    });
  }

  for (let i = 0; i < 45; i++) {
    const [a, b] = sample(SIZE_POOL, 2);
    const [s1, s2] = rand() < 0.5 ? [1.3, 0.6] : [0.6, 1.3];
    add("fluid", "matrix-size", [4, 5], 4.7, {
      prompt: "Which one fills the empty box?", grid: 2,
      visual: [sized(a, s1), sized(a, s2), sized(b, s1), "?"], ...mix(sized(b, s2), [sized(b, s1), sized(a, s2)]),
    });
  }

  for (let i = 0; i < 40; i++) {
    const [a, b, c] = sample(UPRIGHT, 3);
    add("fluid", "matrix-flip", [5, 7], 5.6, {
      prompt: "Which one fills the empty box?", grid: 2,
      visual: [a, turned(a, 180), b, "?"], ...mix(turned(b, 180), [b, turned(c, 180)]),
    });
  }

  for (let i = 0; i < 70; i++) {
    const syms = sample(PATTERN, 3);
    const shift = 1 + randInt(2);
    const cells = range(0, 8).map((n) => syms[(n % 3 + Math.floor(n / 3) * shift) % 3]);
    const hole = randInt(9);
    const right = cells[hole];
    cells[hole] = "?";
    add("fluid", "matrix-3x3", [6, 7], 6.3, {
      prompt: "Which one fills the empty box?", grid: 3, visual: cells, ...mix(right, sample(syms, 2, [right])),
    });
  }

  for (let i = 0; i < 40; i++) {
    const [a, b] = sample(COUNT_EMOJI, 2);
    add("fluid", "two-step-growth", [6, 7], 6.7, {
      prompt: "What comes next?",
      visual: [a, b, rep(a, 2), rep(b, 2), rep(a, 3), "?"], ...mix(rep(b, 3), [rep(a, 4), rep(b, 2)]),
    });
  }

  for (let i = 0; i < 45; i++) {
    const cols = sample(pick(COLOR_SETS), 3);
    // Colour cycles along rows; count grows across columns.
    const cell = (r, c) => rep(cols[(r + c) % 3], c + 1);
    const hole = pick([2, 5, 6, 7, 8]);
    const [r, c] = [Math.floor(hole / 3), hole % 3];
    const right = cell(r, c);
    const visual = range(0, 8).map((n) => (n === hole ? "?" : cell(Math.floor(n / 3), n % 3)));
    add("fluid", "matrix-color-count", [7, 7], 7.0, {
      prompt: "Which one fills the empty box?", grid: 3, visual,
      ...mix(right, [rep(cols[(r + c + 1) % 3], c + 1), rep(cols[(r + c) % 3], c === 2 ? 2 : c + 2)]),
    });
  }

  // ── Verbal comprehension: vocabulary, categories, knowledge, similarities ──

  for (const it of ALL) {
    const far = ALL.filter((o) => CATS[o.k].group !== CATS[it.k].group).map((o) => o.e);
    add("verbal", "vocab", [3, 4], 3.2, { prompt: `Tap the ${it.name}.`, ...mix(it.e, sample(far, 2)) });
    add("verbal", "vocab-hard", [5, 6], 5.0, { prompt: `Tap the ${it.name}.`, ...mix(it.e, sample(emojis(it.k), 3, [it.e])) });
  }

  for (const k of CAT_KEYS) {
    for (const e of emojis(k)) {
      const far = foilsFrom(otherGroups(k));
      add("verbal", "category", [4, 5], 4.4, { prompt: CATS[k].is, ...mix(e, sample(far, 2)) });
      add("verbal", "category-4", [5, 7], 5.6, { prompt: CATS[k].is, ...mix(e, sample(far, 3)) });
      // A bird is an animal too, and fruit is sweet, so those have no hard version.
      if (CATS[k].hard && k !== "animal" && k !== "sweet") {
        add("verbal", "category-hard", [6, 7], 6.5, { prompt: CATS[k].is, ...mix(e, sample(foilsFrom(CATS[k].hard), 3)) });
      }
    }
  }

  // Everyday knowledge: [ages, prompt, right answers, wrong answers]
  const FACTS = [
    [[3, 4], "Which one can fly?", ["🦋", "🦅", "🐝", "✈️", "🚁", "🦉"], ["🐢", "🐌", "🐷", "🐶", "🚗", "🐘", "🐮"]],
    [[3, 4], "Which one can swim?", ["🐟", "🐬", "🦆", "🐳"], ["🚲", "🏠", "🌵", "🧸", "🎸"]],
    [[3, 4], "Which one do you wear on your feet?", ["👟", "👢", "🧦"], ["🎩", "🧤", "🧣", "🧢", "👓"]],
    [[3, 4], "Which one do you wear on your head?", ["🧢", "🎩"], ["🧦", "👟", "🧤", "👖", "👢"]],
    [[3, 4], "Which one do you wear on your hands?", ["🧤"], ["🧦", "👟", "🧢", "👖", "🧣"]],
    [[3, 4], "What do you use when it rains?", ["☂️"], ["🕶️", "⚽", "🍦", "🪁", "🧸"]],
    [[3, 4], "Which one says moo?", ["🐮"], ["🐶", "🐱", "🐷", "🐔", "🦆", "🐑"]],
    [[3, 4], "Which one says woof?", ["🐶"], ["🐮", "🐱", "🐷", "🐔", "🦆", "🐑"]],
    [[3, 4], "Which one says quack?", ["🦆"], ["🐶", "🐮", "🐱", "🐷", "🐑"]],
    [[3, 4], "Which one says meow?", ["🐱"], ["🐶", "🐮", "🐷", "🦆", "🐑"]],
    [[3, 4], "Which one is cold?", ["🧊", "⛄", "🍦"], ["🔥", "☀️", "☕"]],
    [[4, 5], "Which one is hot?", ["🔥", "☀️"], ["🧊", "⛄", "🍦", "❄️"]],
    [[4, 5], "What do you use to brush your teeth?", ["🪥"], ["🥄", "✏️", "🔨", "🧹", "🔑"]],
    [[4, 5], "What do you use to eat soup?", ["🥄"], ["✂️", "🔨", "🪥", "✏️", "🧹"]],
    [[4, 5], "What do you use to cut paper?", ["✂️"], ["🥄", "🪥", "🖍️", "🧹", "🔑"]],
    [[4, 5], "What do you use to open a door?", ["🔑"], ["✂️", "🥄", "🪥", "🧹", "🖍️"]],
    [[4, 5], "Which animal gives us milk?", ["🐮", "🐐"], ["🐔", "🐷", "🐶", "🐱", "🦆"]],
    [[4, 5], "Which animal gives us eggs?", ["🐔"], ["🐮", "🐷", "🐶", "🐴", "🐑"]],
    [[4, 5], "Which one do you see at night?", ["🌙", "⭐"], ["☀️", "🌈", "🌤️"]],
    [[4, 5], "Where do you sleep?", ["🛏️"], ["🛁", "🚽", "🪜", "🚲"]],
    [[5, 6], "What do you do when you are sleepy?", ["🛏️"], ["🍦", "⚽", "🎸", "🚲"]],
    [[5, 6], "What do you need when you are hungry?", ["🍎", "🍞", "🥕"], ["🛏️", "⚽", "🧦", "🔑", "🎸"]],
    [[5, 6], "What do you need when you are thirsty?", ["🥛", "🧃"], ["🛏️", "⚽", "🧦", "🍞", "🍪"]],
    [[5, 6], "What do you wear when it is cold outside?", ["🧣", "🧤", "🧥"], ["🩳", "🕶️", "🩴"]],
    [[5, 6], "What do you take to the beach?", ["🪣", "🩴", "🕶️"], ["🧣", "🧤", "⛄", "🛷"]],
    [[5, 6], "Which one helps put out fires?", ["🚒"], ["🚑", "🚌", "🚜", "🚲"]],
    [[5, 6], "Which one takes sick people to the hospital?", ["🚑"], ["🚒", "🚌", "🚜", "🍦"]],
    [[5, 6], "Which one grows on a tree?", ["🍎", "🍐", "🍒", "🍊"], ["🥕", "🥔", "🧅", "🐟", "🧀"]],
    [[5, 6], "Which one tells you the time?", ["⏰", "⌚"], ["📚", "🔑", "🎈", "🧦"]],
    [[5, 6], "Which one do you read?", ["📚", "📖"], ["🎈", "🍕", "🧦", "⚽"]],
    [[5, 6], "Which one lights up a dark room?", ["💡", "🔦"], ["🧦", "🍌", "⚽", "🪑"]],
    [[5, 6], "Which one do you talk on?", ["📞", "📱"], ["📚", "🥄", "🧦", "🍎"]],
    [[6, 7], "Which one grows under the ground?", ["🥕", "🥔"], ["🍎", "🍒", "🍌", "🍐"]],
    [[6, 7], "What helps a plant grow?", ["💧", "☀️"], ["🍭", "🧦", "📺", "🎈"]],
    [[6, 7], "Where do you go when you are sick?", ["🏥"], ["🏫", "🎡", "🏖️", "⛺"]],
    [[6, 7], "Where do you go to learn?", ["🏫"], ["🏥", "🎡", "🏖️", "⛺"]],
    [[6, 7], "Which one is used to fix things?", ["🔨", "🔧", "🪛"], ["🍰", "🧸", "🎈", "🧦"]],
    [[6, 7], "Which one helps you see far away?", ["🔭"], ["📞", "🔑", "🥄", "🎈"]],
    [[6, 7], "Which picture shows winter?", ["⛄", "❄️"], ["🌻", "🏖️", "🍉"]],
    [[6, 7], "Which one has wheels?", ["🚗", "🚲", "🚌", "🛴"], ["⛵", "🐴", "🛶", "🐟"]],
    [[6, 7], "Which one has wings?", ["🦅", "🦋", "✈️", "🐝"], ["🐟", "🐍", "🐢", "🚗", "🐌"]],
    [[6, 7], "Which animal has a long neck?", ["🦒"], ["🐷", "🐭", "🐸", "🐻"]],
    [[6, 7], "Which animal has a trunk?", ["🐘"], ["🦒", "🦁", "🐴", "🐮"]],
    [[6, 7], "Which animal has stripes?", ["🦓", "🐯"], ["🐘", "🐷", "🐸", "🐭"]],
    [[7, 7], "Which animal sleeps all winter?", ["🐻"], ["🐶", "🐔", "🐟", "🐴"]],
  ];
  for (const [ages, prompt, rights, wrongs] of FACTS) {
    const nWrong = ages[0] <= 4 ? 2 : 3;
    for (let v = 0; v < 3; v++) {
      add("verbal", "knowledge", ages, (ages[0] + ages[1]) / 2, { prompt, ...mix(rights[v % rights.length], sample(wrongs, nWrong)) });
    }
  }

  // Opposites: [word, picture, opposite picture, wrong pictures]
  const OPPOSITES = [
    ["hot", "🔥", "❄️", ["☀️", "🍕", "🌶️"]],
    ["day", "☀️", "🌙", ["🌈", "🌻", "🌤️"]],
    ["happy", "😀", "😢", ["😂", "🙂", "😎"]],
    ["up", "⬆️", "⬇️", ["➡️", "⬅️", "↗️"]],
    ["slow", "🐢", "🐇", ["🐌", "🦥", "🐢"]],
    ["awake", "😃", "😴", ["😀", "😮", "😊"]],
    ["loud", "🔊", "🔇", ["📢", "🎺", "🔔"]],
    ["stop", "🛑", "🟢", ["🔴", "⛔", "🚫"]],
  ];
  for (const [word, e, right, wrongs] of OPPOSITES) {
    for (let v = 0; v < 2; v++) {
      add("verbal", "opposites", [5, 6], 5.6, {
        prompt: `What is the opposite of ${word}?`, visual: [e], ...mix(right, sample(wrongs, 2, [e])),
      });
    }
  }

  const BABIES = [["puppy", "🐶"], ["kitten", "🐱"], ["calf", "🐮"], ["chick", "🐔"], ["lamb", "🐑"], ["foal", "🐴"],
    ["piglet", "🐷"], ["duckling", "🦆"], ["tadpole", "🐸"], ["joey", "🦘"], ["cub", "🐻"], ["owlet", "🦉"]];
  for (const [baby, parent] of BABIES) {
    for (let v = 0; v < 2; v++) {
      add("verbal", "baby-animals", [6, 7], 6.4, {
        prompt: `A ${baby} is a baby…`, say: `A ${baby} is a baby what?`,
        ...mix(parent, sample(BABIES.map(([, p]) => p), 2, [parent])),
      });
    }
  }

  // Homes: [animal, name, home]
  const HOMES = { sea: "🌊", desert: "🏜️", ice: "🧊", tree: "🌳" };
  const LIVES = [["🐟", "fish", "sea"], ["🐳", "whale", "sea"], ["🐙", "octopus", "sea"], ["🐬", "dolphin", "sea"],
    ["🦈", "shark", "sea"], ["🐪", "camel", "desert"], ["🦂", "scorpion", "desert"], ["🐧", "penguin", "ice"],
    ["🐻‍❄️", "polar bear", "ice"], ["🐒", "monkey", "tree"], ["🦉", "owl", "tree"], ["🐿️", "squirrel", "tree"],
    ["🐨", "koala", "tree"], ["🦜", "parrot", "tree"]];
  for (const [e, name, home] of LIVES) {
    // Penguins and polar bears also swim, so the sea is never their foil.
    const wrongHomes = Object.keys(HOMES).filter((h) => h !== home && !(home === "ice" && h === "sea"));
    for (let v = 0; v < 2; v++) {
      add("verbal", "habitats", [6, 7], 6.0, {
        prompt: `Where does a ${name} live?`, visual: [e], ...mix(HOMES[home], sample(wrongHomes, 2).map((h) => HOMES[h])),
      });
    }
  }

  const USES = {
    eat: { e: "🍽️", label: "eat" }, wear: { e: "👕", label: "wear" }, ride: { e: "🚲", label: "ride" },
    play: { e: "🧸", label: "play with" }, music: { e: "🎵", label: "make music with" }, fix: { e: "🔨", label: "fix things with" },
  };
  const USE_CATS = CAT_KEYS.filter((k) => CATS[k].use);
  for (let i = 0; i < 90; i++) {
    const k = pick(USE_CATS);
    const [x, y] = sample(emojis(k), 2);
    // You also "play" instruments, so play and music are never each other's foil.
    const clash = { play: "music", music: "play" }[CATS[k].use];
    const foils = sample(Object.keys(USES), 2, [CATS[k].use, clash]).map((u) => USES[u]);
    const { choices, answer } = mix(USES[CATS[k].use], foils);
    const words = choices.map((c) => c.label);
    const prompt = `The ${NAME[x]} and the ${NAME[y]} are both things you…`;
    add("verbal", "similarities", [6, 7], 6.6, {
      prompt, say: `${prompt.slice(0, -1)} ${words.slice(0, -1).join(", ")}, or ${words.at(-1)}?`,
      visual: [x, y], choices, answer,
    });
  }

  const PAIRS = [["🧦", "👟"], ["🔒", "🔑"], ["🥣", "🥄"], ["🐝", "🍯"], ["🐶", "🦴"], ["🐰", "🥕"], ["🐵", "🍌"],
    ["🪥", "🦷"], ["🌧️", "☂️"], ["🎂", "🕯️"], ["🐄", "🥛"], ["🐔", "🥚"], ["🐟", "🎣"], ["✏️", "📝"], ["🖌️", "🎨"],
    ["🚗", "⛽"], ["⛵", "🌊"], ["🌱", "💧"]];
  const THINGS = foilsFrom(["toy", "instrument", "tool", "vehicle", "clothes"]);
  for (const [a, b] of PAIRS) {
    const own = ALL.filter((it) => it.e === a || it.e === b).map((it) => it.k);
    const foils = THINGS.filter((e) => !own.some((k) => emojis(k).includes(e)));
    for (let v = 0; v < 2; v++) {
      add("verbal", "goes-together", [4, 5], 4.3, {
        prompt: "Which one goes with this?", visual: [a, "➕", "?"], ...mix(b, sample(foils, 2)),
      });
    }
  }

  // ── Visual-spatial: size, shape, orientation, shadows, block design ──

  for (const e of SIZE_POOL) {
    const easy = [sized(e, 0.6), sized(e, 0.95), sized(e, 1.4)];
    add("spatial", "size", [3, 4], 3.3, { prompt: "Which one is the BIGGEST?", ...mix(easy[2], easy.slice(0, 2)) });
    add("spatial", "size", [3, 4], 3.3, { prompt: "Which one is the SMALLEST?", ...mix(easy[0], easy.slice(1)) });
    const close = [0.8, 0.95, 1.1, 1.25].map((s) => sized(e, s));
    add("spatial", "size-close", [5, 6], 5.3, { prompt: "Which one is the BIGGEST?", ...mix(close[3], close.slice(0, 3)) });
    add("spatial", "size-close", [5, 6], 5.3, { prompt: "Which one is the SMALLEST?", ...mix(close[0], close.slice(1)) });
  }

  const SHAPES = ["circle", "square", "triangle", "house", "star"];
  const COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"];
  for (let i = 0; i < 40; i++) {
    const [s, o1, o2] = sample(SHAPES, 3);
    const [c1, c2, c3, c4] = sample(COLORS, 4);
    add("spatial", "same-shape", [3, 4], 3.5, {
      prompt: "Which one is the same shape?", visual: [shape(s, c1)], ...mix(shape(s, c2), [shape(o1, c3), shape(o2, c4)]),
    });
    // Harder: the wrong shapes share the target's colour.
    add("spatial", "same-shape-color-lure", [4, 5], 4.2, {
      prompt: "Which one is the same SHAPE?", visual: [shape(s, c1)], ...mix(shape(s, c2), [shape(o1, c1), shape(o2, c1)]),
    });
  }

  for (let i = 0; i < 40; i++) {
    const s = pick(["triangle", "house", "star"]);
    const c = pick(COLORS);
    const others = sample(SHAPES, 2, [s]).map((o) => shape(o, c, pick([0, 90, 180])));
    add("spatial", "turned-shape", [4, 5], 4.5, {
      prompt: "Which shape is the same, just turned?", visual: [shape(s, c)], ...mix(shape(s, c, pick([90, 180, 270])), others),
    });
  }

  for (const e of UPRIGHT) {
    add("spatial", "upside-down", [3, 4], 3.6, { prompt: "Which one is upside down?", ...mix(turned(e, 180), [e, e]) });
    add("spatial", "upside-down-sideways", [4, 5], 4.4, {
      prompt: "Which one is upside down?", ...mix(turned(e, 180), [e, turned(e, pick([90, 270]))]),
    });
  }

  for (const e of FACING) {
    add("spatial", "facing", [5, 6], 5.0, { prompt: "Which one is facing the other way?", ...mix({ e, flip: true }, [e, e, e]) });
  }

  const SHADOW_EASY = [["🐘", "elephant"], ["🦒", "giraffe"], ["🐇", "rabbit"], ["🐈", "cat"], ["🐟", "fish"], ["🦋", "butterfly"],
    ["🌳", "tree"], ["🏠", "house"], ["✈️", "airplane"], ["🚲", "bike"], ["☂️", "umbrella"], ["🎸", "guitar"], ["🦕", "dinosaur"],
    ["🐌", "snail"], ["⭐", "star"], ["🍐", "pear"], ["🔑", "key"], ["⛵", "sailboat"], ["🦆", "duck"], ["🐢", "turtle"]];
  for (const [e, name] of SHADOW_EASY) {
    for (let v = 0; v < 2; v++) {
      add("spatial", "shadow", [4, 5], 4.4, {
        prompt: `Which shadow belongs to the ${name}?`, visual: [e],
        ...mix(shadow(e), sample(SHADOW_EASY.map(([o]) => o), 2, [e]).map(shadow)),
      });
    }
  }
  // Look-alike shapes for the hard version.
  const SHADOW_GROUPS = [
    [["🐕", "dog"], ["🐈", "cat"], ["🐿️", "squirrel"], ["🐇", "rabbit"]],
    [["🐘", "elephant"], ["🦏", "rhino"], ["🦛", "hippo"], ["🐃", "buffalo"]],
    [["🦒", "giraffe"], ["🦕", "dinosaur"], ["🐪", "camel"], ["🦘", "kangaroo"]],
    [["🐓", "rooster"], ["🦆", "duck"], ["🦢", "swan"], ["🦩", "flamingo"]],
    [["🚗", "car"], ["🚌", "bus"], ["🚚", "truck"], ["🚜", "tractor"]],
    [["✈️", "airplane"], ["🚁", "helicopter"], ["🚀", "rocket"], ["🛸", "flying saucer"]],
    [["🍎", "apple"], ["🍐", "pear"], ["🍋", "lemon"], ["🍓", "strawberry"]],
  ];
  for (const group of SHADOW_GROUPS) {
    for (const [e, name] of group) {
      add("spatial", "shadow-hard", [6, 7], 6.2, {
        prompt: `Which shadow belongs to the ${name}?`, visual: [e],
        ...mix(shadow(e), sample(group.map(([o]) => o), 2, [e]).map(shadow)),
      });
    }
  }

  // Block patterns (codes as in questions.js). Mirror and rotate one cell:
  const LR = { R: "R", W: "W", a: "b", b: "a", c: "d", d: "c" };
  const TB = { R: "R", W: "W", a: "d", d: "a", b: "c", c: "b" };
  const ROT = { R: "R", W: "W", a: "b", b: "c", c: "d", d: "a" }; // 90° clockwise
  const HALVES = ["a", "b", "c", "d"];
  const CODES = ["R", "W", ...HALVES];
  const side = (g) => Math.sqrt(g.length);
  // Whole-pattern transforms on code strings, row by row.
  const rot90 = (g) => range(0, g.length - 1).map((i) => {
    const n = side(g), r = Math.floor(i / n), c = i % n;
    return ROT[g[(n - 1 - c) * n + r]];
  }).join("");
  const mirrorLR = (g) => range(0, g.length - 1).map((i) => {
    const n = side(g), r = Math.floor(i / n), c = i % n;
    return LR[g[r * n + n - 1 - c]];
  }).join("");
  const mirrorTB = (g) => range(0, g.length - 1).map((i) => {
    const n = side(g), r = Math.floor(i / n), c = i % n;
    return TB[g[(n - 1 - r) * n + c]];
  }).join("");
  const rotations = (g) => [g, rot90(g), rot90(rot90(g)), rot90(rot90(rot90(g)))];
  const symmetric = (g) => mirrorLR(g) === g || mirrorTB(g) === g || rotations(g).slice(1).includes(g);
  const randomPattern = (n, codes) => range(1, n * n).map(() => pick(codes)).join("");
  const changeOne = (g, codes) => {
    const i = randInt(g.length);
    return g.slice(0, i) + pick(codes.filter((c) => c !== g[i])) + g.slice(i + 1);
  };

  function addSamePattern(kind, ages, level, n, codes, count) {
    for (let made = 0; made < count; ) {
      const g = randomPattern(n, codes);
      if (new Set(g).size < 2) continue;
      const foils = new Set();
      while (foils.size < 2) foils.add(changeOne(g, codes));
      add("spatial", kind, ages, level, {
        prompt: "Which one looks exactly the same?", visual: [blocks(g)], ...mix(blocks(g), [...foils].map((f) => blocks(f))),
      });
      made++;
    }
  }
  addSamePattern("same-pattern", [4, 5], 4.5, 2, ["R", "W"], 30);
  addSamePattern("same-pattern-halves", [5, 6], 5.3, 2, CODES, 50);
  addSamePattern("same-pattern-3x3", [6, 7], 6.3, 3, CODES, 40);

  // Missing piece of a symmetric pattern. Wrong pieces must not make it symmetric.
  function addMissingPiece(kind, ages, level, makePattern, count) {
    for (let made = 0; made < count; ) {
      const g = makePattern();
      if (!/[abcd]/.test(g) || new Set(g).size < 2) continue;
      const hole = randInt(g.length);
      const withPiece = (code) => g.slice(0, hole) + code + g.slice(hole + 1);
      const wrong = CODES.filter((c) => c !== g[hole] && !symmetric(withPiece(c)));
      if (wrong.length < 2) continue;
      add("spatial", kind, ages, level, {
        prompt: "Which piece fills the hole?", visual: [blocks(withPiece("?"))],
        ...mix(blocks(g[hole]), sample(wrong, 2).map((c) => blocks(c))),
      });
      made++;
    }
  }
  addMissingPiece("missing-piece", [5, 6], 5.6, () => {
    const [x, y] = [pick(CODES), pick(CODES)];
    const turn = (c, k) => (k ? turn(ROT[c], k - 1) : c);
    return pick([
      () => x + LR[x] + y + LR[y], // left-right mirror
      () => x + y + TB[x] + TB[y], // top-bottom mirror
      () => x + turn(x, 1) + turn(x, 3) + turn(x, 2), // pinwheel
    ])();
  }, 50);
  addMissingPiece("missing-piece-3x3", [6, 7], 6.5, () => {
    const [x, y, z] = [pick(HALVES), pick(CODES), pick(["R", "W"])];
    if (rand() < 0.5) {
      // Mirror on both axes: corners mirror x, edges and centre are solid.
      const [t, l] = [pick(["R", "W"]), pick(["R", "W"])];
      return x + t + LR[x] + l + z + l + TB[x] + t + LR[TB[x]];
    }
    // Pinwheel: each corner/edge is the previous one turned 90°.
    const turn = (c, k) => (k ? turn(ROT[c], k - 1) : c);
    return x + y + turn(x, 1) + turn(y, 3) + z + turn(y, 1) + turn(x, 3) + turn(y, 2) + turn(x, 2);
  }, 50);

  // A pattern that looks different when mirrored and in each of its 4 turns.
  function chiralPattern() {
    for (;;) {
      const g = randomPattern(2, CODES);
      const rots = rotations(g);
      if (new Set(rots).size === 4 && !rots.includes(mirrorLR(g)) && /[abcd]/.test(g)) return g;
    }
  }
  const sameUpToTurn = (p, q) => rotations(p).includes(q) || rotations(mirrorLR(p)).includes(q);

  for (let i = 0; i < 50; i++) {
    const g = chiralPattern();
    let other;
    do other = randomPattern(2, CODES);
    while (sameUpToTurn(g, other) || new Set(other).size < 2);
    const rot = pick([90, 180, 270]);
    add("spatial", "rotation", [6, 7], 6.6, {
      prompt: "Which one is the same picture, just turned?", visual: [blocks(g)],
      ...mix(blocks(g, rot), [blocks(mirrorLR(g), rot), blocks(other, rot)]),
    });
  }

  for (let i = 0; i < 40; i++) {
    const g = chiralPattern();
    add("spatial", "mirror", [7, 7], 7.0, {
      prompt: "Which one is what you'd see in a mirror?", visual: [blocks(g), "🪞"],
      ...mix(blocks(mirrorLR(g)), [blocks(g), blocks(rot90(rot90(g)))]),
    });
  }

  // ── Working memory: pictures, locations, order ──

  const location = (n, placed) => {
    const cells = Array(n * n).fill("");
    placed.forEach(([e, pos]) => (cells[pos] = e));
    return cells;
  };
  function addLocation(kind, ages, level, n, animals, ms, count) {
    for (let i = 0; i < count; i++) {
      const who = sample(ANIMALS, animals);
      const spots = sample(range(0, n * n - 1), animals);
      const ask = randInt(animals);
      add("memory", kind, ages, level, {
        type: "memory", studyGrid: n, study: location(n, who.map((e, j) => [e, spots[j]])), studyMs: ms,
        prompt: `Where was the ${NAME[who[ask]]}?`, choiceGrid: n, choices: Array(n * n).fill(""), answer: spots[ask],
      });
    }
  }
  addLocation("location-2x2", [3, 4], 3.6, 2, 1, 3500, 40);
  addLocation("location-2x2-two", [4, 5], 4.6, 2, 2, 4000, 40);
  addLocation("location-3x3-two", [5, 7], 5.8, 3, 2, 5000, 40);
  addLocation("location-3x3-three", [7, 7], 7.0, 3, 3, 6000, 40);

  const ALL_EMOJI = ALL.map((it) => it.e);
  for (let i = 0; i < 80; i++) {
    const it = pick(ALL);
    add("memory", "recall-1", [3, 4], 3.3, {
      type: "memory", study: [it.e], studyMs: 3000,
      prompt: "Which one did you see?", ...mix(it.e, sample(emojis(it.k), 2, [it.e])),
    });
  }

  function addRecallAll(kind, ages, level, shown, wrong, ms, count) {
    for (let i = 0; i < count; i++) {
      const pics = sample(ALL_EMOJI, shown + wrong);
      add("memory", kind, ages, level, {
        type: "memory", study: pics.slice(0, shown), studyMs: ms,
        prompt: `Tap ${shown === 2 ? "BOTH" : `ALL ${shown}`} pictures you saw.`,
        ...mixAll(pics.slice(0, shown), pics.slice(shown)),
      });
    }
  }
  addRecallAll("recall-2", [4, 5], 4.5, 2, 2, 4000, 50);
  addRecallAll("recall-3", [5, 6], 5.5, 3, 3, 5000, 50);
  addRecallAll("recall-4", [6, 7], 6.7, 4, 4, 6000, 40);

  for (let i = 0; i < 40; i++) {
    const [x, y, z] = sample(ALL_EMOJI, 3);
    add("memory", "middle", [6, 7], 6.2, {
      type: "memory", study: [x, y, z], studyMs: 4000, prompt: "Which one was in the MIDDLE?", ...mix(y, [x, z]),
    });
  }

  for (let i = 0; i < 40; i++) {
    const pics = sample(ALL_EMOJI, 4);
    add("memory", "not-seen", [6, 7], 6.4, {
      type: "memory", study: pics.slice(0, 3), studyMs: 5000, prompt: "Which one did you NOT see?", ...mix(pics[3], pics.slice(0, 3)),
    });
  }

  for (let i = 0; i < 40; i++) {
    const pics = sample(ALL_EMOJI, 4);
    const at = randInt(3);
    add("memory", "order-after", [7, 7], 7.0, {
      type: "memory", study: pics, studyMs: 5000,
      prompt: `What came right AFTER the ${NAME[pics[at]]}?`, ...mix(pics[at + 1], sample(pics, 2, [pics[at + 1]])),
    });
  }

  // ── Processing speed: timed cancellation ──

  // Look-alike sets: [emoji, plural name]
  const SPEED_SETS = [
    [["🐞", "ladybugs"], ["🐜", "ants"], ["🦋", "butterflies"], ["🐛", "caterpillars"], ["🕷️", "spiders"], ["🐝", "bees"]],
    [["🍎", "apples"], ["🍅", "tomatoes"], ["🍒", "cherries"], ["🍓", "strawberries"]],
    [["🐟", "blue fish"], ["🐠", "striped fish"], ["🐡", "puffer fish"], ["🦈", "sharks"], ["🐬", "dolphins"]],
    [["🔴", "red circles"], ["🟠", "orange circles"], ["🟡", "yellow circles"], ["🟢", "green circles"], ["🔵", "blue circles"],
      ["🟣", "purple circles"]],
    [["🟥", "red squares"], ["🟦", "blue squares"], ["🟩", "green squares"], ["🟨", "yellow squares"]],
    [["⭐", "stars"], ["🌙", "moons"], ["☀️", "suns"], ["☁️", "clouds"]],
    [["🚗", "red cars"], ["🚌", "buses"], ["🚕", "taxis"], ["🚓", "police cars"]],
    [["⚽", "soccer balls"], ["🏀", "basketballs"], ["🏈", "footballs"], ["⚾", "baseballs"], ["🎾", "tennis balls"]],
    [["🐶", "dogs"], ["🐱", "cats"], ["🐭", "mice"], ["🐹", "hamsters"], ["🐰", "bunnies"]],
    [["❤️", "red hearts"], ["💙", "blue hearts"], ["💚", "green hearts"], ["💛", "yellow hearts"], ["💜", "purple hearts"]],
  ];
  SPEED_SETS.forEach((set, s) => {
    const elsewhere = SPEED_SETS.filter((_, o) => o !== s).flat().map(([e]) => e);
    for (const [target, plural] of set) {
      const alike = set.map(([e]) => e).filter((e) => e !== target);
      const item = (distractors, cells, targets, seconds) => ({
        type: "speed", prompt: `Tap all the ${target} as fast as you can!`, say: `Tap all the ${plural} as fast as you can!`,
        target, distractors, cells, targets, seconds,
      });
      add("speed", "speed-easy", [4, 5], 4.5, item(sample(elsewhere, 2), 12, 4, 30));
      add("speed", "speed-alike", [5, 6], 5.5, item(sample(alike, 3), 16, 5, 30));
      add("speed", "speed-hard", [6, 7], 6.5, item(sample(alike, 4), 20, 6, 25));
    }
  });

  // ── Quantitative reasoning: counting, comparing, adding, number sense ──

  for (const [e, one, many] of COUNT) {
    for (const n of range(1, 5)) {
      const options = [n - 1, n + 1, n + 2].filter((m) => m >= 1).slice(0, 2);
      add("quant", n <= 3 ? "which-has-n" : "which-has-n-big", n <= 3 ? [3, 4] : [3, 5], n <= 3 ? 3.1 : 4.0, {
        prompt: `Which picture has ${n} ${n === 1 ? one : many}?`, ...mix(rep(e, n), options.map((m) => rep(e, m))),
      });
    }
  }

  function addCompare(kind, ages, level, word, counts) {
    for (const [e] of COUNT) {
      const [a, b, c] = counts();
      const right = word === "MORE" ? Math.max(a, b, c) : Math.min(a, b, c);
      add("quant", kind, ages, level, {
        prompt: `Which group has ${word}?`, ...mix(rep(e, right), [a, b, c].filter((x) => x !== right).map((x) => rep(e, x))),
      });
    }
  }
  const spread = () => sample([1, 3, 6], 3); // easy: big gaps
  const near = () => { const s = 3 + randInt(3); return sample([s, s + 1, s + 2], 3); }; // hard: off by one
  addCompare("more", [3, 4], 3.5, "MORE", spread);
  addCompare("fewer", [4, 5], 4.2, "FEWER", spread);
  addCompare("more-close", [5, 6], 5.2, "MORE", near);
  addCompare("fewer-close", [5, 6], 5.4, "FEWER", near);

  for (const [e, , many] of COUNT) {
    for (const n of range(2, 10)) {
      const [ages, level, kind] = n <= 4 ? [[3, 4], 3.4, "count"] : n <= 7 ? [[4, 6], 4.8, "count-7"] : [[6, 7], 6.0, "count-10"];
      add("quant", kind, ages, level, { prompt: `How many ${many}?`, visual: Array(n).fill(e), ...mixNums(n, [n - 1, n + 1]) });
    }
  }

  for (let i = 0; i < 60; i++) {
    const [e, , many] = pick(COUNT);
    const big = i % 2 === 1;
    const a = 1 + randInt(big ? 5 : 3);
    const b = big ? 6 - a + randInt(4) : 1 + randInt(Math.min(2, 4 - a)); // sums 6–9 or 2–5
    const sum = a + b;
    add("quant", big ? "add-10" : "add-5", big ? [6, 7] : [4, 5], big ? 6.3 : 4.6, {
      prompt: `How many ${many} in all?`, visual: [rep(e, a), "➕", rep(e, b)], ...mixNums(sum, [sum - 1, sum + 1]),
    });
  }

  for (let i = 0; i < 50; i++) {
    const [e, , many] = pick(COUNT);
    const big = i % 2 === 1;
    const n = big ? 6 + randInt(4) : 3 + randInt(3);
    const k = big ? 2 + randInt(3) : 1 + randInt(2);
    const left = n - k;
    add("quant", big ? "take-away-10" : "take-away-5", big ? [6, 7] : [5, 6], big ? 6.6 : 5.5, {
      prompt: `You have ${n} ${many} and give away ${k}. How many are left?`, visual: Array(n).fill(e),
      ...mixNums(left, [left + 1, left - 1, left + 2]),
    });
  }

  // Number sequences: [kind, ages, level, step, starts]
  const SEQUENCES = [
    ["count-on", [5, 6], 5.6, 1, range(1, 7)],
    ["count-by-2", [6, 7], 6.4, 2, range(0, 8)],
    ["count-down", [6, 7], 6.5, -1, range(6, 12)],
    ["count-by-5", [7, 7], 7.0, 5, [0, 5, 10, 15, 20]],
    ["count-by-10", [7, 7], 7.0, 10, [0, 10, 20, 30, 40]],
  ];
  for (const [kind, ages, level, step, starts] of SEQUENCES) {
    for (const s of starts) {
      const seq = [s, s + step, s + 2 * step];
      const right = s + 3 * step;
      const wrongs = Math.abs(step) >= 5 ? [right + step, right + 1] : [right + 1, right - 1, right + 2];
      add("quant", kind, ages, level, { prompt: "What number comes next?", visual: [...seq.map(String), "?"], ...mixNums(right, wrongs) });
    }
  }

  for (const n of range(1, 9)) {
    add("quant", "after", [5, 6], 5.2, { prompt: `Which number comes right after ${n}?`, ...mixNums(n + 1, [n, n + 2]) });
  }
  for (const n of range(3, 20)) {
    add("quant", "before", [6, 7], 6.2, { prompt: `Which number comes right before ${n}?`, ...mixNums(n - 1, [n + 1, n - 2]) });
  }

  for (let i = 0; i < 40; i++) {
    const nums = sample(range(1, 20), 3);
    const big = i % 2 === 0;
    const right = big ? Math.max(...nums) : Math.min(...nums);
    add("quant", "compare-numbers", [6, 7], 6.5, {
      prompt: `Which number is the ${big ? "BIGGEST" : "SMALLEST"}?`, ...mix(String(right), nums.filter((n) => n !== right).map(String)),
    });
  }
  for (let i = 0; i < 30; i++) {
    // Same digits swapped (like 12 and 21) plus one more number.
    const [d1, d2] = sample(range(1, 9), 2).sort((a, b) => a - b);
    const hi = d2 * 10 + d1, lo = d1 * 10 + d2;
    const third = pick(range(lo + 1, hi - 1).filter((n) => n % 10 !== 0)) ?? lo - 1;
    add("quant", "compare-swapped", [7, 7], 7.0, {
      prompt: "Which number is the BIGGEST?", ...mix(String(hi), [String(lo), String(third)]),
    });
  }

  const BIG_ANIMALS = ["🐘", "🦒", "🐻", "🐴"];
  const SMALL_ANIMALS = ["🐭", "🐞", "🐜", "🐤"];
  for (let i = 0; i < 30; i++) {
    const [b, s] = [pick(BIG_ANIMALS), pick(SMALL_ANIMALS)];
    // Size is the lure: sometimes the big animals are more, sometimes fewer.
    const [nb, ns] = rand() < 0.6 ? [2 + randInt(2), 4 + randInt(2)] : [4 + randInt(2), 2 + randInt(2)];
    const bigGroup = sized(rep(b, nb), 1.3), smallGroup = sized(rep(s, ns), 0.6);
    add("quant", "more-despite-size", [5, 6], 5.6, {
      prompt: "Which group has MORE animals?", ...(ns > nb ? mix(smallGroup, [bigGroup]) : mix(bigGroup, [smallGroup])),
    });
  }

  for (let i = 0; i < 40; i++) {
    const [e, , many] = pick(COUNT);
    const n = 4 + randInt(4), k = 1 + randInt(3), m = 1 + randInt(3);
    const right = n - k + m;
    add("quant", "two-step-story", [7, 7], 7.0, {
      prompt: `${n} ${many}. ${k} go away, then ${m} more come. How many ${many} now?`,
      visual: Array(n).fill(e), ...mixNums(right, [right - 1, right + 1]),
    });
  }
})();
