function isImageRow(row) {
  return !!(row && (row.querySelector('picture') || row.querySelector('a[href]')));
}

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
    img.alt = altText || '';
    img.loading = 'lazy';
    return img;
  }

  return null;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Build items by walking the rows. Each item starts at an image row and may
  // be followed by an optional alt-text row and a text row. This tolerates both
  // the older (image, text) authoring and the newer (image, alt, text) model.
  const items = [];
  let i = 0;
  while (i < rows.length) {
    const imageRow = rows[i];

    if (!isImageRow(imageRow)) {
      // Stray non-image row; keep its text as its own item and move on.
      const body = document.createElement('div');
      body.className = 'test-block-text';
      body.append(...imageRow.childNodes);
      const stray = document.createElement('div');
      stray.className = 'test-block-item';
      stray.append(body);
      items.push(stray);
      i += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    // Look ahead: an optional alt row (plain text) then a text row.
    let altText = '';
    let textRow = null;
    let consumed = 1;

    const next = rows[i + 1];
    const after = rows[i + 2];
    if (next && !isImageRow(next) && after && !isImageRow(after)) {
      // image, alt, text
      altText = next.textContent.trim();
      textRow = after;
      consumed = 3;
    } else if (next && !isImageRow(next)) {
      // image, text
      textRow = next;
      consumed = 2;
    }

    const item = document.createElement('div');
    item.className = 'test-block-item';

    const image = buildImage(imageRow, altText);
    if (image) {
      const media = document.createElement('div');
      media.className = 'test-block-image';
      media.append(image);
      item.append(media);
    }

    if (textRow) {
      const body = document.createElement('div');
      body.className = 'test-block-text';
      body.append(...textRow.childNodes);
      item.append(body);
    }

    items.push(item);
    i += consumed;
  }

  block.replaceChildren(...items);
}
