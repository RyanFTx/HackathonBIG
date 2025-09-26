/**
 * Base Orb Class
 * Common functionality for all orb types
 */

import { CONFIG } from '../config.js';

export class Orb {
  constructor(x, y, word = null, translation = null, color = '#FFD700') {
    this.x = x;
    this.y = y;
    this.word = word;
    this.translation = translation;
    this.color = color;
    this.size = CONFIG.ORBS.SIZE;
    // Add a random phase offset for natural floating
    this.floatPhase = Math.random() * Math.PI * 2;
    // Track spawn time for lifetime
    this.spawnTime = Date.now();
    // Dying/dead state
    this.isDying = false;
    this.dieStartTime = null;
    // Use a constant fade out duration for all orbs
    this.fadeOutDuration = 800; // ms
    // Randomize dying start offset (how long orb lives before dying)
    // Each orb will start dying after base lifetime minus a random offset
    this.dyingOffset = Math.random() * 0.7 + 0.3; // between 0.3 and 1.0 (fraction of lifetime)
    this.isDead = false;
    // For debugging
    console.log('Created orb with word:', word, translation, 'color:', color);
  }

  draw(ctx) {
    if (!this.word) return;
    const now = Date.now();
    const lifetime = CONFIG.ORBS.ORB_LIFETIME_MS;
    const timeAlive = now - this.spawnTime;
    // Calculate when this orb should start dying
    const dyingStartTime = lifetime * this.dyingOffset;
    const timeLeft = dyingStartTime - timeAlive;
    const warningStart = dyingStartTime * 0.4;

    // If dying, use dieStartTime for fade
    let alpha = 1;
    if (this.isDying && this.dieStartTime) {
      const dyingElapsed = now - this.dieStartTime;
      alpha = Math.max(0, 1 - dyingElapsed / this.fadeOutDuration);
      if (dyingElapsed >= this.fadeOutDuration) {
        this.isDead = true;
      }
    } else if (timeLeft < this.fadeOutDuration) {
      // Start dying
      this.isDying = true;
      this.dieStartTime = now;
      alpha = Math.max(0, timeLeft / this.fadeOutDuration);
    }

    // Animation base
    let time = now / 700;
    let scale = 1 + 0.10 * Math.sin(time + this.floatPhase);
    let floatOffset = 4 * Math.sin(time * 0.9 + this.floatPhase);

    // Smooth warning ramp-up
    if (timeLeft < warningStart) {
      const warningProgress = 1 - timeLeft / warningStart;
      const ease = warningProgress * warningProgress;
      scale += 0.18 * ease * Math.sin(now / (180 - 100 * ease) + this.floatPhase);
      floatOffset += 2 * ease * Math.sin(now / (120 - 60 * ease) + this.floatPhase);
    }

    // ---- Draw main glowing word text with scale, floating, and alpha ----
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y - 2 + floatOffset);
    ctx.scale(scale, scale);
    ctx.shadowBlur = 12 + 4 * Math.sin(time * 2 + this.floatPhase);
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.word, 0, 0);
    ctx.restore();

    // ---- Draw translation below with same color, glow, scale, floating, and alpha ----
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y + 25 + floatOffset);
    ctx.scale(scale, scale);
    ctx.shadowBlur = 8 + 3 * Math.sin(time * 2 + Math.PI / 2 + this.floatPhase);
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.translation, 0, 0);
    ctx.restore();

    // ---- Reset shadow to avoid affecting other drawings ----
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }


  checkCollision(snakeHead, snakeSize) {
    const dx = snakeHead.x - this.x;
    const dy = snakeHead.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < snakeSize + this.size;
  }

  onCollect() {
    // Override in subclasses for specific behavior
    if (this.isDead) {
      return 0; // No score if orb is already dying
    }
    return CONFIG.ORBS.SCORE_VALUE;
  }

}
