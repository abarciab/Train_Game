class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/trains/basic locomotive.png');

        //sound effects
        this.load.audio('junction_switch', './assets/sound effects/junction switched.mp3');
        this.load.audio('backgroundMusic', './assets/music/main game song.wav');
        this.load.audio('crash_sound', './assets/sound effects/train crash.mp3');
        LoadUI(this);
    }

    create() {
        //sound effects
        this.junctionSwitchSfx = this.sound.add('junction_switch', {volume: 0.5, rate: 1.5});
        this.backgroundMusic = this.sound.add('backgroundMusic', {volume: 1});
        this.crashSound = this.sound.add('crash_sound');
        this.backgroundMusic.play();

        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0);
        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');
        // key code 37 = left key, 39 = right key
        left_key = this.input.keyboard.addKey(37);
        right_key = this.input.keyboard.addKey(39);
        space_bar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.base_interval = 64*6;  // base unscaled interval between rows of tracks
        this.num_tracks = 3;        // number of rows of tracks
        this.num_chunks = 8;        // number of chunks that are loaded
        // this.dx = 0;                // delta x; how much the player has traveled
        this.tracks = {};           // key: track row, value: track images
        this.nodes = {};            // key: track row, value: node objects
        this.stations = [];         // list of stations.
        this.gameOver = false;

        // initialize tracks and nodes to keys and empty lists
        for (let i = 0; i < this.num_tracks; i++) {
            this.tracks[i] = [];
            this.nodes[i] = [];
        }

        this.margin = config.height/15; // margin; no use right now
        this.y_interval = (config.height-(2*this.margin))/(Object.keys(this.tracks).length+1); // interval that rows of tracks should be seperated
        this.global_scaling = this.y_interval / this.base_interval; // scaling of all objects
        this.x_unit = 64 * this.global_scaling; // unit square of measurement
        this.node_interval = 20 * this.x_unit;  // interval between each node/track placement
        // this.travel_interval = this.node_interval;
        this.input_interval = this.node_interval; // interval user can input an action before a junction
        this.junction_offset = 2 * this.x_unit; // offset of junction where train moves
        this.speed = 5;    // speed of world

        // spawn the world initially
        initSpawn(this, this.tracks, this.nodes, this.speed, this.margin, this.node_interval, this.y_interval, this.num_chunks, this.global_scaling);
        // initial spawn:
        this.train = new Train(this, config.width/10, this.tracks[Math.floor(this.num_tracks/2)][0].y, 'basic_locomotive', 0, Math.floor(this.num_tracks/2), this.speed, this.global_scaling);

        // set fuel
        this.fuel = this.train.fuelCapacity;
        this.currentStation;

        
        /*
        // Testing station logic (REMOVE IN FUTURE)
        this.temp = this.time.delayedCall(3000, () => {
            this.train.atStation = true;
        }, null, this);
        this.currentStation = new Station(this, config.width/5, this.tracks[Math.floor(this.num_tracks/2)][0].y, 'station', 0, Math.floor(this.num_tracks/2), this.speed, this.global_scaling);
        */

        StartUI(this);
    }

    update(timer, delta) {
        this.updateTracks(delta);
        this.updateStations(delta);
        this.train.speed = this.speed;
        this.fuel -= delta;
        this.train.update(timer, delta);
        this.updateEvents(delta);
        this.updateBackground();
        UpdateUI(this, delta);
    }

    updateBackground(){
        this.background.tilePositionX += this.speed;
    }

    /*
        - if the player is x distance before a node, can choose which direction the node goes
    */
    updateTracks(delta) {
        let spawn_tracks=false;
        // go by each row of tracks
        for (let i = 0; i < Object.keys(this.tracks).length; i++) {
            // move the tracks
            for (let k = 0; k < this.tracks[i].length; k++) {
                this.tracks[i][k].x -= this.speed;
                // delete the tracks when out of range
                if (this.tracks[i][k].x < -2*this.node_interval) {
                    delete this.tracks[i][k];
                    this.tracks[i].splice(k, 1);
                }
            }
            // move and update the nodes
            for (let j = 0; j < this.nodes[i].length; j++) {
                this.nodes[i][j].speed = this.speed;
                this.nodes[i][j].update();

                // check if train collided with obstacle
                if (this.train.onTrack == i && this.nodes[i][j].obstacle_type && !this.nodes[i][j].obstacleHit
                && Math.abs(this.train.x - this.nodes[i][j].x) <= (this.speed / 2) && !this.train.turning) {
                    this.nodes[i][j].obstacleHit = true;
                    if (this.nodes[i][j].obstacle_type == 1) {
                        this.crashSound.play();
                        this.train.health = 0;
                    } else if (this.nodes[i][j].obstacle_type == 2) {
                        this.crashSound.play();
                        this.train.health -= 4;
                    }
                }
                
                /*if the player is:
                    - within x_distance of node
                    - same row as node
                    - not too close to the node
                  let the the direction the node will take the player
                */
                if (this.train.onTrack == i && ("north" in this.nodes[i][j].junctions || "south" in this.nodes[i][j].junctions)
                && this.nodes[i][j].x - this.train.x <= this.input_interval 
                && this.nodes[i][j].x - this.train.x >= this.junction_offset) {
                    if (!this.nodes[i][j].has_arrow)
                        this.nodes[i][j].has_arrow = true;
                    this.updateJunctionDir(this.nodes[i][j]);
                }
                // when the train is close enough to turn on the node, turn the node's turn dir
                else if (
                    this.train.onTrack == i && !this.train.turning
                    && this.train.x >= this.nodes[i][j].x-this.junction_offset 
                    && this.train.x <= this.nodes[i][j].x+this.junction_offset
                ) {
                    this.train.distanceTraveled++;
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
                    spawn_tracks=true;
                }
            }
        }
        // spawn the tracks if tracks have been deleted to ensure consistent number of tracks
        if (spawn_tracks)
            SpawnTracks(this, this.train, this.tracks, this.nodes, this.stations, this.speed, this.node_interval, this.global_scaling);
    }

    /*
    update the direction the node will take the player
        @ node: the node that is getting updated
    */
    updateJunctionDir(node) {
        if (W_key.isDown && "north" in node.junctions && node.turn_dir != "north") {
            this.junctionSwitchSfx.play();
            node.turn_dir = "north";
        }
        if (S_key.isDown && "south" in node.junctions && node.turn_dir != "south") {
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

    updateStations() {
        for (let i = 0; i < this.stations.length; i++) {
            this.stations[i].speed = this.speed;
            this.stations[i].update();
            if (this.stations[i].x < -2*this.node_interval) {
                this.stations[i].destroy();
                delete this.stations[i];
                this.stations.splice(i, 1);
            }
        }
    }

    updateEvents(delta) {
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(space_bar)) {
            this.scene.restart();
        }

        // A and D key exists for debug rn to test with variable speeds
        if (left_key.isDown && this.speed > 0){
            this.speed -= 1;
        }
        if (right_key.isDown && this.speed < 50) {
            this.speed += 1;
        }

        // Check if player lost
        if (this.train.health <= 0 && !this.gameOver) {
            this.speed = 0;
            this.gameOver = true;
            this.backgroundMusic.stop();
            console.log("YOU DIED");
            EndGameUI(this);
        }

        // Check if train is at station
        if (this.train.atStation == 0) {
            for (let i = 0; i < this.stations.length; i++) {
                if (this.train.onTrack == this.stations[i].onTrack && !this.train.turning
                && Math.abs(this.train.x - (this.stations[i].x + 500)) <= (this.speed / 2) && !this.stations[i].stoppedAt) {
                    this.stations[i].stoppedAt = true;
                    this.currentStation = this.stations[i];
                    this.train.atStation = 1;
                    break;
                }
            }
        }
        if (this.train.atStation == 1) {
            console.log("Entered station");
            this.enterStation(this.currentStation);
        }
    }

    enterStation(station) {
        this.train.atStation = 2;
        let stationTime = 5000;
        let tempSpeed = this.speed;
        this.speed = 0;
        this.train.moving = false;
        RemovePassengerIcons(this, Array.from(station.type)[0]);
        this.fuel = this.train.fuelCapacity;
        console.log("Fuel sustained");
        this.train.passengers.forEach(passenger => {
            if (station.type.has(passenger.destination)) {
                passenger.onTrain = false;
                if (passenger.goodReview == false) {
                    this.train.health -= 2;
                    console.log("Bad review");
                } else {
                    if (this.train.health < this.train.healthCapacity) {
                        this.train.health += 1;
                    }
                    console.log("Good review");
                }
                this.train.passengers.splice(this.train.passengers.indexOf(passenger), 1);
                console.log("Passenger got off train");
            } else if (!passenger.goodReview) {
                passenger.onTrain = false;
                this.train.health -= 4;
                console.log("Terrible review!");
                this.train.passengers.splice(this.train.passengers.indexOf(passenger), 1);
                console.log("Passenger got off train");
            }
        });

        station.passengers.forEach(passenger => {
            if (this.train.passengers.length < this.train.capacity) {
                passenger.onTrain = true;
                passenger.boardTrain(this);
                this.train.passengers.push(passenger);
                console.log("Passenger got on train");
            }
            if (this.train.passengers.length == this.train.capacity) {
                console.log("Full train!");
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
                this.fuel = this.train.fuelCapacity;
                this.train.moving = true;
                console.log("Refueled");
                console.log("Station business done");
                this.train.atStation = 0;
                // start patience timers
            }, null, this);
        }, null, this);
    }
}