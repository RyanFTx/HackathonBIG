import { Orb } from './Orb.js';

export class OrbShrinkSpeed extends Orb {
  constructor(x, y, word, translation) {
    super(x, y, word, translation, '#00bfff'); // blue for speed shrink
  }

  onCollect() {
    // Shrink and speed effect logic here
    return -1; // or custom score
  }
}
