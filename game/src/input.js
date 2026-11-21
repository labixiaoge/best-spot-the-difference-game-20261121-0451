// Mouse, touch and keyboard input. A click on either picture is translated
// into panel coordinates and handed to the world; keys map to the actions in
// config.js. One-shot key presses are reported once per press, held keys are
// not needed: this game is played one click at a time.
import { PANEL, LEFT_X, RIGHT_X } from './config.js';

export const ACTION_START = 'start';
export const ACTION_PAUSE = 'pause';
export const ACTION_HINT = 'hint';
export const ACTION_MUTE = 'mute';
export const ACTION_RESTART = 'restart';
export const ACTION_NEXT = 'next';
export const ACTION_LEVEL = 'level';

export function createInput(canvas, onClick, onAction) {
  const pressed = new Set();

  function panelFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
    if (x >= LEFT_X && x < LEFT_X + PANEL.width) {
      return { panel: 0, x: x - LEFT_X, y: y - PANEL.y };
    }
    if (x >= RIGHT_X && x < RIGHT_X + PANEL.width) {
      return { panel: 1, x: x - RIGHT_X, y: y - PANEL.y };
    }
    return null;
  }

  function handlePointer(event) {
    const hit = panelFromEvent(event);
    if (hit !== null) onClick(hit.panel, hit.x, hit.y);
  }

  function handleKey(event) {
    const key = event.key.toLowerCase();
    if (event.repeat) return;
    if (pressed.has(key)) return;
    pressed.add(key);
    if (key === 'enter' || key === ' ') onAction(ACTION_START);
    else if (key === 'h') onAction(ACTION_HINT);
    else if (key === 'm') onAction(ACTION_MUTE);
    else if (key === 'r') onAction(ACTION_RESTART);
    else if (key === 'p' || key === 'escape') onAction(ACTION_PAUSE);
    else if (key === '1' || key === '2' || key === '3') {
      onAction(ACTION_LEVEL, Number(key) - 1);
    }
  }

  function handleKeyUp(event) {
    pressed.delete(event.key.toLowerCase());
  }

  canvas.addEventListener('pointerdown', handlePointer);
  window.addEventListener('keydown', handleKey);
  window.addEventListener('keyup', handleKeyUp);

  return {
    destroy() {
      canvas.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    },
  };
}
