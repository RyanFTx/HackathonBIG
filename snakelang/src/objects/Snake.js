// /root/HackathonBIG/snakelang/entities/Snake.js
/**
 * Snake Object
 * Handles snake logic, movement, and rendering
 * Fixes edge "stretching" by using toroidal deltas + wrap helpers.
 */

import { CONFIG } from '../config.js';

export class Snake {
  constructor(canvas) {
    this.reset();
    this.texturePattern = null;
    this.textureCanvas = null;
    this.isGrowing = false;

    // Virtual scaling based on canvas diagonal for better consistency
    const referenceWidth = 1920; // Design reference width
    const referenceHeight = 1080; // Design reference height
    let scale = 1;
    if (canvas && canvas.width && canvas.height) {
      const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
      const referenceDiagonal = Math.sqrt(referenceWidth * referenceWidth + referenceHeight * referenceHeight);
      scale = diagonal / referenceDiagonal;
    }
    // Scale all relevant gameplay parameters
    this.actualSpeed = CONFIG.SNAKE.BASE_SPEED * scale;
    this.actualTurnSpeed = CONFIG.SNAKE.TURN_SPEED * scale;
    this.actualBoostSpeed = (CONFIG.SNAKE.MAX_SPEED - CONFIG.SNAKE.BASE_SPEED) * scale;
    this.actualNormalSpeed = CONFIG.SNAKE.BASE_SPEED * scale;
    this.actualSize = CONFIG.SNAKE.SIZE * scale;
    this.scale = scale;
  }

  reset() {
    this.body = [{ x: CONFIG.SNAKE.INITIAL_X, y: CONFIG.SNAKE.INITIAL_Y }];
    this.angle = 0;
    this.speed = CONFIG.SNAKE.BASE_SPEED;
  }

  move() {
    const head = this.body[0];

    // Precompute speed step and angle
    const stepX = Math.cos(this.angle) * this.actualSpeed;
    const stepY = Math.sin(this.angle) * this.actualSpeed;

    const worldCenterX = CONFIG.WORLD.CENTER_X;
    const worldCenterY = CONFIG.WORLD.CENTER_Y;
    const worldRadius  = CONFIG.WORLD.RADIUS;
    const worldR2      = worldRadius * worldRadius;

    // Candidate new head
    let newX = head.x + stepX;
    let newY = head.y + stepY;

    // Circle bound check: use squared distance, avoid atan2/cos/sin
    const ddx = newX - worldCenterX;
    const ddy = newY - worldCenterY;
    const dist2 = ddx * ddx + ddy * ddy;
    if (dist2 > worldR2) {
      const dist = Math.sqrt(dist2) || 1;                // only when outside
      const k = worldRadius / dist;                       // project onto circle
      newX = worldCenterX + ddx * k;
      newY = worldCenterY + ddy * k;
    }

    // Reuse tail segment as the new head to reduce allocations
    let newHead;
    if (this.isGrowing) {
      // grow exactly one frame: keep tail, allocate once
      newHead = { x: newX, y: newY };
      this.isGrowing = false; // why: growth accounted for this frame
    } else {
      newHead = this.body.pop(); // reuse tail object
      newHead.x = newX;
      newHead.y = newY;
    }
    this.body.unshift(newHead); // NOTE: still O(n); ring buffer removes this

    // Follow: do sqrt only when we must move a segment
    const segDist = CONFIG.SNAKE.SEGMENT_DISTANCE;
    const segDist2 = segDist * segDist;

    for (let i = 1; i < this.body.length; i++) {
      const current = this.body[i];
      const target  = this.body[i - 1];
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > segDist2) {
        const d = Math.sqrt(d2);
        const r = segDist / d;
        current.x += dx * r;
        current.y += dy * r;
      }
    }

    // Cap length if needed
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

  turnLeft()  { this.angle -= this.actualTurnSpeed; }
  turnRight() { this.angle += this.actualTurnSpeed; }
  //speedBoost() { this.speed = Math.min(this.speed + this.actualBoostSpeed, CONFIG.SNAKE.MAX_SPEED * this.scale); }
  //normalSpeed() { this.speed = Math.max(this.speed - 0.05 * this.scale, this.actualNormalSpeed); }
  getHead() { return this.body[0]; }

  // --- Optimized solid color texture ---
  generateScaleTexture() {
    if (this.texturePattern) return this.texturePattern;

    // Use a simple 16x16 canvas for better performance
    this.textureCanvas = document.createElement('canvas');
    this.textureCanvas.width = 16;
    this.textureCanvas.height = 16;
    const textureCtx = this.textureCanvas.getContext('2d');

    // Simple solid dark purple - no complex gradients or effects
    textureCtx.fillStyle = '#4A148C'; // Dark purple
    textureCtx.fillRect(0, 0, 16, 16);

    this.texturePattern = textureCtx.createPattern(this.textureCanvas, 'repeat');
    return this.texturePattern;
  }

  draw(ctx) {
    const len = this.body.length;

    // Optimized drawing - use direct color instead of patterns
    for (let i = 0; i < len; i++) {
      const segment = this.body[i];
      const radius = i === 0 ? this.actualSize + 2 * this.scale : this.actualSize;

      // Add glowing effect to each segment
      ctx.save();
      ctx.shadowColor = '#AB47BC'; // Purple glow
      ctx.shadowBlur = 12;

      // Fill with solid dark purple
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#4A148C'; // Dark purple
      ctx.fill();

      // Add extra glow for head
      if (i === 0) {
        ctx.shadowColor = '#E1BEE7'; // Lighter purple glow for head
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Add subtle head highlight
      if (i === 0) {
        const headGradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, radius);
        headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        headGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = headGradient;
        ctx.fill();
      }
    }

    // Draw glowing eyes
    if (len > 0) {
      const head = this.body[0];
      const eyeDistance = 10 * this.scale; // Increased from 6 to 10
      const eyeSize = 4 * this.scale; // Increased from 2 to 4

      const leftEyeX = head.x + Math.cos(this.angle - 0.5) * eyeDistance;
      const leftEyeY = head.y + Math.sin(this.angle - 0.5) * eyeDistance;
      const rightEyeX = head.x + Math.cos(this.angle + 0.5) * eyeDistance;
      const rightEyeY = head.y + Math.sin(this.angle + 0.5) * eyeDistance;

      // Glowing purple eyes
      ctx.save();
      ctx.shadowColor = '#E1BEE7';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#E1BEE7';
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
