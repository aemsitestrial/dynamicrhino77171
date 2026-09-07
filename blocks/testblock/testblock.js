export default function decorate(block) {
  const rows = [...block.children];

  // The model produces four rows in order: image1, text1, image2, text2.
  // Group each image with its text into a single column item.
  const items = [];
  for (let i = 0; i < rows.length; i += 2) {
    const imageRow = rows[i];
    const textRow = rows[i + 1];

    const item = document.createElement('div');
    item.className = 'testblock-item';

    const picture = imageRow?.querySelector('picture');
    if (picture) {
      const media = document.createElement('div');
      media.className = 'testblock-image';
      media.append(picture);
      item.append(media);
    }

    if (textRow) {
      const body = document.createElement('div');
      body.className = 'testblock-text';
      body.append(...textRow.childNodes);
      item.append(body);
    }

    items.push(item);
  }

  block.replaceChildren(...items);
}
