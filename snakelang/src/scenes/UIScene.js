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
    // Use #ui-root for UI container
    const uiRoot = document.querySelector('#ui-root');
    if (uiRoot) {
      uiRoot.innerHTML = `
        <div id="game-ui">
          <div id="score">Score: 0</div>
          <div id="lives">Lives: ❤️❤️❤️</div>
        </div>
      `;
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