// GameController.js
// Handles game state transitions (start, game over, etc.)

import { GameOverPopup } from './ui/GameOverPopup.js';

export class GameController {
  constructor(game, canvas, ctx) {
    this.game = game;
    this.ctx = ctx;
    this.canvas = canvas;
    this.gameOverPopup = new GameOverPopup();
    this.gameOverPopup.attach(canvas);
    this.gameOverPopup.onTryAgain = () => this.restartGame();
    this.gameOverPopup.onExit = () => this.exitToMenu();
  }

  showGameOver(score, wrongAnswers = []) {
    const highScore = this.game.scenes.game.scoreboard.getHighScore();
    this.gameOverPopup.show(score, wrongAnswers, highScore);
  }

  render() {
    if (this.gameOverPopup.isActive()) {
      this.gameOverPopup.render(this.ctx);
      return true;
    }
    return false;
  }

  restartGame() {
    // Hide game over popup
    this.gameOverPopup.hide();
    // Reset game scene and scoreboard
    this.game.scenes.game.scoreboard.reset();
    this.game.scenes.game.reset();
    // Set the current scene back to game
    this.game.currentScene = this.game.scenes.game;
    // Start the game immediately
    this.game.scenes.game.isPlaying = true;
  }

  exitToMenu() {
    // Hide game over popup
    this.gameOverPopup.hide();
    // Reset game scene and scoreboard
    this.game.scenes.game.scoreboard.reset();
    this.game.scenes.game.reset();
    // Update high score in start menu
    this.game.popupMenu.updateHighScore();
    // Show the start popup menu
    this.game.popupMenu.show();
    this.game.currentScene = null;
  }
}
