/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://wknd-adventures.com/ (.faq-list)
 * Structure: one row per .faq-item — [summary (question) | text (answer richtext)].
 * Generated: 2026-09-28
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > .faq-item'));
  const fallbackItems = items.length ? items : Array.from(element.querySelectorAll('.faq-item'));

  if (!fallbackItems.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  fallbackItems.forEach((item) => {
    const q = item.querySelector('.faq-question');
    // Question text is in the first span (the second span is the icon)
    const qSpan = q && (q.querySelector('span:not(.faq-icon)') || q);
    const questionText = qSpan ? qSpan.textContent.trim() : '';
    const answer = item.querySelector('.faq-answer');

    const summaryCell = document.createDocumentFragment();
    if (questionText) {
      summaryCell.appendChild(document.createComment(' field:summary '));
      summaryCell.appendChild(document.createTextNode(questionText));
    }

    const textCell = document.createDocumentFragment();
    if (answer && answer.textContent.trim()) {
      textCell.appendChild(document.createComment(' field:text '));
      // Answer is bare text in a div; wrap in a paragraph unless it already has block children
      if (answer.querySelector('p, ul, ol, h1, h2, h3, h4, h5, h6')) {
        Array.from(answer.childNodes).forEach((n) => textCell.appendChild(n));
      } else {
        const p = document.createElement('p');
        p.innerHTML = answer.innerHTML.trim();
        textCell.appendChild(p);
      }
    }

    cells.push([summaryCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
