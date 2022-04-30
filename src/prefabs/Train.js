class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, initial_track, train_type) {
        super(scene, x, y, texture);
    
        scene.add.existing(this);             // add object to existing scene
        this.atStation = 0;                   // tracks if train is at station; 0 is not at station, 1 is arriving at station, 2 is arrived at station
        this.onTrack = initial_track;         // tracks which track the train is on
        this.health = 12;                     // tracks yelp rating
        this.healthCapacity = 20;             // tracks max health of train
        this.passengers = [];                 // list of passengers in train
        this.capacity = 5;                    // # of passengers the train can fit
        this.fuelCapacity = 100000;           // max amount of fuel Train can hold
        this.moving = true;                   // tracks if train needs to deplete fuel
        this.junction_wid = (1184-192)*scene.scaling;   // width of a junction to travel x-wards
        this.turning = false;                 // if the train is turning or not
        this.jumping = false;                 // if the train is jumping or not
        this.turn_wagons = false;             // if the wagons are turning
        this.wagons_turned = 0;               // number of wagons turned
        this.turn_dest = this.y;
        this.speed = scene.speed;
        this.jump_speed = this.speed;
        this.dx = 0;
        this.dy = 0;
        this.turn_dir = "straight";
        this.wagon_turn_dir = this.turn_dir;
        this.track_y_interval = 64*6*scene.scaling;

        //this.wagons = [scene.add.container(x, y);]
        this.wagons = [];
        this.train_type = train_type;
        this.enemy_indicator;
        if (this.train_type == "enemy") {
            this.enemy_indicator = scene.add.image(config.width*0.85, y, "enemy train indicator").setScale(scene.scaling*2).setDepth(8).setVisible(false);
            this.flipX = true;
        }

        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.setDepth(10);

        this.wagon_offset = this.displayWidth * 1.4;
    }

    update(timer, delta) {
        if (this.train_type == "enemy" && this.enemy_indicator != undefined) {
            this.x -= this.speed;
            this.wagons.forEach(wagon => {
                wagon.x -= this.speed;
                if (wagon.onTrack != this.onTrack) {
                    wagon.onTrack = this.onTrack;
                    wagon.y = this.y;
                }
            })
            if (this.x < config.width) {
                this.enemy_indicator.setVisible(false);
            }
            else if (this.x < config.width*3) {
                this.enemy_indicator.y = this.y;
                this.enemy_indicator.setVisible(true);
            }
        }
        // if turning, update dy depending on speed
        if (this.turning) {
            this.updateTurn(delta);
        }
        if (this.turn_wagons) {
            this.updateWagonTurn(delta);
        }
    }

    updateTurn(delta) {
        this.turn_wagons = true;
        //this.dt += delta/1000;
        // amt of time it takes to change tracks
        let turn_timer = (delta/1000)*(this.junction_wid / this.speed);
        if (this.jumping) {
            turn_timer = (delta/1000)*(this.junction_wid / this.jump_speed);
        }
        // how much the train will move to accomidate with speed
        let y_per_frame = this.track_y_interval / (turn_timer/(delta/1000));
        this.dy += y_per_frame;
        if (this.dy < this.track_y_interval) {
            this.wagon_turn_dir = this.turn_dir;
            if (this.wagon_turn_dir == "north") {
                this.y -= y_per_frame;
            }
            else if (this.wagon_turn_dir == "south") {
                this.y += y_per_frame;
            }
        }
        else {
            this.turning = false;
            this.jumping = false;
            this.dy = 0;
            this.y = this.turn_dest;
            this.turn_dir = "straight";
        }
    }
    updateWagonTurn(delta) {
        this.dx += this.speed;
        if (this.dx >= this.wagon_offset) {
            this.dx = 0;
            for (let i = 0; i < this.wagons.length; i++) {
                if (!this.wagons[i].turning && this.wagons[i].onTrack != this.onTrack) {
                    this.wagons[i].onTrack = this.onTrack;
                    if (this.jumping)
                        this.wagons[i].jumping = true;
                    this.wagons[i].jump_speed = this.jump_speed;
                    this.wagons[i].turning = true;
                    this.wagons[i].done_turning = false;
                    this.wagons[i].turn_dir = this.wagon_turn_dir;
                    this.wagons[i].turn_dest = this.turn_dest;
                    break;
                }
                else if (this.wagons[i].done_turning) {
                    this.wagons_turned++;
                    this.wagons[i].done_turning = false;
                }
            }
        }
        if (this.wagons_turned >= this.wagons.length) {
            this.wagons_turned = 0;
            this.turn_wagons = false;
            this.dx = 0;
            this.wagon_turn_dir = this.turn_dir;
        }
    }
}

class Wagon extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, track) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.turning = false;
        this.jumping = false;
        this.done_turning = false;
        this.onTrack = track;
        this.speed = scene.speed;
        this.jump_speed = this.speed;
        this.wagon_point = (this.x - this.displayWidth*0.5) * scene.scaling;
        this.junction_wid = (1184-192)*scene.scaling;
        this.track_y_interval = 64*6*scene.scaling;
        this.upgrades = [];
        this.dx = 0;
        this.dy = 0;
        //this.dt = 0;
        this.turn_dir = "straight";
        this.turn_dest = y;

        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.setDepth(10);

        this.wagon_offset = this.displayWidth*0.95;
    }
    update(timer, delta) {
        if (this.turning) {
            // this.dt += delta/1000;
            // amt of time it takes to change tracks
            let turn_timer = (delta/1000)*(this.junction_wid / this.speed);
            if (this.jumping) {
                turn_timer = (delta/1000)*(this.junction_wid / this.jump_speed);
            }
            // how much the train has moved
            let y_per_frame = this.track_y_interval / (turn_timer/(delta/1000));
            this.dy += y_per_frame;
            if (this.dy < this.track_y_interval) {
                if (this.turn_dir == "north") {
                    this.y -= y_per_frame;
                }
                else if (this.turn_dir == "south") {
                    this.y += y_per_frame;
                }
            }
            else {
                this.done_turning = true;
                this.turning = false;
                this.jumping = false;
                this.dy = 0;
                this.y = this.turn_dest;
                this.turn_dir = "straight";
            }
        }
    }
}