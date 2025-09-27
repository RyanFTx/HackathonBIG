/**
 * Effect UI
 * Displays active effects and visual feedback
 */

export class EffectUI {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 6;
  }

  showEffect(type, message, duration = 2000) {
    const notification = {
      type,
      message,
      startTime: Date.now(),
      duration
    };
    // Allow duplicates for score toasts so each pickup shows independently
    if (type === 'score') {
      this.notifications.push(notification);
    } else {
      // Avoid duplicates back-to-back for non-score types
      const last = this.notifications[this.notifications.length - 1];
      if (!last || last.message !== notification.message || last.type !== notification.type) {
        this.notifications.push(notification);
      }
    }
    // Cap list size
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.splice(0, this.notifications.length - this.maxNotifications);
    }
  }

  showScoreGain(points) {
    const sign = points >= 0 ? '+' : '';
    this.showEffect('score', `${sign}${points}`);
  }

  showLengthChange(segmentsDelta) {
    if (segmentsDelta === 0) return;
    if (segmentsDelta > 0) {
      // this.showEffect('grow', `Grow +${segmentsDelta}`);
    } else {
      // this.showEffect('shrink', `Shrink ${Math.abs(segmentsDelta)}`);
    }
  }

  showGameOver(finalScore, isHighScore) {
    // GameOverPopup now handles game over UI. No alert needed.
    // const message = isHighScore
    //   ? `🎉 NEW HIGH SCORE! 🎉\nScore: ${finalScore}\nPress Space to play again!`
    //   : `Game Over!\nScore: ${finalScore}\nPress Space to restart!`;
    // alert(message);
  }

  update() {
    const currentTime = Date.now();
    this.notifications = this.notifications.filter(n => (currentTime - n.startTime) < n.duration);
  }

  render(ctx, snakeHead = {x: 0, y: 0}, snakeSize = 24, camera = {x: 0, y: 0}) {
    // Position notifications above the snake's head
    const baseFontSize = Math.max(20, Math.round(snakeSize * 1.3));
    const lineHeight = Math.round(baseFontSize * 1.2);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `bold ${baseFontSize}px Arial`;

    // Calculate screen position for snake head
    const screenX = ctx.canvas.width / 2 - camera.x + snakeHead.x;
    const screenY = ctx.canvas.height / 2 - camera.y + snakeHead.y - snakeSize - 8;

    this.notifications.forEach((n, i) => {
      const elapsed = Date.now() - n.startTime;
      const t = Math.max(0, Math.min(1, 1 - elapsed / n.duration));
      // Float up slightly as it fades
      const floatUp = (1 - t) * 6 + i * lineHeight;
      const y = screenY - floatUp;

      // Color by type
      let color = '#ffffff';
      if (n.type === 'score') color = '#FFD700';
      if (n.type === 'grow') color = '#66BB6A';
      if (n.type === 'shrink') color = '#BA68C8';

      ctx.globalAlpha = 0.2 + 0.8 * t; // fade out
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      const textWidth = ctx.measureText(n.message).width;
      ctx.fillRect(screenX - textWidth / 2 - 6, y - lineHeight + 2, textWidth + 12, lineHeight - 4);

      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.fillText(n.message, screenX, y);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }

  clear() {
    this.notifications = [];
  }
}