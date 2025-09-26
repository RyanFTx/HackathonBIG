/**
 * Menu Scene
 * Simple main menu (future enhancement)
 */

export class MenuScene {
  constructor() {
    this.active = false;
  }

  show() {
    this.active = true;
    // Future: Display main menu UI
  }

  hide() {
    this.active = false;
  }

  handleInput(key) {
    // Future: Handle menu navigation
    if (key === 'Space' && this.active) {
      return 'START_GAME';
    }
    return null;
  }

  render(ctx) {
    if (!this.active) return;

    // Future: Render main menu
    ctx.fillStyle = '#4CAF50';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SnakeLang', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
    ctx.font = '16px Arial';
    ctx.fillText('Press Space to Start', ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
  }

  isActive() {
    return this.active;
  }
}