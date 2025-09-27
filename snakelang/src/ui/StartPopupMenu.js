// /root/HackathonBIG/snakelang/ui/StartPopupMenu.js
export class StartPopupMenu {
  constructor(options = {}) {
    this.active = true;
    this.highScore = this.loadHighScore();

    this.languages = [
      { key: 'characters', label: 'Characters (汉字)'},
      { key: 'pinyin',     label: 'Pinyin (拼音)'},
      { key: 'mixed',      label: 'Mixed'},
    ];
    this.languageIndex = 0;

    this.orbTypes = options.orbTypes || [
      { key: 'normal',    label: 'Normal'    },
      { key: 'explosive', label: 'Explosive' },
      { key: 'speed',     label: 'Speed'     }
    ];
    this.orbPercentages = options.orbPercentages ? { ...options.orbPercentages } : { normal: 60, explosive: 20, speed: 20 };

    // Visual spec for distribution rows
    this.orbVisual = {
      normal:    { label: 'Normal',    icon: '●', colorA: '#26c281', colorB: '#3ee37f', text: '#c2ffd8' },
      speed:     { label: 'Speed',     icon: '➤', colorA: '#2aa9ff', colorB: '#6fe3ff', text: '#c8f3ff' },
      explosive: { label: 'Explosive', icon: '✦', colorA: '#ff6b6b', colorB: '#ffa06b', text: '#ffe1cf' },
    };

    this._normalizeAll();

    this.hoverId = null;
    this.pressedId = null;
    this._rects = {};
    this.onStart = null;
    this.isMuted = false;

    this.step = 5;

    this.difficultyLevels = [
      { key: 'easy',    label: 'Easy',    orbPercentages: { normal: 100 } },
      { key: 'medium',  label: 'Medium',  orbPercentages: { normal: 70, speed: 30 } },
      { key: 'hard',    label: 'Hard',    orbPercentages: { normal: 10, speed: 40, explosive: 50 } },
      { key: 'endless', label: 'Endless', orbPercentages: { normal: 60, speed: 20, explosive: 20 } }
    ];
    this.difficultyIndex = 0;
  }

  show() { this.active = true; }
  hide() { this.active = false; }
  isActive() { return this.active; }

  /**
   * Load high score from localStorage
   * @returns {number} - The high score (0 if not found or error)
   */
  loadHighScore() {
    try {
      const stored = localStorage.getItem('snakeLangHighScore');
      if (stored === null) return 0;
      
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    } catch (error) {
      console.warn('Failed to load high score from localStorage:', error);
      return 0;
    }
  }

  /**
   * Update high score (called when returning from game)
   */
  updateHighScore() {
    this.highScore = this.loadHighScore();
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
    if (this._canvas) this._canvas.style.cursor = this.hoverId ? 'pointer' : 'default';
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
    if (id && id === this.pressedId) this._activate(id);
    this.pressedId = null;
  }
  _getMouse(e) {
    const rect = this._canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this._canvas.width / rect.width),
      y: (e.clientY - rect.top)  * (this._canvas.height / rect.height)
    };
  }

  _activate(id) {
    if (id.startsWith('lang:')) {
      const idx = parseInt(id.split(':')[1], 10);
      this.languageIndex = idx;
      return;
    }
    if (id.startsWith('diff:')) {
      const idx = parseInt(id.split(':')[1], 10);
      this.difficultyIndex = idx;
      return;
    }
    if (id === 'start') {
      this.hide();
      this.onStart?.({
        language: this.languages[this.languageIndex].key,
        orbPercentages: { ...this.difficultyLevels[this.difficultyIndex].orbPercentages },
        difficulty: this.difficultyLevels[this.difficultyIndex].key
      });
      return;
    }
    if (id === 'mute') {
      this.isMuted = !this.isMuted;
      // Notify the main game about mute state change
      if (window.gameController && window.gameController.audioManager) {
        window.gameController.audioManager.toggleMute();
      }
      return;
    }
  }

  _normalizeAll() {
    let total = this.orbTypes.reduce((s, t) => s + (this.orbPercentages[t.key] || 0), 0);
    if (total === 0) {
      this.orbPercentages[this.orbTypes[0].key] = 100;
      for (let i = 1; i < this.orbTypes.length; i++) this.orbPercentages[this.orbTypes[i].key] = 0;
      return;
    }
    const scale = 100 / total;
    for (const t of this.orbTypes) {
      this.orbPercentages[t.key] = Math.round((this.orbPercentages[t.key] || 0) * scale / this.step) * this.step;
      this.orbPercentages[t.key] = Math.max(0, Math.min(100, this.orbPercentages[t.key]));
    }
    this._fixDrift();
  }
  _normalizeOthersKeeping(selectedIndex) {
    const selKey = this.orbTypes[selectedIndex].key;
    const selVal = this.orbPercentages[selKey];
    const others = this.orbTypes.filter((_, i) => i !== selectedIndex).map(o => o.key);
    const sumOthers = others.reduce((s, k) => s + this.orbPercentages[k], 0);
    const needed = 100 - selVal;
    if (sumOthers === 0) {
      this.orbPercentages[others[0]] = Math.max(0, Math.min(100, needed));
      for (let i = 1; i < others.length; i++) this.orbPercentages[others[i]] = 0;
      this._fixDrift();
      return;
    }
    const scale = needed / sumOthers;
    for (const k of others) {
      let v = Math.round((this.orbPercentages[k] * scale) / this.step) * this.step;
      v = Math.max(0, Math.min(100, v));
      this.orbPercentages[k] = v;
    }
    this._fixDrift();
  }
  _fixDrift() {
    let total = this.orbTypes.reduce((s, t) => s + this.orbPercentages[t.key], 0);
    const diff = 100 - total;
    if (diff === 0) return;
    let bestK = this.orbTypes[0].key;
    for (const t of this.orbTypes) {
      if (this.orbPercentages[t.key] > this.orbPercentages[bestK]) bestK = t.key;
    }
    this.orbPercentages[bestK] = Math.max(0, Math.min(100, this.orbPercentages[bestK] + diff));
  }

  // ---------- Rendering ----------
  render(ctx) {
    if (!this.active) return;

    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    const PW  = Math.min(560, Math.floor(W * 0.8));
    const PX  = Math.floor((W - PW) / 2);
    const PY  = Math.max(40, Math.floor(H * 0.12));
    const PAD = 24;

    // overlay
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#0b1022';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

  // --- Dynamic font sizes and layout variables based on canvas height ---
 const minDimension = Math.min(W, H);
  const fontScale = Math.max(0.7, Math.min(1.5, minDimension / 700));
  const titleFont = `bold ${Math.round(26 * fontScale)}px Inter, Arial`;
  const labelFont = `600 ${Math.round(16 * fontScale)}px Inter, Arial`;
  const smallFont = `600 ${Math.round(14 * fontScale)}px Inter, Arial`;
  const btnFont = `700 ${Math.round(18 * fontScale)}px Inter, Arial`;
  const orbFont = `700 ${Math.round(16 * fontScale)}px Inter, Arial`;
  const gap = Math.round(16 * fontScale);
  const btnH = Math.round(40 * fontScale);
  const langPerRow = 3;
  const diffCount = this.difficultyLevels.length;
  const perRow = Math.min(3, diffCount);
  const rowCount = Math.ceil(diffCount / perRow);

    // --- Calculate dynamic panel height to fit all content ---
    let panelHeight = 0;
    // Title + high score + languages + difficulties
    panelHeight += Math.round(36 * fontScale); // title
    if (this.highScore > 0) {
      panelHeight += Math.round(16 * fontScale) + Math.round(20 * fontScale) + Math.round(24 * fontScale); // high score
    } else {
      panelHeight += Math.round(20 * fontScale); // spacing
    }
    panelHeight += Math.round(22 * fontScale) + btnH + Math.round(24 * fontScale); // languages
    // Difficulty rows
    panelHeight += rowCount * (btnH + Math.round(16 * fontScale)) + Math.round(8 * fontScale);
    // Orb distribution title + bars
    panelHeight += Math.round(18 * fontScale);
    // Estimate distribution bar height
    const orbBarCount = Object.keys(this.difficultyLevels[this.difficultyIndex].orbPercentages).length;
    panelHeight += orbBarCount * (Math.round(16 * fontScale) + 10 + 14); // fontPx + barH + rowGap
  // Gap below bars + start button (reduce gap below bars, increase gap above button)
  panelHeight += Math.round(16 * fontScale); // smaller gap below bars
  panelHeight += Math.round(64 * fontScale); // larger gap above start button
  panelHeight += Math.round(48 * fontScale); // start button height

    this._roundRect(ctx, PX, PY, PW, panelHeight, 16, '#1e2442');

    // title
    this._text(ctx, 'Game Setup', W/2, PY + PAD, titleFont, '#FFFFFF', 'center');

    let y = PY + PAD + Math.round(36 * fontScale);

    // High score display
    if (this.highScore > 0) {
      this._text(ctx, '🏆 High Score', W/2, y, `600 ${Math.round(14 * fontScale)}px Inter, Arial`, '#B0BEC5', 'center');
      y += Math.round(16 * fontScale);
      this._text(ctx, `${this.highScore}`, W/2, y, `700 ${Math.round(20 * fontScale)}px Inter, Arial`, '#FFD700', 'center');
      y += Math.round(24 * fontScale);
    } else {
      y += Math.round(20 * fontScale);
    }

    // languages
    this._text(ctx, 'Choose Language', W/2, y, labelFont, '#A9B3D1', 'center');
    y += Math.round(22 * fontScale);

  const langBtnW = Math.floor((PW - PAD*2 - gap*(langPerRow - 1)) / langPerRow);
    let x = PX + PAD;

    this._rects = {};

    this.languages.forEach((opt, i) => {
      const id = `lang:${i}`;
      const selected = (this.languageIndex === i);
      const hover = (this.hoverId === id);
      this._buttonFancy(ctx, id, x, y, langBtnW, btnH, {
        label: opt.label, selected, hover, theme: 'base', selBorder: true, font: btnFont
      });
      x += langBtnW + gap;
    });

    y += btnH + Math.round(24 * fontScale);

    // difficulties
    this._text(ctx, 'Select Difficulty', W/2, y, labelFont, '#A9B3D1', 'center');
    y += Math.round(22 * fontScale);

  const diffBtnW = Math.floor((PW - PAD*2 - gap*(perRow - 1)) / perRow);

    for (let row = 0; row < rowCount; row++) {
      const itemsInRow = Math.min(perRow, diffCount - row * perRow);
      const rowWidth = itemsInRow * diffBtnW + (itemsInRow - 1) * gap;
      let xStart = PX + PAD + Math.floor((PW - PAD*2 - rowWidth) / 2);
      for (let col = 0; col < itemsInRow; col++) {
        const i = row * perRow + col;
        const level = this.difficultyLevels[i];
      const id = `diff:${i}`;
      const selected = (this.difficultyIndex === i);
      const hover = (this.hoverId === id);
        const isEndless = level.key === 'endless';
        this._buttonFancy(ctx, id, xStart, y, diffBtnW, btnH, {
          label: level.label,
          // subtitle: isEndless ? 'No limits. Just flow.' : undefined,
          icon: isEndless ? '∞' : undefined,
          selected, hover, theme: 'base', selBorder: true, font: btnFont
        });
        xStart += diffBtnW + gap;
      }
      y += btnH + Math.round(16 * fontScale);
    }
    y += Math.round(8 * fontScale);

    // orb distribution (new, formatted)
    const orbP = this.difficultyLevels[this.difficultyIndex].orbPercentages;
    this._text(ctx, 'Orb Distribution (%)', W/2, y, labelFont, '#A9B3D1', 'center');
    y += Math.round(18 * fontScale);
    y += this._drawOrbDistribution(ctx, PX + PAD, y, PW - PAD * 2, orbP, orbFont);
  // Add extra vertical gap below distribution bars (reduce gap so button is higher)
  y += Math.round(16 * fontScale); // smaller gap below bars

    const startW = Math.round(200 * fontScale), startH = Math.round(48 * fontScale);
    const startX = W/2 - startW/2;
    // Move button up by half its height
    const startY = y
    this._buttonFancy(ctx, 'start', startX, startY, startW, startH, {
      label: 'Start Game', icon: '▶', selected: false, hover: this.hoverId === 'start', theme: 'primary', font: btnFont
    });

    // Mute/Unmute button
    const muteW = Math.round(60 * fontScale), muteH = Math.round(36 * fontScale);
    const muteX = startX + startW + Math.round(16 * fontScale);
    const muteY = startY + (startH - muteH) / 2;
    this._buttonFancy(ctx, 'mute', muteX, muteY, muteW, muteH, {
      label: this.isMuted ? '🔇' : '🔊', 
      selected: false, 
      hover: this.hoverId === 'mute', 
      theme: 'base', 
      font: btnFont
    });
  }

  // ----- Orb distribution helpers -----
  _drawOrbDistribution(ctx, x, y, w, orbP) {
    const order = ['normal', 'speed', 'explosive'];
    const rowGap = 14;
    const barH = 10;
    let used = 0;

    const font = arguments[4] || '700 16px Inter, Arial';
    // Extract font size from string (e.g., '700 16px Inter, Arial')
    let fontPx = 16;
    if (typeof font === 'string') {
      const match = font.match(/(\d+)px/);
      if (match) fontPx = parseInt(match[1], 10);
    }
    order.forEach((key, idx) => {
      if (!(key in orbP)) return;
      const pct = Math.max(0, Math.min(100, orbP[key] | 0));
      const vis = this.orbVisual[key] || { label: key, icon: '•', colorA: '#666', colorB: '#777', text: '#ddd' };

      // Left: icon + label
      this._text(ctx, `${vis.icon}  ${vis.label}`, x, y + used, font, '#DCE3FF', 'left', 'middle');
      // Right: percentage
      this._text(ctx, `${pct}%`, x + w, y + used, font, '#FFFFFF', 'right', 'middle');

      // Bar under the row (place directly below text, offset by half font size)
      const barY = y + used + Math.round(fontPx * 0.5);
      this._progressBar(ctx, x, barY, w, barH, pct / 100, vis.colorA, vis.colorB);

      used += fontPx + barH + rowGap;
    });

    return used;
  }

  _progressBar(ctx, x, y, w, h, p, cA, cB) {
  // Defensive: ensure w, h, and fillW are finite and positive
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
  const r = Math.max(1, Math.floor(h / 2));
  // Track
  this._roundRect(ctx, x, y, w, h, r, 'rgba(255,255,255,0.08)');
  // Fill (why: visual emphasis)
  let fillW = Math.max(r * 2, Math.round(w * Math.max(0, Math.min(1, p))));
  if (!Number.isFinite(fillW) || fillW <= 0 || fillW > w) fillW = Math.max(r * 2, Math.min(w, w * 0.1));
  // Clamp x, y, fillW to finite values
  if (!Number.isFinite(x)) x = 0;
  if (!Number.isFinite(y)) y = 0;
  if (!Number.isFinite(fillW)) fillW = r * 2;
  const grad = ctx.createLinearGradient(x, y, x + fillW, y);
  grad.addColorStop(0, cA);
  grad.addColorStop(1, cB);
  this._roundRect(ctx, x, y, fillW, h, r, grad);
  }

  // ---------- Hit test / primitives / button ----------
  _hitTest(x, y) {
    for (const [id, r] of Object.entries(this._rects)) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return id;
    }
    return null;
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

  _buttonFancy(ctx, id, x, y, w, h, opts) {
    const { label, subtitle, icon, selected, hover, theme = 'base', selBorder = true } = opts;
    const palette = {
      base:    { a: '#3b3f5a', b: '#50567a', glow: 'rgba(111,146,255,0.40)', stroke: '#23284a', selStroke: '#cdd8ff' },
      primary: { a: '#26c281', b: '#3ee37f', glow: 'rgba(62,227,127,0.45)',  stroke: '#1b6f4d',  selStroke: '#c2ffd8' },
    };
    const colors = palette[theme] || palette.base;

    // Shape
    const r = 10;
    ctx.save();
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

    if (hover) { ctx.shadowColor = colors.glow; ctx.shadowBlur = 14; }

    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, colors.a);
    grad.addColorStop(1, colors.b);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = (selected && selBorder) ? 2 : 1;
    ctx.strokeStyle = (selected && selBorder) ? colors.selStroke : colors.stroke;
    ctx.stroke();

    const leftPad = 14;
    const cx = x + leftPad;
    const cy = y + h / 2 + 1;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';

    if (icon) { ctx.font = '700 20px Inter, Arial'; ctx.textAlign = 'left'; ctx.fillText(icon, cx, cy); }

    const textX = icon ? (cx + 24) : (x + w/2);
    ctx.font = (subtitle ? '700 16px Inter, Arial' : '700 18px Inter, Arial');
    ctx.textAlign = icon ? 'left' : 'center';
    ctx.fillText(label, textX, cy);

    if (subtitle) {
      ctx.font = '500 11px Inter, Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(subtitle, textX, cy + 14);
    }

    ctx.restore();
    this._rects[id] = { x, y, w, h };
  }
}
