class Menu extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }
    preload() {
        
    }
    create() {

        //spacer vars
        let topGap = 200
        let buttonGap = 90;
        let center = game.config.width/2;

        //create button visuals
        this.titleBar = this.add.rectangle(center, topGap, game.config.width*0.3, 80, 0xFFFFFF).setOrigin(0.5);
        this.TitleText = this.add.text(center, this.titleBar.y, "TRAIN GAME: Unfinished Business", {color: '#000000'}).setOrigin(0.5);

        this.startButton = this.add.rectangle(center, this.titleBar.y + buttonGap*3, game.config.width*0.3, 80, 0xFFFFFF).setOrigin(0.5);
        this.startText = this.add.text(center, this.startButton.y, "START GAME", {color: '#000000'}).setOrigin(0.5);

        this.optionsButton = this.add.rectangle(center, this.startButton.y + buttonGap, game.config.width*0.3, 80, 0xFFFFFF).setOrigin(0.5);
        this.optionsText = this.add.text(center, this.optionsButton.y, "OPTIONS", {color: '#000000'}).setOrigin(0.5);

        console.log(this.startButton.fillColor);
        //add button interactivity
        this.startButton.setInteractive()
            .on('pointerover', () => {this.startButton.setFillStyle(10000999); console.log("test");})
            .on('pointerout', () => this.startButton.setFillStyle(16777215))
            .on('pointerdown', () => {
                this.scene.start("playGame");
            });

        this.optionsButton.setInteractive()
            .on('pointerdown', () => {
                console.log("options to implement: volume, train color...");
            });

        
        //this.leftBar = this.add.rectangle(0, game.config.height/3 + 50, 80, game.config.height*0.5, 0xFFFFFF).setOrigin(0,0.5);

        
        //
    }
}