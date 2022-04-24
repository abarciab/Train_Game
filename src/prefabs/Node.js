class Node extends Phaser.GameObjects.Sprite {
    // can be straight track, node track, or junction
    constructor(scene, x, y, texture, row, speed, scaling, exit_N=false, exit_S=false, signs, obstacle_type) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.row = row;
        this.speed = speed;
        this.sign_types = signs;
        this.turn_dir = "straight";
        this.at_junction=false;
        this.obstacle;
        this.to_tracks = new Set([this.row]);
        this.obstacle_type = obstacle_type;

        this.junctions = {"straight": scene.add.image(x, y, "basic_out-straight_track").setScale(scaling).setDepth(4)};
        this.signs = {};

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
                this.obstacle = scene.add.image(x+(10*64*scaling), y, "field_debris_obstacle");
                this.obstacle.y -= this.displayHeight/2;
                this.obstacle.setScale(scaling);
                this.obstacle.setDepth(5);
                break;
            default:
                console.log("unknown obstacle:", obstacle_type);
        }
        
        if (exit_N) {
            this.to_tracks.add(this.row-1)
            this.junctions["north"] = scene.add.image(x, y, "basic_out-up_track").setScale(scaling).setDepth(4);
        }
        if (exit_S) {
            this.to_tracks.add(this.row+1);
            this.junctions["south"] = scene.add.image(x, y, "basic_out-down_track").setScale(scaling).setDepth(4);
        }
        for (const[key, value] of Object.entries(this.sign_types)) {
            // spawn a sign with the approriate symbols (array of values)
            switch (key) {
                case "straight":
                    
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

        this.scaleX = scaling;
        this.scaleY = scaling;
        this.setDepth(4);
    }

    update() {
        this.x -= this.speed;
        for (const[key, value] of Object.entries(this.junctions)) {
            value.x -= this.speed;
        }
        if (this.obstacle_type) {
            this.obstacle.x -= this.speed;
        }
        for (const[key, value] of Object.entries(this.signs)) {
            // update sign positions
        }
    }

    destroy() {
        for (const[key, value] of Object.entries(this.junctions)) {
            value.destroy();
            delete this.junctions[key];
        }
        if (this.obstacle_type) {
            this.obstacle.destroy();
            delete this.obstacle;
        }
        for (const[key, value] of Object.entries(this.signs)) {
            value.destroy();
            delete this.signs[key];
        }
        super.destroy();
    }
}

