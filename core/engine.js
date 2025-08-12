// core/engine.js
(function(){
  class Rect { constructor(x=0,y=0,w=0,h=0){ this.x=x; this.y=y; this.w=w; this.h=h; } contains(px,py){ return px>=this.x&&py>=this.y&&px<=this.x+this.w&&py<=this.y+this.h; } }

  class Component {
    constructor(props={}){
      this.id = props.id || $$.uuid();
      this.frame = new Rect(props.x||0, props.y||0, props.w||0, props.h||0);
      this.children = [];
      this.parent = null;
      this.visible = true;
      this.hit = !!props.hit;
      this.needsRedraw = true;
      this.onPointerDown = null; this.onPointerUp = null; this.onPointerMove = null; this.onTap = null; this.onLongPress = null; this.onDrag = null;
      this.role = props.role || "";
    }
    add(child){ child.parent=this; this.children.push(child); return child; }
    abspath(){ // accumulate offset
      let x=this.frame.x, y=this.frame.y, p=this.parent;
      while(p){ x+=p.frame.x; y+=p.frame.y; p = p.parent; }
      return {x,y};
    }
    localFrom(absx, absy){
      let p = this; let x=absx, y=absy;
      while(p){ x -= p.frame.x; y -= p.frame.y; p = p.parent; }
      return {x,y};
    }
    findHit(px,py){
      if(!this.visible) return null;
      // depth-first, topmost child first
      for(let i=this.children.length-1;i>=0;i--){
        const c = this.children[i];
        const f = c.frame; const ab = c.abspath();
        if(px>=ab.x && py>=ab.y && px<=ab.x+f.w && py<=ab.y+f.h){
          const hit = c.findHit(px,py); if(hit) return hit;
          if(c.hit) return c;
        }
      }
      return (this.hit? this : null);
    }
    invalidate(){ this.needsRedraw = true; let p=this.parent; while(p){ p.needsRedraw = true; p=p.parent; } }
    draw(ctx){ // override
      for(const c of this.children){ if(c.visible) c.draw(ctx); }
      this.needsRedraw = false;
    }
  }

  class Scene extends Component {
    constructor(canvas){
      super({hit:true});
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.invalid = true;
      this.bg = '#0b0b0d';
      this.debug = false;
      this.scaleDPR();
      window.addEventListener('resize', this.scaleDPR.bind(this));
      window.visualViewport && window.visualViewport.addEventListener('resize', this.scaleDPR.bind(this));
    }
    scaleDPR(){
      const DPR = $$.DPR;
      const wrap = document.getElementById('app-wrap');
      const cssW = wrap.clientWidth, cssH = wrap.clientHeight;
      this.canvas.width = Math.floor(cssW * DPR);
      this.canvas.height = Math.floor(cssH * DPR);
      this.canvas.style.width = cssW + 'px';
      this.canvas.style.height = cssH + 'px';
      const ctx = this.ctx;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(DPR, DPR);
      this.frame.w = cssW; this.frame.h = cssH;
      this.invalidate();
    }
    clear(ctx){
      ctx.save();
      ctx.fillStyle = this.bg;
      ctx.fillRect(0,0,this.frame.w, this.frame.h);
      ctx.restore();
    }
    draw(ctx){
      this.clear(ctx);
      super.draw(ctx);
      this.invalid = false;
    }
  }

  window.CanvasEngine = { Rect, Component, Scene };
})();
