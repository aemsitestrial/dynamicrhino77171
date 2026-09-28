/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-numbered. Base: columns.
 * Source: https://wknd-adventures.com/ (.editorial-index)
 * Structure: one row per .editorial-index-item, 2 cells — [number | h3 + paragraph].
 * Columns blocks do not use field hints (xwalk hinting rule).
 * Generated: 2026-09-28
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll(':scope > .editorial-index-item'));
  if (!items.length) items = Array.from(element.querySelectorAll('.editorial-index-item'));

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const numberEl = item.querySelector('.editorial-index-number');
    const numberCell = [];
    if (numberEl) {
      const p = document.createElement('p');
      p.textContent = numberEl.textContent.trim();
      numberCell.push(p);
    }

    const heading = item.querySelector('h1, h2, h3, h4, h5, h6');
    const paras = Array.from(item.querySelectorAll('p'));
    const textCell = [];
    if (heading) textCell.push(heading);
    textCell.push(...paras);

    cells.push([numberCell.length ? numberCell : '', textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (numbered)', cells });
  element.replaceWith(block);
}
