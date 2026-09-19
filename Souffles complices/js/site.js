// Fonctions partagées par toutes les pages du site.

function fetchJSON(path) {
  return fetch(path, { cache: 'no-cache' }).then(r => r.json());
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
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.site-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  fetchJSON('content/contact.json').then(renderContact).catch(() => {});
});
