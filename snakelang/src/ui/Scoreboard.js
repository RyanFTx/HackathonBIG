/**
 * Scoreboard UI
 * Handles score, lives, and game stats display
 */

import { CONFIG } from '../config.js';

export class Scoreboard {
  constructor() {
    this.score = CONFIG.GAME.INITIAL_SCORE;
    this.lives = CONFIG.GAME.INITIAL_LIVES;
    this.highScore = this.loadHighScore();
  }

  updateScore(points) {
    this.score += points;
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

  /**
   * Load high score from localStorage with error handling
   * @returns {number} - The high score (0 if not found or error)
   */
  loadHighScore() {
    try {
      const stored = localStorage.getItem('snakeLangHighScore');
      if (stored === null) return 0;
      
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    } catch (error) {
      console.warn('Failed to load high score from localStorage:', error);
      return 0;
    }
  }

  /**
   * Save high score to localStorage with error handling
   */
  saveHighScore() {
    try {
      localStorage.setItem('snakeLangHighScore', this.highScore.toString());
    } catch (error) {
      console.warn('Failed to save high score to localStorage:', error);
    }
  }

  /**
   * Update high score if current score is higher (called when game ends)
   */
  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  /**
   * Reset high score (useful for testing or admin functions)
   */
  resetHighScore() {
    this.highScore = 0;
    this.saveHighScore();
    this.render();
  }
}