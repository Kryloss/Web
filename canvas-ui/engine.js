export class CanvasApp {
    constructor(canvas, ctx, state, saveFn) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.state = state;
        this.saveFn = saveFn;
        this.screens = {};
        this.currentScreen = null;
        this.lastTime = 0;
        this.deviceScale = window.devicePixelRatio || 1;
    }

    registerScreen(name, screen) {
        this.screens[name] = screen;
    }

    setScreen(name) {
        this.currentScreen = this.screens[name];
    }

    resize() {
        const w = window.innerWidth * this.deviceScale;
        const h = window.innerHeight * this.deviceScale;
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.deviceScale, this.deviceScale);
        if (this.currentScreen?.resize) this.currentScreen.resize();
    }

    start() {
        const loop = (time) => {
            const delta = time - this.lastTime;
            this.lastTime = time;
            this.update(delta);
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(dt) {
        this.currentScreen?.update(dt);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.currentScreen?.draw(this.ctx);
    }

    async save() {
        await this.saveFn(this.state);
    }
}