class Station extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, initial_track, speed, scaling) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        this.location = "";        // location of Station
        this.passengers = [];      // list of passengers at station
        this.onTrack = initial_track;
        this.scaleX = scaling;
        this.scaleY = scaling;
    }
}