// Fonctions partagées par toutes les pages du site.

function fetchJSON(path) {
  return fetch(path, { cache: 'no-cache' }).then(r => r.json());
}

// Lien HelloAsso de base : utilisé partout dès qu'aucun lien valide n'est renseigné.
// Modifiable dans l'admin (Coordonnées > Lien HelloAsso par défaut).
const HELLOASSO_FALLBACK = 'https://www.helloasso.com/associations/souffles-complices';

function estLienExterne(lien) {
  return /^https?:\/\//.test(String(lien || '').trim());
}

const contactPromise = fetchJSON('content/contact.json').catch(() => ({}));
const helloassoPromise = contactPromise.then(d => estLienExterne(d.helloasso) ? d.helloasso.trim() : HELLOASSO_FALLBACK);

function lienOuDefaut(lien, defaut) {
  return estLienExterne(lien) ? String(lien).trim() : defaut;
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

// Bouton fixe : se cache quand on descend, réapparaît quand on remonte,
// et se pose au-dessus du pied de page quand celui-ci est visible.
function initStickyCta(cta) {
  const footer = document.querySelector('footer');
  const marge = window.matchMedia('(max-width:820px)').matches ? 16 : 24;
  let dernierY = window.scrollY;
  let attente = false;

  function maj() {
    attente = false;
    const y = window.scrollY;
    const delta = y - dernierY;
    if (y < 80 || delta < -6) cta.classList.remove('is-hidden');
    else if (delta > 6) cta.classList.add('is-hidden');
    if (Math.abs(delta) > 6 || y < 80) dernierY = y;

    let bas = marge;
    if (footer) {
      const visible = window.innerHeight - footer.getBoundingClientRect().top;
      if (visible > 0) bas = visible + marge;
    }
    cta.style.bottom = bas + 'px';
  }

  window.addEventListener('scroll', () => {
    if (!attente) { attente = true; requestAnimationFrame(maj); }
  }, { passive: true });
  window.addEventListener('resize', maj);
  if (window.ResizeObserver) new ResizeObserver(maj).observe(document.body);
  maj();
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  helloassoPromise.then(lien => {
    const cta = document.createElement('a');
    cta.className = 'btn btn-primary btn-adherer sticky-cta';
    cta.href = lien;
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.innerHTML = '<span class="label"><span class="l-full">Soutenir sur HelloAsso</span><span class="l-short">Soutenir</span></span><span class="arrow" aria-hidden="true">→</span>';
    document.body.appendChild(cta);
    initStickyCta(cta);
  });
  contactPromise.then(d => {
    if (d.telephone || d.email) renderContact(d);
  });
});
