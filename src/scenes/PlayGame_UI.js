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

    //grey backdrop for UI
    scene.load.image('UI_bar_backgrounds', './assets/UI/bottom bar.png');
    scene.load.image('GO_background', './assets/UI/game over background.png');
    scene.load.image('wagon_background', './assets/UI/wagon cutout background.png');
    scene.load.image('locomotive_background', './assets/UI/locomotive cutout background.png');

    //fuel display
    scene.load.image('fuel_meter', './assets/UI/fuel meter.png');
    scene.load.image('fuel_needle', './assets/UI/fuel needle.png');
   
    //star
    scene.load.image('star_4/4', './assets/UI/UI star full.png');
    scene.load.image('star_3/4', './assets/UI/UI star three quarter.png');
    scene.load.image('star_2/4', './assets/UI/UI star half.png');
    scene.load.image('star_1/4', './assets/UI/UI star quarter.png');
    scene.load.image('star_0/4', './assets/UI/UI star empty.png');

    //upgrade icons
    scene.load.image('jump_icon', './assets/UI/jump upgrade icon.png');
    scene.load.image('boost_icon', './assets/UI/speed boost upgrade icon.png');
    scene.load.image('shield_icon', './assets/UI/protection upgrade icon.png');

    //sounds
    scene.load.audio('bad_review', './assets/sound effects/badreview.wav');
    scene.load.audio('board_train', './assets/sound effects/boardtrain sound.wav');
    scene.load.audio('good_review', './assets/sound effects/disembark sound.wav');

   

}

function StartUI(scene){

    scene.UIConfig = {
        iconGap: null,
        numPassengers: 0
    };

    //variables
    this.front = 490;
    this.iconGap = 70;
    this.iconScale = 0.5;
    this.bottomBarYpos = game.config.height - 30;
    this.abilityFront = 90;
    this.abilityGap = 80;
    this.abilityScale = 0.7;

    //passenger group
    this.numPassengers = 0;
    let groupConfig = {
        classType: PassengerIcon
    }
    this.passengers = scene.add.group(groupConfig);

    //normal UI background
    this.topBar = scene.add.image(game.config.width/2 + 230, 60, 'UI_bar_backgrounds').setOrigin(0.5).setScale(0.95, 1.4).setDepth(20);
    this.locomotive = scene.add.image(250, this.bottomBarYpos, 'locomotive_background').setOrigin(0.5).setScale(1.3, 1).setDepth(20);
        this.jumpAbility = scene.add.image(this.abilityFront, this.bottomBarYpos-30, 'jump_icon').setDepth(23).setScale(this.abilityScale).setOrigin(0.45);
        this.boostAbility = scene.add.image(this.abilityFront + this.abilityGap*1, this.bottomBarYpos-30, 'boost_icon').setDepth(23).setScale(this.abilityScale).setOrigin(0.45);
        this.protAbility = scene.add.image(this.abilityFront + this.abilityGap*2, this.bottomBarYpos-30, 'shield_icon').setDepth(23).setScale(this.abilityScale).setOrigin(0.45);
        //this.jumpAbility = scene.add.image(80, this.bottomBarYpos-30, 'jump_icon').setDepth(23).setScale(0.8).setOrigin(0.45);
        //this.jumpAbility = scene.add.image(80, this.bottomBarYpos-30, 'jump_icon').setDepth(23).setScale(0.8).setOrigin(0.45);
    this.wagon1 = scene.add.image(this.front + 250, this.bottomBarYpos, 'wagon_background').setOrigin(0.5).setScale(1.3, 1).setDepth(20);
    this.wagon2 = scene.add.image(this.front + 250 + this.wagon1.displayWidth, this.bottomBarYpos, 'wagon_background').setOrigin(0.5).setScale(1.3, 1).setDepth(20);

    //trainyard UI
    this.trainyardMenu = scene.add.image(game.config.width/2, game.config.height/2, 'GO_background').setDepth(23).setScale(1, 1.5).setVisible(false);
    this.jumpUpgradeShopIcon = scene.add.image(game.config.width/2, game.config.height/2, 'jump_icon').setDepth(23.1).setVisible(false);
    this.boostUpgradeShopIcon = scene.add.image(game.config.width/2, game.config.height/2, 'boost_icon').setDepth(23.1).setVisible(false);
    this.protUpgradeShopIcon = scene.add.image(game.config.width/2, game.config.height/2, 'shield_icon').setDepth(23.1).setVisible(false);


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

    //game over UI
    this.darkColorBack = scene.add.rectangle(0, 0, game.config.width, game.config.height, '#000000').setAlpha(0.6).setScale(4).setDepth(22.9).setVisible(false);
    this.gameOverBackground = scene.add.image(game.config.width/2, game.config.height/2, 'GO_background').setDepth(23).setScale(1, 1.5).setVisible(false);
    this.gameOverText = scene.add.text(game.config.width/2, game.config.height/2, "GAME OVER\nDistance traveled: " + Math.round(scene.dist).toLocaleString(undefined), this.textConfig)
        .setDepth(23.1)
        .setColor('#FFFFFF')
        .setOrigin(0.5)
        .setVisible(false);
    this.restartText = scene.add.text(game.config.width/2, game.config.height/2 + this.gameOverText.displayHeight, "Press SPACE to restart", this.textConfig)
        .setDepth(23.1)
        .setColor('#FFFFFF')
        .setOrigin(0.5)
        .setVisible(false);

    this.instructionStage = 0;
    scene.UIConfig.iconGap = this.iconGap;
}

function DisplayTrainyardUI(scene){

}

function UpdateUI(scene, delta){
    //instructions
    
    DisplayNextInstruction(scene);

    this.instructionStage += (delta/1000)/5

    //update fuel display
    this.fuelNeedle.angle = ( (scene.fuel/scene.train.fuelCapacity) * 180) - 90;

    //update distance display and biome display
    biomeBarCursor.x += (delta * scene.speed)/5000;
    if (biomeBarCursor.x > biomeBar.x + biomeBar.displayWidth-40){
        biomeBarCursor.x = game.config.width/2 + 60
    }
    this.distDisplay.text = "Dist: " + Math.round(scene.dist).toLocaleString(undefined) + "m";

    //update star display, if needed
    if (this.rating != scene.train.health){
        this.rating = scene.train.health;
        displayRating();
    }
}

function updateAbilities(scene){

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

    this.newPassIcon = new PassengerIcon(scene, this.front + (iconGap*numPassengers), bottomBarYpos-40, shape, passenger, numPassengers).setScale(this.iconScale).setDepth(22.8);
    this.passengers.add(newPassIcon);

    scene.sound.play('board_train', {volume: 0.5});
}

//deprecated, don't use
function RemovePassengerIcons(scene, stationName){

    for (i = 0; i < this.passengers.countActive(true); i++) {
        let passengerIcon = passengers.getChildren()[i];

        if (passengerIcon.passengerObj.destination == stationName || !passengerIcon.passengerObj.goodReview){
            
            if (passengerIcon.goodReview != false){
                console.log("good review");
                scene.sound.play('good_review', {volume: 0.8});
            } 

            passengerIcon.passengerObj.disembark(scene);
            passengerIcon.patienceBar.destroy();
            this.passengers.remove(passengerIcon, true, true);

            if (i != this.passengers.countActive(true)-1){
                i -= 1;
            }
            this.numPassengers -= 1;
        }
    }

    for (i = 0; i < this.passengers.countActive(true); i++) {
        let passengerIcon = passengers.getChildren()[i];

        passengerIcon.x = this.front + (scene.UIConfig.iconGap * (i+1));
        passengerIcon.patienceBar.x = this.front + (scene.UIConfig.iconGap * (i+1));
    }

}

function removePassengerIcon(scene, passenger){

    let passengerIcon = passenger.passengerIcon;

    if (passengerIcon.goodReview != false){
        console.log("good review");
        scene.sound.play('good_review', {volume: 0.8});
    } 

    //passengerIcon.passengerObj.disembark(scene);
    passengerIcon.patienceBar.destroy();
    this.passengers.remove(passengerIcon, true, true);

    this.numPassengers -= 1;

    for (i = 0; i < this.passengers.countActive(true); i++) {
        let passengerIcon = passengers.getChildren()[i];

        passengerIcon.x = this.front + (scene.UIConfig.iconGap * (i+1));
        passengerIcon.patienceBar.x = this.front + (scene.UIConfig.iconGap * (i+1));
    }

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
                    scene.cameras.main.shake(50, 0.009);
                    scene.sound.play('bad_review', {volume: 0.8});
                    //console.log("PATIENCE RUN OUT");
                }
            }
        })

        passenger.passengerIcon = this;
    }

    printPassengerIcon(){
        console.log("passengerIcon - station: " + this.passengerObj.destination + ", ID: " + this.ID);
    }

}

function EndGameUI(scene){
    //console.log("endGame");

    this.darkColorBack.setVisible(true);
    this.gameOverBackground.setVisible(true);
    this.gameOverText.text = "GAME OVER\nDistance traveled: " + Math.round(scene.dist).toLocaleString(undefined);
    gameOverText.setVisible(true);
    this.restartText.setVisible(true);
}