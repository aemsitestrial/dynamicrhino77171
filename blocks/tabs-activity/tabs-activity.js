import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

// keep track globally of the number of tab blocks on the page (unique ids)
let tabBlockCnt = 0;

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

function hasPicture(el) {
  return el.tagName === 'PICTURE' || !!el.querySelector('picture');
}

function optimizePictures(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

/**
 * Turn one article's elements into a card: image, tag, linked title, description.
 */
function buildCard(elements) {
  const card = document.createElement('div');
  card.className = 'tabs-activity-card';
  const body = document.createElement('div');
  body.className = 'tabs-activity-card-body';

  let headingSeen = false;
  elements.forEach((el) => {
    if (hasPicture(el) && !card.querySelector('.tabs-activity-card-image')) {
      el.classList.add('tabs-activity-card-image');
      card.append(el);
      return;
    }
    if (el.matches(HEADING_SELECTOR)) {
      headingSeen = true;
      el.classList.add('tabs-activity-card-title');
      // make the whole card clickable through the title link
      if (el.querySelector('a')) card.classList.add('tabs-activity-card-linked');
    } else if (!headingSeen && el.tagName === 'P' && !el.querySelector('a')) {
      el.classList.add('tabs-activity-card-tag');
    } else if (el.tagName === 'P') {
      const a = el.querySelector('a');
      if (a && el.textContent.trim() === a.textContent.trim()) {
        el.classList.add('tabs-activity-card-link');
        card.classList.add('tabs-activity-card-linked');
      } else {
        el.classList.add('tabs-activity-card-description');
      }
    }
    body.append(el);
  });

  if (body.childElementCount) card.append(body);
  return card;
}

/**
 * Decorate a tab panel's rich text into a grid of article cards. A new card starts at each
 * image, or at a heading when the current card already has one (image-less articles).
 * Anything authored before the first card stays above the grid as panel intro.
 */
function decoratePanelContent(cell) {
  const children = [...cell.children];
  const groups = [];
  const intro = [];
  let current = null;

  children.forEach((el) => {
    const isImage = hasPicture(el);
    const isHeading = el.matches(HEADING_SELECTOR);
    const hasHeading = !!current && current.some((c) => c.matches(HEADING_SELECTOR));
    const hasImage = !!current && current.some(hasPicture);
    let startsCard = false;
    if (isImage) startsCard = !current || hasImage || hasHeading;
    else if (isHeading) startsCard = !current || hasHeading;

    if (startsCard) {
      current = [el];
      groups.push(current);
    } else if (current) {
      current.push(el);
    } else {
      intro.push(el);
    }
  });

  if (!groups.length) return;

  const grid = document.createElement('div');
  grid.className = 'tabs-activity-grid';
  groups.forEach((els) => grid.append(buildCard(els)));

  if (intro.length) {
    const introEl = document.createElement('div');
    introEl.className = 'tabs-activity-intro';
    introEl.append(...intro);
    cell.append(introEl);
  }
  cell.append(grid);
  optimizePictures(grid);
}

function selectTab(block, tablist, button, tabpanel, focus = false) {
  block.querySelectorAll(':scope > [role=tabpanel]').forEach((panel) => {
    panel.setAttribute('aria-hidden', true);
  });
  tablist.querySelectorAll('button').forEach((btn) => {
    btn.setAttribute('aria-selected', false);
    btn.setAttribute('tabindex', '-1');
  });
  tabpanel.setAttribute('aria-hidden', false);
  button.setAttribute('aria-selected', true);
  button.removeAttribute('tabindex');
  if (focus) button.focus();
}

export default async function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  tabBlockCnt += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-activity-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tabs-activity-tablist-${tabBlockCnt}`;

  // one row per tab: cell 1 = label, cell 2 = rich-text panel content
  const rows = [...block.children].filter((row) => row.firstElementChild
    && row.firstElementChild.textContent.trim() !== '');

  rows.forEach((row, i) => {
    const id = `tabs-activity-${tabBlockCnt}-panel-${i + 1}`;
    const label = row.firstElementChild;

    row.className = 'tabs-activity-panel';
    row.id = id;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-hidden', !!i);
    row.setAttribute('aria-labelledby', `tab-${id}`);

    const button = document.createElement('button');
    button.className = 'tabs-activity-tab';
    button.id = `tab-${id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    if (i) button.setAttribute('tabindex', '-1');
    const labelInner = label.querySelector(`${HEADING_SELECTOR}, p`);
    button.textContent = (labelInner || label).textContent.trim();
    button.addEventListener('click', () => selectTab(block, tablist, button, row));
    tablist.append(button);

    // remove the label cell (also removes it from the UE tree)
    label.remove();

    // all remaining cells form the panel content
    [...row.children].forEach((cell) => {
      cell.classList.add('tabs-activity-panel-content');
      decoratePanelContent(cell);
    });
  });

  // arrow-key navigation between tabs
  tablist.addEventListener('keydown', (e) => {
    const buttons = [...tablist.querySelectorAll('button')];
    const idx = buttons.indexOf(document.activeElement);
    if (idx < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next < 0) return;
    e.preventDefault();
    selectTab(block, tablist, buttons[next], rows[next], true);
  });

  block.prepend(tablist);
}
