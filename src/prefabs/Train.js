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
        this.moving = true;              // tracks if train needs to deplete fuel
        this.junction_wid = (1184-192)*scene.scaling;
        this.turning = false;
        this.turn_dest = this.y;
        this.speed = scene.speed;
        this.stop_dist;
        this.dt = 0;
        this.turn_dir = "straight";
        this.track_y_interval = 64*6*scene.scaling;

        this.wagons = scene.add.container(x, y);
        scene.add.existing(this.wagons);
        this.wagons.setDepth(10);
        this.wagons.scaleX =  scene.scaling;
        this.wagons.scaleY = scene.scaling;
        
        this.displayOriginX = 1;
        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.setDepth(10);

    }

    update(timer, delta) {
        // if turning, update dy depending on speed
        if (this.turning) {
            this.dt += delta/1000;
            let turn_timer = (delta/1000)*(this.junction_wid / this.speed);
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
            }
        }
    }

    reset() {

    }

}