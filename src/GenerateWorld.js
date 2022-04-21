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

// spawn the world x the player's view
function initSpawn(scene, tracks, nodes, speed, margin, interval) {
    // interval of tracks in y
<<<<<<< HEAD
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
            tracks[i].push(scene.add.image(j*x_interval*2, margin+(y_interval*(i+1)), "back_straight_track"));
            tracks[i][tracks[i].length-1].setScale(scaling);
            tracks[i][tracks[i].length-1].setDepth(3);
            
            nodes[i].push(new Node(scene, x_interval+(j*x_interval*2), margin+(y_interval*(i+1)), "basic_node_track", i, speed, scaling, n_junc, s_junc));
=======
    console.log(config.width, interval);
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        for (let j = 0; j < 5; j++) {
            tracks[i].push(new Track(scene, j*(config.width/2), margin+(interval*(i+1)), "back_straight_track", speed));
            nodes[i].push(new Node(scene, j*(config.width/2), margin+(interval*(i+1)), "basic_node_track", speed));
>>>>>>> afc38091a9cccb083415af5ac765f51981b9d7d8
        }
    }
}

// 1920 / 4: distance of ticks
// spawn a chunk of tracks (one tick to another tick)
<<<<<<< HEAD
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
        tracks[i].push(scene.add.image((num_chunks-1)*x_interval*2, tracks[i][0].y, "back_straight_track"));
        tracks[i][tracks[i].length-1].setScale(scaling);
        tracks[i][tracks[i].length-1].setDepth(3);
        //tracks[i].push(new Track(scene, j*(x_interval*2), margin+(y_interval*(i+1)), "back_straight_track", speed, scaling));
        
        nodes[i].push(new Node(scene, x_interval+((num_chunks-1)*x_interval*2), nodes[i][0].y, "basic_node_track", i, speed, scaling, n_junc, s_junc));
=======
function SpawnTracks(scene, tracks, nodes, speed) {
    console.log("spawn tracks");
    // place a track in each row, then place track nodes per row
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        let y_pos = tracks[i][0].y;
        tracks[i].push(new Track(scene, 4*(config.width/2), y_pos, "back_straight_track", speed));
        nodes[i].push(new Node(scene, 4*(config.width/2), y_pos, "basic_node_track", speed));
>>>>>>> afc38091a9cccb083415af5ac765f51981b9d7d8
    }
}