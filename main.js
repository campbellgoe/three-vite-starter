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

const ambientLight = new THREE.AmbientLight( 0x606060 ); // soft white ambientLight
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffcccaa, 15 );
directionalLight.position.set(500,500,500)
scene.add( directionalLight );

function initGlobe(loadingManager){
	myGlobe = new ThreeGlobe({
		waitForGlobeReady: true,
		animateIn: true
	})
	.globeImageUrl('/8k_earth_daymap.jpg')
	// .bumpImageUrl('/earth-topology.png')
  // .hexPolygonsData(earth.features)
  // .hexPolygonResolution(4)
	// .hexPolygonMargin(0.5)
	.showAtmosphere(true)
	.atmosphereColor("#4eddf1")
	.atmosphereAltitude(0.15)
	.onGlobeReady(() => {
		loadingManager.onLoad()
	})

	const globeMaterial = myGlobe.globeMaterial();
    globeMaterial.bumpScale = 10;
    new THREE.TextureLoader().load('/EarthSpec.png', texture => {
      globeMaterial.specularMap = texture;
      globeMaterial.specular = new THREE.Color('grey');
      globeMaterial.shininess = 15;
    });

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
let rotation = 0.0001
function animate() {
	requestAnimationFrame( animate );
	myGlobe.rotateY(rotation)
	
	controls.update()
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

onResize()
function onTransitionEnd( event ) {

	event.target.remove();
	
}
const loadingManager = new THREE.LoadingManager( () => {
	
	const loadingScreen = document.getElementById( 'loading-screen' );
	loadingScreen.classList.add( 'fade-out' );
	
	// optional: remove loader from DOM via event listener
	loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
	
} );

initGlobe(loadingManager)
animate();