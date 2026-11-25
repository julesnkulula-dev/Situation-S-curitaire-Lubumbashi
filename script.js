// Niveaux : 1 = faible, 2 = moyen, 3 = élevé. Ordre : [matin, midi, soir, nuit]
// ⚠️ Données d'exemple (positions approximatives) : remplacez-les par des sources fiables.
const ZONES = [
  { nom: "Gare centrale",            lat: -11.6609, lng: 27.4797, r: [2, 2, 2, 3] },
  { nom: "Centre-ville (Av. Lomami)",lat: -11.6647, lng: 27.4794, r: [1, 1, 2, 3] },
  { nom: "Marché de la Kenya",       lat: -11.6760, lng: 27.4980, r: [2, 3, 3, 3] },
  { nom: "Marché Central Kamalondo", lat: -11.6520, lng: 27.4680, r: [2, 3, 3, 3] },
  { nom: "Ruashi",                   lat: -11.6140, lng: 27.5260, r: [1, 2, 2, 3] },
  { nom: "Katuba",                   lat: -11.7000, lng: 27.4600, r: [1, 2, 2, 3] },
  { nom: "Kampemba",                 lat: -11.6800, lng: 27.4550, r: [1, 1, 2, 2] },
  { nom: "Université de Lubumbashi", lat: -11.6125, lng: 27.4800, r: [1, 1, 1, 2] },
  { nom: "Aéroport de Luano",        lat: -11.5913, lng: 27.5309, r: [1, 1, 1, 2] }
];

const NOMS = ["matin", "midi", "soir", "nuit"];
const COULEURS = { 1: "#2e9e5b", 2: "#e8a317", 3: "#d6322e" };
const LIBELLES = { 1: "Faible", 2: "Moyen", 3: "Élevé" };

// Zones ajoutées par l'utilisateur, conservées dans le navigateur
try { ZONES.push(...JSON.parse(localStorage.getItem("zones_perso") || "[]")); } catch (e) {}

const carte = L.map("carte").setView([-11.6647, 27.4794], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© contributeurs OpenStreetMap"
}).addTo(carte);

const calque = L.layerGroup().addTo(carte);
const liste = document.getElementById("liste");
let periode = 0;

function popup(z) {
  const lignes = z.r.map((n, i) =>
    `<div>${i === periode ? "<b>" : ""}${NOMS[i]} : ${LIBELLES[n]}${i === periode ? "</b>" : ""}</div>`
  ).join("");
  return `<strong>${z.nom}</strong>${lignes}`;
}

function afficher() {
  calque.clearLayers();
  liste.innerHTML = "";
  ZONES.forEach(z => {
    const n = z.r[periode], c = COULEURS[n];
    const cercle = L.circle([z.lat, z.lng], {
      radius: 450 + n * 150, color: c, fillColor: c, fillOpacity: 0.3, weight: 2
    }).bindPopup(popup(z)).addTo(calque);

    const li = document.createElement("li");
    li.innerHTML = `<b>${z.nom}</b><span class="pastille" style="background:${c}" title="${LIBELLES[n]}"></span>`;
    li.onclick = () => { carte.flyTo([z.lat, z.lng], 15); cercle.openPopup(); };
    liste.appendChild(li);
  });
}

document.querySelectorAll("#periodes button").forEach(b => {
  b.onclick = () => {
    document.querySelector("#periodes .actif").classList.remove("actif");
    b.classList.add("actif");
    periode = +b.dataset.p;
    afficher();
  };
});

// Signaler un nouveau lieu en cliquant sur la carte
const btn = document.getElementById("btnSignaler");
let mode = false;
btn.onclick = () => {
  mode = !mode;
  btn.classList.toggle("on", mode);
  document.body.classList.toggle("signalement", mode);
  btn.textContent = mode ? "Touchez la carte…" : "+ Signaler un lieu";
};

carte.on("click", e => {
  if (!mode) return;
  const nom = prompt("Nom du lieu :");
  if (!nom) return;
  const r = NOMS.map(m => {
    const v = parseInt(prompt(`Risque le ${m} : 1 = faible, 2 = moyen, 3 = élevé`, "2"), 10);
    return [1, 2, 3].includes(v) ? v : 2;
  });
  const z = { nom, lat: e.latlng.lat, lng: e.latlng.lng, r };
  ZONES.push(z);
  try {
    const perso = JSON.parse(localStorage.getItem("zones_perso") || "[]");
    perso.push(z);
    localStorage.setItem("zones_perso", JSON.stringify(perso));
  } catch (err) {}
  btn.click();
  afficher();
});

// Période initiale selon l'heure actuelle
const h = new Date().getHours();
periode = h >= 5 && h < 11 ? 0 : h >= 11 && h < 16 ? 1 : h >= 16 && h < 21 ? 2 : 3;
document.querySelectorAll("#periodes button")[periode].click();
