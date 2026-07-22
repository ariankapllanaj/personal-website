import { setScrollProgress, startScene, triggerPulse } from "./scene.js";

const body = document.body;
const gate = document.querySelector("#experienceGate");
const enterButton = document.querySelector("#enterButton");
const bootStatus = document.querySelector("#bootStatus span");
const siteShell = document.querySelector("#siteShell");
const siteHeader = document.querySelector("#siteHeader");
const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = document.querySelector("#mobileMenu");
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
    /* The experience still works when storage is unavailable. */
  }
}

const projectData = {
  jarvis: {
    index: "Project / 01",
    type: "AI / Voice / Automation",
    title: "Jarvis Assistant",
    lead: "A local-first personal AI assistant designed as a calm, always-available operating layer. It combines private language models, a custom voice pipeline, tool connections and automations into one evolving system.",
    facts: [["Role", "Concept & engineering"], ["Focus", "Local intelligence"], ["Status", "In development"]],
    mark: "J",
    color: "#d7ff43",
  },
  cod: {
    index: "Project / 02",
    type: "Community / Editorial / Gaming",
    title: "Call of Duty Albania",
    lead: "A home for Albania's Call of Duty community—combining news, player culture, interactive maps and future competitive features in a visual language inspired by the game without becoming a generic fan page.",
    facts: [["Role", "Founder & developer"], ["Focus", "Community platform"], ["Market", "Albania & Kosovo"]],
    mark: "COD",
    color: "#d7ff43",
  },
  luxe: {
    index: "Project / 03",
    type: "Brand / Web / Booking",
    title: "Luxe Beauty",
    lead: "A minimal, luxurious and responsive website for a Swiss beauty studio. The experience uses soft editorial motion, elegant service storytelling and a clear path into the Fresha booking journey.",
    facts: [["Role", "Web design & build"], ["Focus", "Premium experience"], ["Market", "Switzerland"]],
    mark: "L",
    color: "#d7b994",
  },
  arix: {
    index: "Project / 04",
    type: "Archive / Interaction / Gaming",
    title: "Arix Collection",
    lead: "An interactive personal archive shaped by gaming history, console culture and nostalgia. It experiments with cinematic startup sequences and playful scrolling to turn a collection into an experience.",
    facts: [["Role", "Creator & developer"], ["Focus", "Interactive archive"], ["Origin", "Personal passion"]],
    mark: "A",
    color: "#8cd7ff",
  },
};

function updateClock() {
  const clock = document.querySelector("#gateClock");
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Tirane",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

updateClock();
setInterval(updateClock, 1000);

function finishEntry() {
  setSessionFlag(INTRO_STARTED_KEY, true);
  gate.classList.add("is-complete");
  body.classList.add("site-ready");
  siteShell.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    body.classList.remove("is-locked");
    gate.setAttribute("aria-hidden", "true");
    document.querySelector(".hero a")?.focus({ preventScroll: true });
  }, reduceMotion ? 50 : 120);
}

function initializeExperience() {
  if (enterButton.disabled) return;
  enterButton.disabled = true;
  gate.classList.add("is-booting");
  bootStatus.textContent = "Establishing visual interface";
  startScene();

  if (reduceMotion) {
    bootStatus.textContent = "System ready";
    finishEntry();
    return;
  }

  window.setTimeout(() => { bootStatus.textContent = "Loading selected systems"; }, 250);
  window.setTimeout(() => { bootStatus.textContent = "Calibrating motion field"; }, 520);
  window.setTimeout(() => {
    bootStatus.textContent = "Welcome, explorer";
    gate.classList.add("is-launching");
    body.classList.add("site-ready");
    siteShell.setAttribute("aria-hidden", "false");
  }, 780);
  window.setTimeout(finishEntry, 2250);
}

enterButton.addEventListener("click", initializeExperience);

function skipEntryAfterReturn() {
  setSessionFlag(SKIP_INTRO_ONCE_KEY, false);
  if (window.name === WINDOW_SKIP_VALUE) window.name = "";
  setSessionFlag(INTRO_STARTED_KEY, true);
  enterButton.disabled = true;
  startScene();
  gate.classList.add("is-complete");
  gate.setAttribute("aria-hidden", "true");
  siteShell.setAttribute("aria-hidden", "false");
  body.classList.add("site-ready");
  body.classList.remove("is-locked");
}

if (readSessionFlag(SKIP_INTRO_ONCE_KEY) || window.name === WINDOW_SKIP_VALUE) {
  skipEntryAfterReturn();
}

window.addEventListener("pageshow", () => {
  if (body.classList.contains("site-ready") && (readSessionFlag(SKIP_INTRO_ONCE_KEY) || window.name.startsWith("akPortfolio:"))) {
    setSessionFlag(SKIP_INTRO_ONCE_KEY, false);
    window.name = "";
  }
});

/* Cinematic route into the contact experience */
const routeTransition = document.querySelector("#routeTransition");
document.querySelectorAll(".contact-page-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setSessionFlag(SKIP_INTRO_ONCE_KEY, true);
    window.name = WINDOW_RETURNING_VALUE;
    routeTransition.style.setProperty("--route-x", `${event.clientX || window.innerWidth / 2}px`);
    routeTransition.style.setProperty("--route-y", `${event.clientY || window.innerHeight / 2}px`);
    routeTransition.classList.add("is-active");
    window.setTimeout(() => { window.location.href = link.getAttribute("href"); }, reduceMotion ? 0 : 820);
  });
});

/* Mobile menu */
function setMenu(open) {
  body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu.setAttribute("aria-hidden", String(!open));
}

menuToggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

/* Cursor */
const cursorDot = document.querySelector(".cursor--dot");
const cursorRing = document.querySelector(".cursor--ring");
const cursorState = { x: -100, y: -100, ringX: -100, ringY: -100 };

window.addEventListener("pointermove", (event) => {
  cursorState.x = event.clientX;
  cursorState.y = event.clientY;
  cursorDot.style.transform = `translate3d(${event.clientX - 2.5}px, ${event.clientY - 2.5}px, 0)`;
}, { passive: true });

function animateCursor() {
  cursorState.ringX += (cursorState.x - cursorState.ringX) * 0.16;
  cursorState.ringY += (cursorState.y - cursorState.ringY) * 0.16;
  cursorRing.style.transform = `translate3d(${cursorState.ringX - cursorRing.offsetWidth / 2}px, ${cursorState.ringY - cursorRing.offsetHeight / 2}px, 0)`;
  requestAnimationFrame(animateCursor);
}

animateCursor();

document.querySelectorAll("a, button").forEach((element) => {
  element.addEventListener("pointerenter", () => cursorRing.classList.add("is-hovering"));
  element.addEventListener("pointerleave", () => cursorRing.classList.remove("is-hovering"));
});

document.querySelectorAll("[data-cursor='view']").forEach((element) => {
  element.addEventListener("pointerenter", () => cursorRing.classList.add("is-view"));
  element.addEventListener("pointerleave", () => cursorRing.classList.remove("is-view"));
});

/* Magnetic controls */
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.16}px, ${y * 0.16}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

/* Click pulse shared by DOM and Three.js */
const clickFlash = document.querySelector(".click-flash");
window.addEventListener("pointerdown", (event) => {
  if (!body.classList.contains("site-ready")) return;
  clickFlash.style.left = `${event.clientX}px`;
  clickFlash.style.top = `${event.clientY}px`;
  clickFlash.classList.remove("is-active");
  void clickFlash.offsetWidth;
  clickFlash.classList.add("is-active");
  triggerPulse();
});

/* Hero rotating specialty */
const wordSwitch = document.querySelector("#wordSwitch");
const changingWord = document.querySelector("#changingWord");
const words = ["intelligent systems", "AI assistants", "digital products", "web experiences"];
let wordIndex = 0;

function cycleWord() {
  wordSwitch.classList.add("is-changing");
  window.setTimeout(() => {
    wordIndex = (wordIndex + 1) % words.length;
    changingWord.textContent = words[wordIndex];
  }, 210);
  window.setTimeout(() => wordSwitch.classList.remove("is-changing"), 470);
}

wordSwitch.addEventListener("click", cycleWord);
const wordTimer = window.setInterval(cycleWord, 3200);
wordSwitch.addEventListener("focus", () => window.clearInterval(wordTimer), { once: true });

/* Reveal and counters */
const revealItems = document.querySelectorAll("[data-reveal]");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.13, rootMargin: "0px 0px -5%" });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min((index % 4) * 55, 165)}ms`;
  revealObserver.observe(item);
});

function animateCount(element) {
  const targetValue = Number(element.dataset.count);
  const duration = reduceMotion ? 0 : 1300;
  const start = performance.now();

  function update(now) {
    const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    element.textContent = Math.round(targetValue * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.7 });

document.querySelectorAll("[data-count]").forEach((counter) => countObserver.observe(counter));

/* Scroll state, parallax and active navigation */
let lastScroll = 0;
let ticking = false;

function updateScrollState() {
  const current = window.scrollY;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  setScrollProgress(current / maxScroll);

  const sectionAtHeader = Array.from(document.querySelectorAll("main > section")).find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= 75 && rect.bottom > 75;
  });
  body.classList.toggle("header-light", Boolean(sectionAtHeader?.classList.contains("section-light")));

  siteHeader.classList.toggle("is-scrolled", current > 30);
  siteHeader.classList.toggle("is-hidden", current > lastScroll && current > 260 && !body.classList.contains("menu-open"));
  lastScroll = Math.max(current, 0);

  document.querySelectorAll("[data-speed]").forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const speed = Number(item.dataset.speed);
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
    item.style.transform = `translate3d(0, ${offset}px, 0)`;
  });

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollState);
    ticking = true;
  }
}, { passive: true });

const navLinks = document.querySelectorAll("[data-nav]");
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.nav === visible.target.id));
}, { threshold: [0.2, 0.45, 0.7], rootMargin: "-15% 0px -55%" });

document.querySelectorAll("main section[id]:not(#home)").forEach((section) => sectionObserver.observe(section));

/* Project card tilt and detail modal */
const projectModal = document.querySelector("#projectModal");
const modalClose = document.querySelector("#modalClose");
const modalIndex = document.querySelector("#modalIndex");
const modalType = document.querySelector("#modalType");
const modalTitle = document.querySelector("#modalTitle");
const modalLead = document.querySelector("#modalLead");
const modalFacts = document.querySelector("#modalFacts");
const modalGraphic = document.querySelector("#modalGraphic");

function openProject(key) {
  const project = projectData[key];
  if (!project) return;
  modalIndex.textContent = project.index;
  modalType.textContent = project.type;
  modalTitle.textContent = project.title;
  modalLead.textContent = project.lead;
  modalFacts.innerHTML = project.facts.map(([label, value]) => `<span>${label}<strong>${value}</strong></span>`).join("");
  modalGraphic.querySelector("strong").textContent = project.mark;
  modalGraphic.style.setProperty("--project-color", project.color);
  modalGraphic.querySelector("strong").style.color = project.color;
  body.classList.add("modal-open");
  projectModal.showModal();
}

function closeProject() {
  if (projectModal.open) projectModal.close();
}

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", () => openProject(card.dataset.project));

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1400px) rotateX(${-y * 3.5}deg) rotateY(${x * 3.5}deg)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = "perspective(1400px) rotateX(0) rotateY(0)"; });
  }
});

modalClose.addEventListener("click", closeProject);
projectModal.addEventListener("click", (event) => {
  if (event.target === projectModal) closeProject();
});
projectModal.addEventListener("close", () => body.classList.remove("modal-open"));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("menu-open")) setMenu(false);
});

/* Smooth anchors with fixed-header offset */
document.querySelectorAll("a[href^='#']").forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetElement = document.querySelector(anchor.getAttribute("href"));
    if (!targetElement) return;
    event.preventDefault();
    targetElement.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

updateScrollState();
