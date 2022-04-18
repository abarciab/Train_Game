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

        let W_key = this.input.keyboard.addKey('W');
        let A_key = this.input.keyboard.addKey('A');
        let S_key = this.input.keyboard.addKey('S');
        let D_key = this.input.keyboard.addKey('D');

        let num_tracks = 3;
        tracks = {}; // key: track row, value: track objects
        junctions = {}; // key: track row, value: junction objects
        for (var i = 1; i <= num_tracks; i++) {
            tracks[i] = [];
        }
        
        this.train = new Train(this, game.config.width/2, game.config.height - borderUISize, 'train').setOrigin(0,0);
    }

    update(time, delta) {
        updateTracks(delta);
        updateJunctions();
        updateEvents(delta);
    }

    updateTracks(delta) {

    }

    updateEvents(delta) {
        
    }
}