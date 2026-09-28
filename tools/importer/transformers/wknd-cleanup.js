/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Adventures site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html:
 *   - a.skip-link                  (<a href="#main-content" class="skip-link">)
 *   - div.navbar                   (site header / megamenu; nav migrated separately)
 *   - footer.footer.inverse-footer (site footer; migrated separately)
 *   - .ticker-strip > .ticker-track (marquee word list, duplicated twice for looping,
 *                                    words separated by span.ticker-sep)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Collapse the looping ticker into a single authorable bulleted list.
 * The source repeats the word list twice and separates words with
 * span.ticker-sep (presentation only). Authors type the list once.
 */
function normalizeTicker(element) {
  element.querySelectorAll('.ticker-strip .ticker-track').forEach((track) => {
    // The importer unwraps attribute-less <span>s before transformers run, so the
    // words may be bare text nodes; split on the separator text instead.
    const words = track.textContent.split('·')
      .map((word) => word.trim())
      .filter(Boolean);
    if (!words.length) return;

    // Detect the loop copy: smallest period n where the list is words[0..n) repeated.
    let unique = words;
    for (let n = 1; n <= words.length / 2; n += 1) {
      if (words.length % n === 0 && words.every((w, i) => w === words[i % n])) {
        unique = words.slice(0, n);
        break;
      }
    }

    const ul = document.createElement('ul');
    unique.forEach((word) => {
      const li = document.createElement('li');
      li.textContent = word;
      ul.append(li);
    });
    track.replaceChildren(ul);
  });
}

/**
 * Resolve bare relative image paths (e.g. "images/adventures/x.jpg") to absolute URLs.
 * WebImporter.rules.adjustImageUrls only handles "./", "../" and "/" prefixes and
 * removes any other relative src, which dropped the hero, featured and gallery images.
 */
function absolutizeImageSrcs(element, baseUrl) {
  if (!baseUrl) return;
  element.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || /^(data:|blob:|[a-z][a-z0-9+.-]*:\/\/)/i.test(src)) return;
    try {
      img.setAttribute('src', new URL(src, baseUrl).toString());
    } catch (e) {
      // leave unresolvable src as-is
    }
  });
}

/**
 * Split each .button-group into one paragraph per CTA so EDS decorates them as
 * buttons: <strong> = primary (.button / .accent-button), <em> = secondary (.button--ghost).
 */
function normalizeButtonGroups(element) {
  element.querySelectorAll('.button-group').forEach((group) => {
    const links = [...group.querySelectorAll('a')];
    if (!links.length) return;
    const paras = links.map((a) => {
      a.textContent = a.textContent.trim();
      const wrapper = document.createElement(a.classList.contains('button--ghost') ? 'em' : 'strong');
      wrapper.append(a);
      const p = document.createElement('p');
      p.append(wrapper);
      return p;
    });
    group.replaceChildren(...paras);
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Skip link is accessibility chrome, not authorable content.
    WebImporter.DOMUtils.remove(element, ['a.skip-link']);
    // Make image paths absolute before parsers clone/move images.
    absolutizeImageSrcs(element, (payload.params && payload.params.originalURL) || payload.url);
    // Ticker: drop the duplicated loop copy and separators before parsing.
    normalizeTicker(element);
    // CTA groups: one paragraph per button, typed via strong/em.
    normalizeButtonGroups(element);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome: header (div.navbar) and footer are handled by nav/footer migration.
    WebImporter.DOMUtils.remove(element, [
      'div.navbar',
      'footer.footer.inverse-footer',
      'a.skip-link',
      'noscript',
      'link',
      'iframe',
    ]);
  }
}
