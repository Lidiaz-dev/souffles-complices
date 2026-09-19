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

// Cadrage d'une photo dans sa bulle : "37% 50%" (généré par admin/cadrage.html).
function styleCadrage(position) {
  const p = String(position || '').trim();
  return /^\d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/.test(p) ? ` style="object-position:${p}"` : '';
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

// Emoji de chaque type d'animal (badges des bulles, filtres).
const EMOJI_TYPE = { cheval: '🐎', poney: '🐴', ane: '🫏', mouton: '🐑', poule: '🐔', canard: '🦆' };
function emojiPourType(type) { return EMOJI_TYPE[type] || '🐾'; }

// Petits animaux décoratifs autour du titre des pages (attribut data-emojis="🐴 🐑 🐔 🦆").
function decorerPageHero() {
  const ph = document.querySelector('.page-hero[data-emojis]');
  if (!ph) return;
  ph.dataset.emojis.split(/\s+/).filter(Boolean).forEach((e, i) => {
    const s = document.createElement('span');
    s.className = `deco emoji-vivant ${i % 2 ? 'droite' : 'gauche'} d${Math.floor(i / 2) + 1}`;
    s.setAttribute('aria-hidden', 'true');
    s.textContent = e;
    ph.appendChild(s);
  });
}

// Défilé d'animaux : on duplique la piste pour une boucle sans coupure.
function initParade() {
  document.querySelectorAll('.parade-piste').forEach(piste => {
    [...piste.children].forEach(c => piste.appendChild(c.cloneNode(true)));
  });
}

// Transition de sortie : la page s'estompe avant de charger la suivante (liens internes uniquement).
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = e.target.closest('a[href]');
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search) return;
  e.preventDefault();
  document.documentElement.classList.add('page-out');
  setTimeout(() => { location.href = a.href; }, 230);
});
// Retour arrière : on retire l'état "sortie" si la page revient du cache du navigateur.
window.addEventListener('pageshow', e => {
  if (e.persisted) document.documentElement.classList.remove('page-out');
});

// Fond vivant : grandes formes douces qui dérivent lentement derrière la page.
function initFond() {
  const f = document.createElement('div');
  f.className = 'fond-vivant';
  f.setAttribute('aria-hidden', 'true');
  f.innerHTML = '<span class="forme f1"></span><span class="forme f2"></span><span class="forme f3"></span><span class="forme f4"></span>';
  document.body.prepend(f);
}

// Filet de sécurité : tout lien vers un autre site s'ouvre dans un nouvel onglet,
// y compris ceux ajoutés plus tard (contenu de l'admin, boutons créés en JavaScript).
function ouvrirExternesAilleurs(racine) {
  (racine || document).querySelectorAll('a[href]').forEach(a => {
    if (!estLienExterne(a.getAttribute('href'))) return;
    if (a.origin === location.origin) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
}
document.addEventListener('DOMContentLoaded', () => {
  ouvrirExternesAilleurs();
  new MutationObserver(() => ouvrirExternesAilleurs()).observe(document.body, { childList: true, subtree: true });
});

// Cartes d'action (accueil, Nous soutenir) : un clic n'importe où sur la carte suit le lien de son bouton.
document.addEventListener('click', e => {
  const carte = e.target.closest('.support-card');
  if (!carte || e.target.closest('a, button')) return;
  if (window.getSelection && String(window.getSelection())) return;
  const lien = carte.querySelector('a.btn');
  if (lien) lien.click();
});

// Un clic sur un animal décoratif le fait sauter.
document.addEventListener('click', e => {
  const el = e.target.closest('.emoji-vivant');
  if (!el) return;
  el.classList.remove('saute');
  void el.offsetWidth;
  el.classList.add('saute');
  el.addEventListener('animationend', () => el.classList.remove('saute'), { once: true });
});

function markActiveNav() {
  let path = location.pathname.split('/').pop() || 'index.html';
  if (path === 'animal.html') path = 'animaux.html';
  document.querySelectorAll('nav.site-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
  // Sur mobile le menu défile : on centre le lien de la page en cours.
  const nav = document.querySelector('nav.site-nav');
  const actif = nav && nav.querySelector('a.active');
  if (actif && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = actif.offsetLeft - (nav.clientWidth - actif.offsetWidth) / 2;
  }
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

    // Masqué tant qu'un bouton HelloAsso de la page (marqué data-masque-sticky) est visible à l'écran.
    const vh = window.innerHeight;
    const dejaLa = [...document.querySelectorAll('[data-masque-sticky]')].some(el => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh;
    });
    cta.classList.toggle('is-masque', dejaLa);
  }

  window.addEventListener('scroll', () => {
    if (!attente) { attente = true; requestAnimationFrame(maj); }
  }, { passive: true });
  window.addEventListener('resize', maj);
  if (window.ResizeObserver) new ResizeObserver(maj).observe(document.body);
  maj();
}

document.addEventListener('DOMContentLoaded', () => {
  initFond();
  const entete = document.querySelector('header.site');
  if (entete) {
    const majEntete = () => entete.classList.toggle('compact', window.scrollY > 40);
    window.addEventListener('scroll', majEntete, { passive: true });
    majEntete();
  }
  markActiveNav();
  decorerPageHero();
  initParade();
  helloassoPromise.then(lien => {
    const cta = document.createElement('a');
    cta.className = 'btn btn-primary btn-adherer sticky-cta';
    cta.href = lien;
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.innerHTML = '<span class="label">Soutenir</span><span class="arrow" aria-hidden="true">→</span>';
    document.body.appendChild(cta);
    initStickyCta(cta);
  });
  contactPromise.then(d => {
    if (d.telephone || d.email) renderContact(d);
  });
});
