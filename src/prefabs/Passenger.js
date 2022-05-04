class Passenger extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, initial_track, patience, speed) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        let choices = ["red square", "blue circle", "green triangle"];
        this.destination = choices[(Math.floor(Math.random() * choices.length))];   // Station the passenger gets off at
        this.onTrain = false;     // Tracks if passenger is on train
        this.goodReview = true;   // Tracks if passenger will give good review
        this.max_patience = patience;
        this.patience = this.max_patience; //the number of time this passenger is willing to wait on the train untill they get mad.
        this.speed = speed;
        this.onTrack = initial_track;
        this.scaleX = scene.scaling;
        this.scaleY = scene.scaling;
        this.visible = false;
    }

    checkStationOn(scene){
        if (scene.train.passengers.length < scene.train.capacity) {
            this.onTrain = true;
            this.boardTrain(scene);
            scene.train.passengers.push(this);
            return true;
        }
        if (scene.train.passengers.length == scene.train.capacity) {
            return false;
        }
    }

    boardTrain(scene){
        addPassengerUI(scene, this);
    }

    checkStationOff(scene, station){
        if (station.station_type == this.destination) {
            this.onTrain = false;
            if (this.goodReview == false) {
                scene.train.health -= 2;
            } else {
                if (scene.train.health < scene.train.healthCapacity) {
                    scene.train.health += 1;
                }
                scene.currency += 250;
            }
            scene.train.passengers.splice(scene.train.passengers.indexOf(this), 1);
            this.disembark(scene);
            return true;
        } else if (!this.goodReview) {
            this.onTrain = false;
            scene.train.health -= 4;
            scene.train.passengers.splice(scene.train.passengers.indexOf(this), 1);
            this.disembark(scene);
            return true;
        } else {
            return false;
        }
    }

    disembark(scene){
        removePassengerIcon(scene, this);
    }
}
