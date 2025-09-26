/**
 * Shrink Orb - Future Enhancement
 * Reduces snake size (penalty orb)
 */

import { Orb } from './Orb.js';

export class OrbShrink extends Orb {
  constructor(x, y, word, correctTranslation, wrongTranslation) {
    // For display on the orb itself we still show the (possibly) wrong translation
    super(x, y, word, wrongTranslation, '#BA68C8'); // purple
    this.type = 'shrink';
    this.correctTranslation = correctTranslation;
  }

  onCollect() {
    // Future: Apply shrink effect (negative score)
    return -3 * super.onCollect();
  }
}