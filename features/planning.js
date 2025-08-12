// features/planning.js
(function(){
  const { Component } = CanvasEngine;

  class PlanningScreen extends Component {
    constructor(app){
      super({hit:true});
      this.app = app;
      this.scrollY = 0;
      this.itemRects = [];
    }
    draw(ctx){
      const {x,y,w,h} = this.frame;
      ctx.save();
      ctx.fillStyle = '#0b0b0d'; ctx.fillRect(x,y,w,h);
      const headerH = 40;
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
      ctx.textAlign = 'left';
      ctx.fillText('Planning • Presets', x+10, y+24);

      // Buttons
      const btnW = 160, btnH = 34;
      drawButton(ctx, x+10, y+headerH+8, btnW, btnH, 'Apply to This Week');
      drawButton(ctx, x+10+btnW+10, y+headerH+8, btnW, btnH, 'Generate Next Week');

      // List presets
      const startY = y + headerH + 8 + btnH + 12 + this.scrollY;
      let cy = startY;
      this.itemRects = [];
      for(let i=0;i<this.app.state.presets.length;i++){
        const p = this.app.state.presets[i];
        const r = {x:x+10, y:cy, w:w-20, h:76, index:i};
        this.itemRects.push(r);
        drawPresetCard(ctx, r.x, r.y, r.w, r.h, p);
        cy += r.h + 10;
      }

      // "+" to add new preset
      const r = {x:x+10, y:cy, w:w-20, h:54, index:'add'};
      this.itemRects.push(r);
      drawAddCard(ctx, r.x, r.y, r.w, r.h, 'Add Preset');
      ctx.restore();
    }
    onTap = (p)=>{
      const hit = this.itemRects.find(r => p.x>=r.x && p.y>=r.y && p.x<=r.x+r.w && p.y<=r.y+r.h);
      if(!hit) return;
      if(hit.index === 'add'){
        this.app.addPreset();
      } else {
        this.app.editPreset(hit.index);
      }
    }
  }

  function drawButton(ctx, x,y,w,h, label){
    ctx.save();
    ctx.fillStyle = '#1a1d24'; $$.drawRoundRect(ctx, x,y,w,h,12); ctx.fill();
    ctx.fillStyle = '#e5e7eb'; ctx.font = '13px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto'; ctx.textAlign='center';
    ctx.fillText(label, x+w/2, y+h/2+4);
    ctx.restore();
  }
  function drawPresetCard(ctx, x,y,w,h, p){
    ctx.save();
    ctx.fillStyle = '#12141a'; $$.drawRoundRect(ctx, x,y,w,h,14); ctx.fill();
    ctx.fillStyle = '#e5e7eb'; ctx.font = '15px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto'; ctx.textAlign='left';
    ctx.fillText(p.name || 'Preset', x+12, y+24);
    ctx.fillStyle = '#9ca3af'; ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
    const sub = (p.exercises||[]).map(e=> e.name + ' ' + (e.sets||0) + '×' + (e.reps||0)).join(' • ');
    ctx.fillText(sub, x+12, y+44);
    Sprites.drawIcon(ctx, 'plan', x+w-36, y+10, 24);
    ctx.restore();
  }
  function drawAddCard(ctx, x,y,w,h, label){
    ctx.save();
    ctx.strokeStyle = '#2b2f3a'; ctx.setLineDash([6,6]);
    $$.drawRoundRect(ctx, x,y,w,h,12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#a1a1aa'; ctx.font = '14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
    ctx.textAlign='center'; ctx.fillText(label + ' (+)', x+w/2, y+h/2+4);
    ctx.restore();
  }

  function generateWorkoutsForWeek(state, weekIndex){
    const week = state.weeks[weekIndex];
    const scheds = state.schedules||[];
    const presets = state.presets||[];
    // simple: take first schedule and apply its presetOrder to days listed
    if(!scheds.length || !presets.length) return;
    const sch = scheds[0];
    // map day name -> date in this week by using week.startDate
    const start = new Date(week.startDate || new Date());
    function dateOfDay(targetName){
      const targetIdx = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(targetName);
      const d = new Date(start);
      const startIdx = d.getDay();
      const delta = (targetIdx - startIdx + 7) % 7;
      d.setDate(d.getDate() + delta);
      return d.toISOString().slice(0,10);
    }
    let presetIdx = 0;
    for(const day of sch.days){
      const dateStr = dateOfDay(day);
      const pid = sch.presetOrder[presetIdx % sch.presetOrder.length];
      const preset = presets.find(pp=> pp.id===pid) || presets[0];
      const wo = {
        id: $$.uuid(),
        title: preset.name,
        date: dateStr,
        notes: '',
        exercises: preset.exercises.map(e => ({
          id: $$.uuid(),
          name: e.name, sets: e.sets, reps: e.reps, weight: e.weight||0, notes: e.notes||'',
          image: e.image||'builtin:dumbbells', completed: Array(e.sets).fill(false)
        }))
      };
      // Avoid duplicates: if a workout exists on this date with same title, skip
      if(!week.workouts.some(w => w.date===dateStr && w.title===wo.title)){
        week.workouts.push(wo);
      }
      presetIdx++;
    }
  }

  window.PlanningScreen = PlanningScreen;
  window.PlanningLogic = { generateWorkoutsForWeek };
})();
