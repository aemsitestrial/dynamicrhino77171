export default function decorate(block) {
  // The block has two rows: [0] background image, [1] body text.
  const [imageRow, textRow] = [...block.children];

  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    if (picture) {
      imageRow.className = 'banner-background';
      imageRow.replaceChildren(picture);
    } else {
      imageRow.remove();
    }
  }

  if (textRow) {
    textRow.className = 'banner-content';
  }
}
