/*
the initial spawn for the world
*/
function initSpawn(scene) {
    // spawn one column of initial tracks first
    let can_have_obstacles = false;
    let can_have_enemies = false;
    let obstacle_start = Math.floor(scene.num_chunks / 2);
    let obstacle_timer = 0;
    for (let i = 0; i < scene.num_tracks; i++) {
        spawnTracks(scene, 0, scene.margin+(scene.y_interval*(i+1)), i);
        // on train row, no junctions to ensure you get to the station
        if (i == scene.train.onTrack) {
            scene.nodes[i].push(new Node(
                scene, scene.node_interval/2, scene.margin+(scene.y_interval*(i+1)), "basic_node_track", i, false, false, {}, 0
            ));
        }
        else
            spawnNodes(scene, scene.node_interval/2, scene.margin+(scene.y_interval*(i+1)), new Set(), i, can_have_obstacles);
        obstacle_timer++;
    }
    
    // set initial train y position
    scene.train.y = scene.tracks[Math.floor(scene.num_tracks/2)][0].y

    // gurantee spawn a station in front of the initial track
    spawnStation(scene, scene.nodes[scene.train.onTrack][0].x, scene.nodes[scene.train.onTrack][0].y);
    scene.stations[scene.stations.length-1].spawn_timer = 0;
    scene.stations[scene.stations.length-1].spawned = true;
    scene.stations[scene.stations.length-1].setVisible(true);

    // spawn the rest of tracks using the positions of the prespawned tracks
    for (let i = 0; i < scene.num_chunks-1; i++) {
        obstacle_timer++;
        if (obstacle_timer >= obstacle_start) {
            can_have_obstacles = true;
            can_have_enemies = true;
        }
        spawnWorldChunk(scene, can_have_obstacles, can_have_enemies);
    }
}

/*
spawn a chunk of the world
*/
function spawnWorldChunk(scene, can_have_obstacles, can_have_enemies) {
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

        // chance to spawn enemy train
        if (can_have_enemies)
            spawnEnemyTrain(scene, prev_x+(scene.node_interval/2), scene.nodes[i][0].y, i);
    }

    // reset the stations
    scene.stations.forEach(element => {
        element.moved=false;    // let stations move again
        if (element.spawned) {  // if the station just spawned, make it so next junction cannot collide with station
            element.spawned = false;
            element.no_junc = true;
        }
    });

    // try to spawn a station
    let station_node = scene.nodes[scene.train.onTrack][scene.nodes[scene.train.onTrack].length-1];
    let random_station = Math.floor(Math.random() * 100)+1;
    if (random_station <= scene.station_spawn_table[scene.station_spawn_index]) {
        scene.station_spawn_index = 0;
        spawnStation(scene, station_node.x, station_node.y);
    }
    else if (scene.station_spawn_index < scene.station_spawn_table.length-1){
        scene.station_spawn_index++;
    }
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
    let coin_chance = 10;
    if (Math.floor(Math.random() * 100) + 1 < coin_chance) {
        spawnCoinRow(scene, x-(scene.node_interval/2), y, "straight");
    }
}

/*
    spawn a series of coins
*/
function spawnCoinRow(scene, x, y, track_type) {
    let num_coins = 5;
    let x_interval = scene.node_interval / num_coins;
    let y_interval = 0;
    if (track_type == "straight") {
        x_interval = scene.node_interval / num_coins;
        y_interval = 0;
    }
    else if (track_type == "up") {
        x_interval = (scene.node_interval/2) / num_coins;
        y_interval = -scene.y_interval / num_coins;
    }
    else if (track_type == "down") {
        x_interval = (scene.node_interval/2) / num_coins;
        y_interval = scene.y_interval / num_coins;
    }
    for (let i = 1; i <= num_coins; i++) {
        scene.coins.push(scene.add.sprite(x+(i*x_interval), y+(i*y_interval), "coin").setScale(scene.scaling/2).setDepth(5));
    }
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
        // 10% chance to spawn rock if junction to avoid it
        let rock_chance = 10;
        let branch_chance = 20;
        let obstacle_rng = Math.floor(Math.random()*100)+1;
        if (scene.dist >= 1000) {
            rock_chance = 20;
            branch_chance = 30;
        }
        if (obstacle_rng <= rock_chance && (n_junc || s_junc)) {
            obstacle_type = 1;
        } 
        else if (obstacle_rng <= rock_chance+branch_chance && (n_junc || s_junc)) {
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
    let coin_chance = Math.floor(Math.random() * 100) + 1;
    if (coin_chance <= 10 && n_junc) {
        spawnCoinRow(scene, x+(scene.x_unit*4), y, "up")
    }
    if (coin_chance > 5 && coin_chance <= 15 && s_junc) {
        spawnCoinRow(scene, x+(scene.x_unit*4), y, "down")
    }
}

// per row check
function spawnEnemyTrain(scene, x, y, row) {
    let enemy_spawn_chance = 5;
    if (scene.dist >= 1000) {
        enemy_spawn_chance = 10;
    }
    if (Math.floor(Math.random()*100)+1 <= enemy_spawn_chance) {
        let can_spawn = true;
        scene.stations.forEach(station => {
            if (row == station.onTrack && station.visible)
                can_spawn = false;
        });
        if (can_spawn) {
            scene.enemy_trains.push(new Train(scene, x, y, "enemy_locomotive", row, "enemy").setOrigin(0, 0.5));
            let train = scene.enemy_trains[scene.enemy_trains.length-1]

            train.wagons.push(new Wagon(scene, train.x+train.wagon_offset*1.05, train.y, 'enemy_cargo_wagon', train.onTrack).setDepth(9));
            train.wagons[train.wagons.length-1].flipX = true;
        }
    }
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
                // only make the sign if within the distance for signs to spawn; add station type to the junction sign
                if (!(sign_dir in junction_signs))
                    junction_signs[sign_dir] = new Set();
                junction_signs[sign_dir].add(station.station_type);
                station.moved = true; // make it so station can't move multiple times per column
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
                junction_signs[sign_dir].add(station.station_type);
            }
        }
    }
    // checks to see if previous nodes had signs, and if it did remake signs
    checkSameRoute(scene, junction_signs, row);
}

/*
junction_signs: key: direction, value: set of types
*/
function checkSameRoute(scene, junction_signs, row) {
    let check_num = scene.nodes_onscreen*3;
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
            if (remove_sign != undefined && remove_sign in prev_signs) {
                // check each type of the junction_sign for the direction they coincide with
                // ie.) junc_nodes: (up: blue circle), prev_node: (down: blue circle)
                for (let j = 0; j < value.size; j++) {
                    let type = Array.from(value)[j];
                    // if prev sign shares type wt junction signs, remove the type from there
                    //ie.) down has blue circle
                    if (prev_signs[remove_sign].has(type)) {
                        let sign_removed = false;
                        // delete the type from both signs
                        prev_signs[remove_sign].delete(type);
                        junction_signs[key].delete(type);
                        // if either of the signs are empty, get rid of the signs all together
                        if (!junction_signs[key].size) {
                            delete junction_signs[key];
                        }
                        // once the previous sign is empty, no more need to check for more types
                        if (!prev_signs[remove_sign].size) {
                            delete prev_signs[remove_sign];
                            sign_removed = true;
                        }
                        // replace the prev sign with a straight sign
                        if (!("straight" in prev_signs))
                            prev_signs["straight"] = new Set();
                        prev_signs["straight"].add(type);

                        // delete the list of signs
                        prev_node.signs.splice(0, prev_node.signs.length);

                        // remake the signs
                        for (const[key1, value1] of Object.entries(prev_signs)) {
                            prev_node.signs.push(scene.add.image(prev_node.x, prev_node.y, `track sign ${key1}`).setScale(scene.scaling).setDepth(5));
                            Array.from(value1).forEach(element => {
                                prev_node.signs.push(scene.add.image(prev_node.x, prev_node.y, `${element} ${key1} sign`).setScale(scene.scaling).setDepth(6));
                            });
                        }
                        break_check = true;
                        if (sign_removed) break;
                    } // end of if
                } // end of for
            } // end of if
        } // end of signs for
        if (break_check) break;
    } // end of row for
}

/*
    chance to spawn station or trainyard
*/
function spawnStation(scene, x, y) {
    let isTrainyard = false;
    if (Math.floor(Math.random()*100)+1 < scene.trainyard_spawn_table[scene.trainyard_spawn_index]) {
        isTrainyard = true;
        scene.trainyard_spawn_index = 0;
    }
    else if (scene.trainyard_spawn_index < scene.trainyard_spawn_table.length) {
        scene.trainyard_spawn_index++;
        // temp make sure trainyard doesnt spawn
        // scene.trainyard_spawn_index = 0;
    }
    if (!isTrainyard) {
        // spawn a station
        let stationCount = Math.ceil(Math.random() * 4); // Possible 1-4 Passengers
        let passengers = [];
        for (let j = 0; j < stationCount; j++) {
            let patienceTime = Math.ceil(Math.random()*30000) + 90000;
            passengers.push(new Passenger(
                scene, x, y, "passenger 1", 0, scene.train.onTrack, patienceTime, 0
            ));
        }
        // determine station type
        let station_type = scene.station_types[scene.station_type_index];
        scene.station_type_index = (scene.station_type_index + 1) % 3; 
        scene.stations.push(new Station(scene, x, y, "station", scene.train.onTrack, station_type, passengers));
    }
    else {
        console.log("spawn trainyard");
        scene.stations.push(new Station(scene, x, y, "station", scene.train.onTrack, "trainyard", scene.upgrades));
    }
}