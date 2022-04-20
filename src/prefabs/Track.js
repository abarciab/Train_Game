class Track extends Phaser.GameObjects.Sprite {
    // can be straight track, node track, or junction
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
    }
    update() {
        this.x -= 20;
    }
}

class Node extends Phaser.GameObjects.Sprite {
    // can be straight track, node track, or junction
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
    }

}

