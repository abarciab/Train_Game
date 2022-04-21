function testMethod() {
    console.log("run test method");
}

/* 
1.) every config.width / 4 pixels traveled, spawn a junction
    - more specifically, place down a node track at that point consistently
    - at x distance before a node track, can choose which direction you want to go
        - if no input, go straight.
    - each node has a chance of having an obstacle in front of it as well
2.) obstacles: can't spawn on junctions. so low chance to spawn btwn ticks, or make new ticks/offsets for it
3.) stations (?)
*/

// spawn the world initially with 4
function initSpawn(scene, tracks, nodes, speed, margin, x_interval, y_interval, num_chunks, scaling) {
    // interval of tracks in y
    // key
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        // number of chunks; number of times to do for each row
        for (let j = 0; j < num_chunks; j++) {
            let n_junc=false;
            let s_junc=false;
            let random_dir = Math.floor(Math.random()*100);
            if (random_dir <= 25) {
                if (i > 0)
                    n_junc=true;
            }
            if (random_dir >= 25 && random_dir <= 50) {
                if (i < 2)
                    s_junc=true;
            }
            // let exit_type = Math.floor(Math.random()*(2-0+1)+0);
            tracks[i].push(scene.add.image(j*x_interval*2, margin+(y_interval*(i+1)), "basic_straight_track"));
            tracks[i][tracks[i].length-1].setScale(scaling);
            tracks[i][tracks[i].length-1].setDepth(3);
            
            nodes[i].push(new Node(scene, x_interval+(j*x_interval*2), margin+(y_interval*(i+1)), "basic_node_track", i, speed, scaling, n_junc, s_junc));
        }
    }
}

// 1920 / 4: distance of ticks
// spawn a chunk of tracks (one tick to another tick)
function SpawnTracks(scene, tracks, nodes, speed, x_interval, num_chunks, scaling) {
    // go through rows
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        let n_junc=false;
        let s_junc=false;
        let random_dir = Math.floor(Math.random()*100);
        if (random_dir <= 25) {
            if (i > 0)
                n_junc=true;
        }
        if (random_dir >= 25 && random_dir <= 50) {
            if (i < 2)
                s_junc=true;
        }
        tracks[i].push(scene.add.image((num_chunks-1)*x_interval*2, tracks[i][0].y, "basic_straight_track"));
        tracks[i][tracks[i].length-1].setScale(scaling);
        tracks[i][tracks[i].length-1].setDepth(3);
        //tracks[i].push(new Track(scene, j*(x_interval*2), margin+(y_interval*(i+1)), "back_straight_track", speed, scaling));
        
        nodes[i].push(new Node(scene, x_interval+((num_chunks-1)*x_interval*2), nodes[i][0].y, "basic_node_track", i, speed, scaling, n_junc, s_junc));
    }
}