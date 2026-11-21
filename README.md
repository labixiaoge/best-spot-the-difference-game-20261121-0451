# 双灯谜市 · Twin Lanterns — Spot the Difference
[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/labixiaoge/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/labixiaoge/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

[![make.fun](https://img.shields.io/badge/make.fun-bounty-7c5cff)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22.18-brightgreen)](https://nodejs.org/)

## About

**双灯谜市 (Twin Lanterns)** is a spot-the-difference game built for the
[make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451):
two near-identical pictures side by side, seven differences hidden between
them, and a clock ticking down. Find them all to clear the picture pair.

Three original scenes, all drawn in code with canvas paths — no images, no
borrowed art, no network requests:

1. **灯笼夜市 · Lantern Night Market** — a lantern-lit market street under a
   cratered moon, with a cat watching from the cobblestones.
2. **渔港黎明 · Harbour Dawn** — a fishing harbour at sunrise, with a
   lighthouse, a sailboat and gulls over the sea.
3. **月下花园 · Moonlit Garden** — a moonlit garden with a pond, an arched
   bridge, a stone lantern and fireflies.

## How to play

- **Click** (or tap) a difference on either picture: a gold ring and check
  mark appear, +100 points.
- A wrong click costs 25 points and leaves a red X where you clicked.
- **H** spends 50 points on a hint: a pulsing ring points at one difference
  you have not found yet (3 hints per picture pair).
- Each picture pair gives you **2:30** on the clock; time left becomes a
  bonus when you clear the pair. Find all 7 differences in all 3 pairs to
  win.
- **P** pauses, **M** mutes the sounds, **R** restarts, **1 / 2 / 3** jump
  to a picture pair, **Enter** starts. The best score is kept in the browser.

## Run it

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

Open `game/index.html` in desktop Chrome. No build step, no dependencies,
no network request: every file the game loads lives under `game/`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored `vendor/makefun-game.ts` library.

## Layout

| File | Job |
| --- | --- |
| `game/index.html` | The page: one canvas, one status line, nothing else |
| `game/src/main.js` | Boot and the one game loop |
| `game/src/config.js` | Canvas size, panels, timer, scoring, keys |
| `game/src/random.js` | Seeded random numbers, so both pictures agree |
| `game/src/diffs.js` | The three picture pairs and their 7 differences each |
| `game/src/scenes.js` | The three pictures, painted twice from the same code |
| `game/src/world.js` | The rules: clicks, hints, clock, scoring, win and loss |
| `game/src/input.js` | Mouse, touch and keyboard input |
| `game/src/render.js` | The top bar, the pictures, the markers, every screen |
| `game/src/audio.js` | Sounds from the Web Audio API, no audio files |
| `game/src/shots.js` | The four screenshot scenes behind `?shot=` |
| `main.ts` | Hands the game in: copies the game, writes the dossier |
| `serve.ts` | A tiny static server for local play-testing |
| `vendor/makefun-game.ts` | The kit's library, unchanged |

## License

MIT — see [LICENSE](LICENSE).
