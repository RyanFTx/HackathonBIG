import { Orb } from './Orb.js';

export class OrbShrinkExplosive extends Orb {
  constructor(x, y, word, translation) {
    super(x, y, word, translation, '#f49fb0ff'); // red for explosive shrink
    this.type = 'shrink_explosive';
  }

  onCollect() {
    // Shrink and explosive effect logic here
    return -1; // or custom score
  }
}
