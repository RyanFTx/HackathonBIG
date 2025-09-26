import { Orb } from './Orb.js';

export class OrbShrinkExplosive extends Orb {
  constructor(x, y, word, translation) {
    super(x, y, word, translation, '#ff1744'); // red for explosive shrink
  }

  onCollect() {
    // Shrink and explosive effect logic here
    return -1; // or custom score
  }
}
