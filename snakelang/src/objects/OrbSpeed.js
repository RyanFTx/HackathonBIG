/**
 * Speed Orb - Future Enhancement
 * Temporarily increases snake speed
 */

import { Orb } from './Orb.js';

export class OrbSpeed extends Orb {
  constructor(x, y, word, translation) {
    super(x, y, word, translation, '#64B5F6'); // blue
    this.type = 'speed';
  }

  onCollect() {
    // Future: Apply speed effect
    return super.onCollect() * 2;
  }
}