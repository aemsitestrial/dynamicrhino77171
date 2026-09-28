/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroFullbleedParser from './parsers/hero-fullbleed.js';
import columnsFeaturedParser from './parsers/columns-featured.js';
import tabsActivityParser from './parsers/tabs-activity.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import columnsNumberedParser from './parsers/columns-numbered.js';
import columnsGalleryParser from './parsers/columns-gallery.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-fullbleed': heroFullbleedParser,
  'columns-featured': columnsFeaturedParser,
  'tabs-activity': tabsActivityParser,
  'accordion-faq': accordionFaqParser,
  'columns-numbered': columnsNumberedParser,
  'columns-gallery': columnsGalleryParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'WKND Adventures homepage: full-bleed hero, featured article, activity tabs, ticker strip, start-here CTA, FAQ, numbered editorial list, photo gallery, closing CTA',
  urls: [
    'https://wknd-adventures.com/',
  ],
  blocks: [
    { name: 'hero-fullbleed', instances: ['section.hero-section.hero-section--full'] },
    { name: 'columns-featured', instances: ['.featured-article'] },
    { name: 'tabs-activity', instances: ['.tab-container'] },
    { name: 'accordion-faq', instances: ['.faq-list'] },
    { name: 'columns-numbered', instances: ['.editorial-index'] },
    { name: 'columns-gallery', instances: ['.grid-layout.grid-images'] },
  ],
  sections: [
    {
      id: '1',
      name: 'hero',
      selector: ['section.hero-section.hero-section--full'],
      style: null,
      blocks: ['hero-fullbleed'],
      defaultContent: [],
    },
    {
      id: '2',
      name: 'featured-article',
      selector: ['section.secondary-section:has(.featured-article)', '#main-content > section.section.secondary-section:nth-of-type(2)'],
      style: 'secondary',
      blocks: ['columns-featured'],
      defaultContent: [],
    },
    {
      id: '3',
      name: 'browse-by-activity',
      selector: ['section.section:has(.tab-container)', '#main-content > section.section:nth-of-type(3)'],
      style: null,
      blocks: ['tabs-activity'],
      defaultContent: ['.section-heading'],
    },
    {
      id: '4',
      name: 'ticker',
      selector: ['.ticker-strip'],
      style: 'ticker',
      blocks: [],
      defaultContent: ['.ticker-track'],
    },
    {
      id: '5',
      name: 'start-here',
      selector: ['section.inverse-section:not(:has(.grid-images))', '#main-content > section.section.inverse-section:nth-of-type(4)'],
      style: 'dark',
      blocks: [],
      defaultContent: ['.container > .tag', '.container > h2', '.container > p.paragraph-lg', '.button-group'],
    },
    {
      id: '6',
      name: 'quick-answers',
      selector: ['section.section:has(.faq-list)', '#main-content > section.section:nth-of-type(5)'],
      style: null,
      blocks: ['accordion-faq'],
      defaultContent: ['.section-heading'],
    },
    {
      id: '7',
      name: 'how-we-work',
      selector: ['section.secondary-section:has(.editorial-index)', '#main-content > section.section.secondary-section:nth-of-type(6)'],
      style: 'secondary',
      blocks: ['columns-numbered'],
      defaultContent: ['.section-heading'],
    },
    {
      id: '8',
      name: 'in-the-field',
      selector: ['section.inverse-section:has(.grid-images)', '#main-content > section.section.inverse-section:nth-of-type(7)'],
      style: 'dark',
      blocks: ['columns-gallery'],
      defaultContent: ['.section-heading', '.utility-margin-top-lg'],
    },
    {
      id: '9',
      name: 'closing-cta',
      selector: ['section.accent-section'],
      style: 'accent',
      blocks: [],
      defaultContent: ['.container > h2', '.container > p', '.button-group'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections
const transformers = [
  wkndCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (cleanup + section break markers)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path - root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    // root URL is imported as a new page (/wknd-home) so the existing AEM homepage is kept
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/wknd-home' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
