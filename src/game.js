var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scene: [Menu, PlayGame]
}

let W_key, A_key, S_key, D_key;

var game = new Phaser.Game(config);