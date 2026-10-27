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
    colorBook(bookDialog.querySelector('.detail-cover'), book);
  }
  function openBook(id) {
    const index = readingBooks.findIndex(book => book.id === id);
    if (index < 0) return;
    lastBookId = id;
    displayBook(index);
    document.body.classList.add('book-is-open');
    bookDialog.showModal();
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
    document.body.classList.remove('book-is-open');
    if (!document.getElementById('reading').hidden) {
      [...bookcase.querySelectorAll('button')].find(button => button.dataset.bookId === lastBookId)?.focus({ preventScroll: true });
    }
  });
  document.getElementById('previous-book').addEventListener('click', () => displayBook(currentBook - 1));
  document.getElementById('next-book').addEventListener('click', () => displayBook(currentBook + 1));
  window.addEventListener('hashchange', () => { if (bookDialog.open) bookDialog.close(); });
  renderShelf(true);
  new ResizeObserver(() => renderShelf()).observe(bookcase);
}
