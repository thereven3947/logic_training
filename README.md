# Little Thinkers – Brain Games (Ages 3–7)

A playful, tablet-friendly reasoning game for preschoolers. No build step — open `index.html` in a browser.

## Structure
```
kids_iq_test/
├── index.html        # Screens: start (name + age) → quiz → result
├── css/style.css     # Big, touch-friendly kid UI
└── js/
    ├── questions.js  # Domains + ~70 hand-written questions (item format documented at the top)
    ├── bank.js       # Generates ~3,450 more questions from templates (seeded, same every load)
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

## Age selection and random questions
The child picks an age (3–7) on the start screen. The bank holds about 3,500 questions, with
roughly 50–490 per area for each age (Speed has the fewest). Each game draws a fresh random set (18 items at age 3,
25–27 at ages 4–7; see `ITEMS_PER_TEST` in `app.js`):
- Only items whose `ages: [min, max]` range includes the chosen age are used.
- Within each area, the age-matched pool is sorted by difficulty (`level`) and cut into bands.
  One item is picked from each band, so a game still runs easy → hard.
- Inside a band, the game prefers a puzzle type (`kind`) it hasn't used yet in that area.
- Answer choices are shuffled every time, so a remembered position doesn't help.

Two games at the same age typically share 0–3 items, which makes it hard to memorise answers.

## Where the questions come from (copyright)
- **Every item is original.** About 70 were written by hand. The rest are generated in `bank.js`
  by filling general puzzle templates with everyday things: counting, colour and shape
  patterns, "which one is a fruit", basic facts about animals and objects.
- **No published test was copied.** No items, pictures, wording or answer keys come from the
  WPPSI-IV, Stanford-Binet 5 or any other test. Their names are used only to describe which
  broad abilities each area is modelled on. WPPSI and Stanford-Binet are trademarks of their
  owners; this project is not affiliated with them.
- **Puzzle formats are general ideas.** Matrices, odd-one-out, "tap all the targets", and
  copying block patterns appear in countless puzzle books and textbooks. Copyright protects
  specific expression (the actual items, artwork and text), not the idea of a puzzle type.
- **Pictures are emoji drawn by the device's own font.** The app ships no image files. Shapes and
  block patterns are plain CSS.

This is a summary for transparency, not legal advice.

## Notes
- Prompts are read aloud (Web Speech API) since most young children can't read yet.
- Wrong answers let the child retry; only first-try answers count toward stars.
- A domain stops early after 2 first-try misses in a row, like a real test's discontinue rule.
- The result screen shows a **play score** (IQ-style, 70–130). It is *not* normed: 100 is pinned to an
  assumed 70% first-try rate, ±10 points per 10%, rounded to 5s (`playScore` in `app.js`). The screen says so.
- This is a practice/enrichment game, **not** a clinical IQ assessment — there are no norms.
