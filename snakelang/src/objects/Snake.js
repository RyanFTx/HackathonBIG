/**
 * Snake Object
 * Handles snake logic, movement, and rendering
 */

import { CONFIG } from '../config.js';

export class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    this.body = [{ x: CONFIG.SNAKE.INITIAL_X, y: CONFIG.SNAKE.INITIAL_Y }];
    this.angle = 0;
    this.speed = CONFIG.SNAKE.BASE_SPEED;
  }

  move(canvasWidth, canvasHeight) {
    // Move head in the direction of the angle
    const head = this.body[0];
    const newX = head.x + Math.cos(this.angle) * this.speed;
    const newY = head.y + Math.sin(this.angle) * this.speed;

    // Check wall collision (wrap around like Slither.io)
    let finalX = newX;
    let finalY = newY;

    if (newX < 0) finalX = canvasWidth;
    if (newX > canvasWidth) finalX = 0;
    if (newY < 0) finalY = canvasHeight;
    if (newY > canvasHeight) finalY = 0;

    // Add new head position
    this.body.unshift({ x: finalX, y: finalY });

    // Update body segments to follow
    for (let i = 1; i < this.body.length; i++) {
      const current = this.body[i];
      const target = this.body[i - 1];

      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > CONFIG.SNAKE.SEGMENT_DISTANCE) {
        const ratio = CONFIG.SNAKE.SEGMENT_DISTANCE / distance;
        current.x = target.x - dx * ratio;
        current.y = target.y - dy * ratio;
      }
    }

    // Keep snake at reasonable length
    while (this.body.length > CONFIG.SNAKE.MAX_LENGTH) {
      this.body.pop();
    }
  }

  grow() {
    for (let i = 0; i < CONFIG.SNAKE.GROWTH_SEGMENTS; i++) {
      const tail = this.body[this.body.length - 1];
      this.body.push({ x: tail.x, y: tail.y });
    }
  }

  turnLeft() {
    this.angle -= CONFIG.SNAKE.TURN_SPEED;
  }

  turnRight() {
    this.angle += CONFIG.SNAKE.TURN_SPEED;
  }

  speedBoost() {
    this.speed = Math.min(this.speed + 0.1, CONFIG.SNAKE.MAX_SPEED);
  }

  normalSpeed() {
    this.speed = Math.max(this.speed - 0.05, CONFIG.SNAKE.BASE_SPEED);
  }

  getHead() {
    return this.body[0];
  }

  draw(ctx) {
    // Draw snake body segments
    this.body.forEach((segment, index) => {
      const radius = index === 0 ? CONFIG.SNAKE.SIZE + 2 : CONFIG.SNAKE.SIZE;

      // Body gradient
      if (index === 0) {
        // Head
        const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, radius);
        gradient.addColorStop(0, CONFIG.COLORS.SNAKE_HEAD_START);
        gradient.addColorStop(1, CONFIG.COLORS.SNAKE_HEAD_END);
        ctx.fillStyle = gradient;
      } else {
        // Body segments get darker as they go back
        const alpha = Math.max(0.6, 1 - (index * 0.02));
        ctx.fillStyle = CONFIG.COLORS.SNAKE_BODY.replace('{alpha}', alpha);
      }

      ctx.beginPath();
      ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add a border to segments
      ctx.strokeStyle = CONFIG.COLORS.SNAKE_BORDER;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw eyes on head
    if (this.body.length > 0) {
      const head = this.body[0];
      const eyeDistance = 6;
      const eyeSize = 2;

      // Calculate eye positions based on snake angle
      const leftEyeX = head.x + Math.cos(this.angle - 0.5) * eyeDistance;
      const leftEyeY = head.y + Math.sin(this.angle - 0.5) * eyeDistance;
      const rightEyeX = head.x + Math.cos(this.angle + 0.5) * eyeDistance;
      const rightEyeY = head.y + Math.sin(this.angle + 0.5) * eyeDistance;

      ctx.fillStyle = CONFIG.COLORS.SNAKE_EYES;
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}