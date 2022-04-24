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
                } else if (obstacle_chance <= 20 && (n_junc || s_junc)) {
                    obstacle_type = 2;
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
function SpawnTracks(scene, train, tracks, nodes, stations, speed, x_interval, scaling) {
    let num_rows = Object.keys(tracks).length;
    // the x position all objects should be spawning at relatively for this column
    let prev_x = tracks[num_rows-1][tracks[num_rows-1].length-1].x
    for (let i = 0; i < stations.length; i++) {
        // decrement the spawn timer for each node interval passed
        if (stations[i].spawn_timer > 0) {
            stations[i].spawn_timer--;
            if (stations[i].spawn_timer == 0) {
                
            }
        }
        // once the spawn timer hits 0, set to visible
        else if (!stations[i].visible) {
            console.log("set to visible");
            stations[i].setVisible(true);
            stations[i].x = prev_x+(x_interval/2);
        }
    }
    // go through each row of tracks
    for (let i = 0; i < num_rows; i++) {
        // add tracks to position relative to last track
        tracks[i].push(scene.add.image(prev_x + x_interval, tracks[i][0].y, "basic_straight_track"));
        tracks[i][tracks[i].length-1].setScale(scaling);
        tracks[i][tracks[i].length-1].setDepth(3);

        let n_junc=false;
        let s_junc=false;
        let obstacle_type = 0;
        // random chance to spawn north or south junction
        let random_dir = Math.floor(Math.random()*100);
        if (random_dir <= 25) {
            if (i > 0) {
                n_junc=true;
            }
        }
        if (random_dir >= 25 && random_dir <= 50) {
            if (i < Object.keys(tracks).length-1) {
                s_junc=true;
            }
        }

        // update the stations every spawn timer (node interval)
        // key: north or south. value: array of symbols
        let junction_signs = {};
        for (let j = 0; j < stations.length; j++) {
            /*
            can move the station if:
                - station has not spawned yet
                - station has not moved yet per the column
                - the station is on the current track that has a junction
            */
            // while the station hasn't "spawned" yet & hasn't been moved
            console.log(stations[j].visible);
            if (!stations[j].visible && !stations[j].moved && stations[j].onTrack == i) {
                console.log("check for station");
                let sign_chance = Math.floor(Math.random()*100);
                if (sign_chance <= 50 && (n_junc || s_junc)) {
                    console.log("move station");
                    // if node has two junctions, randomly choose one of them to have a sign
                    let sign_dir;
                    if (n_junc && s_junc) {
                        if (Math.floor(Math.random()*100)<=50 && stations[j].onTrack > 0) {
                            sign_dir = "north";
                            stations[j].onTrack--;
                        }
                        else if (stations[j].onTrack < num_rows-1) {
                            sign_dir = "south";
                            stations[j].onTrack++;
                        }
                    }
                    // if north junction, give the north junction a sign
                    else if (n_junc && stations[j].onTrack > 0) {
                        sign_dir = "north";
                        stations[j].onTrack--;
                    }
                    // if south junction, give the south junction a sign
                    else if (s_junc && stations[j].onTrack < num_rows-1) {
                        sign_dir = "south";
                        stations[j].onTrack++;
                    }
                    // only make the sign if within a certain distance
                    if (sign_dir != undefined && stations[j].spawn_timer < stations[j].sign_distance) {
                        if (!(sign_dir in junction_signs))
                            junction_signs[sign_dir] = new Set();
                        Array.from(stations[j].type).forEach(element => {
                            junction_signs[sign_dir].add(element);
                        });
                        stations[j].moved=true;
                    }
                    stations[j].y = tracks[stations[j].onTrack][0].y;
                }
            }
            // if the station has been moved, make it so all nodes w/ junctions that point to the station has a sign as well.
            else if (!stations[j].visible && stations[j].moved && stations[j].spawn_timer < stations[j].sign_distance) {
                let sign_dir;
                if (n_junc && stations[j].onTrack == i+1) {
                    sign_dir = "north";
                }
                else if (s_junc && stations[j].onTrack == i-1) {
                    sign_dir = "south";
                }
                else if ((n_junc || s_junc) && stations[j].onTrack == i) {
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

        // random chance to spawn obstacle
        let obstacle_chance = Math.floor(Math.random()*100);
        if (obstacle_chance <= 10 && (n_junc || s_junc)) {
            obstacle_type = 1;
        } else if (obstacle_chance <= 20 && (n_junc || s_junc)) {
            obstacle_type = 2;
        }
        nodes[i].push(new Node(scene, prev_x+(x_interval/2), nodes[i][0].y,
            "basic_node_track", i, speed, scaling, n_junc, s_junc, junction_signs, obstacle_type
        ));
    }
    stations.forEach(element => {
        element.moved=false;
    });
    // chance to spawn a station on player's row per spawn
    let random_station = Math.floor(Math.random()*100);
    if (random_station <= 10) {
        let stationCount = Math.ceil(Math.random() * 6); // Possible 1-6 Passengers
        let passengers = [];
        for (let j = 0; j < stationCount; j++) {
            passengers.push(new Passenger(
                scene, nodes[train.onTrack][nodes[train.onTrack].length-1].x, nodes[train.onTrack][nodes[train.onTrack].length-1].y,
                "passenger 1", 0, train.onTrack, 10000, 0, scaling 
            ));
        }
        console.log("spawn station");
        stations.push(new Station(
            scene, nodes[train.onTrack][nodes[train.onTrack].length-1].x, nodes[train.onTrack][nodes[train.onTrack].length-1].y,
            "station", 0, train.onTrack, new Set("square"), passengers, 0, scaling
        ));
    }
}