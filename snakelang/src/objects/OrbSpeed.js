/**
 * Speed Orb - Future Enhancement
 * Temporarily increases snake speed
 */

import { Orb } from './Orb.js';

export class OrbSpeed extends Orb {
  constructor(x, y, word, translation, mode = 'normal') {
    super(x, y, word, translation, '#128aedff'); // blue
    this.type = 'speed';
  }

  onCollect() {
    // Future: Apply speed effect
    return super.onCollect() * 2;
  }
}