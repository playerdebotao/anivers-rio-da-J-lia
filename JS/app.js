import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const CFG = window.CONFIG;
const LITE = location.search.includes('lite');
const MOBILE = LITE || innerWidth < 760 || matchMedia('(pointer:coarse)').matches;
const GALAXY_R = 92;

/* ---------- Textos da interface ---------- */
document.title = `Para ${CFG.nome} 💙`;
document.getElementById('introTitle').textContent = CFG.tituloIntro;
document.getElementById('introSub').textContent = CFG.subtituloIntro;
document.getElementById('enter').textContent = CFG.botaoIntro;

/* ---------- Renderer / cena / pós-processamento ---------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
const PR = Math.min(devicePixelRatio, MOBILE ? 1.75 : 2);
renderer.setPixelRatio(PR);
renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#01040e');
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), MOBILE ? 0.5 : 0.6, 0.6, 0.75);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const HOME_POS = new THREE.Vector3(), HOME_TARGET = new THREE.Vector3(0, 0, 0);
function setHome() {
    const portrait = innerWidth / innerHeight < 0.85;
    HOME_POS.set(0, portrait ? 52 : 30, portrait ? 128 : 84);
}
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.06; controls.enablePan = false;
controls.minDistance = 26; controls.maxDistance = 170;
controls.minPolarAngle = 0.25; controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotate = true; controls.autoRotateSpeed = 0.28;
controls.enabled = false;

const uniforms = { uTime: { value: 0 }, uPR: { value: PR }, uScale: { value: 150 }, uReveal: { value: 0 } };
function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    uniforms.uScale.value = h / 5.2;
    setHome();
}
addEventListener('resize', resize); resize();

/* ---------- Texturas procedurais ---------- */
const mkCanvas = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const srgb = (t) => { t.colorSpace = THREE.SRGBColorSpace; return t; };

function glowTexture(color = '#3b82f6', stops = [0, .35, 1]) {
    const s = 256, cv = mkCanvas(s), g = cv.getContext('2d'), grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(stops[0], color); grad.addColorStop(stops[1], color + '66'); grad.addColorStop(stops[2], color + '00');
    g.fillStyle = grad; g.fillRect(0, 0, s, s); return srgb(new THREE.CanvasTexture(cv));
}
function discTexture() {          // anel de acreção ao redor do Sol
    const s = 1024, cv = mkCanvas(s), g = cv.getContext('2d'), c = s / 2;
    const grad = g.createRadialGradient(c, c, 0, c, c, c);
    grad.addColorStop(0.00, 'rgba(255,220,150,0)');
    grad.addColorStop(0.20, 'rgba(255,230,170,0)');
    grad.addColorStop(0.24, 'rgba(255,236,190,0.95)');
    grad.addColorStop(0.30, 'rgba(255,190,100,0.7)');
    grad.addColorStop(0.40, 'rgba(120,170,255,0.5)');
    grad.addColorStop(0.60, 'rgba(50,100,240,0.22)');
    grad.addColorStop(1.00, 'rgba(20,50,180,0)');
    g.fillStyle = grad; g.fillRect(0, 0, s, s);
    // estrias
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 90; i++) {
        g.strokeStyle = `rgba(0,0,0,${Math.random() * 0.25})`; g.lineWidth = 1 + Math.random() * 2;
        g.beginPath(); g.arc(c, c, c * (0.26 + Math.random() * 0.6), 0, Math.PI * 2); g.stroke();
    }
    return srgb(new THREE.CanvasTexture(cv));
}
function dotTexture() {
    const s = 64, cv = mkCanvas(s), g = cv.getContext('2d'), grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, '#fff'); grad.addColorStop(.4, '#ffffffaa'); grad.addColorStop(1, '#ffffff00');
    g.fillStyle = grad; g.fillRect(0, 0, s, s); return new THREE.CanvasTexture(cv);
}

const EMOJIS = ['🌙', '💙', '✨', '🌹', '🎂', '🌊', '🦋', '⭐'];
function circleTexture({ src, index = 0, border = '#9cc4ff', size = 512 }) {
    const cv = mkCanvas(size), g = cv.getContext('2d');
    const tex = srgb(new THREE.CanvasTexture(cv)); tex.anisotropy = 8;
    const r = size / 2;
    const draw = (img) => {
        g.clearRect(0, 0, size, size);
        g.save(); g.beginPath(); g.arc(r, r, r - 14, 0, Math.PI * 2); g.clip();
        if (img) { const s = Math.max(size / img.width, size / img.height), w = img.width * s, h = img.height * s; g.drawImage(img, (size - w) / 2, (size - h) / 2, w, h); }
        else {
            const hues = [220, 350, 225, 355, 235, 345, 215, 5], grad = g.createLinearGradient(0, 0, size, size);
            grad.addColorStop(0, `hsl(${hues[index % 8]},80%,55%)`); grad.addColorStop(1, `hsl(${hues[(index + 3) % 8]},85%,18%)`);
            g.fillStyle = grad; g.fillRect(0, 0, size, size);
            g.font = `${size * 0.42}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(EMOJIS[index % EMOJIS.length], r, r + size * 0.03);
        }
        g.restore();
        g.lineWidth = 12; g.strokeStyle = border; g.beginPath(); g.arc(r, r, r - 8, 0, Math.PI * 2); g.stroke();
        tex.needsUpdate = true;
    };
    draw(null);
    if (src) { const img = new Image(); img.onload = () => draw(img); img.onerror = () => console.warn('Foto não encontrada:', src); img.src = src; }
    return tex;
}
function textTexture(text) {
    const fs = 90, cv = mkCanvas(16, 16), g = cv.getContext('2d');
    const font = `italic 600 ${fs}px "Playfair Display", Georgia, serif`;
    g.font = font; const w = Math.ceil(g.measureText(text.toUpperCase()).width) + 80; cv.width = w; cv.height = Math.round(fs * 1.7);
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = '#ff9aaa'; g.shadowBlur = 28; g.fillStyle = '#e6f0ff';
    g.fillText(text, w / 2, cv.height / 2); g.fillText(text, w / 2, cv.height / 2);
    return { tex: srgb(new THREE.CanvasTexture(cv)), aspect: w / cv.height };
}
function planetTexture(c1, c2, bands = 14) {
    const w = 1024, h = 512, cv = mkCanvas(w, h), g = cv.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, c1); grad.addColorStop(.5, c2); grad.addColorStop(1, c1);
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    for (let i = 0; i < bands * 6; i++) {
        const y = Math.random() * h, th = 4 + Math.random() * 26;
        g.fillStyle = `rgba(${Math.random() > .5 ? '255,255,255' : '0,10,60'},${0.04 + Math.random() * 0.11})`;
        g.beginPath(); g.ellipse(w / 2, y, w, th, 0, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 40 + Math.random() * 120, 1 + Math.random() * 3); }
    return srgb(new THREE.CanvasTexture(cv));
}

/* ---------- Fundo: estrelas + brilho de base da galáxia ---------- */
const bgStars = (() => {
    const N = MOBILE ? 1800 : 3600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const pal = ['#ffffff', '#b8d2ff', '#6aa0ff', '#dce8ff', '#ffb3bf'].map((c) => new THREE.Color(c));
    for (let i = 0; i < N; i++) {
        const r = 500 + Math.random() * 700, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
        const c = pal[(Math.random() * pal.length) | 0], k = 0.4 + Math.random() * 0.9; col.set([c.r * k, c.g * k, c.b * k], i * 3);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 4, map: dotTexture(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false }));
    scene.add(p); return p;
})();

const baseGlow = new THREE.Mesh(new THREE.PlaneGeometry(GALAXY_R * 2.6, GALAXY_R * 2.6),
    new THREE.MeshBasicMaterial({ map: glowTexture('#1f4fe0', [0, .45, 1]), transparent: true, opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false }));
baseGlow.rotation.x = -Math.PI / 2; baseGlow.position.y = -0.6; scene.add(baseGlow);

/* ---------- Galáxia de partículas ---------- */
const galaxy = (() => {
    const count = LITE ? 25000 : MOBILE ? 70000 : 190000, R = GALAXY_R;
    const aR = new Float32Array(count), aA = new Float32Array(count), aY = new Float32Array(count), aSize = new Float32Array(count), aSeed = new Float32Array(count), aColor = new Float32Array(count * 3);
    const cCore = new THREE.Color('#b9d5ff'), cInner = new THREE.Color('#8fb8ff'), cMid = new THREE.Color('#2f66ee'), cOut = new THREE.Color('#12288a'), cCy = new THREE.Color('#ff9aaa'), tmp = new THREE.Color();
    const ARMS = 3, TWIST = 3.6, BRIGHT = 0.82 * Math.min(1, Math.pow(40000 / count, 0.62));
    const rnd = (p) => Math.pow(Math.random(), p) * (Math.random() < .5 ? 1 : -1);
    for (let i = 0; i < count; i++) {
        const dust = Math.random() < 0.2; let r, a, y;
        if (!dust) {
            r = Math.pow(Math.random(), 1.55) * R + 1.2;
            const arm = (i % ARMS) / ARMS * Math.PI * 2, t = r / R;
            a = arm + t * TWIST + rnd(2.3) * (0.28 + t * 0.55);
            y = rnd(2.0) * (0.5 + (1 - t) * 3.6 + t * 1.2);
        } else {
            r = Math.sqrt(Math.random()) * R * 1.08; a = Math.random() * Math.PI * 2; y = rnd(1.4) * 1.6;
        }
        const t = Math.min(r / R, 1);
        if (t < 0.14) tmp.copy(cCore).lerp(cInner, t / 0.14);
        else if (t < 0.5) tmp.copy(cInner).lerp(cMid, (t - 0.14) / 0.36);
        else tmp.copy(cMid).lerp(cOut, (t - 0.5) / 0.5);
        if (Math.random() < 0.07) tmp.lerp(cCy, 0.7);
        const k = BRIGHT * (dust ? 0.45 : 1) * (0.5 + (1 - t) * 0.95) * (0.7 + Math.random() * 0.6);
        aR[i] = r; aA[i] = a; aY[i] = y; aSeed[i] = Math.random();
        aSize[i] = 0.55 + Math.pow(Math.random(), 5) * 3.6;
        aColor.set([tmp.r * k, tmp.g * k, tmp.b * k], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('aR', new THREE.BufferAttribute(aR, 1)); geo.setAttribute('aA', new THREE.BufferAttribute(aA, 1));
    geo.setAttribute('aY', new THREE.BufferAttribute(aY, 1)); geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1)); geo.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
    const mat = new THREE.ShaderMaterial({
        uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: `
      attribute float aR; attribute float aA; attribute float aY; attribute float aSize; attribute float aSeed; attribute vec3 aColor;
      uniform float uTime; uniform float uPR; uniform float uScale; uniform float uReveal;
      varying vec3 vColor; varying float vAlpha;
      void main(){
        float w = 0.012 + 0.04 * exp(-aR / 16.0);
        float ang = aA + uTime * w;
        float rv = clamp(uReveal * 1.7 - aSeed * 0.7, 0.0, 1.0);
        float e = 1.0 - pow(1.0 - rv, 3.0);
        float rr = aR * e;
        vec3 p = vec3(cos(ang) * rr, aY * e, sin(ang) * rr);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.7 + 0.3 * sin(uTime * (0.8 + aSeed * 3.0) + aSeed * 50.0);
        gl_PointSize = clamp(aSize * uPR * uScale / -mv.z, 1.0 * uPR, 26.0);
        vColor = aColor * (0.75 + 0.7 * tw);
        vAlpha = rv;
      }`,
        fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = pow(smoothstep(0.5, 0.0, d), 1.7);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }`
    });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts); return pts;
})();

/* poeira próxima da câmera (profundidade / paralaxe) */
const floaters = (() => {
    const N = MOBILE ? 500 : 1100, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const r = Math.sqrt(Math.random()) * GALAXY_R * 1.1, a = Math.random() * 6.283; pos.set([Math.cos(a) * r, -6 + Math.random() * 40, Math.sin(a) * r], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.9, map: dotTexture(), color: 0xff5368, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(p); return p;
})();

/* ---------- Sol: foto dela + anel de acreção ---------- */
const clickables = [];
const sun = new THREE.Group(); scene.add(sun);
const accretion = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshBasicMaterial({ map: discTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
accretion.rotation.x = -Math.PI / 2; sun.add(accretion);
const sunGlowOuter = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('#1746a2'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .42 }));
sunGlowOuter.scale.set(62, 62, 1); sun.add(sunGlowOuter);
const sunGlowGold = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('#ff9aaa'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .6 }));
sunGlowGold.scale.set(30, 30, 1); sun.add(sunGlowGold);
const SUN_SIZE = 15;
const sunPhoto = new THREE.Sprite(new THREE.SpriteMaterial({ map: circleTexture({ src: CFG.sol.foto, index: 1, border: '#ff9aaa' }), transparent: true, alphaTest: 0.01, depthWrite: false, color: 0xe8e8e8 }));
sunPhoto.scale.set(SUN_SIZE, SUN_SIZE, 1); sunPhoto.position.y = 0.2; sun.add(sunPhoto);
sunPhoto.userData = { kind: 'sol', titulo: CFG.sol.titulo, texto: CFG.sol.texto, foto: CFG.sol.foto, size: SUN_SIZE, holder: sun };
clickables.push(sunPhoto);

const sunLight = new THREE.PointLight(0xffe2b0, 3.2, 0, 0); scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x3a62c8, 0.95));

/* ---------- Planetas-foto + órbitas ---------- */
const planets = [];
const N = CFG.planetas.length;
const orbitMat = new THREE.MeshBasicMaterial({ color: 0x1746a2, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
const R0 = 28, R1 = 88, orbitRadii = [];
CFG.planetas.forEach((p, i) => {
    const radius = N === 1 ? 40 : R0 + (R1 - R0) * (i / (N - 1));
    orbitRadii.push(radius);
    const ring = new THREE.Mesh(new THREE.RingGeometry(radius - 0.08, radius + 0.08, 220), orbitMat);
    ring.rotation.x = -Math.PI / 2; scene.add(ring);
    const pivot = new THREE.Group(); pivot.rotation.y = i * 2.39996 + 0.4; scene.add(pivot);   // ângulo áureo: espalha bem
    const holder = new THREE.Group(); holder.position.x = radius; pivot.add(holder);
    const size = 8.4 + (i % 3) * 1.2;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(i % 3 === 0 ? '#ff9aaa' : '#2563eb'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .32 }));
    glow.scale.set(size * 2.3, size * 2.3, 1); holder.add(glow);
    const photo = new THREE.Sprite(new THREE.SpriteMaterial({ map: circleTexture({ src: p.foto, index: i }), transparent: true, alphaTest: 0.01, depthWrite: false, color: 0xe8e8e8 }));
    photo.scale.set(size, size, 1); holder.add(photo);
    photo.userData = { kind: 'planeta', index: i, titulo: p.titulo, texto: p.texto, foto: p.foto, size, holder };
    clickables.push(photo);
    planets.push({ pivot, holder, photo, speed: 0.13 / Math.pow(radius / 24, 0.15), visited: false, hoverScale: 1, bob: Math.random() * 6 });
});

/* ---------- Planetas decorativos removidos: manter apenas o Sol e as fotos ---------- */

/* ---------- Frases deitadas no plano da galáxia ---------- */
try { await Promise.race([document.fonts.load('italic 600 90px "Playfair Display"'), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { }
const phrases = CFG.frases.map((t, i) => {
    const { tex, aspect } = textTexture(t);
    const h = 3.0, w = h * aspect;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    mesh.rotation.x = -Math.PI / 2;
    const wrap = new THREE.Group(); wrap.rotation.y = Math.PI / 2; wrap.add(mesh);
    const pivot = new THREE.Group(); pivot.rotation.y = (i / CFG.frases.length) * Math.PI * 2 + 0.3;
    const base = (orbitRadii[Math.min(i, orbitRadii.length - 1)] || 40);
    const r = 30 + ((i * 17) % 52) + (base % 3);
    wrap.position.set(r, 0.8, 0); pivot.add(wrap); scene.add(pivot);
    return { pivot, mesh, speed: 0.045 + (i % 3) * 0.015, phase: Math.random() * 6 };
});

/* ---------- Meteoro ---------- */
const METEOR = Object.assign({ ativo: true, intervaloMin: 7, intervaloMax: 14 }, CFG.meteoro || {});
const meteor = (() => {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const texH = glowTexture('#ffffff'), texB = glowTexture('#ff9aaa'), texC = glowTexture('#ffb3bf');
    const mk = (map) => new THREE.SpriteMaterial({ map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0 });
    const head = new THREE.Sprite(mk(texH)), halo = new THREE.Sprite(mk(texB));
    g.add(halo); g.add(head);
    const trail = [];
    for (let i = 0; i < 34; i++) { const sp = new THREE.Sprite(mk(i % 3 ? texB : texC)); g.add(sp); trail.push(sp); }
    head.userData = { kind: 'meteoro', titulo: METEOR.titulo || 'Escolha nossa trilha sonora', texto: METEOR.texto || 'Escolha uma música para acompanhar suas lembranças. Ela continuará tocando enquanto você visita as fotos dos planetas. 🎵', foto: null, size: 6.5, holder: head };
    return { g, head, halo, trail, active: false, pos: new THREE.Vector3(), dir: new THREE.Vector3(), speed: 0, life: 0, dur: 1, clickable: head };
})();
const rand = (a, b) => a + Math.random() * (b - a);
let nextMeteor = 8;
function launchMeteor() {
    const a = Math.random() * Math.PI * 2, R = 150, drift = (Math.random() - 0.5) * 0.9;
    const start = new THREE.Vector3(Math.cos(a) * R, rand(30, 80), Math.sin(a) * R);
    const end = new THREE.Vector3(-Math.cos(a + drift) * R * 0.8, rand(-5, 30), -Math.sin(a + drift) * R * 0.8);
    meteor.pos.copy(start); meteor.dir.copy(end).sub(start);
    const len = meteor.dir.length(); meteor.dir.normalize();
    meteor.dur = rand(18, 24); meteor.speed = len / meteor.dur; meteor.life = 0; meteor.active = true; meteor.g.visible = true;
}
function updateMeteor(dt) {
    if (!METEOR.ativo) return;
    if (!meteor.active) {
        if (state.mode === 'free' || state.mode === 'focus') {
            nextMeteor -= dt;
            if (nextMeteor <= 0) { launchMeteor(); nextMeteor = rand(METEOR.intervaloMin, METEOR.intervaloMax); }
        }
        return;
    }
    const meteorDt = dt * state.timeScale;
    meteor.life += meteorDt; meteor.pos.addScaledVector(meteor.dir, meteor.speed * meteorDt);
    const k = meteor.life / meteor.dur, fade = Math.max(0, Math.min(1, k * 6, (1 - k) * 4));
    meteor.head.position.copy(meteor.pos); meteor.head.scale.setScalar(6.5); meteor.head.material.opacity = fade;
    meteor.halo.position.copy(meteor.pos); meteor.halo.scale.setScalar(20); meteor.halo.material.opacity = 0.7 * fade;
    meteor.trail.forEach((sp, i) => {
        const f = i / meteor.trail.length;
        sp.position.copy(meteor.pos).addScaledVector(meteor.dir, -(i + 1) * 2.2);
        sp.scale.setScalar(6.8 * (1 - f) + 0.6);
        sp.material.opacity = Math.pow(1 - f, 1.7) * 0.85 * fade;
    });
    if (k >= 1) { meteor.active = false; meteor.g.visible = false; }
}

/* ---------- Estado / interação ---------- */
const state = { mode: 'intro', focus: null, timeScale: 1, targetTimeScale: 1, visited: 0, t0: 0 };
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
let hovered = null, down = null;
function pick(ev) {
    const r = canvas.getBoundingClientRect();
    mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const targets = meteor.active ? [...clickables, meteor.clickable] : clickables;
    const hit = raycaster.intersectObjects(targets, false)[0]; return hit ? hit.object : null;
}
canvas.addEventListener('pointermove', (e) => { if (state.mode !== 'free') return; hovered = pick(e); canvas.style.cursor = hovered ? 'pointer' : 'grab'; });
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', (e) => {
    if (state.mode !== 'free' || !down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), elapsed = performance.now() - down.t; down = null;
    if (moved < 8 && elapsed < 600) {
        const o = pick(e);
        if (o === meteor.clickable && meteor.active) openCard(o);
        else if (o) openCard(o);
    }
});

const $ = (id) => document.getElementById(id), cardEl = $('card');
function openCard(sprite) {
    const d = sprite.userData;
    state.focus = sprite; state.mode = 'focus'; state.targetTimeScale = 0; controls.enabled = false; controls.autoRotate = false;
    const isMeteor = d.kind === 'meteoro';
    $('cardTitle').textContent = isMeteor ? 'Escolha nossa trilha sonora' : d.titulo;
    $('cardText').textContent = isMeteor
        ? (d.texto || 'Escolha uma música para acompanhar suas lembranças. Ela continuará tocando enquanto você visita as fotos dos planetas. 🎵')
        : d.texto;
    const ph = $('cardPhoto'); ph.innerHTML = '';
    if (d.foto) { const im = new Image(); im.src = d.foto; im.alt = d.titulo; ph.appendChild(im); } else ph.textContent = d.kind === 'sol' ? '☀️' : (isMeteor ? '☄️' : EMOJIS[d.index % EMOJIS.length]);
    $('soundtrackPicker').hidden = !isMeteor;
    if (isMeteor) renderSoundtrackList();
    cardEl.classList.add('open'); cardEl.setAttribute('aria-hidden', 'false');
    if (d.kind === 'planeta') { const pl = planets[d.index]; if (!pl.visited) { pl.visited = true; state.visited++; updateHint(); } }
}
function closeCard() {
    if (state.mode !== 'focus') return;
    cardEl.classList.remove('open'); cardEl.setAttribute('aria-hidden', 'true');
    state.mode = 'returning'; state.focus = null; state.targetTimeScale = 1;
}
$('cardClose').addEventListener('click', closeCard);
cardEl.querySelector('.back').addEventListener('click', closeCard);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });

const hint = $('hint');
function updateHint() { hint.textContent = state.visited >= planets.length ? '✨ Agora toque no Sol' : `Toque nas fotos · ${state.visited}/${planets.length}`; }

const bgm = $('bgm'), musicBtn = $('music');
const audioControls = $('audioControls'), volumeControl = $('volumeControl');
const soundtrackList = $('soundtrackList');
const tracks = Array.isArray(CFG.trilhaSonora) ? CFG.trilhaSonora.filter(track => track && track.arquivo) : [];
let selectedTrack = null;
let trackVolume = 1;
let masterVolume = 1;

function syncAudioControls() {
    musicBtn.textContent = bgm.muted || bgm.paused || bgm.volume === 0 ? '🔇' : '🔊';
    musicBtn.setAttribute('aria-label', bgm.muted || bgm.volume === 0 ? 'Ativar música' : 'Silenciar música');
    musicBtn.title = bgm.muted || bgm.volume === 0 ? 'Ativar música' : 'Silenciar música';
    if (!$('soundtrackPicker').hidden) renderSoundtrackList();
}

function renderSoundtrackList() {
    soundtrackList.innerHTML = '';
    $('soundtrackEmpty').hidden = tracks.length > 0;
    tracks.forEach((track, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'track-option' + (selectedTrack === track.arquivo ? ' active' : '');
        const icon = document.createElement('span');
        icon.className = 'track-icon';
        icon.textContent = selectedTrack === track.arquivo && !bgm.paused && !bgm.muted ? '🔊' : '🎵';
        const title = document.createElement('span');
        title.textContent = track.titulo || `Música ${index + 1}`;
        button.append(icon, title);
        button.addEventListener('click', () => playTrack(track));
        soundtrackList.appendChild(button);
    });
    $('nowPlaying').textContent = selectedTrack
        ? `Selecionada: ${(tracks.find(track => track.arquivo === selectedTrack) || {}).titulo || 'trilha sonora'}`
        : '';
}

function applyVolume() {
    const volume = Math.max(0, Math.min(1, trackVolume * masterVolume));
    bgm.volume = volume;
    if (masterVolume > 0 && !bgm.paused) bgm.muted = false;
    syncAudioControls();
}

function playTrack(track) {
    if (!track || !track.arquivo) return;

    selectedTrack = track.arquivo;

    // Mostra o endereço exato que o navegador tentará abrir.
    const audioUrl = new URL(track.arquivo, document.baseURI);
    bgm.src = audioUrl.href;
    bgm.loop = true;
    bgm.volume = Math.max(
        0,
        Math.min(1, Number.isFinite(Number(track.volume)) ? Number(track.volume) : 1)
    );
    bgm.muted = false;
    bgm.load();

    audioControls.classList.add('show');
    $('nowPlaying').textContent = 'Tentando carregar: ' + audioUrl.pathname;

    bgm.play()
        .then(() => {
            $('nowPlaying').textContent = 'Tocando: ' + (track.titulo || 'Música');
            syncAudioControls();
        })
        .catch((error) => {
            console.error('Erro ao tocar música:', {
                arquivo: track.arquivo,
                endereco: audioUrl.href,
                erro: error
            });
            $('nowPlaying').textContent = 'Erro: ' + error.name + '. Confira o Console (F12).';
            syncAudioControls();
        });

    renderSoundtrackList();
}

// Compatibilidade com uma única música antiga.
if (CFG.musica && tracks.length === 0) {
    selectedTrack = CFG.musica;
    bgm.src = CFG.musica;
    audioControls.classList.add('show');
}

musicBtn.addEventListener('click', () => {
    if (bgm.paused || bgm.muted || bgm.volume === 0) {
        if (masterVolume === 0) {
            masterVolume = 1;
            volumeControl.value = '100';
        }
        bgm.muted = false;
        if (!bgm.src && tracks.length) {
            playTrack(tracks[0]);
            return;
        }
        bgm.play().then(syncAudioControls).catch((error) => {
            console.error('Não foi possível reproduzir a música:', error);
            $('nowPlaying').textContent = 'Não foi possível tocar. Confira o arquivo MP3 e tente selecionar a música novamente.';
            syncAudioControls();
        });
    } else {
        bgm.muted = true;
        syncAudioControls();
    }
});

volumeControl.addEventListener('input', () => {
    masterVolume = Number(volumeControl.value) / 100;
    if (masterVolume > 0) bgm.muted = false;
    else bgm.muted = true;
    applyVolume();
});

bgm.addEventListener('error', () => {
    if (selectedTrack) {
        $('nowPlaying').textContent = 'Erro ao carregar o áudio. Verifique a pasta, o nome e a extensão do arquivo.';
    }
});
bgm.addEventListener('play', syncAudioControls);
bgm.addEventListener('pause', syncAudioControls);

$('enter').addEventListener('click', () => {
    $('intro').classList.add('hide');
    // O navegador só permite iniciar áudio após uma interação do usuário.
    // A reprodução começa quando ele escolhe uma faixa no meteoro ou usa o botão de som.
    state.mode = 'entering'; state.t0 = clock.elapsedTime; updateHint();
    setTimeout(() => hint.classList.add('show'), 4200);
});

/* ---------- Câmera de foco ---------- */
const UP = new THREE.Vector3(0, 1, 0);
function focusGoal(sprite) {
    const d = sprite.userData, wp = d.holder.getWorldPosition(new THREE.Vector3());
    const out = new THREE.Vector3(wp.x, 0, wp.z); if (out.lengthSq() < 1) out.set(0, 0, 1); out.normalize();
    const cam = wp.clone().addScaledVector(out, d.size * 3.4).add(new THREE.Vector3(0, d.size * 0.45, 0));
    const fwd = wp.clone().sub(cam).normalize(), right = new THREE.Vector3().crossVectors(fwd, UP).normalize();
    const portrait = innerWidth / innerHeight < 0.85 || innerWidth <= 760, target = wp.clone();
    if (portrait) target.y -= d.size * 1.1; else target.addScaledVector(right, d.size * 1.35);
    return { cam, target };
}

/* ---------- Loop ---------- */
const clock = new THREE.Clock();
let simulationTime = 0;
camera.position.set(0, 150, 190); camera.lookAt(0, 0, 0);
const ease = (x) => 1 - Math.pow(1 - x, 3);
const INTRO_MS = 5.2;

function loop() {
    const rawDt = Math.min(clock.getDelta(), 0.05);
    const dt = rawDt;
    simulationTime += dt;
    const t = simulationTime;
    uniforms.uTime.value = t;
    state.timeScale += (state.targetTimeScale - state.timeScale) * Math.min(1, dt * 3);

    planets.forEach((p) => {
        p.pivot.rotation.y += p.speed * dt * state.timeScale;
        p.holder.position.y = Math.sin(t * 0.7 + p.bob) * 0.7;
        const goal = (hovered === p.photo && state.mode === 'free') ? 1.16 : 1;
        p.hoverScale += (goal - p.hoverScale) * Math.min(1, dt * 8); p.holder.scale.setScalar(p.hoverScale);
    });
    const shown = state.mode === 'intro' ? 0 : Math.min(1, Math.max(0, (t - state.t0 - 2.5) / 2.5));
    phrases.forEach((f) => {
        f.pivot.rotation.y += f.speed * dt * Math.max(state.timeScale, 0.25);
        const target = shown * (0.55 + Math.sin(t * 0.7 + f.phase) * 0.2);
        f.mesh.material.opacity += (target - f.mesh.material.opacity) * Math.min(1, dt * 2);
    });
    floaters.rotation.y += dt * 0.006; bgStars.rotation.y += dt * 0.003;
    accretion.rotation.z += dt * 0.05;
    updateMeteor(dt);

    const pulse = 1 + Math.sin(t * 1.3) * 0.035;
    sunGlowOuter.scale.setScalar(62 * pulse); sunGlowGold.scale.setScalar(30 * (1 + Math.sin(t * 1.9) * 0.05));
    sunPhoto.scale.setScalar(SUN_SIZE * (state.visited >= planets.length && state.mode === 'free' ? 1 + Math.sin(t * 3) * 0.05 : 1));

    if (state.mode === 'intro') {
        uniforms.uReveal.value = 0;
        const a = t * 0.07; camera.position.set(Math.sin(a) * 190, 120, Math.cos(a) * 190); camera.lookAt(0, 0, 0);
    } else if (state.mode === 'entering') {
        const k = Math.min(1, (t - state.t0) / INTRO_MS);
        uniforms.uReveal.value = k;
        const e = ease(k);
        const from = new THREE.Vector3(Math.sin(t * 0.07) * 190, 120, Math.cos(t * 0.07) * 190);
        camera.position.lerpVectors(from, HOME_POS, e); camera.lookAt(0, 0, 0);
        if (k >= 1) { state.mode = 'free'; controls.enabled = true; controls.autoRotate = true; controls.target.copy(HOME_TARGET); controls.update(); }
    } else if (state.mode === 'focus' && state.focus) {
        const g = focusGoal(state.focus), kk = 1 - Math.pow(0.02, dt);
        camera.position.lerp(g.cam, kk); controls.target.lerp(g.target, kk); camera.lookAt(controls.target);
    } else if (state.mode === 'returning') {
        const kk = 1 - Math.pow(0.04, dt);
        camera.position.lerp(HOME_POS, kk); controls.target.lerp(HOME_TARGET, kk); camera.lookAt(controls.target);
        if (camera.position.distanceTo(HOME_POS) < 2) { state.mode = 'free'; controls.enabled = true; controls.autoRotate = true; }
    } else controls.update();

    composer.render();
    requestAnimationFrame(loop);
}
loop();


/* ---------- Mensagem especial do YouTube ---------- */
/* O botão e a janela são criados aqui; não é necessário alterar o HTML. */
(() => {
    const YOUTUBE_VIDEO_ID = 'IdwJ5XVIagw';

    const videoButton = document.createElement('button');
    videoButton.id = 'videoBtn';
    videoButton.type = 'button';
    videoButton.setAttribute('aria-haspopup', 'dialog');
    videoButton.setAttribute('aria-controls', 'videoModal');
    videoButton.setAttribute('aria-expanded', 'false');
    videoButton.innerHTML = '<span aria-hidden="true">🎥</span><span>Uma mensagem pra você 💙</span>';

    const modal = document.createElement('div');
    modal.id = 'videoModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Uma mensagem especial em vídeo');
    modal.setAttribute('aria-hidden', 'true');

    const backdrop = document.createElement('div');
    backdrop.className = 'videoBack';

    const box = document.createElement('div');
    box.className = 'videoBox';

    const heading = document.createElement('div');
    heading.className = 'videoHeading';
    heading.textContent = 'Uma mensagem pra você 💙';

    const closeButton = document.createElement('button');
    closeButton.id = 'closeVideo';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Fechar vídeo');
    closeButton.title = 'Fechar';
    closeButton.textContent = '×';

    const player = document.createElement('div');
    player.id = 'youtubePlayer';
    player.className = 'youtubePlayer';
    player.setAttribute('aria-label', 'Vídeo do YouTube');

    box.append(heading, closeButton, player);
    modal.append(backdrop, box);
    document.body.append(videoButton, modal);

    let previousAutoRotate = true;

    function openVideoMessage() {
        previousAutoRotate = controls.autoRotate;
        controls.autoRotate = false;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        videoButton.setAttribute('aria-expanded', 'true');

        // Criar o iframe somente após o clique ajuda a evitar carregamentos desnecessários.
        if (!player.querySelector('iframe')) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`;
            iframe.title = 'Uma mensagem pra você';
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            iframe.loading = 'eager';
            player.appendChild(iframe);
        }
        closeButton.focus();
    }

    function closeVideoMessage() {
        if (!modal.classList.contains('open')) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        videoButton.setAttribute('aria-expanded', 'false');

        // Remover o iframe interrompe a reprodução imediatamente.
        player.replaceChildren();
        controls.autoRotate = state.mode === 'free' ? previousAutoRotate : false;
        videoButton.focus();
    }

    videoButton.addEventListener('click', openVideoMessage);
    closeButton.addEventListener('click', closeVideoMessage);
    backdrop.addEventListener('click', closeVideoMessage);

    addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            closeVideoMessage();
        }
    });
})();
