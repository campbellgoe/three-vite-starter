import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Ground
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

const gridHelper = new THREE.GridHelper(200, 40);
    scene.add(gridHelper);

const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Car
const carMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const carGeometry = new THREE.BoxGeometry(2, 1, 5);
const carMesh = new THREE.Mesh(carGeometry, carMaterial);
scene.add(carMesh);

const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2.5));
const carBody = new CANNON.Body({ mass: 4000 });
carBody.addShape(carShape);
carBody.position.set(0, 1, 0);
world.addBody(carBody);

const wheelPositions = [
    [-1, -0.5, -2],
    [1, -0.5, -2],
    [-1, -0.5, 2],
    [1, -0.5, 2],
];

const wheelMeshes = [];
const wheelBodies = [];
const wheelJoints = [];

const wheelRadius = 0.5;
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.4, 32);

wheelPositions.forEach((pos, index) => {
    const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    mesh.rotation.z = Math.PI / 2;
    scene.add(mesh);
    wheelMeshes.push(mesh);

    const shape = new CANNON.Cylinder(wheelRadius, wheelRadius, 0.4, 20);
    const body = new CANNON.Body({ mass: 1500 });
    body.addShape(shape);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    body.position.set(pos[0], pos[1], pos[2]);
    world.addBody(body);
    wheelBodies.push(body);

    const joint = new CANNON.HingeConstraint(carBody, body, {
        pivotA: new CANNON.Vec3(pos[0], pos[1], pos[2]),
        axisA: new CANNON.Vec3(1 ,0, 0),
        pivotB: new CANNON.Vec3(0, 0, 0),
        axisB: new CANNON.Vec3(0, 1,0),
        collideConnected: false,
        maxForce: 1e6
    });
    world.addConstraint(joint);
    wheelJoints.push(joint);
});

function updatePhysics() {
    world.step(1 / 60, 1 / 60, 10);
    carMesh.position.copy(carBody.position);
    carMesh.quaternion.copy(carBody.quaternion);
    wheelMeshes.forEach((mesh, index) => {
        mesh.position.copy(wheelBodies[index].position);
        mesh.quaternion.copy(wheelBodies[index].quaternion);
    });
}

document.addEventListener('keydown', (event) => {
    const forceMagnitude = 40000; // Increase the force magnitude to a higher value
    const steeringMagnitude = 30; // You might need to tweak this value
    if (event.code === 'ArrowUp') {
        wheelBodies.forEach(body => {
            body.applyLocalForce(new CANNON.Vec3(-forceMagnitude, 0, 0), new CANNON.Vec3(0, 0, -1));
        });
    }
    else if (event.code === 'ArrowDown') {
        wheelBodies.forEach(body => {
            body.applyLocalForce(new CANNON.Vec3(forceMagnitude, 0, 0), new CANNON.Vec3(0, 0, -1));
        });
    }
    else if (event.code === 'ArrowLeft') {
        wheelBodies[0].angularVelocity.y += steeringMagnitude;
        wheelBodies[1].angularVelocity.y += steeringMagnitude;
    }
    else if (event.code === 'ArrowRight') {
        wheelBodies[0].angularVelocity.y -= steeringMagnitude;
        wheelBodies[1].angularVelocity.y -= steeringMagnitude;
    }
});

document.addEventListener('keyup', (event) => {
    if (['ArrowUp', 'ArrowDown'].includes(event.code)) {
        wheelBodies.forEach(body => {
            // Don't set velocity to zero to allow the car to come to a stop naturally
        });
    }
    if (['ArrowLeft', 'ArrowRight'].includes(event.code)) {
        wheelBodies[0].angularVelocity.y = 0;
        wheelBodies[1].angularVelocity.y = 0;
    }
});

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();

    // Make the camera follow the car
    camera.position.x = carBody.position.x;
    camera.position.y = carBody.position.y + 10;
    camera.position.z = carBody.position.z + 20;
    camera.lookAt(carBody.position.x, carBody.position.y, carBody.position.z);

    renderer.render(scene, camera);
}

animate();