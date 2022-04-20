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
    console.log(config.width, interval);
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        for (let j = 0; j < 5; j++) {
            tracks[i].push(new Track(scene, j*(config.width/2), margin+(interval*(i+1)), "back_straight_track", speed));
            nodes[i].push(new Node(scene, j*(config.width/2), margin+(interval*(i+1)), "basic_node_track", speed));
        }
    }
}

// 1920 / 4: distance of ticks
// spawn a chunk of tracks (one tick to another tick)
function SpawnTracks(scene, tracks, nodes, speed) {
    console.log("spawn tracks");
    // place a track in each row, then place track nodes per row
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        let y_pos = tracks[i][0].y;
        tracks[i].push(new Track(scene, 4*(config.width/2), y_pos, "back_straight_track", speed));
        nodes[i].push(new Node(scene, 4*(config.width/2), y_pos, "basic_node_track", speed));
    }
}