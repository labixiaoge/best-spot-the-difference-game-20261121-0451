// Everything the player sees: the top bar with the counter, the timer and the
// score, the two pictures side by side with their markers, and the title,
// pause, level-clear, game-over and win screens. The renderer only paints
// what the world already decided; it never changes the rules.
import { VIEW, PANEL, LEFT_X, RIGHT_X, HUD_HEIGHT, TIME_PER_LEVEL } from './config.js';
import { LEVELS } from './diffs.js';
import { currentLevel, remaining } from './world.js';
import { drawScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_CLEAR = 'levelClear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const FONT = '"PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", system-ui, sans-serif';
const SERIF = '"Noto Serif CJK SC", Georgia, serif';

function text(ctx, value, x, y, size, colour, align = 'left', weight = 600, font = FONT) {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

// A gold ring with a check mark: the satisfying mark on every found
// difference, drawn on both pictures at once.
function foundMark(ctx, x, y, radius, pulse) {
  const r = radius + pulse * 4;
  ctx.save();
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ff9f2e';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.38);
  ctx.lineTo(x + r * 0.5, y - r * 0.38);
  ctx.stroke();
}

function hintMark(ctx, x, y, radius, time) {
  const pulse = 1 + 0.18 * Math.sin(time * 6);
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#8fd8ff';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function wrongMark(ctx, x, y, age) {
  if (age > 0.9) return;
  const alpha = 1 - age / 0.9;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ff5a4e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const r = 14;
  ctx.beginPath();
  ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
  ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
  ctx.stroke();
  ctx.restore();
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(10, 10, 26, ${alpha})`;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function panelButton(ctx, x, y, width, height, label) {
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 10);
  ctx.fill();
  text(ctx, label, x + width / 2, y + height / 2 + 1, 20, '#2a1a08', 'center', 700);
}

export function createRenderer(canvas) {
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  const ctx = canvas.getContext('2d');

  function drawTopBar(state) {
    ctx.fillStyle = '#14102a';
    ctx.fillRect(0, 0, VIEW.width, HUD_HEIGHT);
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(0, HUD_HEIGHT - 3, VIEW.width, 3);
    text(ctx, '双灯谜市', 24, 30, 30, '#ffd76a', 'left', 800, SERIF);
    text(ctx, 'TWIN LANTERNS · 找不同', 24, 56, 13, '#b9b3d6', 'left', 500);
    const level = currentLevel(state);
    text(ctx, `第 ${state.levelIndex + 1} / 3 关 · ${level.name}`, 330, 30, 19, '#f2ead0', 'left', 600);
    text(ctx, level.english, 330, 56, 12, '#8f88b0', 'left', 500);
    // The counter of how many differences remain, with a dot for each one.
    const left = remaining(state);
    text(ctx, `还剩 ${left} 个`, 640, 30, 30, left === 0 ? '#8fd8a0' : '#ffffff', 'center', 800);
    level.diffs.forEach((diff, i) => {
      const found = state.found.has(i);
      ctx.fillStyle = found ? '#ffd76a' : 'rgba(255,255,255,0.25)';
      circle(ctx, 560 + i * 24, 58, 6);
      if (found) {
        ctx.strokeStyle = '#2a1a08';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(560 + i * 24 - 3, 58);
        ctx.lineTo(560 + i * 24 - 1, 60.5);
        ctx.lineTo(560 + i * 24 + 3.5, 55);
        ctx.stroke();
      }
    });
    // The timer: a number and a bar that turns red under thirty seconds.
    const low = state.timeLeft <= 30;
    text(ctx, formatTime(state.timeLeft), 1060, 30, 28, low ? '#ff7a6e' : '#ffffff', 'center', 800);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.roundRect(970, 50, 180, 8, 4);
    ctx.fill();
    ctx.fillStyle = low ? '#ff7a6e' : '#8fd8a0';
    ctx.beginPath();
    ctx.roundRect(970, 50, 180 * Math.max(0, state.timeLeft / TIME_PER_LEVEL), 8, 4);
    ctx.fill();
    text(ctx, `得分 ${state.score}`, 1210, 26, 18, '#f2ead0', 'right', 700);
    text(ctx, `最高 ${state.best}`, 1210, 52, 13, '#8f88b0', 'right', 500);
  }

  function drawPanels(state, time) {
    const level = currentLevel(state);
    ctx.save();
    ctx.translate(LEFT_X, PANEL.y);
    drawScene(ctx, level, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(RIGHT_X, PANEL.y);
    drawScene(ctx, level, 1);
    ctx.restore();
    // "VS" badge in the gap between the pictures.
    ctx.fillStyle = '#14102a';
    circle(ctx, LEFT_X + PANEL.width + PANEL.gap / 2, PANEL.y + PANEL.height / 2, 24);
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(LEFT_X + PANEL.width + PANEL.gap / 2, PANEL.y + PANEL.height / 2, 24, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, 'VS', LEFT_X + PANEL.width + PANEL.gap / 2, PANEL.y + PANEL.height / 2 + 1, 15, '#ffd76a', 'center', 800);
    // Labels under each picture.
    text(ctx, '左图 · 原图', LEFT_X + PANEL.width / 2, PANEL.y + PANEL.height + 18, 13, '#8f88b0', 'center', 500);
    text(ctx, '右图 · 找不同', RIGHT_X + PANEL.width / 2, PANEL.y + PANEL.height + 18, 13, '#8f88b0', 'center', 500);
    // Markers on both pictures: gold rings for found differences, a pulsing
    // ring for the hint, a red X where the last click missed.
    for (const [index, panelX] of [LEFT_X, RIGHT_X].entries()) {
      ctx.save();
      ctx.translate(panelX, PANEL.y);
      level.diffs.forEach((diff, i) => {
        if (!state.found.has(i)) return;
        const pulse = i === state.lastFound ? Math.max(0, 1 - (state.elapsed - state.lastFoundAt) * 1.5) : 0;
        foundMark(ctx, diff.x, diff.y, diff.r, pulse);
      });
      if (state.hintIndex !== -1) {
        const diff = level.diffs[state.hintIndex];
        hintMark(ctx, diff.x, diff.y, diff.r + 4, time);
      }
      if (state.wrongAt !== null && state.wrongAt.panel === index) {
        wrongMark(ctx, state.wrongAt.x, state.wrongAt.y, state.elapsed - state.wrongAt.at);
      }
      ctx.restore();
    }
  }

  function drawBottomBar(state) {
    text(ctx, '点击两幅图里的不同处 · H 提示（剩余 ' + state.hintsLeft + ' 次） · P 暂停 · M 静音 · R 重玩', VIEW.width / 2, 700, 14, '#8f88b0', 'center', 500);
  }

  function drawTitle(state) {
    overlay(ctx, 0.62);
    text(ctx, '双灯谜市', VIEW.width / 2, 190, 84, '#ffd76a', 'center', 800, SERIF);
    text(ctx, 'TWIN LANTERNS — SPOT THE DIFFERENCE', VIEW.width / 2, 250, 20, '#f2ead0', 'center', 600);
    text(ctx, '左右两幅图看起来一模一样，其实藏着 7 处不同。', VIEW.width / 2, 320, 20, '#ffffff', 'center', 500);
    text(ctx, '点中一处不同得 100 分，点错扣 25 分；每关 2 分 30 秒。', VIEW.width / 2, 352, 20, '#ffffff', 'center', 500);
    text(ctx, '三关全找齐，你就是灯谜市最 sharp 的眼睛。', VIEW.width / 2, 384, 20, '#ffffff', 'center', 500);
    panelButton(ctx, VIEW.width / 2 - 130, 430, 260, 56, '开始找不同 ▶');
    text(ctx, '或按 Enter 开始 · 按 1 / 2 / 3 直接选关', VIEW.width / 2, 516, 15, '#b9b3d6', 'center', 500);
    if (state.best > 0) text(ctx, `最高分 ${state.best}`, VIEW.width / 2, 550, 16, '#ffd76a', 'center', 700);
    text(ctx, '灯笼夜市 · 渔港黎明 · 月下花园 —— 三幅原创手绘场景', VIEW.width / 2, 596, 14, '#8f88b0', 'center', 500);
  }

  function drawPaused() {
    overlay(ctx, 0.55);
    text(ctx, '已暂停', VIEW.width / 2, 330, 56, '#ffffff', 'center', 800, SERIF);
    text(ctx, '按 P 或 Enter 继续', VIEW.width / 2, 400, 20, '#b9b3d6', 'center', 500);
  }

  function drawLevelClear(state) {
    overlay(ctx, 0.55);
    text(ctx, '找齐了！', VIEW.width / 2, 280, 64, '#ffd76a', 'center', 800, SERIF);
    text(ctx, `${currentLevel(state).name} 的 7 处不同全部找到`, VIEW.width / 2, 350, 22, '#ffffff', 'center', 600);
    text(ctx, `时间奖励 +${state.levelBonus} 分 · 当前得分 ${state.score}`, VIEW.width / 2, 392, 20, '#f2ead0', 'center', 500);
    panelButton(ctx, VIEW.width / 2 - 130, 440, 260, 56, '下一关 ▶');
    text(ctx, '或按 Enter 继续', VIEW.width / 2, 526, 15, '#b9b3d6', 'center', 500);
  }

  function drawOver(state) {
    overlay(ctx, 0.62);
    text(ctx, '时间到！', VIEW.width / 2, 280, 64, '#ff7a6e', 'center', 800, SERIF);
    text(ctx, `这一关还差 ${remaining(state)} 处不同没找到`, VIEW.width / 2, 350, 22, '#ffffff', 'center', 600);
    text(ctx, `得分 ${state.score} · 最高 ${state.best}`, VIEW.width / 2, 392, 20, '#f2ead0', 'center', 500);
    panelButton(ctx, VIEW.width / 2 - 130, 440, 260, 56, '再试一次 ▶');
    text(ctx, '或按 R 重玩本关', VIEW.width / 2, 526, 15, '#b9b3d6', 'center', 500);
  }

  function drawWin(state) {
    overlay(ctx, 0.6);
    text(ctx, '全部找齐！', VIEW.width / 2, 250, 72, '#ffd76a', 'center', 800, SERIF);
    text(ctx, '三幅图，21 处不同，一个都没漏。', VIEW.width / 2, 326, 22, '#ffffff', 'center', 600);
    text(ctx, '你是灯谜市最 sharp 的眼睛。', VIEW.width / 2, 360, 22, '#ffffff', 'center', 600);
    text(ctx, `总分 ${state.score}`, VIEW.width / 2, 424, 30, '#ffd76a', 'center', 800);
    text(ctx, `最高分 ${state.best}`, VIEW.width / 2, 462, 18, '#b9b3d6', 'center', 500);
    panelButton(ctx, VIEW.width / 2 - 130, 500, 260, 56, '再玩一次 ▶');
    text(ctx, '或按 R 重新开始', VIEW.width / 2, 586, 15, '#b9b3d6', 'center', 500);
  }

  function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    draw(state, screen, time) {
      ctx.fillStyle = '#0e0b1e';
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      drawTopBar(state);
      drawPanels(state, time);
      drawBottomBar(state);
      if (screen === SCREEN_TITLE) drawTitle(state);
      else if (screen === SCREEN_PAUSED) drawPaused();
      else if (screen === SCREEN_LEVEL_CLEAR) drawLevelClear(state);
      else if (screen === SCREEN_OVER) drawOver(state);
      else if (screen === SCREEN_WIN) drawWin(state);
    },
  };
}
