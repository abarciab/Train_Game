class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/trains/basic locomotive.png');
        LoadUI(this);
    }

    // initially spawn 3x player view
    create() {
        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0);

        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');

        let num_tracks = 3;
        this.dx = 0; // delta x; how much the player has traveled
        this.j_tick = config.width / 2;
        this.tracks = {}; // key: track row, value: track objects
        this.nodes = {};
        for (let i = 0; i < num_tracks; i++) {
            this.tracks[i] = [];
            this.nodes[i] = [];
        }

        let margin = 0;
        this.interval = (config.height-(2*margin))/(Object.keys(this.tracks).length+1);

        this.speed = 50;
        initSpawn(this, this.tracks, this.nodes, this.speed, margin, this.interval);
        // initial spawn:
        this.train = new Train(this, config.width/10, this.tracks[Math.floor(num_tracks/2)][0].y, 'basic_locomotive');
        StartUI(this);
    }

    update(time, delta) {
        this.updateTracks(delta);
        this.train.update();
        this.updateEvents(delta);
        this.updateBackground();
    }

    updateBackground(){
        this.background.tilePositionX += 20;
    }

    updateTracks(delta) {
        // move the tracks
        for (const[key, value] of Object.entries(this.tracks)) {
            for (let i = 0; i < value.length; i++) {
                value[i].update();
                this.nodes[key][i].update();
            }
        }
        // every time the train travels, spawn a chunk
        this.dx += this.speed;
        if (this.dx >= this.j_tick) {
            this.dx = 0;
            SpawnTracks(this, this.tracks, this.nodes, this.speed);
        }
    }

    updateEvents(delta) {
        if (Phaser.Input.Keyboard.JustDown(W_key) && (this.train.onTrack != 2)) {
            this.train.onTrack++;
            this.train.y -= this.interval;
            testMethod();
        }
        if (A_key.isDown) {
            testMethod();
        }
        if (Phaser.Input.Keyboard.JustDown(S_key) && (this.train.onTrack != 0)) {
            this.train.onTrack--;
            this.train.y += this.interval;
            testMethod();
        }
        if (D_key.isDown) {
            testMethod();
        }
    }
}