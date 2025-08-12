// app.js - bootstraps the Canvas app, navigation, and screens
(async function(){
  const canvas = document.getElementById('app');
  const scene = new CanvasEngine.Scene(canvas);
  const pointer = new PointerManager(scene);
  const undo = new UndoStack();

  const state = await loadInitialState();
  const settings = Settings.getSettings();
  const app = { scene, pointer, state, settings, undo };

  // Screens & chrome
  const tabs = new UI.WeekTabs(app);
  const screenWeeks = new WeeksScreen(app);
  const screenPlanning = new PlanningScreen(app);
  const screenNutrition = new NutritionScreen(app);
  const bottomNav = new UI.BottomNav(app);

  // Layout
  function relayout(){
    const safe = Layout.layoutSafe(scene);
    tabs.frame = new CanvasEngine.Rect(safe.x, safe.y, safe.w, 80);
    bottomNav.frame = new CanvasEngine.Rect(safe.x, safe.y + safe.h - 80, safe.w, 80);
    const centerH = safe.h - 80 - 80;
    screenWeeks.frame = new CanvasEngine.Rect(safe.x, safe.y + 80, safe.w, centerH);
    screenPlanning.frame = new CanvasEngine.Rect(safe.x, safe.y + 80, safe.w, centerH);
    screenNutrition.frame = new CanvasEngine.Rect(safe.x, safe.y + 80, safe.w, centerH);
    scene.invalidate();
  }
  relayout();
  window.addEventListener('resize', relayout);
  window.visualViewport && window.visualViewport.addEventListener('resize', relayout);

  // Navigation
  app.navigate = (id)=>{
    currentScreen.visible = false;
    if(id==='weeks') currentScreen = screenWeeks;
    if(id==='planning') currentScreen = screenPlanning;
    if(id==='nutrition') currentScreen = screenNutrition;
    currentScreen.visible = true;
    bottomNav.active = id;
    scene.invalidate();
  };
  app.selectWeekByIndex = (idx)=>{
    state.activeWeekIndex = idx;
    tabs.invalidate(); screenWeeks.invalidate();
    saveStateThrottled();
  };
  app.addWeek = ()=>{
    const idx = state.weeks.length + 1;
    state.weeks.push({ id: $$.uuid(), name: 'Week '+idx, startDate: $$.fmtDateISO(new Date()), workouts: [] });
    state.activeWeekIndex = state.weeks.length - 1;
    pushUndo();
    saveStateThrottled();
    scene.invalidate();
  };
  app.moveWorkout = (from, to)=>{
    const wk = state.weeks[state.activeWeekIndex];
    const item = wk.workouts.splice(from,1)[0];
    wk.workouts.splice(to,0,item);
    pushUndo();
    saveStateThrottled();
    scene.invalidate();
  };
  app.addWorkoutToActiveWeek = ()=>{
    const wk = state.weeks[state.activeWeekIndex];
    wk.workouts.push({ id: $$.uuid(), title: 'New Workout', date: $$.fmtDateISO(new Date()), notes: '', exercises: [] });
    pushUndo();
    saveStateThrottled();
    scene.invalidate();
  };
  app.editWorkout = (workoutIndex)=>{
    // For simplicity, just edit title inline via overlay input
    const wk = state.weeks[state.activeWeekIndex];
    const wo = wk.workouts[workoutIndex];
    // compute an approximate rect for overlay
    const safe = Layout.layoutSafe(scene);
    const yBase = safe.y + 80 + 10 + workoutIndex*(88+12) + 8 + (screenWeeks.scrollY||0);
    InputOverlay.showOverlayInput({
      x: safe.x + 26, y: yBase, w: 220, h: 36,
      value: wo.title, placeholder: 'Workout title',
      onCommit(val){ wo.title = val || 'Workout'; pushUndo(); saveStateThrottled(); scene.invalidate(); }
    });
  };
  app.addPreset = ()=>{
    state.presets.push({ id: $$.uuid(), name: 'New Preset', exercises: [] });
    pushUndo(); saveStateThrottled(); scene.invalidate();
  };
  app.editPreset = (idx)=>{
    const p = state.presets[idx];
    const safe = Layout.layoutSafe(scene);
    InputOverlay.showOverlayInput({
      x: safe.x + 26, y: safe.y + 120 + idx*88 + (screenPlanning.scrollY||0), w: 220, h: 36,
      value: p.name, placeholder: 'Preset name',
      onCommit(val){ p.name = val || 'Preset'; pushUndo(); saveStateThrottled(); scene.invalidate(); }
    });
  };
  app.quickAddFood = (dateISO)=>{
    // Add 100 kcal snack quick
    const foods = state.nutrition.foods;
    let snack = foods.find(f=> f.name==='Quick Snack');
    if(!snack){
      snack = { id: $$.uuid(), name:'Quick Snack', serving: '1', kcal: 100, fat:5, protein:5, carbs:8 };
      foods.push(snack);
    }
    state.nutrition.entries.push({ id: $$.uuid(), date: dateISO, foodId: snack.id, qty: 1 });
    pushUndo(); saveStateThrottled(); scene.invalidate();
  };

  // Import/Export
  app.export = ()=> IOJson.exportJSON(state);
  app.import = ()=> IOJson.importJSON((data)=>{
    Object.assign(state, data);
    pushUndo(); saveStateThrottled(); scene.invalidate();
  });

  // Scheduler actions
  app.applyToThisWeek = ()=>{
    PlanningLogic.generateWorkoutsForWeek(state, state.activeWeekIndex);
    pushUndo(); saveStateThrottled(); scene.invalidate();
  };
  app.generateNextWeek = ()=>{
    // Create a new week starting next Monday
    const cur = state.weeks[state.activeWeekIndex];
    const nextStart = $$.addDays(cur.startDate || $$.fmtDateISO(new Date()), 7);
    const wk = { id: $$.uuid(), name: 'Week '+(state.weeks.length+1), startDate: nextStart, workouts: [] };
    state.weeks.push(wk);
    state.activeWeekIndex = state.weeks.length - 1;
    PlanningLogic.generateWorkoutsForWeek(state, state.activeWeekIndex);
    pushUndo(); saveStateThrottled(); scene.invalidate();
  };

  // Wire buttons in Planning screen (approximate hit areas)
  screenPlanning.onTap = (p)=>{
    const safe = Layout.layoutSafe(scene);
    // Buttons row
    const b1 = {x: safe.x+10, y: safe.y+40+8, w: 160, h:34};
    const b2 = {x: safe.x+10+160+10, y: safe.y+40+8, w: 160, h:34};
    if(p.x>=b1.x && p.x<=b1.x+b1.w && p.y>=b1.y && p.y<=b1.y+b1.h){ app.applyToThisWeek(); return; }
    if(p.x>=b2.x && p.x<=b2.x+b2.w && p.y>=b2.y && p.y<=b2.y+b2.h){ app.generateNextWeek(); return; }
    // Otherwise default list tap behavior
    const origTap = PlanningScreen.prototype.onTap.bind(screenPlanning);
    origTap(p);
  };

  // Scene tree
  scene.add(tabs);
  scene.add(screenWeeks);
  scene.add(screenPlanning);
  scene.add(screenNutrition);
  scene.add(bottomNav);

  // Start at weeks
  let currentScreen = screenWeeks;
  screenPlanning.visible = false;
  screenNutrition.visible = false;

  // Render loop with simple invalidation
  function tick(){
    requestAnimationFrame(tick);
    if(scene.needsRedraw || tabs.needsRedraw || currentScreen.needsRedraw || bottomNav.needsRedraw){
      scene.draw(scene.ctx);
    }
  }
  tick();

  // Initial undo snapshot
  pushUndo();

  // Helpers
  function pushUndo(){ undo.push(state); }
  const saveStateThrottled = $$.throttle(async ()=>{
    try { await DB.writeState(state); }
    catch(e){ console.error('Save failed', e); alert('Save failed'); }
  }, 500);

  // Load/Save
  async function loadInitialState(){
    const saved = await DB.readState();
    if(saved) return saved;
    // default seed
    return {
      activeWeekIndex: 0,
      weeks: [{
        id: $$.uuid(), name: 'Week 1', startDate: new Date().toISOString().slice(0,10),
        workouts: [{
          id: $$.uuid(), title:'Push Day', date: new Date().toISOString().slice(0,10), notes:'',
          exercises:[{ id: $$.uuid(), name:'Bench Press', sets:4, reps:8, weight:60, notes:'', image:'builtin:dumbbells', completed:[false,false,false,false] }]
        }]
      }],
      presets: [{ id: 'p1', name:'Full Body A', exercises: [{name:'Squat', sets:5, reps:5, weight:0, notes:'', image:'builtin:legs'}] }],
      schedules: [{ id: 'sch1', days:['Mon','Wed','Fri'], presetOrder:['p1'], start: new Date().toISOString().slice(0,10) }],
      nutrition: {
        foods: [{ id:'f1', name:'Chicken Breast', serving:'100 g', kcal:165, fat:3.6, protein:31, carbs:0 }],
        entries: [{ id:'n1', date: new Date().toISOString().slice(0,10), foodId:'f1', qty: 1 }],
        goal: 2000
      }
    };
  }

  // Expose quick actions for debug in console (optional)
  window.__app = app;

})();
