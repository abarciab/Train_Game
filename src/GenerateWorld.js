/*
the initial spawn for the world
*/
function initSpawn(scene) {
    // spawn one column of initial tracks first
    let can_have_obstacles = false;
    let obstacle_start = Math.floor(scene.num_chunks / 2);
    let obstacle_timer = 0;
    for (let i = 0; i < scene.num_tracks; i++) {
        spawnTracks(scene, 0, scene.margin+(scene.y_interval*(i+1)), i);
        spawnNodes(scene, scene.node_interval/2, scene.margin+(scene.y_interval*(i+1)), new Set(), i, can_have_obstacles);
        obstacle_timer++;
    }
    // set initial train y position
    scene.train.y = scene.tracks[Math.floor(scene.num_tracks/2)][0].y
    // spawn the rest of tracks using the positions of the prespawned tracks
    for (let i = 0; i < scene.num_chunks-1; i++) {
        obstacle_timer++;
        if (obstacle_timer >= obstacle_start)
            can_have_obstacles = true;
        spawnWorldChunk(scene, can_have_obstacles);
    }
}

/*
spawn a chunk of the world
*/
function spawnWorldChunk(scene, can_have_obstacles) {
    let station_row = new Set();                // when a station spawns, what row it's on
    let prev_x = scene.tracks[0][scene.tracks[0].length-1].x; // x of previous track

    // reduce spawn timer for the stations, and check if one of them spawns
    checkStationSpawn(scene, station_row, prev_x+(scene.node_interval/2));

    // go through each row of tracks
    for (let i = 0; i < scene.num_tracks; i++) {
        // spawn the tracks
        spawnTracks(scene, prev_x+scene.node_interval, scene.tracks[i][0].y, i);
        // spawn the nodes
        spawnNodes(scene, prev_x+(scene.node_interval/2), scene.nodes[i][0].y, station_row, i, can_have_obstacles);
    }

    // reset the stations
    scene.stations.forEach(element => {
        element.moved=false;    // let stations move again
        if (element.spawned) {  // if the station just spawned, make it so next junction cannot collide with station
            element.spawned = false;
            element.no_junc = true;
        }
    });

    // try to spawn a station, return the spawn index depending on success of failure.
    let station_node = scene.nodes[scene.train.onTrack][scene.nodes[scene.train.onTrack].length-1];
    spawnStation(scene, station_node.x, station_node.y);
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
function checkStationSpawn(scene, station_row, x) {
    for (let i = 0; i < scene.stations.length; i++) {
        let station = scene.stations[i];
        // add the station's row if no_junc or when it just spawns
        if (station.no_junc) {
            station_row.add(station.onTrack);
            station.no_junc = false;
        }
        // decrement the spawn timer for each node interval passed
        if (station.spawn_timer > 0) {
            station.spawn_timer--;
        }
        // once the spawn timer hits 0, have the station be visible,
        else if (!station.visible) {
            station.spawned = true;
            station.setVisible(true);
            station.x = x;
            station_row.add(station.onTrack);
        }
    }
}

/*
spawn a set of tracks on a row
*/
function spawnTracks(scene, x, y, row) {
    scene.tracks[row].push(scene.add.image(x, y, "basic_straight_track").setScale(scene.scaling).setDepth(3));
    // if previous node had an obstacle, set to basic track end
    //if (scene.nodes[row].length && scene.nodes[row][scene.nodes[row].length-1].obstacle_type != 1)
        //scene.tracks[row].push(scene.add.image(x, y, "basic_straight_track").setScale(scene.scaling).setDepth(3));
    //else
    //scene.tracks[row].push(scene.add.image(x, y, "basic_track_end").setScale(scene.scaling).setDepth(3));
}   

/*
spawn a set of nodes and generate junctions, obstacles, and signs for them
    - can_have_obstacles: whether the node can have obstacles or not
*/
function spawnNodes(scene, x, y, station_row, row, can_have_obstacles) {
    let n_junc=false;
    let s_junc=false;
    let obstacle_type = 0;

    // 25% chance to spawn each junc, and 10% chance for both
    let random_dir = Math.floor(Math.random()*100)+1;
    if (random_dir <= 25) {
        if (row > 0) {
            n_junc=true;
        }
    }
    if (random_dir >= 15 && random_dir <= 40) {
        if (row < scene.num_tracks-1) {
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
        let obstacle_chance = Math.floor(Math.random()*100)+1;
        if (obstacle_chance <= 10 && (n_junc || s_junc)) {
            obstacle_type = 1;
        } else if (obstacle_chance <= 20 && (n_junc || s_junc)) {
            obstacle_type = 2;
        }
    }
    if (obstacle_type == 1) {
        scene.tracks[row][scene.tracks[row].length-1].setTexture("basic_track_end");
    }

    // generate possible route to station
    // key: north or south. value: array of symbols
    let junction_signs = {};
    generateStationRoute(scene, junction_signs, row, n_junc, s_junc);

    // push the node
    scene.nodes[row].push(new Node(
        scene, x, y, "basic_node_track", row, n_junc, s_junc, junction_signs, obstacle_type
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
function generateStationRoute(scene, junction_signs, row, n_junc, s_junc) {
    for (let i = 0; i < scene.stations.length; i++) {
        /*
        can move the station if:
            - station has not spawned(been made visible) yet
            - station has not moved yet per the column
            - the station is on the current track that has a junction
        */ 
       let station = scene.stations[i];
        if (!station.visible && !station.moved && station.onTrack == row) {
            // 50% chance to spawn a sign if junctions exist
            let sign_chance = Math.floor(Math.random()*100)+1;
            let sign_dir = "straight";
            if (sign_chance <= 50 && (n_junc || s_junc)) {
                // if node has two junctions, randomly choose one of them to have a sign
                if (n_junc && s_junc) {
                    if (Math.floor(Math.random()*100)+1<=50 && station.onTrack > 0) {
                        sign_dir = "up";
                        station.onTrack--;
                    }
                    else if (station.onTrack < scene.num_tracks-1) {
                        sign_dir = "down";
                        station.onTrack++;
                    }
                }
                // if north junction, give the north junction a sign and move the station up
                else if (n_junc && station.onTrack > 0) {
                    sign_dir = "up";
                    station.onTrack--;
                }
                // if south junction, give the south junction a sign and move the station down
                else if (s_junc && station.onTrack < scene.num_tracks-1) {
                    sign_dir = "down";
                    station.onTrack++;
                }
                // only make the sign if within the distance for signs to spawn; add station types to the junction sign
                if (station.spawn_timer < station.sign_distance) {
                    if (!(sign_dir in junction_signs))
                        junction_signs[sign_dir] = new Set();
                    Array.from(station.type).forEach(element => {
                        junction_signs[sign_dir].add(element);
                    });
                    station.moved = true; // make it so station can't move multiple times per column
                }
                // set the station's y to the row it's now on
                station.y = scene.nodes[station.onTrack][0].y;
            }
        }
        // if the station has been moved, make it so all nodes w/ junctions that point to the station has a sign as well.
        else if (!station.visible && station.moved && station.spawn_timer < station.sign_distance) {
            let sign_dir;
            if (n_junc && station.onTrack == row+1) {
                sign_dir = "up";
            }
            else if (s_junc && station.onTrack == row-1) {
                sign_dir = "down";
            }
            // only make the sign if within sign distance
            if (sign_dir != undefined) {
                if (!(sign_dir in junction_signs))
                    junction_signs[sign_dir] = new Set();
                Array.from(station.type).forEach(element => {
                    junction_signs[sign_dir].add(element);
                });
            }
        }
    }
    // checks to see if previous nodes had signs, and if it did remake signs
    checkSameRoute(scene, junction_signs, row);
}

function checkSameRoute(scene, junction_signs, row) {
    let check_num = 5;
    if (check_num > scene.nodes[row].length) check_num = scene.nodes[row].length;
    for (let i = 1; i <= check_num; i++) {
        let break_check = false;
        // check the directions and types of the junction signs
        for (const[key, value] of Object.entries(junction_signs)) {
            let prev_node;
            let prev_signs;
            let remove_sign;
            // if sign has up junc, check if the node above has down junc
            if (key == "up" && row > 0) {
                prev_node = scene.nodes[row-1][scene.nodes[row-1].length-i];  
                prev_signs = prev_node.sign_types;
                if ("down" in prev_signs) remove_sign = "down";
            }
            // if sign has down junc, check if node below has up chunk
            else if (key == "down" && row < scene.num_tracks) {
                prev_node = scene.nodes[row+1][scene.nodes[row+1].length-i];
                prev_signs = prev_node.sign_types;
                if ("up" in prev_signs) remove_sign = "up";
            }
            // if sign has straight junc, check if node before has straight junc
            else if (key == "straight") {
                prev_node = scene.nodes[row][scene.nodes[row].length-i];
                prev_signs = prev_node.sign_types;
                remove_sign = "straight";
            }
            
            // if the prev node has a sign that leads back to same route, check if they share types
            if (remove_sign != undefined && remove_sign in prev_signs) {// && prev_signs[remove_sign] != undefined) {
                // check each type of the junction_signs
                for (let j = 0; j < Array.from(value).length-1; j++) {
                    let type = value[j];
                    if (prev_signs[remove_sign] == undefined) {
                        console.log(prev_signs[remove_sign], prev_signs, remove_sign);
                        console.log(junction_signs[remove_sign], junction_signs, key);
                        console.log(type);
                    }
                    // if prev sign shares type wt junction signs, remove the type from there
                    if (prev_signs[remove_sign].has(type)) {
                        let sign_removed = false;
                        prev_signs[remove_sign].delete(type);
                        junction_signs[key].delete(type);
                        if (!junction_signs[key].size) {
                            delete junction_signs[key];
                        }
                        // once the previous sign is empty, no more need to check for more typess
                        if (!prev_signs[remove_sign].size) {
                            delete prev_signs[remove_sign];
                            sign_removed = true;
                        }
                        // replace the sign with a straight sign
                        if (!("straight" in prev_signs)) 
                            prev_signs["straight"] = new Set();
                        prev_signs["straight"].add(type);
                        prev_node.signs.splice(0, prev_node.signs.length);

                        // remake the signs
                        for (const[key, value] of Object.entries(prev_signs)) {
                            prev_node.signs.push(scene.add.image(prev_node.x, prev_node.y, `track sign ${key}`).setScale(scene.scaling).setDepth(5));
                            Array.from(value).forEach(element => {
                                prev_node.signs.push(scene.add.image(prev_node.x, prev_node.y, `${element} ${key} sign`).setScale(scene.scaling).setDepth(6));
                            })
                        }
                        break_check = true;
                        if (sign_removed) break;
                    }
                }
            } // end of if
        } // end of signs for
        if (break_check) break;
    } // end of row for
}

function spawnStation(scene, x, y) {
    // chance to spawn a station on player's row per spawn
    let random_station = Math.floor(Math.random() * 100)+1;
    if (random_station <= scene.station_spawn_table[scene.station_spawn_index]) {
        scene.station_spawn_index = 0;
        let stationCount = Math.ceil(Math.random() * 6); // Possible 1-6 Passengers
        let passengers = [];
        for (let j = 0; j < stationCount; j++) {
            passengers.push(new Passenger(
                scene, x, y, "passenger 1", 0, scene.train.onTrack, 30000, 0
            ));
        }
        // determine station types
        let types = ["red square", "blue circle", "green triangle"];
        let station_types = new Set();
        let max_num_types = 1;
        for (let i = 0; i < max_num_types; i++) {
            let type = Math.floor(Math.random()*3)%3;
            station_types.add(types[type]);
        }
        scene.stations.push(new Station(scene, x, y, "station", scene.train.onTrack, station_types, passengers));
    }
    else if (scene.station_spawn_index < scene.station_spawn_table.length-1){
        scene.station_spawn_index++;
    }
}