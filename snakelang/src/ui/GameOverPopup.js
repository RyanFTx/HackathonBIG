// /root/HackathonBIG/snakelang/ui/GameOverPopup.js
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
    this.wrongAnswers = wrongAnswers || [];
  }
  hide() { this.active = false; }
  isActive() { return this.active; }

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
    if (this._canvas) this._canvas.style.cursor = this.hoverId ? 'pointer' : 'default';
  }
  _handleMouseDown(e) {
    if (!this.active) return;
    const p = this._getMouse(e);
    this.pressedId = this._hitTest(p.x, p.y);
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
    return {
      x: (e.clientX - rect.left) * (this._canvas.width / rect.width),
      y: (e.clientY - rect.top)  * (this._canvas.height / rect.height)
    };
  }
  _hitTest(x, y) {
    for (const [id, r] of Object.entries(this._rects)) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return id;
    }
    return null;
  }

  render(ctx) {
    if (!this.active) return;

    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    this._rects = {};

    // Modern backdrop with blur effect
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#0A0E1A';
    ctx.fillRect(0, 0, W, H);
    
    // Add subtle gradient overlay
    const gradient = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H));
    gradient.addColorStop(0, 'rgba(74, 20, 140, 0.1)');
    gradient.addColorStop(1, 'rgba(10, 14, 26, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Modern sizing and spacing
    const PW = Math.min(800, Math.floor(W * 0.9));
    const PAD = Math.max(24, Math.floor(H * 0.03));
    const titleFS = Math.round(Math.min(48, H * 0.08));
    const scoreFS = Math.round(Math.min(28, H * 0.05));
    const sectionFS = Math.round(Math.min(18, H * 0.035));
    const tableHdrFS = Math.round(Math.min(16, H * 0.03));
    const tableFS = Math.round(Math.min(15, H * 0.028));
    const btnW = 200, btnH = 52, btnGap = 24;

    // Table metrics
    const hasRows = this.wrongAnswers && this.wrongAnswers.length > 0;
    const maxRows = Math.min(6, hasRows ? this.wrongAnswers.length : 0);
    const rowH = Math.max(40, tableFS + 16);
    const hdrH = Math.max(44, tableHdrFS + 20);
    const tableH = hasRows ? (hdrH + maxRows * rowH + 20) : 0;

    // Calculate content height
    let contentH = 0;
    contentH += titleFS + 16;              // title + spacing
    contentH += scoreFS + 24;              // score badge + spacing
    if (hasRows) contentH += sectionFS + 16 + tableH + 24;
    contentH += btnH + 32;                 // buttons + bottom spacing

    const PH = Math.min(Math.max(contentH + PAD * 2, 400), Math.floor(H * 0.85));
    const PX = Math.floor((W - PW) / 2);
    const PY = Math.floor((H - PH) / 2);
    const R = 20;

    // Modern glassmorphism panel
    this._modernCard(ctx, PX, PY, PW, PH, R);

    // Title with modern styling
    let y = PY + PAD + titleFS;
    this._text(ctx, 'Game Over', PX + PW / 2, y, `900 ${titleFS}px 'Segoe UI', Inter, Arial`, '#FF6B6B', 'center', 'middle');
    y += titleFS + 20;

    // Modern score badge
    this._modernBadge(ctx, PX + PW / 2, y + scoreFS / 2, `Score: ${this.score}`, scoreFS);
    y += scoreFS + 32;

    // Review section
    if (hasRows) {
      this._text(ctx, 'Words for Review', PX + PW / 2, y, `600 ${sectionFS}px 'Segoe UI', Inter, Arial`, '#E8F4FD', 'center', 'middle');
      y += sectionFS + 20;

      const boxX = PX + PAD;
      const boxW = PW - PAD * 2;
      this._modernTable(ctx, boxX, y, boxW, tableH, 16, {
        header: { labels: ['Chinese', 'Correct'], height: hdrH, font: `700 ${tableHdrFS}px 'Segoe UI', Inter, Arial` },
        rows: this.wrongAnswers.slice(0, maxRows).map(r => [r.chinese ?? '', r.correct ?? '']),
        rowH,
        font: `500 ${tableFS}px 'Segoe UI', Inter, Arial`,
      });
      y += tableH + 32;
    }

    // Modern buttons
    const bx = PX + PW / 2 - (btnW + btnGap/2);
    const by = y;
    this._modernButton(ctx, 'tryagain', bx, by, btnW, btnH, {
      label: 'Try Again',
      primary: true,
      hover: this.hoverId === 'tryagain',
      pressed: this.pressedId === 'tryagain'
    });
    this._modernButton(ctx, 'exit', bx + btnW + btnGap, by, btnW, btnH, {
      label: 'Exit',
      primary: false,
      hover: this.hoverId === 'exit',
      pressed: this.pressedId === 'exit'
    });
  }

  // ---------- Modern Drawing primitives ----------
  _modernCard(ctx, x, y, w, h, r) {
    // Glassmorphism effect
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, 'rgba(30, 35, 60, 0.95)');
    g.addColorStop(0.5, 'rgba(20, 25, 45, 0.9)');
    g.addColorStop(1, 'rgba(15, 20, 35, 0.95)');
    
    this._roundRect(ctx, x, y, w, h, r, g);
    
    // Modern border with gradient
    const borderGradient = ctx.createLinearGradient(x, y, x + w, y + h);
    borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    this._strokeRound(ctx, x, y, w, h, r, borderGradient, 1);
    
    // Subtle inner glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    this._strokeRound(ctx, x + 1, y + 1, w - 2, h - 2, r - 1, 'rgba(255, 255, 255, 0.1)', 1);
    ctx.restore();
  }
  _modernBadge(ctx, cx, cy, text, fs) {
    const padX = Math.round(fs * 0.8);
    const padY = Math.round(fs * 0.4);
    ctx.font = `700 ${fs}px 'Segoe UI', Inter, Arial`;
    const tw = ctx.measureText(text).width;
    const bw = tw + padX * 2;
    const bh = fs + padY * 2;
    const x = Math.round(cx - bw / 2);
    const y = Math.round(cy - bh / 2);
    const r = Math.min(20, Math.floor(bh / 2));
    
    // Modern gradient badge
    const g = ctx.createLinearGradient(x, y, x + bw, y + bh);
    g.addColorStop(0, '#4CAF50');
    g.addColorStop(0.5, '#66BB6A');
    g.addColorStop(1, '#81C784');
    
    this._roundRect(ctx, x, y, bw, bh, r, g);
    
    // Add glow effect
    ctx.save();
    ctx.shadowColor = 'rgba(76, 175, 80, 0.4)';
    ctx.shadowBlur = 8;
    this._roundRect(ctx, x, y, bw, bh, r, g);
    ctx.restore();
    
    // Text with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${fs}px 'Segoe UI', Inter, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
    ctx.restore();
  }

  _modernTable(ctx, x, y, w, h, r, opt) {
    ctx.save();
    this._pathRound(ctx, x, y, w, h, r);
    ctx.clip();

    // Modern table background
    const base = ctx.createLinearGradient(x, y, x + w, y + h);
    base.addColorStop(0, 'rgba(40, 50, 80, 0.8)');
    base.addColorStop(1, 'rgba(30, 40, 65, 0.9)');
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);

    // Modern header
    const hh = opt.header.height;
    const hg = ctx.createLinearGradient(x, y, x + w, y + hh);
    hg.addColorStop(0, 'rgba(60, 80, 120, 0.9)');
    hg.addColorStop(1, 'rgba(50, 70, 110, 0.9)');
    ctx.fillStyle = hg;
    ctx.fillRect(x, y, w, hh);

    // Header text
    const colPad = 20;
    const colW = (w - colPad * 2) / 2;
    ctx.fillStyle = '#E8F4FD';
    ctx.font = opt.header.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opt.header.labels[0], x + colPad + colW * 0.5, y + hh / 2);
    ctx.fillText(opt.header.labels[1], x + colPad + colW * 1.5, y + hh / 2);

    // Modern rows
    const rows = opt.rows || [];
    const rowH = opt.rowH;
    let ry = y + hh;
    for (let i = 0; i < rows.length; i++) {
      // Alternating row colors
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x, ry, w, rowH);

      // Row text
      ctx.font = opt.font;
      this._clipText(ctx, rows[i][0], x + colPad, ry + rowH / 2, colW - 10, opt.font, '#FFFFFF', 'left');
      this._clipText(ctx, rows[i][1], x + colPad + colW, ry + rowH / 2, colW - 10, `600 ${opt.font.split(' ').slice(-2).join(' ')}`, '#4CAF50', 'left');

      ry += rowH;
    }

    ctx.restore();
    this._strokeRound(ctx, x, y, w, h, r, 'rgba(255,255,255,0.15)', 1);
  }

  _modernButton(ctx, id, x, y, w, h, opts = {}) {
    const { label, primary = false, hover = false, pressed = false } = opts;
    const r = 16;
    const dy = pressed ? 2 : 0;

    ctx.save();
    
    if (primary) {
      // Primary button - green gradient
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#4CAF50');
      grad.addColorStop(0.5, '#66BB6A');
      grad.addColorStop(1, '#81C784');
      
      if (hover) {
        ctx.shadowColor = 'rgba(76, 175, 80, 0.4)';
        ctx.shadowBlur = 12;
      }
      this._roundRect(ctx, x, y + dy, w, h, r, grad);
      this._strokeRound(ctx, x, y + dy, w, h, r, 'rgba(76, 175, 80, 0.3)', 1);
      
      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `600 16px 'Segoe UI', Inter, Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + dy + h / 2);
    } else {
      // Secondary button - dark glass
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, 'rgba(60, 70, 90, 0.8)');
      grad.addColorStop(1, 'rgba(40, 50, 70, 0.9)');
      
      if (hover) {
        ctx.shadowColor = 'rgba(100, 150, 255, 0.3)';
        ctx.shadowBlur = 10;
      }
      this._roundRect(ctx, x, y + dy, w, h, r, grad);
      this._strokeRound(ctx, x, y + dy, w, h, r, 'rgba(255, 255, 255, 0.2)', 1);
      
      // Text
      ctx.fillStyle = '#E8F4FD';
      ctx.font = `600 16px 'Segoe UI', Inter, Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + dy + h / 2);
    }
    
    ctx.restore();
    this._rects[id] = { x, y, w, h };
  }

  // ------- path helpers -------
  _roundRect(ctx, x, y, w, h, r, fillStyle) {
    this._pathRound(ctx, x, y, w, h, r);
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  _strokeRound(ctx, x, y, w, h, r, color, lw = 1) {
    this._pathRound(ctx, x, y, w, h, r);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  _pathRound(ctx, x, y, w, h, r) {
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
  }
  _text(ctx, text, x, y, font, color, align = 'left', baseline = 'middle') {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  }
  _clipText(ctx, text, x, cy, maxWidth, font, color, align) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.rect(x, cy - 14, maxWidth, 28);
    ctx.clip();
    ctx.fillText(text, x, cy);
    ctx.restore();
  }
}
