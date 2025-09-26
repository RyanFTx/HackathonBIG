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

class SnakeLangGame {
  constructor() {
    this.scenes = {};
    this.currentScene = null;
    this.canvas = null;
    this.ctx = null;
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
    
    // Start with game scene (direct to gameplay like original)
    this.currentScene = this.scenes.game;
    
    console.log('✅ SnakeLang initialized successfully!');
    console.log('🎮 Press SPACE to start, use A/D to steer, W for boost');
    
    // Start game loop
    this.gameLoop();
  }

  update() {
    if (this.currentScene && this.currentScene.isActive()) {
      this.currentScene.update();
    }
  }

  render() {
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
