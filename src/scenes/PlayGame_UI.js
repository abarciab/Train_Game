/*
    This file handles all the UI in the game - all the information that needs to be displayed to the player that's not represented by something in-world.

    there are three functions that need to be called to make it work correctly: LoadUI, StartUI, and UpdateUI

        - LoadUI should be called within the Preload() function of the game scene - that's where this file loads the images that make up the UI.
        - StartUI should be called at the end of the Create() function of the game scene. 
        - UpdateUI can be called in two ways: 1) anywhere in the update() function of the game scene, or 2) every time variables displayed by the UI are updated. 
        for now, call it un Update(), and if it's getting laggy, we can only call it periodically.
*/

this.textConfig = {
    frontFamily: 'Courier',
    fontSize: '28px',
    //backgroundColor: '#F3B141',
    color: '#000000',
    align: 'center',
}

function LoadUI(scene){
    scene.load.image('biome_bar', './assets/UI/biome bar.png');
    scene.load.image('passenger_UI', './assets/UI/passenger UI.png');

    scene.load.image('mask', './assets/UI/circle mask test.png');

    scene.load.image('pass_tri', './assets/UI/passenger triangle.png');
    scene.load.image('pass_circle', './assets/UI/passenger circle.png');
    scene.load.image('pass_square', './assets/UI/passenger square.png');
    scene.load.image('patience_bar', './assets/UI/passenger patience.png');
    scene.load.image('bottom_bar', './assets/UI/bottom bar.png');
    scene.load.image('fuel_meter', './assets/UI/fuel meter.png');
    scene.load.image('fuel_needle', './assets/UI/fuel needle.png');
   
}

function StartUI(scene){
    //console.log("started UI Display");
    //let topBar;
    this.front = 60;
    this.IconGap = 80;
    this.iconScale = 0.5;
    this.bottomBarYpos = game.config.height - 60;

    this.numPassengers = 0;
    let groupConfig = {
        classType: PassengerIcon
    }
    this.passengers = scene.add.group(groupConfig);

    this.topBar = scene.add.rectangle(game.config.width/2, 60, game.config.width*0.8, 80, 0xFFFFFF).setOrigin(0.5);
    this.bottomBarLeft= scene.add.image(game.config.width/2, this.bottomBarYpos, 'bottom_bar').setOrigin(0.5).setScale(1.35, 1.5);


    this.fuelMeter = scene.add.image(game.config.width - 200, this.bottomBarYpos-10, 'fuel_meter').setOrigin(0.5).setScale(0.55);
    this.fuelNeedle = scene.add.image(game.config.width - 200, this.bottomBarYpos + 25, 'fuel_needle').setOrigin(0.5).setScale(0.55);

    this.fuelNeedle.angle = -90;


    //this.passengerTriangle = scene.add.image(this.front, game.config.height-60, 'pass_tri').setOrigin(0.5);
    //console.log("x: " + this.passengerTriangle.x + " y: " + this.passengerTriangle.y);
    //this.passengerCircle = scene.add.image(this.front + this.IconGap, game.config.height-60, 'pass_circle').setOrigin(0.5);
    //this.passengerSquare = scene.add.image(this.front + this.IconGap*2, game.config.height-60, 'pass_square').setOrigin(0.5);

    //addPasengerUI(scene, 'pass_tri', 2000);
    //addPasengerUI(scene, 'pass_tri', 2000);
    //addPasengerUI(scene, 'pass_square', 2000);
    //addPasengerUI(scene, 'pass_tri', 2000);
    //addPasengerUI(scene, 'pass_circle', 2000);

    this.pass1 = new Passenger(scene, game.config.width*2, game.config.height, 'mask', null, 5000, "red square");
    this.pass1.boardTrain(scene);

    this.pass2 = new Passenger(scene, game.config.width*2, game.config.height, 'mask', null, 7000, "blue circle");
    this.pass2.boardTrain(scene);
    
    this.dist = scene.add.text(game.config.width*0.8, this.topBar.y, "Dist: 20,000m", this.textConfig).setOrigin(0.5);
    this.biomeBar = scene.add.image(game.config.width/2, this.topBar.y, 'biome_bar');

}

function UpdateUI(scene, delta){
    //console.log(scene.fuel.getRemaining() + " / " + scene.train.fuelCapacity);



    this.fuelNeedle.angle = ( (scene.fuel.getRemaining()/scene.train.fuelCapacity) * 180) - 90;

}

function addPasengerUI(scene, passenger){

    this.numPassengers += 1;
    let shape;

    switch (passenger.destination){
        case "red square": 
            shape = 'pass_square';
            break;
        case "blue circle": 
            shape = 'pass_circle';
            break;
        default:
            shape = 'pass_tri';
            break;
    }

    this.newPassIcon = new PassengerIcon(scene, this.front + (IconGap*numPassengers), bottomBarYpos, shape, passenger).setScale(this.iconScale);

    this.passengers.add(newPassIcon);
}

class PassengerIcon extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, passenger) {
        super(scene, x, y, texture);

        this.setOrigin(0.5);
        scene.add.existing(this);

        this.patienceBar = scene.add.sprite(x, y + 20, 'patience_bar');

        this.patience = passenger.patience;

        this.green = Phaser.Display.Color.ValueToColor('#03fc13');
        this.red = Phaser.Display.Color.ValueToColor('#fc0303');

        scene.tweens.addCounter({
            from: 0, 
            to: 100,
            duration: passenger.patience,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: 0,
            onUpdate: tween => {
                const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(this.green, this.red, 100, tween.getValue());
                this.patienceBar.setTint(Phaser.Display.Color.GetColor(colorObj.r, colorObj.g, colorObj.b));
                this.patienceBar.setScale(1-tween.getValue()/100, 1);
                if (tween.getValue() == 100){
                    passenger.goodReview = false;
                    this.setAlpha(0.4);
                    scene.cameras.main.shake(50, 0.003);
                }
            }
        })
    }

    updatePatience(delta){
        if (this.patience > 0){
            this.patience -= delta;
            if (this.patience <= 0){
                console.log("PASSENGER HAS RUN OUT OF PATIENCE!!!");

            }
        }
    }
}
