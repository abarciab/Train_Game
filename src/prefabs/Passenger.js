class Passenger extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        this.destination == "";   // Station the passenger gets off at
        this.reached = false;     // Tracks if passenger reached destination
        this.onTrain = false;     // Tracks if passenger is on train
        this.junctionsPassed = 0; // # of junctions passed while in train
        this.goodReview = true;   // Tracks if passenger will give good review
    }
}