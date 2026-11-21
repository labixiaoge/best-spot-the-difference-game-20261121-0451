// The rules of the hunt, with no drawing and no DOM in them, so the logic
// can be tested on its own: click a picture, find a difference, beat the
// clock, clear all three picture pairs.
import { LEVELS, DIFF_COUNT } from './diffs.js';
import {
  TIME_PER_LEVEL,
  HINTS_PER_LEVEL,
  POINTS_FOUND,
  POINTS_HINT,
  POINTS_MISS,
  TIME_BONUS_PER_SECOND,
} from './config.js';

export const STATUS_TITLE = 'title';
export const STATUS_PLAY = 'play';
export const STATUS_PAUSED = 'paused';
export const STATUS_LEVEL_CLEAR = 'levelClear';
export const STATUS_OVER = 'over';
export const STATUS_WIN = 'win';

export function createWorld() {
  return {
    status: STATUS_TITLE,
    levelIndex: 0,
    found: new Set(), // indexes into the current level's diffs
    misses: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintIndex: -1, // the difference a hint is pointing at, or -1
    hintShownAt: 0, // seconds the current hint has been visible
    timeLeft: TIME_PER_LEVEL,
    score: 0,
    best: 0,
    levelBonus: 0,
    lastFound: -1, // the difference found most recently, for the sparkle
    lastFoundAt: 0,
    wrongAt: null, // { x, y, at } of the latest wrong click, for the red X
    elapsed: 0,
  };
}

export function currentLevel(state) {
  return LEVELS[state.levelIndex];
}

export function remaining(state) {
  return DIFF_COUNT - state.found.size;
}

export function startLevel(state, index) {
  state.levelIndex = index;
  state.found = new Set();
  state.misses = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintIndex = -1;
  state.timeLeft = TIME_PER_LEVEL;
  state.levelBonus = 0;
  state.lastFound = -1;
  state.wrongAt = null;
  state.status = STATUS_PLAY;
}

export function startGame(state) {
  state.score = 0;
  startLevel(state, 0);
}

/** A click at panel coordinates (x, y) on either picture. Returns what
 *  happened: 'found' with the difference index, 'already' for a spot already
 *  circled, or 'miss' for empty picture. */
export function clickAt(state, x, y, panel = 0) {
  if (state.status !== STATUS_PLAY) return { result: 'ignored' };
  const level = currentLevel(state);
  let bestIndex = -1;
  let bestDistance = Infinity;
  level.diffs.forEach((diff, index) => {
    const distance = Math.hypot(x - diff.x, y - diff.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  const diff = level.diffs[bestIndex];
  if (bestDistance <= diff.r) {
    if (state.found.has(bestIndex)) return { result: 'already', index: bestIndex };
    state.found.add(bestIndex);
    state.lastFound = bestIndex;
    state.lastFoundAt = state.elapsed;
    state.score += POINTS_FOUND;
    if (state.hintIndex === bestIndex) state.hintIndex = -1;
    if (state.found.size === DIFF_COUNT) {
      state.levelBonus = Math.ceil(state.timeLeft) * TIME_BONUS_PER_SECOND;
      state.score += state.levelBonus;
      state.status = state.levelIndex === LEVELS.length - 1 ? STATUS_WIN : STATUS_LEVEL_CLEAR;
      if (state.status === STATUS_WIN && state.score > state.best) state.best = state.score;
    }
    return { result: 'found', index: bestIndex, diff };
  }
  state.misses += 1;
  state.score = Math.max(0, state.score - POINTS_MISS);
  state.wrongAt = { x, y, panel, at: state.elapsed };
  return { result: 'miss' };
}

/** Point at one difference the player has not found yet. Costs points and
 *  only works while playing. Returns the difference index or -1. */
export function useHint(state) {
  if (state.status !== STATUS_PLAY || state.hintsLeft <= 0) return -1;
  const level = currentLevel(state);
  const unfound = level.diffs.map((diff, index) => index).filter((index) => !state.found.has(index));
  if (unfound.length === 0) return -1;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - POINTS_HINT);
  state.hintIndex = unfound[0];
  state.hintShownAt = state.elapsed;
  return state.hintIndex;
}

export function nextLevel(state) {
  if (state.levelIndex + 1 < LEVELS.length) startLevel(state, state.levelIndex + 1);
}

export function pauseGame(state) {
  if (state.status === STATUS_PLAY) state.status = STATUS_PAUSED;
}

export function resumeGame(state) {
  if (state.status === STATUS_PAUSED) state.status = STATUS_PLAY;
}

/** Advance the clock by dt seconds. Only the play screen runs the clock. */
export function tick(state, dt) {
  state.elapsed += dt;
  if (state.status !== STATUS_PLAY) return;
  state.timeLeft -= dt;
  if (state.hintIndex !== -1 && state.elapsed - state.hintShownAt > 2.5) state.hintIndex = -1;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.status = STATUS_OVER;
  }
}
