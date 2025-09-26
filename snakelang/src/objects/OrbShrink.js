/**
 * Shrink Orb - Future Enhancement
 * Reduces snake size (penalty orb)
 */

import { Orb } from './Orb.js';

export class OrbShrink extends Orb {
  constructor(x, y) {
    super(x, y);
    this.type = 'shrink';
  }

  onCollect() {
    // Future: Apply shrink effect (negative score)
    return -super.onCollect();
  }
}