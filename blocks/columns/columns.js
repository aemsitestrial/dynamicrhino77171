import { loadCSS } from '../../scripts/aem.js';

// Columns variants authored as "Columns (featured)" etc. AEM stores these as the core
// Columns component with a class, so hand them off to the variant's own block code.
const VARIANTS = ['featured', 'numbered', 'gallery'];

async function decorateVariant(block, variant) {
  const name = `columns-${variant}`;
  block.classList.remove('columns', variant);
  block.classList.add(name);
  block.dataset.blockName = name;
  block.parentElement?.classList.add(`${name}-wrapper`);
  block.closest('.section')?.classList.add(`${name}-container`);
  const base = `${window.hlx.codeBasePath}/blocks/${name}/${name}`;
  const [mod] = await Promise.all([import(`${base}.js`), loadCSS(`${base}.css`)]);
  await mod.default(block);
}

export default async function decorate(block) {
  const variant = VARIANTS.find((v) => block.classList.contains(v));
  if (variant) {
    await decorateVariant(block, variant);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
