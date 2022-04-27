/*
the initial spawn for the world
    - scene: scene to spawn objects
    - train_row: the row the train is on
    - tracks: dict of tracks
    - nodes: dict of nodes
    - speed: initial speed of world
    - margin: (optional/WIP): if y margins, considers it for the spawn intervals
    - x_interval: the intervals which to spawn tracks/nodes of a row
    - y_interval: the distance between rows of tracks
    - num_chunks: number of node/track objects to spawn initally
    - scaling: world size scaling
    - spawn_table: table of station spawn chances
    - spawn_index: index position within the spawn table
*/
function initSpawn(scene, train_row, tracks, nodes, stations, speed, margin, x_interval, y_interval, num_chunks, scaling, spawn_table, spawn_index) {
    // spawn one column of initial tracks first
    let num_rows = Object.keys(tracks).length;
    for (let i = 0; i < num_rows; i++) {
        spawnTracks(scene, 0, margin+(y_interval*(i+1)), tracks, i, scaling);
        spawnNodes(scene, x_interval/2, margin+(y_interval*(i+1)), speed, scaling, nodes, stations, new Set(), i, num_rows, false);
    }
    // spawn the rest of tracks using the positions of the prespawned tracks
    for (let i = 0; i < num_chunks-1; i++) {
        spawn_index = spawnWorldChunk(scene, train_row, tracks, nodes, stations, speed, x_interval, scaling, spawn_table, spawn_index);
    }
    // return the current spawn index of the stations spawn table
    return spawn_index;
}

/*
spawn a chunk of the world
    - scene to spawn chunk
    - train_row: row the train is on
    - tracks/nodes: dict of track/nodes
    - stations: array of stations
    - speed: speed of world
    - x_interval: used to spawn tracks/nodes at right place
    - scaling: world size scaling
    - spawn_table: table of station spawn chances
    - spawn_index: index position within the spawn table
*/
function spawnWorldChunk(scene, train_row, tracks, nodes, stations, speed, x_interval, scaling, spawn_table, spawn_index) {
    let num_rows = Object.keys(tracks).length;  // number of rows
    let station_row = new Set();                // when a station spawns, what row it's on
    let prev_x = tracks[num_rows-1][tracks[num_rows-1].length-1].x; // x of previous track
    
    // reduce spawn timer for the stations, and check if one of them spawns
    checkStationSpawn(stations, station_row, prev_x+(x_interval/2));

    // go through each row of tracks
    for (let i = 0; i < num_rows; i++) {
        // spawn the tracks
        spawnTracks(scene, prev_x + x_interval, tracks[i][0].y, tracks, i, scaling);
        // spawn the nodes
        spawnNodes(scene, prev_x+(x_interval/2), nodes[i][0].y, speed, scaling, nodes, stations, station_row, i, num_rows, true);
    }
    
    // reset the stations
    stations.forEach(element => {
        element.moved=false;    // let stations move again
        if (element.spawned) {  // if the station just spawned, make it so next junction cannot collide with station
            element.spawned = false;
            element.no_junc = true;
        }
    });

    // try to spawn a station, return the spawn index depending on success of failure.
    spawn_index = spawnStation(scene, stations, 
        nodes[train_row][nodes[train_row].length-1].x, nodes[train_row][nodes[train_row].length-1].y,
        train_row, scaling, spawn_table, spawn_index
    );

    // return station spawn index
    return spawn_index;
}

/*
reduce station spawn timer and spawn if low enough
    - stations: list of stations
    - station_row: contains the rows of stations that just spawned.
    - x: x position of station when they spawn
*/
/*
sign spawning: should display straight signs around 3 times before reaching it
*/
function checkStationSpawn(stations, station_row, x) {
    for (let i = 0; i < stations.length; i++) {
        // add the station's row if no_junc or when it just spawns
        if (stations[i].no_junc) {
            station_row.add(stations[i].onTrack);
            stations[i].no_junc = false;
        }
        // decrement the spawn timer for each node interval passed
        if (stations[i].spawn_timer > 0) {
            stations[i].spawn_timer--;
        }
        // once the spawn timer hits 0, have the station be visible,
        else if (!stations[i].visible) {
            stations[i].spawned = true;
            stations[i].setVisible(true);
            stations[i].x = x;
            station_row.add(stations[i].onTrack);
        }
    }
}

/*
spawn a set of tracks on a row
*/
function spawnTracks(scene, x, y, tracks, row, scaling) {
    tracks[row].push(scene.add.image(x, y, "basic_straight_track"));
    tracks[row][tracks[row].length-1].setScale(scaling);
    tracks[row][tracks[row].length-1].setDepth(3);
}

/*
spawn a set of nodes and generate junctions, obstacles, and signs for them
    - can_have_obstacles: whether the node can have obstacles or not
*/
function spawnNodes(scene, x, y, speed, scaling, nodes, stations, station_row, row, num_rows, can_have_obstacles) {
    let n_junc=false;
    let s_junc=false;
    let obstacle_type = 0;

    // 25% chance to spawn each junc, and 10% chance for both
    let random_dir = Math.floor(Math.random()*100);
    if (random_dir <= 25) {
        if (row > 0) {
            n_junc=true;
        }
    }
    if (random_dir >= 15 && random_dir <= 40) {
        if (row < num_rows-1) {
            s_junc=true;
        }
    }

    // determine if rows are valid to have junctions or not depending on station
    Array.from(station_row).forEach(element => {
        // junc cannot point to row with station or row of station
        if (element-1 == row) {
            s_junc = false;
        }
        else if (element+1 == row) {
            n_junc = false;
        }
        else if (element == row) {
            n_junc = false;
            s_junc = false;
        }
    });

    if (can_have_obstacles) {
        // 10% chance to spawn an obstacle if there is a junction to avoid it
        let obstacle_chance = Math.floor(Math.random()*100);
        if (obstacle_chance <= 10 && (n_junc || s_junc)) {
            obstacle_type = 1;
        } else if (obstacle_chance <= 20 && (n_junc || s_junc)) {
            obstacle_type = 2;
        }
    }

    // generate possible route to station
    // key: north or south. value: array of symbols
    let junction_signs = {};
    generateStationRoute(junction_signs, stations, nodes, row, num_rows, n_junc, s_junc);

    // push the node
    nodes[row].push(new Node(
        scene, x, y, "basic_node_track", row, speed, scaling, n_junc, s_junc, junction_signs, obstacle_type
    ));
}

/*
generate a possible route to a station along with signs
    - junction_signs: the signs of a node
    - stations/nodes: list of stations/nodes
    - row: row that node is currently being spawned for
    - num_rows: number of rows
    - n_junc/s_junc if node has a north or south junction
*/
function generateStationRoute(junction_signs, stations, nodes, row, num_rows, n_junc, s_junc) {
    for (let j = 0; j < stations.length; j++) {
        /*
        can move the station if:
            - station has not spawned(been made visible) yet
            - station has not moved yet per the column
            - the station is on the current track that has a junction
        */ 
        if (!stations[j].visible && !stations[j].moved && stations[j].onTrack == row) {
            // 50% chance to spawn a sign if junctions exist
            let sign_chance = Math.floor(Math.random()*100);
            let sign_dir = "straight";
            if (sign_chance <= 50 && (n_junc || s_junc)) {
                // if node has two junctions, randomly choose one of them to have a sign
                if (n_junc && s_junc) {
                    if (Math.floor(Math.random()*100)<=50 && stations[j].onTrack > 0) {
                        sign_dir = "up";
                        stations[j].onTrack--;
                    }
                    else if (stations[j].onTrack < num_rows-1) {
                        sign_dir = "down";
                        stations[j].onTrack++;
                    }
                }
                // if north junction, give the north junction a sign and move the station up
                else if (n_junc && stations[j].onTrack > 0) {
                    sign_dir = "up";
                    stations[j].onTrack--;
                }
                // if south junction, give the south junction a sign and move the station down
                else if (s_junc && stations[j].onTrack < num_rows-1) {
                    sign_dir = "down";
                    stations[j].onTrack++;
                }
                // only make the sign if within the distance for signs to spawn; add station types to the junction sign
                if (stations[j].spawn_timer < stations[j].sign_distance) {
                    if (!(sign_dir in junction_signs))
                        junction_signs[sign_dir] = new Set();
                    Array.from(stations[j].type).forEach(element => {
                        junction_signs[sign_dir].add(element);
                    });
                    stations[j].moved = true; // make it so station can't move multiple times per column
                }
                // set the station's y to the row it's now on
                stations[j].y = nodes[stations[j].onTrack][0].y;
            }
        }
        // if the station has been moved, make it so all nodes w/ junctions that point to the station has a sign as well.
        else if (!stations[j].visible && stations[j].moved && stations[j].spawn_timer < stations[j].sign_distance) {
            let sign_dir;
            if (n_junc && stations[j].onTrack == row+1) {
                sign_dir = "up";
            }
            else if (s_junc && stations[j].onTrack == row-1) {
                sign_dir = "down";
            }
            else if ((n_junc || s_junc) && stations[j].onTrack == row) {
                sign_dir = "straight";
            }
            // only make the sign if within sign distance
            if (sign_dir != undefined) {
                if (!(sign_dir in junction_signs))
                    junction_signs[sign_dir] = new Set();
                Array.from(stations[j].type).forEach(element => {
                    junction_signs[sign_dir].add(element);
                });
            }
        }
    }
}

function spawnStation(scene, stations, x, y, init_track, scaling, spawn_table, spawn_index) {
    // chance to spawn a station on player's row per spawn
    let random_station = Math.floor(Math.random() * 100);
    if (random_station <= spawn_table[spawn_index]) {
        spawn_index = 0;
        let stationCount = Math.ceil(Math.random() * 6); // Possible 1-6 Passengers
        let passengers = [];
        for (let j = 0; j < stationCount; j++) {
            passengers.push(new Passenger(
                scene, x, y, "passenger 1", 0, init_track, 30000, 0, scaling 
            ));
        }
        // determine station types
        let types = ["red square", "blue circle", "green triangle"];
        let station_types = new Set();
        let max_num_types = 1;
        for (let i = 0; i < max_num_types; i++) {
            let type = Math.floor(Math.random() * 100) % 3;
            station_types.add(types[type]);
        }
        stations.push(new Station(
            scene, x, y, "station", 0, init_track, station_types, passengers, 0, scaling
        ));
    }
    else if (spawn_index < spawn_table.length-1){
        spawn_index++;
    }
    return spawn_index;
}