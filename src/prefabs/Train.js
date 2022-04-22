class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, initial_track, speed, scaling) {
        super(scene, x, y, texture, frame);
    
        scene.add.existing(this);             // add object to existing scene
        this.atStation = false;               // tracks if train is at station
        this.onTrack = initial_track;         // tracks which track the train is on
        this.health = 100;                    // tracks yelp rating
        this.passengers = [];                 // list of passengers in train
        this.capacity = 6;                    // # of passengers the train can fit
        this.fuelCapacity = 100000;            // max amount of fuel Train can hold
        this.distanceTraveled = 0;            // # of nodes passed
        this.junction_wid = (1184-192)*scaling;
        this.turning = false;
        this.turn_dest = this.y;
        this.speed = speed;
        this.dt = 0;
        this.turn_dir = "straight";
        this.track_y_interval = 64*6*scaling;
        
        this.displayOriginX = 200;
        this.scaleX = scaling;
        this.scaleY = scaling;
        this.setDepth(10);
    }

    update(timer, delta) {
        /*
        if turning
            1.) increment dt by secs/frame 
            2.) turn_timer: calculate secs it takes to travel through the junction
            3.) dy: calculate how much the y position of the train changes per frame
            4.) while still turning, or dt is less than the turn timer, change y
            5.) when done turning, reset variables

            - I did it like this so that the y position change remains consistent despite frame rate, and works with variable speeds
        */
        if (this.turning) {
            this.dt += delta/1000;
            let turn_timer = (delta/1000)*(this.junction_wid / this.speed);
            let dy = this.track_y_interval / (turn_timer/(delta/1000));
            if (this.dt < turn_timer) {
                if (this.turn_dir == "north"){
                    this.y -= dy;
                } else if (this.turn_dir == "south") {
                    this.y += dy;
                }
            }
            else {
                console.log("done turning");
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