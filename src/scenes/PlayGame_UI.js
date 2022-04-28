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
    color: '#000000',
    align: 'center',
}




function DisplayNextInstruction(scene) {
    let config = {
        align: 'center',
        fontSize: '35px',
        strokeThickness: 1,
        stroke: '#000000',
    }


    if (this.instructionStage == 0){
        //instructionStage += 1;
        this.instructionText = scene.add.text(game.config.width/2, game.config.height/2 - 150, "USE W, S, and D to change junction direction", config)
        .setDepth(25)
        .setOrigin(0.5);
    } 
    else if (this.instructionStage >= 1){
        this.instructionText.setVisible(false);
    }
}

function LoadUI(scene){
    //biome assets
    scene.load.image('biome_bar_fields', './assets/UI/biome bar.png');
    scene.load.image('biome_cursor_fields', './assets/UI/biome bar cursor fields.png');

    //passenger station shapes
    scene.load.image('pass_tri', './assets/UI/passenger triangle.png');
    scene.load.image('pass_circle', './assets/UI/passenger circle.png');
    scene.load.image('pass_square', './assets/UI/passenger square.png');

    //passenger patience
    scene.load.image('patience_bar', './assets/UI/passenger patience.png');

    //ggrey backdrop for UI
    scene.load.image('UI_bar_backgrounds', './assets/UI/bottom bar.png');
    scene.load.image('GO_background', './assets/UI/game over background.png');

    //fuel display
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

    scene.UIConfig = {
        iconGap: null,
        numPassengers: 0
    };

    //variables
    this.front = 60;
    this.iconGap = 80;
    this.iconScale = 0.5;
    this.bottomBarYpos = game.config.height - 60;

    //passenger group
    this.numPassengers = 0;
    let groupConfig = {
        classType: PassengerIcon
    }
    this.passengers = scene.add.group(groupConfig);

    //UI background
    this.topBar = scene.add.image(game.config.width/2 + 230, 60, 'UI_bar_backgrounds').setOrigin(0.5).setScale(0.95, 1.4).setDepth(20);
    this.bottomBar= scene.add.image(game.config.width/2, this.bottomBarYpos, 'UI_bar_backgrounds').setOrigin(0.5).setScale(1.35, 1.5).setDepth(20);

    //fuel display
    this.fuelMeter = scene.add.image(game.config.width - 200, this.bottomBarYpos-10, 'fuel_meter').setOrigin(0.5).setScale(0.55).setDepth(20);
    this.fuelNeedle = scene.add.image(game.config.width - 200, this.bottomBarYpos + 25, 'fuel_needle').setOrigin(0.5).setScale(0.55).setDepth(21);
    
    //distance display
    this.distDisplay = scene.add.text(game.config.width*0.85, this.topBar.y, "Dist: 20,000m", this.textConfig).setOrigin(0.5).setDepth(20);
    this.distDisplay.setColor('#FFFFFF');
    //biome display
    this.biomeBar = scene.add.image(game.config.width/2 + 60, this.topBar.y, 'biome_bar_fields').setDepth(20);
    this.biomeBarCursor = scene.add.image(game.config.width/2 + 60, this.topBar.y, 'biome_cursor_fields').setDepth(20);

    //stars
    let starWidth = 80;
    this.star1 = scene.add.image(80, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star2 = scene.add.image(this.star1.x + starWidth, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star3 = scene.add.image(this.star1.x + starWidth*2, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star4 = scene.add.image(this.star1.x + starWidth*3, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.star5 = scene.add.image(this.star1.x + starWidth*4, this.topBar.y - 10, 'star_4/4').setScale(0.7);
    this.rating  = 20;
    displayRating();

    this.instructionStage = 0;

    scene.UIConfig.iconGap = this.iconGap;
}

function UpdateUI(scene, delta){
    //instructions
    
    DisplayNextInstruction(scene);

    this.instructionStage += (delta/1000)/5

    //update fuel display
    this.fuelNeedle.angle = ( (scene.fuel/scene.train.fuelCapacity) * 180) - 90;

    //update distance display and biome display
    biomeBarCursor.x += delta/200;
    this.distDisplay.text = "Dist: " + Math.round(scene.dist).toLocaleString(undefined) + "m";

    //update star display, if needed
    if (this.rating != scene.train.health){
        this.rating = scene.train.health;
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
    
    if (rating > 0){
        partialStar.setTexture("star_" + rating%4 + "/4"); 
    }
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

    this.newPassIcon = new PassengerIcon(scene, this.front + (iconGap*numPassengers), bottomBarYpos, shape, passenger, numPassengers).setScale(this.iconScale).setDepth(25);
    this.passengers.add(newPassIcon);

    //console.log(this.newPassIcon.passengerObj.destination + " BORDED. passengers: " + this.numPassengers);
}

function RemovePassengerIcons(scene, stationName){
    //console.log("length(passengers): " + this.passengers.countActive(true));
    let emptySlots = [];

    //this.passengers.getChildren().forEach(function(passengerIcon) 
    let incomingPassengers = this.passengers.countActive(true);

    for (i = 0; i < incomingPassengers; i++) {
        let passengerIcon = passengers.getChildren()[i];

        //console.log(passengerIcon.passengerObj.destination + "PASSENGER CONSIDERED. i: " + i);

        if (passengerIcon.passengerObj.destination == stationName || !passengerIcon.passengerObj.goodReview){

            passengerIcon.passengerObj.disembark(scene);
            emptySlots.push(passengerIcon.slot);

            passengerIcon.patienceBar.destroy();
            this.passengers.remove(passengerIcon, true, true);

            if (i != incomingPassengers-1){
                i -= 1;
            }
            
            incomingPassengers -= 1;
            this.numPassengers -= 1;

            //console.log(passengerIcon.passengerObj.destination + " DISEMBARKED. passengers: " + this.numPassengers);

        } else{
            const emptySlotCount = emptySlots.length;
            for (j = 0; j < emptySlotCount; j++){
                if (passengerIcon.slot >= emptySlots[j]){
                    
                    emptySlots.push(passengerIcon.slot);
                    passengerIcon.slot -= 1;

                    passengerIcon.x -= scene.UIConfig.iconGap;
                    passengerIcon.patienceBar.x -= scene.UIConfig.iconGap;   

                    //console.log("shifting " + passengerIcon.passengerObj.destination + " from slot "+ (passengerIcon.slot +1) +" to slot " + passengerIcon.slot);
                }
            }
            for (j = 0; j < emptySlots.length; j++){
                if (emptySlots[j] == passengerIcon.slot){
                    emptySlots.splice(j, 1);
                    //console.log("icon was shifted into a previously empty slot ("+emptySlots[j]+") and now that slot isn't marked as empty");
                    break;
                }
            }
        }
    };


}

class PassengerIcon extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, passenger, slot) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.passengerObj = passenger;

        this.setOrigin(0.5);
        this.patienceBar = scene.add.sprite(x, y + 20, 'patience_bar').setDepth(25);
        this.patience = passenger.patience;

        //change color of patience bar from green to red and make it shrink over time
        //console.log("adding passengerUI")
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
                if (tween.getValue() == 100){       //this passenger is out of patience
                    passenger.goodReview = false;
                    this.setAlpha(0.4);
                    scene.cameras.main.shake(50, 0.009);
                    //console.log(this.passengerObj.destination + " ran out of patience. passengers: " + this.numPassengers);
                }
            }
        })

        this.ID = Phaser.Math.Between(0, 999);

        this.slot = slot;
    }

    printPassengerIcon(){
        console.log("passengerIcon - station: " + this.passengerObj.destination + ", ID: " + this.ID);
    }

}

function EndGameUI(scene){
    //console.log("endGame");

    this.darkColorBack = scene.add.rectangle(0, 0, game.config.width, game.config.height, '#000000').setAlpha(0.1).setScale(4).setDepth(22.9);
    this.gameOverBackground = scene.add.image(game.config.width/2, game.config.height/2, 'GO_background').setDepth(23).setScale(1, 1.5).setAlpha;
    this.gameOverText = scene.add.text(game.config.width/2, game.config.height/2, "GAME OVER\nDistance traveled: " + Math.round(scene.dist).toLocaleString(undefined), this.textConfig)
        .setDepth(23.1)
        .setColor('#FFFFFF')
        .setOrigin(0.5);

    this.restartText = scene.add.text(game.config.width/2, game.config.height/2 + this.gameOverText.displayHeight, "Press SPACE to restart", this.textConfig)
        .setDepth(23.1)
        .setColor('#FFFFFF')
        .setOrigin(0.5);
}