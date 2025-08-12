// features/navigation.js
(function(){
  const { Component } = CanvasEngine;

  class BottomNav extends Component {
    constructor(app){
      super({hit:true});
      this.app = app;
      this.items = [
        { id: 'weeks', label: 'Weeks', icon: 'week' },
        { id: 'planning', label: 'Planning', icon: 'plan' },
        { id: 'nutrition', label: 'Nutrition', icon: 'food' }
      ];
      this.active = 'weeks';
      this.onTap = (p)=>{
        const idx = Math.floor((p.x - this.frame.x) / (this.frame.w / this.items.length));
        const item = this.items[idx];
        if(item){ this.active = item.id; this.app.navigate(item.id); this.invalidate(); }
      };
    }
    draw(ctx){
      const {x,y,w,h} = this.frame;
      ctx.save();
      // background
      ctx.fillStyle = '#111216';
      ctx.fillRect(x,y,w,h);
      // items
      const iw = w / this.items.length;
      for(let i=0;i<this.items.length;i++){
        const it = this.items[i];
        const cx = x + i*iw;
        const active = (it.id === this.active);
        if(active){
          ctx.fillStyle = '#181a20';
          $$.drawRoundRect(ctx, cx+8, y+6, iw-16, h-12, 14);
          ctx.fill();
        }
        Sprites.drawIcon(ctx, it.icon, cx + iw/2 - 14, y + 10, 28);
        ctx.fillStyle = active ? '#fff' : '#c9ccd3';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
        ctx.textAlign = 'center';
        ctx.fillText(it.label, cx + iw/2, y + h - 10);
      }
      ctx.restore();
      super.draw(ctx);
    }
  }

  class WeekTabs extends Component {
    constructor(app){
      super({hit:true});
      this.app = app;
      this.scrollX = 0;
      this.dragging = false;
      this.onPointerDown = (p)=>{ this.dragging = true; this.dragStart = p; this.scrollStart = this.scrollX; };
      this.onPointerMove = (p, e, {dx})=>{ if(this.dragging){ this.scrollX = Math.max(-2000, Math.min(0, this.scrollStart + dx)); this.invalidate(); } };
      this.onPointerUp = ()=>{ this.dragging = false; };
      this.onTap = (p)=>{
        // Detect item
        const tabW = 110, margin = 8;
        const localX = p.x - this.frame.x - this.scrollX;
        const idx = Math.floor(localX / (tabW + margin));
        const within = (localX % (tabW+margin)) < tabW;
        if(within){
          const count = this.app.state.weeks.length;
          if(idx >= 0 && idx < count){
            this.app.selectWeekByIndex(idx);
          } else if (idx === count){ // "+"
            this.app.addWeek();
          }
          this.invalidate();
        }
      };
    }
    draw(ctx){
      const {x,y,w,h} = this.frame;
      ctx.save();
      ctx.fillStyle = '#0b0b0d';
      ctx.fillRect(x,y,w,h);
      // Title
      ctx.font = '16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
      ctx.fillStyle = '#e5e7eb';
      ctx.textAlign = 'left';
      ctx.fillText('Weeks', x+10, y+22);
      // Tabs
      const tabW = 110, tabH = h-16, margin = 8;
      let tx = x + 10 + this.scrollX, ty = y + 30;
      const weeks = this.app.state.weeks || [];
      for(let i=0;i<weeks.length;i++){
        const wk = weeks[i];
        const active = (i === this.app.state.activeWeekIndex);
        ctx.fillStyle = active ? '#1a1d24' : '#13151a';
        $$.drawRoundRect(ctx, tx, ty, tabW, tabH, 14); ctx.fill();
        // mini progress chip
        const prog = computeWeekProgress(wk);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
        ctx.fillText(wk.name||('Week '+(i+1)), tx+10, ty+18);
        ctx.fillStyle = '#2dd4bf';
        const barW = Math.round((tabW-20) * prog);
        ctx.fillRect(tx+10, ty+tabH-16, barW, 6);
        tx += tabW + margin;
      }
      // "+" tab
      ctx.fillStyle = '#13151a';
      $$.drawRoundRect(ctx, tx, ty, tabW, tabH, 14); ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText('+', tx + tabW/2, ty + tabH/2 + 4);
      ctx.restore();
    }
  }

  function computeWeekProgress(week){
    let total=0, done=0;
    for(const wo of (week.workouts||[])){
      for(const ex of (wo.exercises||[])){
        total += (ex.completed ? ex.completed.length : ex.sets||0);
        if(ex.completed) done += ex.completed.filter(Boolean).length;
      }
    }
    return total>0 ? done/total : 0;
  }

  window.UI = { BottomNav, WeekTabs, computeWeekProgress };
})();
