/* Basic flight simulator
 * Written by Andrew Baker, Nathan Strain
*/

import * as THREE from "./js/lib/three.module.js";
import { FlyControls } from "./js/lib/FlyControls.js"
import { OBJLoader } from "./js/lib/OBJLoader.js"

import { GLTFLoader } from "./js/lib/GLTFLoader.js"

$(document).ready(function () { flight.init(); });

var flight = {
    roomSize: 100,
    viewerDistance: 2,
    raceTubeRadius: 10,
};

flight.init = function () {
    flight.clock = new THREE.Clock();

    flight.scene = new THREE.Scene();
    flight.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    flight.camGroup = new THREE.Group();
    
    loadAirplane();
    flight.camGroup.add(flight.camera);
    
    flight.scene.add(flight.camGroup);
    // flight.camera.position.x = 4;
    // flight.camera.position.y = 10;
    // flight.camera.position.z = 7;

    flight.renderer = new THREE.WebGLRenderer();
    flight.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(flight.renderer.domElement);
    
    
    //collision
    flight.raycaster = new THREE.Raycaster();
    flight.pointer = new THREE.Vector2();
    flight.pointer.x = 1;
    flight.pointer.y = 1;
    
    // loadModels();
    createRacewayTorus();
    // createEnvir();
    controlSetUp();
    lightingSetUp();
    // eventHandler();
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

    //https://threejs.org/docs/index.html?q=ray#api/en/core/Raycaster
    // update the picking ray with the camera and pointer position
    flight.raycaster.setFromCamera(flight.pointer, flight.camera);

    // calculate objects intersecting the picking ray
    const intersects = flight.raycaster.intersectObjects(flight.scene.children);
    // console.log(intersects);

    // console.log(flight.scene.children);

    // console.log(flight.scene.children[0]);

    console.log(flight.planeStanderd);

    flight.planeStanderd.updateMorphTargets([0.5,0.5]);

    flight.controls.movementSpeed = 30;

    // for (let i = 0; i < flight.scene.children.length; i++) {
    //     if (flight.scene.children[i].isMesh) {
    //         flight.scene.children[i].material.color.set(0xffffff);
    //     }
    // }

    for (let i = 0; i < intersects.length; i++) {

        // intersects[i].object.material.color.set(0xff0000);
        if(intersects[i].distance < 1) {
            flight.controls.movementSpeed = 0;
            console.log("crash");
        }

    }


    flight.controls.update(delta);
}

function createEnvir() {
    const loader = new THREE.TextureLoader();

    flight.flatPlane = new THREE.PlaneGeometry(flight.roomSize, flight.roomSize);
    flight.carpetTexture1 = new THREE.MeshBasicMaterial({
        // color: 0x00cf00,
        map: loader.load("texture/carpet1.jpg")
    });
    flight.floor = new THREE.Mesh(flight.flatPlane, flight.carpetTexture1);
    flight.floor.rotateX(-Math.PI / 2);
    flight.floor.receiveShadow = true;
    flight.floor.position.y = -flight.roomSize * (2/5) + 5;
    flight.scene.add(flight.floor);

    flight.box = new THREE.BoxGeometry(flight.roomSize, flight.roomSize * (4/5), flight.roomSize);
    flight.skyboxTexture = new THREE.MeshBasicMaterial({
        map: loader.load("texture/cinderblock.jpg"),
        side: THREE.BackSide,
    });
    flight.skybox = new THREE.Mesh(flight.box, flight.skyboxTexture);
    flight.scene.add(flight.skybox);

    flight.ceilingTexture1 = new THREE.MeshBasicMaterial({
        map: loader.load("texture/ceilingTile.jpg"),
    })
    flight.ceiling = new THREE.Mesh(flight.flatPlane, flight.ceilingTexture1);
    flight.ceiling.rotateX(Math.PI / 2);
    flight.ceiling.position.y = flight.roomSize * (2/5) - 5;
    flight.scene.add(flight.ceiling);

}

function controlSetUp() {
    flight.controls = new FlyControls(flight.camGroup, flight.renderer.domElement);
    // Forces the camera/ controls forward, similar to a normal flight sim
    flight.controls.autoForward = false;
    // I will include the movement speed and the roll speed, but set to the default just to show what work is being done
    flight.controls.movementSpeed = 30;
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

    flight.ambientLight = new THREE.AmbientLight(0xaaaaaa, 1);
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
        'models/WoodenTable_01_4k/WoodenTable_01_4k.gltf',
        function ( gltf ) {
            
            // gltf.scene.position.y = 4;
            flight.table = gltf.scene;

            flight.table.scale.set(20, 20, 20);
            flight.table.position.y = -flight.roomSize * (2/5) + 5;

            flight.scene.add( flight.table );
    
        },
        // called while loading is progressing
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );
}

function loadAirplane() {
    const loader = new GLTFLoader();
    loader.load(
        // resource URL
        'models/PlaneShaped.glb',
        // called when the resource is loaded
        function ( gltf ) {
            // gltf.scene.position.y = 4;
            flight.planeStanderd = gltf.scene;
            // flight.mixer = new THREE.AnimationMixer( fligth.planeStanderd );
            // flight.planeStanderd.rotateZ(Math.PI/2);
            // flight.planeStanderd.position.x -= 5;
            
            flight.planeStanderd.position.z -= 1;
            flight.planeStanderd.position.y -= 0.25;
            flight.planeStanderd.rotation.y += Math.PI;
            flight.planeStanderd.rotation.x += Math.PI/12;

            flight.planeStanderd.scale.set(0.25,0.25,0.25);
            console.log(flight.planeStanderd);

            // flight.scene.add( flight.planeStanderd );
            flight.camGroup.add(flight.planeStanderd);
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

function createRacewayTorus(){
    const loader = new THREE.TextureLoader();
    flight.racewayPhysical = new THREE.TorusGeometry(20, flight.raceTubeRadius, undefined, 30);
    flight.racetrackVisual = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: loader.load("texture/crumpledPaper.jpg")
    });
    flight.race = new THREE.Mesh(flight.racewayPhysical, flight.racetrackVisual);
    flight.race.position.x = 20;
    flight.scene.add(flight.race);
}

function createRacewayTorusKnot(){
    const loader = new THREE.TextureLoader();
    flight.racewayPhysical = new THREE.TorusKnotGeometry(20, flight.raceTubeRadius, undefined, 30);
    flight.racetrackVisual = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
    });
    flight.race = new THREE.Mesh(flight.racewayPhysical, flight.racetrackVisual);
    flight.race.position.x = 20;
    flight.scene.add(flight.race);
}

function eventHandler(){
    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }

    };
}