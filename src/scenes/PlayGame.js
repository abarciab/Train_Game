class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/train.png');
    }

    create() {
        let player;

        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');

        let num_tracks = 3;
        this.dx; // delta x; how much the player has traveled
        this.j_tick = config.width / 4;
        this.tracks = {}; // key: track row, value: track objects
        this.junctions = {}; // key: track row, value: junction objects
        for (let i = 1; i <= num_tracks; i++) {
            this.tracks[i] = [];
        }
        
        this.train = new Train(this, game.config.width/2, game.config.height - borderUISize, 'train').setOrigin(0,0);
    }

    update(time, delta) {
        this.updateTracks(delta);
        this.updateEvents(delta);
    }

    updateTracks(delta) {
        if (this.dx >= this.j_tick) {
            this.dx = 0;
            SpawnTracks();
        }
    }

    updateEvents(delta) {
        if (W_key.isDown) {
            testMethod();
        }
        if (A_key.isDown) {
            
        }
        if (S_key.isDown) {

        }
        if (D_key.isDown) {

        }
    }
}