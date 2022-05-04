/*
    TRAIN GAME: Loco Locomotive

    Creators: Andrew Wei, Manoj Sara, Aidan Barcia-Bacon
    Date completed: 5/3/2022

    Creative tilt justification:
            There are a number of technical accomplishments in this game. Most revolve around the world generation (there's always a way forward, 
        enemy trains won't ambush you at stations, following signs will lead you to stations, etc), but we're also proud of the passenger and 
        rating sytem
            We're happy with the high-res pixel art style and like the music too, and we're happy that the game looks and feels polished and cohesive.
        That being said, the most interesting creative aspect of our game is the novelty of the concept as an 'endless runner', mostly because of
        the passenger mechanic and our descision to remove the players ability to swtich lanes at will, which increases tension and requires the palyer
        to think ahead.
*/



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

let W_key, A_key, S_key, D_key, up_key, down_key, left_key, right_key, space_bar, one_key, two_key;

let game = new Phaser.Game(config);