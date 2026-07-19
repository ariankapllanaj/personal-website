import * as THREE from "./vendor/three.module.min.js";

const canvas = document.querySelector("#webglCanvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
let scene;
let camera;
let coreGroup;
let innerCore;
let outerCore;
let particleShell;
let connectionLines;
let stars;
let animationFrame;
let isRunning = false;
let sceneStarted = false;
let pulse = 0;
let scrollProgress = 0;

const pointer = { x: 0, y: 0 };
const smoothPointer = { x: 0, y: 0 };
const target = {
  scale: 0.001,
  rotationX: 0,
  rotationY: 0,
  positionX: 1.55,
  positionY: 0,
};

const palette = {
  acid: new THREE.Color(0xd7ff43),
  violet: new THREE.Color(0x8f6bff),
  blue: new THREE.Color(0x8cd7ff),
  white: new THREE.Color(0xf7f7f2),
};

function randomSpherePoint(radius = 1) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  );
}

function createParticleSphere() {
  const count = window.innerWidth < 760 ? 1150 : 2400;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const point = randomSpherePoint(1.48 + (Math.random() - 0.5) * 0.1);
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
    sizes[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: palette.white,
    size: window.innerWidth < 760 ? 0.012 : 0.009,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createConnections() {
  const linePoints = [];

  for (let i = 0; i < 60; i += 1) {
    const start = randomSpherePoint(1.485);
    const end = start.clone().lerp(randomSpherePoint(1.485), 0.13 + Math.random() * 0.12).normalize().multiplyScalar(1.485);
    linePoints.push(start, end);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const material = new THREE.LineBasicMaterial({
    color: palette.acid,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.LineSegments(geometry, material);
}

function createOrbit(radius, color, rotation) {
  const points = [];
  const segments = 150;

  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.42, 0));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
  });
  const orbit = new THREE.LineLoop(geometry, material);
  orbit.rotation.set(...rotation);
  return orbit;
}

function createStars() {
  const count = window.innerWidth < 760 ? 280 : 700;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xa9b0bd,
    size: 0.008,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

function buildScene() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !window.matchMedia("(max-resolution: 1dppx)").matches,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x07090d, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.1);

  coreGroup = new THREE.Group();
  scene.add(coreGroup);

  const outerGeometry = new THREE.IcosahedronGeometry(1.18, 2);
  const outerMaterial = new THREE.MeshBasicMaterial({
    color: palette.violet,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
  });
  outerCore = new THREE.Mesh(outerGeometry, outerMaterial);
  coreGroup.add(outerCore);

  const innerGeometry = new THREE.IcosahedronGeometry(0.72, 1);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: palette.acid,
    wireframe: true,
    transparent: true,
    opacity: 0.67,
    blending: THREE.AdditiveBlending,
  });
  innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
  coreGroup.add(innerCore);

  const glowGeometry = new THREE.IcosahedronGeometry(0.26, 1);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: palette.acid,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
  });
  coreGroup.add(new THREE.Mesh(glowGeometry, glowMaterial));

  particleShell = createParticleSphere();
  coreGroup.add(particleShell);

  connectionLines = createConnections();
  coreGroup.add(connectionLines);

  coreGroup.add(createOrbit(1.9, palette.acid, [0.42, 0.18, 0.32]));
  coreGroup.add(createOrbit(2.13, palette.violet, [1.22, 0.3, -0.34]));
  coreGroup.add(createOrbit(1.73, palette.blue, [0.82, 1.08, 0.08]));

  stars = createStars();
  scene.add(stars);

  updateLayout();
  coreGroup.scale.setScalar(0.001);
}

function updateLayout() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerWidth < 760) {
    target.positionX = 0.35;
    target.positionY = -0.66;
    camera.position.z = 6.7;
  } else if (window.innerWidth < 1100) {
    target.positionX = 1.25;
    target.positionY = 0.02;
    camera.position.z = 6.4;
  } else {
    target.positionX = 1.72;
    target.positionY = 0.02;
    camera.position.z = 6.1;
  }
}

function renderFrame(time = 0) {
  if (!renderer || !scene || !camera) return;

  const t = time * 0.001;
  smoothPointer.x += (pointer.x - smoothPointer.x) * 0.045;
  smoothPointer.y += (pointer.y - smoothPointer.y) * 0.045;

  coreGroup.position.x += (target.positionX + smoothPointer.x * 0.19 - coreGroup.position.x) * 0.055;
  coreGroup.position.y += (target.positionY - smoothPointer.y * 0.16 - coreGroup.position.y) * 0.055;

  const desiredScale = target.scale + pulse * 0.12;
  coreGroup.scale.x += (desiredScale - coreGroup.scale.x) * 0.075;
  coreGroup.scale.y += (desiredScale - coreGroup.scale.y) * 0.075;
  coreGroup.scale.z += (desiredScale - coreGroup.scale.z) * 0.075;

  coreGroup.rotation.y = t * 0.075 + smoothPointer.x * 0.18 + scrollProgress * 1.4;
  coreGroup.rotation.x = Math.sin(t * 0.24) * 0.1 + smoothPointer.y * 0.12;
  outerCore.rotation.y = -t * 0.13;
  outerCore.rotation.z = t * 0.055;
  innerCore.rotation.x = t * 0.23;
  innerCore.rotation.y = t * 0.31;
  particleShell.rotation.y = t * 0.034;
  connectionLines.rotation.y = -t * 0.047;
  stars.rotation.y = t * 0.002 + scrollProgress * 0.05;
  stars.position.y = scrollProgress * 0.35;

  if (pulse > 0.001) {
    pulse *= 0.91;
    innerCore.material.opacity = 0.67 + pulse * 0.3;
    particleShell.material.opacity = 0.62 + pulse * 0.25;
  }

  renderer.render(scene, camera);

  if (isRunning && !prefersReducedMotion) {
    animationFrame = requestAnimationFrame(renderFrame);
  }
}

export function startScene() {
  sceneStarted = true;
  target.scale = window.innerWidth < 760 ? 0.88 : 1;
  isRunning = true;
  cancelAnimationFrame(animationFrame);
  renderFrame(performance.now());
}

export function triggerPulse() {
  pulse = 1;
  if (prefersReducedMotion) renderFrame(performance.now());
}

export function setScrollProgress(value) {
  scrollProgress = Math.max(0, Math.min(1, value));
  if (prefersReducedMotion && sceneStarted) renderFrame(performance.now());
}

function handleVisibility() {
  isRunning = !document.hidden && sceneStarted;
  cancelAnimationFrame(animationFrame);
  if (isRunning) renderFrame(performance.now());
}

buildScene();

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

window.addEventListener("resize", updateLayout, { passive: true });
document.addEventListener("visibilitychange", handleVisibility);

if (prefersReducedMotion) {
  renderFrame(performance.now());
}
