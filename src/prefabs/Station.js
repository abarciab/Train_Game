class Station extends Phaser.GameObjects.Sprite {
    // type: array of all the passenger types that can be dropped off at the station.
    constructor(scene, x, y, texture, initial_track, type, station_contents) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        this.spawn_timer = 15;    // number of nodes it takes to spawn a station
        this.station_type = type;
        this.speed = scene.speed;
        this.dir_sign = false;

        // possible containers
        this.passengers = [];
        this.upgrades = [];

        this.onTrack = initial_track;
        this.moved = false;
        this.visible = false;
        this.no_junc = true;
        this.spawned = false;
        this.stoppedAt = false;
        this.arriving_status = 0;
        this.stop_dist;
        this.dt = 0;
        this.sign;
        // this.arriving = 0;
        //this.stopX = this.x + 1300;
        if (this.station_type != "trainyard") {
            this.passengers = station_contents;      // list of passengers at station
            this.sign = scene.add.image(x, y, `${this.station_type} station sign`).setScale(scene.scaling).setDepth(8);
        }
        else {
            // choose 3 random types from upgrades
            for (let i = 0; i < 3; i++) {
                let random_index = Math.floor(Math.random() * station_contents.length) % station_contents.length;
                while (station_contents[random_index].chosen) {
                    random_index = (random_index + 1) % station_contents.length;
                }
                this.upgrades.push(station_contents[random_index]);
                station_contents[random_index].chosen = true;
            }
        }

        this.indicator = scene.add.image(config.width*0.9, y, `${this.station_type} station indicator`).setScale(scene.scaling*2).setDepth(8).setVisible(false);

        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.setDepth(7);
        this.station_point = this.displayWidth * 0.42;
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
        }
    }
}