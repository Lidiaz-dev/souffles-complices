// Fonctions partagées par toutes les pages du site.

function fetchJSON(path) {
  return fetch(path, { cache: 'no-cache' }).then(r => r.json());
}

function calculerAge(naissance) {
  const annee = parseInt(naissance, 10);
  if (!annee) return '';
  const age = new Date().getFullYear() - annee;
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
