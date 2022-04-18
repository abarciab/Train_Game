class Menu extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }
    create() {
        this.scene.start("playGame");
    }
}