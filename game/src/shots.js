// The screenshot scenes behind ?shot=start|play|garden|win. Each one stages a
// real game state — a fresh title screen, a mid-hunt with three differences
// already circled and four still to find, the third picture pair mid-hunt,
// and the win screen — and the renderer paints it, so every screenshot is a
// frame the game itself can really show. The same seed always gives the same
// frame.
import { LEVELS } from './diffs.js';
import { startLevel, startGame, STATUS_TITLE, STATUS_WIN } from './world.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN } from './render.js';

// Mark a few differences as already found, as a player halfway through the
// level would have them.
function stageFound(state, indexes) {
  for (const index of indexes) state.found.add(index);
  state.score = indexes.length * 100;
  state.lastFound = indexes[indexes.length - 1];
  state.lastFoundAt = state.elapsed;
}

/**
 * Put `state` into the named scene and return the screen to draw over it.
 * Unknown names stage the title screen.
 */
export function stageShot(name, state) {
  state.best = 2100;
  if (name === 'play') {
    startLevel(state, 0);
    stageFound(state, [0, 2, 5]); // moon, awning, cat — three circled, four left
    state.timeLeft = 96;
    state.elapsed = 54;
    state.hintsLeft = 2;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'garden') {
    startLevel(state, 2);
    stageFound(state, [1, 4]); // lotus, firefly — two circled, five left
    state.timeLeft = 118;
    state.elapsed = 32;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'harbour') {
    startLevel(state, 1);
    stageFound(state, [2, 5]); // gull, crates — two circled, five left
    state.timeLeft = 104;
    state.elapsed = 46;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'win') {
    startGame(state);
    state.levelIndex = LEVELS.length - 1;
    state.found = new Set(LEVELS[2].diffs.map((diff, i) => i));
    state.score = 2700;
    state.best = 2700;
    state.status = STATUS_WIN;
    return { screen: SCREEN_WIN };
  }
  startLevel(state, 0);
  state.status = STATUS_TITLE;
  return { screen: SCREEN_TITLE };
}
