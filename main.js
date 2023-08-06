import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
const hemLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( hemLight );
const pointLight = new THREE.PointLight(0xffffff, 25, 100)
pointLight.position.set(0, 2, 0)
scene.add(pointLight)
const planeGeom = new THREE.PlaneGeometry(10, 10)
const planeTex = new THREE.TextureLoader().load('seamless_grass_sticks_clovers_2048.jpg')

const planeMat = new THREE.MeshStandardMaterial({
 map: planeTex
})
const plane = new THREE.Mesh(planeGeom, planeMat)
plane.rotation.x = -Math.PI/2
scene.add(plane)

camera.position.z = 1;
const controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true;

const size = 10
// Create a plane geometry
const planeGeometry = new THREE.PlaneGeometry(size, size); // Customize the width and height of the plane as needed

// Create a material for the plane
const planeMaterial = new THREE.MeshStandardMaterial({ map: planeTex }); // Customize the color or use a different material as needed
const gridRowCount = 5; // Number of rows in the grid
const gridColumnCount = 5; // Number of columns in the grid
const gridSpacing = size; // Spacing between each instance in the grid
// Create the InstancedMesh
const instanceCount = gridRowCount * gridColumnCount; // The number of instances you want to create
const instancedMesh = new THREE.InstancedMesh(planeGeometry, planeMaterial, instanceCount);
instancedMesh.rotation.x = -Math.PI/2
// Optional: You can now modify the position, rotation, or scale of each instance.

const matrix = new THREE.Matrix4();
for (let row = 0; row < gridRowCount; row++) {
  for (let col = 0; col < gridColumnCount; col++) {
    matrix.setPosition(col * gridSpacing, row * gridSpacing, 0); // Set the position of each instance in the grid
    instancedMesh.setMatrixAt(row * gridColumnCount + col, matrix);
  }
}

scene.add(instancedMesh);

function animate() {
	requestAnimationFrame( animate );
controls.update()
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}

animate();
window.onerror = err => document.write(err)
