/**
 * Shrink Orb - Future Enhancement
 * Reduces snake size (penalty orb)
 */

import { Orb } from './Orb.js';

export class OrbShrink extends Orb {
  constructor(x, y, word, wrongTranslation, no = null) {
    super(x, y, word, wrongTranslation, '#BA68C8'); // purple
    this.type = 'shrink';
    this.no = no;
  }

  onCollect() {
    // Future: Apply shrink effect (negative score)
    return -3 * super.onCollect();
  }
}