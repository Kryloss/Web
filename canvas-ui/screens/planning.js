export class PlanningScreen {
    constructor(app) {
        this.app = app;
    }

    update(dt) {}

    draw(ctx) {
        ctx.fillStyle = this.app.state.settings.theme.secondary;
        ctx.font = '24px sans-serif';
        ctx.fillText('Planning Screen', 20, 40);
    }
}