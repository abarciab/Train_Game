class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/trains/basic locomotive.png');
        LoadUI(this);
    }

    create() {
        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0);
        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');
        this.base_interval = 64*6;  // base unscaled interval between rows of tracks
        this.num_tracks = 5;        // number of rows of tracks
        this.num_chunks = 8;        // number of chunks that are loaded
        this.dx = 0;                // delta x; how much the player has traveled
        this.tracks = {};           // key: track row, value: track images
        this.nodes = {};            // key: track row, value: node objects
        this.atJunction = false;    // if the player is approaching a junction
        this.can_turn_N = false;    // whether the player can turn north or south
        this.can_turn_S = false;

        // initialize tracks and nodes to keys and empty lists
        for (let i = 0; i < this.num_tracks; i++) {
            this.tracks[i] = [];
            this.nodes[i] = [];
        }


        let margin = 0; // margin; no use right now
        this.y_interval = (config.height-(2*margin))/(Object.keys(this.tracks).length+1); // interval that rows of tracks should be seperated
        this.global_scaling = this.y_interval / this.base_interval; // scaling of all objects
        this.x_unit = 64 * this.global_scaling; // unit square of measurement
        this.node_interval = 20 * this.x_unit;  // interval between each node/track placement
        this.travel_interval = this.node_interval;
        this.input_interval = 10 * this.x_unit; // interval user can input an action before a junction
        this.junction_offset = 2 * this.x_unit; // offset of junction where train moves
        this.speed = 5;    // speed of background

        // spawn the world initially
        initSpawn(this, this.tracks, this.nodes, this.speed, margin, this.node_interval, this.y_interval, this.num_chunks, this.global_scaling);
        // initial spawn:
        this.train = new Train(this, config.width/10, this.tracks[Math.floor(this.num_tracks/2)][0].y, 'basic_locomotive', 0, Math.floor(this.num_tracks/2), this.speed, this.global_scaling);

        // tracks amount of fuel left
        this.fuel = this.time.delayedCall(this.train.fuelCapacity, () => {
            this.speed = 0;
            this.gameOver = true;
        }, null, this);

        StartUI(this);
    }

    update(time, delta) {
        this.updateTracks(delta);
        this.train.speed = this.speed;
        this.train.update();
        this.updateEvents(delta);
        this.updateBackground();
    }

    updateBackground(){
        this.background.tilePositionX += this.speed;
    }

    updateTracks(delta) {
        // go by each row of tracks
        for (let i = 0; i < this.num_tracks; i++) {
            // move the tracks
            for (let j = 0; j < this.tracks[i].length; j++) {
                this.tracks[i][j].x -= this.speed;
                if (this.tracks[i][j].x < -2*this.node_interval) {
                    delete this.tracks[i][j];
                    this.tracks[i].splice(j, 1);
                }
            }
            // move and update the nodes
            for (let j = 0; j < this.nodes[i].length; j++) {
                this.nodes[i][j].speed = this.speed;
                this.nodes[i][j].update();
                // check if player is within x_distance of node, same row, and is greater than junction_offset
                if (this.train.onTrack == i && !this.train.can_turn
                && this.nodes[i][j].x - this.train.x <= this.input_interval 
                && this.nodes[i][j].x - this.train.x >= this.junction_offset) {
                    if (this.nodes[i][j].exit_N) {
                        this.atJunction=true;
                        this.can_turn_N=true;
                    }
                    if (this.nodes[i][j].exit_S) {
                        this.atJunction=true;
                        this.can_turn_S=true;
                    }
                }
                // if train is within the offset of the node that it can turn on
                else if (
                    this.train.onTrack == i && !this.train.turning
                    && this.train.x >= this.nodes[i][j].x-this.junction_offset 
                    && this.train.x <= this.nodes[i][j].x+this.junction_offset
                ) {
                    switch (this.train.turn_dir) {
                        case "straight":
                            this.atJunction = false;
                            break;
                        case "north":
                            this.train.turning = true;
                            this.train.onTrack--;
                            console.log("on track", this.train.onTrack);
                            this.train.y -= this.y_interval/2
                            this.train.turn_dest = this.nodes[this.train.onTrack][j].y;
                            this.atJunction = false;
                            break;
                        case "south":
                            this.atJunction = false;
                            this.train.onTrack++;
                            console.log("on track", this.train.onTrack);
                            this.train.turning = true;
                            this.train.y += this.y_interval/2; // this.tracks[this.train.onTrack][0].y;
                            this.train.turn_dest = this.nodes[this.train.onTrack][j].y;
                            break;
                        default:
                            console.log("invalid dir");
                            break;
                    }
                    this.can_turn_N=false;
                    this.can_turn_S=false;
                }
                if (this.nodes[i][j].x < -2*this.node_interval) {
                    this.nodes[i][j].destroy();
                    // delete this.nodes[i][j];
                    this.nodes[i].splice(j, 1);
                }
            }
        }
        this.dx += this.speed;
        if (this.dx >= this.travel_interval) {
            SpawnTracks(this, this.tracks, this.nodes, this.speed, this.node_interval, this.global_scaling);
            this.travel_interval = this.travel_interval - (this.dx-this.travel_interval);
            this.dx = 0;
        }
    }

    updateEvents(delta) {
        if (this.atJunction) {
            if (W_key.isDown && this.can_turn_N) {
                console.log("queue north");
                this.train.turn_dir = "north";
                //this.train.y = this.tracks[this.train.onTrack][0].y;
            }
            if (S_key.isDown && this.can_turn_S) {
                console.log("queue south")
                this.train.turn_dir = "south";
                //this.train.y = this.tracks[this.train.onTrack][0].y;
            }
            if (D_key.isDown) {
                console.log("queue straight")
                this.train.turn_dir = "straight";
            }
        }
        if (A_key.isDown && this.speed < 150) {
            this.speed += 10;
        }
        if (this.train.atStation) {
            this.enterStation(this.currentStation);
        }
    }

    enterStation(station) {
        this.fuel = this.train.fuelCapacity;
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