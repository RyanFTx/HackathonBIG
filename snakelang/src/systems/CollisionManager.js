/**
 * Collision Manager
 * Handles all collision detection in the game
 */

import { CONFIG } from '../config.js';

export class CollisionManager {
  constructor() {
    this.collisions = [];
  }

  checkOrbCollisions(snake, orbs) {
    const head = snake.getHead();
    const collectedOrbs = [];

    for (let i = orbs.length - 1; i >= 0; i--) {
      const orb = orbs[i];
      if (orb.checkCollision(head, CONFIG.SNAKE.SIZE)) {
        // Collision detected!
        const collectedOrb = orbs.splice(i, 1)[0];
        collectedOrbs.push(collectedOrb);
      }
    }

    return collectedOrbs;
  }

  checkSnakeSelfCollision(snake) {
    const head = snake.getHead();
    
    // Check collision with body (skip first few segments to avoid immediate collision)
    for (let i = 4; i < snake.body.length; i++) {
      const segment = snake.body[i];
      const dx = head.x - segment.x;
      const dy = head.y - segment.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < CONFIG.SNAKE.SIZE) {
        return true;
      }
    }
    
    return false;
  }

  checkBoundaryCollision(snake, canvasWidth, canvasHeight) {
    // Currently using wrap-around, so no boundary collision
    // This method is here for future use if needed
    return false;
  }
}