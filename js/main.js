// ============================================================
// Mis XV Años · Mayte Bohorquez Sellán
// Animaciones con Motion (https://motion.dev) vía CDN (jsdelivr, +esm)
// ============================================================

import { animate, inView, scroll } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

// ------------------------------------------------------------
// CONFIGURACIÓN EDITABLE — reemplaza estos valores con los datos reales
// ------------------------------------------------------------
const CONFIG = {
  // Fecha y hora reales del evento (zona horaria Ecuador, UTC-5)
  eventDateISO: "2026-10-09T19:00:00-05:00",
  // Número de WhatsApp de los papás para recibir las confirmaciones.
  // Formato: código de país + número, SIN "+", sin espacios ni guiones. Ej: "593987654321"
  whatsappNumber: "593000000000",
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ------------------------------------------------------------
// Loader
// ------------------------------------------------------------
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;
  if (prefersReducedMotion) {
    loader.style.display = "none";
    return;
  }
  animate(loader, { opacity: [1, 0] }, { duration: 0.6, easing: "ease-out" }).finished.then(() => {
    loader.style.display = "none";
  });
});

// ------------------------------------------------------------
// Reveal animations on scroll (Motion inView) — entrada y salida
// combinando blur + escala + rotación alternada por elemento
// ------------------------------------------------------------
const panels = document.querySelectorAll("[data-panel]");
const EASE_IN = [0.16, 1, 0.3, 1];

function revealIn(items) {
  items.forEach((el, i) => {
    const dir = i % 2 === 0 ? -26 : 26;
    animate(
      el,
      {
        opacity: [0, 1],
        y: [34, 0],
        x: [dir, 0],
        scale: [0.86, 1],
        rotate: [i % 2 === 0 ? -3 : 3, 0],
        filter: ["blur(8px)", "blur(0px)"],
      },
      { duration: 0.9, delay: i * 0.08, easing: EASE_IN }
    );
  });
}

function revealOut(items) {
  items.forEach((el, i) => {
    animate(
      el,
      {
        opacity: [1, 0],
        y: [0, -22],
        scale: [1, 0.92],
        filter: ["blur(0px)", "blur(6px)"],
      },
      { duration: 0.45, delay: i * 0.02, easing: "ease-in" }
    );
  });
}

if (prefersReducedMotion) {
  document.querySelectorAll(".reveal").forEach((el) => { el.style.opacity = 1; el.style.filter = "none"; });
} else {
  panels.forEach((panel) => {
    const items = Array.from(panel.querySelectorAll(".reveal"));
    if (!items.length) return;
    inView(
      panel,
      () => {
        revealIn(items);
        return () => revealOut(items);
      },
      { amount: 0.35 }
    );
  });
}

// ------------------------------------------------------------
// Parallax de fondo ligado al scroll (Motion `scroll`)
// Cada panel gana dos "blobs" decorativos que se desplazan y
// escalan en función del progreso de scroll dentro de esa sección
// ------------------------------------------------------------
if (!prefersReducedMotion) {
  panels.forEach((panel) => {
    const blobA = document.createElement("span");
    blobA.className = "blob blob--a";
    blobA.setAttribute("aria-hidden", "true");
    const blobB = document.createElement("span");
    blobB.className = "blob blob--b";
    blobB.setAttribute("aria-hidden", "true");
    panel.prepend(blobB);
    panel.prepend(blobA);

    scroll(animate(blobA, { y: [-50, 50], scale: [1, 1.18] }), {
      target: panel,
      offset: ["start end", "end start"],
    });
    scroll(animate(blobB, { y: [60, -40], scale: [1.15, 0.9] }), {
      target: panel,
      offset: ["start end", "end start"],
    });
  });
}

// ------------------------------------------------------------
// Navegación por puntos + scroll a sección
// ------------------------------------------------------------
const scroller = document.getElementById("scroller");
const navLinks = document.querySelectorAll("[data-nav]");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.target);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const dotMap = {};
document.querySelectorAll(".dotnav__dot").forEach((dot) => {
  dotMap[dot.dataset.target] = dot;
});

if (scroller && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          Object.values(dotMap).forEach((d) => d.classList.remove("is-active"));
          const dot = dotMap[entry.target.id];
          if (dot) dot.classList.add("is-active");
        }
      });
    },
    { root: scroller, threshold: 0.6 }
  );
  panels.forEach((p) => sectionObserver.observe(p));
}

// ------------------------------------------------------------
// Feedback táctil en botones (Motion press animation)
// ------------------------------------------------------------
if (!prefersReducedMotion) {
  const pressableEls = document.querySelectorAll(".btn, .playbtn, .musicfab, .dotnav__dot");
  pressableEls.forEach((el) => {
    const down = () => animate(el, { scale: 0.94 }, { duration: 0.12, easing: "ease-out" });
    const up = () => animate(el, { scale: 1 }, { duration: 0.25, easing: "ease-out" });
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
  });
}

// ------------------------------------------------------------
// Cuenta regresiva
// ------------------------------------------------------------
const EVENT_DATE = new Date(CONFIG.eventDateISO);
const cdEls = {
  days: document.querySelector('[data-cd="days"]'),
  hours: document.querySelector('[data-cd="hours"]'),
  minutes: document.querySelector('[data-cd="minutes"]'),
  seconds: document.querySelector('[data-cd="seconds"]'),
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const diff = EVENT_DATE.getTime() - Date.now();

  if (diff <= 0) {
    Object.values(cdEls).forEach((el) => { if (el) el.textContent = "00"; });
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (cdEls.days) cdEls.days.textContent = pad(days);
  if (cdEls.hours) cdEls.hours.textContent = pad(hours);
  if (cdEls.minutes) cdEls.minutes.textContent = pad(minutes);

  if (cdEls.seconds) {
    const next = pad(seconds);
    if (cdEls.seconds.textContent !== next) {
      cdEls.seconds.textContent = next;
      if (!prefersReducedMotion) {
        animate(cdEls.seconds, { scale: [1.3, 1] }, { duration: 0.35, easing: "ease-out" });
      }
    }
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ------------------------------------------------------------
// Agregar al calendario (.ics)
// ------------------------------------------------------------
const addCalendarBtn = document.getElementById("addCalendarBtn");
if (addCalendarBtn) {
  addCalendarBtn.addEventListener("click", () => {
    const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mis XV Anos Mayte//ES",
      "BEGIN:VEVENT",
      `UID:mayte-xv-${Date.now()}@invitacion`,
      `DTSTAMP:${dtStamp}`,
      "DTSTART;TZID=America/Guayaquil:20261009T190000",
      "DTEND;TZID=America/Guayaquil:20261009T230000",
      "SUMMARY:XV Anos de Mayte Bohorquez Sellan",
      "DESCRIPTION:¡Celebra conmigo mis quince anos!",
      "LOCATION:Salon [Nombre del Lugar]\\, Quito\\, Ecuador",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "XV-Mayte.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// ------------------------------------------------------------
// Reproductor de música favorita
// ------------------------------------------------------------
const audio = document.getElementById("bgAudio");
const playBtn = document.getElementById("playBtn");
const musicFab = document.getElementById("musicFab");
const songCaption = document.getElementById("songCaption");

function setPlayingState(isPlaying) {
  if (playBtn) playBtn.classList.toggle("is-playing", isPlaying);
  if (musicFab) musicFab.classList.toggle("is-playing", isPlaying);
  musicFab?.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
  if (songCaption) songCaption.textContent = isPlaying ? "Reproduciendo…" : "Presiona para escuchar";
}

function togglePlay() {
  if (!audio) return;
  if (audio.paused) {
    audio
      .play()
      .then(() => setPlayingState(true))
      .catch(() => {
        if (songCaption) songCaption.textContent = "Agrega el archivo MP3 en assets/audio/";
      });
  } else {
    audio.pause();
    setPlayingState(false);
  }
}

playBtn?.addEventListener("click", togglePlay);
musicFab?.addEventListener("click", togglePlay);
audio?.addEventListener("pause", () => setPlayingState(false));
audio?.addEventListener("play", () => setPlayingState(true));
audio?.addEventListener("error", () => {
  if (songCaption) songCaption.textContent = "Agrega el archivo MP3 en assets/audio/";
});

// ------------------------------------------------------------
// Formulario de confirmación de asistencia (RSVP)
// Guardado local (localStorage) + bloqueo de reenvío por dispositivo
// ------------------------------------------------------------
const SUBMIT_KEY = "mayteXV_rsvp_submitted_v1";
const DATA_KEY = "mayteXV_rsvp_entries_v1";

const rsvpForm = document.getElementById("rsvpForm");
const rsvpThanks = document.getElementById("rsvpThanks");
const rsvpThanksText = document.getElementById("rsvpThanksText");
const whatsappBtn = document.getElementById("whatsappBtn");

function buildWhatsappLink(entry) {
  const lines = [
    "¡Hola! Confirmo mi asistencia a los XV años de Mayte 🌸",
    `Nombre: ${entry.fullName}`,
    `Asistentes: ${entry.guestCount}`,
    `Mensaje: ${entry.message || "-"}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function showThanks(entry) {
  if (rsvpForm) rsvpForm.hidden = true;
  if (rsvpThanks) rsvpThanks.hidden = false;

  if (entry && rsvpThanksText) {
    const plural = Number(entry.guestCount) > 1 ? "personas" : "persona";
    rsvpThanksText.textContent = `Tu asistencia (${entry.guestCount} ${plural}) ha sido registrada. ¡Nos vemos en la fiesta!`;
  }
  if (entry && whatsappBtn) {
    whatsappBtn.href = buildWhatsappLink(entry);
  }

  if (rsvpThanks && !prefersReducedMotion) {
    animate(rsvpThanks, { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
  }
}

// Si este dispositivo ya confirmó, mostrar directamente el mensaje de gracias
if (localStorage.getItem(SUBMIT_KEY) === "1") {
  const entries = JSON.parse(localStorage.getItem(DATA_KEY) || "[]");
  showThanks(entries[entries.length - 1] || null);
}

rsvpForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  if (localStorage.getItem(SUBMIT_KEY) === "1") return;

  const fullName = rsvpForm.fullName.value.trim();
  const guestCount = Math.max(1, parseInt(rsvpForm.guestCount.value, 10) || 1);
  const message = rsvpForm.message.value.trim();

  if (!fullName) {
    rsvpForm.fullName.focus();
    return;
  }

  const entry = {
    fullName,
    guestCount,
    message,
    submittedAt: new Date().toISOString(),
  };

  const entries = JSON.parse(localStorage.getItem(DATA_KEY) || "[]");
  entries.push(entry);
  localStorage.setItem(DATA_KEY, JSON.stringify(entries));
  localStorage.setItem(SUBMIT_KEY, "1");

  showThanks(entry);
  window.open(buildWhatsappLink(entry), "_blank", "noopener");
});
