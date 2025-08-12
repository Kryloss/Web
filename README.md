# Gym Planner — Canvas‑Only PWA

A borderless, high‑contrast, canvas‑rendered gym planner that runs great on iPhone 15 Pro Max and adapts to other screens. It’s offline‑first (PWA), stores data in IndexedDB, and uses localStorage for settings. Everything is drawn on `<canvas>`; we only use temporary HTML overlays for editing and a hidden `<input type=file>` for JSON import.

## Architecture Overview
- **core/** — tiny canvas engine: high‑DPI scaling, scene graph, hit‑testing, gestures, safe‑area aware layout, sprite drawing, overlay input.
- **features/** — Weeks, Planning (presets + scheduler), Nutrition (totals, history), undo/redo, JSON import/export.
- **pwa/** — manifest + service worker (app‑shell caching).
- **assets/** — icon sprite sheet + minimal built‑in exercise images & PWA icons.

### Key Design Choices
- **Canvas‑only UI:** All controls are drawn and hit‑tested in canvas. Keyboard edits use a positioned overlay input, then sync back to canvas.
- **Performance:** DPR scaling, requestAnimationFrame loop, invalidation‑based redraw. Lists are simple for clarity; swap in dirty‑rects later if needed.
- **Persistence:** IndexedDB for the single `state` document. Settings in localStorage. JSON import/export with basic validation.
- **Scheduler:** Applies preset sequences to week days (e.g., Mon/Wed/Fri). Idempotent: skips duplicate (same date + title).

## Run Locally
1. Unzip the archive.
2. Serve the folder with any static server (you need HTTP for the service worker):
   - Python: `python3 -m http.server 5173` (or any port)
   - Node: `npx http-server -p 5173`
3. Open `http://localhost:5173` in Safari (or Chrome) to test.

## iOS install (Add to Home Screen)
1. Open the URL in Safari on iOS.
2. Share button → **Add to Home Screen**.
3. Launch from the icon for borderless, standalone mode.

## Quick Manual Test
- **Weeks:** Pull down in the main list to create a workout. Long‑press a card to reorder. Tap a card title to rename.
- **Planning:** Tap **Apply to This Week** to auto‑drop preset workouts (Mon/Wed/Fri). Tap a preset to rename. **Generate Next Week** creates a new week and schedules it.
- **Nutrition:** Tap **Quick Add** (or a day row) to add a 100‑kcal snack to that date. Check the ring and history update.
- **Export/Import:** In the browser console, call `__app.export()` and `__app.import()` (uses hidden file input).

## Post‑Build Checklist
- [ ] No blur on Retina (verify crisp text/icons).
- [ ] 60 FPS interactions during scroll/drag on iPhone 15 Pro Max.
- [ ] Works offline after first load (toggle Airplane mode; app still opens).
- [ ] Add to Home Screen uses full device safe areas.
- [ ] Create/delete flows stable; data persists after reload.

## Known Limitations (first pass)
- Exercise‑level UI is simplified (tap a workout edits title only). You can extend with an exercise list editor using the same overlay pattern.
- Drag‑and‑drop ghost visuals are minimal.
- Validation for import is basic; add schema versioning for migrations.
- Haptics/sounds are not implemented (hooks are available).
- Dirty‑rect rendering is coarse (full scene invalidation).

Enjoy! 🏋️
