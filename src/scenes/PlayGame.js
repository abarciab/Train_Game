class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        // load images/tile sprites
        this.load.image('train', './assets/trains/basic locomotive.png');

        LoadUI(this);
    }

    create() {
        this.player = new Train(this, config.width/2, config.height/2, 'basic_locomotive');

        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0);

        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');

        let num_tracks = 3;
        this.dx; // delta x; how much the player has traveled
        this.j_tick = config.width / 4;
        this.tracks = {}; // key: track row, value: track objects
        this.junctions = {}; // key: track row, value: junction objects
        for (let i = 1; i <= num_tracks; i++) {
            this.tracks[i] = [];
        }
        
        this.train = new Train(this, 0, 400, 'train').setOrigin(0,0);

        

        StartUI(this);
    }

    update(time, delta) {
        this.updateTracks(delta);
        this.updateEvents(delta);
        this.updateBackground();
    }

    updateBackground(){
        this.background.tilePositionX += 20;
    }

    updateTracks(delta) {
        if (this.dx >= this.j_tick) {
            this.dx = 0;
            SpawnTracks();
        }
    }

    updateEvents(delta) {
        if (Phaser.Input.Keyboard.JustDown(W_key) && (this.train.onTrack != 2)) {
            this.train.onTrack++;
            this.train.y -= 200;
            testMethod();
        }
        if (A_key.isDown) {
            testMethod();
        }
        if (Phaser.Input.Keyboard.JustDown(S_key) && (this.train.onTrack != 0)) {
            this.train.onTrack--;
            this.train.y += 200;
            testMethod();
        }
        if (D_key.isDown) {
            testMethod();
        }
        if (this.train.atStation == 1) {
            console.log("Entered station");
            this.enterStation(this.currentStation);
        }
    }

    enterStation(station) {
        this.train.atStation = 2;
        let stationTime = 5000;
        let tempSpeed = this.speed;
        this.speed = 0;
        this.train.moving = false;
        this.fuel = this.train.fuelCapacity;
        console.log("Fuel sustained");
        this.train.passengers.forEach(passenger => {
            if (station.type.has(passenger.destination)) {
                passenger.onTrain = false;
                if (passenger.goodReview == false) {
                    this.train.health -= 2;
                    console.log("Bad review");
                } else {
                    this.train.health += 1;
                    console.log("Good review");
                }
                this.train.passengers.splice(this.train.passengers.indexOf(passenger), 1);
                console.log("Passenger got off train");
            } else if (!passenger.goodReview) {
                passenger.onTrain = false;
                this.train.health -= 4;
                console.log("Terrible review!");
                this.train.passengers.splice(this.train.passengers.indexOf(passenger), 1);
                console.log("Passenger got off train");
            }
        });

        station.passengers.forEach(passenger => {
            if (this.train.passengers.length < this.train.capacity) {
                passenger.onTrain = true;
                passenger.boardTrain(this);
                this.train.passengers.push(passenger);
                console.log("Passenger got on train");
            }
            if (this.train.passengers.length == this.train.capacity) {
                console.log("Full train!");
            }
        });

        let gettingOff = this.time.delayedCall(stationTime/2, () => {
            // Getting off animations
            /*
            Could do this by filling up list of passengers
            who are getting off, and then showing all
            their sprites leaving. Alternatively, could
            have immediate train sprite change by
            counting how many passengers got off.
            */
            let gettingOn = this.time.delayedCall(stationTime/2, () => {
                // Getting on animations
                // Same as getting off
                this.speed = tempSpeed;
                this.fuel = this.train.fuelCapacity;
                this.train.moving = true;
                console.log("Refueled");
                console.log("Station business done");
                this.train.atStation = 0;
                // start patience timers
            }, null, this);
        }, null, this);
    }
}