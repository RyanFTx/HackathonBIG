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
    // Mode
    this.mode = { difficulty: 'easy' };

    // Mouse controls
    this.mouseX = 0;
    this.mouseY = 0;
    this.mousePressed = false;

    this.setupInput();
    this.reset();
  }

  setMode(mode) {
    this.mode = { ...this.mode, ...mode };
  }

  setupInput() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;

      if (!this.isPlaying && event.code === CONFIG.CONTROLS.START_GAME) {
        this.start();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });

    // Mouse controls
    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left;
      this.mouseY = event.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (event) => {
      if (event.button === 0) { // Left mouse button
        this.mousePressed = true;
        if (!this.isPlaying) {
          this.start();
        }
      }
    });

    this.canvas.addEventListener('mouseup', (event) => {
      if (event.button === 0) { // Left mouse button
        this.mousePressed = false;
      }
    });

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
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
    this.scoreboard.reset();
    this.effectManager.clear();

    // Wait for translations to load before spawning orbs
    this.initializeOrbs();
  }

  async initializeOrbs() {
    // Wait for orb spawner to be ready
    const maxWaitTime = 3000; // 3 seconds max wait
    const startTime = Date.now();

    while (!this.orbSpawner.isReady() && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    }

    if (this.orbSpawner.isReady()) {
      this.orbs = this.orbSpawner.spawnInitialOrbs();
      console.log(`🎮 Game ready with ${this.orbSpawner.getWordCount()} Chinese words`);
    } else {
      console.warn('⚠️ Timed out waiting for translations, using fallback words');
      this.orbs = this.orbSpawner.spawnInitialOrbs(); // Try anyway with fallback
    }
  }

  handleInput() {
    if (!this.isPlaying) return;

    // Mouse controls: snake follows cursor
    const head = this.snake.getHead();
    const dx = this.mouseX - head.x;
    const dy = this.mouseY - head.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only turn if mouse is far enough from snake head
    if (distance > 10) {
      const targetAngle = Math.atan2(dy, dx);
      const currentAngle = this.snake.angle;
      
      // Calculate the shortest rotation direction
      let angleDiff = targetAngle - currentAngle;
      
      // Normalize angle difference to [-π, π]
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      // Turn towards mouse cursor
      if (Math.abs(angleDiff) > 0.1) {
        if (angleDiff > 0) {
          this.snake.turnRight();
        } else {
          this.snake.turnLeft();
        }
      }
    }

    // Speed boost on mouse click
    if (this.mousePressed) {
      this.snake.speedBoost();
    } else {
      this.snake.normalSpeed();
    }

    // Keep keyboard controls as backup
    if (CONFIG.CONTROLS.TURN_LEFT.some(key => this.keys[key])) {
      this.snake.turnLeft();
    }
    if (CONFIG.CONTROLS.TURN_RIGHT.some(key => this.keys[key])) {
      this.snake.turnRight();
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
      // Update score and set snake length proportional to total score
      const points = orb.onCollect();
      this.scoreboard.updateScore(points);

      const totalScore = Math.max(0, this.scoreboard.getScore()); // floor at 0

      // Proportional mapping: length = base + k * score
      const baseSegments = 5; // starting beyond head
      const segmentsPerScore = 0.2; // tune growth rate
      const desiredLength = Math.round(baseSegments + totalScore * segmentsPerScore);

      const before = this.snake.body.length;
      this.snake.adjustLengthTo(desiredLength);
      const after = this.snake.body.length;
      const delta = after - before;
      if (delta !== 0) this.effectUI.showLengthChange(delta);

      // If shrink orb
      if (orb.type === 'shrink') {
        if (this.mode.difficulty === 'endless') {
          // Endless: do not lose life; show word + correct translation
          const correct = orb.correctTranslation || orb.translation;
          if (orb.word || correct) {
            const text = [orb.word, correct].filter(Boolean).join(' - ');
            this.effectUI.showEffect('shrink', text);
          }
        } else {
          // Normal modes: lose life
          const isDead = this.scoreboard.loseLife();
          if (isDead) {
            this.stop();
            return; // stop processing further orbs this frame
          }
        }
      }

      // Spawn new orb
      // chose randomly between type normal and shrink
      const rand = Math.random();
      const newOrb = this.orbSpawner.spawnOrb(rand < 0.5 ? 'normal' : 'shrink');
      if (newOrb) {
        this.orbs.push(newOrb);
      }

      // Show effect
      this.effectUI.showScoreGain(points);
    });

    // Despawn orbs that have exceeded their lifetime
    const now = Date.now();
    const orbLifetime = CONFIG.ORBS.ORB_LIFETIME_MS;
    this.orbs = this.orbs.filter(orb => (now - orb.spawnTime) < orbLifetime);

    // Ensure minimum number of normal orbs
    const minNormalOrbs = CONFIG.ORBS.MIN_NORMAL_ORBS;
    const normalOrbCount = this.orbs.filter(orb => orb.constructor.name === 'OrbNormal').length;
    if (normalOrbCount < minNormalOrbs) {
      for (let i = normalOrbCount; i < minNormalOrbs; i++) {
        const orb = this.orbSpawner.spawnOrb('normal');
        if (orb) this.orbs.push(orb);
      }
    }

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