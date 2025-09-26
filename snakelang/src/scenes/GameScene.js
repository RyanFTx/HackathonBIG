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
import { PronunciationPlayer } from '../systems/PronunciationPlayer.js';

export class GameScene {
  constructor(canvas, ctx, orbPercentages = { normal: 60, speed: 20, explosive: 0 }, language = 'characters') {
    this.canvas = canvas;
    this.ctx = ctx;

    // Mode (difficulty) - must be set before OrbSpawner
    this.mode = { difficulty: 'easy' };

    // Game objects
    this.snake = new Snake();
    this.orbs = [];

    // Systems
    this.collisionManager = new CollisionManager();
    this.effectManager = new EffectManager();
    this.orbSpawner = new OrbSpawner(canvas.width, canvas.height, language, this.mode.difficulty);

    // UI
    this.scoreboard = new Scoreboard();
    this.effectUI = new EffectUI();

    // Game state
    this.isPlaying = false;
    this.keys = {};

  // Mouse controls
  this.mouseX = 0;
  this.mouseY = 0;
  this.mousePressed = false;
  this._lastScreenX = null;
  this._lastScreenY = null;
  // Camera
  this.camera = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };

    // Track wrong answers for game over popup
    this.wrongAnswers = [];

    // Store user-defined orb percentages
    this.orbPercentages = orbPercentages;

  this.setupInput();
  // Do not call reset here; only call it on game start
  }

  setMode(mode) {
    this.mode = { ...this.mode, ...mode };
    if (this.orbSpawner) {
      this.orbSpawner.difficulty = this.mode.difficulty;
    }
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
    window.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      // Mouse position in screen (canvas) coordinates, allow outside canvas
      const screenX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
      const screenY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
      this._lastScreenX = screenX;
      this._lastScreenY = screenY;
      this.mouseX = screenX + this.camera.x - this.canvas.width / 2;
      this.mouseY = screenY + this.camera.y - this.canvas.height / 2;
    });

    this.canvas.addEventListener('mousedown', (event) => {
      if (event.button === 0) { // Left mouse button
        this.mousePressed = true;
          // Only start the game if popup menu is NOT active
          if (!this.isPlaying && !(window.snakeLangPopupMenu && window.snakeLangPopupMenu.isActive && window.snakeLangPopupMenu.isActive())) {
            this.start();
            console.log ("2");
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
    // Pass wrongAnswers to GameOverPopup
    if (window.gameController) {
      window.gameController.showGameOver(this.scoreboard.getScore(), this.wrongAnswers);
    } else {
      this.effectUI.showGameOver(this.scoreboard.getScore(), isHighScore);
    }
  }

  reset() {
    this.snake.reset();
    this.scoreboard.reset();
    this.effectManager.clear();
    this.wrongAnswers = [];

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

    // Use orbPercentages to determine initial orb distribution
    const totalOrbs = 5; // You can make this dynamic or configurable
    const orbCounts = {};
    Object.entries(this.orbPercentages).forEach(([type, percent]) => {
      orbCounts[type] = Math.round((percent / 100) * totalOrbs);
    });

    // Only clear and spawn orbs once
    if (this.orbs.length === 0) {
      Object.entries(orbCounts).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        const orb = this.orbSpawner.spawnOrb(type);
        const shrinkOrb = this.orbSpawner.spawnShrinkOrb(type);
        if (orb) this.orbs.push(orb);
        if (shrinkOrb && Math.random() < 1) {
          this.orbs.push(shrinkOrb);
          console.log(`🎮 Spawned shrink orb: ${type}`);
        }
      }
      });
      console.log(`🎮 Game ready with user-defined orb percentages and shrink variants`, this.orbs.length);
    }
  }

  handleInput() {
    if (!this.isPlaying) return;

    // Mouse controls: snake follows cursor (world coordinates)
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

    // Recalculate mouse position in world coordinates if mouse has moved or camera has moved
    if (this._lastScreenX !== null && this._lastScreenY !== null) {
      this.mouseX = this._lastScreenX + this.camera.x - this.canvas.width / 2;
      this.mouseY = this._lastScreenY + this.camera.y - this.canvas.height / 2;
    }
    this.handleInput();

    // Move snake in circular world
    this.snake.move(); // No need to pass canvas size

    // Camera tracking: center on snake head, soft clamping to world edge
    const head = this.snake.getHead();
    const r = CONFIG.WORLD.RADIUS;
    const cx = CONFIG.WORLD.CENTER_X;
    const cy = CONFIG.WORLD.CENTER_Y;
    let targetX = head.x;
    let targetY = head.y;
    // Clamp X
    const dx = targetX - cx;
    const maxDistX = r - this.camera.width / 2;
    if (Math.abs(dx) > maxDistX) {
      targetX = cx + Math.sign(dx) * maxDistX;
    }
    // Clamp Y
    const dy = targetY - cy;
    const maxDistY = r - this.camera.height / 2;
    if (Math.abs(dy) > maxDistY) {
      targetY = cy + Math.sign(dy) * maxDistY;
    }
    // Smoothly interpolate camera position (lerp)
    this.camera.x += (targetX - this.camera.x) * 0.12;
    this.camera.y += (targetY - this.camera.y) * 0.12;

    // Check orb collisions
    const collectedOrbs = this.collisionManager.checkOrbCollisions(this.snake, this.orbs);

    collectedOrbs.forEach(orb => {
      // Update score and set snake length proportional to total score
      const points = orb.onCollect();
      this.scoreboard.updateScore(points);

      // Play pronunciation audio for correct orbs only
      if (points > 0 && orb.word) {
        PronunciationPlayer.play(orb.word, orb.translation);
      }

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
      if (orb.type === 'shrink' || orb.type === 'shrink_speed' || orb.type === 'shrink_explosive') {
        // Lookup correct translation
        let correct = orb.translation;
        const words  = [this.orbSpawner.wordsLevel1, this.orbSpawner.wordsLevel2, this.orbSpawner.wordsLevel3, this.orbSpawner.wordsLevel4];
        if (words.length > 0) {
          const found = words.flat().find(w => w.chinese == orb.word || w.pinyin == orb.word);
          if (found) correct = found.english;
        }

        // Endless mode: do not lose lives, just show correct translation info
        if (this.mode && this.mode.difficulty === 'endless') {
          const text = [orb.word, correct].filter(Boolean).join(' - ');
          this.effectUI.showEffect('shrink', text);
        } else {
          // Normal: track wrong answer and lose a life
          this.wrongAnswers.push({
            chinese: orb.word,
            wrong: orb.wrongTranslation || '?',
            correct
          });
          const isDead = this.scoreboard.loseLife();
          if (isDead) {
            this.stop();
            return; // stop processing further orbs this frame
          }
        }
      }

      // Spawn new orb
      let newOrb = this.orbSpawner.generateOrbWeighted(this.orbPercentages);
      if (newOrb) this.orbs.push(newOrb);


      // Show effect
      this.effectUI.showScoreGain(points);
    });

    if(this.orbs.length < CONFIG.WORLD.MIN_ORB_COUNT){
      let orb = this.orbSpawner.generateOrbWeighted(this.orbPercentages);
      if (orb) this.orbs.push(orb);
    }

    this.orbs = this.orbs.filter(orb => !orb.isDead);

  }

  // Weighted random selection based on orbPercentages
  // _pickOrbTypeWeighted() {
  //   const percentages = this.orbPercentages || { normal: 60, speed: 20, explosive: 20 };
  //   const types = Object.keys(percentages);
  //   const weights = Object.values(percentages);
  //   const total = weights.reduce((a, b) => a + b, 0);
  //   const r = Math.random() * total;
  //   let sum = 0;
  //   for (let i = 0; i < types.length; i++) {
  //     sum += weights[i];
  //     if (r < sum) return types[i];
  //   }
  //   return types[0]; // fallback
  // }

  // _generateOrbWeighted(){
  //   const rand = Math.random();
  //     const orbType = this._pickOrbTypeWeighted();
  //     // 70% chance normal, 30% chance shrink
  //     if(rand < .7){
  //       let newOrb = this.orbSpawner.spawnOrb(orbType);
  //       if (newOrb) {
  //         this.orbs.push(newOrb);
  //       }

  //     }else{
  //       let newOrb = this.orbSpawner.spawnShrinkOrb(orbType);
  //       if (newOrb) {
  //         this.orbs.push(newOrb);
  //       }

  //     }
  // }

  render() {
    // Clear canvas
    this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // ...existing code...

  // Fill entire canvas with blue-black background
  this.ctx.save();
  this.ctx.fillStyle = '#101522';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Draw world circle
  const worldX = this.canvas.width / 2 + (CONFIG.WORLD.CENTER_X - this.camera.x);
  const worldY = this.canvas.height / 2 + (CONFIG.WORLD.CENTER_Y - this.camera.y);
  const r = CONFIG.WORLD.RADIUS;
  this.ctx.beginPath();
  this.ctx.arc(worldX, worldY, r, 0, Math.PI * 2);
  this.ctx.closePath();
  this.ctx.fillStyle = '#101522';
  this.ctx.fill();

  // Draw outward white border glow
  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.arc(worldX, worldY, r, 0, Math.PI * 2);
  this.ctx.closePath();
  this.ctx.strokeStyle = '#fff';
  this.ctx.lineWidth = 8;
  this.ctx.shadowColor = '#fff';
  this.ctx.shadowBlur = 32;
  this.ctx.shadowOffsetX = 0;
  this.ctx.shadowOffsetY = 0;
  this.ctx.stroke();
  this.ctx.restore();

    // Glowing border (white)
    this.ctx.beginPath();
    this.ctx.arc(worldX, worldY, r, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 6;
    this.ctx.shadowColor = '#fff';
    this.ctx.shadowBlur = 16;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

      // Draw stationary stars with parallax effect
      const STAR_COUNT = CONFIG.WORLD.STARS;
      const PARALLAX = CONFIG.WORLD.PARALLAX_FACTOR;
      if (!this.stars || this.stars.length !== STAR_COUNT) {
        this.stars = [];
        const starFieldWidth = this.canvas.width * 2;
        const starFieldHeight = this.canvas.height * 2;
        for (let i = 0; i < STAR_COUNT; i++) {
          this.stars.push({
            x: Math.random() * starFieldWidth,
            y: Math.random() * starFieldHeight,
            radius: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.5 + 0.5
          });
        }
      }
      for (const star of this.stars) {
        this.ctx.save();
        this.ctx.globalAlpha = star.alpha;
        // Parallax offset based on camera
        const px = star.x - this.camera.x * PARALLAX;
        const py = star.y - this.camera.y * PARALLAX;
        // Wrap stars if out of canvas
        let sx = ((px % this.canvas.width) + this.canvas.width) % this.canvas.width;
        let sy = ((py % this.canvas.height) + this.canvas.height) % this.canvas.height;
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowColor = '#fff';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.restore();
      }

    // Draw orbs (only those in world circle)
    this.orbs.forEach(orb => {
      const dx = orb.x - CONFIG.WORLD.CENTER_X;
      const dy = orb.y - CONFIG.WORLD.CENTER_Y;
      if (dx * dx + dy * dy <= CONFIG.WORLD.RADIUS * CONFIG.WORLD.RADIUS) {
        this.ctx.save();
        this.ctx.translate(
          this.canvas.width / 2 - this.camera.x,
          this.canvas.height / 2 - this.camera.y
        );
        orb.draw(this.ctx);
        this.ctx.restore();
      }
    });

    // Draw snake (all segments)
    this.ctx.save();
    this.ctx.translate(
      this.canvas.width / 2 - this.camera.x,
      this.canvas.height / 2 - this.camera.y
    );
    this.snake.draw(this.ctx);
    this.ctx.restore();

    // Draw UI effects (screen space)
    this.effectUI.render(this.ctx);
  // End of render method
}

  // After updating objects/orbs, tick effects each frame
  // Ensure toasts fade out even when no new orbs are spawned
  postUpdate() {
    this.effectManager.update(16);
    this.effectUI.update();
  }

  isActive() {
    return true; // Game scene is always active when created
  }

  // Add pronunciation audio method
  playPronunciationAudio(word, translation) {
    // Use browser SpeechSynthesis API for demo
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(word);
      utter.lang = 'zh-CN'; // Mandarin Chinese
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    } else {
      // Could add fallback to play a pre-recorded audio file
      console.warn('Speech synthesis not supported');
    }
  }
}