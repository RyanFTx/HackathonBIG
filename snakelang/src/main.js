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

class SnakeLangGame {
  constructor() {
    this.scenes = {};
    this.currentScene = null;
    this.canvas = null;
    this.ctx = null;
    this.popupMenu = new StartPopupMenu();
    this.popupMenu.onStart = ({ language, orbPercentages }) => {
      // Pass settings to game scene and orb spawner
      this.language = language;
      this.orbPercentages = orbPercentages;
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

    // Set canvas size from config
    this.canvas.width = CONFIG.CANVAS.WIDTH;
    this.canvas.height = CONFIG.CANVAS.HEIGHT;

    // Initialize scenes
    this.scenes.menu = new MenuScene();
    this.scenes.game = new GameScene(this.canvas, this.ctx);
    this.gameController = new GameController(this, this.canvas, this.ctx);
    // Start with popup menu
    this.currentScene = null;
    // Listen for key events for popup
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    this.popupMenu.attach(this.canvas); // Attach mouse events to canvas

    console.log('✅ SnakeLang initialized successfully!');
    console.log('🎮 Press SPACE to start, use A/D to steer, W for boost');

    // Start game loop
    this.gameLoop();
  }

  handleKeyDown(event) {
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
    // Pass settings to game scene and orb spawner if needed
    this.currentScene = this.scenes.game;
    // TODO: Pass language and orbPercentages to GameScene/OrbSpawner
  }

  update() {
    if (this.popupMenu.isActive()) return;
    if (this.gameController && this.gameController.gameOverPopup.isActive()) return;
    if (this.currentScene && this.currentScene.isActive()) {
      this.currentScene.update();
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
