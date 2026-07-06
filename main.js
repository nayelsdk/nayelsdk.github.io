// =====================================================================
//  Interactions de la page. Tout reste lisible même sans JavaScript.
// =====================================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------
// 1) Bouton clair / sombre
//    (le thème initial est déjà posé par le petit script dans <head>)
// ---------------------------------------------------------------------
const toggle = document.getElementById("themeToggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

// ---------------------------------------------------------------------
// 2) Année automatique dans le pied de page
// ---------------------------------------------------------------------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------------------------------------------------------------------
// 3) Apparition des sections au défilement
// ---------------------------------------------------------------------
const revealEls = document.querySelectorAll(".reveal");

if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add("in-view"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ---------------------------------------------------------------------
// 4) Accordéons Expérience / Éducation
//    Le survol est géré en CSS ; ici on gère le clic / tap (utile sur
//    mobile où il n'y a pas de survol) qui fixe l'ouverture.
// ---------------------------------------------------------------------
document.querySelectorAll(".entry-head").forEach((head) => {
  head.addEventListener("click", (e) => {
    // Si on clique sur un lien (nom d'entreprise/école), on laisse le lien
    // s'ouvrir sans dérouler/replier l'entrée.
    if (e.target.closest("a")) return;
    const entry = head.parentElement;
    const open = entry.classList.toggle("open");
    const toggle = head.querySelector(".entry-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

// ---------------------------------------------------------------------
// 5) Lien de nav surligné selon la section visible (scroll-spy)
// ---------------------------------------------------------------------
const sections = document.querySelectorAll("section[id], header[id]");
const navLinks = document.querySelectorAll(".topnav-links a");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === "#" + id)
        );
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((section) => spyObserver.observe(section));
