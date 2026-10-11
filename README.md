# Little Thinkers – Brain Games (Ages 3–7)

A playful, tablet-friendly reasoning game for preschoolers. No build step — open `index.html` in a browser.

## Structure
```
kids_iq_test/
├── index.html        # Screens: start (name + age) → quiz → result
├── css/style.css     # Big, touch-friendly kid UI
└── js/
    ├── questions.js  # Domains + question bank (edit/add questions here)
    └── app.js        # Game flow, scoring, timers, text-to-speech
```

## Domains
Modelled on the WPPSI-IV primary indexes plus Stanford-Binet 5 quantitative reasoning.
All items are original — none are copied from a published test.

| Domain | Mirrors | Item types |
|---|---|---|
| 🧩 Reasoning | Fluid Reasoning (Matrix Reasoning, Picture Concepts) | patterns, 2×2/3×3 matrices, "goes with", odd one out |
| 💬 Words & Knowledge | Verbal Comprehension | picture vocabulary, information, comprehension, opposites, similarities, analogies |
| 🔷 Shapes & Space | Visual Spatial (Block Design, Object Assembly) | true-size comparison, shape match, rotation, shadows, block patterns, missing piece, mirror |
| 🧠 Memory | Working Memory (Picture Memory, Zoo Locations) | recall 1–4 pictures, grid locations, sequence order |
| ⚡ Speed | Processing Speed (Cancellation) | timed tap-all-targets (ages 4+) |
| 🔢 Numbers | SB5 Quantitative Reasoning | counting, more/fewer, add/subtract, number patterns |

## Age selection
The child picks an age (3–7) on the start screen; only items whose `ages: [min, max]` range
includes that age are used, grouped by domain, easy → hard (18 items at age 3, 25–27 at ages 4–7).

## Notes
- Prompts are read aloud (Web Speech API) since most young children can't read yet.
- Wrong answers let the child retry; only first-try answers count toward stars.
- A domain stops early after 2 first-try misses in a row, like a real test's discontinue rule.
- This is a practice/enrichment game, **not** a clinical IQ assessment — there are no norms.
