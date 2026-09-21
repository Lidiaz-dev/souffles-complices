// Fonctions partagées par toutes les pages du site.

function fetchJSON(path) {
  return fetch(path, { cache: 'no-cache' }).then(r => r.json());
}

// Lien HelloAsso de base : utilisé partout dès qu'aucun lien valide n'est renseigné.
// Modifiable dans content/contact.json (champ "helloasso").
const HELLOASSO_FALLBACK = 'https://www.helloasso.com/associations/souffles-complices';

function estLienExterne(lien) {
  return /^https?:\/\//.test(String(lien || '').trim());
}

const contactPromise = fetchJSON('content/contact.json').catch(() => ({}));
const helloassoPromise = contactPromise.then(d => estLienExterne(d.helloasso) ? d.helloasso.trim() : HELLOASSO_FALLBACK);

function lienOuDefaut(lien, defaut) {
  return estLienExterne(lien) ? String(lien).trim() : defaut;
}

// Version adaptée à l'affichage d'une photo : /photos/x.jpg -> /photos/vignettes/x.jpg.
// Plus légère et plus nette qu'une grande photo réduite par le navigateur ; repli sur l'originale si elle n'existe pas.
function attrsImage(chemin) {
  const p = String(chemin || '');
  const petite = p.startsWith('/photos/') && !p.startsWith('/photos/vignettes/') ? p.replace('/photos/', '/photos/vignettes/') : p;
  return `src="${petite}" onerror="this.onerror=null;this.src='${p.replace(/'/g, "\\'")}'"`;
}

// Cadrage d'une photo dans sa bulle : "37% 50%" (calculé avec outils/cadrage.html).
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

// Numéro français "06 20 35 14 31" -> "+33620351431" (format attendu par tel: et sms:).
function versTel(numero) {
  const brut = String(numero || '').trim();
  const chiffres = brut.replace(/\D/g, '');
  if (brut.startsWith('+')) return '+' + chiffres;
  if (chiffres.length === 10 && chiffres.startsWith('0')) return '+33' + chiffres.slice(1);
  if (chiffres.startsWith('33')) return '+' + chiffres;
  return chiffres;
}

const ICONES = {
  tel: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sms: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'
};
function icone(nom, taille) {
  const t = taille || 18;
  return `<svg viewBox="0 0 24 24" width="${t}" height="${t}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nom]}</svg>`;
}

function renderContact(data) {
  const el = document.getElementById('footerContact');
  if (!el) return;
  const tel = versTel(data.telephone);
  el.innerHTML = `
    <h4><a class="titre-contact" href="association.html#nous-contacter">Nous contacter</a></h4>
    ${data.telephone ? `
    <div class="contact-ligne">
      <span class="pastille-icone">${icone('tel')}</span>
      <a class="contact-lien" href="tel:${tel}" aria-label="Appeler le ${data.telephone}">${data.telephone}</a>
      <a class="mini-action" href="sms:${tel}" aria-label="Envoyer un SMS au ${data.telephone}">${icone('sms', 14)}<span>SMS</span></a>
    </div>` : ''}
    ${data.email ? `
    <div class="contact-ligne">
      <span class="pastille-icone">${icone('mail')}</span>
      <a class="contact-lien" href="mailto:${data.email}" aria-label="Envoyer un email à ${data.email}">${data.email}</a>
    </div>` : ''}
    ${data.facebook ? `
    <div class="socials">
      <a href="${data.facebook}" target="_blank" rel="noopener">${icone('fb', 16)}<span>Facebook</span></a>
    </div>` : ''}
  `;
}

// Emoji de chaque type d'animal (badges des bulles, filtres).
const EMOJI_TYPE = { cheval: '🐎', poney: '🐴', ane: '🫏', mouton: '🐑', poule: '🐔', canard: '🦆', chien: '🐕' };
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
// y compris ceux ajoutés plus tard (contenus des fichiers JSON, boutons créés en JavaScript).
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
