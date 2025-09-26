/**
 * Game Scene
 * Core gameplay scene with snake and orbs
 */

import { Snake } from '../objects/Snake.js';
import { CollisionManager } from '../systems/CollisionManager.js';
import { EffectManager } from '../systems/EffectManager.js';
import { OrbSpawner } from '../systems/OrbSpawner.js';
import { Scoreboard } from '../ui/Scoreboard.js';
import { EffectUI } from '../ui/EffectUI.js';
import { CONFIG } from '../config.js';

export class GameScene {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Game objects
    this.snake = new Snake();
    this.orbs = [];
    
    // Systems
    this.collisionManager = new CollisionManager();
    this.effectManager = new EffectManager();
    this.orbSpawner = new OrbSpawner(canvas.width, canvas.height);
    
    // UI
    this.scoreboard = new Scoreboard();
    this.effectUI = new EffectUI();
    
    // Game state
    this.isPlaying = false;
    this.keys = {};
    
    this.setupInput();
    this.reset();
  }

  setupInput() {
    document.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;

      if (!this.isPlaying && event.code === CONFIG.CONTROLS.START_GAME) {
        this.start();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });
  }

  start() {
    this.isPlaying = true;
    this.reset();
  }

  stop() {
    this.isPlaying = false;
    const isHighScore = this.scoreboard.getScore() === this.scoreboard.getHighScore();
    this.effectUI.showGameOver(this.scoreboard.getScore(), isHighScore);
  }

  reset() {
    this.snake.reset();
    this.orbs = this.orbSpawner.spawnInitialOrbs();
    this.scoreboard.reset();
    this.effectManager.clear();
  }

  handleInput() {
    if (!this.isPlaying) return;

    // Turn left
    if (CONFIG.CONTROLS.TURN_LEFT.some(key => this.keys[key])) {
      this.snake.turnLeft();
    }
    
    // Turn right
    if (CONFIG.CONTROLS.TURN_RIGHT.some(key => this.keys[key])) {
      this.snake.turnRight();
    }
    
    // Speed boost
    if (CONFIG.CONTROLS.SPEED_BOOST.some(key => this.keys[key])) {
      this.snake.speedBoost();
    } else {
      this.snake.normalSpeed();
    }
  }

  update() {
    if (!this.isPlaying) return;

    this.handleInput();

    // Move snake
    this.snake.move(this.canvas.width, this.canvas.height);

    // Check orb collisions
    const collectedOrbs = this.collisionManager.checkOrbCollisions(this.snake, this.orbs);
    
    collectedOrbs.forEach(orb => {
      // Grow snake
      this.snake.grow();
      
      // Update score
      const points = orb.onCollect();
      this.scoreboard.updateScore(points);
      
      // Spawn new orb
      this.orbs.push(this.orbSpawner.spawnOrb());
      
      // Show effect
      this.effectUI.showScoreGain(points);
    });

    // Update systems
    this.effectManager.update(16); // Assuming ~60fps
    this.effectUI.update();
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw orbs
    this.orbs.forEach(orb => orb.draw(this.ctx));
    
    // Draw snake
    this.snake.draw(this.ctx);
    
    // Draw UI effects
    this.effectUI.render(this.ctx);
  }

  isActive() {
    return true; // Game scene is always active when created
  }
}