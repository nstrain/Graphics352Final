/* Basic flight simulator
 * Written by Andrew Baker, Nathan Strain
*/

import * as THREE from "./js/lib/three.module.js";
import { FlyControls } from "./js/lib/FlyControls.js"
import { OBJLoader } from "./js/lib/OBJLoader.js"
import { AnaglyphEffect } from './js/lib/AnaglyphEffect.js';
import { GLTFLoader } from "./js/lib/GLTFLoader.js"

$(document).ready(function () { flight.init(); });

var flight = {
    roomSize: 300,
    viewerDistance: 2,
    raceTubeRadius: 15,
    crash: false,
};

flight.init = function () {
    flight.clock = new THREE.Clock();
    flight.start = false;

    flight.scene = new THREE.Scene();
    flight.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    flight.camera.position.z -= 3;
    flight.camera.focalLength = 3;

    flight.camGroup = new THREE.Group();
    loadAirplane();
    flight.camGroup.add(flight.camera);
    flight.scene.add(flight.camGroup);

    flight.renderer = new THREE.WebGLRenderer();
    flight.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(flight.renderer.domElement);

    flight.renderer.setPixelRatio( window.devicePixelRatio );

    //collision
    flight.raycaster = new THREE.Raycaster();
    flight.pointer = new THREE.Vector2();
    flight.pointer.x = 1;
    flight.pointer.y = 1;

    const width = window.innerWidth || 2;
    const height = window.innerHeight || 2;

    flight.effect = new AnaglyphEffect( flight.renderer );
	flight.effect.setSize( width, height );

    // createRacewayTorus();
    // createRacewayTorusKnot();
    loadModels();
    createEnvir();
    controlSetUp();
    lightingSetUp();

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', function startUp() {
        flight.overlay = document.getElementById('overlay');
        flight.overlay.remove();
        audioLoader();
        eventHandler();
        animate();
    });
}

function animate() {
    requestAnimationFrame(animate);
    // flight.controls.update();
    let go = true;
    if (!flight.crash || go) {
        render();
    } else {
        // flight.overlay.add();
    }
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
    flight.controls.movementSpeed = 60;

    // for (let i = 0; i < flight.scene.children.length; i++) {
    //     if (flight.scene.children[i].isMesh) {
    //         flight.scene.children[i].material.color.set(0xffffff);
    //     }
    // }
    let kickStart = true;
    for (let i = 0; i < intersects.length; i++) {
        // intersects[i].object.material.color.set(0xff0000);
        if (intersects[i].distance < 1) {

            flight.controls.movementSpeed = 0;
            console.log("crash");
            kickStart = false;
            if (flight.start) {
                flight.crash = true;
            }
            // flight.ambientFlightSound.stop();
            // flight.crashSoundEffect.play();
        }
        if (kickStart) {
            flight.start = true;
            // console.log(flight.start);
        }
    }
    flight.controls.update(delta);
    flight.effect.render( flight.scene, flight.camera );
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
    flight.floor.position.y = -flight.roomSize * (2 / 5) + 5;
    flight.scene.add(flight.floor);

    flight.box = new THREE.BoxGeometry(flight.roomSize, flight.roomSize * (4 / 5), flight.roomSize);
    flight.skyboxTexture = new THREE.MeshLambertMaterial({
        map: loader.load("texture/cinderblock.jpg"),
        side: THREE.BackSide,
    });
    flight.skybox = new THREE.Mesh(flight.box, flight.skyboxTexture);
    flight.scene.add(flight.skybox);

    flight.centerWalls = new THREE.BoxGeometry(flight.roomSize / 4, flight.roomSize * (4 / 5), flight.roomSize / 4);
    flight.centerBox = new THREE.MeshLambertMaterial({
        map: loader.load("texture/cinderblock.jpg"),
    });
    flight.scene.add(new THREE.Mesh(flight.centerWalls, flight.centerBox));

    flight.ceilingTexture1 = new THREE.MeshLambertMaterial({
        map: loader.load("texture/ceilingTile.jpg"),
    })
    flight.ceiling = new THREE.Mesh(flight.flatPlane, flight.ceilingTexture1);
    flight.ceiling.rotateX(Math.PI / 2);
    flight.ceiling.position.y = flight.roomSize * (2 / 5) - 5;
    flight.scene.add(flight.ceiling);
    posterCreator();
    hoopCreator();
    collectibleCreator();
}

function controlSetUp() {
    flight.controls = new FlyControls(flight.camGroup, flight.renderer.domElement);
    // Forces the camera/ controls forward, similar to a normal flight sim
    // I will include the movement speed and the roll speed, but set to the default just to show what work is being done
    // flight.controls.autoForward = true;
    flight.controls.movementSpeed = 60;
    flight.controls.rollSpeed = 0.65;
    flight.controls.domElement = flight.renderer.domElement;
}

function lightingSetUp() {
    flight.lightingModel = new THREE.PointLight(0xffffff, 1);
    // flight.lightingModel = new THREE.DirectionalLight(0xffffff, 1);
    // flight.lightingModel = new THREE.PointLight(0xffffff, 1, 0, 2);
    // flight.lightingModel.position.set(1, 1, 1);
    flight.lightingModel.position.set(flight.roomSize / 2 - 50, flight.roomSize * (2 / 5), -(flight.roomSize / 2) + 50);
    flight.scene.add(flight.lightingModel);

    flight.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    flight.scene.add(flight.ambientLight);
}

function loadModels() {
    const loader = new GLTFLoader();
    const ground = -flight.roomSize * (2 / 5) + 5;
    const ceiling = flight.roomSize * (2 / 5) - 5;

    loader.load('models/WoodenTable_01_4k/WoodenTable_01_4k.gltf',
        function (gltf) {
            flight.table = gltf.scene;
            const scalar = 75;
            flight.table.scale.set(scalar, scalar, scalar);
            flight.table.position.y = ground;
            flight.table.position.z = (flight.roomSize / 2) - 30;
            flight.scene.add(flight.table);
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

    loader.load('models/SchoolDesk_01_4k/SchoolDesk_01_4k.gltf',
        function (gltf) {
            flight.desk = gltf.scene;
            const scalar = 75;
            flight.desk.scale.set(scalar, scalar, scalar);
            flight.desk.position.y = ground;
            flight.desk.position.z = -(flight.roomSize / 2) + 30;
            flight.desk.rotateY(Math.PI);
            flight.scene.add(flight.desk);
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

    loader.load('models/steel_frame_shelves_01_4k/steel_frame_shelves_01_4k.gltf',
        function (gltf) {
            flight.shelf = gltf.scene;
            const scalar = 8;
            flight.shelf.scale.set(scalar, scalar, scalar);
            flight.shelf.position.x = -(flight.roomSize / 2) + 50;
            flight.shelf.position.y = ground;
            flight.shelf.position.z = -(flight.roomSize / 2) + 20;
            flight.scene.add(flight.shelf);
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

    loader.load('models/Fabricio_SP7_gLTF/Fabricio SP7 gLTF/Fabricio SP7 gLTF.gltf',
        function (gltf) {
            flight.fixture = gltf.scene;
            const scalar = 90;
            flight.fixture.scale.set(scalar, scalar, scalar);
            flight.fixture.position.x = (flight.roomSize / 2) - 50;
            flight.fixture.position.y = ceiling - scalar / 2 + 5;
            flight.fixture.position.z = -(flight.roomSize / 2) + 50;
            flight.scene.add(flight.fixture);
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

    loader.load('models/black_leather_chair.gltf',
        function (gltf) {
            flight.chair = gltf.scene;
            const scalar = 90;
            flight.chair.scale.set(scalar, scalar, scalar);
            flight.chair.position.x = (flight.roomSize / 2) - 50;
            flight.chair.position.y = ground;
            flight.chair.position.z = (flight.roomSize / 2) - 50;
            flight.chair.rotateY(Math.PI);
            flight.scene.add(flight.chair);
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

    loader.load('models/PEACE_LILLY_gltf/PEACE_LILLY_gltf/PEACE_LILLY_5K.gltf',
        function (gltf) {
            flight.plant = gltf.scene;
            const scalar = 90;
            flight.plant.scale.set(scalar, scalar, scalar);
            flight.plant.position.x = - 50;
            flight.plant.position.y = ground + 40;
            flight.plant.position.z = (flight.roomSize / 2) - 30;
            // flight.plant.rotateY(Math.PI);
            flight.scene.add(flight.plant);
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
        'models/basePlane.glb',
        // called when the resource is loaded
        function (gltf) {
            flight.planeStanderd = gltf.scene;
            // flight.planeStanderd.rotateZ(Math.PI/2);
            // flight.planeStanderd.position.x -= 5;

            flight.planeStanderd.position.z -= 0.11 + 3;
            flight.planeStanderd.position.y -= 0.01;
            flight.planeStanderd.rotation.y += Math.PI;
            flight.planeStanderd.rotation.x += Math.PI / 12;

            flight.planeStanderd.scale.set(0.05, 0.05, 0.05);
            console.log(flight.planeStanderd);

            // flight.scene.add( flight.planeStanderd );
            flight.camGroup.add(flight.planeStanderd);
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

function createRacewayTorus() {
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

function createRacewayTorusKnot() {
    const loader = new THREE.TextureLoader();
    flight.racewayPhysical = new THREE.TorusKnotGeometry(30, flight.raceTubeRadius, undefined, 30);
    flight.racetrackVisual = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map
    });
    flight.race = new THREE.Mesh(flight.racewayPhysical, flight.racetrackVisual);
    // flight.race.position.x = 20;
    flight.race.position.y = -10;
    flight.scene.add(flight.race);
}

function eventHandler() {
    // const onKeyDown = function (event) {

    //     switch (event.code) {

    //         case 'ArrowUp':
    //         case 'KeyW':
    //             moveForward = true;
    //             break;

    //         case 'ArrowLeft':
    //         case 'KeyA':
    //             moveLeft = true;
    //             break;

    //         case 'ArrowDown':
    //         case 'KeyS':
    //             moveBackward = true;
    //             break;

    //         case 'ArrowRight':
    //         case 'KeyD':
    //             moveRight = true;
    //             break;

    //         case 'Space':
    //             if (canJump === true) velocity.y += 350;
    //             canJump = false;
    //             break;

    //     }

    // };

    // const onKeyUp = function (event) {

    //     switch (event.code) {

    //         case 'ArrowUp':
    //         case 'KeyW':
    //             moveForward = false;
    //             break;

    //         case 'ArrowLeft':
    //         case 'KeyA':
    //             moveLeft = false;
    //             break;

    //         case 'ArrowDown':
    //         case 'KeyS':
    //             moveBackward = false;
    //             break;

    //         case 'ArrowRight':
    //         case 'KeyD':
    //             moveRight = false;
    //             break;

    //     }

    // };

    document.addEventListener('mouseout', function () {
        flight.controls.autoForward = false;
        flight.controls.movementSpeed = 0;
        flight.controls.rollSpeed = 0;
    });

    document.addEventListener('mouseenter', function () {
        // flight.controls.autoForward = true;
        flight.controls.movementSpeed = 60;
        flight.controls.rollSpeed = 0.65;
    });
}

function audioLoader() {
    const audioListener = new THREE.AudioListener();
    const loader = new THREE.AudioLoader();

    flight.camera.add(audioListener);

    flight.ambientFlightSound = new THREE.Audio(audioListener);

    flight.crashSoundEffect = new THREE.Audio(audioListener);
    flight.scene.add(flight.ambientFlightSound);
    flight.scene.add(flight.crashSoundEffect)

    loader.load(
        'audio/Papers Rustling in the wind.mp3',
        function (audioBuffer) {
            flight.ambientFlightSound.setBuffer(audioBuffer);
            flight.ambientFlightSound.setLoop(true);
            flight.ambientFlightSound.play();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (err) {
            console.log('An error happened');
        }
    );

    loader.load(
        "audio/Crash .mp3",
        function (audioBuffer) {
            flight.crashSoundEffect.setBuffer(audioBuffer);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (err) {
            console.log('An error happened');
        }
    );
}

function posterCreator() {
    const loader = new THREE.TextureLoader();
    const scalar = 3;
    flight.posterFrame = new THREE.BoxGeometry(1, scalar * 40, scalar * 27);
    flight.posterPicture = new THREE.MeshBasicMaterial({
        map: loader.load('texture/airplaneBlock.png'),
        side: THREE.DoubleSide,
    });
    flight.posterComposite = new THREE.Mesh(flight.posterFrame, flight.posterPicture);
    flight.posterComposite.position.x = flight.roomSize / 2 - 1;
    flight.scene.add(flight.posterComposite);
}

function hoopCreator() {
    const loader = new THREE.TextureLoader();

    flight.hoop = new THREE.TorusGeometry(3, 1);
    flight.stripesTexture = new THREE.MeshLambertMaterial({
        map: loader.load('texture/stripes.png'),
        color: 0xaa0000,
    });
    flight.path = new THREE.Mesh(flight.hoop, flight.stripesTexture);
    flight.path.position.z = (flight.roomSize / 2) - 75;
    flight.scene.add(flight.path);

}

function collectibleCreator() {
    const loader = new THREE.TextureLoader();

    flight.box = new THREE.BoxGeometry(4, 4, 4);
    flight.boxTexture = new THREE.MeshLambertMaterial({
        color: 0x0000aa,
    });
    flight.lootBox = new THREE.Mesh(flight.box, flight.boxTexture);
    flight.lootBox.position.z = -1 * ((flight.roomSize / 2) - 75);
    flight.scene.add(flight.lootBox);
}