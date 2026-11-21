// The three pictures. Each scene is painted twice from the same code: once
// as the left picture (variant 0) and once as the right picture (variant 1),
// which changes only the seven differences listed in diffs.js. Everything
// else — every star, cloud and cobblestone — comes from one seeded random
// stream, so the two pictures agree exactly except where they are meant to
// differ. All art is drawn with canvas paths: no images, no borrowed art.
//
// drawScene(ctx, level, variant) paints into a 600 x 560 panel whose origin
// is already at the panel's top-left corner.
import { createRandom } from './random.js';
import { LEVELS } from './diffs.js';

function sky(ctx, top, middle, bottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 560);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.55, middle);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 560);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function glow(ctx, x, y, r, colour, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 2, x, y, r);
  gradient.addColorStop(0, colour);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

// One paper lantern: a glowing ribbed oval with caps and a tassel.
function paperLantern(ctx, x, y, size, colour, lit) {
  if (lit) glow(ctx, x, y, size * 1.9, colour, 0.55);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - size * 0.22, y - size * 1.05, size * 0.44, size * 0.2);
  ctx.fillRect(x - size * 0.22, y + size * 0.85, size * 0.44, size * 0.2);
  ctx.fillStyle = lit ? colour : '#5c4a52';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.62, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,20,20,0.55)';
  ctx.lineWidth = 1.5;
  for (let rib = -2; rib <= 2; rib += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.62 * Math.abs(Math.cos(rib * 0.42)), size, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#d8b25c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y + size * 1.35);
  ctx.stroke();
}

// A sitting cat, drawn as one ginger shape with a tail that points up or down.
function cat(ctx, x, y, tailUp) {
  ctx.fillStyle = '#c97b3d';
  ellipse(ctx, x, y + 8, 26, 22); // haunches
  circle(ctx, x - 2, y - 22, 15); // head
  ctx.beginPath(); // ears
  ctx.moveTo(x - 14, y - 30); ctx.lineTo(x - 18, y - 44); ctx.lineTo(x - 6, y - 34);
  ctx.moveTo(x + 10, y - 30); ctx.lineTo(x + 14, y - 44); ctx.lineTo(x + 4, y - 34);
  ctx.fill();
  ctx.strokeStyle = '#c97b3d';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (tailUp) {
    ctx.moveTo(x + 24, y + 22);
    ctx.quadraticCurveTo(x + 46, y + 6, x + 40, y - 26);
  } else {
    ctx.moveTo(x + 24, y + 22);
    ctx.quadraticCurveTo(x + 44, y + 26, x + 52, y + 24);
  }
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8'; // eyes
  circle(ctx, x - 8, y - 24, 2.2);
  circle(ctx, x + 3, y - 24, 2.2);
}

/** Picture pair 1: a lantern night market under a cratered moon. */
function drawMarket(ctx, variant, random) {
  const stars = [];
  for (let i = 0; i < 42; i += 1) stars.push([random() * 600, random() * 170, 0.6 + random() * 1.6]);
  const jars = [0, 1, 2].map(() => 0.8 + random() * 0.4);

  sky(ctx, '#171d42', '#3a2a63', '#6e3a68');
  ctx.fillStyle = '#fff6c8';
  for (const [x, y, r] of stars) {
    if (variant === 1 && Math.hypot(x - 196, y - 52) < 14) continue; // difference 5
    circle(ctx, x, y, r);
  }
  // The moon, cratered on the left and smooth on the right.
  glow(ctx, 92, 66, 62, '#ffe9a8', 0.5);
  ctx.fillStyle = variant === 1 ? '#fdf3cf' : '#ffe9a8';
  circle(ctx, 92, 66, 32);
  if (variant === 0) {
    ctx.fillStyle = '#e8cf8e';
    circle(ctx, 82, 58, 6);
    circle(ctx, 102, 74, 4.5);
    circle(ctx, 96, 54, 3);
  }
  // Rooftops with lit windows.
  ctx.fillStyle = '#241a3d';
  ctx.fillRect(0, 210, 600, 60);
  ctx.fillStyle = '#2e2350';
  for (let x = 0; x < 600; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 210); ctx.lineTo(x + 45, 168); ctx.lineTo(x + 90, 210);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd76a';
  for (const [x, y] of [[40, 228], [150, 240], [330, 226], [470, 242], [545, 230]]) ctx.fillRect(x, y, 12, 14);

  // A string of lanterns across the sky; the middle one changes colour.
  ctx.strokeStyle = '#1c1430';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 74);
  ctx.quadraticCurveTo(300, 108, 590, 74);
  ctx.stroke();
  const lanternColours = ['#ff5a4e', '#ff8a3c', '#ff5a4e', '#ffb03c', '#ff5a4e'];
  [60, 180, 300, 420, 540].forEach((x, i) => {
    const colour = i === 2 && variant === 1 ? '#58c96b' : lanternColours[i]; // difference 2
    paperLantern(ctx, x, 96, 17, colour, true);
  });

  // Left stall: striped awning, six stripes on the left, five on the right.
  const stripes = variant === 1 ? 5 : 6; // difference 3
  for (let i = 0; i < stripes; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#d94f3d' : '#f6e7c8';
    ctx.fillRect(52 + i * (170 / stripes), 200, 170 / stripes + 1, 34);
  }
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(52, 234, 170, 8);
  ctx.fillStyle = '#8a5a35';
  ctx.fillRect(60, 242, 154, 92);
  ctx.fillStyle = '#a9743f';
  ctx.fillRect(60, 242, 154, 10);
  jars.forEach((scale, i) => { // jars of sweets on the counter
    ctx.fillStyle = ['#7fb069', '#e07a5f', '#f2c14e'][i];
    ellipse(ctx, 92 + i * 52, 306, 16 * scale, 20 * scale);
    ctx.fillStyle = '#5a3a22';
    ctx.fillRect(82 + i * 52, 282, 20, 6);
  });

  // Right stall: a fruit stand; one apple is missing on the right.
  ctx.fillStyle = '#8a5a35';
  ctx.fillRect(392, 300, 168, 76);
  ctx.fillStyle = '#a9743f';
  ctx.fillRect(392, 300, 168, 10);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(400, 376, 12, 40);
  ctx.fillRect(540, 376, 12, 40);
  const apples = [[420, 288], [448, 282], [468, 322], [476, 288], [504, 284], [532, 290]];
  for (const [x, y] of apples) {
    if (variant === 1 && x === 468 && y === 322) continue; // difference 4
    ctx.fillStyle = '#e0402f';
    circle(ctx, x, y, 11);
    ctx.fillStyle = '#7fb069';
    ellipse(ctx, x + 4, y - 11, 5, 2.5);
  }
  for (const [x, y] of [[430, 306], [500, 306], [540, 308]]) {
    ctx.fillStyle = '#ff9f2e';
    circle(ctx, x, y, 10);
  }

  // Cobblestones, the cat, and the paper lantern on the ground.
  ctx.fillStyle = '#2c2140';
  ctx.fillRect(0, 420, 600, 140);
  // Festoon lights and evening strollers fill the middle of the street.
  ctx.strokeStyle = 'rgba(20,12,36,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(10, 292);
  ctx.quadraticCurveTo(300, 316, 590, 292);
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const t = i / 11;
    const x = 10 + t * 580;
    const y = 292 + Math.sin(t * Math.PI) * 22 + 4;
    glow(ctx, x, y, 9, ['#ffd76a', '#ff8fb0', '#8fd8ff'][i % 3], 0.7);
    ctx.fillStyle = ['#ffd76a', '#ff8fb0', '#8fd8ff'][i % 3];
    circle(ctx, x, y, 3);
  }
  for (const [x, colour] of [[250, '#3a2f55'], [350, '#463a68'], [560, '#3a2f55']]) {
    ctx.fillStyle = colour; // a stroller: head, shoulders, legs
    circle(ctx, x, 372, 9);
    ctx.beginPath();
    ctx.moveTo(x - 12, 412); ctx.quadraticCurveTo(x, 378, x + 12, 412);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 8, 412, 6, 14);
    ctx.fillRect(x + 2, 412, 6, 14);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      ctx.strokeRect(8 + col * 74 + (row % 2) * 30, 432 + row * 32, 66, 26);
    }
  }
  cat(ctx, 330, 470, variant === 0); // difference 6: tail up / tail down
  paperLantern(ctx, 522, 500, 20, '#ffb03c', variant === 0); // difference 7: lit / dark
}

/** Picture pair 2: a fishing harbour at dawn. */
function drawHarbour(ctx, variant, random) {
  const gulls = [[210, 70], [300, 96], [392, 64]];
  const waves = [];
  for (let i = 0; i < 26; i += 1) waves.push([random() * 600, 330 + random() * 200, 14 + random() * 22]);
  const clouds = [[120, 120, 70], [430, 150, 90], [300, 60, 60]].map(([x, y, r]) => [x + random() * 20, y, r]);

  sky(ctx, '#ffd9a0', '#ff9d6b', '#e88a7a');
  // The sun, rayed on the left and bare on the right.
  glow(ctx, 496, 82, 70, '#ffdf8a', 0.6);
  if (variant === 0) {
    ctx.strokeStyle = '#ffdf8a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let a = 0; a < 8; a += 1) {
      const angle = (a / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(496 + Math.cos(angle) * 38, 82 + Math.sin(angle) * 38);
      ctx.lineTo(496 + Math.cos(angle) * 52, 82 + Math.sin(angle) * 52);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 496, 82, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (const [x, y, r] of clouds) {
    ellipse(ctx, x, y, r, r * 0.36);
    ellipse(ctx, x + r * 0.5, y + 6, r * 0.6, r * 0.3);
  }
  gulls.forEach(([x, y], i) => {
    if (variant === 1 && i === 1) return; // difference 3: one gull fewer
    ctx.strokeStyle = '#4a3a3a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.quadraticCurveTo(x - 4, y - 8, x, y);
    ctx.quadraticCurveTo(x + 4, y - 8, x + 12, y);
    ctx.stroke();
  });
  // Distant headland and the lighthouse.
  ctx.fillStyle = '#7a5a6e';
  ctx.beginPath();
  ctx.moveTo(0, 300); ctx.lineTo(70, 240); ctx.lineTo(150, 300);
  ctx.fill();
  ctx.fillStyle = '#f2ede2';
  ctx.fillRect(76, 170, 34, 130);
  ctx.fillStyle = '#d94f3d';
  ctx.fillRect(76, 196, 34, 16);
  ctx.fillRect(76, 238, 34, 16);
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(70, 148, 46, 24);
  if (variant === 0) { // difference 2: the lamp shines / is dark
    glow(ctx, 93, 160, 46, '#ffe9a8', 0.7);
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.moveTo(93, 160); ctx.lineTo(190, 132); ctx.lineTo(190, 188); ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = variant === 0 ? '#ffe9a8' : '#5c5c6e';
  circle(ctx, 93, 160, 9);
  // The sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 560);
  sea.addColorStop(0, '#3f8ea6');
  sea.addColorStop(1, '#1d5a74');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 600, 260);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [x, y, w] of waves) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w / 2, y - 6, x + w, y);
    ctx.stroke();
  }
  // The buoy changes colour between the pictures.
  ctx.fillStyle = variant === 1 ? '#f2c14e' : '#e0402f'; // difference 7
  ctx.beginPath();
  ctx.moveTo(268, 366); ctx.lineTo(282, 366); ctx.lineTo(278, 394); ctx.lineTo(272, 394);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(273, 356, 4, 12);
  // The sailboat; its flag changes colour.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(392, 200, 6, 84);
  ctx.fillStyle = variant === 1 ? '#3f7fd9' : '#e0402f'; // difference 4
  ctx.beginPath();
  ctx.moveTo(398, 200); ctx.lineTo(428, 210); ctx.lineTo(398, 222);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f6ead0';
  ctx.beginPath();
  ctx.moveTo(392, 212); ctx.lineTo(392, 276); ctx.lineTo(356, 276);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5a35';
  ctx.beginPath();
  ctx.moveTo(360, 278); ctx.lineTo(440, 278); ctx.lineTo(428, 296); ctx.lineTo(372, 296);
  ctx.closePath();
  ctx.fill();
  // A second boat, far off.
  ctx.fillStyle = '#4a3a5a';
  ctx.beginPath();
  ctx.moveTo(500, 320); ctx.lineTo(560, 320); ctx.lineTo(548, 334); ctx.lineTo(512, 334);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(528, 288, 4, 34);
  // The pier, the bucket and the crates.
  ctx.fillStyle = '#7a5230';
  for (let i = 0; i < 5; i += 1) ctx.fillRect(36 + i * 44, 420, 38, 16);
  ctx.fillStyle = '#5e3d22';
  ctx.fillRect(30, 436, 236, 10);
  ctx.fillRect(52, 446, 10, 60);
  ctx.fillRect(232, 446, 10, 60);
  ctx.fillStyle = '#8a8f96';
  ctx.beginPath();
  ctx.moveTo(138, 440); ctx.lineTo(164, 440); ctx.lineTo(160, 470); ctx.lineTo(142, 470);
  ctx.closePath();
  ctx.fill();
  if (variant === 0) { // difference 5: a fish tail sticks out of the bucket
    ctx.fillStyle = '#7fb069';
    ctx.beginPath();
    ctx.moveTo(150, 440);
    ctx.quadraticCurveTo(138, 424, 150, 414);
    ctx.quadraticCurveTo(162, 424, 150, 440);
    ctx.fill();
  }
  const crateRows = variant === 1 ? 2 : 3; // difference 6: one crate fewer
  for (let row = 0; row < crateRows; row += 1) {
    ctx.fillStyle = '#b98a4e';
    ctx.fillRect(448, 452 - row * 34, 56, 30);
    ctx.strokeStyle = '#7a5230';
    ctx.lineWidth = 2;
    ctx.strokeRect(448, 452 - row * 34, 56, 30);
    ctx.beginPath();
    ctx.moveTo(448, 452 - row * 34); ctx.lineTo(504, 482 - row * 34);
    ctx.moveTo(504, 452 - row * 34); ctx.lineTo(448, 482 - row * 34);
    ctx.stroke();
  }
}

/** Picture pair 3: a moonlit garden with a pond, a bridge and a stone lantern. */
function drawGarden(ctx, variant, random) {
  const fireflies = [];
  for (let i = 0; i < 14; i += 1) fireflies.push([60 + random() * 480, 110 + random() * 150]);
  const flowers = [];
  for (let i = 0; i < 12; i += 1) flowers.push([30 + random() * 540, 500 + random() * 48, ['#ff8fb0', '#ffd76a', '#c9a7ff'][i % 3]]);

  sky(ctx, '#0d2b33', '#14524a', '#1d6b52');
  glow(ctx, 492, 70, 58, '#e8f4ff', 0.5);
  ctx.fillStyle = '#f2f7ff';
  circle(ctx, 492, 70, 28);
  ctx.fillStyle = '#cfdce8';
  circle(ctx, 484, 62, 5);
  circle(ctx, 500, 78, 3.5);
  if (variant === 1) { // difference 7: a cloud drifts over the moon
    ctx.fillStyle = 'rgba(210,225,235,0.9)';
    ellipse(ctx, 492, 66, 46, 18);
    ellipse(ctx, 470, 74, 26, 12);
  }
  // The willow, hanging over the pond; one branch is missing on the right.
  ctx.strokeStyle = '#2a1e14';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(60, 330); ctx.quadraticCurveTo(52, 220, 78, 130);
  ctx.stroke();
  ctx.strokeStyle = '#3f7a4a';
  ctx.lineWidth = 3;
  const branches = [70, 96, 122, 148, 174];
  branches.forEach((x, i) => {
    if (variant === 1 && i === 1) return; // difference 4
    ctx.beginPath();
    ctx.moveTo(x, 128 + (i % 2) * 14);
    ctx.quadraticCurveTo(x - 8, 190, x + 4, 250);
    ctx.stroke();
    ctx.fillStyle = '#5a9a5a';
    ellipse(ctx, x, 200, 12, 26);
  });
  // Fireflies, one of which blinks out on the right.
  for (const [x, y] of fireflies) {
    if (variant === 1 && Math.hypot(x - 300, y - 150) < 18) continue; // difference 5
    glow(ctx, x, y, 10, '#d8ff9a', 0.8);
    ctx.fillStyle = '#eaffb0';
    circle(ctx, x, y, 2.5);
  }
  // The pond with lily pads, the frog and the lotus.
  ctx.fillStyle = '#1d6b7a';
  ellipse(ctx, 300, 470, 270, 78);
  ctx.fillStyle = '#2a8a9a';
  ellipse(ctx, 300, 462, 250, 62);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.ellipse(180 + i * 60, 470, 40, 7, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.fillStyle = '#3f8a4a';
  ellipse(ctx, 168, 428, 34, 12);
  ellipse(ctx, 420, 446, 30, 11);
  ellipse(ctx, 240, 500, 26, 10);
  if (variant === 0) { // difference 1: the frog sits on its lily pad
    ctx.fillStyle = '#58a65c';
    circle(ctx, 168, 416, 13);
    circle(ctx, 156, 404, 6);
    circle(ctx, 180, 404, 6);
    ctx.fillStyle = '#1d3a1d';
    circle(ctx, 154, 402, 2);
    circle(ctx, 182, 402, 2);
  }
  // The lotus, pink on the left and white on the right.
  ctx.fillStyle = variant === 1 ? '#fdf6ec' : '#ff9ebb'; // difference 2
  for (let a = 0; a < 6; a += 1) {
    const angle = (a / 6) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(420 + Math.cos(angle) * 12, 424 + Math.sin(angle) * 10, 9, 15, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd76a';
  circle(ctx, 420, 424, 6);
  // The arched bridge; one plank is missing on the right.
  ctx.fillStyle = '#8a5a35';
  ctx.beginPath();
  ctx.moveTo(210, 400);
  ctx.quadraticCurveTo(300, 320, 390, 400);
  ctx.lineTo(390, 416);
  ctx.quadraticCurveTo(300, 336, 210, 416);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b98a4e';
  for (let i = 0; i < 7; i += 1) {
    if (variant === 1 && i === 3) continue; // difference 6
    const t = i / 6;
    const x = 222 + t * 156;
    const y = 396 - Math.sin(t * Math.PI) * 34;
    ctx.fillRect(x - 8, y - 8, 16, 14);
  }
  // The stone lantern, lit on the left and dark on the right.
  ctx.fillStyle = '#8a8f96';
  ctx.fillRect(498, 330, 20, 44);
  ctx.fillRect(488, 286, 40, 14);
  ctx.fillRect(492, 300, 32, 30);
  ctx.fillRect(484, 374, 48, 10);
  if (variant === 0) glow(ctx, 508, 312, 30, '#ffd76a', 0.6);
  ctx.fillStyle = variant === 0 ? '#ffd76a' : '#3a3f4a'; // difference 3
  ctx.fillRect(500, 304, 16, 18);
  // Flowers and grass along the bottom.
  for (const [x, y, colour] of flowers) {
    ctx.strokeStyle = '#2a6b3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 12); ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = colour;
    for (let p = 0; p < 5; p += 1) {
      const angle = (p / 5) * Math.PI * 2;
      circle(ctx, x + Math.cos(angle) * 5, y + Math.sin(angle) * 5, 3.5);
    }
    ctx.fillStyle = '#ffd76a';
    circle(ctx, x, y, 3);
  }
}

const PAINTERS = [drawMarket, drawHarbour, drawGarden];

/** Paint one picture of a pair. `level` is a LEVELS entry; `variant` 0 is the
 *  left picture and 1 is the right picture. */
export function drawScene(ctx, level, variant) {
  const index = LEVELS.indexOf(level);
  const random = createRandom(level.seed);
  // A soft frame so each picture reads as a picture, not a bare rectangle.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 600, 560);
  ctx.clip();
  PAINTERS[index](ctx, variant, random);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 598, 558);
}
