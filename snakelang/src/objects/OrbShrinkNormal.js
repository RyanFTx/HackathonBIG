/**
 * Shrink Orb - Future Enhancement
 * Reduces snake size (penalty orb)
 */

import { Orb } from './Orb.js';

export class OrbShrinkNormal extends Orb {
  constructor(x, y, word, wrongTranslation) {
    super(x, y, word, wrongTranslation, '#BA68C8'); // purple
    this.type = 'shrink';
  }

  onCollect() {
    // Future: Apply shrink effect (negative score)
    return -3 * super.onCollect();
  }
}