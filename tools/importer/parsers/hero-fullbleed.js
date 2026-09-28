/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-fullbleed. Base: hero.
 * Source: https://wknd-adventures.com/ (section.hero-section.hero-section--full)
 * Structure: row 1 = background image (field:image), row 2 = rich text (field:text)
 *   containing tag paragraph, H1, lead paragraph and CTA links.
 * Generated: 2026-09-28
 */
export default function parse(element, { document }) {
  // Background image: .hero-bg img (fallback: first img in block)
  const image = element.querySelector('.hero-bg img') || element.querySelector('img');

  // Text content lives in .hero-content-inner (fallback: .hero-content / element)
  const content = element.querySelector('.hero-content-inner')
    || element.querySelector('.hero-content')
    || element;

  const tag = content.querySelector('p.tag');
  const heading = content.querySelector('h1, h2');
  const lead = content.querySelector('p.hero-lead') || content.querySelector('p:not(.tag)');
  const ctas = Array.from(content.querySelectorAll('.button-group a, a.accent-button, a.button--ghost'))
    .filter((a, i, arr) => arr.indexOf(a) === i);

  if (!image && !heading && !lead) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: image
  const imageCell = document.createDocumentFragment();
  if (image) {
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image);
  }
  cells.push([imageCell]);

  // Row: text (richtext)
  const textCell = document.createDocumentFragment();
  const textEls = [];
  if (tag) textEls.push(tag);
  if (heading) textEls.push(heading);
  if (lead) textEls.push(lead);
  ctas.forEach((a) => {
    // Flatten the inner span label so the link text is clean
    const label = a.textContent.trim();
    a.textContent = label;
    // EDS button convention: <strong> = primary, <em> = secondary (ghost)
    const wrapper = document.createElement(a.classList.contains('button--ghost') ? 'em' : 'strong');
    wrapper.appendChild(a);
    const p = document.createElement('p');
    p.appendChild(wrapper);
    textEls.push(p);
  });
  if (textEls.length) {
    textCell.appendChild(document.createComment(' field:text '));
    textEls.forEach((el) => textCell.appendChild(el));
  }
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-fullbleed', cells });
  element.replaceWith(block);
}
