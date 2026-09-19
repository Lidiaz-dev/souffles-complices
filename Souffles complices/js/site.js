// Fonctions partagées par toutes les pages du site.

function fetchJSON(path) {
  return fetch(path, { cache: 'no-cache' }).then(r => r.json());
}

// Accepte "1998", "1998-06-24" ou "24/06/1998". Avec la date exacte, l'âge change le jour de l'anniversaire.
function calculerAge(naissance) {
  const s = String(naissance == null ? '' : naissance).trim();
  let m = s.match(/^(\d{4})(?:-(\d{2})-(\d{2}))?$/);
  let annee, mois, jour;
  if (m) { annee = +m[1]; mois = +m[2] || 0; jour = +m[3] || 0; }
  else if ((m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) { annee = +m[3]; mois = +m[2]; jour = +m[1]; }
  else return '';
  const now = new Date();
  let age = now.getFullYear() - annee;
  if (mois && (now.getMonth() + 1 < mois || (now.getMonth() + 1 === mois && now.getDate() < jour))) age--;
  if (age < 0) return '';
  if (age === 0) return "Moins d'un an";
  return age + (age > 1 ? ' ans' : ' an');
}

function renderContact(data) {
  const el = document.getElementById('footerContact');
  if (!el) return;
  el.innerHTML = `
    <p>${data.telephone}</p>
    <p>${data.email}</p>
    <div class="socials">
      <a href="${data.facebook}" target="_blank" rel="noopener">Facebook</a>
      <a href="${data.helloasso}" target="_blank" rel="noopener">HelloAsso</a>
    </div>
  `;
}

function markActiveNav() {
  let path = location.pathname.split('/').pop() || 'index.html';
  if (path === 'animal.html') path = 'animaux.html';
  document.querySelectorAll('nav.site-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  fetchJSON('content/contact.json').then(renderContact).catch(() => {});
});
