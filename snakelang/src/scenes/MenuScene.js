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
  const titleFontSize = Math.round(ctx.canvas.height * 0.06); // 6% of canvas height
  const subtitleFontSize = Math.round(ctx.canvas.height * 0.03); // 3% of canvas height
  ctx.font = `${titleFontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('SnakeLang', ctx.canvas.width / 2, ctx.canvas.height / 2 - titleFontSize);
  ctx.font = `${subtitleFontSize}px Arial`;
  ctx.fillText('Press Space to Start', ctx.canvas.width / 2, ctx.canvas.height / 2 + subtitleFontSize);
  }

  isActive() {
    return this.active;
  }
}