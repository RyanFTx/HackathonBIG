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

  showScoreGain(points, x, y) {
    // Future: Show floating score text at position
    this.showEffect('score', `+${points}`);
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
    // Future: Render notifications on canvas
    // For now, using console/alert for feedback
  }

  clear() {
    this.notifications = [];
  }
}