class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.spritesheet('train', './assets/trains/basic locomotive spritesheet.png', {frameWidth: 400, frameHeight: 446, startFrame: 0, endFrame: 2});
        this.load.image('basic_passenger_wagon', './assets/trains/basic passenger wagon.png');

        //sound effects
        this.load.audio('junction_switch', './assets/sound effects/junction switched.mp3');
        this.load.audio('backgroundMusic', './assets/music/main game song.wav');
        this.load.audio('crash_sound', './assets/sound effects/train crash.mp3');
        LoadUI(this);
    }

    create() {
        //sound effects
        this.junctionSwitchSfx = this.sound.add('junction_switch', {volume: 0.5, rate: 1.5});
        this.backgroundMusic = this.sound.add('backgroundMusic', {volume: 0.8, loop: true});
        this.trainSound = this.sound.add('train_on_rails', {volume: .3, loop: true});
        this.crashSound = this.sound.add('crash_sound', {volume: 0.1});
        this.backgroundMusic.play();
        this.trainSound.play();

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
        this.num_tracks = 4;        // number of rows of tracks
        // this.dx = 0;             // delta x; how much the player has traveled
        this.tracks = {};           // key: track row, value: track images
        this.nodes = {};            // key: track row, value: node objects
        this.stations = [];         // list of stations.
        this.enemy_trains = []      // list of enemy trains
        this.coins = {};            // dict of coins
        this.station_spawn_table = [0, 0, 0, 10, 10, 10, 20, 20, 20, 30];
        this.station_spawn_index = 0;
        this.gameOver = false;

        // initialize tracks and nodes to keys and empty lists
        for (let i = 0; i < this.num_tracks; i++) {
            this.tracks[i] = [];
            this.nodes[i] = [];
            this.coins[i] = [];
        }

        this.margin = config.height/15; // margin; no use right now
        this.y_interval = (config.height-(2*this.margin))/(Object.keys(this.tracks).length+1); // interval that rows of tracks should be seperated
        this.scaling = this.y_interval / this.base_interval; // scaling of all objects
        this.x_unit = 64 * this.scaling; // unit square of measurement
        this.node_interval = 20 * this.x_unit;  // interval between each node/track placement
        this.input_interval = this.node_interval; // interval user can input an action before a junction
        this.junction_offset = 2 * this.x_unit; // offset of junction where train moves
        this.speed = 10;     // speed of world
        this.dx = 0;        // how much a player has moved
        this.speedLock = this.speed; // holds speed while speed changes when entering stations
        this.lock = false; // traces when speed is locked
        this.dist = 0;
        this.nodes_onscreen = Math.floor(config.width / this.node_interval);   // number of nodes on screen
        this.num_chunks = this.nodes_onscreen * 10;        // number of chunks that are loaded; 5x screen width

        // spawn the world initially
        this.train = new Train(this, config.width/10, 0, 'basic_locomotive', Math.floor(this.num_tracks/2), "player").setOrigin(1, 0.5);
        this.train.x += this.train.displayWidth;

        initSpawn(this);
        this.train.wagons.push(new Wagon(this, this.train.wagon_point, this.train.y, 'basic_passenger_wagon', this.train.onTrack));
        // if you want to add another wagon
        // this.train.wagons.push(new Wagon(this, this.train.wagons[this.train.wagons.length-1].wagon_point, this.train.y, 'basic_passenger_wagon', this.train.onTrack));

        // set fuel
        this.fuel = this.train.fuelCapacity;
        this.currentStation;
        StartUI(this);
    }

    update(timer, delta) {
        this.updateGameOver();
        if (this.gameOver) {
            return;
        }
        this.updateSpeed(delta);
        this.updateTracks(delta);
        this.updateCoins(delta);
        this.updateStations(delta);
        this.updateTrain(timer, delta);
        this.updateEnemyTrains(timer, delta);
        this.updateEvents(delta);
        this.updateBackground();
        UpdateUI(this, delta);
    }

    updateGameOver() {
        // Check if player lost
        if (!this.gameOver && this.train.health <= 0) {
            this.speed = 0;
            this.gameOver = true;
            this.backgroundMusic.stop();
            console.log("YOU DIED");
            EndGameUI(this);
        }

        if (this.gameOver && Phaser.Input.Keyboard.JustDown(space_bar)) {
            this.scene.restart();
        }
    }

    updateBackground() {
        this.background.tilePositionX += this.speed;
    }

    updateTrain(timer, delta) {
        this.fuel -= delta;
        this.train.update(timer, delta);
        for (let i = 0; i < this.train.wagons.length; i++) {
            this.train.wagons[i].speed = this.speed;
            this.train.wagons[i].update(timer, delta);
        }
    }

    updateEnemyTrains(timer, delta) {
        for (let i = 0; i < this.enemy_trains.length; i++) {
            let train_destroyed = false;
            this.enemy_trains[i].x -= (this.speed + 5);
            // if they would crash into an obstacle, have them jump ;)
            for (let j = 0; j < this.nodes[this.enemy_trains[i].onTrack].length; j++) {
                if (this.checkObstacleCollision(this.enemy_trains[i], this.nodes[this.enemy_trains[i].onTrack][j])) {
                    console.log("enemy train crashed");
                    this.enemy_trains[i].destroy();
                    this.enemy_trains.splice(i, 1);
                    train_destroyed = true;
                    break;
                }
                if (this.checkTrainCollision(this.train, this.enemy_trains[i])) {
                    this.crashSound.play();
                    this.train.health = 0;
                }
            }
            if (train_destroyed) continue;
            if (this.enemy_trains[i].x < -2*this.node_interval) {
                this.enemy_trains[i].destroy();
                this.enemy_trains.splice(i, 1);
            }
        }
    }

    checkTrainCollision(train, e_train) {
        return (train.onTrack == e_train.onTrack && 
            train.x < e_train.x+e_train.displayWidth &&
            train.x > e_train.x &&
            train.y < e_train.y+(0.7*e_train.displayHeight/2) &&
            train.y > e_train.y-(0.7*e_train.displayHeight/2))
    }
    
    updateSpeed(delta) {
        this.dist += (delta/1000) * this.speed;
        this.dx += (delta/1000) * this.speed;
        if (this.dx >= 200 && !this.train.atStation) {
            this.speed++;
            this.dx = 0;
        }
        this.train.speed = this.speed;
    }

    updateCoins(delta) {
        for (const[key, value] of Object.entries(this.coins)) {
            for (let i = 0; i < value.length; i++) {
                value[i].x -= this.speed;
                // check for collision
                if (this.coinCollision(this.train, value[i])) {
                    console.log("coin picked up");
                    value[i].destroy();
                    value.splice(i, 1);
                    continue;
                }

                if (value[i].x < -2*this.node_interval) {
                    value[i].destroy();
                    value.splice(i, 1);
                }
            }
        }
    }

    coinCollision(train, coin) {
        return (coin.x < train.x &&
            coin.x > train.x-train.displayWidth &&
            coin.y < train.y+(0.7*train.displayHeight/2) &&
            coin.y > train.y-(0.7*train.displayHeight/2))
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
                if (this.checkObstacleCollision(this.train, this.nodes[i][j])) {
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
                && this.nodes[i][j].x-this.train.x <= this.input_interval-this.train.displayWidth
                && this.nodes[i][j].x-this.train.x >= this.junction_offset-this.train.displayWidth) {
                    if (!this.nodes[i][j].has_arrow)
                        this.nodes[i][j].has_arrow = true;
                    this.updateJunctionDir(this.nodes[i][j]);
                }
                // when the train is close enough to turn on the node, turn the node's turn dir
                else if (
                    this.train.onTrack == i && !this.train.turning
                    && this.train.x-this.train.displayWidth >= this.nodes[i][j].x-this.junction_offset 
                    && this.train.x-this.train.displayWidth <= this.nodes[i][j].x+this.junction_offset
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
                    spawn_tracks=true;
                }
            }
        }
        // spawn the tracks if tracks have been deleted to ensure consistent number of tracks
        if (spawn_tracks) {
            spawnWorldChunk(this, true, true);
        }
    }

    // check if train collided with obstacle
    checkObstacleCollision(train, node) {
        if (train.onTrack == node.row && train.train_type == "player"
        && node.obstacle_type && !node.obstacleHit && node.turn_dir == "straight"
        && Math.abs(train.x-train.displayWidth - node.x) <= (this.speed / 2) && !train.turning) {
            return true;
        }
        // if enemy collides with obstacle, destroy the enemy train
        else if (train.onTrack == node.row && train.train_type == "enemy"
        && node.obstacle_type == 1 && Math.abs(train.x - (node.x + this.x_unit*8)) <= (this.x_unit)) {
            return true;
        }
        return false;
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

    updateStations(delta) {
        for (let i = 0; i < this.stations.length; i++) {
            this.stations[i].speed = this.speed;
            this.stations[i].update();
            // check if the train is arriving at the station
            if (this.train.onTrack == this.stations[i].onTrack 
            && this.train.x > this.stations[i].x 
            && this.train.x < this.stations[i].station_point+this.stations[i].x
            && this.stations[i].arriving_status == 0) {
                this.stations[i].arriving_status = 1;
                this.stations[i].stop_dist = (this.stations[i].x + this.stations[i].station_point) - this.train.x;
                this.speedLock = this.speed;
                this.train.atStation = 1;
            }
            // if arriving, speed lowers based on the closer you get to the station
            if (this.stations[i].arriving_status == 1) {
                let station_dist = this.stations[i].x + this.stations[i].station_point;
                this.stations[i].stop_dist = station_dist - this.train.x;
                let distance_ratio = this.stations[i].stop_dist / this.stations[i].station_point;
                this.speed = this.speedLock * distance_ratio;
                if (this.speed <= 0.5) {
                    this.speed = 0;
                    this.stations[i].arriving_status = 2;
                }
            }
            // once stopped, enter station
            else if (this.stations[i].arriving_status == 2) {
                this.enterStation(this.stations[i]);
                this.stations[i].arriving_status = 3;
            }
            // when done loading passengers, leave the station
            else if (this.stations[i].arrived_status == 4) {
                let acc_dist = Math.abs((this.stations[i].station_point + this.stations[i].x)-this.train.x);
                this.train.atStation = 0;
                this.speed = this.speedLock * (acc_dist / this.stations[i].station_point);
                if (this.speed < 1) this.speed = 1;
                if (this.speed >= this.speedLock) {
                    this.stations[i].arrived_status = 5;
                    this.speed = this.speedLock;
                }
            }

            // delete the station once off screen
            if (this.stations[i].x < -2*this.node_interval) {
                this.stations[i].destroy();
                delete this.stations[i];
                this.stations.splice(i, 1);
            }
        }
    }

    updateEvents(delta) {
        // A and D key exists for debug rn to test with variable speeds
        if (left_key.isDown && this.speed > 0){
            this.speed -= 1;
        }
        if (right_key.isDown && this.speed < 50) {
            this.speed += 1;
        }
        
    }

    enterStation(station) {
        this.train.atStation = 2;
        let stationTime = 5000;
        this.train.moving = false;
        this.fuel = this.train.fuelCapacity;
        
        RemovePassengerIcons(this, Array.from(station.type)[0]);

        this.train.passengers.forEach(passenger => {
            if (station.type.has(passenger.destination)) {
                passenger.onTrain = false;
                if (passenger.goodReview == false) {
                    this.train.health -= 2;
                    //console.log("Bad review");
                } else {
                    if (this.train.health < this.train.healthCapacity) {
                        this.train.health += 1;
                    }
                    //console.log("Good review");
                }
                this.train.passengers.splice(this.train.passengers.indexOf(passenger), 1);
                //console.log("Passenger got off train (happy)");
            } else if (!passenger.goodReview) {
                passenger.onTrain = false;
                this.train.health -= 4;
                //console.log("Terrible review!");
                this.train.passengers.splice(this.train.passengers.indexOf(passenger), 1);
                //console.log("Passenger got off train (angry)");
            }
        });

        station.passengers.forEach(passenger => {
            if (this.train.passengers.length < this.train.capacity) {
                passenger.onTrain = true;
                passenger.boardTrain(this);
                this.train.passengers.push(passenger);
                //console.log("Passenger got on train");
            }
            if (this.train.passengers.length == this.train.capacity) {
                //console.log("Full train!");
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
                this.fuel = this.train.fuelCapacity;
                this.train.moving = true;
                station.arrived_status = 4;
                // start patience timers
            }, null, this);
        }, null, this);
    }
}