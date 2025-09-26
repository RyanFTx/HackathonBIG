/**
 * Effect UI
 * Displays active effects and visual feedback
 */

export class EffectUI {
  constructor() {
    this.notifications = [];
  }

  showEffect(type, message, duration = 2000) {
    const notification = {
      type,
      message,
      startTime: Date.now(),
      duration
    };
    this.notifications.push(notification);
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
    const message = isHighScore
      ? `🎉 NEW HIGH SCORE! 🎉\nScore: ${finalScore}\nPress Space to play again!`
      : `Game Over!\nScore: ${finalScore}\nPress Space to restart!`;

    alert(message);
  }

  update() {
    const currentTime = Date.now();
    this.notifications = this.notifications.filter(notification => {
      return (currentTime - notification.startTime) < notification.duration;
    });
  }

  render(ctx) {
    // Simple stacked toasts top-left
    const padding = 10;
    const lineHeight = 24;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 18px Arial';

    this.notifications.forEach((n, i) => {
      const elapsed = Date.now() - n.startTime;
      const t = Math.max(0, Math.min(1, 1 - elapsed / n.duration));
      const y = padding + i * lineHeight;

      // Color by type
      let color = '#ffffff';
      if (n.type === 'score') color = '#FFD700';
      if (n.type === 'grow') color = '#66BB6A';
      if (n.type === 'shrink') color = '#BA68C8';

      ctx.globalAlpha = 0.2 + 0.8 * t; // fade out
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      const textWidth = ctx.measureText(n.message).width;
      ctx.fillRect(padding - 6, y - 2, textWidth + 12, lineHeight - 4);

      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.fillText(n.message, padding, y);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }

  clear() {
    this.notifications = [];
  }
}