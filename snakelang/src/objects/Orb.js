/**
 * Base Orb Class
 * Common functionality for all orb types
 */

import { CONFIG } from '../config.js';

export class Orb {
  constructor(x, y, word = null) {
    this.x = x;
    this.y = y;
    this.word = word;
    this.size = CONFIG.ORBS.SIZE;
  }

  draw(ctx) {
    // Draw orb background
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, CONFIG.COLORS.ORB_GRADIENT_START);
    gradient.addColorStop(0.7, CONFIG.COLORS.ORB_GRADIENT_MID);
    gradient.addColorStop(1, CONFIG.COLORS.ORB_GRADIENT_END);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Add border
    ctx.strokeStyle = CONFIG.COLORS.ORB_BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this.word) {
      // Draw Chinese character
      ctx.fillStyle = CONFIG.COLORS.ORB_TEXT;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.word.chinese, this.x, this.y - 2);

      // Draw English translation below (small)
      ctx.fillStyle = CONFIG.COLORS.ORB_SUBTEXT;
      ctx.font = '8px Arial';
      ctx.fillText(this.word.english, this.x, this.y + 25);
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