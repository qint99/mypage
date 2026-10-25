// The address after # chooses the page. The browser's Back button works too.
const pages = [...document.querySelectorAll('[data-page]')];
const links = [...document.querySelectorAll('[data-route]')];
const aliases = { about: 'home', photography: 'life' };
const names = { home: 'Welcome', projects: 'My projects', life: 'Life outside work', reading: 'My reading list', contact: 'Contact' };
function showPage(moveFocus = false) {
  const hash = window.location.hash.slice(1);
  const current = pages.find(page => !page.hidden)?.dataset.page || 'home';
  const requested = hash === 'main' ? current : aliases[hash] || hash || 'home';
  const name = names[requested] ? requested : 'home';
  for (const page of pages) page.hidden = page.dataset.page !== name;
  for (const link of links) {
    if (link.dataset.route === name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  document.title = `${names[name]} — Olivia Qin`;
  if (moveFocus) {
    document.getElementById('main').focus({ preventScroll: true });
    if (hash === 'photography') document.getElementById('photography').scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
if (pages.length && links.length) {
  document.documentElement.classList.add('js');
  showPage();
  window.addEventListener('hashchange', () => showPage(true));
}
