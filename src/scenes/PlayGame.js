class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/train.png');
    }

    create() {
        this.train = new Train(this, game.config.width/2, game.config.height - borderUISize, 'train').setOrigin(0,0);
    }

    update(time, delta) {
        
    }
}