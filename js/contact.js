import * as THREE from "./vendor/three.module.min.js";

const body = document.body;
const canvas = document.querySelector("#contactCanvas");
const header = document.querySelector("#siteHeader");
const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const contactRoute = document.querySelector("#contactRoute");
const form = document.querySelector("#contactForm");
const signalState = document.querySelector("#signalState");
const progressDisplay = document.querySelector("#formProgress");
const message = document.querySelector("#message");
const characterCount = document.querySelector("#characterCount");
const successState = document.querySelector("#successState");
const sendButton = form.querySelector(".send-button");
const honeypot = form.elements.website;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const INTRO_STARTED_KEY = "akPortfolioStarted";
const SKIP_INTRO_ONCE_KEY = "akSkipIntroOnce";
const WINDOW_RETURNING_VALUE = "akPortfolio:returning";
const WINDOW_SKIP_VALUE = "akPortfolio:skip-intro-once";

function readSessionFlag(key) {
  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function setSessionFlag(key, value) {
  try {
    if (value) window.sessionStorage.setItem(key, "true");
    else window.sessionStorage.removeItem(key);
  } catch {
    /* Navigation remains functional when storage is unavailable. */
  }
}

let renderer;
let scene;
let camera;
let signalGroup;
let core;
let shell;
let particles;
let packetGroup;
let animationFrame;
let pulse = 0;

const pointer = { x: 0, y: 0 };
const smoothPointer = { x: 0, y: 0 };
const colors = {
  acid: new THREE.Color(0xd7ff43),
  violet: new THREE.Color(0x8f6bff),
  blue: new THREE.Color(0x8cd7ff),
};

function spherePoint(radius = 1) {
  const theta = Math.random() * Math.PI * 2;
  const z = Math.random() * 2 - 1;
  const radial = Math.sqrt(1 - z * z);
  return new THREE.Vector3(
    radius * radial * Math.cos(theta),
    radius * radial * Math.sin(theta),
    radius * z,
  );
}

function createSignalParticles() {
  const count = window.innerWidth < 700 ? 850 : 1750;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const point = spherePoint(1.65 + (Math.random() - 0.5) * 0.16);
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: colors.blue,
    size: window.innerWidth < 700 ? 0.013 : 0.009,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createOrbit(radius, color, rotation) {
  const points = [];
  for (let i = 0; i <= 150; i += 1) {
    const angle = (i / 150) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.43, 0));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
  });
  const orbit = new THREE.LineLoop(geometry, material);
  orbit.rotation.set(...rotation);
  return orbit;
}

function createPackets() {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.035, 10, 10);

  for (let i = 0; i < 8; i += 1) {
    const material = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? colors.acid : colors.violet,
      transparent: true,
      opacity: 0.9,
    });
    const packet = new THREE.Mesh(geometry, material);
    packet.userData.angle = (i / 8) * Math.PI * 2;
    packet.userData.speed = 0.16 + Math.random() * 0.12;
    packet.userData.radius = 1.75 + Math.random() * 0.5;
    packet.userData.height = (Math.random() - 0.5) * 1.15;
    group.add(packet);
  }

  return group;
}

function buildSignalScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x07090d, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6.2;

  signalGroup = new THREE.Group();
  scene.add(signalGroup);

  core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.78, 2),
    new THREE.MeshBasicMaterial({
      color: colors.acid,
      wireframe: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
    }),
  );
  signalGroup.add(core);

  shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.25, 2),
    new THREE.MeshBasicMaterial({
      color: colors.violet,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    }),
  );
  signalGroup.add(shell);

  const innerGlow = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.29, 1),
    new THREE.MeshBasicMaterial({ color: colors.acid, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }),
  );
  signalGroup.add(innerGlow);

  particles = createSignalParticles();
  signalGroup.add(particles);
  signalGroup.add(createOrbit(1.92, colors.acid, [0.35, 0.52, 0.18]));
  signalGroup.add(createOrbit(2.18, colors.violet, [1.1, 0.22, -0.4]));
  signalGroup.add(createOrbit(1.68, colors.blue, [0.72, 1.2, 0.1]));

  packetGroup = createPackets();
  signalGroup.add(packetGroup);

  updateSceneLayout();
  signalGroup.scale.setScalar(reduceMotion ? 1 : 0.001);
}

function updateSceneLayout() {
  if (!renderer || !camera || !signalGroup) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  if (window.innerWidth < 820) {
    signalGroup.position.set(0.7, -1.18, 0);
    signalGroup.scale.setScalar(0.8);
    camera.position.z = 6.8;
  } else if (window.innerWidth < 1200) {
    signalGroup.position.set(-1.72, -0.48, 0);
    camera.position.z = 6.5;
  } else {
    signalGroup.position.set(-2.05, -0.43, 0);
    camera.position.z = 6.2;
  }
}

function triggerSignal(amount = 1) {
  pulse = Math.max(pulse, amount);
}

function render(time = 0) {
  const t = time * 0.001;
  smoothPointer.x += (pointer.x - smoothPointer.x) * 0.045;
  smoothPointer.y += (pointer.y - smoothPointer.y) * 0.045;

  const baseScale = window.innerWidth < 820 ? 0.8 : 1;
  const targetScale = baseScale + pulse * 0.1;
  signalGroup.scale.x += (targetScale - signalGroup.scale.x) * 0.075;
  signalGroup.scale.y += (targetScale - signalGroup.scale.y) * 0.075;
  signalGroup.scale.z += (targetScale - signalGroup.scale.z) * 0.075;

  signalGroup.rotation.y = t * 0.07 + smoothPointer.x * 0.18;
  signalGroup.rotation.x = Math.sin(t * 0.24) * 0.08 + smoothPointer.y * 0.12;
  core.rotation.x = t * 0.29;
  core.rotation.y = t * 0.37;
  shell.rotation.y = -t * 0.1;
  shell.rotation.z = t * 0.045;
  particles.rotation.y = t * 0.028;

  packetGroup.children.forEach((packet) => {
    const angle = packet.userData.angle + t * packet.userData.speed;
    packet.position.set(
      Math.cos(angle) * packet.userData.radius,
      packet.userData.height + Math.sin(angle * 2) * 0.18,
      Math.sin(angle) * packet.userData.radius,
    );
  });

  if (pulse > 0.001) {
    pulse *= 0.9;
    core.material.opacity = 0.78 + pulse * 0.2;
    particles.material.opacity = 0.48 + pulse * 0.35;
  }

  renderer.render(scene, camera);
  if (!reduceMotion) animationFrame = requestAnimationFrame(render);
}

buildSignalScene();
render(performance.now());

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

window.addEventListener("resize", updateSceneLayout, { passive: true });
document.addEventListener("visibilitychange", () => {
  cancelAnimationFrame(animationFrame);
  if (!document.hidden && !reduceMotion) render(performance.now());
});

/* Page entrance */
window.addEventListener("load", () => {
  window.setTimeout(() => {
    body.classList.add("is-ready");
    body.classList.remove("is-loading");
    triggerSignal(1.2);
  }, reduceMotion ? 0 : 420);
});

/* Header and mobile navigation */
window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 25), { passive: true });

function setMenu(open) {
  body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu.setAttribute("aria-hidden", String(!open));
}

menuToggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

/* Route transition back into the portfolio */
document.querySelectorAll("a[href^='index.html']").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = link.getAttribute("href");
    if (readSessionFlag(INTRO_STARTED_KEY) || window.name === WINDOW_RETURNING_VALUE) {
      setSessionFlag(SKIP_INTRO_ONCE_KEY, true);
      window.name = WINDOW_SKIP_VALUE;
    }
    contactRoute.style.setProperty("--route-x", `${event.clientX || window.innerWidth / 2}px`);
    contactRoute.style.setProperty("--route-y", `${event.clientY || window.innerHeight / 2}px`);
    body.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = destination; }, reduceMotion ? 0 : 820);
  });
});

/* Cursor */
const cursorDot = document.querySelector(".cursor--dot");
const cursorRing = document.querySelector(".cursor--ring");
const cursor = { x: -100, y: -100, ringX: -100, ringY: -100 };

window.addEventListener("pointermove", (event) => {
  cursor.x = event.clientX;
  cursor.y = event.clientY;
  cursorDot.style.transform = `translate3d(${event.clientX - 2.5}px, ${event.clientY - 2.5}px, 0)`;
}, { passive: true });

function moveCursor() {
  cursor.ringX += (cursor.x - cursor.ringX) * 0.16;
  cursor.ringY += (cursor.y - cursor.ringY) * 0.16;
  cursorRing.style.transform = `translate3d(${cursor.ringX - cursorRing.offsetWidth / 2}px, ${cursor.ringY - cursorRing.offsetHeight / 2}px, 0)`;
  requestAnimationFrame(moveCursor);
}
moveCursor();

document.querySelectorAll("a, button, input, select, textarea, .consent").forEach((element) => {
  element.addEventListener("pointerenter", () => cursorRing.classList.add("is-hovering"));
  element.addEventListener("pointerleave", () => cursorRing.classList.remove("is-hovering"));
});

/* Magnetic controls */
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
    });
    element.addEventListener("pointerleave", () => { element.style.transform = "translate3d(0,0,0)"; });
  });
}

/* Form interaction */
const trackedFields = [
  form.elements.name,
  form.elements.email,
  form.elements.project_type,
  form.elements.message,
  form.elements.consent,
];

function fieldIsComplete(field) {
  if (field.type === "checkbox") return field.checked;
  if (field.type === "email") return field.validity.valid && field.value.trim().length > 0;
  return field.value.trim().length > 0;
}

function updateProgress() {
  const complete = trackedFields.filter(fieldIsComplete).length;
  const percentage = Math.round((complete / trackedFields.length) * 100);
  progressDisplay.textContent = String(percentage).padStart(2, "0");
}

function validateField(field) {
  const wrapper = field.closest(".field") || field.closest(".consent");
  if (!field.required) return true;
  const valid = field.checkValidity();
  wrapper?.classList.toggle("is-invalid", !valid);
  return valid;
}

function showSuccessState() {
  successState.classList.add("is-visible");
  successState.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

form.querySelectorAll("input, select, textarea").forEach((field) => {
  const eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
  field.addEventListener(eventName, () => {
    if (field.tagName === "SELECT") field.classList.toggle("has-value", Boolean(field.value));
    (field.closest(".field") || field.closest(".consent"))?.classList.remove("is-invalid");
    updateProgress();
    triggerSignal(0.7);
    signalState.textContent = field.id === "message" ? "Receiving idea" : "Signal detected";
  });

  field.addEventListener("focus", () => {
    triggerSignal(0.9);
    signalState.textContent = "Channel active";
  });

  field.addEventListener("blur", () => {
    validateField(field);
    signalState.textContent = "Listening";
  });
});

message.setAttribute("maxlength", "1200");
message.addEventListener("input", () => { characterCount.textContent = String(message.value.length); });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fieldsValid = Array.from(form.querySelectorAll("[required]")).map(validateField).every(Boolean);

  if (!fieldsValid) {
    form.querySelector(":invalid")?.focus();
    signalState.textContent = "Input required";
    triggerSignal(1.3);
    return;
  }

  if (honeypot.value.trim().length > 0) {
    signalState.textContent = "Transmission rejected";
    triggerSignal(1.3);
    return;
  }

  sendButton.classList.add("is-sending");
  signalState.textContent = "Transmitting";
  triggerSignal(1.6);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });

    if (!response.ok) {
      throw new Error(`Formspree rejected the submission (${response.status})`);
    }

    form.reset();
    updateProgress();
    sendButton.classList.remove("is-sending");
    signalState.textContent = "Transmission complete";
    showSuccessState();
  } catch (error) {
    sendButton.classList.remove("is-sending");
    signalState.textContent = "Connection error";
    triggerSignal(1.4);
    console.error(error);
  }
});

updateProgress();

if (new URLSearchParams(window.location.search).get("sent") === "1") {
  window.setTimeout(() => {
    showSuccessState();
  }, reduceMotion ? 0 : 1350);
}
