const config = window.FAMILY_ACADEMY_SITE_CONFIG || {};
const scenes = Array.isArray(config.scenes) && config.scenes.length ? config.scenes : [];
const books = Array.isArray(config.books) && config.books.length ? config.books : [];
const downloads = config.downloads || {};

const els = {
  camera: document.getElementById('room-camera'),
  shelf: document.getElementById('book-shelf'),
  sceneProgress: document.getElementById('scene-progress'),
  sceneName: document.getElementById('scene-name'),
  sceneKicker: document.getElementById('scene-kicker'),
  sceneTitle: document.getElementById('scene-title'),
  sceneCopy: document.getElementById('scene-copy'),
  sceneBullets: document.getElementById('scene-bullets'),
  modal: document.getElementById('book-modal'),
  modalCategory: document.getElementById('book-category'),
  modalTitle: document.getElementById('book-title'),
  modalSummary: document.getElementById('book-summary'),
  modalPages: document.getElementById('book-pages'),
};

const rowLabels = {
  top: 'Entrance shelf',
  middle: 'Learning shelf',
  bottom: 'Family shelf',
};

const sceneLabels = {
  arrival: 'Arrival',
  desk: 'Desk',
  shelf: 'Shelf',
  tv: 'TV',
  downloads: 'Downloads',
  support: 'Support',
};

const state = {
  sceneIndex: 0,
  bookId: null,
  bookPage: 0,
  pointerX: 0,
  pointerY: 0,
  lastMoveAt: 0,
  touchStartY: 0,
  touchStartX: 0,
  touchActive: false,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const safeText = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sceneById = (id) => scenes.findIndex((scene) => scene.id === id);

const setRootTheme = (scene) => {
  if (!scene) return;
  const accent = scene.accent || {};
  document.documentElement.style.setProperty('--accent', accent.main || '#d6ae79');
  document.documentElement.style.setProperty('--accent-2', accent.secondary || '#8daee4');
  document.documentElement.style.setProperty('--accent-3', accent.glow || '#dff1e4');
  document.documentElement.style.setProperty('--glow', `${accent.glow || '#efd8b6'}44`);
};

const updateSceneUI = (scene) => {
  if (!scene) return;
  els.sceneProgress.textContent = `${String(state.sceneIndex + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
  els.sceneName.textContent = sceneLabels[scene.id] || scene.id.charAt(0).toUpperCase() + scene.id.slice(1);
  els.sceneKicker.textContent = scene.kicker || 'Cinematic frame';
  els.sceneTitle.textContent = scene.title || config.brand || 'Family Academy';
  els.sceneCopy.textContent = scene.copy || '';
  els.sceneBullets.innerHTML = (scene.bullets || [])
    .map((bullet) => `<li>${safeText(bullet)}</li>`)
    .join('');

  document.querySelectorAll('.compass-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.sceneJump === scene.id);
  });
};

const applyScene = (nextIndex, { immediate = false } = {}) => {
  if (!scenes.length) return;
  state.sceneIndex = clamp(nextIndex, 0, scenes.length - 1);
  const scene = scenes[state.sceneIndex];

  if (!scene) return;

  document.body.dataset.scene = scene.id;
  setRootTheme(scene);
  updateSceneUI(scene);

  const camera = scene.camera || {};
  const style = els.camera?.style;
  if (style) {
    style.setProperty('--cam-x', camera.x || '0px');
    style.setProperty('--cam-y', camera.y || '0px');
    style.setProperty('--cam-z', camera.z || '0px');
    style.setProperty('--cam-rx', camera.rx || '-4deg');
    style.setProperty('--cam-ry', camera.ry || '0deg');
    style.setProperty('transition-duration', immediate ? '0ms' : '900ms');
  }
};

const renderShelf = () => {
  if (!els.shelf) return;

  const grouped = books.reduce((acc, book) => {
    const row = book.row || 'middle';
    if (!acc[row]) acc[row] = [];
    acc[row].push(book);
    return acc;
  }, {});

  const rows = ['top', 'middle', 'bottom'];

  els.shelf.innerHTML = rows
    .map((row) => {
      const rowBooks = grouped[row] || [];
      return `
        <section class="book-row" data-row="${row}">
          <div class="book-row-label">${rowLabels[row] || row}</div>
          <div class="book-row-books">
            ${rowBooks
              .map(
                (book) => `
                  <button
                    type="button"
                    class="book"
                    data-book-id="${book.id}"
                    data-corner="${safeText(book.corner || rowLabels[row] || 'Guide')}"
                    style="--book-accent: ${book.accent || '#d6ae79'}"
                    aria-label="Open ${safeText(book.title)}"
                  >
                    <span class="book-spine"></span>
                    <span class="book-top-label">${safeText(book.corner || rowLabels[row] || 'Guide')}</span>
                    <span class="book-title">${safeText(book.title)}</span>
                    <span class="book-summary">${safeText(book.summary || '')}</span>
                  </button>
                `,
              )
              .join('')}
          </div>
        </section>
      `;
    })
    .join('');

  els.shelf.querySelectorAll('[data-book-id]').forEach((button) => {
    button.addEventListener('click', () => openBook(button.dataset.bookId));
  });
};

const buildDownloadCards = (items) =>
  (items || [])
    .map((item) => {
      const href = (item.href || '').trim();
      const isReady = Boolean(href);
      const classes = ['download-card'];
      if (!isReady) classes.push('missing');

      const inner = `
        <span>
          <strong>${safeText(item.title)}</strong>
          <small>${safeText(item.note || item.fileName || '')}</small>
        </span>
        <span>${isReady ? 'Download' : 'Attach URL'}</span>
      `;

      return isReady
        ? `<a class="${classes.join(' ')}" href="${href}" target="_blank" rel="noreferrer">${inner}</a>`
        : `<div class="${classes.join(' ')}" aria-disabled="true">${inner}</div>`;
    })
    .join('');

const renderBookPage = (book, pageIndex) => {
  const page = book.pages?.[pageIndex] || book.pages?.[0] || {};
  const pageNumber = String(pageIndex + 1).padStart(2, '0');
  const totalPages = String(Math.max(book.pages?.length || 1, 1)).padStart(2, '0');
  const pageBullets = (page.bullets || [])
    .map((bullet) => `<li>${safeText(bullet)}</li>`)
    .join('');

  if (book.id === 'downloads') {
    const clientCards = buildDownloadCards(downloads.client || []);
    const tvCards = buildDownloadCards(downloads.tv || []);
    const groupMarkup = pageIndex === 0
      ? `
        <div class="download-group">
          <div class="download-group-label">Client builds</div>
          ${clientCards}
        </div>
      `
      : `
        <div class="download-group">
          <div class="download-group-label">TV builds</div>
          ${tvCards}
        </div>
      `;

    return `
      <article class="page page--downloads" data-page-index="${pageIndex}">
        <h4>${safeText(page.title || `Page ${pageNumber}`)}</h4>
        <p>${safeText(page.text || '')}</p>
        ${groupMarkup}
      </article>
    `;
  }

  return `
    <article class="page" data-page-index="${pageIndex}">
      <h4>${safeText(page.title || `Page ${pageNumber}`)}</h4>
      <p>${safeText(page.text || '')}</p>
      ${pageBullets ? `<ul>${pageBullets}</ul>` : ''}
    </article>
  `;
};

const renderBookModal = () => {
  const book = books.find((item) => item.id === state.bookId);
  if (!book) return;

  els.modalCategory.textContent = `${book.corner || 'Library guide'} · Page ${String(state.bookPage + 1).padStart(2, '0')} / ${String(Math.max(book.pages?.length || 1, 1)).padStart(2, '0')}`;
  els.modalTitle.textContent = book.title || 'Guide';
  els.modalSummary.textContent = book.summary || '';
  els.modalPages.innerHTML = renderBookPage(book, state.bookPage);
};

const openBook = (bookId) => {
  const nextBook = books.find((book) => book.id === bookId);
  if (!nextBook) return;

  state.bookId = bookId;
  state.bookPage = 0;
  document.body.dataset.modalOpen = 'true';
  els.modal.classList.add('open');
  els.modal.setAttribute('aria-hidden', 'false');
  renderBookModal();
};

const closeBook = () => {
  state.bookId = null;
  state.bookPage = 0;
  els.modal.classList.remove('open');
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.dataset.modalOpen = 'false';
};

const moveBookPage = (direction) => {
  const book = books.find((item) => item.id === state.bookId);
  if (!book) return;
  const total = Math.max(book.pages?.length || 1, 1);
  state.bookPage = (state.bookPage + direction + total) % total;
  renderBookModal();
};

const moveScene = (direction) => {
  const next = clamp(state.sceneIndex + direction, 0, scenes.length - 1);
  if (next === state.sceneIndex) return;
  applyScene(next);
};

const jumpToScene = (sceneId) => {
  const next = sceneById(sceneId);
  if (next >= 0) applyScene(next);
};

const initControls = () => {
  document.querySelectorAll('[data-scene-jump]').forEach((button) => {
    button.addEventListener('click', () => jumpToScene(button.dataset.sceneJump));
  });

  document.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const step = button.dataset.step;
      moveScene(step === 'next' ? 1 : -1);
    });
  });

  document.querySelectorAll('[data-open-book]').forEach((button) => {
    button.addEventListener('click', () => openBook(button.dataset.openBook));
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', closeBook);
  });

  document.querySelectorAll('[data-page-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      moveBookPage(button.dataset.pageNav === 'next' ? 1 : -1);
    });
  });

  window.addEventListener(
    'wheel',
    (event) => {
      if (document.body.dataset.modalOpen === 'true') return;
      event.preventDefault();
      const now = performance.now();
      if (now - state.lastMoveAt < 650) return;
      state.lastMoveAt = now;
      moveScene(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.dataset.modalOpen === 'true') {
      closeBook();
      return;
    }

    if (document.body.dataset.modalOpen === 'true') {
      if (event.key === 'ArrowRight') moveBookPage(1);
      if (event.key === 'ArrowLeft') moveBookPage(-1);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      moveScene(1);
    }

    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      moveScene(-1);
    }
  });

  window.addEventListener('touchstart', (event) => {
    if (!event.touches?.length) return;
    state.touchActive = true;
    state.touchStartY = event.touches[0].clientY;
    state.touchStartX = event.touches[0].clientX;
  }, { passive: true });

  window.addEventListener('touchend', (event) => {
    if (!state.touchActive) return;
    state.touchActive = false;
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const deltaY = touch.clientY - state.touchStartY;
    const deltaX = touch.clientX - state.touchStartX;
    if (Math.abs(deltaY) < 40 && Math.abs(deltaX) < 40) return;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      moveScene(deltaY < 0 ? 1 : -1);
    } else if (document.body.dataset.modalOpen === 'true') {
      moveBookPage(deltaX < 0 ? 1 : -1);
    }
  }, { passive: true });

  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    state.pointerX = clamp(x, -1, 1);
    state.pointerY = clamp(y, -1, 1);
    document.documentElement.style.setProperty('--tilt-x', `${state.pointerX * 4}deg`);
    document.documentElement.style.setProperty('--tilt-y', `${-state.pointerY * 3}deg`);
  }, { passive: true });
};

const init = () => {
  renderShelf();
  initControls();
  applyScene(0, { immediate: true });
};

init();
