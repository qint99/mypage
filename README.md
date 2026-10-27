# Olivia Qin’s personal website

A small, text-focused personal website, published at https://qint99.github.io/mypage/.

## Learn by editing

- `index.html`: your introduction, projects, personal interests, reading list, and contact links.
- `styles.css`: colours, fonts, sidebar, spacing, and mobile layout.
- `books.js`: the books you’ve read. Each entry contains its title, author, colours, publisher link, and your optional notes.
- `script.js`: changes which page is visible when you use the sidebar. The browser’s Back button works too.
- `assets/favicon.svg`: the small OQ icon in the browser tab.
- `.nojekyll`: publishes the files as a plain website on GitHub Pages.

Start by changing a sentence between the HTML tags. To change the main colours, look for the variables at the top of styles.css.

Each page has a `data-page` name. A link such as `href="#reading"` opens that page. Older links to #about and #photography still work.

Your photographs and personal reading notes can be added when you choose what to share. No fictional photos, book titles, or projects have been added.

## Publishing

GitHub Pages publishes the `main` branch and `/ (root)` folder of `qint99/mypage`. Updates to those files are published automatically. Google Fonts provides EB Garamond and DM Sans; system serif and sans-serif fonts are used if those cannot load.

## Your bookshelf

The reading page shows your books as clickable covers. Search by title or author, open a book with a cover-turning effect, and use Previous/Next to browse with directional page turns. The animation is skipped when reduced motion is enabled. Escape or the close button returns to the shelf.

To add a book, copy an entry in books.js and change its id, title, author, source link, and colours. Add your own thoughts inside its notes field. Empty notes show “Personal notes coming soon.” The shelf and details view display real publisher cover images stored in assets/covers/. Each entry’s coverSource records where the image came from. Text-only covers are retained as a fallback if an image cannot load.
