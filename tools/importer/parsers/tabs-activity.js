/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-activity. Base: tabs.
 * Source: https://wknd-adventures.com/ (.tab-container)
 * Structure: one row per article — [tab | image | text] (xwalk item model tabs-activity-item).
 *   Tab names come from .tab-menu-link buttons, articles from the .tab-pane at the same index.
 *   text cell: tag paragraph, linked H3 title, description.
 * Iteration of articles is keyed on .article-card-body (inner block wrapper), not on the
 * a.article-card anchors, to avoid html2md adjacent-anchor merging. The href is read
 * from the wrapping anchor and re-attached to the heading.
 * Generated: 2026-09-28
 */
export default function parse(element, { document }) { // one row per article
  const labels = Array.from(element.querySelectorAll('.tab-menu .tab-menu-link, .tab-menu button'))
    .filter((b, i, arr) => arr.indexOf(b) === i);
  const panes = Array.from(element.querySelectorAll('.tab-pane'));

  if (!labels.length && !panes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const getArticles = (pane) => {
    let items = Array.from(pane.querySelectorAll('.article-card-body')).map((body) => ({
      body,
      imageWrap: body.parentElement && body.parentElement.querySelector('.article-card-image'),
      href: (body.closest('a') && body.closest('a').getAttribute('href')) || '',
    }));
    if (!items.length) {
      // Fallback: iterate the card anchors directly
      items = Array.from(pane.querySelectorAll('a.article-card')).map((card) => ({
        body: card,
        imageWrap: card.querySelector('.article-card-image'),
        href: card.getAttribute('href') || '',
      }));
    }
    return items;
  };

  const cells = [];
  const count = Math.max(labels.length, panes.length);
  for (let i = 0; i < count; i += 1) {
    const labelText = labels[i] ? labels[i].textContent.trim() : '';
    const articles = panes[i] ? getArticles(panes[i]) : [];
    articles.forEach(({ body, imageWrap, href }) => {
      const tabCell = document.createDocumentFragment();
      if (labelText) {
        tabCell.appendChild(document.createComment(' field:tab '));
        tabCell.appendChild(document.createTextNode(labelText));
      }

      const imageCell = document.createDocumentFragment();
      const img = (imageWrap || body).querySelector('img');
      if (img) {
        imageCell.appendChild(document.createComment(' field:image '));
        imageCell.appendChild(img);
      }

      const textCell = document.createDocumentFragment();
      const nodes = [];
      const tag = body.querySelector('.article-card-meta .tag, .tag');
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      const desc = body.querySelector('p');
      if (tag) {
        const p = document.createElement('p');
        p.textContent = tag.textContent.trim();
        nodes.push(p);
      }
      if (heading) {
        const h3 = document.createElement('h3');
        const text = heading.textContent.trim();
        if (href) {
          const a = document.createElement('a');
          a.setAttribute('href', href);
          a.textContent = text;
          h3.appendChild(a);
        } else {
          h3.textContent = text;
        }
        nodes.push(h3);
      }
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        nodes.push(p);
      }
      if (nodes.length) {
        textCell.appendChild(document.createComment(' field:text '));
        nodes.forEach((n) => textCell.appendChild(n));
      }

      cells.push([tabCell, imageCell, textCell]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-activity', cells });
  element.replaceWith(block);
}
