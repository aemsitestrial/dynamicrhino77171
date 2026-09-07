export default function decorate(block) {
  // The model produces two rows: [0] word/term, [1] definition.
  const [wordRow, definitionRow] = [...block.children];

  if (wordRow) {
    wordRow.className = 'word-and-definition-term';
  }

  if (definitionRow) {
    definitionRow.className = 'word-and-definition-desc';
  }
}
