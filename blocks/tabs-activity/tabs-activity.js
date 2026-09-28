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

  // one row per article: cell 1 = tab name, remaining cells = image and text.
  // Rows with the same tab name are grouped into one panel.
  const groups = [];
  [...block.children].forEach((row) => {
    const [labelCell, ...contentCells] = [...row.children];
    const name = labelCell ? labelCell.textContent.trim() : '';
    if (!name) return;
    let group = groups.find((g) => g.name === name);
    if (!group) {
      group = { name, rows: [] };
      groups.push(group);
    }
    group.rows.push({ row, contentCells });
  });

  const panels = groups.map((group, i) => {
    const id = `tabs-activity-${tabBlockCnt}-panel-${i + 1}`;
    const panel = document.createElement('div');
    panel.className = 'tabs-activity-panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-hidden', !!i);
    panel.setAttribute('aria-labelledby', `tab-${id}`);

    const button = document.createElement('button');
    button.className = 'tabs-activity-tab';
    button.id = `tab-${id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    if (i) button.setAttribute('tabindex', '-1');
    button.textContent = group.name;
    button.addEventListener('click', () => selectTab(block, tablist, button, panel));
    tablist.append(button);

    const content = document.createElement('div');
    content.className = 'tabs-activity-panel-content';
    const grid = document.createElement('div');
    grid.className = 'tabs-activity-grid';
    group.rows.forEach(({ row, contentCells }) => {
      const elements = contentCells.flatMap((cell) => {
        const pic = cell.querySelector('picture');
        if (pic && cell.children.length === 1) return [cell.firstElementChild];
        return [...cell.children];
      });
      const card = buildCard(elements);
      moveInstrumentation(row, card);
      grid.append(card);
      row.remove();
    });
    content.append(grid);
    panel.append(content);
    optimizePictures(grid);
    return panel;
  });
  block.append(...panels);

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
    selectTab(block, tablist, buttons[next], panels[next], true);
  });

  block.prepend(tablist);
}
