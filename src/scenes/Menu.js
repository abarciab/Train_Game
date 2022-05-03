class Menu extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }
    preload() {
        //background images
        this.load.image('field_background', './assets/environment/field background.png');
        this.load.image('tutorial_background', './assets/UI/tutorial background.png');

        //tracks and trains and stations
        this.load.image('basic_straight_track', './assets/tracks/basic straight track.png');
        this.load.image('basic_track_end', './assets/tracks/basic track end.png')
        this.load.image('basic_node_track', './assets/tracks/basic node track.png');
        this.load.image('basic_out-straight_track', './assets/tracks/basic out-straight track.png');
        this.load.image('basic_out-down_track', './assets/tracks/basic out-down track.png');
        this.load.image('basic_out-up_track', './assets/tracks/basic out-up track.png');
        this.load.image('junction_arrows-down', './assets/tracks/junction arrows down.png');
        this.load.image('junction_arrows-up', './assets/tracks/junction arrows up.png');
        this.load.image('junction_arrows-straight', './assets/tracks/junction arrows straight.png');
        
        this.load.image('enemy_cargo_wagon', './assets/trains/enemy cargo wagon.png');
        this.load.image('station', './assets/stations/field top station.png');
        this.load.image('coin', './assets/obstacles/coin pickup.png');
        
        this.load.spritesheet('basic_locomotive', './assets/trains/basic locomotive spritesheet.png', {frameWidth: 400, frameHeight: 446, startFrame: 0, endFrame: 3});
        this.load.spritesheet('basic_passenger_wagon', './assets/trains/basic wagon spritesheet.png', {frameWidth: 400, frameHeight: 446, startFrame: 0, endFrame: 3});
        this.load.spritesheet('enemy_locomotive', './assets/trains/enemy locomotive.png', {frameWidth: 400, frameHeight: 446, startFrame: 0, endFrame: 0});
        this.load.spritesheet('enemy train indicator', "./assets/stations/incoming train indicator.png", {frameWidth: 86, frameHeight: 69, strtFrame: 0, endFrame: 1});

        //trees
        this.load.image('field_deadly_obstacle', './assets/obstacles/field deadly obstacle.png');
        this.load.image('field_debris_obstacle', './assets/obstacles/field debris obstacle.png');

        //tutorial
        for (let i = 1; i<= 7; i ++){
            this.load.image('tutorial ' + i, './assets/UI/tutorial ' + i + '.jpg');
        }

        // passengers
        this.load.image('passenger 1', './assets/passengers/basic passenger 1.png');

        // signs
        let sign_shapes = ["blue circle", "green triangle", "red square", "track sign"];
        let sign_dirs = ["straight", "up", "down"];
        for (let i = 0; i < sign_shapes.length; i++) {
            for (let j = 0; j < sign_dirs.length; j++) {
                if (sign_shapes[i] != "track sign")
                    this.load.image(`${sign_shapes[i]} ${sign_dirs[j]} sign`, `./assets/track signs/${sign_shapes[i]} ${sign_dirs[j]} sign.png`);
                else
                    this.load.image(`${sign_shapes[i]} ${sign_dirs[j]}`, `./assets/track signs/${sign_shapes[i]} ${sign_dirs[j]}.png`);
            }
        }
        this.load.image("trainyard station indicator", './assets/stations/red_square.png');
        for (let i = 0; i < sign_shapes.length-1; i++) {
            let sign = sign_shapes[i];
            this.load.image(`${sign} station sign`, `./assets/stations/${sign} station sign.png`);
            this.load.image(`${sign} station indicator`, `./assets/stations/${sign} station indicator.png`)
        }
        
        //sounds
        this.load.audio('train_on_rails', './assets/sound effects/train on rails 2.mp3');
        this.load.audio('menu_music', './assets/music/menu music.mp3');
    }
    create() {

        this.anims.create({
            key: 'incoming train flash',
            frames: this.anims.generateFrameNumbers('enemy train indicator', {start: 0, end: 1, first: 0}),
            frameRate: 3,
            repeat: -1,
        });
        this.anims.create({
            key: 'train move',
            frames: this.anims.generateFrameNumbers('basic_locomotive', {start: 0, end: 3, first: 0}),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: 'wagon move',
            frames: this.anims.generateFrameNumbers('basic_passenger_wagon', {start: 0, end: 3, first: 0}),
            frameRate: 5,
            repeat: -1,
        });

        //spacer vars
        let topGap = 150
        let buttonGap = 90;
        let center = game.config.width/2;

        //create button visuals
        this.titleBar = this.add.rectangle(center, topGap, game.config.width*0.3, 120, 0xFFFFFF).setOrigin(0.5);
        this.TitleText = this.add.text(center, this.titleBar.y, "TRAIN GAME: Loco Locomotive", {color: '#000000', fontSize: '22px'}).setOrigin(0.5);
        //
        this.startButton = this.add.rectangle(center, this.titleBar.y + buttonGap*3, game.config.width*0.3, 80, 0xFFFFFF).setOrigin(0.5);
        this.startText = this.add.text(center, this.startButton.y, "START GAME", {color: '#000000'}).setOrigin(0.5);
        //
        this.optionsButton = this.add.rectangle(center, this.startButton.y + buttonGap, game.config.width*0.3, 80, 0xFFFFFF).setOrigin(0.5).setVisible(false);
        this.optionsText = this.add.text(center, this.optionsButton.y, "OPTIONS", {color: '#000000'}).setOrigin(0.5).setVisible(false);

        //add button interactivity
        this.startButton.setInteractive()
            .on('pointerover', () => { this.startButton.setStrokeStyle(3); })
            .on('pointerout', () => this.startButton.setStrokeStyle(0))
            .on('pointerdown', () => {
                this.trainSound.stop();
                this.tutorial = 0;
                this.displayNextTutorial();                
            });

        //background 
        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'field_background').setOrigin(0, 0).setDepth(-2);
        this.tree1 = this.add.image(200, 600, 'field_deadly_obstacle').setDepth(2);

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
        this.locomotiveA = this.add.sprite(-300, topGap, 'basic_locomotive').setOrigin(0.5).setDepth(1);
        this.locomotiveA.anims.play('train move');
        this.locomotiveB = this.add.sprite(game.config.width*1.4, this.titleBar.y + buttonGap*3, 'basic_locomotive').setOrigin(.85, 0.5);
        this.locomotiveB.anims.play('train move');
        this.wagonB1 = this.add.sprite(game.config.width*1.4 + 350, this.titleBar.y + buttonGap*3, 'basic_passenger_wagon').setOrigin(.85, 0.5);
        this.wagonB1.anims.play('wagon move');
        this.locomotiveB.flipX = true;
        this.wagonB1.flipX = true;

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

    displayNextTutorial(){
        this.tutorial += 1;
        switch(this.tutorial){
            case 1:
                let tutorialBackground = this.add.image(game.config.width/2, game.config.height/2, 'tutorial_background').setDepth(5).setScale(0.8)
                    .setInteractive()
                    .on('pointerdown', function() {
                        this.scene.displayNextTutorial();
                    });
                img1 = this.add.image(game.config.width/2-360, game.config.height/2 , 'tutorial 1').setDepth(5).setScale(0.6);
                img2 = this.add.image(game.config.width/2+340, game.config.height/2 , 'tutorial 2').setDepth(5).setScale(0.6);
                break;
            case 2:
                img3 = this.add.image(game.config.width/2, game.config.height/2 - 220, 'tutorial 3').setDepth(5).setScale(0.6);
                img1.setTexture('tutorial 4');
                img1.y += 100;
                img2.setTexture('tutorial 5');
                img2.y += 100;
                break;
            case 3:
                img3.setVisible(false);
                img1.setTexture('tutorial 7').setScale(0.65);
                img1.x += 60;
                img1.y -= 150;
                img2.setTexture('tutorial 6');
                img2.y += 30
                
                break;
            case 4:
                this.menuMusic.stop();
                this.scene.start("playGame");
                break;
        }
    }
}

let img1;
let img2;
let img3;
