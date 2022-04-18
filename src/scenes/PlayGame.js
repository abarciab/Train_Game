class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {
        let player;

        let W_key = this.input.keyboard.addKey('W');
        let A_key = this.input.keyboard.addKey('A');
        let S_key = this.input.keyboard.addKey('S');
        let D_key = this.input.keyboard.addKey('D');

        let num_tracks = 3;
        tracks = {}; // key: track row, value: track objects
        junctions = {}; // key: track row, value: junction objects
        for (let i = 1; i <= num_tracks; i++) {
            tracks[i] = [];
        }
    }

    update(time, delta) {
        updateTracks(delta);
        updateJunctions();
        updateEvents(delta);
    }

    updateTracks(delta) {

    }

    updateEvents(delta) {
        if (W_key.isDown) {

        }
        if (A_key.isDown) {
            
        }
        if (S_key.isDown) {

        }
        if (D_key.isDown) {
            
        }
    }
}