// Boot and the one loop: input is read as it arrives, the clock advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between title, play, paused, level-clear, game-over and win screens.
//
// ?seed=N fixes nothing random the player sees (the pictures are seeded by
// the level), but ?shot=start|play|garden|win stages that scene instead of
// running the loop, paints it twice and sets window.__shotReady for a
// screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createWorld, startGame, startLevel, clickAt, useHint, nextLevel, pauseGame, resumeGame, tick, STATUS_TITLE, STATUS_PLAY, STATUS_PAUSED, STATUS_LEVEL_CLEAR, STATUS_OVER, STATUS_WIN } from './world.js';
import { createInput, ACTION_START, ACTION_PAUSE, ACTION_HINT, ACTION_MUTE, ACTION_RESTART, ACTION_LEVEL } from './input.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_LEVEL_CLEAR, SCREEN_OVER, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';
import { unlockAudio, toggleMute, playFound, playMiss, playHint, playClick, playLevelClear, playWin } from './audio.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createWorld();
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

state.best = readBest();

function screenFor(state) {
  if (state.status === STATUS_TITLE) return SCREEN_TITLE;
  if (state.status === STATUS_PAUSED) return SCREEN_PAUSED;
  if (state.status === STATUS_LEVEL_CLEAR) return SCREEN_LEVEL_CLEAR;
  if (state.status === STATUS_OVER) return SCREEN_OVER;
  if (state.status === STATUS_WIN) return SCREEN_WIN;
  return SCREEN_PLAY;
}

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const scene = stageShot(name, state);
  let painted = 0;
  function paint() {
    renderer.draw(state, scene.screen, state.elapsed);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let accumulator = 0;
  let last = performance.now();

  function start() {
    unlockAudio();
    playClick();
    if (state.status === STATUS_TITLE || state.status === STATUS_OVER) {
      startGame(state);
      screen = SCREEN_PLAY;
      announce(`Playing. Find 7 differences in ${currentLevelName()}.`);
    } else if (state.status === STATUS_LEVEL_CLEAR) {
      nextLevel(state);
      screen = SCREEN_PLAY;
      announce(`Playing. Find 7 differences in ${currentLevelName()}.`);
    } else if (state.status === STATUS_WIN) {
      startGame(state);
      screen = SCREEN_PLAY;
      announce('Playing again from the first picture pair.');
    } else if (state.status === STATUS_PAUSED) {
      resumeGame(state);
      screen = SCREEN_PLAY;
    }
  }

  function currentLevelName() {
    return ['灯笼夜市', '渔港黎明', '月下花园'][state.levelIndex];
  }

  function onClick(panel, x, y) {
    if (state.status !== STATUS_PLAY) {
      start();
      return;
    }
    unlockAudio();
    const outcome = clickAt(state, x, y, panel);
    if (outcome.result === 'found') {
      playFound();
      announce(`Found: ${outcome.diff.name}. ${7 - state.found.size} left.`);
      if (state.status === STATUS_WIN) {
        playWin();
        saveBest(state.best);
        announce(`You found them all! Total score ${state.score}.`);
      } else if (state.status === STATUS_LEVEL_CLEAR) {
        playLevelClear();
        announce(`Picture pair cleared! Time bonus ${state.levelBonus}.`);
      }
      screen = screenFor(state);
    } else if (outcome.result === 'miss') {
      playMiss();
      announce('Nothing different there. Minus 25 points.');
    }
  }

  function onAction(action, value) {
    if (action === ACTION_START) {
      if (state.status === STATUS_PLAY) return;
      start();
    } else if (action === ACTION_PAUSE) {
      if (state.status === STATUS_PLAY) {
        pauseGame(state);
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (state.status === STATUS_PAUSED) {
        resumeGame(state);
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    } else if (action === ACTION_HINT) {
      if (state.status !== STATUS_PLAY) return;
      const index = useHint(state);
      if (index !== -1) {
        playHint();
        announce('Hint: look at the pulsing ring.');
      }
    } else if (action === ACTION_MUTE) {
      const muted = toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    } else if (action === ACTION_RESTART) {
      unlockAudio();
      playClick();
      startGame(state);
      screen = SCREEN_PLAY;
      announce('Playing again from the first picture pair.');
    } else if (action === ACTION_LEVEL) {
      if (value >= 0 && value < 3) {
        unlockAudio();
        startLevel(state, value);
        screen = SCREEN_PLAY;
        announce(`Playing. Find 7 differences in ${currentLevelName()}.`);
      }
    }
  }

  createInput(canvas, onClick, onAction);

  function frame(now) {
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    while (accumulator >= STEP) {
      tick(state, STEP);
      accumulator -= STEP;
    }
    if (state.status === STATUS_OVER) screen = SCREEN_OVER;
    renderer.draw(state, screen, state.elapsed);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
