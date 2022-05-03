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
        this.load.audio('coin_pickup', './assets/sound effects/pickupfuel.wav');
        this.load.audio('jump', './assets/sound effects/jump.wav');
        this.load.audio('boost', './assets/sound effects/boost.wav');
        this.load.audio('hit', './assets/sound effects/hit.wav');
        LoadUI(this);
    }

    create() {
        //sound effects: in the future, store inside of a dictionary: key = sound name, value = actual sound
        this.junctionSwitchSfx = this.sound.add('junction_switch', {volume: 0.5, rate: 1.5});
        this.backgroundMusic = this.sound.add('backgroundMusic', {volume: 0.8, loop: true});
        this.trainSound = this.sound.add('train_on_rails', {volume: .3, loop: true});
        this.crashSound = this.sound.add('crash_sound', {volume: 0.1});
        this.coinSound = this.sound.add('coin_pickup', {volume: 0.7});
        this.jumpSound = this.sound.add('jump');
        this.boostSound = this.sound.add('boost', {volume: 0.6});
        this.hitSound = this.sound.add('hit', {volume: 0.3});
        this.backgroundMusic.play();

        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0);
        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');
        // key code 37 = left key, 39 = right key
        left_key = this.input.keyboard.addKey(37);
        up_key = this.input.keyboard.addKey(38);
        right_key = this.input.keyboard.addKey(39);
        down_key = this.input.keyboard.addKey(40);

        one_key = this.input.keyboard.addKey(49);
        two_key = this.input.keyboard.addKey('2');

        space_bar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.base_interval = 64*6;  // base unscaled interval between rows of tracks
        this.num_tracks = 4;        // number of rows of tracks
        // this.dx = 0;             // delta x; how much the player has traveled
        this.tracks = {};           // key: track row, value: track images
        this.nodes = {};            // key: track row, value: node objects
        this.stations = [];         // list of stations.
        this.enemy_trains = []      // list of enemy trains
        this.coins = [];            // dict of coins
        this.currency = 0;
        this.station_spawn_table = [0, 0, 0, 10, 10, 10, 20, 20, 20, 30];
        this.station_spawn_index = 0;
        this.trainyard_spawn_table = [];
        this.trainyard_spawn_index = 0;
        this.station_types = ["red square", "blue circle", "green triangle"];
        this.station_type_index = 0;
        function Upgrade(name, price, max) {
            this.name = name;
            this.price = price;
            this.num_bought = 0;
            this.max = max;
            this.chosen = false;
        }
        this.upgrades = [
            new Upgrade("jump", 100, 5),
            new Upgrade("extra wagon", 1000, 2),
            new Upgrade("protection", 250, 3),
            new Upgrade("speed boost", 500, 3)
        ];
        // upgrades available to the player
        this.player_upgrades = {
            "jump": 0,
            "extra wagon": 0,
            "protection": 0,
            "speed boost": 0
        };
        for (let i = 0; i < 11; i++) {
            if (i < 5)
                this.trainyard_spawn_table.push(0);
            else if (i < 8)
                this.trainyard_spawn_table.push(25);
            else if (i < 10)
                this.trainyard_spawn_table.push(50);
            else
                this.trainyard_spawn_table.push(100);
        }
        this.gameOver = false;

        // initialize tracks and nodes to keys and empty lists
        for (let i = 0; i < this.num_tracks; i++) {
            this.tracks[i] = [];
            this.nodes[i] = [];
            this.coins[i] = [];
        }

        this.margin = config.height/15;             // margin; no use right now
        this.y_interval = (config.height-(2*this.margin))/(Object.keys(this.tracks).length+1); // interval that rows of tracks should be seperated
        this.scaling = this.y_interval / this.base_interval; // scaling of all objects
        this.x_unit = 64 * this.scaling;            // unit square of measurement
        this.node_interval = 20 * this.x_unit;      // interval between each node/track placement
        this.input_interval = this.node_interval;   // interval user can input an action before a junction
        this.junction_offset = 2 * this.x_unit;     // offset of junction where train moves
        this.speed = 10;                // speed of world

        this.dx = 0;                    // how much a player has moved
        this.speedLock = this.speed;    // holds speed while speed changes when entering stations
        this.lock = false;              // traces when speed is locked
        this.dist = 0;
        this.nodes_onscreen = Math.floor(config.width / this.node_interval);    // number of nodes on screen
        this.num_chunks = this.nodes_onscreen * 10;     // number of chunks that are loaded; 5x screen width

        // spawn the world initially
        this.train = new Train(this, config.width/10, 0, 'basic_locomotive', Math.floor(this.num_tracks/2), "player").setOrigin(1, 0.5);
        this.anims.create({
            key: 'noTurn',
            frames: this.anims.generateFrameNumbers('basic_locomotive', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'turnNorth',
            frames: this.anims.generateFrameNumbers('basic_locomotive', { start: 1, end: 1 }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'turnSouth',
            frames: this.anims.generateFrameNumbers('basic_locomotive', { start: 2, end: 2 }),
            frameRate: 1,
            repeat: -1
        });
        this.train.x += this.train.displayWidth*2;

        initSpawn(this);
        this.train.wagons.push(new Wagon(this, this.train.x-this.train.wagon_offset, this.train.y, 'basic_passenger_wagon', this.train.onTrack));
        /*
        // if you want to add another wagon
        let recent_wagon = this.train.wagons[this.train.wagons.length-1];
        this.train.wagons.push(new Wagon(this, recent_wagon.x-recent_wagon.wagon_offset, this.train.y, 'basic_passenger_wagon', this.train.onTrack));
        */
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
            this.enemy_trains[i].speed = this.speed + 5;
            this.enemy_trains[i].update();
            // if they would crash into an obstacle
            for (let j = 0; j < this.nodes[this.enemy_trains[i].onTrack].length; j++) {
                if (this.checkObstacleCollision(this.enemy_trains[i], this.nodes[this.enemy_trains[i].onTrack][j])) {
                    console.log("train crashed");
                    if (this.enemy_trains[i].x < config.width)
                        this.crashSound.play();
                    this.enemy_trains[i].enemy_indicator.setVisible(false);
                    this.enemy_trains[i].wagons.forEach(wagon => {
                        wagon.setVisible(false);
                    })
                    this.enemy_trains[i].destroy();
                    this.enemy_trains.splice(i, 1);
                    train_destroyed = true;
                    break;
                }
                if (this.checkTrainCollision(this.train, this.enemy_trains[i])) {
                    this.crashSound.play();
                    if (this.player_upgrades["protection"] != 0 || this.train.speed_boost) {
                        if (!this.train.speed_boost) {
                            console.log("protection used");
                            this.player_upgrades["protection"]--;
                        }
                        this.enemy_trains[i].destroy();
                        this.enemy_trains[i].wagons.forEach(wagon => {
                            wagon.setVisible(false);
                        })
                        this.enemy_trains.splice(i, 1);
                        i--;
                        train_destroyed = true;
                        break;
                    }
                    else {
                        this.train.health = 0;
                    }
                }
            }
            if (train_destroyed) continue;
            if (this.enemy_trains[i].x < -2*this.node_interval) {
                this.enemy_trains[i].destroy();
                this.enemy_trains.splice(i, 1);
                i--;
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
        if (this.speed > 0 && !this.trainSound.isPlaying) {
            this.trainSound.play();
        }
        else if (this.speed == 0 && this.trainSound.isPlaying) {
            this.trainSound.pause();
        }
        if (this.train.speed_boost && this.train.slow_down) {
            this.speed--;
            if (this.speed <= this.speedLock) {
                this.speed = this.speedLock;
                this.train.speed_boost = false;
                this.train.slow_down = false;
                console.log("speed boost over");
            }
        }
        this.dist += (delta/1000) * this.speed;
        this.dx += (delta/1000) * this.speed;
        if (this.dx >= 200 && !this.train.atStation) {
            this.speed += 2;
            this.dx = 0;
        }
        this.train.speed = this.speed;
    }

    updateCoins(delta) {
        for (let i = 0; i < this.coins.length; i++) {
            this.coins[i].x -= this.speed;
            // check for collision
            if (this.coinCollision(this.train, this.coins[i])) {
                this.coinSound.play();
                this.currency += 10;
                this.coins[i].destroy();
                this.coins.splice(i, 1);
                i--;
            }

            if (this.coins[i].x < -2*this.node_interval) {
                this.coins[i].destroy();
                this.coins.splice(i, 1);
                i--;
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
                    k--
                }
            }
            // move and update the nodes
            for (let j = 0; j < this.nodes[i].length; j++) {
                this.nodes[i][j].speed = this.speed;
                this.nodes[i][j].update();
                if (this.checkObstacleCollision(this.train, this.nodes[i][j])) {
                    if (this.player_upgrades["protection"] != 0 || this.train.speed_boost) {
                        this.hitSound.play();
                        if (!this.train.speed_boost) {
                            this.player_upgrades["protection"]--;
                            console.log("protection used");
                        }
                        this.nodes[i][j].obstacle.setVisible(false);
                        // play destroy animation
                    }
                    else {
                        this.nodes[i][j].obstacleHit = true;
                        if (this.nodes[i][j].obstacle_type == 1) {
                            this.crashSound.play();
                            this.train.health = 0;
                        } else if (this.nodes[i][j].obstacle_type == 2) {
                            console.log("hit stick");
                            this.hitSound.play();
                            this.train.health -= 4;
                            this.train.passengers.forEach(element => {
                                element.patience -= (element.max_patience * 1/4);
                                if (element.patience < 0) element.patience = 0;
                            });
                        }
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
                            this.turn_time = (delta)*(this.train.junction_wid / this.train.speed);
                            this.train.turning = true;
                            this.train.turn_dest = this.nodes[this.train.onTrack][j].y;
                            /*let firstNorth = this.time.delayedCall(this.turn_time/4, () => {
                                //this.train.play("turnNorth");
                                let secondNorth = this.time.delayedCall(this.turn_time/2, () => {
                                    this.train.play("noTurn");
                                });
                            });*/
                            break;
                        // turn south
                        case "south":
                            this.train.onTrack++;
                            this.turn_time = (delta)*(this.train.junction_wid / this.train.speed);
                            this.train.turning = true;
                            this.train.turn_dest = this.nodes[this.train.onTrack][j].y;
                            /*let firstSouth = this.time.delayedCall(this.turn_time/4, () => {
                                //this.train.play("turnSouth");
                                let secondSouth = this.time.delayedCall(this.turn_time/2, () => {
                                    this.train.play("noTurn");
                                });
                            });*/
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
                    j--;
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
            node.turn_dir = "south";
        }
        if (D_key.isDown && node.turn_dir != "straight") {
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
                if (this.train.speed_boost) {
                    this.speed = this.speedLock;
                    this.train.speed_boost = false;
                    this.train.slow_down = false;
                    this.train.boost_timer = 0;
                }
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
                if (this.stations[i].station_type != "trainyard") {
                    this.enterStation(this.stations[i]);
                    this.stations[i].arriving_status = 3;
                }
                else {
                    this.enterTrainyard(this.stations[i]);
                }
            }
            // when done with station, leave station
            else if (this.stations[i].arriving_status == 4) {
                let acc_dist = Math.abs((this.stations[i].station_point + this.stations[i].x)-this.train.x);
                this.speed = this.speedLock * (acc_dist / this.stations[i].station_point);
                if (this.speed < 1) this.speed = 1;
                if (this.speed >= this.speedLock) {
                    this.stations[i].arriving_status = 5;
                    this.speed = this.speedLock;
                    this.train.atStation = 0;
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
        let can_use_ability = function(scene, ability) {
            return (scene.player_upgrades[ability] && scene.train.atStation==0)
        }
        if (up_key.isDown && can_use_ability(this, "jump") && this.train.onTrack>0 && !this.train.turning) {
            this.jumpSound.play();
            this.player_upgrades["jump"]--;
            this.train.turn_dir = "north";
            this.train.onTrack--;
            this.train.turn_dest = this.nodes[this.train.onTrack][0].y;
            this.train.turning = true;
            this.train.jumping = true;
        }
        if (down_key.isDown && can_use_ability(this, "jump") && this.train.onTrack<this.num_tracks-1 && !this.train.turning) {
            this.jumpSound.play();
            this.player_upgrades["jump"]--;
            this.train.turn_dir = "south";
            this.train.onTrack++;
            this.train.turn_dest = this.nodes[this.train.onTrack][0].y;
            this.train.turning = true;
            this.train.jumping = true;
        }
        if (one_key.isDown && can_use_ability(this, "speed boost") && !this.train.speed_boost) {
            this.boostSound.play();
            this.speedLock = this.speed;
            this.train.speed_boost = true;
            this.speed += 20;
            this.player_upgrades["speed boost"]--;
        }
        
    }

    enterStation(station) {
        this.train.atStation = 2;

        this.train.moving = false;
        this.fuel = this.train.fuelCapacity;

        let lock = true;
        let stationTime = 0;
        //let continueStation = true;
        this.train.passengers.forEach(passenger => {
            if ((station.station_type == passenger.destination) || !passenger.goodReview) {
                stationTime++;
            }
        });
        stationTime = 2000 / (stationTime + 1);
        lock = this.stationRecurOff(station, stationTime, 0);
    }

    stationRecurOff(station, stationTime, position) {
        for (let i = position; i < this.train.passengers.length; i++) {
            position = i + 1;
            if (this.train.passengers[i].destination == station.station_type || !this.train.passengers[i].goodReview) {
                position = i;
                break;
            }
        }
        if (position > this.train.passengers.length - 1) {
            if (this.train.passengers.length + station.passengers.length <= this.train.capacity) {
                stationTime = 2000 / (station.passengers.length + 1);
            } else {
                stationTime = 2000 / (this.train.capacity - this.train.passengers.length + 1);
            }
            this.stationRecurOn(station, stationTime, 0);
            return false;
        }

        let gettingOff = this.time.delayedCall(stationTime, () => {
            let lock = true;
            this.train.passengers[position].checkStationOff(this, station);
            lock = this.stationRecurOff(station, stationTime, position);

            return false;
        });
    }

    stationRecurOn(station, stationTime, position) {
        if (position > station.passengers.length - 1 || this.train.passengers.length == this.train.capacity) {     
            this.fuel = this.train.fuelCapacity;
            this.train.moving = true;
            station.arriving_status = 4;
            return false;
        }
        let gettingOn = this.time.delayedCall(stationTime, () => {
            let lock = true;
            if (station.passengers[position].checkStationOn(this) == true) {
                this.stationRecurOn(station, stationTime, position + 1);
            }

            return false;
        })
    }


    enterTrainyard(trainyard) {
        this.train.atStation = 2;
        this.train.moving = false;
        // display the UI. UI will set arrived status to 3 once it is done.
        if (DisplayTrainyardUI(this, trainyard) == "DONE"){
            console.log("message recieved");
            this.train.moving = true;
            trainyard.arriving_status = 4;
        }
    }

    buyAbility(ability) {
        if (!ability in this.player_upgrades) {
            console.log("invalid ability");
            return;
        }
        console.log("buy ability"); 
        this.player_upgrades[ability]++;
        for (let i = 0; i < this.upgrades.length; i++) {
            if (this.upgrades[i].name == ability) {
                if (ability == "extra wagon") {
                    if (!this.train.wagons.length) {
                        this.train.wagons.push(new Wagon(this, this.train.x-this.train.wagon_offset, this.train.y, 'basic_passenger_wagon', this.train.onTrack));
                    }
                    else {
                        let recent_wagon = this.train.wagons[this.train.wagons.length-1];
                        this.train.wagons.push(new Wagon(this, recent_wagon.x-recent_wagon.wagon_offset, this.train.y, 'basic_passenger_wagon', this.train.onTrack));
                    }
                    this.train.num_wagons++;
                    this.train.capacity += 5;
                }
                console.log("currency:", this.currency, "- ", this.upgrades[i].price);
                this.currency -= this.upgrades[i].price;
                this.upgrades[i].num_bought++;
                break;
            }
        }
    }
}