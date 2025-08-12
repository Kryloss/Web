export class WeeksScreen {
    constructor(app) {
        this.app = app;
    }

    update(dt) {}

    draw(ctx) {
        ctx.fillStyle = this.app.state.settings.theme.primary;
        ctx.font = '24px sans-serif';
        ctx.fillText('Weeks Screen', 20, 40);
    }
}