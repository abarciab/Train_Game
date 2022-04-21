class Track extends Phaser.GameObjects.Sprite {
    // can be straight track, node track, or junction
    constructor(scene, x, y, texture, speed) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.speed = speed;
        this.setDepth(3);
    }
    update() {
        this.x -= this.speed;
    }
}

class Node extends Phaser.GameObjects.Sprite {
    // can be straight track, node track, or junction
    constructor(scene, x, y, texture, speed) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.speed = speed;
        this.setTint('#FFFFFF');
        this.setDepth(4);
    }
    update() {
        this.x -= this.speed;
    }
}

