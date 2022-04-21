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

    //scene.load.image('patience_bar', './assets/UI/passenger patience.png');
    scene.load.spritesheet('patience_bar', './assets/UI/passenger patience.png', { frameWidth: 60, frameHeight: 60, startFrame: 0, endFrame: 4 });
   
}

function StartUI(scene){
    //console.log("started UI Display");
    //let topBar;
    this.front = 200;
    this.IconGap = 80;
    this.iconScale = 0.5;
    this.bottomBarYpos = game.config.height - 60;

    scene.anims.create({
        key: 'patience_bar_anim',
        frames: scene.anims.generateFrameNumbers('patience_bar', { start: 0, end: 4, first: 0 }),
        frameRate: 3,
        repeat: 0,
    });

    this.numPassengers = 0;
    let groupConfig = {
        classType: PassengerIcon
    }
    this.passengers = scene.add.group(groupConfig);

    this.topBar = scene.add.rectangle(game.config.width/2, 60, game.config.width*0.8, 80, 0xFFFFFF).setOrigin(0.5);
    this.bottomBar = scene.add.rectangle(game.config.width/2, this.bottomBarYpos, game.config.width*0.8, 80, 0xFF00FF).setOrigin(0.5);

    //this.passengerTriangle = scene.add.image(this.front, game.config.height-60, 'pass_tri').setOrigin(0.5);
    //console.log("x: " + this.passengerTriangle.x + " y: " + this.passengerTriangle.y);
    //this.passengerCircle = scene.add.image(this.front + this.IconGap, game.config.height-60, 'pass_circle').setOrigin(0.5);
    //this.passengerSquare = scene.add.image(this.front + this.IconGap*2, game.config.height-60, 'pass_square').setOrigin(0.5);

    addPasengerUI(scene, 'pass_tri', 2000);
    addPasengerUI(scene, 'pass_tri', 2000);
    addPasengerUI(scene, 'pass_square', 2000);
    addPasengerUI(scene, 'pass_tri', 2000);
    addPasengerUI(scene, 'pass_circle', 2000);
    
    this.dist = scene.add.text(game.config.width*0.8, this.topBar.y, "Dist: 20,000m", this.textConfig).setOrigin(0.5);
    this.biomeBar = scene.add.image(game.config.width/2, this.topBar.y, 'biome_bar');

}

function UpdateUI(scene, delta){
    //console.log("udpated UI Display: delata: " + delta);

    this.passengers.children.iterate((passenger) => {
        if (passenger.patience == 2000){
            

        }

        passenger.updatePatience(delta);
    });

}

function addPasengerUI(scene, shape, patience){
    this.numPassengers += 1;

    console.log("added a passenger");

    this.newPassIcon = new PassengerIcon(scene, this.front + (IconGap*numPassengers), bottomBarYpos, shape, patience).setScale(this.iconScale);

    this.passengers.add(newPassIcon);
}

class PassengerIcon extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, patience) {
        super(scene, x, y, texture);

        this.setOrigin(0.5);
        scene.add.existing(this);

        this.patienceBar = scene.add.sprite(x, y + 20, 'patience_bar');

        this.patience = patience;
        console.log("added a passenger with " + patience + " patience");

        //this.patienceBar.anims.play('patience_bar_anim');
    }

    updatePatience(delta){
        if (this.patience > 0){
            this.patience -= delta;
            this.patienceBar.setScale(this.patienceBar.scaleX * 0.99, 1);
            if (this.patience <= 0){
                console.log("PASSENGER HAS RUN OUT OF PATIENCE!!!");
            }
        }
    }
}
