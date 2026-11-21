// The three picture pairs and where they differ. Every difference lives at one
// anchor point (x, y) in panel coordinates (each panel is 600 x 560) with a
// click radius r. scenes.js paints the change at exactly this anchor, so the
// click test and the picture can never drift apart.
//
// A difference is fair when a player who looks at the right spot can see it:
// each one changes a shape, a colour or a count, never a single pixel.
export const LEVELS = [
  {
    id: 'market',
    name: '灯笼夜市',
    english: 'Lantern Night Market',
    seed: 20261121,
    sky: 'night',
    diffs: [
      { x: 92, y: 66, r: 30, name: '月亮上的环形山', change: 'the moon loses its crater' },
      { x: 300, y: 96, r: 30, name: '中间的灯笼变了色', change: 'the middle lantern turns green' },
      { x: 148, y: 236, r: 28, name: '摊位遮阳棚少了一条纹', change: 'the awning loses a stripe' },
      { x: 468, y: 322, r: 26, name: '水果摊少了一个苹果', change: 'an apple vanishes from the fruit stall' },
      { x: 196, y: 52, r: 16, name: '月亮边少了一颗星', change: 'a star beside the moon is gone' },
      { x: 330, y: 470, r: 30, name: '小猫的尾巴垂下来了', change: 'the cat lowers its tail' },
      { x: 522, y: 500, r: 28, name: '地上的纸灯笼灭了', change: 'the paper lantern on the ground goes dark' },
    ],
  },
  {
    id: 'harbour',
    name: '渔港黎明',
    english: 'Harbour Dawn',
    seed: 20261122,
    sky: 'dawn',
    diffs: [
      { x: 496, y: 82, r: 32, name: '太阳少了光芒', change: 'the sun loses its rays' },
      { x: 92, y: 150, r: 26, name: '灯塔的灯灭了', change: 'the lighthouse lamp goes dark' },
      { x: 300, y: 96, r: 18, name: '天上少了一只海鸥', change: 'a seagull disappears from the sky' },
      { x: 398, y: 258, r: 24, name: '小船的旗变了色', change: 'the little boat flies a different flag' },
      { x: 150, y: 452, r: 26, name: '木桶里的鱼不见了', change: 'the fish in the bucket is gone' },
      { x: 470, y: 440, r: 28, name: '木箱少了一层', change: 'the crate stack loses its top crate' },
      { x: 268, y: 380, r: 24, name: '浮标变了颜色', change: 'the buoy changes colour' },
    ],
  },
  {
    id: 'garden',
    name: '月下花园',
    english: 'Moonlit Garden',
    seed: 20261123,
    sky: 'garden',
    diffs: [
      { x: 168, y: 428, r: 26, name: '荷叶上的青蛙不见了', change: 'the frog leaves its lily pad' },
      { x: 420, y: 430, r: 28, name: '荷花变了颜色', change: 'the lotus flower changes colour' },
      { x: 508, y: 300, r: 26, name: '石灯笼灭了', change: 'the stone lantern goes dark' },
      { x: 96, y: 190, r: 28, name: '柳树少了一根垂枝', change: 'the willow loses a hanging branch' },
      { x: 300, y: 150, r: 16, name: '萤火虫少了一只', change: 'a firefly blinks out' },
      { x: 300, y: 330, r: 26, name: '小桥少了一块木板', change: 'the little bridge loses a plank' },
      { x: 492, y: 70, r: 30, name: '云遮住了月亮', change: 'a cloud drifts over the moon' },
    ],
  },
];

export const DIFF_COUNT = 7;
