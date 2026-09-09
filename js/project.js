import * as THREE from "./vendor/three.module.min.js";
import { projectOrder, projects } from "./projects-data.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const requested = new URLSearchParams(location.search).get("project");
const slug = projectOrder.includes(requested) ? requested : projectOrder[0];
const project = projects[slug];
const isTool = project.kind === "ai-tool";
const nextSlug = projectOrder[(projectOrder.indexOf(slug) + 1) % projectOrder.length];
const nextProject = projects[nextSlug];
const id = (value) => document.getElementById(value);
const setText = (target, value) => { if (id(target)) id(target).textContent = value; };

document.documentElement.style.setProperty("--accent", project.accent);
document.documentElement.style.setProperty("--accent2", project.accentSecondary);
document.title = `${project.title} — Arian Kapllanaj`;
id("projectMetaDescription").content = project.description;

[
  ["projectType", project.type],
  ["projectTitle", project.displayTitle || project.title], ["projectSubtitle", project.subtitle],
  ["projectClient", project.client],
  ["projectRole", project.role], ["projectMarket", project.market],
  ["projectYear", project.year], ["projectStatus", project.status],
  ["overviewTitle", project.overviewTitle], ["overviewBody", project.overviewBody],
  ["challengeTitle", project.challengeTitle], ["challengeBody", project.challengeBody],
  ["solutionTitle", project.solutionTitle], ["solutionBody", project.solutionBody],
  ["nextProjectTitle", nextProject.shortTitle],
  ["projectFooterTitle", project.shortTitle],
].forEach(([target, value]) => { if (value != null) setText(target, value); });

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

document.body.classList.toggle("project--tool", isTool);
if (project.challengeHeading) setText("challengeHeading", project.challengeHeading);
if (project.solutionHeading) setText("solutionHeading", project.solutionHeading);

if (project.facts) {
  id("projectFacts").replaceChildren(...project.facts.map(([label, value]) => {
    const fact = element("div");
    fact.append(element("span", "", label), element("strong", "", value));
    return fact;
  }));
}

const projectImage = id("projectImage");
if (project.image) {
  projectImage.src = project.image;
  projectImage.alt = project.alt;
  id("projectImageFrame").hidden = false;
}
setText("visualCaption", isTool ? "AI tool / Workflow" : `Live capture / ${project.year}`);
setText("visualStatus", isTool ? "System overview" : "Project online");
[id("headerLiveLink"), id("heroLiveLink")].forEach((link) => {
  if (isTool) {
    link.href = "#workflow";
    link.removeAttribute("target");
    link.removeAttribute("rel");
    if (link.id === "heroLiveLink") {
      link.querySelector("span").textContent = "See how it works";
      link.querySelector("path").setAttribute("d", "M12 5v14M6 13l6 6 6-6");
    } else link.textContent = "View workflow ↓";
    link.setAttribute("aria-label", `Explore the ${project.title} workflow`);
  } else if (project.liveUrl) {
    link.href = project.liveUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Open the live ${project.title} website in a new tab`);
  }
  link.hidden = !isTool && !project.liveUrl;
});

if (isTool && project.workflow) {
  const workflow = project.workflow;
  id("projectToolSummary").hidden = false;
  id("workflow").hidden = false;
  setText("workflowTitle", workflow.title);
  setText("workflowIntro", workflow.intro);
  setText("workflowNote", workflow.note);
  setText("processIndex", "Approach");
  setText("highlightsIndex", "Highlights");
  setText("stackLabel", "Workflow components");

  id("projectToolFlow").replaceChildren(...workflow.summary.map(([label, title]) => {
    const step = element("li", "tool-summary__step");
    step.append(element("span", "", label), element("strong", "", title));
    return step;
  }));

  id("workflowStages").replaceChildren(...workflow.stages.map((stage) => {
    const panel = element("li", `workflow-stage reveal${stage.approval ? " workflow-stage--approval" : ""}`);
    const label = element("p", "workflow-stage__label", stage.label);
    panel.append(label, element("h3", "", stage.title));
    const steps = element("ol", "workflow-steps");
    stage.steps.forEach(([title, description]) => {
      const step = element("li", "workflow-step");
      const content = element("div");
      content.append(element("h4", "", title), element("p", "", description));
      step.append(content);
      steps.append(step);
    });
    panel.append(steps);
    return panel;
  }));
}

const nextLink = id("nextProjectLink");
nextLink.href = `project.html?project=${nextSlug}`;
nextLink.dataset.routeCode = "PROJECT";

id("projectFeatures").innerHTML = project.features.map(([, title, body]) => `
  <article class="feature reveal"><h3>${title}</h3><p>${body}</p><i aria-hidden="true">↗</i></article>
`).join("");
id("projectStack").innerHTML = project.stack.map((item) => `<span>${item}</span>`).join("");

function finishLoading() {
  document.body.classList.add("is-ready");
  document.body.classList.remove("is-loading");
}
if (!project.image || projectImage.complete) setTimeout(finishLoading, reduceMotion ? 0 : 420);
else {
  projectImage.addEventListener("load", () => setTimeout(finishLoading, reduceMotion ? 0 : 420), { once: true });
  projectImage.addEventListener("error", finishLoading, { once: true });
  setTimeout(finishLoading, 1800);
}

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add("is-visible");
  observer.unobserve(entry.target);
}), { threshold: .12, rootMargin: "0px 0px -5%" });
reveals.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min((index % 4) * 60, 180)}ms`;
  observer.observe(item);
});

const cursorDot = document.querySelector(".cursor--dot");
const cursorRing = document.querySelector(".cursor--ring");
const cursor = { x: -100, y: -100, rx: -100, ry: -100 };
addEventListener("pointermove", (event) => {
  cursor.x = event.clientX; cursor.y = event.clientY;
  cursorDot.style.transform = `translate3d(${event.clientX - 2.5}px,${event.clientY - 2.5}px,0)`;
}, { passive: true });
(function moveCursor() {
  cursor.rx += (cursor.x - cursor.rx) * .16; cursor.ry += (cursor.y - cursor.ry) * .16;
  cursorRing.style.transform = `translate3d(${cursor.rx - cursorRing.offsetWidth / 2}px,${cursor.ry - cursorRing.offsetHeight / 2}px,0)`;
  requestAnimationFrame(moveCursor);
}());
document.querySelectorAll("a").forEach((element) => {
  element.addEventListener("pointerenter", () => cursorRing.classList.add("is-hovering"));
  element.addEventListener("pointerleave", () => cursorRing.classList.remove("is-hovering"));
});
document.querySelectorAll("a[target='_blank']").forEach((element) => {
  element.addEventListener("pointerenter", () => cursorRing.classList.add("is-external"));
  element.addEventListener("pointerleave", () => cursorRing.classList.remove("is-external"));
});

if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      element.style.transform = `translate3d(${(event.clientX - rect.left - rect.width / 2) * .13}px,${(event.clientY - rect.top - rect.height / 2) * .13}px,0)`;
    });
    element.addEventListener("pointerleave", () => { element.style.transform = "translate3d(0,0,0)"; });
  });
}

const clickFlash = document.querySelector(".click-flash");
addEventListener("pointerdown", (event) => {
  clickFlash.style.left = `${event.clientX}px`; clickFlash.style.top = `${event.clientY}px`;
  clickFlash.classList.remove("is-active"); void clickFlash.offsetWidth; clickFlash.classList.add("is-active");
});

const route = id("projectRoute");
document.querySelectorAll(".internal-link").forEach((link) => link.addEventListener("click", (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  try { sessionStorage.setItem("akSkipIntroOnce", "true"); } catch { /* navigation still works */ }
  window.name = "akPortfolio:returning";
  setText("projectRouteLabel", link.dataset.routeLabel || "Opening project");
  setText("projectRouteCode", link.dataset.routeCode || "SELECTED WORK");
  route.style.setProperty("--route-x", `${event.clientX || innerWidth / 2}px`);
  route.style.setProperty("--route-y", `${event.clientY || innerHeight / 2}px`);
  route.classList.add("is-active");
  setTimeout(() => { location.href = link.getAttribute("href"); }, reduceMotion ? 0 : 760);
}));

document.querySelector(".site-footer a").addEventListener("click", (event) => {
  event.preventDefault(); id("top").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
});

const header = id("projectHeader");
const parallax = document.querySelector("[data-parallax]");
let lastScroll = 0, ticking = false;
function updateScroll() {
  const current = scrollY;
  header.classList.toggle("is-scrolled", current > 24);
  header.classList.toggle("is-hidden", current > lastScroll && current > 280);
  if (parallax && !reduceMotion && current < innerHeight * 1.25) parallax.style.transform = `translate3d(0,${current * Number(parallax.dataset.parallax)}px,0)`;
  lastScroll = Math.max(current, 0); ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
updateScroll();

function createScene() {
  const canvas = id("projectCanvas");
  if (reduceMotion) return;
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 100); camera.position.z = 8;
    const group = new THREE.Group(); scene.add(group);
    const accent = new THREE.Color(project.accent), secondary = new THREE.Color(project.accentSecondary);
    const ring = new THREE.Mesh(new THREE.TorusKnotGeometry(2.25, .045, 180, 14, 2, 3), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: .12, wireframe: true }));
    ring.position.set(2.8, .7, -1.2); ring.rotation.set(.5, .2, 0); group.add(ring);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), new THREE.MeshBasicMaterial({ color: secondary, transparent: true, opacity: .18, wireframe: true }));
    core.position.set(3, .55, -1.4); group.add(core);
    const positions = new Float32Array(750 * 3);
    for (let i = 0; i < 750; i++) {
      const radius = 2.5 + Math.random() * 7, angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius + 2.2;
      positions[i * 3 + 1] = (Math.random() - .5) * 5.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 2;
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: accent, size: .018, transparent: true, opacity: .38, depthWrite: false })); group.add(particles);
    const pointer = { x: 0, y: 0 };
    addEventListener("pointermove", (event) => { pointer.x = (event.clientX / innerWidth - .5) * 2; pointer.y = (event.clientY / innerHeight - .5) * 2; }, { passive: true });
    const clock = new THREE.Clock();
    (function render() {
      const time = clock.getElapsedTime(), progress = scrollY / Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      ring.rotation.y = time * .075 + pointer.x * .08; ring.rotation.x = .5 + Math.sin(time * .22) * .08 - pointer.y * .05;
      core.rotation.x = time * .08; core.rotation.y = -time * .11; particles.rotation.y = time * .012 + progress * .7;
      group.position.y += (-progress * 1.3 - group.position.y) * .025;
      renderer.render(scene, camera); requestAnimationFrame(render);
    }());
    addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); });
  } catch { canvas.style.display = "none"; }
}
createScene();
