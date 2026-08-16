// Three.js ve GLTFLoader'ı CDN üzerinden projeye dahil ediyoruz
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// --- 1. SAHNE, KAMERA VE RENDERER ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Gökyüzü rengi (açık mavi)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5); // Karakterin göz hizası (1.6m civarı)

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. IŞIKLANDIRMA ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Genel ışık
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Güneş/Yönlü ışık
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// --- 3. 3D MODELİ YÜKLEME (ev.glb) ---
const loader = new GLTFLoader();
loader.load('ev.glb', function (gltf) {
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error('Model yüklenirken hata oluştu:', error);
});

// --- 4. MOBİL KONTROL DEĞİŞKENLERİ ---
let moveForward = 0;
let moveSide = 0;
let touchStartX = 0;
let touchStartY = 0;
let lookTouchId = null;

const container = document.getElementById('joystick-container');
const stick = document.getElementById('joystick-stick');
const maxRadius = 40; // Joystick sınırı

// --- 5. SOL PARMAK: JOYSTICK HAREKETİ ---
container.addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
}, { passive: false });

container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > maxRadius) {
        deltaX = (deltaX / distance) * maxRadius;
        deltaY = (deltaY / distance) * maxRadius;
    }

    stick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

    moveSide = deltaX / maxRadius;
    moveForward = -(deltaY / maxRadius);
}, { passive: false });

const resetJoystick = () => {
    stick.style.transform = 'translate(-50%, -50%)';
    moveForward = 0;
    moveSide = 0;
};

container.addEventListener('touchend', resetJoystick);
container.addEventListener('touchcancel', resetJoystick);

// --- 6. SAĞ PARMAK: EKRANA DOKUNARAK ETRAFA BAKMA ---
window.addEventListener('touchstart', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        // Ekranın sağ tarafına (1/3'ünden sonrasına) dokunulursa bakış olarak algıla
        if (touch.clientX > window.innerWidth / 3 && lookTouchId === null) {
            lookTouchId = touch.identifier;
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchId) {
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            // Kameranın sapmasını engellemek için dönüş sırasını sabitle
            camera.rotation.order = 'YXZ';
            camera.rotation.y -= deltaX * 0.003; // Sağa sola bakış hızı
            camera.rotation.x -= deltaY * 0.003; // Yukarı aşağı bakış hızı
            
            // Boyun kırılmasını engellemek için dikey açıyı kısıtla
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    }
}, { passive: false });

const resetLook = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
            lookTouchId = null;
        }
    }
};

window.addEventListener('touchend', resetLook);
window.addEventListener('touchcancel', resetLook);

// --- 7. EKRAN DÖNDÜRÜLDÜĞÜNDE KAMERAYI GÜNCELLEME ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 8. ANİMASYON VE OYUN DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);

    const speed = 0.08; // Yürüme hızını buradan artırıp azaltabilirsin

    if (moveForward !== 0) camera.translateZ(-moveForward * speed);
    if (moveSide !== 0) camera.translateX(moveSide * speed);

    renderer.render(scene, camera);
}

// Döngüyü başlat
animate();
