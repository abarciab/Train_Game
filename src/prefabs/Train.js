class Train extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
    
        scene.add.existing(this); // add object to existing scene
        this.atJunction = false;  // tracks if train is in front of junction
        this.atStation = false;   // tracks if train is at station
        this.moveSpeed = 2;       // pixels per frame
        this.onTrack = 2;         // tracks which track the train is on
    }

    update() {

    }

    reset() {
        
    }
}