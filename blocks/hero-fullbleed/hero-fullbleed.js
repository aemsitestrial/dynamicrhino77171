import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// No authorable options yet; kept so future variations branch in one place.
const OPTION_CLASSES = [];

/**
 * A paragraph that holds nothing but links (optionally wrapped in strong/em) is a CTA row.
 */
function isCtaParagraph(p) {
  const links = p.querySelectorAll('a');
  if (!links.length) return false;
  const text = p.textContent.replace(/\s+/g, '');
  const linkText = [...links].map((a) => a.textContent).join('').replace(/\s+/g, '');
  return text === linkText;
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-fullbleed-media';
  const content = document.createElement('div');
  content.className = 'hero-fullbleed-content';

  rows.forEach((row) => {
    const pic = row.querySelector('picture');
    const hasText = row.querySelector('h1, h2, h3, h4, h5, h6, p:not(:has(picture))');
    if (pic && !media.querySelector('picture')) {
      const img = pic.querySelector('img');
      const optimized = createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]);
      moveInstrumentation(img, optimized.querySelector('img'));
      pic.replaceWith(optimized);
      media.append(optimized);
    }
    if (hasText) {
      const cell = row.querySelector(':scope > div') || row;
      content.append(...cell.childNodes);
      // keep the richtext field binding (data-aue-*) on the element that now holds the text
      if (cell !== row) moveInstrumentation(cell, content);
    }
    row.remove();
  });

  // Eyebrow tag: a plain paragraph that precedes the main heading.
  const heading = content.querySelector('h1, h2, h3');
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && !prev.querySelector('a, picture')) {
        prev.classList.add('hero-fullbleed-eyebrow');
      }
      prev = prev.previousElementSibling;
    }
  }

  // Group CTA paragraphs into one actions row.
  const ctas = [...content.querySelectorAll(':scope > p')].filter(isCtaParagraph);
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-fullbleed-actions';
    ctas[0].before(actions);
    ctas.forEach((p) => {
      p.classList.add('hero-fullbleed-action');
      actions.append(p);
    });
  }

  const overlay = document.createElement('div');
  overlay.className = 'hero-fullbleed-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  if (media.querySelector('picture')) block.append(media, overlay);
  else block.classList.add('hero-fullbleed-no-image');
  block.append(content);
}
