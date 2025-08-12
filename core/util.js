// core/util.js
window.$$ = {
  DPR: Math.max(1, Math.min(3, window.devicePixelRatio || 1)),
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  now: () => performance.now(),
  uuid: () => 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36),
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
  debounce(fn, ms=300) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },
  throttle(fn, ms=250) {
    let last = 0, timer=null, ctx, args;
    return function(...a) {
      const now = Date.now(); ctx = this; args = a;
      const run = () => { last = now; timer = null; fn.apply(ctx, args); };
      if (now - last >= ms) run(); else if (!timer) timer = setTimeout(run, ms - (now - last));
    }
  },
  measureText(ctx, text, font) {
    ctx.save();
    ctx.font = font;
    const m = ctx.measureText(text);
    ctx.restore();
    return m;
  },
  safeAreaInsets() {
    // Use CSS env vars by reading computed padding on wrapper
    const wrap = document.getElementById('app-wrap');
    const st = getComputedStyle(wrap);
    const px = (v) => parseFloat(v.replace('px','')||'0');
    return {
      top: px(st.paddingTop), bottom: px(st.paddingBottom),
      left: px(st.paddingLeft), right: px(st.paddingRight)
    };
  },
  fmtDateISO(d) {
    if (typeof d === 'string') return d;
    const dt = new Date(d);
    return dt.toISOString().slice(0,10);
  },
  isSameDay(a,b) {
    const da = new Date(a), db = new Date(b);
    return da.getFullYear()===db.getFullYear() && da.getMonth()===db.getMonth() && da.getDate()===db.getDate();
  },
  dayName(d) {
    const idx = new Date(d).getDay(); // 0 Sun ... 6 Sat
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][idx];
  },
  addDays(iso, n) {
    const d = new Date(iso); d.setDate(d.getDate()+n);
    return d.toISOString().slice(0,10);
  },
  textWrap(ctx, text, maxWidth) {
    const words = (text||'').split(/\s+/);
    const lines = [];
    let line = '';
    for (let w of words) {
      const test = (line? line+' ':'') + w;
      if (ctx.measureText(test).width <= maxWidth) { line = test; }
      else { if (line) lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    return lines;
  },
  drawRoundRect(ctx, x,y,w,h,r) {
    const rr = Math.min(r, h/2, w/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }
};
