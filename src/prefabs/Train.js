class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, initial_track) {
        super(scene, x, y, texture);
    
        scene.add.existing(this);             // add object to existing scene
        this.atStation = 0;                   // tracks if train is at station; 0 is not at station, 1 is arriving at station, 2 is arrived at station
        this.onTrack = initial_track;         // tracks which track the train is on
        this.health = 12;                     // tracks yelp rating
        this.healthCapacity = 20;             // tracks max health of train
        this.passengers = [];                 // list of passengers in train
        this.capacity = 6;                    // # of passengers the train can fit
        this.fuelCapacity = 100000;           // max amount of fuel Train can hold
        this.moving = true;                   // tracks if train needs to deplete fuel
        this.junction_wid = (1184-192)*scene.scaling;   // width of a junction to travel x-wards
        this.turning = false;                 // if the train is turning or not
        this.turn_wagons = false;             // if the wagons are turning
        this.wagons_turned = 0;               // number of wagons turned
        this.turn_dest = this.y;
        this.speed = scene.speed;
        this.dx = 0;
        this.dt = 0;
        this.turn_dir = "straight";
        this.track_y_interval = 64*6*scene.scaling;
        this.wagon_point = this.displayWidth * 0.7 * scene.scaling;

        //this.wagons = [scene.add.container(x, y);]
        this.wagons = [];
        /*scene.add.existing(this.wagons);
        this.wagons.setDepth(10);
        this.wagons.scaleX = scene.scaling;
        this.wagons.scaleY = scene.scaling;*/
        
        this.displayOriginX = 1;
        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.setDepth(10);

    }

    update(timer, delta) {
        // if turning, update dy depending on speed
        if (this.turning) {
            this.turn_wagons = true;
            this.dt += delta/1000;
            // amt of time it takes to change tracks
            let turn_timer = (delta/1000)*(this.junction_wid / this.speed);
            // how much the train has moved
            let dy = this.track_y_interval / (turn_timer/(delta/1000));
            if (this.dt < turn_timer) {
                if (this.turn_dir == "north"){
                    this.y -= dy;
                } 
                else if (this.turn_dir == "south") {
                    this.y += dy;
                }
            }
            else {
                this.turning = false;
                this.dt = 0;
                this.y = this.turn_dest;
                this.turn_dir = "straight";
                this.wagons.forEach(element => {
                    this.wagons.turning = false;
                })
            }
        }
        if (this.turn_wagons) {
            this.dx += this.speed;
            if (this.dx >= this.wagon_point) {
                this.dx = 0;
                for (let i = 0; i < this.wagons.length; i++) {
                    if (!this.wagons[i].turning && this.wagons[i].y != this.turn_dest) {
                        if (this.turn_dir == "north") {
                            this.wagons[i].onTrack--;
                        }
                        else if (this.turn_dir == "south") {
                            this.wagons[i].onTrack++;
                        }
                        this.wagons[i].turning = true;
                        this.wagons[i].done_turning = false;
                        this.wagons[i].turn_dir = this.turn_dir;
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
                this.turn_wagons = false;
            }
        }
    }
}

class Wagon extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, track) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.turning = false;
        this.done_turning = false;
        this.onTrack = track;
        this.speed = scene.speed;
        this.wagon_point = (this.x - this.displayWidth*0.5) * scene.scaling;
        this.junction_wid = (1184-192)*scene.scaling;
        this.track_y_interval = 64*6*scene.scaling;
        this.dx = 0;
        this.dt = 0;
        this.turn_dir = "straight";
        this.turn_dest = y;

        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.setDepth(10);
    }
    update(timer, delta) {
        if (this.turning) {
            this.dt += delta/1000;
            // amt of time it takes to change tracks
            let turn_timer = (delta/1000)*(this.junction_wid / this.speed);
            // how much the train has moved
            let dy = this.track_y_interval / (turn_timer/(delta/1000));
            if (this.dt < turn_timer) {
                if (this.turn_dir == "north"){
                    this.y -= dy;
                } 
                else if (this.turn_dir == "south") {
                    this.y += dy;
                }
            }
            else {
                this.done_turning = true;
                this.turning = false;
                this.dt = 0;
                this.y = this.turn_dest;
                this.turn_dir = "straight";
            }
        }
    }
}