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

    // Use fixed world units for gameplay parameters
    this.actualSpeed = CONFIG.SNAKE.BASE_SPEED;
    this.actualTurnSpeed = CONFIG.SNAKE.TURN_SPEED;
    this.actualBoostSpeed = CONFIG.SNAKE.MAX_SPEED - CONFIG.SNAKE.BASE_SPEED;
    this.actualNormalSpeed = CONFIG.SNAKE.BASE_SPEED;
    this.actualSize = CONFIG.SNAKE.SIZE;
    this.scale = 1; // No longer used for gameplay, only for rendering
  }

  reset() {
    // Start with a default length of 5 segments, spaced by SEGMENT_DISTANCE
    this.angle = 0;
    this.speed = CONFIG.SNAKE.BASE_SPEED;
    const len = 5;
    const segDist = CONFIG.SNAKE.SEGMENT_DISTANCE;
    const body = [];
    for (let i = 0; i < len; i++) {
      body.push({
        x: CONFIG.SNAKE.INITIAL_X - Math.cos(this.angle) * segDist * i,
        y: CONFIG.SNAKE.INITIAL_Y - Math.sin(this.angle) * segDist * i
      });
    }
    this.body = body;
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
        const prev = this.body.length > 1 ? this.body[this.body.length - 2] : tail;
        // Calculate direction from previous to tail
        const dx = tail.x - prev.x;
        const dy = tail.y - prev.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        // Place new segment at SEGMENT_DISTANCE behind tail
        const newX = tail.x + (dx / d) * CONFIG.SNAKE.SEGMENT_DISTANCE;
        const newY = tail.y + (dy / d) * CONFIG.SNAKE.SEGMENT_DISTANCE;
        this.body.push({ x: newX, y: newY });
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

  draw(ctx, camera, canvas) {
    const len = this.body.length;
    // Utility: world to screen conversion
    function worldToScreen(x, y) {
      return {
        screenX: (x - camera.x) * camera.scale + canvas.width / 2,
        screenY: (y - camera.y) * camera.scale + canvas.height / 2
      };
    }

    for (let i = 0; i < len; i++) {
      const segment = this.body[i];
      const { screenX, screenY } = worldToScreen(segment.x, segment.y);
      const radius = (i === 0 ? this.actualSize + 2 : this.actualSize); // Use world size only

      ctx.save();
      ctx.shadowColor = '#AB47BC';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#4A148C';
      ctx.fill();

      if (i === 0) {
        ctx.shadowColor = '#E1BEE7';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (i === 0 && isFinite(screenX) && isFinite(screenY) && isFinite(radius) && radius > 0) {
        const headGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
        headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        headGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw glowing eyes
    if (len > 0) {
      const head = this.body[0];
      const { screenX, screenY } = worldToScreen(head.x, head.y);
      const eyeDistance = 10; // Use world units
      const eyeSize = 4;      // Use world units

      const leftEyeX = screenX + Math.cos(this.angle - 0.5) * eyeDistance;
      const leftEyeY = screenY + Math.sin(this.angle - 0.5) * eyeDistance;
      const rightEyeX = screenX + Math.cos(this.angle + 0.5) * eyeDistance;
      const rightEyeY = screenY + Math.sin(this.angle + 0.5) * eyeDistance;

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
