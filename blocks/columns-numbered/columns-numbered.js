const OPTION_CLASSES = [];

/**
 * N rows x 2 cells: cell 1 = number (e.g. "01"), cell 2 = H3 + paragraph.
 * Each row becomes one numbered item; items stack vertically, divided by rules.
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  [...block.children].forEach((row) => {
    row.classList.add('columns-numbered-item');
    const cells = [...row.children];
    if (cells.length === 1) {
      // author omitted the number cell: render the text with an empty number slot
      cells[0].classList.add('columns-numbered-body');
      const num = document.createElement('div');
      num.className = 'columns-numbered-number';
      row.prepend(num);
      return;
    }
    const [numberCell, ...rest] = cells;
    numberCell.classList.add('columns-numbered-number');
    rest.forEach((cell) => cell.classList.add('columns-numbered-body'));
  });
}
