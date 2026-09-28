/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-gallery. Base: columns.
 * Source: https://wknd-adventures.com/ (.grid-layout.grid-images)
 * Structure: 1 row x N image cells (3 on source).
 * Columns blocks do not use field hints (xwalk hinting rule).
 * Generated: 2026-09-28
 */
export default function parse(element, { document }) {
  let images = Array.from(element.querySelectorAll(':scope > img.gallery-img'));
  if (!images.length) images = Array.from(element.querySelectorAll('img'));

  if (!images.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [images.map((img) => [img])];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (gallery)', cells });
  element.replaceWith(block);
}
