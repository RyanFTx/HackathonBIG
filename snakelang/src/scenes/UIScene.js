/**
 * UI Scene
 * Handles HUD overlays and interface elements
 */

export class UIScene {
  constructor() {
    this.active = true;
    this.setupHTML();
  }

  setupHTML() {
    // This matches the existing HTML structure
    document.querySelector('#app').innerHTML = `
      <div id="game-container">
        <div id="game-ui">
          <div id="score">Score: 0</div>
          <div id="lives">Lives: ❤️❤️❤️</div>
        </div>
        <canvas id="game-canvas" width="800" height="600"></canvas>
        <div id="instructions">
          <p>🎮 <strong>Controls:</strong> A/D or ← → to steer, W/↑ for speed boost</p>
          <p>🐍 <strong>Goal:</strong> Eat orbs with Chinese words to grow!</p>
          <p>✨ <strong>Slither.io Style:</strong> Smooth movement, no grid!</p>
        </div>
        <div id="start-instructions">
          <p><strong>Press SPACE to start!</strong> Use A/D or ← → to steer, W/↑ to boost</p>
        </div>
      </div>
    `;

    // Add styling to start instructions
    const startInstructions = document.getElementById('start-instructions');
    if (startInstructions) {
      startInstructions.style.cssText = 'color: #4CAF50; font-size: 1.2em; margin: 1rem 0; font-weight: bold;';
    }
  }

  render() {
    // UI is handled by HTML elements and scoreboard
    // Canvas-based UI rendering would go here if needed
  }

  isActive() {
    return this.active;
  }
}