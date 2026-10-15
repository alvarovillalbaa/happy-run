import { club, filterSessions, mapUrl, planText, validateClub } from './club.js';

const list = document.querySelector('#run-list');
const dialog = document.querySelector('#run-dialog');
const copyStatus = document.querySelector('#copy-status');
let selectedSession;
let activeCard;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function locationIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z');
  svg.append(path);
  return svg;
}

function openSession(session, trigger) {
  selectedSession = session;
  activeCard = trigger;
  document.querySelector('#dialog-status').textContent = session.confirmed ? 'QUEDADA SEMANAL · MADRID' : 'PLAN PROPUESTO · POR CONFIRMAR';
  document.querySelector('#dialog-title').textContent = session.title;
  document.querySelector('#dialog-description').textContent = session.description;
  document.querySelector('#dialog-detail').textContent = session.detail;
  document.querySelector('#dialog-notice').textContent = session.confirmed
    ? 'Consulta los avisos del club antes de salir. Los horarios son de Madrid.'
    : 'Todavía no es una convocatoria. El día, la hora y el punto de encuentro son orientativos. Espera la confirmación del club antes de acudir.';
  const facts = document.querySelector('#dialog-facts');
  facts.replaceChildren();
  for (const [label, value] of [
    ['Día y hora', `${session.day} · ${session.time} (Madrid)`],
    ['Distancia y ritmo', `${session.distance} · ${session.pace}`],
    ['Punto de encuentro', `${session.place} · ${session.meetingPoint}`],
  ]) {
    const row = element('div');
    row.append(element('dt', '', label), element('dd', '', value));
    facts.append(row);
  }
  document.querySelector('#dialog-map').href = mapUrl(session);
  copyStatus.textContent = '';
  dialog.querySelector('.copy-fallback')?.remove();
  dialog.querySelector('.copy-fallback-label')?.remove();
  dialog.showModal();
}

function renderSessions(category = 'all') {
  const sessions = filterSessions(club.sessions, category);
  list.replaceChildren();
  for (const session of sessions) {
    const card = element('button', 'run-card');
    card.type = 'button';
    card.dataset.session = session.id;
    card.setAttribute('aria-label', `Ver ${session.title}, ${session.day}, ${session.distance}, ${session.confirmed ? 'confirmado' : 'plan propuesto'}`);
    const day = element('span', 'run-day');
    day.append(element('small', '', session.dayShort), element('strong', '', session.time));
    const info = element('span', 'run-info');
    const meta = element('span', 'run-meta');
    meta.append(locationIcon(), document.createTextNode(session.place));
    info.append(element('span', 'run-title', session.title), meta);
    const stats = element('span', 'run-stats');
    stats.append(element('strong', '', session.distance), document.createTextNode(` · ${session.pace}`), element('span', 'run-tag', session.confirmed ? 'CONFIRMADO' : 'PLAN PROPUESTO'));
    const arrow = element('span', 'run-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    card.append(day, info, stats, arrow);
    card.addEventListener('click', () => openSession(session, card));
    list.append(card);
  }
  if (!sessions.length) list.append(element('p', 'empty-state', 'Estamos preparando nuevos planes. Vuelve pronto.'));
  document.querySelector('#filter-status').textContent = `${sessions.length} ${sessions.length === 1 ? 'plan disponible' : 'planes disponibles'}`;
}

try {
  validateClub(club);
  renderSessions();
  document.querySelector('[data-filter="all"] span').textContent = String(club.sessions.length).padStart(2, '0');
  if (club.sessions.length && club.sessions.every((session) => session.confirmed)) {
    document.querySelector('#schedule-notice p').textContent = 'Estos son nuestros planes semanales. Consulta los canales oficiales del club para ver los avisos antes de acudir.';
  }
  if (club.community.length) {
    document.querySelector('#community-message').textContent = 'Los planes, los avisos y el buen rollo. Encuéntranos en nuestros canales oficiales.';
    const links = document.querySelector('#community-links');
    links.replaceChildren();
    for (const community of club.community) {
      const link = element('a', 'button button-light', `${community.label} ↗`);
      link.href = community.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      links.append(link);
    }
  }
} catch (error) {
  console.error('No se han podido cargar las quedadas.', error);
  list.replaceChildren(element('p', 'empty-state', 'No hemos podido cargar los planes. Vuelve a cargar la página en un momento.'));
}

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    renderSessions(button.dataset.filter);
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => activeCard?.focus({ preventScroll: true }));

document.querySelector('#copy-plan').addEventListener('click', async () => {
  if (!selectedSession) return;
  const text = planText(selectedSession);
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Plan copiado. ¡Compártelo con quien te apetezca!';
  } catch {
    copyStatus.textContent = 'No se ha podido copiar automáticamente. Selecciona y copia el texto de abajo.';
    let fallback = dialog.querySelector('.copy-fallback');
    if (!fallback) {
      const label = element('label', 'copy-fallback-label sr-only', 'Texto del plan para copiar');
      label.htmlFor = 'copy-fallback';
      fallback = element('textarea', 'copy-fallback');
      fallback.id = 'copy-fallback';
      fallback.readOnly = true;
      copyStatus.after(label, fallback);
    }
    fallback.value = text;
    fallback.focus();
    fallback.select();
  }
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(returnFocus = false) {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = isOpen;
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
});
mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu();
});
matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
