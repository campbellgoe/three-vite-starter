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
const pointLight = new THREE.PointLight(0xffffff, 1, 100)
scene.add(pointLight)
const planeGeom = new THREE.PlaneGeometry(10, 10)
const planeMat = new THREE.MeshBasicMaterial({
 color: 0xff0000
})
const plane = new THREE.Mesh(planeGeom, planeMat)
plane.rotation.x = -Math.PI/2
scene.add(plane)

camera.position.z = 1;
const controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true;
function animate() {
	requestAnimationFrame( animate );
controls.update()
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}

animate();
window.onerror = err => document.write(err)
