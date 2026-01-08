const state = {
  experience: [],
};

const THEME_STORAGE_KEY = 'theme-preference';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return res.json();
}

function toShortMonthYear(label) {
  if (!label || typeof label !== 'string') return label ?? '';

  const trimmed = label.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (lower === 'present' || lower === 'current') {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    return trimmed;
  }

  const monthRaw = parts[0].toLowerCase();
  const year = parts[1];

  const monthMap = {
    jan: 'Jan',
    january: 'Jan',
    feb: 'Feb',
    february: 'Feb',
    mar: 'Mar',
    march: 'Mar',
    apr: 'Apr',
    april: 'Apr',
    may: 'May',
    jun: 'Jun',
    june: 'Jun',
    jul: 'Jul',
    july: 'Jul',
    aug: 'Aug',
    august: 'Aug',
    sep: 'Sep',
    sept: 'Sep',
    september: 'Sep',
    oct: 'Oct',
    october: 'Oct',
    nov: 'Nov',
    november: 'Nov',
    dec: 'Dec',
    december: 'Dec',
  };

  const shortMonth = monthMap[monthRaw];
  if (!shortMonth) {
    return trimmed;
  }

  return `${shortMonth} ${year}`;
}

function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) {
    el.textContent = new Date().getFullYear().toString();
  }
}

function getPreferredTheme() {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.bsTheme = theme === 'dark' ? 'dark' : 'light';

  const toggles = document.querySelectorAll('[data-theme-toggle]');
  toggles.forEach((btn) => {
    const sun = btn.querySelector('[data-theme-icon="sun"]');
    const moon = btn.querySelector('[data-theme-icon="moon"]');

    if (theme === 'dark') {
      btn.setAttribute('aria-label', 'Switch to light theme');
      if (sun) sun.classList.remove('d-none');
      if (moon) moon.classList.add('d-none');
    } else {
      btn.setAttribute('aria-label', 'Switch to dark theme');
      if (sun) sun.classList.add('d-none');
      if (moon) moon.classList.remove('d-none');
    }
  });
}

function initThemeControls() {
  const initial = getPreferredTheme();
  applyTheme(initial);

  const toggles = document.querySelectorAll('[data-theme-toggle]');
  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.dataset.bsTheme === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      applyTheme(next);
    });
  });

  const mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', (event) => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return;
      }
      applyTheme(event.matches ? 'dark' : 'light');
    });
  }
}

// Home page
async function initHomePage() {
  try {
    const [experience, tools] = await Promise.all([
      loadJSON('data/experience.json'),
      loadJSON('data/tools.json'),
    ]);

    const sortedExperience = [...experience].sort(
      (a, b) => Number(a.id) - Number(b.id)
    );

    state.experience = sortedExperience;

    renderExperienceTimeline(sortedExperience);
    renderToolsGrid(tools);

    if (sortedExperience.length > 0) {
      const newest = sortedExperience[sortedExperience.length - 1];
      activateExperience(newest.id);
    }
  } catch (err) {
    console.error('Error initialising home page', err);
  }
}

function renderExperienceTimeline(experience) {
  const list = document.getElementById('experience-timeline');
  if (!list) return;

  list.innerHTML = '';

  const ordered = [...experience].sort(
    (a, b) => Number(b.id) - Number(a.id)
  );

  ordered.forEach((item) => {
    const li = document.createElement('li');
      li.className = 'timeline-item';
    li.dataset.id = String(item.id);
    li.innerHTML = `
      <div class="timeline-item__header">
        <h3>${item.role}</h3>
        <p class="timeline-item__meta">${item.company}${item.location ? ` \u00b7 ${item.location}` : ''}</p>
        <p class="timeline-item__dates">${toShortMonthYear(item.start)} \u00b7 ${toShortMonthYear(item.end)}</p>
      </div>
      <p class="timeline-item__summary">${item.summary}</p>
    `;

    li.addEventListener('click', () => {
      activateExperience(item.id);
    });

    list.appendChild(li);
  });
}

function activateExperience(id) {
  const details = document.getElementById('experience-details');
  if (!details) return;

  const data = state.experience.find((x) => String(x.id) === String(id));
  if (!data) return;

  document.querySelectorAll('.timeline-item').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.id === String(id));
  });

  const highlights = (data.highlights || [])
    .map((h) => `<li>${h}</li>`)
    .join('');

  const tools = (data.tools || [])
    .map((t) => `<span class="experience-details__tool-pill">${t}</span>`)
    .join('');

  details.innerHTML = `
    <h3 class="experience-details__title">${data.role}</h3>
    <p class="experience-details__meta">${data.company}${data.location ? ` \u00b7 ${data.location}` : ''}</p>
    <p class="experience-details__dates">${toShortMonthYear(data.start)} \u00b7 ${toShortMonthYear(data.end)}</p>
    ${highlights ? `<ul class="experience-details__highlights">${highlights}</ul>` : ''}
    ${tools ? `<div class="experience-details__tools">${tools}</div>` : ''}
  `;
}

function renderToolsGrid(tools) {
  const grid = document.getElementById('tools-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const sorted = [...tools].sort((a, b) => {
    const levelRank = (t) => (t.level === 'proficient' ? 0 : 1);
    const rankDiff = levelRank(a) - levelRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name);
  });

  sorted.forEach((tool) => {
    const col = document.createElement('div');
    col.className = 'col';

    const isProficient = tool.level === 'proficient';

    col.innerHTML = `
      <article class="card h-100 bg-body border-secondary-subtle shadow-sm">
        <div class="card-body py-2">
          <h3 class="h6 mb-1 d-flex align-items-center justify-content-between">
            <span>${tool.name}</span>
            ${
              isProficient
                ? '<span class="tool-stars text-warning small" aria-label="Proficient level">★★★</span>'
                : ''
            }
          </h3>
          ${
            tool.level
              ? `<p class="text-secondary small mb-0 text-capitalize">${tool.level}</p>`
              : ''
          }
        </div>
      </article>
    `;

    grid.appendChild(col);
  });
}

// Projects page
async function initProjectsPage() {
  try {
    const projects = await loadJSON('data/projects.json');
    renderProjectsGrid(projects);
  } catch (err) {
    console.error('Error initialising projects page', err);
  }
}

function renderProjectsGrid(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '';

  projects.forEach((project) => {
      const col = document.createElement('div');
      col.className = 'col';

      const type = project.type === 'download' ? 'download' : 'web';

      const link = document.createElement('a');
      link.href = project.url;
      link.className = 'card h-100 bg-body border-secondary-subtle text-reset text-decoration-none shadow-sm project-card';
      link.dataset.linkType = type;

      if (type === 'web') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else {
        link.setAttribute('download', '');
      }

      link.innerHTML = `
        <div class="project-card__image-wrapper">
          <img src="${project.thumbnail}" alt="${project.title} thumbnail" class="card-img-top" />
          <div class="project-card__overlay">
            ${
              type === 'download'
                ? `<div class="project-card__overlay-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        d="M12 3v11.17l3.59-3.58L17 12l-5 5-5-5 1.41-1.41L11 14.17V3h1zM5 19h14v2H5z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>`
                : ''
            }
          </div>
        </div>
        <div class="card-body">
          <h3 class="h6 card-title mb-1">${project.title}</h3>
          <p class="card-text small text-secondary mb-0">${project.description}</p>
        </div>
      `;

      col.appendChild(link);
      grid.appendChild(col);
  });
}

// Contact page
async function initContactPage() {
  try {
    const contact = await loadJSON('data/contact.json');
    renderContact(contact);
  } catch (err) {
    console.error('Error initialising contact page', err);
  }
}

function renderContact(contact) {
  const root = document.getElementById('contact-details');
  if (!root) return;

  root.classList.add('card', 'bg-body', 'border-secondary-subtle', 'shadow-sm');

  const otherLinks = (contact.other || [])
    .map(
      (item) => `
      <div class="contact-card__item">
        <div class="contact-card__label">${item.label}</div>
        <div class="contact-card__value"><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.linkText}</a></div>
      </div>`
    )
    .join('');

    root.innerHTML = `
      <div class="card-body">
        <h2 class="contact-card__name h4">${contact.name}</h2>
        ${
          contact.location
            ? `<p class="contact-card__location">${contact.location}</p>`
            : ''
        }

        <div class="contact-card__item">
          <div class="contact-card__label">Email</div>
          <div class="contact-card__value"><a href="mailto:${contact.email}">${contact.email}</a></div>
        </div>

        ${
          contact.github
            ? `
        <div class="contact-card__item">
          <div class="contact-card__label">GitHub</div>
          <div class="contact-card__value"><a href="${contact.github}" target="_blank" rel="noopener noreferrer">${contact.github}</a></div>
        </div>`
            : ''
        }

        ${
          contact.linkedin
            ? `
        <div class="contact-card__item">
          <div class="contact-card__label">LinkedIn</div>
          <div class="contact-card__value"><a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer">${contact.linkedin}</a></div>
        </div>`
            : ''
        }

        ${otherLinks}
      </div>
    `;
}

// Entry point
document.addEventListener('DOMContentLoaded', () => {
  setFooterYear();

  initThemeControls();

  const page = document.body.dataset.page;
  if (page === 'home') {
    initHomePage();
  } else if (page === 'projects') {
    initProjectsPage();
  } else if (page === 'contact') {
    initContactPage();
  }
});
