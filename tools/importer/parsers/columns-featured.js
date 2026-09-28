/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd-adventures.com/ (.featured-article)
 * Structure: 1 row x 2 cells — [image | tag, h2, description, CTA].
 * Columns blocks do not use field hints (xwalk hinting rule).
 * Generated: 2026-09-28
 */
export default function parse(element, { document }) {
  const imageWrap = element.querySelector(':scope > .featured-article-image');
  const image = (imageWrap || element).querySelector('img');

  // Text column: first direct child that is not the image wrapper
  const textCol = Array.from(element.children).find((c) => c !== imageWrap && !c.querySelector('img'))
    || element;

  const tag = textCol.querySelector('p.tag');
  const heading = textCol.querySelector('h1, h2, h3');
  const desc = textCol.querySelector('p:not(.tag)');
  const ctas = Array.from(textCol.querySelectorAll('.featured-article-footer a, a.button'))
    .filter((a, i, arr) => arr.indexOf(a) === i);

  if (!image && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const imageCell = [];
  if (image) imageCell.push(image);

  const textCell = [];
  if (tag) textCell.push(tag);
  if (heading) textCell.push(heading);
  if (desc) textCell.push(desc);
  ctas.forEach((a) => {
    a.textContent = a.textContent.trim();
    // EDS button convention: <strong> = primary, <em> = secondary (ghost)
    const wrapper = document.createElement(a.classList.contains('button--ghost') ? 'em' : 'strong');
    wrapper.appendChild(a);
    const p = document.createElement('p');
    p.appendChild(wrapper);
    textCell.push(p);
  });

  const cells = [[imageCell, textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (featured)', cells });
  element.replaceWith(block);
}
