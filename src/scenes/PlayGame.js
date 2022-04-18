class PlayGame extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {
        let player;

        W_key = this.input.keyboard.addKey('W');
        A_key = this.input.keyboard.addKey('A');
        S_key = this.input.keyboard.addKey('S');
        D_key = this.input.keyboard.addKey('D');

        let num_tracks = 3;
        this.tracks = {}; // key: track row, value: track objects
        this.junctions = {}; // key: track row, value: junction objects
        for (let i = 1; i <= num_tracks; i++) {
            this.tracks[i] = [];
        }
    }

    update(time, delta) {
        this.updateEvents(delta);
    }

    updateTracks(delta) {

    }

    updateEvents(delta) {
        if (W_key.isDown) {
            testMethod();
        }
        if (A_key.isDown) {
            
        }
        if (S_key.isDown) {

        }
        if (D_key.isDown) {

        }
    }
}