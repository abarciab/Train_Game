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

// 1920 / 4: distance of ticks
// spawn a chunk of tracks (one tick to another tick)
function SpawnTracks(tracks, player_y) {
    let y_offset_spawn = 150;
    for (let i = 0; i < tracks.length; i++) {
        // spawn a track at border + offset
        /*tracks.push(new Track(
            config.width+150, track_y,
            "track"
        ))*/
    }
}

// main function for algorithm
function GenerateWorld() {

}
