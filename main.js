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
// Cascade : chaque ligne d'une liste apparaît avec un léger décalage
document.querySelectorAll(".timeline").forEach((list) => {
  list.querySelectorAll(".entry").forEach((el, i) => {
    el.style.setProperty("--d", i * 80 + "ms");
  });
});

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

// ---------------------------------------------------------------------
// 6) Modale (fiche détaillée du projet Boreas)
// ---------------------------------------------------------------------
let modalLastFocus = null;
let savedScrollY = 0;

// Verrou de scroll robuste (iOS compris) : on fige le body et on restaure
// la position exacte à la fermeture, pour que le fond ne bouge pas.
function lockScroll() {
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}
function unlockScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, savedScrollY);
}

document.querySelectorAll("[data-modal]").forEach((trigger) => {
  const modal = document.getElementById(trigger.getAttribute("data-modal"));
  if (!modal) return;
  const openModal = () => {
    modalLastFocus = trigger;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    lockScroll();
    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  };
  trigger.addEventListener("click", openModal);
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(); }
  });
});

document.querySelectorAll(".modal").forEach((modal) => {
  const box = modal.querySelector(".modal-box");
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (box) { box.style.transform = ""; box.style.transition = ""; }
    unlockScroll();
    if (modalLastFocus) modalLastFocus.focus({ preventScroll: true });
  };
  // Fermeture : bouton ×, clic sur le fond
  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  // Fermeture : touche Échap
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  // Mobile : glisser la modale vers le bas pour la fermer (geste « bottom sheet »)
  if (box) {
    let startY = 0, dy = 0, dragging = false;
    box.addEventListener("touchstart", (e) => {
      if (window.innerWidth > 720) return;
      startY = e.touches[0].clientY; dy = 0; dragging = true;
      box.style.transition = "none";
    }, { passive: true });
    box.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      dy = e.touches[0].clientY - startY;
      const scroller = e.target.closest(".modal-body, .modal-art");
      const atTop = !scroller || scroller.scrollTop <= 0;
      if (dy > 0 && atTop) {
        box.style.transform = `translateY(${dy}px)`;
        if (e.cancelable) e.preventDefault();   // on glisse la feuille au lieu de scroller
      } else {
        box.style.transform = "";
      }
    }, { passive: false });
    box.addEventListener("touchend", () => {
      if (!dragging) return; dragging = false;
      box.style.transition = "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)";
      if (dy > 110) closeModal();
      else box.style.transform = "";
    });
  }
});
