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
    // For debugging
    console.log('Created orb with word:', word, translation, 'color:', color);
  }

  draw(ctx) {
  if (this.word) {
    // ---- Scale pulsation and natural floating effect ----
    const time = Date.now() / 700;
    const scale = 1 + 0.10 * Math.sin(time + this.floatPhase);
    const floatOffset = 4 * Math.sin(time * 0.9 + this.floatPhase);

    // ---- Draw main glowing word text with scale and floating ----
    ctx.save();
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

    // ---- Draw translation below with same color, glow, scale, and floating ----
    ctx.save();
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
  }

  checkCollision(snakeHead, snakeSize) {
    const dx = snakeHead.x - this.x;
    const dy = snakeHead.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < snakeSize + this.size;
  }

  onCollect() {
    // Override in subclasses for specific behavior
    return CONFIG.ORBS.SCORE_VALUE;
  }
}