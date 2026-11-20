/* Refuge les Mouterres - comportements de la page */

(function () {
  "use strict";

  /* ---- Menu qui se pose au défilement ---- */
  var menu = document.getElementById("menu");
  function poserMenu() {
    menu.classList.toggle("pose", window.scrollY > 40);
  }
  poserMenu();
  window.addEventListener("scroll", poserMenu, { passive: true });

  /* ---- Menu du téléphone ---- */
  var burger = document.getElementById("burger");
  var liens = document.getElementById("liens");
  burger.addEventListener("click", function () {
    var ouvert = liens.classList.toggle("ouvert");
    burger.setAttribute("aria-expanded", ouvert ? "true" : "false");
    burger.textContent = ouvert ? "✕" : "☰";
  });
  liens.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      liens.classList.remove("ouvert");
      burger.setAttribute("aria-expanded", "false");
      burger.textContent = "☰";
    });
  });

  /* ---- Héros : une image toutes les 5 secondes ---- */
  var fonds = Array.prototype.slice.call(
    document.querySelectorAll("#fonds figure")
  );
  var points = document.getElementById("points");
  var courant = 0;
  var minuteur;

  fonds.forEach(function (_, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Photo " + (i + 1));
    if (i === 0) b.classList.add("actif");
    b.addEventListener("click", function () {
      afficher(i);
      relancer();
    });
    points.appendChild(b);
  });

  function afficher(i) {
    courant = (i + fonds.length) % fonds.length;
    fonds.forEach(function (f, j) {
      f.classList.toggle("vu", j === courant);
    });
    points.querySelectorAll("button").forEach(function (b, j) {
      b.classList.toggle("actif", j === courant);
    });
  }
  function relancer() {
    clearInterval(minuteur);
    minuteur = setInterval(function () {
      afficher(courant + 1);
    }, 3000);
  }
  if (fonds.length > 1) relancer();

  /* ---- Apparitions au défilement ---- */
  var aMonter = document.querySelectorAll(".monte");
  if ("IntersectionObserver" in window) {
    var guetteur = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("vu");
            guetteur.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    aMonter.forEach(function (el) {
      guetteur.observe(el);
    });
  } else {
    aMonter.forEach(function (el) {
      el.classList.add("vu");
    });
  }

  /* ---- Formulaire de la maquette ---- */
  var formulaire = document.getElementById("formulaire");
  var retour = document.getElementById("retour-formulaire");
  formulaire.addEventListener("submit", function (e) {
    e.preventDefault();
    retour.textContent =
      "Votre demande part au refuge. La gardienne vous répond sous 48 h.";
    retour.style.display = "block";
    formulaire.querySelector("button[type=submit]").textContent = "Demande envoyée";
  });
})();
