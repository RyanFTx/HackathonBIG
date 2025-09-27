import { Orb } from './Orb.js';

export class OrbShrinkExplosive extends Orb {
  constructor(x, y, word, translation, difficulty, mode = 'normal') {
    if (mode === 'normal') {
      let color ='#ff4400ff';
      super(x, y, word, translation, color);
    }else{
      let color = '#f49fb0ff';
      super(x, y, word, translation, color);
    }
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
