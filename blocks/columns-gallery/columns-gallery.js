import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

/**
 * N rows x M image cells, rendered as an equal-width image grid.
 * The column count follows the first row's cell count (default 3).
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const cols = block.firstElementChild ? block.firstElementChild.children.length : 3;
  block.style.setProperty('--columns-gallery-cols', cols || 3);

  [...block.children].forEach((row) => {
    row.classList.add('columns-gallery-row');
    [...row.children].forEach((cell) => {
      cell.classList.add('columns-gallery-item');
      const img = cell.querySelector('picture > img');
      if (!img) {
        if (!cell.textContent.trim()) cell.classList.add('columns-gallery-empty');
        return;
      }
      const optimized = createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 900px)', width: '750' },
        { width: '600' },
      ]);
      moveInstrumentation(img, optimized.querySelector('img'));
      img.closest('picture').replaceWith(optimized);
    });
  });
}
