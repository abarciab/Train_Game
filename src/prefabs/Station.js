class Station extends Phaser.GameObjects.Sprite {
    // type: array of all the passenger types that can be dropped off at the station.
    constructor(scene, x, y, texture, frame, initial_track, type, passengers, speed, scaling) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        this.spawn_timer = 15;    // number of nodes it takes to spawn a station
        this.sign_distance = 15;
        this.type = type;
        this.speed = speed;
        this.dir_sign = false;
        this.passengers = passengers;      // list of passengers at station
        this.onTrack = initial_track;
        this.moved = false;
        this.visible = false;
        this.no_junc = true;
        this.spawned = false;
        this.stoppedAt = false;
        //this.stopX = this.x + 1300;
        
        this.sign = scene.add.image(x, y, "red square station sign").setScale(scaling).setDepth(8);
        this.indicator = scene.add.image(config.width-200, y, "red square station indicator").setScale(2).setDepth(9).setVisible(false);
        // let station_type = Array.from(this.type)[0];
        //this.sign = scene.add.image(x, y, `${station_type} station sign`).setScale(scaling).setDepth(8);
        //this.indicator = scene.add.image(x, y, `${station_type} station indicator`).setScale(scaling).setDepth(8);


        this.scaleX = scaling;
        this.scaleY = scaling;
        this.setDepth(7);
    }
    update() {
        if (this.visible) {
            this.x -= this.speed;
            if (this.sign != undefined) {
                this.sign.x = this.x;
                this.sign.y = this.y;
            }
            if (this.x < config.width) {
                this.indicator.setVisible(false);
            } 
            else if (this.x < config.width*2) {
                console.log("show indicator");
                this.indicator.y = this.y;
                this.indicator.setVisible(true);
            }
            //this.stopX -= this.speed;
        }
    }
}