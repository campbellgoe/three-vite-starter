import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ThreeGlobe from 'three-globe';
import earth from './earth.geo.json'

let mouseX = 0
let mouseY = 0
let windowHalfX = window.innerWidth / 2
let windowHalfY = window.innerHeight / 2
let myGlobe;
let controls;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


camera.position.z = 250;

const ambientLight = new THREE.AmbientLight( 0x101010 ); // soft white ambientLight
scene.add( ambientLight );

const pointLight = new THREE.PointLight( 0xffffff, 100000, 10000 );
pointLight.position.set( 200, 200, 200 );
scene.add( pointLight );

function initGlobe(){
	myGlobe = new ThreeGlobe({
		waitForGlobeReady: true,
		animateIn: true
	})
		.globeImageUrl('/earth-2002.png')
		.pointsData(earth.features);


	scene.add(myGlobe);
}


function onMouseMove(event){
	mouseX = event.clientX - windowHalfX
	mouseY = event.clientY - windowHalfY
}

function onResize(){
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	const width = window.innerWidth
	const height = window.innerHeight
	windowHalfX = width / 2
	windowHalfY = height / 2
	renderer.setSize(width, height)
}

function animate() {
	requestAnimationFrame( animate );
	camera.position.x += (Math.abs(mouseX) <= windowHalfX /2) ? (mouseX / 2 - camera.position.x)*0.005 : 0;
	camera.lookAt(scene.position)
	renderer.render( scene, camera );
}

controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dynamicDampingFactor = 0.01
controls.enablePan = false
controls.minDistance = 125
controls.maxDistance = 800
controls.rotateSpeed = 0.8
controls.zoomSpeed = 1
controls.autoRotate = false
controls.minPolarAngle = Math.PI/6
controls.maxPolarAngle = Math.PI - Math.PI/6

window.addEventListener("resize", onResize, false)
document.addEventListener("mousemove", onMouseMove)
initGlobe()
onResize()

animate();