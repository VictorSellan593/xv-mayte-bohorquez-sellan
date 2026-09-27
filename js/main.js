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
  whatsappNumber: "593962735327",
  // Datos de la canción que se muestran en el reproductor
  songTitle: "Mi canción favorita",
  songArtist: "Mayte · XV Años",
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
  const pressableEls = document.querySelectorAll(".btn, .player__play, .musicfab, .dotnav__dot");
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
      "LOCATION:Salon Princess\\, Av. Guillermo Pareja Rolando\\, La Garzota\\, Guayaquil\\, Ecuador",
      "GEO:-2.1502111;-79.8926848",
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
// Reproductor de música favorita (estilo Spotify) + autoplay
// ------------------------------------------------------------
const audio = document.getElementById("bgAudio");
const playBtn = document.getElementById("playBtn");
const musicFab = document.getElementById("musicFab");
const songCaption = document.getElementById("songCaption");
const seekBar = document.getElementById("seekBar");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");
const backBtn = document.getElementById("backBtn");
const fwdBtn = document.getElementById("fwdBtn");
const repeatBtn = document.getElementById("repeatBtn");
const muteBtn = document.getElementById("muteBtn");
const likeBtn = document.getElementById("likeBtn");

const songTitleEl = document.getElementById("songTitle");
const songArtistEl = document.getElementById("songArtist");
if (songTitleEl && CONFIG.songTitle) songTitleEl.textContent = CONFIG.songTitle;
if (songArtistEl && CONFIG.songArtist) songArtistEl.textContent = CONFIG.songArtist;

const MISSING_AUDIO_MSG = "Agrega el archivo MP3 en assets/audio/";
let isSeeking = false;

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setPlayingState(isPlaying) {
  playBtn?.classList.toggle("is-playing", isPlaying);
  playBtn?.setAttribute("aria-label", isPlaying ? "Pausar canción" : "Reproducir canción");
  musicFab?.classList.toggle("is-playing", isPlaying);
  musicFab?.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
  if (songCaption) songCaption.textContent = isPlaying ? "Reproduciendo…" : "Presiona play para escuchar";
}

function updateProgress() {
  if (!audio || !seekBar) return;
  const duration = audio.duration || 0;
  const pct = duration ? (audio.currentTime / duration) * 100 : 0;
  if (!isSeeking) seekBar.value = pct;
  seekBar.style.setProperty("--pct", `${isSeeking ? seekBar.value : pct}%`);
  if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
  if (timeTotal) timeTotal.textContent = formatTime(duration);
}

function playAudio() {
  if (!audio) return Promise.resolve();
  return audio.play().catch((err) => {
    if (err?.name !== "NotAllowedError" && songCaption) songCaption.textContent = MISSING_AUDIO_MSG;
    throw err;
  });
}

function togglePlay() {
  if (!audio) return;
  if (audio.paused) playAudio().catch(() => {});
  else audio.pause();
}

playBtn?.addEventListener("click", togglePlay);
musicFab?.addEventListener("click", togglePlay);
audio?.addEventListener("pause", () => setPlayingState(false));
audio?.addEventListener("play", () => setPlayingState(true));
audio?.addEventListener("timeupdate", updateProgress);
audio?.addEventListener("loadedmetadata", updateProgress);
audio?.addEventListener("error", () => {
  if (songCaption) songCaption.textContent = MISSING_AUDIO_MSG;
});

seekBar?.addEventListener("input", () => {
  isSeeking = true;
  seekBar.style.setProperty("--pct", `${seekBar.value}%`);
  if (timeCurrent && audio?.duration) timeCurrent.textContent = formatTime((seekBar.value / 100) * audio.duration);
});
seekBar?.addEventListener("change", () => {
  if (audio?.duration) audio.currentTime = (seekBar.value / 100) * audio.duration;
  isSeeking = false;
  updateProgress();
});

backBtn?.addEventListener("click", () => {
  if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
});
fwdBtn?.addEventListener("click", () => {
  if (audio?.duration) audio.currentTime = Math.min(audio.duration - 0.1, audio.currentTime + 10);
});

repeatBtn?.addEventListener("click", () => {
  if (!audio) return;
  audio.loop = !audio.loop;
  repeatBtn.classList.toggle("is-on", audio.loop);
  repeatBtn.setAttribute("aria-pressed", String(audio.loop));
});

muteBtn?.addEventListener("click", () => {
  if (!audio) return;
  audio.muted = !audio.muted;
  muteBtn.classList.toggle("is-muted", audio.muted);
  muteBtn.setAttribute("aria-label", audio.muted ? "Activar sonido" : "Silenciar");
});

likeBtn?.addEventListener("click", () => {
  const liked = !likeBtn.classList.contains("is-on");
  likeBtn.classList.toggle("is-on", liked);
  likeBtn.setAttribute("aria-pressed", String(liked));
  if (liked && !prefersReducedMotion) {
    animate(likeBtn, { scale: [1, 1.3, 1] }, { duration: 0.35, easing: "ease-out" });
  }
});

// Autoplay: se intenta reproducir al cargar la página. Los navegadores
// bloquean el audio con sonido hasta que el invitado interactúa, así que
// si se bloquea, la música arranca en el primer toque, clic o tecla.
const UNLOCK_EVENTS = ["pointerdown", "touchstart", "keydown"];
function removeUnlockListeners() {
  UNLOCK_EVENTS.forEach((ev) => document.removeEventListener(ev, unlockAudio, true));
}
function unlockAudio(e) {
  removeUnlockListeners();
  // Si el primer toque fue sobre un control de música, ese control decide
  if (e.target.closest?.("#playBtn, #musicFab")) return;
  if (audio?.paused) playAudio().catch(() => {});
}
if (audio) {
  playAudio().catch(() => {
    UNLOCK_EVENTS.forEach((ev) => document.addEventListener(ev, unlockAudio, { capture: true }));
  });
  audio.addEventListener("play", removeUnlockListeners, { once: true });
}

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

const rsvpThanksTitle = document.getElementById("rsvpThanksTitle");
const rsvpResetBtn = document.getElementById("rsvpResetBtn");

// localStorage puede fallar (modo privado, datos bloqueados): nunca debe romper la página
function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// Devuelve la confirmación guardada en este dispositivo, o null si no hay una válida
function getSavedEntry() {
  if (storageGet(SUBMIT_KEY) !== "1") return null;
  try {
    const entries = JSON.parse(storageGet(DATA_KEY) || "[]");
    const last = entries[entries.length - 1];
    return last && typeof last.fullName === "string" && last.fullName.trim() ? last : null;
  } catch {
    return null;
  }
}

function showThanks(entry) {
  if (rsvpForm) rsvpForm.hidden = true;
  if (rsvpThanks) rsvpThanks.hidden = false;

  const firstName = entry.fullName.trim().split(/\s+/)[0];
  if (rsvpThanksTitle) rsvpThanksTitle.textContent = `¡Gracias por confirmar, ${firstName}!`;
  if (rsvpThanksText) {
    const plural = Number(entry.guestCount) > 1 ? "personas" : "persona";
    rsvpThanksText.textContent = `Tu asistencia (${entry.guestCount} ${plural}) ha sido registrada. ¡Nos vemos en la fiesta!`;
  }
  if (rsvpResetBtn) rsvpResetBtn.textContent = `¿No eres ${firstName}? Confirmar otra asistencia`;
  if (whatsappBtn) whatsappBtn.href = buildWhatsappLink(entry);

  if (rsvpThanks && !prefersReducedMotion) {
    animate(rsvpThanks, { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
  }
}

function showForm() {
  if (rsvpThanks) rsvpThanks.hidden = true;
  if (rsvpForm) {
    rsvpForm.reset();
    rsvpForm.hidden = false;
    rsvpForm.fullName.focus({ preventScroll: true });
  }
}

// Si este dispositivo ya confirmó, mostrar el mensaje de gracias; si los datos
// guardados están incompletos o dañados, se descartan y se muestra el formulario
const savedEntry = getSavedEntry();
if (savedEntry) {
  showThanks(savedEntry);
} else {
  storageRemove(SUBMIT_KEY);
}

// Evita que un Enter en los campos de texto envíe el formulario por accidente;
// solo se confirma con el botón "Confirmar asistencia"
rsvpForm?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
});

rsvpResetBtn?.addEventListener("click", () => {
  storageRemove(SUBMIT_KEY);
  showForm();
});

rsvpForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  if (getSavedEntry()) return;

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

  let entries = [];
  try {
    entries = JSON.parse(storageGet(DATA_KEY) || "[]");
  } catch {}
  entries.push(entry);
  storageSet(DATA_KEY, JSON.stringify(entries));
  storageSet(SUBMIT_KEY, "1");

  showThanks(entry);
  window.open(buildWhatsappLink(entry), "_blank", "noopener");
});
