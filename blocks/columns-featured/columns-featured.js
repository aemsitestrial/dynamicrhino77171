import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

function isOnlyPicture(col) {
  const pic = col.querySelector('picture');
  if (!pic) return false;
  return col.textContent.trim() === '' && col.querySelectorAll('picture').length === 1;
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-featured-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-featured-row');
    [...row.children].forEach((col) => {
      if (isOnlyPicture(col)) {
        col.classList.add('columns-featured-media');
        const img = col.querySelector('img');
        if (img) {
          const optimized = createOptimizedPicture(img.src, img.alt, false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]);
          moveInstrumentation(img, optimized.querySelector('img'));
          col.querySelector('picture').replaceWith(optimized);
        }
        return;
      }
      col.classList.add('columns-featured-body');

      // Eyebrow tag: plain paragraph(s) before the heading.
      const heading = col.querySelector('h1, h2, h3, h4');
      let prev = heading ? heading.previousElementSibling : null;
      while (prev) {
        if (prev.tagName === 'P' && !prev.querySelector('a, picture')) {
          prev.classList.add('columns-featured-eyebrow');
        }
        prev = prev.previousElementSibling;
      }

      // CTA: trailing paragraph(s) that contain only a link.
      col.querySelectorAll(':scope > p').forEach((p) => {
        const a = p.querySelector('a');
        if (a && p.textContent.trim() === a.textContent.trim()) {
          p.classList.add('columns-featured-cta');
        }
      });
    });
  });
}
