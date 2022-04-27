class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, initial_track) {
        super(scene, x, y, texture);
    
        scene.add.existing(this);             // add object to existing scene
        this.atStation = 0;               // tracks if train is at station
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

    update(scene, timer, delta) {

        this.wagons.y = this.y; // Update wagon positions

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
            let offsetMod = 1;        //an offset that changes the steepness of the train's diagonal movement

            this.dt += delta/1000 * offsetMod;
            let turn_timer = (delta/1000)*(this.junction_wid / this.speed);
            let dy = this.track_y_interval / (turn_timer/(delta/1000)) * offsetMod;

            /*if (this.turn_dir == "north" && this.tweening != true && false) {
                this.tweening = true;

                let startingDelay = 300;
                console.log("starting tween. speed: " + scene.speed);


                scene.tweens.add({
                    targets: scene.train,
                    delay: startingDelay,
                    angle: -45,
                    duration: (turn_timer*1000)/2
                })

                scene.tweens.add({
                    targets: scene.train,
                    angle: 0,
                    delay: startingDelay + (turn_timer*1000)/2,
                    duration: (turn_timer*1000)/2
                })
            }*/
            
            if (this.dt < turn_timer) {
                if (this.turn_dir == "north"){
                    this.y -= dy;
                    console.log("moving up");
                    //turning
                    //this.angle = 0;

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