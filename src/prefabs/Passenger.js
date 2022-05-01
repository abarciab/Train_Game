class Passenger extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, initial_track, patience, speed) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        let choices = ["red square", "blue circle", "green triangle"];
        this.destination = choices[(Math.floor(Math.random() * choices.length))];   // Station the passenger gets off at
        this.onTrain = false;     // Tracks if passenger is on train
        this.goodReview = true;   // Tracks if passenger will give good review
        this.patience = patience; //the number of time this passenger is willing to wait on the train untill they get mad.
        this.speed = speed;
        this.onTrack = initial_track;
        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.visible = false;
    }

    boardTrain(scene){
        addPassengerUI(scene, this);
    }

    disembark(scene){
        //console.log("I got off the train!");
    }
}