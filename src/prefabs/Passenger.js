class Passenger extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, patience, station) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        this.destination == station;   // Station the passenger gets off at
        this.onTrain = false;     // Tracks if passenger is on train
        this.goodReview = true;   // Tracks if passenger will give good review
        this.patience = patience; //the number of time this passenger is willing to wait on the train untill they get mad.

        addPasengerUI(scene, this);
    }
}