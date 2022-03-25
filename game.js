/* Basic flight simulator
 * Written by Andrew Baker, Nathan Strain
*/

import * as THREE from "./js/lib/three.module.js";

$(document).ready(function () { flower.init(); });

var flight = {};

flight.init = function (){
    flight.scene = new THREE.scene();
    flight.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    flight.renderer = new THREE.WebGLRenderer();
    
	flight.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(flight.renderer.domElement);

}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render (){

}