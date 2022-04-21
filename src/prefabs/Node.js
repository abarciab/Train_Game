class Node extends Phaser.GameObjects.Sprite {
    // can be straight track, node track, or junction
    constructor(scene, x, y, texture, row, speed, scaling, exit_N=false, exit_S=false) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.speed = speed;
        this.scaleX = scaling;
        this.scaleY = scaling;
        let exit_image;
        // exit 0 = straight, 1 = up, 2 = down
        this.exit_N = exit_N;
        this.exit_S = exit_S;
        if (this.exit_N) {
            this.back_N_track = scene.add.image(x, y, "basic_out-up_track");
            this.back_N_track.setScale(scaling);
            this.back_N_track.setDepth(4);
        }
        if (this.exit_S) {
            this.back_S_track = scene.add.image(x, y, "basic_out-down_track");
            this.back_S_track.setScale(scaling);
            this.back_S_track.setDepth(4);
        }
        this.back_E_track = scene.add.image(x, y, "basic_out-straight_track");
        this.back_E_track.setScale(scaling);
        this.back_E_track.setDepth(4);
        this.setDepth(4);
    }

    update() {
        this.x -= this.speed;
        this.back_E_track.x -= this.speed;
        if (this.exit_N) {
            this.back_N_track.x -= this.speed;
        }
        if (this.exit_S) {
            this.back_S_track.x -= this.speed;
        }
    }

    destroy() {
        console.log("destroy object");
        super.destroy();
        this.back_E_track.destroy();
        if (this.exit_N) {
            this.back_N_track.destroy();
        }
        if (this.exit_S) {
            this.back_S_track.destroy();
        }
    }
}

