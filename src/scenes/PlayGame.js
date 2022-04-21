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
        this.atJunction = true;
        this.atStation = false;
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
<<<<<<< HEAD
        this.train = new Train(this, config.width/10, this.tracks[Math.floor(this.num_tracks/2)][0].y, 'basic_locomotive', this.global_scaling);
        //StartUI(this);
=======
        this.train = new Train(this, config.width/10, this.tracks[Math.floor(num_tracks/2)][0].y, 'basic_locomotive');
        StartUI(this);
>>>>>>> afc38091a9cccb083415af5ac765f51981b9d7d8
    }

    update(time, delta) {
        this.updateTracks(delta);
        this.train.update();
        this.updateEvents(delta);
        this.updateBackground();
    }

    updateBackground(){
        this.background.tilePositionX += this.speed;
    }

    updateTracks(delta) {
        // move the tracks
<<<<<<< HEAD
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
=======
        for (const[key, value] of Object.entries(this.tracks)) {
            for (let i = 0; i < value.length; i++) {
                value[i].update();
                this.nodes[key][i].update();
>>>>>>> afc38091a9cccb083415af5ac765f51981b9d7d8
            }
        }
        this.dx += this.speed;
<<<<<<< HEAD
        if (this.dx >= this.node_interval*2) {
=======
        if (this.dx >= this.j_tick) {
>>>>>>> afc38091a9cccb083415af5ac765f51981b9d7d8
            this.dx = 0;
            SpawnTracks(this, this.tracks, this.nodes, this.speed);
        }
    }

    updateEvents(delta) {
        if (this.atJunction) {
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

        if (this.atStation) {
            this.enterStation(this.currentStation);
        }
    }

    enterStation(station) {
        this.train.passengers.forEach(passenger => {
            if (passenger.destination == station.location || !passenger.goodReview) {
                passenger.reached = true;
                passenger.onTrain = false;
                if (passenger.goodReview == false) {
                    this.train.health -= 20;
                }
                this.train.passengers.remove(passenger);
            }
        });

        station.passengers.forEach(passenger => {
            if (this.train.passengers.length < this.train.capacity) {
                passenger.onTrain = true;
                this.train.passengers.push(passenger);

            } 
        });
    }
}