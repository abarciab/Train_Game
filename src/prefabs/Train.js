class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
    
        scene.add.existing(this); // add object to existing scene
        this.atStation = false;   // tracks if train is at station
        this.onTrack = 1;         // tracks which track the train is on
        this.health = 100;        // tracks yelp rating

        /*
        this.passengers = array of passengers;
    }

    /*
    update() {
        /*
        if (junction) {
            slow down and/or enable updateEvents()
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
        }

        if (station) {
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

        if (obstacle) {
            play blow up animation
            go to Game Over scene
        }
        
        if (small obstacle) {
            either slow down or reduce health
        }
    }

    reset() {

    }
    */
}