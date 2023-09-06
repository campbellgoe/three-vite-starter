import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Constants
const SPHERE_HEALTH = 100;
const DAMAGE_PER_SHOT = 25;

class Tile {
    size = 1;
    mesh;

    constructor(x, y, color) {
        const geometry = new THREE.PlaneGeometry(this.size, this.size);
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0, y);
        this.mesh.rotateX(-Math.PI / 2);
        scene.add(this.mesh);
    }
}

class HealthBar {
    background;
    healthBar;

    constructor() {
        const bgGeometry = new THREE.PlaneGeometry(1, 0.1);
        const healthGeometry = new THREE.PlaneGeometry(1, 0.1);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 'gray' });
        this.background = new THREE.Mesh(bgGeometry, bgMaterial);

        const healthMaterial = new THREE.MeshBasicMaterial({ color: 'green' });
        this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);

        this.background.add(this.healthBar);
    }

    setHealth(percentage) {
        this.healthBar.scale.x = percentage;
        this.healthBar.position.x = -(1 - percentage) / 2;
    }
}

class Unit {
    mesh;
    type;
    isEnemy = false;
    health = SPHERE_HEALTH;
    healthBar;
    lastShootTime = 0;

    constructor(x, y, type, color) {
        let geometry;

        switch (type) {
            case "sphere":
                geometry = new THREE.SphereGeometry(0.4, 32, 32);
                this.isEnemy = true;
                this.healthBar = new HealthBar();
                this.healthBar.background.position.y = 1;
                break;
            case "box":
                geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
                break;
            case "pyramid":
                geometry = new THREE.ConeGeometry(0.4, 0.8, 4);
                break;
            // ... other geometries ...

            default:
                geometry = new THREE.SphereGeometry(0.4, 32, 32);
                break;
        }

        const material = new THREE.MeshBasicMaterial({ color: color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0.4, y);
        this.type = type;
        scene.add(this.mesh);
        if (this.healthBar) {
            this.mesh.add(this.healthBar.background);
        }
    }

    takeDamage(amount) {
        if (this.type !== 'sphere') return;
        this.health -= amount;
        if (this.health <= 0) {
            scene.remove(this.mesh);
            units = units.filter(unit => unit !== this);
        } else {
            this.healthBar.setHealth(this.health / SPHERE_HEALTH);
        }
    }

    shoot(target) {
        if (this.type !== 'pyramid') return;
        if (!target || !target.mesh) return;

        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const start = this.mesh.position.clone();
        const end = target.mesh.position.clone();
        const geometry = new THREE.BufferGeometry().setFromPoints([start, start]);

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        let progress = 0;
        const animateShot = () => {
            if (progress >= 1) {
                target.takeDamage(DAMAGE_PER_SHOT);
                scene.remove(line);
            } else {
                const currentPoint = new THREE.Vector3().lerpVectors(start, end, progress);
                line.geometry.setFromPoints([start, currentPoint]);
                line.geometry.verticesNeedUpdate = true;
                progress += 0.05;
                requestAnimationFrame(animateShot);
            }
        };
        animateShot();
    }

    canShoot() {
        if (this.type !== 'pyramid') return false;
        const currentTime = Date.now();
        if (currentTime - this.lastShootTime > 2000) {
            this.lastShootTime = currentTime;
            return true;
        }
        return false;
    }
}

// Game Initialization

let tiles = [];
let units = [];

for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
        tiles.push(new Tile(x, y, (x + y) % 2 === 0 ? 'lightgray' : 'darkgray'));
    }
}

renderer.domElement.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length) {
        const intersect = intersects[0];
        const x = Math.round(intersect.point.x);
        const y = Math.round(intersect.point.z);
        const unitType = document.getElementById('unitSelector').value;
        units.push(new Unit(x, y, unitType, Math.random() * 0xffffff));
    }
});

camera.position.set(5, 15, 15);
camera.lookAt(5, 0, 5);

const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;

const animate = () => {
	requestAnimationFrame(animate);

	for (let unit of units) {
			if (unit.type === 'pyramid' && unit.canShoot()) {
					let nearestEnemy = null;
					let nearestDistance = Infinity;
					for (let potentialEnemy of units) {
							if (potentialEnemy.isEnemy) {
									const distance = unit.mesh.position.distanceTo(potentialEnemy.mesh.position);
									if (distance < nearestDistance) {
											nearestDistance = distance;
											nearestEnemy = potentialEnemy;
									}
							}
					}

					if (nearestEnemy) {
							unit.shoot(nearestEnemy);
					}
			}
	}

	controls.update();
	renderer.render(scene, camera);
};

animate();