function buildImage(imageRow, altText) {
  // A reference/image field may already be a <picture>, or it may render as an
  // <a> link pointing at the asset (Universal Editor reference fields do this).
  const picture = imageRow.querySelector('picture');
  if (picture) {
    if (altText) {
      const img = picture.querySelector('img');
      if (img) img.alt = altText;
    }
    return picture;
  }

  const link = imageRow.querySelector('a[href]');
  if (link) {
    const img = document.createElement('img');
    img.src = link.getAttribute('href');
    img.alt = altText || link.textContent.trim();
    img.loading = 'lazy';
    return img;
  }

  return null;
}

export default function decorate(block) {
  const rows = [...block.children];

  // The model produces six rows in groups of three:
  // image1, alt1, text1, image2, alt2, text2.
  const items = [];
  for (let i = 0; i < rows.length; i += 3) {
    const imageRow = rows[i];
    const altRow = rows[i + 1];
    const textRow = rows[i + 2];

    const item = document.createElement('div');
    item.className = 'testblock-item';

    const altText = altRow ? altRow.textContent.trim() : '';
    const image = imageRow ? buildImage(imageRow, altText) : null;
    if (image) {
      const media = document.createElement('div');
      media.className = 'testblock-image';
      media.append(image);
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
