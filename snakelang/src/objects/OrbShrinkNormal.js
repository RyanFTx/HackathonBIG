/**
 * Shrink Orb - Future Enhancement
 * Reduces snake size (penalty orb)
 */

import { Orb } from './Orb.js';

export class OrbShrinkNormal extends Orb {
  constructor(x, y, word, wrongTranslation, difficulty, mode = 'normal') {
    if (mode === 'normal') {
      let color ='#FFD700';
      super(x, y, word, translation, color);
    }else{
      let color = '#faffc2ff';
      super(x, y, word, translation, color);
    }
    super(x, y, word, wrongTranslation, '#faffc2ff'); // purple
    this.type = 'shrink';
    this.difficulty = difficulty;
  }

  onCollect() {
    let penalty;
    switch(this.difficulty) {
      case 'easy':
        penalty = 1;
        break;
      case 'medium':
        penalty = 3;
        break;
      case 'hard':
        penalty = 5;
        break;
      default:
        penalty = 1;
        break;
    }
    return -penalty * super.onCollect();
  }
}