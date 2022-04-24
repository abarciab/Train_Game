let config = {
    type: Phaser.AUTO,
    width: 1800,
    height: 900,
    scene: [Menu, PlayGame]
}

let W_key, A_key, S_key, D_key;

let game = new Phaser.Game(config);