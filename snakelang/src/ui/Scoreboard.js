/**
 * Scoreboard UI
 * Handles score, lives, and game stats display
 */

import { CONFIG } from '../config.js';

export class Scoreboard {
  constructor() {
    this.score = CONFIG.GAME.INITIAL_SCORE;
    this.lives = CONFIG.GAME.INITIAL_LIVES;
    this.highScore = parseInt(localStorage.getItem('snakeLangHighScore') || '0');
  }

  updateScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeLangHighScore', this.highScore.toString());
    }
    this.render();
  }

  loseLife() {
    this.lives--;
    this.render();
    return this.lives <= 0;
  }

  reset() {
    this.score = CONFIG.GAME.INITIAL_SCORE;
    this.lives = CONFIG.GAME.INITIAL_LIVES;
    this.render();
  }

  render() {
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`;
    }
    
    if (livesElement) {
      const hearts = '❤️'.repeat(this.lives);
      livesElement.textContent = `Lives: ${hearts}`;
    }

    // Update high score if it exists
    const highScoreElement = document.getElementById('high-score');
    if (highScoreElement) {
      highScoreElement.textContent = `High: ${this.highScore}`;
    }
  }

  getScore() {
    return this.score;
  }

  getLives() {
    return this.lives;
  }

  getHighScore() {
    return this.highScore;
  }
}