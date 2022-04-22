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
    scene.load.image('biome_bar_fields', './assets/UI/biome bar.png');
    scene.load.image('biome_cursor_fields', './assets/UI/biome bar cursor fields.png');
    scene.load.image('passenger_UI', './assets/UI/passenger UI.png');

    scene.load.image('mask', './assets/UI/circle mask test.png');

    scene.load.image('pass_tri', './assets/UI/passenger triangle.png');
    scene.load.image('pass_circle', './assets/UI/passenger circle.png');
    scene.load.image('pass_square', './assets/UI/passenger square.png');
    scene.load.image('patience_bar', './assets/UI/passenger patience.png');
    scene.load.image('bottom_bar', './assets/UI/bottom bar.png');
    scene.load.image('fuel_meter', './assets/UI/fuel meter.png');
    scene.load.image('fuel_needle', './assets/UI/fuel needle.png');
   
    //star
    scene.load.image('star_4/4', './assets/UI/UI star full.png');
    scene.load.image('star_3/4', './assets/UI/UI star three quarter.png');
    scene.load.image('star_2/4', './assets/UI/UI star half.png');
    scene.load.image('star_1/4', './assets/UI/UI star quarter.png');
    scene.load.image('star_0/4', './assets/UI/UI star empty.png');

}

function StartUI(scene){
    this.front = 60;
    this.IconGap = 80;
    this.iconScale = 0.5;
    this.bottomBarYpos = game.config.height - 60;

    this.numPassengers = 0;
    let groupConfig = {
        classType: PassengerIcon
    }
    this.passengers = scene.add.group(groupConfig);

    this.topBar = scene.add.image(game.config.width/2 + 230, 60, 'bottom_bar').setOrigin(0.5).setScale(0.95, 1.4).setDepth(20);
    this.bottomBarLeft= scene.add.image(game.config.width/2, this.bottomBarYpos, 'bottom_bar').setOrigin(0.5).setScale(1.35, 1.5).setDepth(20);


    this.fuelMeter = scene.add.image(game.config.width - 200, this.bottomBarYpos-10, 'fuel_meter').setOrigin(0.5).setScale(0.55).setDepth(20);
    this.fuelNeedle = scene.add.image(game.config.width - 200, this.bottomBarYpos + 25, 'fuel_needle').setOrigin(0.5).setScale(0.55).setDepth(21);

    this.fuelNeedle.angle = -90;


    this.pass1 = new Passenger(scene, game.config.width*2, game.config.height, 'mask', null, 5000, "red square");
    this.pass1.boardTrain(scene);

    this.pass2 = new Passenger(scene, game.config.width*2, game.config.height, 'mask', null, 7000, "blue circle");
    this.pass2.boardTrain(scene);
    
    this.distDisplay = scene.add.text(game.config.width*0.85, this.topBar.y, "Dist: 20,000m", this.textConfig).setOrigin(0.5).setDepth(20);
    this.distDisplay.setColor('#FFFFFF');
    this.dist = 0;
    this.biomeBar = scene.add.image(game.config.width/2 + 60, this.topBar.y, 'biome_bar_fields').setDepth(20);
    this.biomeBarCursor = scene.add.image(game.config.width/2 + 60, this.topBar.y, 'biome_cursor_fields').setDepth(20);

    let starWidth = 80;

    this.star1 = scene.add.image(80, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star2 = scene.add.image(this.star1.x + starWidth, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star3 = scene.add.image(this.star1.x + starWidth*2, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star4 = scene.add.image(this.star1.x + starWidth*3, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star5 = scene.add.image(this.star1.x + starWidth*4, this.topBar.y - 10, 'star_4/4').setScale(0.7);

    this.rating  = 20;
    displayRating();
}

function UpdateUI(scene, delta){
    //console.log(scene.fuel.getRemaining() + " / " + scene.train.fuelCapacity);



    this.fuelNeedle.angle = ( (scene.fuel.getRemaining()/scene.train.fuelCapacity) * 180) - 90;
    this.dist += (delta/1000) * scene.speed;
    biomeBarCursor.x += delta/200;
    this.distDisplay.text = "Dist: " + Math.round(this.dist).toLocaleString(undefined) + "m";

    if (this.rating != scene.train.health){
        this.raiting = scene.train.health;
        displayRating();
    }
    
}

function displayRating(){
    this.star1.setTexture('star_0/4');
    this.star2.setTexture('star_0/4');
    this.star3.setTexture('star_0/4');
    this.star4.setTexture('star_0/4');
    this.star5.setTexture('star_0/4');

    let partialStar = this.star1;

    if (this.rating >= 4){
        this.star1.setTexture('star_4/4');
        partialStar = this.star2;
    }
    if (this.rating >= 8){
        this.star2.setTexture('star_4/4');
        partialStar = this.star3;
    }
    if (this.rating >= 8){
        this.star3.setTexture('star_4/4');
        partialStar = this.star4;
    }
    if (this.rating >= 16){
        this.star4.setTexture('star_4/4');
        partialStar = this.star5;
    }
    if (this.rating >= 20){
        this.star5.setTexture('star_4/4');
        return;
    }
    
    partialStar.setTexture("star_" + rating%4 + "/4");
           
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
