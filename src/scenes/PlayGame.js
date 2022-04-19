class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/trains/basic locomotive.png');
    }

    create() {
        let player;

        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');

        let num_tracks = 3;
        this.tracks = {}; // key: track row, value: track objects
        this.junctions = {}; // key: track row, value: junction objects
        for (let i = 1; i <= num_tracks; i++) {
            this.tracks[i] = [];
        }
        
        this.train = new Train(this, 0, 300, 'train').setOrigin(0,0);
        console.log(this.train.x);
        console.log(this.train.y);
    }

    update(time, delta) {
        this.updateEvents(delta);
    }

    updateTracks(delta) {

    }

    updateEvents(delta) {
        if (Phaser.Input.Keyboard.JustDown(W_key) && (this.train.onTrack != 2)) {
            this.train.onTrack++;
            this.train.y -= 200;
            testMethod();
        }
        if (A_key.isDown) {
            testMethod();
        }
        if (Phaser.Input.Keyboard.JustDown(S_key) && (this.train.onTrack != 0)) {
            this.train.onTrack--;
            this.train.y += 200;
            testMethod();
        }
        if (D_key.isDown) {
            testMethod();
        }
    }
}