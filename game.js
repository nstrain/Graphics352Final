/* Basic flight simulator
 * Written by Andrew Baker, Nathan Strain
*/

import * as THREE from "./js/lib/three.module.js";
import { FlyControls } from "./js/lib/FlyControls.js"
import { OBJLoader } from "./js/lib/OBJLoader.js"

import { GLTFLoader } from "./js/lib/GLTFLoader.js"

$(document).ready(function () { flight.init(); });

var flight = {
    roomSize: 1000,
};

flight.init = function () {
    flight.clock = new THREE.Clock();

    flight.scene = new THREE.Scene();
    flight.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    flight.camera.position.x = 4;
    flight.camera.position.y = 4;
    flight.camera.position.z = 7;

    flight.renderer = new THREE.WebGLRenderer();
    flight.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(flight.renderer.domElement);

    // loadModels();
    createEnvir();
    controlSetUp();
    lightingSetUp();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    // flight.controls.update();

    render();
    flight.renderer.render(flight.scene, flight.camera);
}

function render() {
    const delta = flight.clock.getDelta();
    flight.controls.update(delta);
}

function createEnvir() {
    const loader = new THREE.TextureLoader();

    flight.flatPlane = new THREE.PlaneGeometry(flight.roomSize, flight.roomSize, flight.roomSize * 50);
    flight.carpetTexture1 = new THREE.MeshBasicMaterial({
        // color: 0x00cf00,
        map: loader.load("texture/carpet1.jpg")
    });
    flight.floor = new THREE.Mesh(flight.flatPlane, flight.carpetTexture1);
    flight.floor.rotateX(-Math.PI / 2);
    flight.floor.receiveShadow = true;
    flight.scene.add(flight.floor);

    flight.box = new THREE.BoxGeometry(flight.roomSize, flight.roomSize, flight.roomSize);
    flight.skyboxTexture = new THREE.MeshBasicMaterial({
        map: loader.load("texture/cinderblock.jpg"),
        side: THREE.BackSide,
    });
    flight.skybox = new THREE.Mesh(flight.box, flight.skyboxTexture);
    flight.scene.add(flight.skybox);
}

function controlSetUp() {
    flight.controls = new FlyControls(flight.camera, flight.renderer.domElement);
    // Forces the camera/ controls forward, similar to a normal flight sim
    flight.controls.autoForward = true;
    // I will include the movement speed and the roll speed, but set to the default just to show what work is being done
    flight.controls.movementSpeed = 1;
    flight.controls.rollSpeed = 0.5;
    // controls.rollSpeed = Math.PI / 24;
    flight.controls.domElement = flight.renderer.domElement;


    // flight.controls = new FlyControls( flight.camera, flight.renderer.domElement );

    // flight.controls.movementSpeed = 1;
    // flight.controls.domElement = flight.renderer.domElement;
    // flight.controls.rollSpeed = Math.PI / 24;
    // flight.controls.autoForward = true;
    // flight.controls.dragToLook = false;



}

function lightingSetUp() {
    flight.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    flight.directionalLight.position.set(1, 1, 1);
    flight.scene.add(flight.directionalLight);

    flight.ambientLight = new THREE.AmbientLight(0xffffff);
    flight.scene.add(flight.ambientLight);
}

function loadModels() {
    // const loader = new OBJLoader();
    // loader.load("models\PLANTS_ON_TABLE_obj\PLANTS_ON_TABLE_obj\PLANTS_ON_TABLE_10K.obj", function(obj) {
    //     flight.scene.add(obj.scene);
    // }, undefined, function (error){
    //     console.error(error);
    // })

    // instantiate a loader

    
    const loader = new GLTFLoader();
    
    loader.load(
        // resource URL
        'models/PlaneLeftDown.glb',
        // called when the resource is loaded
        function ( gltf ) {
            
            gltf.scene.position.y = 4;

            flight.paper = new THREE.MeshBasicMaterial({
                color: 0xeeeadf,
                side: THREE.DoubleSide,
            });

            flight.airplane = new THREE.Mesh(gltf.scene, flight.paper);

            flight.scene.add( gltf.scene );
    
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
    
        },
        // called while loading is progressing
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );
}