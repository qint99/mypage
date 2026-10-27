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

// The bookshelf uses the entries in books.js. Text is added safely as textContent.
const readingBooks = Array.isArray(window.readingBooks) ? window.readingBooks : [];
const bookcase = document.getElementById('bookcase');
const bookSearch = document.getElementById('book-search');
const bookDialog = document.getElementById('book-dialog');
if (bookcase && bookSearch && bookDialog) {
  let shelfColumns = 0;
  let currentBook = 0;
  let lastBookId = null;
  const openingLeaf = bookDialog.querySelector('.book-opening-leaf');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let openingAnimations = [];
  let openingSequence = 0;
  function stopBookOpening() {
    openingSequence += 1;
    for (const animation of openingAnimations) animation.cancel();
    openingAnimations = [];
    openingLeaf.hidden = true;
  }
  // A real cover turns on its hinge, revealing the inside page.
  function animateBookOpening(backward = false) {
    stopBookOpening();
    if (reducedMotion.matches || !bookDialog.open) return;
    const sequence = openingSequence;
    const book = readingBooks[currentBook];
    const image = document.getElementById('opening-cover-image');
    image.src = book.cover || '';
    image.hidden = !book.cover;
    openingLeaf.dataset.direction = backward ? 'backward' : 'forward';
    openingLeaf.hidden = false;
    const angle = backward ? 178 : -178;
    const turn = openingLeaf.animate([
      { transform: 'rotateY(0deg)', opacity: 1, offset: 0 },
      { transform: `rotateY(${angle * 0.7}deg)`, opacity: 1, offset: 0.72 },
      { transform: `rotateY(${angle}deg)`, opacity: 0, offset: 1 }
    ], { duration: 900, easing: 'cubic-bezier(.25,.65,.2,1)', fill: 'forwards' });
    const cover = bookDialog.querySelector('.detail-cover').animate([
      { opacity: 0 }, { opacity: 1 }
    ], { duration: 450, delay: 300, fill: 'backwards' });
    const notes = bookDialog.querySelector('.book-detail-copy').animate([
      { opacity: 0, transform: 'translateX(8px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 450, delay: 220, fill: 'backwards' });
    openingAnimations = [turn, cover, notes];
    turn.finished.then(() => {
      if (sequence === openingSequence) stopBookOpening();
    }).catch(() => {});
  }
  reducedMotion.addEventListener('change', stopBookOpening);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const fullTitle = book => book.subtitle ? `${book.title}: ${book.subtitle}` : book.title;
  const addText = (parent, tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  };
  const colorBook = (element, book) => {
    element.style.setProperty('--book-color', book.color);
    element.style.setProperty('--book-ink', book.ink);
  };
  function displayBook(index) {
    currentBook = (index + readingBooks.length) % readingBooks.length;
    const book = readingBooks[currentBook];
    document.getElementById('book-dialog-title').textContent = fullTitle(book);
    document.getElementById('book-dialog-author').textContent = book.author;
    document.getElementById('detail-cover-title').textContent = fullTitle(book);
    document.getElementById('detail-cover-author').textContent = book.author;
    document.getElementById('book-dialog-notes').textContent = book.notes.trim() || 'Personal notes coming soon.';
    document.getElementById('book-publisher-link').href = book.source;
    document.getElementById('book-position').textContent = `${currentBook + 1} of ${readingBooks.length}`;
    const cover = bookDialog.querySelector('.detail-cover');
    const image = document.getElementById('detail-cover-image');
    colorBook(cover, book);
    cover.classList.remove('has-cover');
    image.onload = () => cover.classList.add('has-cover');
    image.onerror = () => cover.classList.remove('has-cover');
    if (book.cover) image.src = book.cover;
    else image.removeAttribute('src');
  }
  function openBook(id) {
    const index = readingBooks.findIndex(book => book.id === id);
    if (index < 0) return;
    lastBookId = id;
    displayBook(index);
    document.body.classList.add('book-is-open');
    bookDialog.showModal();
    animateBookOpening();
  }
  function renderShelf(force = false) {
    const query = normalize(bookSearch.value.trim());
    const filtered = readingBooks.filter(book => normalize(`${fullTitle(book)} ${book.author}`).includes(query));
    const bookCount = document.getElementById('book-count');
    bookCount.textContent = query ? `${filtered.length} of ${readingBooks.length} books` : `${readingBooks.length} books on my shelf`;
    bookcase.hidden = filtered.length === 0;
    document.getElementById('shelf-no-results').hidden = filtered.length !== 0;
    const width = bookcase.clientWidth;
    const columns = width ? Math.max(2, Math.min(5, Math.floor((width - 40) / 115))) : shelfColumns || 3;
    if (!force && columns === shelfColumns) return;
    shelfColumns = columns;
    const focusedId = document.activeElement?.dataset?.bookId;
    bookcase.replaceChildren();
    bookcase.style.setProperty('--shelf-columns', String(columns));
    for (let start = 0; start < filtered.length; start += columns) {
      const row = document.createElement('div');
      row.className = 'shelf-row';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', `Shelf ${Math.floor(start / columns) + 1}`);
      for (const book of filtered.slice(start, start + columns)) {
        const button = document.createElement('button');
        button.className = 'shelf-book';
        button.type = 'button';
        button.dataset.bookId = book.id;
        button.setAttribute('aria-label', `Open ${fullTitle(book)} by ${book.author}`);
        button.setAttribute('aria-haspopup', 'dialog');
        colorBook(button, book);
        button.style.setProperty('--book-height', `${book.height}px`);
        addText(button, 'span', 'shelf-book-number', String(readingBooks.indexOf(book) + 1).padStart(2, '0'));
        addText(button, 'span', 'shelf-book-title', book.title);
        if (book.subtitle) addText(button, 'span', 'shelf-book-subtitle', book.subtitle);
        addText(button, 'span', 'shelf-book-author', book.author);
        if (book.cover) {
          const image = document.createElement('img');
          image.className = 'shelf-book-cover';
          image.alt = '';
          image.decoding = 'async';
          image.addEventListener('load', () => button.classList.add('has-cover'));
          image.addEventListener('error', () => button.classList.remove('has-cover'));
          image.src = book.cover;
          button.append(image);
        }
        button.addEventListener('click', () => openBook(book.id));
        row.append(button);
      }
      bookcase.append(row);
    }
    if (focusedId) [...bookcase.querySelectorAll('button')].find(button => button.dataset.bookId === focusedId)?.focus({ preventScroll: true });
  }
  bookSearch.addEventListener('input', () => renderShelf(true));
  document.getElementById('clear-book-search').addEventListener('click', () => {
    bookSearch.value = '';
    renderShelf(true);
    bookSearch.focus();
  });
  bookDialog.querySelector('.book-close').addEventListener('click', () => bookDialog.close());
  bookDialog.addEventListener('click', event => {
    if (event.target !== bookDialog) return;
    const bounds = bookDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) bookDialog.close();
  });
  bookDialog.addEventListener('close', () => {
    stopBookOpening();
    document.body.classList.remove('book-is-open');
    if (!document.getElementById('reading').hidden) {
      [...bookcase.querySelectorAll('button')].find(button => button.dataset.bookId === lastBookId)?.focus({ preventScroll: true });
    }
  });
  document.getElementById('previous-book').addEventListener('click', () => {
    displayBook(currentBook - 1);
    animateBookOpening(true);
  });
  document.getElementById('next-book').addEventListener('click', () => {
    displayBook(currentBook + 1);
    animateBookOpening();
  });
  window.addEventListener('hashchange', () => { if (bookDialog.open) bookDialog.close(); });
  renderShelf(true);
  new ResizeObserver(() => renderShelf()).observe(bookcase);
}
