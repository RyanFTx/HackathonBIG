// /root/HackathonBIG/snakelang/ui/StartPopupMenu.js
export class StartPopupMenu {
  constructor(options = {}) {
    this.active = true;

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

    // panel
    const ph = 440; // slightly taller to fit bars cleanly
    this._roundRect(ctx, PX, PY, PW, ph, 16, '#1e2442');

    // title
    this._text(ctx, 'Game Setup', W/2, PY + PAD, 'bold 26px Inter, Arial', '#FFFFFF', 'center');

    let y = PY + PAD + 36;

    // languages
    this._text(ctx, 'Choose Language', W/2, y, '600 16px Inter, Arial', '#A9B3D1', 'center');
    y += 22;

    const gap = 16;
    const btnH = 40;
    const langPerRow = 3;
    const langBtnW = Math.floor((PW - PAD*2 - gap*(langPerRow - 1)) / langPerRow);
    let x = PX + PAD;

    this._rects = {};

    this.languages.forEach((opt, i) => {
      const id = `lang:${i}`;
      const selected = (this.languageIndex === i);
      const hover = (this.hoverId === id);
      this._buttonFancy(ctx, id, x, y, langBtnW, btnH, {
        label: opt.label, selected, hover, theme: 'base', selBorder: true
      });
      x += langBtnW + gap;
    });

    y += btnH + 24;

    // difficulties
    this._text(ctx, 'Select Difficulty', W/2, y, '600 16px Inter, Arial', '#A9B3D1', 'center');
    y += 22;

    const perRow = Math.min(3, this.difficultyLevels.length);
    const diffCount = this.difficultyLevels.length;
    const diffBtnW = Math.floor((PW - PAD*2 - gap*(perRow - 1)) / perRow);
    const rowCount = Math.ceil(diffCount / perRow);

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
          selected, hover, theme: 'base', selBorder: true
        });
        xStart += diffBtnW + gap;
      }
      y += btnH + 16;
    }
    y += 8;

    // orb distribution (new, formatted)
    const orbP = this.difficultyLevels[this.difficultyIndex].orbPercentages;
    this._text(ctx, 'Orb Distribution (%)', W/2, y, '600 16px Inter, Arial', '#A9B3D1', 'center');
    y += 18;
    y += this._drawOrbDistribution(ctx, PX + PAD, y, PW - PAD * 2, orbP) + 20;

    const startW = 200, startH = 48;
    const startX = W/2 - startW/2;
    const startY = PY + 440 - startH + 70 ;
    this._buttonFancy(ctx, 'start', startX, startY, startW, startH, {
      label: 'Start Game', icon: '▶', selected: false, hover: this.hoverId === 'start', theme: 'primary'
    });
  }

  // ----- Orb distribution helpers -----
  _drawOrbDistribution(ctx, x, y, w, orbP) {
    const order = ['normal', 'speed', 'explosive'];
    const rowGap = 14;
    const barH = 10;
    let used = 0;

    order.forEach((key, idx) => {
      if (!(key in orbP)) return;
      const pct = Math.max(0, Math.min(100, orbP[key] | 0));
      const vis = this.orbVisual[key] || { label: key, icon: '•', colorA: '#666', colorB: '#777', text: '#ddd' };

      // Left: icon + label
      this._text(ctx, `${vis.icon}  ${vis.label}`, x, y + used, '700 16px Inter, Arial', '#DCE3FF', 'left', 'middle');
      // Right: percentage
      this._text(ctx, `${pct}%`, x + w, y + used, '700 16px Inter, Arial', '#FFFFFF', 'right', 'middle');

      // Bar under the row
      const barY = y + used + 12;
      this._progressBar(ctx, x, barY, w, barH, pct / 100, vis.colorA, vis.colorB);

      used += 16 + barH + rowGap;
    });

    return used;
  }

  _progressBar(ctx, x, y, w, h, p, cA, cB) {
    const r = Math.floor(h / 2);
    // Track
    this._roundRect(ctx, x, y, w, h, r, 'rgba(255,255,255,0.08)');
    // Fill (why: visual emphasis)
    const fillW = Math.max(r * 2, Math.round(w * Math.max(0, Math.min(1, p))));
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
