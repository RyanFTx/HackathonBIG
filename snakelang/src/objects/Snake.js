// /root/HackathonBIG/snakelang/entities/Snake.js
/**
 * Snake Object
 * Handles snake logic, movement, and rendering
 * Fixes edge "stretching" by using toroidal deltas + wrap helpers.
 */

import { CONFIG } from '../config.js';

export class Snake {
  constructor() {
    this.reset();
    this.texturePattern = null;
    this.textureCanvas = null;
    this.isGrowing = false;
  }

  reset() {
    this.body = [{ x: CONFIG.SNAKE.INITIAL_X, y: CONFIG.SNAKE.INITIAL_Y }];
    this.angle = 0;
    this.speed = CONFIG.SNAKE.BASE_SPEED;
  }

  move() {
    const head = this.body[0];
    const worldCenterX = CONFIG.WORLD.CENTER_X;
    const worldCenterY = CONFIG.WORLD.CENTER_Y;
    const worldRadius = CONFIG.WORLD.RADIUS;
    // Virtual speed scaling based on reference canvas height
    const referenceHeight = 700; // Design reference
    let scale = 1;
    if (typeof window !== 'undefined' && window.snakeLangGame && window.snakeLangGame.ctx && window.snakeLangGame.ctx.canvas) {
      scale = window.snakeLangGame.ctx.canvas.height / referenceHeight;
    }
    const actualSpeed = this.speed * scale;
    const newX = head.x + Math.cos(this.angle) * actualSpeed;
    const newY = head.y + Math.sin(this.angle) * actualSpeed;

    // Check if new head is outside the world circle
    const dx = newX - worldCenterX;
    const dy = newY - worldCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let finalX = newX;
    let finalY = newY;
    if (dist > worldRadius) {
      // Clamp position to the edge of the circle, following the direction of movement
      const angle = Math.atan2(dy, dx);
      finalX = worldCenterX + worldRadius * Math.cos(angle);
      finalY = worldCenterY + worldRadius * Math.sin(angle);
    }

    // Add new head
    this.body.unshift({ x: finalX, y: finalY });

    // Maintain length (unless growing)
    if (!this.isGrowing) {
      this.body.pop();
    } else {
      this.isGrowing = false;
    }

    // Follow with shortest path (no toroidal logic for circle)
    for (let i = 1; i < this.body.length; i++) {
      const current = this.body[i];
      const target = this.body[i - 1];
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.hypot(dx, dy);
      if (distance > CONFIG.SNAKE.SEGMENT_DISTANCE) {
        const ratio = CONFIG.SNAKE.SEGMENT_DISTANCE / distance;
        current.x += dx * ratio;
        current.y += dy * ratio;
      }
    }

    // Optional cap
    while (this.body.length > CONFIG.SNAKE.MAX_LENGTH) this.body.pop();
  }

  grow() {
    this.adjustLengthBy(CONFIG.SNAKE.GROWTH_SEGMENTS);
  }

  adjustLengthBy(segmentsDelta) {
    // Positive: grow by duplicating tail segments
    if (segmentsDelta > 0) {
      for (let i = 0; i < segmentsDelta; i++) {
        const tail = this.body[this.body.length - 1];
        this.body.push({ x: tail.x, y: tail.y });
      }
      // Mark growing for the next move frame so we don't immediately remove the tail
      this.isGrowing = true;
      return;
    }

    // Negative: shrink by removing tail segments (keep at least the head)
    const toRemove = Math.min(this.body.length - 1, Math.abs(segmentsDelta));
    for (let i = 0; i < toRemove; i++) {
      this.body.pop();
    }
  }

  adjustLengthTo(desiredLength) {
    // Clamp desired length between 1 and MAX_LENGTH
    const minLen = 1;
    const maxLen = CONFIG.SNAKE.MAX_LENGTH;
    const target = Math.max(minLen, Math.min(maxLen, desiredLength | 0));
    const delta = target - this.body.length;
    if (delta !== 0) this.adjustLengthBy(delta);
  }

  turnLeft()  { this.angle -= CONFIG.SNAKE.TURN_SPEED; }
  turnRight() { this.angle += CONFIG.SNAKE.TURN_SPEED; }
  speedBoost() { this.speed = Math.min(this.speed + 0.1, CONFIG.SNAKE.MAX_SPEED); }
  normalSpeed() { this.speed = Math.max(this.speed - 0.05, CONFIG.SNAKE.BASE_SPEED); }
  getHead() { return this.body[0]; }

  // --- Rendering with scale texture (unchanged) ---
  generateScaleTexture() {
    if (this.texturePattern) return this.texturePattern;

    this.textureCanvas = document.createElement('canvas');
    this.textureCanvas.width = 32;
    this.textureCanvas.height = 32;
    const textureCtx = this.textureCanvas.getContext('2d');

    const baseColor = CONFIG.COLORS.SNAKE_HEAD_END;
    const scaleColor = CONFIG.COLORS.SNAKE_HEAD_START;
    const shadowColor = CONFIG.COLORS.SNAKE_BORDER;

    for (let y = 0; y < 32; y += 8) {
      for (let x = 0; x < 32; x += 8) {
        const offset = (y / 8) % 2 === 0 ? 0 : 4;
        const scaleX = x + offset;
        const scaleY = y;

        textureCtx.fillStyle = baseColor;
        textureCtx.beginPath();
        textureCtx.ellipse(scaleX + 4, scaleY + 4, 3, 2, 0, 0, Math.PI * 2);
        textureCtx.fill();

        textureCtx.fillStyle = scaleColor;
        textureCtx.beginPath();
        textureCtx.ellipse(scaleX + 3, scaleY + 3, 2, 1.5, 0, 0, Math.PI * 2);
        textureCtx.fill();

        textureCtx.fillStyle = shadowColor;
        textureCtx.beginPath();
        textureCtx.ellipse(scaleX + 5, scaleY + 5, 2.5, 1.8, 0, 0, Math.PI * 2);
        textureCtx.fill();
      }
    }

    this.texturePattern = textureCtx.createPattern(this.textureCanvas, 'repeat');
    return this.texturePattern;
  }

  draw(ctx) {
    const scalePattern = this.generateScaleTexture();

    this.body.forEach((segment, index) => {
      const radius = index === 0 ? CONFIG.SNAKE.SIZE + 2 : CONFIG.SNAKE.SIZE;

      ctx.save();
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = scalePattern;
      ctx.fillRect(segment.x - radius, segment.y - radius, radius * 2, radius * 2);

      // Defensive check for finite values before gradient
      if (index === 0 && Number.isFinite(segment.x) && Number.isFinite(segment.y) && Number.isFinite(radius)) {
        const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, radius);
        gradient.addColorStop(0, 'rgba(102, 187, 106, 0.3)');
        gradient.addColorStop(1, 'rgba(76, 175, 80, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(segment.x - radius, segment.y - radius, radius * 2, radius * 2);
      } else if (index === 0) {
        // fallback: just fill with base color if invalid
        ctx.fillStyle = CONFIG.COLORS.SNAKE_HEAD_START;
        ctx.fillRect(segment.x - radius, segment.y - radius, radius * 2, radius * 2);
      } else {
        const alpha = Math.max(0.1, 0.3 - index * 0.01);
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(segment.x - radius, segment.y - radius, radius * 2, radius * 2);
      }

      ctx.restore();

      ctx.strokeStyle = CONFIG.COLORS.SNAKE_BORDER;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    if (this.body.length > 0) {
      const head = this.body[0];
      const eyeDistance = 6;
      const eyeSize = 2;

      const leftEyeX  = head.x + Math.cos(this.angle - 0.5) * eyeDistance;
      const leftEyeY  = head.y + Math.sin(this.angle - 0.5) * eyeDistance;
      const rightEyeX = head.x + Math.cos(this.angle + 0.5) * eyeDistance;
      const rightEyeY = head.y + Math.sin(this.angle + 0.5) * eyeDistance;

      ctx.fillStyle = CONFIG.COLORS.SNAKE_EYES;
      ctx.beginPath(); ctx.arc(leftEyeX,  leftEyeY,  eyeSize, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2); ctx.fill();
    }
  }

  // --- Helpers ---
  static wrap(v, size) {
    // why: stable wrap into [0, size)
    if (v >= size) return v - size;
    if (v < 0) return v + size;
    return v;
  }

  static toroidalDelta(a, b, size) {
    // why: choose shortest signed distance on a torus
    let d = a - b;
    const half = size / 2;
    if (d >  half) d -= size;
    if (d < -half) d += size;
    return d;
  }
}
