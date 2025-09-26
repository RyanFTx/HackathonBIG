/**
 * Speed Orb - Future Enhancement
 * Temporarily increases snake speed
 */

import { Orb } from './Orb.js';

export class OrbSpeed extends Orb {
  constructor(x, y) {
    super(x, y);
    this.type = 'speed';
  }

  onCollect() {
    // Future: Apply speed effect
    return super.onCollect() * 2;
  }
}