class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/trains/basic locomotive.png');

        //sound effects
        this.load.audio('junction_switch', './assets/sound effects/junction switched.ogg');

        LoadUI(this);
    }

    create() {

        //sound effects
        this.junctionSwitchSfx = this.sound.add('junction_switch');

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
        this.input_interval = 18 * this.x_unit; // interval user can input an action before a junction
        this.junction_offset = 2 * this.x_unit; // offset of junction where train moves
        this.speed = 30;    // speed of world

        // spawn the world initially
        initSpawn(this, this.tracks, this.nodes, this.speed, margin, this.node_interval, this.y_interval, this.num_chunks, this.global_scaling);
        // initial spawn:
        this.train = new Train(this, config.width/10, this.tracks[Math.floor(this.num_tracks/2)][0].y, 'basic_locomotive', 0, Math.floor(this.num_tracks/2), this.speed, this.global_scaling);

        // tracks amount of fuel left
        this.fuel = this.time.delayedCall(this.train.fuelCapacity, () => {
            console.log("Ran out of fuel");
            this.speed = 0;
            this.gameOver = true;
        }, null, this);

        /*
        // Testing station logic (REMOVE IN FUTURE)
        this.temp = this.time.delayedCall(3000, () => {
            this.train.atStation = true;
        }, null, this);
        this.currentStation = new Station(this, config.width/5, this.tracks[Math.floor(this.num_tracks/2)][0].y, 'station', 0);
        */
       
        StartUI(this);
    }

    update(timer, delta) {
        this.updateTracks(delta);
        this.train.speed = this.speed;
        this.train.update(timer, delta);
        //this.updateEvents(delta);
        this.updateBackground();
        //console.log('fuel: ' + this.fuel.delay);
        UpdateUI(this, delta);
    }

    updateBackground(){
        this.background.tilePositionX += this.speed;
    }

    /*
        - if the player is x distance before a node, can choose which direction the node goes
    */
    updateTracks(delta) {
        // go by each row of tracks
        for (let i = 0; i < this.num_tracks; i++) {
            // move the tracks
            for (let j = 0; j < this.tracks[i].length; j++) {
                this.tracks[i][j].x -= this.speed;
                // delete the tracks when out of range
                if (this.tracks[i][j].x < -2*this.node_interval) {
                    delete this.tracks[i][j];
                    this.tracks[i].splice(j, 1);
                }
            }
            // move and update the nodes
            for (let j = 0; j < this.nodes[i].length; j++) {
                this.nodes[i][j].speed = this.speed;
                this.nodes[i][j].update();
                /*if the player is:
                    - within x_distance of node
                    - same row as node
                    - not too close to the node
                  let the the direction the node will take the player
                */
                if (this.train.onTrack == i && (this.nodes[i][j].exit_N || this.nodes[i][j].exit_S)
                && this.nodes[i][j].x - this.train.x <= this.input_interval 
                && this.nodes[i][j].x - this.train.x >= this.junction_offset) {
                    this.updateJunctionDir(this.nodes[i][j]);
                }
                // when the train is close enough to turn on the node, turn the node's turn dir
                else if (
                    this.train.onTrack == i && !this.train.turning && this.nodes[i][j].turn_dir != "straight"
                    && this.train.x >= this.nodes[i][j].x-this.junction_offset 
                    && this.train.x <= this.nodes[i][j].x+this.junction_offset
                ) {
                    this.train.turn_dir = this.nodes[i][j].turn_dir;
                    switch (this.nodes[i][j].turn_dir) {
                        // simply go straight; no longer at junction
                        case "straight":
                            break;
                        // turn north
                        case "north":
                            this.train.onTrack--;
                            this.train.turning = true;
                            this.train.turn_dest = this.nodes[this.train.onTrack][j].y;
                            break;
                        // turn south
                        case "south":
                            this.train.onTrack++;
                            this.train.turning = true;
                            this.train.turn_dest = this.nodes[this.train.onTrack][j].y;
                            break;
                        default:
                            console.log("invalid dir");
                            break;
                    }
                }
                // destroy the node once it's far enough off screen
                if (this.nodes[i][j].x < -2*this.node_interval) {
                    this.nodes[i][j].destroy();
                    delete this.nodes[i][j];
                    this.nodes[i].splice(j, 1);
                }
            }
        }

        // check distance the train has traveled. if greater than travel_interval, spawn tracks
        this.dx += this.speed;
        if (this.dx >= this.travel_interval) {
            this.train.distanceTraveled++; // Increment # of Nodes passed
            SpawnTracks(this, this.tracks, this.nodes, this.speed, this.node_interval, this.global_scaling);
            // update the travel interval to match the frame rate
            this.travel_interval = this.travel_interval - (this.dx-this.travel_interval);
            this.dx = 0;
        }
    }

    /*
    update the direction the node will take the player
        @ node: the node that is getting updated
    */
    updateJunctionDir(node) {
        if (W_key.isDown && node.exit_N && node.turn_dir != "north") {
            //console.log("train wants to go up at next junction");
            this.junctionSwitchSfx.play();
            node.turn_dir = "north";
        }
        if (S_key.isDown && node.exit_S && node.turn_dir != "south") {
            this.junctionSwitchSfx.play();
            //console.log("train wants to go down at next junction");
            node.turn_dir = "south";
        }
        if (D_key.isDown && node.turn_dir != "straight") {
            //console.log("train wants to go stright at next junction");
            this.junctionSwitchSfx.play();
            node.turn_dir = "straight";
        }
    }

    updateEvents(delta) {
        // A key exists for debug rn to test with variable speeds
        if (A_key.isDown && this.speed < 150) {
            this.speed += 10;
        }
        if (this.train.atStation) {
            console.log("Entered station");
            this.enterStation(this.currentStation);
        }
    }

    enterStation(station) {
        let stationTime = 5000;
        let tempSpeed = this.speed;
        this.speed = 0;
        this.fuel.delay += stationTime;
        console.log("Fuel sustained");
        this.train.passengers.forEach(passenger => {
            if (passenger.destination == station.location) {
                passenger.onTrain = false;
                if (passenger.goodReview == false) {
                    this.train.health -= 10;
                    console.log("Bad review");
                }
                this.train.passengers.remove(passenger);
                console.log("Passenger got off train");
            }
            else if (!passenger.goodReview) {
                passenger.onTrain = false;
                this.train.health -= 20;
                console.log("Terrible review!");
                this.train.passengers.remove(passenger);
                console.log("Passenger got off train");
            }
        });

        station.passengers.forEach(passenger => {
            if (this.train.passengers.length < this.train.capacity) {
                passenger.onTrain = true;
                this.train.passengers.push(passenger);
                console.log("Passenger got on train");
            }
        });

        let gettingOff = this.time.delayedCall(stationTime/2, () => {
            // Getting off animations
            /*
            Could do this by filling up list of passengers
            who are getting off, and then showing all
            their sprites leaving. Alternatively, could
            have immediate train sprite change by
            counting how many passengers got off.
            */
            let gettingOn = this.time.delayedCall(stationTime/2, () => {
                // Getting on animations
                // Same as getting off
                this.speed = tempSpeed;
                this.fuel.delay = this.train.fuelCapacity;
                console.log("Refueled");
                console.log("Station business done");
                // start patience timers
            }, null, this);
        }, null, this);
        this.train.atStation = false;
    }
}