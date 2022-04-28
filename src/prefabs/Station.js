class Station extends Phaser.GameObjects.Sprite {
    // type: array of all the passenger types that can be dropped off at the station.
    constructor(scene, x, y, texture, initial_track, type, passengers) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        this.spawn_timer = 15;    // number of nodes it takes to spawn a station
        this.type = type;
        this.speed = scene.speed;
        this.dir_sign = false;
        this.passengers = passengers;      // list of passengers at station
        this.onTrack = initial_track;
        this.moved = false;
        this.visible = false;
        this.no_junc = true;
        this.spawned = false;
        this.stoppedAt = false;
        this.station_point = this.displayWidth * scene.scaling * 0.32;
        this.arriving_status = 0;
        this.stop_dist;
        this.dt = 0;
        // this.arriving = 0;
        //this.stopX = this.x + 1300;
        
        let station_type = Array.from(this.type)[0];    
        this.sign = scene.add.image(x, y, `${station_type} station sign`).setScale(scene.scaling).setDepth(8);
        this.indicator = scene.add.image(config.width*0.9, y, `${station_type} station indicator`).setScale(scene.scaling*2).setDepth(8).setVisible(false);

        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
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
                this.indicator.y = this.y;
                this.indicator.setVisible(true);
            }
            //this.stopX -= this.speed;
        }
    }
}