// GameOverPopup.js
export class GameOverPopup {
  constructor() {
    this.active = false;
    this.score = 0;
    this.wrongAnswers = [];
    this.onTryAgain = null;
    this.onExit = null;
    this.hoverId = null;
    this.pressedId = null;
    this._rects = {};
  }

  show(score, wrongAnswers = []) {
    this.active = true;
    this.score = score;
    this.wrongAnswers = wrongAnswers;
  }

  hide() {
    this.active = false;
  }

  isActive() {
    return this.active;
  }

  attach(canvas) {
    this._canvas = canvas;
    this._onMouseMove = (e) => this._handleMouseMove(e);
    this._onMouseDown = (e) => this._handleMouseDown(e);
    this._onMouseUp   = (e) => this._handleMouseUp(e);
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mouseup',   this._onMouseUp);
  }
  detach() {
    if (!this._canvas) return;
    this._canvas.removeEventListener('mousemove', this._onMouseMove);
    this._canvas.removeEventListener('mousedown', this._onMouseDown);
    this._canvas.removeEventListener('mouseup',   this._onMouseUp);
    this._canvas = null;
  }

  _handleMouseMove(e) {
    if (!this.active) return;
    const p = this._getMouse(e);
    this.hoverId = this._hitTest(p.x, p.y);
    if (this._canvas) {
      this._canvas.style.cursor = this.hoverId ? 'pointer' : 'default';
    }
  }
  _handleMouseDown(e) {
    if (!this.active) return;
    const p = this._getMouse(e);
    const id = this._hitTest(p.x, p.y);
    this.pressedId = id;
  }
  _handleMouseUp(e) {
    if (!this.active) return;
    const p = this._getMouse(e);
    const id = this._hitTest(p.x, p.y);
    if (id && id === this.pressedId) {
      if (id === 'tryagain' && this.onTryAgain) this.onTryAgain();
      if (id === 'exit' && this.onExit) this.onExit();
      this.hide();
    }
    this.pressedId = null;
  }
  _getMouse(e) {
    const rect = this._canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (this._canvas.width / rect.width),
             y: (e.clientY - rect.top)  * (this._canvas.height / rect.height) };
  }
  _hitTest(x, y) {
    for (const [id, r] of Object.entries(this._rects)) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return id;
      }
    }
    return null;
  }

  render(ctx) {
    if (!this.active) return;
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    this._rects = {};

    // Fullscreen background
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#181c2a';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Title
    const titleFontSize = Math.round(H * 0.07); // 7% of canvas height
    const scoreFontSize = Math.round(H * 0.04); // 4% of canvas height
    const reviewFontSize = Math.round(H * 0.03); // 3% of canvas height
    const tableHeaderFontSize = Math.round(H * 0.025); // 2.5% of canvas height
    const tableFontSize = Math.round(H * 0.022); // 2.2% of canvas height
    const moreFontSize = Math.round(H * 0.018); // 1.8% of canvas height
    this._text(ctx, 'Game Over', W/2, H/2 - titleFontSize - 20, `bold ${titleFontSize}px Inter, Arial`, '#FF5C5C', 'center');
    this._text(ctx, `Final Score: ${this.score}`, W/2, H/2 - scoreFontSize - 10, `600 ${scoreFontSize}px Inter, Arial`, '#FFFFFF', 'center');

    // Render wrong answers as a table if any
    if (this.wrongAnswers && this.wrongAnswers.length > 0) {
      const startY = H/2 + 30;
      this._text(ctx, 'Words for Review:', W/2, startY, `600 ${reviewFontSize}px Inter, Arial`, '#FFD700', 'center');
      let y = startY + reviewFontSize + 10;

      // Table header
      this._text(ctx, 'Chinese', W/2 - 60, y, `bold ${tableHeaderFontSize}px Inter, Arial`, '#FFD700', 'center');
      this._text(ctx, 'Correct', W/2 + 60, y, `bold ${tableHeaderFontSize}px Inter, Arial`, '#FFD700', 'center');
      y += tableHeaderFontSize + 10;
      const maxToShow = 6;
      for (let i = 0; i < Math.min(this.wrongAnswers.length, maxToShow); i++) {
        const wa = this.wrongAnswers[i];
        this._text(ctx, wa.chinese, W/2 - 60, y, `${tableFontSize}px Inter, Arial`, '#FFFFFF', 'center');
        this._text(ctx, wa.correct, W/2 + 60, y, `${tableFontSize}px Inter, Arial`, '#32d672', 'center');
        y += tableFontSize + 8;
      }
      if (this.wrongAnswers.length > maxToShow) {
        this._text(ctx, `...and ${this.wrongAnswers.length - maxToShow} more`, W/2, y, `${moreFontSize}px Inter, Arial`, '#AAAAAA', 'center');
      }
      // Adjust button Y
      this._buttonYExtra = reviewFontSize + tableHeaderFontSize + Math.min(this.wrongAnswers.length, maxToShow) * (tableFontSize + 8) + 10;
    } else {
      this._buttonYExtra = 0;
    }

    // Buttons
    const btnW = 220, btnH = 60, gap = 48;
    const btnY = H/2 + 40 + (this._buttonYExtra || 0);
    const tryX = W/2 - btnW - gap/2;
    const exitX = W/2 + gap/2;
    this._button(ctx, 'tryagain', tryX, btnY, btnW, btnH, 'Try Again', {
      hover: this.hoverId === 'tryagain',
      primary: true
    });
    this._button(ctx, 'exit', exitX, btnY, btnW, btnH, 'Exit', {
      hover: this.hoverId === 'exit',
      primary: false
    });
  }

  _roundRect(ctx, x, y, w, h, r, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
  _text(ctx, text, x, y, font, color, align = 'left', baseline = 'middle') {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  }
  _button(ctx, id, x, y, w, h, label, options = {}) {
    const { hover, primary } = options;
    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.clip();
    let fillStyle = primary ? (hover ? '#32d672' : '#3ee37f') : (hover ? '#2a3352' : '#232a49');
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    this._text(ctx, label, x + w/2, y + h/2, '700 18px Inter, Arial', '#0b1022', 'center', 'middle');
    this._rects[id] = { x, y, w, h };
  }
}
