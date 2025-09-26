/**
 * Normal Orb (Chinese Word Orb)
 * Standard gameplay orb with Chinese vocabulary
 */

import { Orb } from './Orb.js';

export class OrbNormal extends Orb {
  constructor(x, y, word) {
    super(x, y, word);
    this.type = 'normal';
  }

  onCollect() {
    // Return score value for normal orb
    return super.onCollect();
  }
}