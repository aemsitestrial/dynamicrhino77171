function buildImage(imageRow) {
  // A reference/image field may already be a <picture>, or it may render as an
  // <a> link pointing at the asset (Universal Editor reference fields do this).
  const picture = imageRow.querySelector('picture');
  if (picture) return picture;

  const link = imageRow.querySelector('a[href]');
  if (link) {
    const img = document.createElement('img');
    img.src = link.getAttribute('href');
    img.alt = link.textContent.trim();
    img.loading = 'lazy';
    return img;
  }

  return null;
}

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

    const image = imageRow ? buildImage(imageRow) : null;
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
