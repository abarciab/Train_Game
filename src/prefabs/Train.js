class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, initial_track, speed, scaling) {
        super(scene, x, y, texture, frame);
    
        scene.add.existing(this); // add object to existing scene
        this.atStation = false;   // tracks if train is at station
        this.onTrack = initial_track;         // tracks which track the train is on
        this.health = 100;        // tracks yelp rating
        this.passengers = [];     // list of passengers in train
        this.capacity = 6;        // # of passengers the train can fit
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
            console.log("turning...");
            this.dx += this.speed;
            if (this.dx >= this.junction_wid) {
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