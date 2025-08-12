// features/nutrition.js
(function(){
  const { Component } = CanvasEngine;

  class NutritionScreen extends Component {
    constructor(app){
      super({hit:true});
      this.app = app;
      this.scrollY = 0;
      this.dayRects = [];
    }
    draw(ctx){
      const {x,y,w,h} = this.frame;
      ctx.save();
      ctx.fillStyle = '#0b0b0d'; ctx.fillRect(x,y,w,h);
      const headerH = 40;
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
      ctx.textAlign = 'left';
      ctx.fillText('Nutrition • Today', x+10, y+24);

      const today = $$.fmtDateISO(new Date());
      const totals = computeTotals(this.app.state, today);
      drawCircleProgress(ctx, x+100, y+100, 56, totals.kcal, totals.goal||2000);

      // Macro labels
      ctx.fillStyle = '#9ca3af'; ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
      ctx.fillText(`Calories: ${Math.round(totals.kcal)}`, x+180, y+78);
      ctx.fillText(`Protein: ${Math.round(totals.protein)} g`, x+180, y+98);
      ctx.fillText(`Carbs: ${Math.round(totals.carbs)} g`, x+180, y+118);
      ctx.fillText(`Fat: ${Math.round(totals.fat)} g`, x+180, y+138);

      // "Quick Add" button
      drawButton(ctx, x+10, y+160, 120, 34, 'Quick Add');

      // History list (simple 7-day sparkline and days)
      const days = lastNDays(14).reverse();
      const vals = days.map(d => computeTotals(this.app.state, d).kcal);
      drawSparkline(ctx, x+10, y+210, w-20, 48, vals);

      this.dayRects = [];
      let cy = y+270 + this.scrollY;
      for(const d of days){
        const r = {x:x+10, y:cy, w:w-20, h:42, date:d};
        this.dayRects.push(r);
        drawDayRow(ctx, r.x, r.y, r.w, r.h, d, computeTotals(this.app.state, d));
        cy += 46;
      }

      ctx.restore();
    }
    onTap = (p)=>{
      const hit = this.dayRects.find(r => p.x>=r.x && p.y>=r.y && p.x<=r.x+r.w && p.y<=r.y+r.h);
      if(hit){
        // open quick add for that day
        this.app.quickAddFood(hit.date);
      } else {
        // check quick add button tap
        // we approximate region (x:10..130, y:160..194)
        const x1 = this.frame.x + 10, y1 = this.frame.y + 160;
        if(p.x>=x1 && p.x<=x1+120 && p.y>=y1 && p.y<=y1+34){
          this.app.quickAddFood($$.fmtDateISO(new Date()));
        }
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

  function computeTotals(state, dateISO){
    const entries = (state.nutrition && state.nutrition.entries) || [];
    const foods = (state.nutrition && state.nutrition.foods) || [];
    let kcal=0, fat=0, protein=0, carbs=0;
    for(const e of entries){
      if(e.date === dateISO){
        const f = foods.find(ff => ff.id===e.foodId);
        if(f){
          const qty = e.qty || 1;
          kcal += f.kcal * qty;
          fat += (f.fat||0) * qty;
          protein += (f.protein||0) * qty;
          carbs += (f.carbs||0) * qty;
        }
      }
    }
    return {kcal, fat, protein, carbs, goal: state.nutrition && state.nutrition.goal || 2000};
  }

  function lastNDays(n){
    const arr=[]; const today = new Date();
    for(let i=0;i<n;i++){
      const d = new Date(today); d.setDate(today.getDate()-i);
      arr.push(d.toISOString().slice(0,10));
    }
    return arr;
  }

  function drawCircleProgress(ctx, cx, cy, r, value, goal){
    const pct = $$.clamp(value/goal, 0, 1);
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#1f2937';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#34d399';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*pct); ctx.stroke();
    ctx.fillStyle = '#e5e7eb'; ctx.font = '14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto'; ctx.textAlign='center';
    ctx.fillText(Math.round(value)+' / '+goal, cx, cy+4);
    ctx.restore();
  }

  function drawSparkline(ctx, x,y,w,h, values){
    const min = Math.min(...values), max = Math.max(...values);
    const range = Math.max(1, max-min);
    ctx.save();
    ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0;i<values.length;i++){
      const vx = x + (i/(values.length-1))*w;
      const vy = y + h - ((values[i]-min)/range)*h;
      if(i===0) ctx.moveTo(vx,vy); else ctx.lineTo(vx,vy);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawDayRow(ctx, x,y,w,h, dateISO, t){
    ctx.save();
    ctx.fillStyle = '#12141a'; $$.drawRoundRect(ctx, x,y,w,h,10); ctx.fill();
    ctx.fillStyle = '#e5e7eb'; ctx.font = '14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto'; ctx.textAlign='left';
    ctx.fillText(dateISO, x+10, y+26);
    ctx.textAlign='right'; ctx.fillText(Math.round(t.kcal)+' kcal', x+w-10, y+26);
    ctx.restore();
  }

  window.NutritionScreen = NutritionScreen;
})();
