/**
 * Explosive Orb - Future Enhancement
 * Provides big score boost but risky
 */

import { Orb } from './Orb.js';

export class OrbExplosive extends Orb {
  constructor(x, y, word, translation) {
    super(x, y, word, translation, '#ff4400ff'); // orange-red
    this.type = 'explosive';
  }

  onCollect() {
    // Future: Apply explosive effect (big score boost)
    return super.onCollect() * 5;
  }
}