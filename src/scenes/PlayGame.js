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
        this.base_interval = 384;
        this.global_scaling = 1;

        this.num_tracks = 3;
        this.num_chunks = 5;
        this.dx = 0; // delta x; how much the player has traveled
        this.tracks = {}; // key: track row, value: track objects
        this.nodes = {};
        this.atJunction = true;
        for (let i = 0; i < this.num_tracks; i++) {
            this.tracks[i] = [];
            this.nodes[i] = [];
        }

        let margin = 0;
        this.y_interval = (config.height-(2*margin))/(Object.keys(this.tracks).length+1);
        this.global_scaling = this.y_interval / this.base_interval;
        // how many pixels (pre-scaling) per square
        this.x_unit = 64 * this.global_scaling;
        // node_interval; every 10 x_units
        this.node_interval = 10 * this.x_unit;
        console.log(this.x_unit);
        this.speed = 50;
        
        initSpawn(this, this.tracks, this.nodes, this.speed, margin, this.node_interval, this.y_interval, this.num_chunks, this.global_scaling);
        // initial spawn:
        this.train = new Train(this, config.width/10, this.tracks[Math.floor(this.num_tracks/2)][0].y, 'basic_locomotive', 0, this.global_scaling);
        //this.train.setScale(this.global_scaling);
        //StartUI(this);
    }

    update(time, delta) {
        this.updateTracks(delta);
        // this.train.update();
        this.updateEvents(delta);
        this.updateBackground();
    }

    updateBackground(){
        this.background.tilePositionX += this.speed;
    }

    updateTracks(delta) {
        // move the tracks
        for (let i = 0; i < this.num_tracks; i++) {
            for (let j = 0; j < this.tracks[i].length; j++) {
                this.tracks[i][j].x -= this.speed;
                if (this.tracks[i][j].x < -1*this.node_interval*2) {
                    delete this.tracks[i][j];
                    this.tracks[i].splice(j, 1);
                }
            }
            for (let j = 0; j < this.nodes[i].length; j++) {
                this.nodes[i][j].update();
                if (this.nodes[i][j].x < -1*this.node_interval*2) {
                    this.nodes[i][j].destroy();
                    // delete this.nodes[i][j];
                    this.nodes[i].splice(j, 1);
                }
            }
        }
        this.dx += this.speed;
        if (this.dx >= this.node_interval*2) {
            this.dx = 0;
            SpawnTracks(this, this.tracks, this.nodes, this.speed, this.node_interval, this.num_chunks, this.global_scaling);
        }
    }

    updateEvents(delta) {
        if (this.atJunction) {
            if (Phaser.Input.Keyboard.JustDown(W_key) && (this.train.onTrack > 0)) {
                this.train.onTrack--;
                this.train.y = this.tracks[this.train.onTrack][0].y;
                testMethod();
            }
            if (A_key.isDown) {
                testMethod();
            }
            if (Phaser.Input.Keyboard.JustDown(S_key) && (this.train.onTrack < 2)) {
                this.train.onTrack++;
                this.train.y = this.tracks[this.train.onTrack][0].y;
                testMethod();
            }
            if (D_key.isDown) {
                testMethod();
            }
        }
    }
}