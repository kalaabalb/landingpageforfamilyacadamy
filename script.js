const config = window.FAMILY_ACADEMY_SITE_CONFIG || {};

const sceneThemes = {
  opening: {
    accent: '#d8b07e',
    accent2: '#7ea8e7',
    accent3: '#8cd3bd',
  },
  classroom: {
    accent: '#c99a66',
    accent2: '#7cabe8',
    accent3: '#95d8c1',
  },
  study: {
    accent: '#d7bb8a',
    accent2: '#9ab7e6',
    accent3: '#8fd0d2',
  },
  tv: {
    accent: '#9dbde8',
    accent2: '#d8b07e',
    accent3: '#a7dfc9',
  },
  governance: {
    accent: '#e0c38e',
    accent2: '#86abd9',
    accent3: '#94d8bf',
  },
  downloads: {
    accent: '#dfb27b',
    accent2: '#8bb4e8',
    accent3: '#91ddc7',
  },
  closing: {
    accent: '#d1aa75',
    accent2: '#7faae2',
    accent3: '#95d8be',
  },
};

const scenes = [
  {
    id: 'opening',
    progress: '01 / 05',
    headline: 'Family Academy, opening like a film.',
    copy:
      'A public landing page for the platform. It is shaped like a story, not a brochure, so the visitor moves through learning, TV continuity, and control as if the system is unfolding on screen.',
    bullets: ['Cinematic motion', 'Large-screen storytelling', 'Role-aware product flow'],
  },
  {
    id: 'classroom',
    progress: '02 / 05',
    headline: 'The classroom becomes a chapter.',
    copy:
      'The platform is built around schools, categories, courses, and chapters. This is the moment where the page starts to feel like a lesson beginning rather than a website being scrolled.',
    bullets: ['Structured academics', 'Courses and chapters', 'Notes and practice'],
  },
  {
    id: 'study',
    progress: '03 / 05',
    headline: 'The lesson deepens.',
    copy:
      'Inside a chapter, video, notes, quizzes, and exams work together. The story should feel like the user is entering a learning room, not clicking a bunch of unrelated cards.',
    bullets: ['Video continuity', 'Offline-friendly notes', 'Timed exams and progress'],
  },
  {
    id: 'tv',
    progress: '04 / 05',
    headline: 'The same story continues on TV.',
    copy:
      'The TV app is the living-room companion. It keeps the platform accessible on large screens, where remote control and simple navigation matter more than touch gestures.',
    bullets: ['Remote-first flow', 'Big-screen continuity', 'Paired device experience'],
  },
  {
    id: 'governance',
    progress: '05 / 05',
    headline: 'The system stays governed.',
    copy:
      'Admin and teacher roles stay behind the public frontage. The landing page should still hint at trust, support, payments, and operational clarity without turning into an admin dashboard.',
    bullets: ['Role-based access', 'Payments and support', 'Logs and moderation'],
  },
];

const stage = {
  title: document.querySelector('.screen-title-large'),
  small: document.querySelector('.screen-title-small'),
  caption: document.querySelector('.stage-caption'),
  progress: document.querySelector('.stage-progress'),
  chip: document.querySelector('.stage-chip'),
  dots: Array.from(document.querySelectorAll('.timeline-dot')),
};

const setTheme = (sceneId) => {
  const theme = sceneThemes[sceneId] || sceneThemes.opening;
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--accent-2', theme.accent2);
  document.documentElement.style.setProperty('--accent-3', theme.accent3);
};

const setActiveScene = (sceneId) => {
  const scene = scenes.find((item) => item.id === sceneId) || scenes[0];
  document.body.dataset.scene = scene.id;
  setTheme(scene.id);
  stage.title.textContent = scene.headline;
  stage.small.textContent = scene.id === 'opening' ? 'Family Academy' : scene.id.replace(/^[a-z]/, (m) => m.toUpperCase());
  stage.caption.textContent = scene.copy;
  stage.progress.textContent = scene.progress;
  stage.chip.textContent = scene.id === 'opening' ? 'Opening credits' : scene.id;

  stage.dots.forEach((dot) => {
    dot.classList.toggle('active', dot.dataset.jump === scene.id);
  });
};

const renderDownloads = () => {
  const grid = document.getElementById('download-grid');
  const note = document.getElementById('download-note');
  if (!grid) return;

  const client = config.downloads?.client || [];
  const tv = config.downloads?.tv || [];

  note.textContent = config.brand
    ? `${config.brand} downloads are wired through this single config file. Drop in your Render or Cloudinary URLs when they are ready, and the buttons will point there without changing the layout.`
    : 'Download links are wired through one config file so they can point at your hosted files later.';

  const groups = [
    { title: 'Client app', badge: 'Student / desktop / parent', items: client },
    { title: 'TV app', badge: 'Living room / remote / paired', items: tv },
  ];

  grid.innerHTML = groups
    .map(
      (group) => `
        <article class="download-card">
          <div class="download-badge">${group.badge}</div>
          <h4>${group.title}</h4>
          <p class="download-tile-note">If a link is empty, fill it in <code>config.js</code> with your hosted file URL.</p>
          <div class="download-list">
            ${group.items
              .map((item) => {
                const hasHref = Boolean(item.href && item.href.trim());
                const target = hasHref ? item.href.trim() : '#downloads';
                const classes = hasHref ? 'download-link' : 'download-link missing';
                const label = hasHref ? 'Download' : 'Attach URL';
                return `
                  <a class="${classes}" href="${target}" ${hasHref ? 'target="_blank" rel="noreferrer"' : ''}>
                    <span>
                      <strong>${item.title}</strong>
                      <small>${item.note}</small>
                    </span>
                    <span>${label}</span>
                  </a>
                `;
              })
              .join('')}
          </div>
        </article>
      `,
    )
    .join('');
};

const initScrollObserver = () => {
  const targets = document.querySelectorAll('.scene[data-scene]');
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveScene(visible.target.dataset.scene);
      }
    },
    { threshold: [0.3, 0.45, 0.6, 0.75] },
  );

  targets.forEach((target) => observer.observe(target));
};

const initTimeline = () => {
  stage.dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.jump);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
};

const init = () => {
  renderDownloads();
  initTimeline();
  initScrollObserver();
  setActiveScene('opening');
};

init();
