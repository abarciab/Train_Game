class Menu extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }
    preload() {
        //background image
        this.load.image('field_background', './assets/environment/field background.png');

        //tracks and trains and stations
        this.load.image('basic_straight_track', './assets/tracks/basic straight track.png');
        this.load.image('basic_node_track', './assets/tracks/basic node track.png');
        this.load.image('basic_out-straight_track', './assets/tracks/basic out-straight track.png');
        this.load.image('basic_out-down_track', './assets/tracks/basic out-down track.png');
        this.load.image('basic_out-up_track', './assets/tracks/basic out-up track.png');
        this.load.image('basic_locomotive', './assets/trains/basic locomotive.png');
        this.load.image('basic_passenger_wagon', './assets/trains/basic passenger wagon.png');
        this.load.image('station', './assets/stations/field top station.png');

        //trees
        this.load.image('field_deadly_obstacle', './assets/obstacles/field deadly obstacle.png');
        this.load.image('field_debris_obstacle', './assets/obstacles/field debris obstacle.png');

        // passengers
        this.load.image('passenger 1', './assets/passengers/basic passenger 1.png');
        
        //sounds
        this.load.audio('train_on_rails', './assets/sound effects/train on rails 2.mp3');
        this.load.audio('menu_music', './assets/music/menu music.mp3');
    }
    create() {

        //spacer vars
        let topGap = 150
        let buttonGap = 90;
        let center = game.config.width/2;

        //create button visuals
        this.titleBar = this.add.rectangle(center, topGap, game.config.width*0.3, 120, 0xFFFFFF).setOrigin(0.5);
        this.TitleText = this.add.text(center, this.titleBar.y, "TRAIN GAME: Unfinished Business", {color: '#000000', fontSize: '22px'}).setOrigin(0.5);
        //
        this.startButton = this.add.rectangle(center, this.titleBar.y + buttonGap*3, game.config.width*0.3, 80, 0xFFFFFF).setOrigin(0.5);
        this.startText = this.add.text(center, this.startButton.y, "START GAME", {color: '#000000'}).setOrigin(0.5);
        //
        this.optionsButton = this.add.rectangle(center, this.startButton.y + buttonGap, game.config.width*0.3, 80, 0xFFFFFF).setOrigin(0.5);
        this.optionsText = this.add.text(center, this.optionsButton.y, "OPTIONS", {color: '#000000'}).setOrigin(0.5);

        //add button interactivity
        this.startButton.setInteractive()
            .on('pointerover', () => { this.startButton.setStrokeStyle(3); })
            .on('pointerout', () => this.startButton.setStrokeStyle(0))
            .on('pointerdown', () => {
                this.trainSound.stop();
                this.menuMusic.stop();
                this.scene.start("playGame");
            });

        this.optionsButton.setInteractive()
            .on('pointerover', () => {this.optionsButton.setStrokeStyle(3); })
            .on('pointerout', () => this.optionsButton.setStrokeStyle(0))
            .on('pointerdown', () => {
                console.log("options to implement: volume, train color...");
            });


        //background 
        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0).setDepth(-2);
        this.tree1 = this.add.image(200, 600, 'field_deadly_obstacle').setDepth(2);
        //this.tree2 = this.add.image(1600, 150, 'field_deadly_obstacle').setDepth(2);

        //tracks behind title
        this.add.image(-30, topGap, 'basic_straight_track').setOrigin(0, 0.5).setDepth(-1);
        this.add.image(game.config.width+30, topGap, 'basic_straight_track').setOrigin(1, 0.5).setDepth(-1);
        //tracks behind start button
        this.add.image(0, this.titleBar.y + buttonGap*3, 'basic_straight_track').setOrigin(0, 0.5).setDepth(-1);
        this.add.image(game.config.width, this.titleBar.y + buttonGap*3, 'basic_straight_track').setOrigin(1, 0.5).setDepth(-1);
        //tracks behind option button
        this.add.image(0, this.startButton.y + buttonGap, 'basic_straight_track').setOrigin(0, 0.5).setDepth(-1);
        this.add.image(game.config.width, this.startButton.y + buttonGap, 'basic_straight_track').setOrigin(1, 0.5).setDepth(-1);
        // other decrative tracks
        this.verticalTrack = this.add.image(center/2-2, this.startButton.y + buttonGap, 'basic_straight_track').setOrigin(0.5, 0).setDepth(-2);
        this.verticalTrack.angle = 90;
        this.add.image(0, this.startButton.y + buttonGap, 'basic_out-down_track').setOrigin(0, 0.5).setDepth(-1);
        this.add.image(0, topGap, 'basic_out-up_track').setOrigin(0.5, 0.5).setDepth(-1);
        // trains
        this.locomotiveA = this.add.image(-300, topGap, 'basic_locomotive').setOrigin(0.5).setDepth(1);
        this.locomotiveB = this.add.image(game.config.width*1.4, this.titleBar.y + buttonGap*3, 'basic_locomotive').setOrigin(.85, 0.5);
        this.wagonB1 = this.add.image(game.config.width*1.4 + 350, this.titleBar.y + buttonGap*3, 'basic_passenger_wagon').setOrigin(.85, 0.5);
        this.locomotiveB.flipX = true;
        this.wagonB1.flipX = true;
        //this.add.image(-600, this.startButton.y + buttonGap, 'station').setOrigin(0.5).setDepth(-1.5);

        this.trainSound = this.sound.add('train_on_rails', {volume: .3, loop: true});
        this.menuMusic = this.sound.add('menu_music', {volume: .4, loop: true});

        this.trainSound.play();
        this.menuMusic.play();
    }

    update(){
        this.locomotiveA.x += 3.5;
        if (this.locomotiveA.x > game.config.width*1.2){

            if (this.locomotiveA.y == this.titleBar.y){
                this.locomotiveA.y = this.optionsButton.y;
            } else {
                this.locomotiveA.y = this.titleBar.y;
            }
            this.locomotiveA.x = -230;
        }

        this.locomotiveB.x -= 5;
        this.wagonB1.x -= 5;
        if (this.wagonB1.x <= -120){
            this.locomotiveB.x = game.config.width * 1.5;
            this.wagonB1.x = game.config.width * 1.5 + 350;
        }
    }
}