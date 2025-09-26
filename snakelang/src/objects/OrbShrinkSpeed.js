import { Orb } from './Orb.js';

export class OrbShrinkSpeed extends Orb {
  constructor(x, y, word, translation) {
    super(x, y, word, translation, '#99d1e3ff'); // blue for speed shrink
    this.type = 'shrink_speed';
  }

  onCollect() {
    // Shrink and speed effect logic here
    return -1; // or custom score
  }
}
