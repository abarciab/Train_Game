/*
    This file handles all the UI in the game - all the infromation that needs to be displayed to the player that's not represented by something in-world.

    there are three functions that need to be called to make it work correctly: LoadUI, StartUI, and UpdateUI

    LoadUI should be called within the Preload() function of the game scene - that's where this file loads the images that make up the UI.

    StartUI should be called at the end of the Create() function of the game scene. 

    UpdateUI can be called in two ways: 1) anywhere in the update() function of the game scene, or 2) every time variables displayed by the UI are updated. 
    for now, call it un Update(), and if it's getting laggy, we can only call it periodically.
*/

this.textConfig = {
    frontFamily: 'Courier',
    fontSize: '28px',
    //backgroundColor: '#F3B141',
    color: '#000000',
    align: 'center',
}

function LoadUI(scene){
    console.log("loaded all the assets required to display UI");
}

function StartUI(scene){
    console.log("started UI Display");

    this.topBar = scene.add.rectangle(game.config.width/2, 20, game.config.width*0.8, 80, 0xFFFFFF).setOrigin(0.5,0);
    this.leftBar = scene.add.rectangle(0, game.config.height/3 + 50, 80, game.config.height*0.5, 0xFFFFFF).setOrigin(0,0.5);


    scene.add.text(game.config.width/2, 50, "TRAIN GAME: THE RECKONING", this.textConfig).setOrigin(0.5).setDepth;
    
}

function UpdateUI(scene){
    console.log("udpated UI Display");
}

