let config = {
    type: Phaser.AUTO,
    width: 1800,
    height: 900,
    pixelArt: true,
    scene: [Menu, PlayGame]
}

let W_key, A_key, S_key, D_key, left_arrow, right_arrow, space_bar;

let game = new Phaser.Game(config);