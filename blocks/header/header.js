// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Loads the nav fragment: /content first (local preview), then site root (DA/EDS).
 * @returns {Promise<HTMLElement|null>} container holding the nav sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  return container;
}

/**
 * Returns the text of an element excluding nested lists.
 * @param {Element} li list item
 * @returns {string} label
 */
function ownLabel(li) {
  return [...li.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && !['UL', 'OL'].includes(n.tagName)))
    .map((n) => n.textContent)
    .join(' ')
    .trim();
}

/**
 * Builds a link card (title + optional description) from an authored list item.
 * @param {Element} li list item containing a link and an optional paragraph
 * @returns {HTMLAnchorElement} card
 */
function buildCard(li) {
  const source = li.querySelector(':scope > a');
  const card = document.createElement('a');
  card.className = 'nav-card';
  card.href = source.getAttribute('href');
  const title = document.createElement('span');
  title.className = 'nav-card-title';
  title.textContent = source.textContent.trim();
  card.append(title);
  const desc = li.querySelector(':scope > p');
  if (desc) {
    const d = document.createElement('span');
    d.className = 'nav-card-desc';
    d.textContent = desc.textContent.trim();
    card.append(d);
  }
  return card;
}

/**
 * Builds a dropdown panel from the nested list of a top-level nav item.
 * Items with a link become cards; items without a link but with a nested list
 * become labelled groups shown beside the cards.
 * @param {Element} list nested list
 * @returns {HTMLDivElement} panel
 */
function buildPanel(list) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  panel.append(inner);

  const cards = document.createElement('div');
  cards.className = 'nav-panel-cards';
  const groups = [];
  [...list.children].forEach((li) => {
    if (li.querySelector(':scope > a')) {
      cards.append(buildCard(li));
    } else if (li.querySelector(':scope > ul')) {
      const group = document.createElement('div');
      group.className = 'nav-panel-group';
      const label = document.createElement('p');
      label.className = 'nav-panel-group-label';
      label.textContent = ownLabel(li);
      const grid = document.createElement('div');
      grid.className = 'nav-panel-group-cards';
      [...li.querySelector(':scope > ul').children]
        .filter((item) => item.querySelector(':scope > a'))
        .forEach((item) => grid.append(buildCard(item)));
      group.append(label, grid);
      groups.push(group);
    }
  });
  inner.append(cards, ...groups);
  if (groups.length) panel.classList.add('nav-panel-split');
  return panel;
}

function closeAllDrops(nav, except = null) {
  nav.querySelectorAll('.nav-drop').forEach((drop) => {
    if (drop === except) return;
    drop.classList.remove('is-open');
    drop.querySelector('.nav-drop-trigger').setAttribute('aria-expanded', 'false');
  });
}

function setDrop(nav, drop, open) {
  if (open) closeAllDrops(nav, drop);
  drop.classList.toggle('is-open', open);
  drop.querySelector('.nav-drop-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = !expanded && !isDesktop.matches ? 'hidden' : '';
  if (expanded) closeAllDrops(nav);
}

/**
 * Builds the top-level navigation list with dropdown triggers.
 * @param {Element} section authored nav section
 * @param {HTMLElement} nav header nav container
 * @returns {HTMLElement} nav landmark wrapping the menu list
 */
function buildSections(section, nav) {
  const wrapper = document.createElement('nav');
  wrapper.className = 'nav-sections';
  wrapper.setAttribute('aria-label', 'Main');
  const list = document.createElement('ul');
  list.className = 'nav-menu-list';
  wrapper.append(list);

  const topList = section.querySelector('ul');
  [...(topList ? topList.children : [])].forEach((li) => {
    const item = document.createElement('li');
    const nested = li.querySelector(':scope > ul');
    const link = li.querySelector(':scope > a');
    if (!nested) {
      if (link) item.append(link);
      list.append(item);
      return;
    }
    item.className = 'nav-drop';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-drop-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.textContent = link ? link.textContent.trim() : ownLabel(li);
    const caret = document.createElement('span');
    caret.className = 'nav-caret';
    caret.setAttribute('aria-hidden', 'true');
    trigger.append(label, caret);
    item.append(trigger, buildPanel(nested));
    list.append(item);

    trigger.addEventListener('click', () => {
      setDrop(nav, item, !item.classList.contains('is-open'));
    });
    item.addEventListener('mouseenter', () => {
      if (isDesktop.matches) setDrop(nav, item, true);
    });
    item.addEventListener('mouseleave', () => {
      if (isDesktop.matches) setDrop(nav, item, false);
    });
  });
  return wrapper;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const [brandSection, navSection, toolsSection] = fragment.querySelectorAll(':scope > div');

  const nav = document.createElement('div');
  nav.id = 'nav';
  nav.className = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  // brand: logo image + wordmark text
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandLink = brandSection && brandSection.querySelector('a');
  if (brandLink) {
    const logo = document.createElement('a');
    logo.className = 'nav-logo';
    logo.href = brandLink.getAttribute('href');
    const img = brandLink.querySelector('img');
    if (img) {
      img.width = 32;
      img.height = 32;
      logo.append(img);
    }
    const text = document.createElement('span');
    text.className = 'nav-logo-text';
    text.append(...[...brandLink.childNodes].filter((n) => n.nodeName !== 'IMG'));
    logo.setAttribute('aria-label', text.textContent.trim());
    logo.append(text);
    brand.append(logo);
  }

  // hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));

  const sections = navSection ? buildSections(navSection, nav) : document.createElement('div');

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  if (toolsSection) {
    toolsSection.querySelectorAll('a').forEach((a) => {
      a.className = 'nav-cta';
      tools.append(a);
    });
  }

  nav.append(brand, sections, tools, hamburger);

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (nav.querySelector('.nav-drop.is-open')) {
      const open = nav.querySelector('.nav-drop.is-open');
      setDrop(nav, open, false);
      open.querySelector('.nav-drop-trigger').focus();
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAllDrops(nav);
  });

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    closeAllDrops(nav);
    toggleMenu(nav, false);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
