import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Sahne kurulumu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Işıklandırma
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// 3. Kamera Kontrolleri (Telefonda parmakla çevirmek için)
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 5);

// 4. Modeli Yükleme
const loader = new GLTFLoader();
loader.load('ev.glb', (gltf) => {
    scene.add(gltf.scene);
}, undefined, (err) => console.error("Model yüklenemedi:", err));

// 5. Oyun Döngüsü
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Ekranı telefona göre ölçekle
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
