// StartPopupMenu.js
export class StartPopupMenu {
  constructor(options = {}) {
    this.active = true;

    this.languages = [
      { key: 'characters', label: 'Characters (汉字)' },
      { key: 'pinyin',     label: 'Pinyin (拼音)'   },
      { key: 'mixed',      label: 'Mixed'                    },
    ];
    this.languageIndex = 0;

    this.orbTypes = options.orbTypes || [
      { key: 'normal',    label: 'Normal'    },
      { key: 'explosive', label: 'Explosive' },
      { key: 'speed',     label: 'Speed'     }
    ];
    this.orbPercentages = options.orbPercentages ? { ...options.orbPercentages } : { normal: 60, explosive: 20, speed: 20 };
    this._normalizeAll();

    // UI state
    this.hoverId = null;
    this.pressedId = null;

    // layout caches (recomputed each frame)
    this._rects = {}; // id -> {x,y,w,h}

    // callbacks
    this.onStart = null;

    // config
    this.step = 5; // % step for – / +

    this.difficultyLevels = [
      {
        key: 'easy', label: 'Easy',
        orbPercentages: { normal: 100 }
      },
      {
        key: 'medium', label: 'Medium',
        orbPercentages: { normal: 70, speed: 30 }
      },
      {
        key: 'hard', label: 'Hard',
        orbPercentages: { normal: 10, speed: 40, explosive: 50 }
      }
    ];
    this.difficultyIndex = 0;
  }

  show() { this.active = true; }
  hide() { this.active = false; }
  isActive() { return this.active; }

  // ---------- Public: hook mouse to the canvas ----------
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

  // Mouse handling
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
      this._activate(id);
    }
    this.pressedId = null;
  }
  _getMouse(e) {
    const rect = this._canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (this._canvas.width / rect.width),
             y: (e.clientY - rect.top)  * (this._canvas.height / rect.height) };
  }

  // ---------- Actions ----------
  _activate(id) {
    // ids are like: lang:0, lang:1, diff:0, diff:1, start
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

  // ---------- Normalization (sum = 100) ----------
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
      // put all remainder into the first other
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
    // Nudge the largest bucket to absorb the diff
    let bestK = this.orbTypes[0].key;
    for (const t of this.orbTypes) {
      if (this.orbPercentages[t.key] > this.orbPercentages[bestK]) bestK = t.key;
    }
    this.orbPercentages[bestK] = Math.max(0, Math.min(100, this.orbPercentages[bestK] + diff));
  }

  //Rendering
  render(ctx) {
    if (!this.active) return;

    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    // Panel metrics
    const PW = Math.min(560, Math.floor(W * 0.8));
    const PX = Math.floor((W - PW) / 2);
    const PY = Math.max(40, Math.floor(H * 0.12));
    const PAD = 24;
    const ROW = 36;

    // clear overlay
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#0b1022';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // panel
    const ph = 380; // enough room
    this._roundRect(ctx, PX, PY, PW, ph, 16, '#1e2442');
    // Title
    this._text(ctx, 'Game Setup', W/2, PY + PAD, 'bold 26px Inter, Arial', '#FFFFFF', 'center');

    let y = PY + PAD + 36;

    // Languages
    this._text(ctx, 'Choose Language', W/2, y, '600 16px Inter, Arial', '#A9B3D1', 'center');
    y += 22;

    const gap = 16;
    const btnW = Math.floor((PW - PAD*2 - gap*2) / 3);
    const btnH = 40;
    let x = PX + PAD;

    this._rects = {}; // reset

    this.languages.forEach((opt, i) => {
      const id = `lang:${i}`;
      const selected = (this.languageIndex === i);
      const hover = (this.hoverId === id);
      this._button(ctx, id, x, y, btnW, btnH, opt.label, { selected, hover });
      x += btnW + gap;
    });

    y += btnH + 24;

    // Difficulty selection
    this._text(ctx, 'Select Difficulty', W/2, y, '600 16px Inter, Arial', '#A9B3D1', 'center');
    y += 22;

    x = PX + PAD;
    this.difficultyLevels.forEach((level, i) => {
      const id = `diff:${i}`;
      const selected = (this.difficultyIndex === i);
      const hover = (this.hoverId === id);
      this._button(ctx, id, x, y, btnW, btnH, level.label, { selected, hover });
      x += btnW + gap;
    });

    y += btnH + 24;

    // Show orb percentages for selected difficulty
    const orbP = this.difficultyLevels[this.difficultyIndex].orbPercentages;
    this._text(ctx, 'Orb Distribution (%)', W/2, y, '600 16px Inter, Arial', '#A9B3D1', 'center');
    y += 16;
    const orbRowSpacing = 48;
    const orbRows = Object.entries(orbP).length;
    // Reserve space for 3 rows, center actual rows vertically in that space
    const maxRows = 3;
    const orbBlockHeight = orbRowSpacing * maxRows;
    const orbStartY = y + (orbBlockHeight - orbRowSpacing * orbRows) / 2;
    Object.entries(orbP).forEach(([key, val], idx) => {
      const orbType = this.orbTypes.find(o => o.key === key);
      if (orbType) {
        this._text(ctx, `${orbType.label}: ${val}%`, W/2, orbStartY + idx*orbRowSpacing, '600 18px Inter, Arial', '#3ee37f', 'center');
      }
    });
    y += orbBlockHeight + 40;

    // Start button always at same place
    const startW = 200, startH = 48;
    const startX = W/2 - startW/2;
    const startY = y;
    this._button(ctx, 'start', startX, startY, startW, startH, 'Start Game', {
      selected: false,
      hover: this.hoverId === 'start',
      primary: true
    });
  }

  // Private implementation details
  _hitTest(x, y) {
    // simple AABB hit test
    for (const [id, r] of Object.entries(this._rects)) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return id;
      }
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
  _button(ctx, id, x, y, w, h, label, options = {}) {
    const { selected, hover, primary } = options;

    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.clip();

    let fillStyle = '#2b2f4d';
    if (selected) {
      fillStyle = primary ? '#6f92ff' : '#4d5268';
    } else if (hover) {
      fillStyle = '#3b3f5a';
    }
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, w, h);

    ctx.restore();

    // Text
    this._text(ctx, label, x + w/2, y + h/2, '600 18px Inter, Arial', '#FFFFFF', 'center', 'middle');

    // Save rect for hit testing
    this._rects[id] = { x, y, w, h };
  }
}
