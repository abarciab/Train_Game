/*
    This file handles all the UI in the game - all the infromation that needs to be displayed to the player that's not represented by something in-world.

    there are three functions that need to be called to make it work correctly: LoadUI, StartUI, and UpdateUI

    LoadUI should be called within the Preload() function of the game scene - that's where this file loads the images that make up the UI.

    StartUI should be called at the end of the Create() function of the game scene. 

    UpdateUI can be called in two ways: 1) anywhere in the update() function of the game scene, or 2) every time variables displayed by the UI are updated. 
    for now, call it un Update(), and if it's getting laggy, we can only call it periodically.
*/

function LoadUI(){
    console.log("loaded all the assets required to display UI");
}

function StartUI(){
    console.log("started UI Display");
}

function UpdateUI(){
    console.log("udpated UI Display");
}

