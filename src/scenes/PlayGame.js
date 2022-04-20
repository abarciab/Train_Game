class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites

    }

    create() {
        this.player = new Train(this, config.width/2, config.height/2, 'basic_locomotive');

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
        
        // this.train = new Train(this, 0, 300, 'train').setOrigin(0,0);
        // animations
        this.anims.create({
            key: "train",
            frames: this.anims.generateFrameNumbers("train"),
            frameRate: 1,
            repeat: -1
        });
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