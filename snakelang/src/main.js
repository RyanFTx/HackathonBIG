/**
 * SnakeLang - Main Entry Point
 * Slither.io style snake game for learning Chinese vocabulary
 */

import './style.css';
import { CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { StartPopupMenu } from './ui/StartPopupMenu.js';
import { GameOverPopup } from './ui/GameOverPopup.js';
import { GameController } from './GameController.js';
import { AudioManager } from './systems/AudioManager.js';

class SnakeLangGame {
  constructor() {
    this.scenes = {};
    this.currentScene = null;
    this.canvas = null;
    this.ctx = null;
    this.audioManager = new AudioManager();
    this.popupMenu = new StartPopupMenu();
    window.snakeLangPopupMenu = this.popupMenu;
    this.popupMenu.onStart = ({ language, orbPercentages, difficulty }) => {
      // Pass settings to game scene and orb spawner
      this.language = language;
      this.orbPercentages = orbPercentages;
      this.difficulty = difficulty;
      this.startGame();
    };
    this.language = 'characters';
    this.orbPercentages = { normal: 60, explosive: 20, speed: 20 };
    this.gameController = null;
  }

  async init() {
    console.log('🐍 SnakeLang initializing...');

    // Initialize boot scene and preload assets
    const bootScene = new BootScene();
    await bootScene.preload();

    // Set up UI scene (creates HTML structure)
    this.scenes.ui = new UIScene();

    // Get canvas and context
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    if (!this.canvas || !this.ctx) {
      throw new Error('Failed to initialize canvas');
    }

    // Make canvas full screen and centered
    function resizeCanvas() {
      // Use window size for full screen
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
    }
    resizeCanvas = resizeCanvas.bind(this);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize scenes
  this.scenes.menu = new MenuScene();
  this.scenes.game = new GameScene(this.canvas, this.ctx);
  this.gameController = new GameController(this, this.canvas, this.ctx);
  this.gameController.audioManager = this.audioManager; // Expose audioManager
  window.gameController = this.gameController;
    // Start with popup menu
    this.currentScene = null;
    // Listen for key events for popup
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    this.popupMenu.attach(this.canvas); // Attach mouse events to canvas

    // Add user interaction listeners to start BGM
    this.addUserInteractionListeners();

    console.log('✅ SnakeLang initialized successfully!');
    console.log('🎮 Press SPACE to start, use A/D to steer, W for boost');

    // Start game loop
    this.gameLoop();
  }

  addUserInteractionListeners() {
    // Add listeners for user interactions to start BGM (required by autoplay policy)
    const startBGM = () => {
      this.audioManager.resumeAfterUserInteraction();
      // Remove listeners after first interaction
      document.removeEventListener('click', startBGM);
      document.removeEventListener('keydown', startBGM);
      document.removeEventListener('touchstart', startBGM);
    };

    document.addEventListener('click', startBGM);
    document.addEventListener('keydown', startBGM);
    document.addEventListener('touchstart', startBGM);
  }

  handleKeyDown(event) {
    // Try to start BGM on any key press
    this.audioManager.resumeAfterUserInteraction();
    
    if (this.popupMenu.isActive()) {
      if (event.code === 'ArrowUp') {
        this.popupMenu.handleInput({ type: 'language', value: 'characters' });
      } else if (event.code === 'ArrowDown') {
        this.popupMenu.handleInput({ type: 'language', value: 'pinyin' });
      } else if (event.code === 'Digit1') {
        this.popupMenu.handleInput({ type: 'orb', orb: 'normal', value: Math.min(this.popupMenu.orbPercentages.normal + 10, 100) });
      } else if (event.code === 'Digit2') {
        this.popupMenu.handleInput({ type: 'orb', orb: 'explosive', value: Math.min(this.popupMenu.orbPercentages.explosive + 10, 100) });
      } else if (event.code === 'Digit3') {
        this.popupMenu.handleInput({ type: 'orb', orb: 'speed', value: Math.min(this.popupMenu.orbPercentages.speed + 10, 100) });
      } else if (event.code === 'Enter') {
        this.popupMenu.handleInput({ type: 'start' });
      }
      event.preventDefault();
    }
  }

  startGame() {
    // Start background music when game starts
    this.audioManager.playBGM();
    
    // Calculate orbCounts from orbPercentages
    const totalOrbs = 10; // You can make this dynamic or configurable
    const orbCounts = {};
    Object.entries(this.orbPercentages).forEach(([type, percent]) => {
      orbCounts[type] = Math.round((percent / 100) * totalOrbs);
    });
    // Create a new GameScene with orbCounts
    this.scenes.game = new GameScene(this.canvas, this.ctx, orbCounts, this.language);
    this.currentScene = this.scenes.game;
    // Apply mode difficulty, including Endless
    if (this.currentScene && this.currentScene.setMode && this.difficulty) {
      this.currentScene.setMode({ difficulty: this.difficulty });
    }
    if (this.popupMenu && this.popupMenu.difficultyLevels && this.scenes.game.setMode) {
      const diffKey = this.popupMenu.difficultyLevels[this.popupMenu.difficultyIndex]?.key || 'easy';
      this.scenes.game.setMode({ difficulty: diffKey });
    }
    // Start the game immediately
    if (this.scenes.game && this.scenes.game.start) {
      this.scenes.game.start();
    }
  }

  update() {
    if (this.popupMenu.isActive()) return;
    if (this.gameController && this.gameController.gameOverPopup.isActive()) return;
    if (this.currentScene && this.currentScene.isActive()) {
      this.currentScene.update();
      // Always tick effects so toasts fade out
      if (this.currentScene.postUpdate) this.currentScene.postUpdate();
      // Check for game over
      if (this.scenes.game.scoreboard.getLives() <= 0) {
        this.gameController.showGameOver(
          this.scenes.game.scoreboard.getScore(),
          this.scenes.game.wrongAnswers
        );
      }
    }
  }

  render() {
    if (this.popupMenu.isActive()) {
      this.popupMenu.render(this.ctx);
      return;
    }
    if (this.gameController && this.gameController.render()) {
      return;
    }
    if (this.currentScene && this.currentScene.isActive()) {
      this.currentScene.render();
    }
    // Always render UI scene if active
    if (this.scenes.ui && this.scenes.ui.isActive()) {
      this.scenes.ui.render();
    }
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const game = new SnakeLangGame();
    await game.init();
  } catch (error) {
    console.error('❌ Failed to initialize SnakeLang:', error);
    document.querySelector('#app').innerHTML = `
      <div style="color: red; text-align: center; padding: 2rem;">
        <h2>❌ Game Failed to Load</h2>
        <p>Error: ${error.message}</p>
        <p>Please refresh the page and try again.</p>
      </div>
    `;
  }
});
