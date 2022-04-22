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
        this.displayOriginX = 200;
        this.junction_wid = (1184-128)*scaling;
        this.turning = false;
        this.turn_dest = this.y;
        this.speed = speed;
        this.dx = 0;
        this.turn_dir = "straight";
        
        this.scaleX = scaling;
        this.scaleY = scaling;
        this.setDepth(10);
    }

    update() {
        if (this.turning) {

            if (this.turn_dir == "north"){
                this.y -= 2.5;
                if (this.y <= this.turn_dest){
                    this.done = true;
                }
            } else if (this.turn_dir == "south") {
                this.y += 2.5;
                if (this.y >= this.turn_dest){
                    this.done = true;
                }
            }

            if (this.done) {
                this.done = false;
                console.log("done turning");
                this.turning = false;
                this.dx = 0;
                this.y = this.turn_dest;
                this.turn_dir = "straight";
            }
        }
    }

    reset() {

    }

}