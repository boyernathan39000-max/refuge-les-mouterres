/* Refuge les Mouterres - comportements de la page */

(function () {
  "use strict";

  /* ---- Page d ouverture : elle remonte au bout de 1,5 s ---- */
  var ouverture = document.getElementById("ouverture");
  if (ouverture) {
    setTimeout(function () {
      document.body.classList.remove("ouverture-en-cours");
    }, 1500);
    setTimeout(function () {
      ouverture.classList.add("enlevee");
    }, 2600);
  }

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

  /* ---- Héros : une image toutes les 3 secondes ---- */
  var fonds = Array.prototype.slice.call(document.querySelectorAll("#fonds figure"));
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

  /* ---- Bande d avis : on force un redessin au retour sur l onglet ----
     Un onglet laisse en arriere-plan peut revenir avec la bande non redessinee.
     Ce coup de pouce ne touche ni a l animation ni a la position. */
  var bandeAvis = document.querySelector(".bande-avis");
  function redessinerBande() {
    if (!bandeAvis || document.hidden) return;
    bandeAvis.style.opacity = "0.999";
    requestAnimationFrame(function () {
      bandeAvis.style.opacity = "";
    });
  }
  document.addEventListener("visibilitychange", redessinerBande);
  window.addEventListener("pageshow", redessinerBande);

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

  /* ---- Formulaire de question ---- */
  var formulaire = document.getElementById("formulaire");
  var retour = document.getElementById("retour-formulaire");
  formulaire.addEventListener("submit", function (e) {
    e.preventDefault();
    retour.textContent = "Votre question part au refuge. La gardienne vous répond sous 48 h.";
    retour.style.display = "block";
    formulaire.querySelector("button[type=submit]").textContent = "Question envoyée";
  });

  /* =================================================================
     Panneau de réservation (démonstration, première étape seulement)
     ================================================================= */
  var panneau = document.getElementById("panneau");
  var voile = document.getElementById("voile");
  var grille = document.getElementById("grille");
  var titreMois = document.getElementById("mois-titre");
  var choixDates = document.getElementById("choix-dates");
  var retourPanneau = document.getElementById("retour-panneau");
  var boutonAvant = document.getElementById("mois-avant");
  var boutonApres = document.getElementById("mois-apres");

  var MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
              "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  // Saison de démonstration : du 15 juin au 15 septembre 2027.
  var SAISON = { annee: 2027, debut: new Date(2027, 5, 15), fin: new Date(2027, 8, 15) };
  var COMPLET = { "2027-6-12": 1, "2027-6-13": 1, "2027-6-18": 1, "2027-6-19": 1,
                  "2027-6-25": 1, "2027-7-1": 1, "2027-7-8": 1, "2027-7-15": 1 };

  var moisVu = 6; // juillet
  var arrivee = null;
  var depart = null;

  function cle(annee, mois, jour) {
    return annee + "-" + mois + "-" + jour;
  }

  function dessinerMois() {
    titreMois.textContent = MOIS[moisVu] + " " + SAISON.annee;
    boutonAvant.disabled = moisVu <= 5;
    boutonApres.disabled = moisVu >= 8;
    grille.innerHTML = "";

    var premier = new Date(SAISON.annee, moisVu, 1);
    var decalage = (premier.getDay() + 6) % 7; // lundi en premier
    var nbJours = new Date(SAISON.annee, moisVu + 1, 0).getDate();

    for (var v = 0; v < decalage; v++) {
      var vide = document.createElement("span");
      vide.className = "vide";
      grille.appendChild(vide);
    }
    for (var j = 1; j <= nbJours; j++) {
      var date = new Date(SAISON.annee, moisVu, j);
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = j;
      b.dataset.jour = j;

      if (date < SAISON.debut || date > SAISON.fin) {
        b.disabled = true;
      } else if (COMPLET[cle(SAISON.annee, moisVu, j)]) {
        b.disabled = true;
        b.classList.add("complet");
      } else {
        b.addEventListener("click", choisirJour);
      }
      if (arrivee && arrivee.mois === moisVu && arrivee.jour === j) b.classList.add("choisi");
      if (depart && depart.mois === moisVu && depart.jour === j) b.classList.add("choisi");
      if (arrivee && depart && moisVu === arrivee.mois && j > arrivee.jour && j < depart.jour) {
        b.classList.add("entre");
      }
      grille.appendChild(b);
    }
  }

  function choisirJour(e) {
    var j = Number(e.currentTarget.dataset.jour);
    if (!arrivee || depart) {
      arrivee = { mois: moisVu, jour: j };
      depart = null;
    } else if (moisVu === arrivee.mois && j > arrivee.jour) {
      depart = { mois: moisVu, jour: j };
    } else {
      arrivee = { mois: moisVu, jour: j };
      depart = null;
    }
    dessinerMois();
    majTexteDates();
  }

  function majTexteDates() {
    if (arrivee && depart) {
      var nuits = depart.jour - arrivee.jour;
      choixDates.textContent =
        "Du " + arrivee.jour + " au " + depart.jour + " " + MOIS[depart.mois].toLowerCase() +
        ", " + nuits + (nuits > 1 ? " nuits." : " nuit.");
    } else if (arrivee) {
      choixDates.textContent =
        "Arrivée le " + arrivee.jour + " " + MOIS[arrivee.mois].toLowerCase() +
        ". Choisissez votre date de départ.";
    } else {
      choixDates.textContent = "Choisissez votre date d'arrivée.";
    }
  }

  boutonAvant.addEventListener("click", function () {
    if (moisVu > 5) { moisVu--; dessinerMois(); }
  });
  boutonApres.addEventListener("click", function () {
    if (moisVu < 8) { moisVu++; dessinerMois(); }
  });

  /* Compteurs de personnes */
  document.querySelectorAll(".compteur-boutons button").forEach(function (b) {
    b.addEventListener("click", function () {
      var sortie = document.getElementById(b.dataset.cible);
      var mini = b.dataset.cible === "adultes" ? 1 : 0;
      var valeur = Number(sortie.textContent) + Number(b.dataset.pas);
      sortie.textContent = Math.max(mini, Math.min(25, valeur));
    });
  });

  /* Ouverture et fermeture */
  function ouvrirPanneau() {
    voile.hidden = false;
    requestAnimationFrame(function () {
      voile.classList.add("vu");
      panneau.classList.add("ouvert");
    });
    panneau.setAttribute("aria-hidden", "false");
    document.body.classList.add("panneau-ouvert");
    document.getElementById("fermer-panneau").focus();
  }
  function fermerPanneau() {
    panneau.classList.remove("ouvert");
    voile.classList.remove("vu");
    panneau.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panneau-ouvert");
    setTimeout(function () { voile.hidden = true; }, 320);
  }

  document.querySelectorAll("[data-reserver]").forEach(function (b) {
    b.addEventListener("click", ouvrirPanneau);
  });
  document.getElementById("fermer-panneau").addEventListener("click", fermerPanneau);
  voile.addEventListener("click", fermerPanneau);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panneau.classList.contains("ouvert")) fermerPanneau();
  });

  /* La démonstration s'arrête à la première étape */
  document.getElementById("valider-dates").addEventListener("click", function () {
    if (!arrivee || !depart) {
      retourPanneau.textContent = "Choisissez d'abord vos dates d'arrivée et de départ.";
      return;
    }
    retourPanneau.textContent =
      "La suite de la réservation se poursuit dans votre espace de gestion : " +
      "formule, coordonnées, puis confirmation.";
  });

  dessinerMois();
})();
