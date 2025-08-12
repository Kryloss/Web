// features/weeks.js
(function(){
  const { Component } = CanvasEngine;

  class WeeksScreen extends Component {
    constructor(app){
      super({hit:true});
      this.app = app;
      this.scrollY = 0;
      this.draggingList = null; // {type:'workout'|'exercise', weekIndex, workoutIndex, exerciseIndex}
      this.dragOffset = {x:0,y:0};
      this.pullCreate = {active:false, startY:0};
      this.itemRects = []; // for hit-testing items to reorder
    }

    layout(){
      const {w,h} = this.frame;
      this.contentW = w - 20;
      this.contentX = this.frame.x + 10;
      this.contentY = this.frame.y + 0;
    }

    draw(ctx){
      this.layout();
      const s = this.app.state;
      const insets = $$.safeAreaInsets();
      const topH = 80; // reserved for tabs drawn by WeekTabs
      const navH = 80;
      const contentTop = this.frame.y + topH + 10;
      const contentBottom = this.frame.y + this.frame.h - navH - 10;
      const viewH = contentBottom - contentTop;

      // Scroll content
      const wk = s.weeks[s.activeWeekIndex] || {workouts:[]};
      const list = wk.workouts || [];
      const rowH = 88;
      const gap = 12;
      const totalH = list.length * (rowH + gap) + 40;
      this.scrollY = $$.clamp(this.scrollY, Math.min(0, viewH - totalH), 0);

      // Pull-to-create indicator
      if(this.pullCreate.active){
        const dy = Math.max(0, this.pullCreate.deltaY||0);
        ctx.save();
        ctx.fillStyle = '#34d399';
        $$.drawRoundRect(ctx, this.contentX, contentTop - 10 - dy, this.contentW, 10, 6);
        ctx.fill();
        ctx.restore();
      }

      // Render items
      this.itemRects = [];
      let y = contentTop + this.scrollY;
      for(let i=0;i<list.length;i++){
        const wo = list[i];
        const r = {x:this.contentX, y, w:this.contentW, h:rowH, index:i};
        this.itemRects.push(r);
        drawWorkoutCard(ctx, r.x, r.y, r.w, r.h, wo, this.app);
        y += rowH + gap;
      }

      // Empty state
      if(list.length===0){
        ctx.save();
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('Pull down to create a workout or tap + in Planning.', this.frame.x + this.frame.w/2, contentTop + 40);
        ctx.restore();
      }
    }

    // Gestures
    onPointerDown = (p)=>{
      const s = this.app.state;
      const contentTop = this.frame.y + 80 + 10;
      if(p.y < contentTop + 8){
        // pull to create start
        this.pullCreate.active = true;
        this.pullCreate.startY = p.y;
        this.pullCreate.deltaY = 0;
      } else {
        // maybe start drag on an item after long-press in gesture manager -> onLongPress
      }
    }
    onPointerMove = (p,e,{dx,dy})=>{
      if(this.pullCreate.active){
        this.pullCreate.deltaY = p.y - this.pullCreate.startY;
        this.invalidate();
      } else {
        // Scroll list
        this.scrollY += dy;
        this.invalidate();
      }
    }
    onPointerUp = (p)=>{
      if(this.pullCreate.active){
        if(this.pullCreate.deltaY > 50){
          this.app.addWorkoutToActiveWeek();
        }
        this.pullCreate.active = false;
        this.invalidate();
      }
    }
    onLongPress = (p)=>{
      // start drag if pressed on a workout card
      const hit = this.itemRects.find(r => p.x>=r.x && p.y>=r.y && p.x<=r.x+r.w && p.y<=r.y+r.h);
      if(hit){
        this.draggingList = {type:'workout', index:hit.index, startY:p.y, curY:p.y};
      }
    }
    onDrag = (p, e, {dx,dy})=>{
      if(this.draggingList){
        this.draggingList.curY = p.y;
        // swap order when crossing midpoints
        const from = this.draggingList.index;
        for(let i=0;i<this.itemRects.length;i++){
          const r = this.itemRects[i];
          const mid = r.y + r.h/2;
          if(p.y < mid && i < from){
            this.app.moveWorkout(from, i);
            this.draggingList.index = i;
            break;
          } else if (p.y > mid && i > from){
            this.app.moveWorkout(from, i);
            this.draggingList.index = i;
            break;
          }
        }
        this.invalidate();
      }
    }
    onTap = (p)=>{
      // Tap on a workout -> open details editor
      const hit = this.itemRects.find(r => p.x>=r.x && p.y>=r.y && p.x<=r.x+r.w && p.y<=r.y+r.h);
      if(hit){
        this.app.editWorkout(hit.index);
      }
    }
  }

  function drawWorkoutCard(ctx, x,y,w,h, wo, app){
    ctx.save();
    ctx.fillStyle = '#12141a';
    $$.drawRoundRect(ctx, x, y, w, h, 16); ctx.fill();
    // Title & date
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
    ctx.textAlign = 'left';
    ctx.fillText(wo.title || 'Workout', x+16, y+26);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
    ctx.fillText(wo.date || $$.fmtDateISO(new Date()), x+16, y+46);

    // Progress
    let total=0, done=0;
    for(const ex of (wo.exercises||[])){
      total += (ex.completed ? ex.completed.length : ex.sets||0);
      if(ex.completed) done += ex.completed.filter(Boolean).length;
    }
    const pct = total>0 ? done/total : 0;
    ctx.fillStyle = '#1f2937'; ctx.fillRect(x+16, y+h-22, w-32, 8);
    ctx.fillStyle = '#34d399'; ctx.fillRect(x+16, y+h-22, Math.round((w-32)*pct), 8);

    // small icon
    Sprites.drawIcon(ctx, 'dumbbells', x+w-36, y+10, 24);
    ctx.restore();
  }

  window.WeeksScreen = WeeksScreen;
})();
