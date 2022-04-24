class Station extends Phaser.GameObjects.Sprite {
    // type: array of all the passenger types that can be dropped off at the station.
    constructor(scene, x, y, texture, frame, initial_track, type, passengers, speed, scaling) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        this.spawn_counter = 10;    // number of nodes it takes to spawn a station
        this.type = type;
        this.speed = speed;
        this.dir_sign=false;
        this.location = "";        // location of Station
        this.passengers = passengers;      // list of passengers at station
        this.onTrack = initial_track;
        this.scaleX = scaling;
        this.scaleY = scaling;
    }
    update() {
        if (this.visible) {
            this.x -= this.speed;
        }
    }
}