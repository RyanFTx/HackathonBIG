/**
 * Effect Manager
 * Manages temporary effects like speed boosts, shrinking, etc.
 */

export class EffectManager {
  constructor() {
    this.activeEffects = new Map();
  }

  addEffect(type, duration, data = {}) {
    this.activeEffects.set(type, {
      duration,
      remainingTime: duration,
      data
    });
  }

  removeEffect(type) {
    this.activeEffects.delete(type);
  }

  hasEffect(type) {
    return this.activeEffects.has(type);
  }

  getEffect(type) {
    return this.activeEffects.get(type);
  }

  update(deltaTime) {
    // Update all active effects
    for (const [type, effect] of this.activeEffects.entries()) {
      effect.remainingTime -= deltaTime;
      
      if (effect.remainingTime <= 0) {
        this.removeEffect(type);
      }
    }
  }

  clear() {
    this.activeEffects.clear();
  }

  getActiveEffects() {
    return Array.from(this.activeEffects.keys());
  }
}