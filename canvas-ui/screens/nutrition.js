export class NutritionScreen {
    constructor(app) {
        this.app = app;
    }

    update(dt) {}

    draw(ctx) {
        ctx.fillStyle = '#0f0';
        ctx.font = '24px sans-serif';
        ctx.fillText('Nutrition Screen', 20, 40);
    }
}