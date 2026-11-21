// A tiny seeded random number generator (mulberry32). Every picture pair is
// drawn from one fixed seed, so the left and right pictures agree on every
// star, cloud and cobblestone, and differ only where a difference says so.
// The same seed always paints the same picture, which is what makes the
// screenshot scenes repeatable.
export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick an integer in [min, max] from a generator.
export function pickInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

// Pick one item from an array.
export function pickOne(random, items) {
  return items[Math.floor(random() * items.length)];
}
