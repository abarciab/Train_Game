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
        this.has_arrow = false;

        this.junctions = {"straight": scene.add.image(x, y, "basic_out-straight_track").setScale(scaling).setDepth(4)};
        this.junction_arrow = scene.add.image(x, y, "junction_arrows-straight").setScale(scaling).setVisible(false).setDepth(5);
        this.signs = [];

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
                this.obstacle.y -= this.displayHeight/6;
                this.obstacle.setScale(scaling*2);
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
            this.signs.push(scene.add.image(x, y, `track sign ${key}`).setScale(scaling).setDepth(5));
            Array.from(value).forEach(element => {
                this.signs.push(scene.add.image(x, y, `${element} ${key} sign`).setScale(scaling).setDepth(6));
            })
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
        for (let i = 0; i < this.signs.length; i++) {
            this.signs[i].x -= this.speed;
        }
        if (this.has_arrow) {
            this.junction_arrow.setVisible(true);
            if (this.turn_dir == "north") {
                this.junction_arrow.setTexture("junction_arrows-up");
            }
            else if (this.turn_dir == "south") {
                this.junction_arrow.setTexture("junction_arrows-down");
            }
            else if (this.turn_dir == "straight") {
                this.junction_arrow.setTexture("junction_arrows-straight");
            }
        }
        this.junction_arrow.x -= this.speed;
    }
}