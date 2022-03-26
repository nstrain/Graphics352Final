import * as THREE from "./js/lib/three.module.js";
import { TrackballControls } from "./js/lib/TrackballControls.js";

import { OrbitControls } from "./js/lib/OrbitControls.js";

$(document).ready(function () { flower.init(); });

var flower = {
	leaves: 50,
	petals: [],
};

let time = 0;
let speed = 1;
let flowerDepth = 5;

flower.init = function () {
	const loader = new THREE.TextureLoader();
	// flower.cameraControls;

	flower.scene = new THREE.Scene();
	flower.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	flower.camera.position.x = 3;
	flower.camera.position.y = 5;
	flower.camera.position.z = 7;

	flower.renderer = new THREE.WebGLRenderer();
	flower.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(flower.renderer.domElement);

	flower.controls = new OrbitControls(flower.camera, flower.renderer.domElement);
	flower.controls.rotateSpeed = 2.0;
	flower.controls.zoomSpeed = 1.2;
	flower.controls.panSpeed = 1.0;

	flower.plane = new THREE.PlaneGeometry(100, 100, 50);
	flower.grass = new THREE.MeshBasicMaterial({
		// color: 0x00cf00,
		map: loader.load("texture/carpet1.jpg")
	});
	flower.ground = new THREE.Mesh(flower.plane, flower.grass);
	flower.ground.rotateX(-Math.PI / 2);
	flower.ground.receiveShadow = true;
	flower.scene.add(flower.ground);

	flower.sphere = new THREE.SphereGeometry(50);
	flower.sky = new THREE.MeshBasicMaterial({
		color: 0x37E1E5,
		// map: loader.load("texture/sky3.jpg"),
		side: THREE.BackSide,

	});
	flower.skyline = new THREE.Mesh(flower.sphere, flower.sky);
	flower.scene.add(flower.skyline);


    flower.flatPlane = new THREE.BoxGeometry(1, 1, 1);
    flower.carpetTexture1 = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        // map: loader.load("./texture/carpet1.jpg"),
        // side: THREE.DoubleSide,
    });
    flower.floor = new THREE.Mesh(flower.flatPlane, flower.carpetTexture1);
    flower.floor.position.y = 5;
    // flower.floor.recieveShadow = true;
    flower.scene.add(flower.floor)

	// flower.material = new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
	// flower.geometry = new THREE.CylinderGeometry(0.2, 0.4, 3);
	// flower.stem = new THREE.Mesh(flower.geometry, flower.material);
	// flower.stem.position.y = 1.5;
	// flower.scene.add(flower.stem);

	// flower.geometry = new THREE.CylinderGeometry(0.05, 0.1, 1);
	// flower.stemOff1 = new THREE.Mesh(flower.geometry, flower.material);
	// flower.stemOff1.position.y = 2;
	// flower.stemOff1.position.z = Math.sqrt(1)/2;
	// flower.stemOff1.rotateX(Math.PI/3);
	// flower.scene.add(flower.stemOff1);

	// flower.stemOff2 = new THREE.Mesh(flower.geometry, flower.material);
	// flower.stemOff2.position.y = 2.4;
	// flower.stemOff2.position.z = -Math.sqrt(1)/2;
	// flower.stemOff2.rotateX(-Math.PI/3);
	// flower.scene.add(flower.stemOff2);

	// flower.rawPointLeaf = [[0, 0], [0.1, 0.1], [0.15, 0.2], [0.1, 0.3], [0, 0.4], [-0.1, 0.3], [-0.15, 0.2], [-0.1, 0.1], [0, 0]];
	// flower.points = [];
	// for (let i = 0; i < flower.rawPointLeaf.length; i++){
	// 	flower.points.push(new THREE.Vector2(flower.rawPointLeaf[i][0], flower.rawPointLeaf[i][1]));
	// }
	// flower.leafShape = new THREE.Shape(flower.points);
	// flower.leafGeometry = new THREE.ShapeGeometry(flower.leafShape);
	// flower.leaf1 = new THREE.Mesh(flower.leafGeometry, flower.material);
	// flower.leaf1.position.y = 2.6;
	// flower.leaf1.position.z = -0.8;
	// flower.leaf1.rotateX(-Math.PI/3);
	// flower.scene.add(flower.leaf1);

	// flower.petalShapeGeometry = new THREE.ShapeGeometry(flower.leafShape);

	// for (let i = 0; i < flower.leaves; i++){
	// 	flower.petals.push(flower.petalShapeGeometry);
	// }
	
	
	// flower.leaf2 = new THREE.Mesh(flower.leafGeometry, flower.material);
	// flower.leaf2.position.y = 2.2;
	// flower.leaf2.position.z = 0.8;
	// flower.leaf2.rotateX(Math.PI/3);
	// flower.scene.add(flower.leaf2);

	// flower.rawPoint = [[0.2, -0.05], [0.3, 0.3], [0.6, 0.4]];
	// flower.points = [];
	// for (let i = 0; i < flower.rawPoint.length; i++){
	// 	flower.points.push(new THREE.Vector2(flower.rawPoint[i][0], flower.rawPoint[i][1]));
	// }

	// flower.geometry = new THREE.LatheGeometry(flower.points);
	// flower.material = new THREE.MeshLambertMaterial({ color: 0xffff00, side: THREE.DoubleSide });
	// flower.lathe = new THREE.Mesh(flower.geometry, flower.material);
	// flower.lathe.position.y = 3;
	// flower.scene.add(flower.lathe);

	// flower.bowlMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
	// flower.geometry = new THREE.SphereGeometry(0.3, undefined, undefined, undefined, undefined, undefined, Math.PI/2.8);
	// flower.bowl = new THREE.Mesh(flower.geometry, flower.bowlMaterial);
	// flower.bowl.position.y = 3.1;
	// flower.scene.add(flower.bowl);

	// leafPetals();

	flower.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	flower.directionalLight.position.set(1, 1, 1);
	flower.scene.add(flower.directionalLight);
	// render();
	animate();
};

function render() {
	requestAnimationFrame(render);
	flower.controls.update();

	flower.renderer.render(flower.scene, flower.camera);
};

function animate() {
    requestAnimationFrame(animate);

	time += 0.0001;

    // flower.camera.rotation.x += 0.01;
    // flower.camera.rotation.y += 0.02;
    // flower.camera.rotation.z += 0.01;
	// flower.camera.position.x = flowerDepth * Math.sin(time * Math.PI / 180);
	// flower.camera.position.z = flowerDepth * Math.cos(time * Math.PI / 180);
	leafPetals();


    flower.renderer.render(flower.scene, flower.camera);
};

function leafPetals() {
	flower.petalMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00, side: THREE.DoubleSide });
	let radius = 0.37;
		
	for (let i = 0; i < flower.leaves; i++){
		flower.scene.remove(flower.petals[i]);
		flower.petals[i] = new THREE.Mesh(flower.leafGeometry, flower.petalMaterial);
		flower.petals[i].position.y = 3.3;
		let angle = (i * 360/(flower.leaves) + time);
		
		flower.petals[i].position.x = radius * Math.sin(angle * Math.PI / 180);
		flower.petals[i].position.z = radius * Math.cos(angle * Math.PI / 180);
		
		flower.petals[i].rotateY(angle * (Math.PI/180));	
		
		flower.petals[i].rotateX(Math.sin(angle * 360));
		flower.petals[i].rotateZ(Math.cos(angle * 360));
		
		flower.scene.add(flower.petals[i]);
	}	
};