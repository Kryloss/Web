import { initDB, saveData, loadData } from './db.js';
import { CanvasApp } from './canvas-ui/engine.js';
import { WeeksScreen } from './canvas-ui/screens/weeks.js';
import { PlanningScreen } from './canvas-ui/screens/planning.js';
import { NutritionScreen } from './canvas-ui/screens/nutrition.js';

const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

const state = {
    settings: {
        unitWeight: 'kg',
        unitMass: 'g',
        theme: { primary: '#ff4d4d', secondary: '#ffffff', font: 'system' }
    },
    weeks: [],
    presets: [],
    schedules: [],
    nutrition: { foods: [], entries: [] }
};

await initDB();
Object.assign(state, await loadData(state));

const app = new CanvasApp(canvas, ctx, state, saveData);
app.registerScreen('weeks', new WeeksScreen(app));
app.registerScreen('planning', new PlanningScreen(app));
app.registerScreen('nutrition', new NutritionScreen(app));
app.setScreen('weeks');

window.addEventListener('resize', () => app.resize());
app.resize();
app.start();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./pwa/sw.js');
}