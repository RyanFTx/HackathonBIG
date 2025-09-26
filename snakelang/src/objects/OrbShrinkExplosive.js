import { Orb } from './Orb.js';

export class OrbShrinkExplosive extends Orb {
  constructor(x, y, word, translation, difficulty) {
    super(x, y, word, translation, '#f49fb0ff'); // red for explosive shrink
    this.type = 'shrink_explosive';
    this.difficulty = difficulty;
  }

  onCollect() {
    let penalty;
    switch(this.difficulty) {
      case 'medium':
        penalty = 1;
        break;
      case 'hard':
        penalty = 2;
        break;
      default:
        penalty = 2;
    }
    return -penalty * super.onCollect();
  }
}
