class Node extends Phaser.GameObjects.Sprite {
    // can be straight track, node track, or junction
    constructor(scene, x, y, texture, row, speed, scaling, exit_N=false, exit_S=false, signs, obstacle_type) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.row = row;
        this.speed = speed;
        this.exit_N = exit_N;
        this.exit_S = exit_S;
        this.signs = signs;
        this.turn_dir = "straight";
        this.at_junction=false;
        
        this.obstacle_type = obstacle_type;
        // 0: nothing, 1: tree, 2: braches
        switch (this.obstacle_type) {
            case 0:
                break;
            case 1:
                this.obstacle = scene.add.image(x+(10*64*scaling), y, "field_deadly_obstacle");
                this.obstacle.y -= this.displayHeight/2;
                this.obstacle.setScale(scaling);
                this.obstacle.setDepth(5);
                break;
            case 2:
                console.log("branch");
                break;
            default:
                console.log("unknown obstacle:", obstacle_type);
        }
        
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
        for (const[key, value] of Object.entries(this.signs)) {
            // spawn a sign with the approriate symbols (array of values)
            switch (key) {
                case "straight":
                    // shouldn't be possible
                    break;
                case "north":
                    // spawn a sign at the north junction
                    console.log("tint red");
                    this.tint = 0xff0000;
                    break;
                case "south":
                    // spawn a sign at the south junction
                    console.log("tint purple");
                    this.tint = 0xff00ff;
                    break;
                default:
                    break;
            }
        }
        this.back_E_track = scene.add.image(x, y, "basic_out-straight_track");
        this.back_E_track.setScale(scaling);
        this.back_E_track.setDepth(4);

        this.scaleX = scaling;
        this.scaleY = scaling;
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
        if (this.obstacle_type) {
            this.obstacle.x -= this.speed;
        }
        if (Object.keys(this.signs).length) {
            // update sign position
        }
    }

    destroy() {
        this.back_E_track.destroy();
        delete this.back_E_track;
        if (this.exit_N) {
            this.back_N_track.destroy();
            delete this.back_N_track;
        }
        if (this.exit_S) {
            this.back_S_track.destroy();
            delete this.back_S_track;
        }
        if (this.obstacle_type) {
            this.obstacle.destroy();
            delete this.obstacle;
        }
        if (Object.keys(this.signs).length) {
            // delete the sign
        }
        super.destroy();
    }
}

