/**
 * Explosive Orb - Future Enhancement
 * Provides big score boost but risky
 */

import { Orb } from './Orb.js';

export class OrbExplosive extends Orb {
  constructor(x, y) {
    super(x, y);
    this.type = 'explosive';
  }

  onCollect() {
    // Future: Apply explosive effect (big score boost)
    return super.onCollect() * 5;
  }
}