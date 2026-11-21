// Twin Lanterns: configuration. One place for every number the game tunes by:
// the canvas size, the two picture panels, the timer, the scoring and the keys.
export const VIEW = { width: 1280, height: 720 };

// The two pictures sit side by side under the top bar. Each panel is 600 wide;
// the 32-pixel gap between them is where the "VS" badge lives.
export const PANEL = { width: 600, height: 560, y: 88, gap: 32 };
export const LEFT_X = 24;
export const RIGHT_X = LEFT_X + PANEL.width + PANEL.gap;
export const HUD_HEIGHT = 72;

export const TIME_PER_LEVEL = 150; // seconds on the clock for each picture pair
export const HINTS_PER_LEVEL = 3;
export const POINTS_FOUND = 100;
export const POINTS_HINT = 50; // a hint costs this much score
export const POINTS_MISS = 25; // a wrong click costs this much score
export const TIME_BONUS_PER_SECOND = 2; // level-clear bonus per second left

export const BEST_KEY = 'twin-lanterns-best';

// The fixed step the clock advances by: 1/60 s, so the timer runs the same
// on every machine.
export const STEP = 1 / 60;

// Keys: H hints, M mutes, R restarts, P pauses, 1/2/3 jump to a picture pair,
// Enter starts, Esc pauses. Clicks and taps work on either picture.
export const KEY_HINT = 'h';
export const KEY_MUTE = 'm';
export const KEY_RESTART = 'r';
export const KEY_PAUSE = 'p';
export const KEY_START = 'Enter';
