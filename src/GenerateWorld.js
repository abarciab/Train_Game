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
function initSpawn(scene, tracks, nodes, margin, interval) {
    // interval of tracks in y
    console.log(config.width, interval);
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        for (let j = 0; j < 5; j++) {
            tracks[i].push(new Track(scene, j*(config.width/2), margin+(interval*(i+1)), "back_straight_track"));
            nodes[i].push(new Node(scene, j*(config.width/2), margin+(interval*(i+1)), "back_node_track"));
        }
    }
}

// 1920 / 4: distance of ticks
// spawn a chunk of tracks (one tick to another tick)
function SpawnTracks(tracks, nodes, player_y) {
    // place a track in each row, then place 4 track nodes per each row
    for (let i = 0; i < Object.keys(tracks).length; i++) {
        tracks[i].push(new Track(scene, j*(config.width/2), margin+(interval*(i+1)), "back_straight_track"));
    }
}

// main function for algorithm
function GenerateWorld() {

}
