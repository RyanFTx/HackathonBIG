import { Orb } from './Orb.js';

export class OrbShrinkSpeed extends Orb {
  constructor(x, y, word, translation, difficulty, mode = 'normal') {
    if (mode === 'normal') {
      super(x, y, word, translation, '#128aedff'); // pink
    } else {
      super(x, y, word, translation, '#6dbdffff'); // deep pink for hard mode
    }
    this.type = 'shrink_speed';
    this.difficulty = difficulty;
  }

  onCollect() {
    let penalty;
    switch(this.difficulty) {
      case 'medium':
        penalty = 2;
        break;
      case 'hard':
        penalty = 3;
        break;
      default:
        penalty = 2;
        break;
    }
    return -penalty * super.onCollect();
  }
}
