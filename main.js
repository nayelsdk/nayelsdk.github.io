// =====================================================================
//  Petit script pour les touches interactives de la page.
//  Tout est « progressif » : si le JS ne charge pas, le site reste lisible.
// =====================================================================

// L'utilisateur préfère-t-il moins d'animations ? (réglage système)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------
// 1) Année automatique dans le pied de page
// ---------------------------------------------------------------------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------------------------------------------------------------------
// 2) Apparition des sections au défilement (fade + montée)
// ---------------------------------------------------------------------
const revealEls = document.querySelectorAll(".reveal");

if (reduceMotion) {
  // Pas d'animation : on affiche tout directement
  revealEls.forEach((el) => el.classList.add("in-view"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target); // une seule fois suffit
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ---------------------------------------------------------------------
// 3) Navigation « scroll-spy » : surligne le lien de la section visible
// ---------------------------------------------------------------------
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + id
          );
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" } // « active » quand la section est au milieu
);
sections.forEach((section) => spyObserver.observe(section));

// ---------------------------------------------------------------------
// 4) Halo lumineux qui suit la souris
// ---------------------------------------------------------------------
if (!reduceMotion) {
  const spotlight = document.querySelector(".spotlight");
  window.addEventListener("pointermove", (e) => {
    spotlight.style.setProperty("--mx", e.clientX + "px");
    spotlight.style.setProperty("--my", e.clientY + "px");
  });
}
