let config = {
    type: Phaser.AUTO,
    width: 1800,
    height: 900,
    physics: {
        default: "arcade",
        arcade: { fps: 60 } 
    },
    scene: [Menu, PlayGame]
}

let W_key, A_key, S_key, D_key, up_key, down_key, left_key, right_key, space_bar;

let game = new Phaser.Game(config);