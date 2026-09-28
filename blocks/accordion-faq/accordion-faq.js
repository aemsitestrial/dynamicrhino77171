import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

/**
 * One row per item: cell 1 = question (summary), cell 2 = answer body.
 * Rendered as native <details>/<summary> so expand/collapse works without JS state.
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    if (!label) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const question = document.createElement('span');
    question.className = 'accordion-faq-item-question';
    question.append(...label.childNodes);
    const icon = document.createElement('span');
    icon.className = 'accordion-faq-item-icon';
    icon.setAttribute('aria-hidden', 'true');
    summary.append(question, icon);
    moveInstrumentation(label, question);

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-faq-item';
    details.append(summary);

    if (body) {
      body.className = 'accordion-faq-item-body';
      details.append(body);
    }
    row.replaceWith(details);
  });
}
