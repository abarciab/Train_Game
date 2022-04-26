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
        this.sign;
        //this.stopX = this.x + 1300;

        switch (Array.from(this.type)[0]) {
            case "red square":
                this.sign = scene.add.image(x, y, "red square station sign").setScale(scaling).setDepth(8);
                break;
            default:
                this.sign = scene.add.image(x, y, "red square station sign").setScale(scaling).setDepth(8);
                break;
        }

        this.scaleX = scaling;
        this.scaleY = scaling;
        this.setDepth(7)
    }
    update() {
        if (this.visible) {
            this.x -= this.speed;
            if (this.sign != undefined) {
                this.sign.x = this.x;
                this.sign.y = this.y;
            }
            //this.stopX -= this.speed;
        }
    }
}