class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
<<<<<<< HEAD

=======
        this.load.image('train', './assets/trains/basic locomotive.png');

        LoadUI(this);
>>>>>>> 054336ba8b24871dc264512005ed7005920c18b7
    }

    create() {
        this.player = new Train(this, config.width/2, config.height/2, 'basic_locomotive');

        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0);

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
        
<<<<<<< HEAD
        // this.train = new Train(this, 0, 300, 'train').setOrigin(0,0);
        // animations
        this.anims.create({
            key: "train",
            frames: this.anims.generateFrameNumbers("train"),
            frameRate: 1,
            repeat: -1
        });
=======
        this.train = new Train(this, 0, 400, 'train').setOrigin(0,0);

        

        StartUI(this);
>>>>>>> 054336ba8b24871dc264512005ed7005920c18b7
    }

    update(time, delta) {
        this.updateTracks(delta);
        this.updateEvents(delta);
        this.updateBackground();
    }

    updateBackground(){
        this.background.tilePositionX += 20;
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