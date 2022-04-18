class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
    
        scene.add.existing(this); // add object to existing scene
        this.atStation = false;   // tracks if train is at station
        this.moveSpeed = 2;       // pixels per frame
        this.onTrack = 2;         // tracks which track the train is on
    }

    update() {
        /*
        if (junction) {
            this.moveSpeed = 1;
            while (junction) {
                if (keyUp) {
                    this.onTrack--;
                    break;
                }
                if (keyDown) {
                    this.onTrack++;
                    break;
                }
            }
            this.moveSpeed = 2;
        }

        if (station) {
            this.moveSpeed = 0;
            for (person in this.passengers) {
                if (person.destination == station.location) {
                    person.goal = true;
                    person.onTrain = false;
                    this.passengers.remove(person);
                }
            }
            for (person in station.passengers) {
                person.onTrain = true;
                this.passengers.add(person);
            }
        }
        */
    }

    reset() {

    }
}