// core/gestures.js
(function(){
  class PointerManager {
    constructor(scene){
      this.scene = scene;
      this.active = null;
      this.dragging = null;
      this.dragStart = null;
      this.longPressTimer = null;
      this.doubleTapLast = 0;
      this.doubleTapTarget = null;
      this.handlersBound = false;
      this.attach(scene.canvas);
    }
    attach(el){
      if(this.handlersBound) return;
      const opts = { passive: false };
      el.addEventListener('pointerdown', this.onDown.bind(this), opts);
      el.addEventListener('pointermove', this.onMove.bind(this), opts);
      el.addEventListener('pointerup', this.onUp.bind(this), opts);
      el.addEventListener('pointercancel', this.onCancel.bind(this), opts);
      this.handlersBound = true;
    }
    pos(e){
      const rect = this.scene.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    onDown(e){
      e.preventDefault();
      const p = this.pos(e);
      const target = this.scene.findHit(p.x, p.y);
      this.active = { target, start:p, last:p, time: $$.now() };

      // Double tap detection
      const now = $$.now();
      if (target && this.doubleTapTarget === target && (now - this.doubleTapLast) < 300) {
        if (target.onDoubleTap) target.onDoubleTap(p, e);
        this.doubleTapLast = 0; this.doubleTapTarget = null;
        return;
      }
      this.doubleTapLast = now; this.doubleTapTarget = target;

      // Long-press -> start drag
      clearTimeout(this.longPressTimer);
      this.longPressTimer = setTimeout(()=>{
        if (!this.active) return;
        const a = this.active;
        if (a.target && a.target.onLongPress) a.target.onLongPress(a.start, e);
        // If component starts drag, it should set onDrag handlers etc.
      }, 450);

      if(target && target.onPointerDown) target.onPointerDown(p, e);
    }
    onMove(e){
      if(!this.active) return;
      const p = this.pos(e);
      const a = this.active;
      const dx = p.x - a.last.x, dy = p.y - a.last.y;
      a.last = p;
      if(a.target && a.target.onPointerMove) a.target.onPointerMove(p, e, {dx,dy});
      if(this.dragging && this.dragging.onDrag) this.dragging.onDrag(p, e, {dx,dy});
    }
    onUp(e){
      if(!this.active) return;
      const p = this.pos(e);
      const a = this.active;
      const dist = Math.hypot(p.x - a.start.x, p.y - a.start.y);
      const elapsed = $$.now() - a.time;
      clearTimeout(this.longPressTimer);
      if (dist < 8 && elapsed < 250) {
        if (a.target && a.target.onTap) a.target.onTap(p, e);
      }
      if(a.target && a.target.onPointerUp) a.target.onPointerUp(p, e);
      this.active = null;
      this.dragging = null;
    }
    onCancel(){
      clearTimeout(this.longPressTimer);
      this.active = null;
      this.dragging = null;
    }
  }
  window.PointerManager = PointerManager;
})();
