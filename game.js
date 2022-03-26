/* Basic flight simulator
 * Written by Andrew Baker, Nathan Strain
*/

import * as THREE from "./js/lib/three.module.js";
import { FlyControls } from "./js/lib/FlyControls.js"

$(document).ready(function () { flight.init(); });

var flight = {};

flight.init = function (){
    const loader = new THREE.TextureLoader();
    
    flight.scene = new THREE.Scene();
    flight.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    flight.camera.position.x = 4;
    flight.camera.position.y = 4;
    flight.camera.position.z = 4;

    flight.renderer = new THREE.WebGLRenderer();
	flight.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(flight.renderer.domElement);

    // controlSetUp();
    
    flight.flatPlane = new THREE.BoxGeometry();
    flight.carpetTexture1 = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        // map: loader.load("./texture/carpet1.jpg"),
        side: THREE.DoubleSide,
    });
    flight.floor = new THREE.Mesh(flight.flatPlace, flight.carpetTexture1);
    flight.floor.position.y = -1;
    // flight.floor.recieveShadow = true;
    flight.scene.add(flight.floor)

    flight.material = new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
	flight.geometry = new THREE.CylinderGeometry(0.2, 0.4, 3);
	flight.stem = new THREE.Mesh(flight.geometry, flight.material);
	flight.stem.position.y = 1.5;
	flight.scene.add(flight.stem);



    lightingSetUp();
    animate();
}

function animate() {
    requestAnimationFrame( animate );
    // render();
    flight.renderer.render(flight.scene, flight.camera);
}

function render (){
    
}

function createEnvir (){
    
}

function controlSetUp () {
    flight.controls = new FlyControls(flight.camera, flight.renderer.domElement);
    // Forces the camera/ controls forward, similar to a normal flight sim
    flight.controls.autoForward = true;
    // I will include the movement speed and the roll speed, but set to the default just to show what work is being done
    flight.controls.movementSpeed = 1;
    flight.controls.rollSpeed = 0.005;
}

function lightingSetUp () {
    flight.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	flight.directionalLight.position.set(1, 1, 1);
	flight.scene.add(flight.directionalLight);

    flight.ambientLight = new THREE.AmbientLight(0xffffff);
    flight.scene.add(flight.ambientLight);
}