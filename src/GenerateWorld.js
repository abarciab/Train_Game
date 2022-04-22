/*
the initial spawn for the world
    - scene: scene to spawn objects
    - tracks: dict of tracks
    - nodes: dict of nodes
    - speed: initial speed of world
    - margin: (optional/WIP): if y margins, considers it for the spawn intervals
    - x_interval: the intervals which to spawn tracks/nodes of a row
    - y_interval: the distance between rows of tracks
    - num_chunks: number of node/track objects to spawn initally
    - scaling: world size scaling
*/
function initSpawn(scene, tracks, nodes, speed, margin, x_interval, y_interval, num_chunks, scaling) {
    // go through each row of tracks
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        // go through the chunks per row
        for (let j = 0; j < num_chunks; j++) {
            // add the track to the scene
            tracks[i].push(scene.add.image(j*x_interval, margin+(y_interval*(i+1)), "basic_straight_track"));
            tracks[i][tracks[i].length-1].setScale(scaling);
            tracks[i][tracks[i].length-1].setDepth(3);
            
            let n_junc=false;
            let s_junc=false;
            let obstacle_type = 0;
            // only spawn junctions and objects for nodes past the 2nd chunk
            if (j > 1) {
                // random chance to let a node have a north/south junction
                let random_dir = Math.floor(Math.random()*100);
                if (random_dir <= 25) {
                    if (i > 0)
                        n_junc=true;
                }
                if (random_dir >= 25 && random_dir <= 50) {
                    if (i < Object.keys(tracks).length-1)
                        s_junc=true;
                }
                // random chance to spawn an obstacle after a node
                let obstacle_chance = Math.floor(Math.random()*100);
                if (obstacle_chance <= 10 && (n_junc || s_junc)) {
                    obstacle_type = 1;
                }
            }
            // add a node to the scene
            nodes[i].push(new Node(
                scene, x_interval/2+(j*x_interval), margin+(y_interval*(i+1)), 
                "basic_node_track", i, speed, scaling, n_junc, s_junc,
                obstacle_type
            ));
        }
    }
}

/*
spawn a chunk of the world
    - scene to spawn chunk
    - tracks/nodes: dict of track/nodes
    - speed: speed of world
    - x_interval: used to spawn tracks/nodes at right place
    - scaling: world size scaling
*/
function SpawnTracks(scene, tracks, nodes, speed, x_interval, scaling) {
    // go through each row of tracks
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        // add tracks to position relative to last track
        let prev_x = tracks[i][tracks[i].length-1].x
        tracks[i].push(scene.add.image(prev_x + x_interval, tracks[i][0].y, "basic_straight_track"));
        tracks[i][tracks[i].length-1].setScale(scaling);
        tracks[i][tracks[i].length-1].setDepth(3);

        let n_junc=false;
        let s_junc=false;
        let obstacle_type = 0;
        // random chance to spawn north or south junction
        let random_dir = Math.floor(Math.random()*100);
        if (random_dir <= 25) {
            if (i > 0)
                n_junc=true;
        }
        if (random_dir >= 25 && random_dir <= 50) {
            if (i < Object.keys(tracks).length-1)
                s_junc=true;
        }
        // random chance to spawn obstacle
        let obstacle_chance = Math.floor(Math.random()*100);
        if (obstacle_chance <= 10 && (n_junc || s_junc)) {
            obstacle_type = 1;
        }
        nodes[i].push(new Node(scene, prev_x+(x_interval/2), nodes[i][0].y,
            "basic_node_track", i, speed, scaling, n_junc, s_junc, obstacle_type
        ));
    }
}