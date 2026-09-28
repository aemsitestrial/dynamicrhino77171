/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-fullbleed.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".hero-bg img") || element.querySelector("img");
    const content = element.querySelector(".hero-content-inner") || element.querySelector(".hero-content") || element;
    const tag = content.querySelector("p.tag");
    const heading = content.querySelector("h1, h2");
    const lead = content.querySelector("p.hero-lead") || content.querySelector("p:not(.tag)");
    const ctas = Array.from(content.querySelectorAll(".button-group a, a.accent-button, a.button--ghost")).filter((a, i, arr) => arr.indexOf(a) === i);
    if (!image && !heading && !lead) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document2.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document2.createComment(" field:image "));
      imageCell.appendChild(image);
    }
    cells.push([imageCell]);
    const textCell = document2.createDocumentFragment();
    const textEls = [];
    if (tag) textEls.push(tag);
    if (heading) textEls.push(heading);
    if (lead) textEls.push(lead);
    ctas.forEach((a) => {
      const label = a.textContent.trim();
      a.textContent = label;
      const wrapper = document2.createElement(a.classList.contains("button--ghost") ? "em" : "strong");
      wrapper.appendChild(a);
      const p = document2.createElement("p");
      p.appendChild(wrapper);
      textEls.push(p);
    });
    if (textEls.length) {
      textCell.appendChild(document2.createComment(" field:text "));
      textEls.forEach((el) => textCell.appendChild(el));
    }
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-fullbleed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-featured.js
  function parse2(element, { document: document2 }) {
    const imageWrap = element.querySelector(":scope > .featured-article-image");
    const image = (imageWrap || element).querySelector("img");
    const textCol = Array.from(element.children).find((c) => c !== imageWrap && !c.querySelector("img")) || element;
    const tag = textCol.querySelector("p.tag");
    const heading = textCol.querySelector("h1, h2, h3");
    const desc = textCol.querySelector("p:not(.tag)");
    const ctas = Array.from(textCol.querySelectorAll(".featured-article-footer a, a.button")).filter((a, i, arr) => arr.indexOf(a) === i);
    if (!image && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageCell = [];
    if (image) imageCell.push(image);
    const textCell = [];
    if (tag) textCell.push(tag);
    if (heading) textCell.push(heading);
    if (desc) textCell.push(desc);
    ctas.forEach((a) => {
      a.textContent = a.textContent.trim();
      const wrapper = document2.createElement(a.classList.contains("button--ghost") ? "em" : "strong");
      wrapper.appendChild(a);
      const p = document2.createElement("p");
      p.appendChild(wrapper);
      textCell.push(p);
    });
    const cells = [[imageCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Columns (featured)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-activity.js
  function parse3(element, { document: document2 }) {
    const labels = Array.from(element.querySelectorAll(".tab-menu .tab-menu-link, .tab-menu button")).filter((b, i, arr) => arr.indexOf(b) === i);
    const panes = Array.from(element.querySelectorAll(".tab-pane"));
    if (!labels.length && !panes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const getArticles = (pane) => {
      let items = Array.from(pane.querySelectorAll(".article-card-body")).map((body) => ({
        body,
        imageWrap: body.parentElement && body.parentElement.querySelector(".article-card-image"),
        href: body.closest("a") && body.closest("a").getAttribute("href") || ""
      }));
      if (!items.length) {
        items = Array.from(pane.querySelectorAll("a.article-card")).map((card) => ({
          body: card,
          imageWrap: card.querySelector(".article-card-image"),
          href: card.getAttribute("href") || ""
        }));
      }
      return items;
    };
    const cells = [];
    const count = Math.max(labels.length, panes.length);
    for (let i = 0; i < count; i += 1) {
      const labelText = labels[i] ? labels[i].textContent.trim() : "";
      const articles = panes[i] ? getArticles(panes[i]) : [];
      articles.forEach(({ body, imageWrap, href }) => {
        const tabCell = document2.createDocumentFragment();
        if (labelText) {
          tabCell.appendChild(document2.createComment(" field:tab "));
          tabCell.appendChild(document2.createTextNode(labelText));
        }
        const imageCell = document2.createDocumentFragment();
        const img = (imageWrap || body).querySelector("img");
        if (img) {
          imageCell.appendChild(document2.createComment(" field:image "));
          imageCell.appendChild(img);
        }
        const textCell = document2.createDocumentFragment();
        const nodes = [];
        const tag = body.querySelector(".article-card-meta .tag, .tag");
        const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
        const desc = body.querySelector("p");
        if (tag) {
          const p = document2.createElement("p");
          p.textContent = tag.textContent.trim();
          nodes.push(p);
        }
        if (heading) {
          const h3 = document2.createElement("h3");
          const text = heading.textContent.trim();
          if (href) {
            const a = document2.createElement("a");
            a.setAttribute("href", href);
            a.textContent = text;
            h3.appendChild(a);
          } else {
            h3.textContent = text;
          }
          nodes.push(h3);
        }
        if (desc) {
          const p = document2.createElement("p");
          p.textContent = desc.textContent.trim();
          nodes.push(p);
        }
        if (nodes.length) {
          textCell.appendChild(document2.createComment(" field:text "));
          nodes.forEach((n) => textCell.appendChild(n));
        }
        cells.push([tabCell, imageCell, textCell]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-activity", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse4(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > .faq-item"));
    const fallbackItems = items.length ? items : Array.from(element.querySelectorAll(".faq-item"));
    if (!fallbackItems.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    fallbackItems.forEach((item) => {
      const q = item.querySelector(".faq-question");
      const qSpan = q && (q.querySelector("span:not(.faq-icon)") || q);
      const questionText = qSpan ? qSpan.textContent.trim() : "";
      const answer = item.querySelector(".faq-answer");
      const summaryCell = document2.createDocumentFragment();
      if (questionText) {
        summaryCell.appendChild(document2.createComment(" field:summary "));
        summaryCell.appendChild(document2.createTextNode(questionText));
      }
      const textCell = document2.createDocumentFragment();
      if (answer && answer.textContent.trim()) {
        textCell.appendChild(document2.createComment(" field:text "));
        if (answer.querySelector("p, ul, ol, h1, h2, h3, h4, h5, h6")) {
          Array.from(answer.childNodes).forEach((n) => textCell.appendChild(n));
        } else {
          const p = document2.createElement("p");
          p.innerHTML = answer.innerHTML.trim();
          textCell.appendChild(p);
        }
      }
      cells.push([summaryCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-numbered.js
  function parse5(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(":scope > .editorial-index-item"));
    if (!items.length) items = Array.from(element.querySelectorAll(".editorial-index-item"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const numberEl = item.querySelector(".editorial-index-number");
      const numberCell = [];
      if (numberEl) {
        const p = document2.createElement("p");
        p.textContent = numberEl.textContent.trim();
        numberCell.push(p);
      }
      const heading = item.querySelector("h1, h2, h3, h4, h5, h6");
      const paras = Array.from(item.querySelectorAll("p"));
      const textCell = [];
      if (heading) textCell.push(heading);
      textCell.push(...paras);
      cells.push([numberCell.length ? numberCell : "", textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Columns (numbered)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-gallery.js
  function parse6(element, { document: document2 }) {
    let images = Array.from(element.querySelectorAll(":scope > img.gallery-img"));
    if (!images.length) images = Array.from(element.querySelectorAll("img"));
    if (!images.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [images.map((img) => [img])];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Columns (gallery)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function normalizeTicker(element) {
    element.querySelectorAll(".ticker-strip .ticker-track").forEach((track) => {
      const words = track.textContent.split("\xB7").map((word) => word.trim()).filter(Boolean);
      if (!words.length) return;
      let unique = words;
      for (let n = 1; n <= words.length / 2; n += 1) {
        if (words.length % n === 0 && words.every((w, i) => w === words[i % n])) {
          unique = words.slice(0, n);
          break;
        }
      }
      const ul = document.createElement("ul");
      unique.forEach((word) => {
        const li = document.createElement("li");
        li.textContent = word;
        ul.append(li);
      });
      track.replaceChildren(ul);
    });
  }
  function absolutizeImageSrcs(element, baseUrl) {
    if (!baseUrl) return;
    element.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      if (!src || /^(data:|blob:|[a-z][a-z0-9+.-]*:\/\/)/i.test(src)) return;
      try {
        img.setAttribute("src", new URL(src, baseUrl).toString());
      } catch (e) {
      }
    });
  }
  function normalizeButtonGroups(element) {
    element.querySelectorAll(".button-group").forEach((group) => {
      const links = [...group.querySelectorAll("a")];
      if (!links.length) return;
      const paras = links.map((a) => {
        a.textContent = a.textContent.trim();
        const wrapper = document.createElement(a.classList.contains("button--ghost") ? "em" : "strong");
        wrapper.append(a);
        const p = document.createElement("p");
        p.append(wrapper);
        return p;
      });
      group.replaceChildren(...paras);
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["a.skip-link"]);
      absolutizeImageSrcs(element, payload.params && payload.params.originalURL || payload.url);
      normalizeTicker(element);
      normalizeButtonGroups(element);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "div.navbar",
        "footer.footer.inverse-footer",
        "a.skip-link",
        "noscript",
        "link",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-fullbleed": parse,
    "columns-featured": parse2,
    "tabs-activity": parse3,
    "accordion-faq": parse4,
    "columns-numbered": parse5,
    "columns-gallery": parse6
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "WKND Adventures homepage: full-bleed hero, featured article, activity tabs, ticker strip, start-here CTA, FAQ, numbered editorial list, photo gallery, closing CTA",
    urls: [
      "https://wknd-adventures.com/"
    ],
    blocks: [
      { name: "hero-fullbleed", instances: ["section.hero-section.hero-section--full"] },
      { name: "columns-featured", instances: [".featured-article"] },
      { name: "tabs-activity", instances: [".tab-container"] },
      { name: "accordion-faq", instances: [".faq-list"] },
      { name: "columns-numbered", instances: [".editorial-index"] },
      { name: "columns-gallery", instances: [".grid-layout.grid-images"] }
    ],
    sections: [
      {
        id: "1",
        name: "hero",
        selector: ["section.hero-section.hero-section--full"],
        style: null,
        blocks: ["hero-fullbleed"],
        defaultContent: []
      },
      {
        id: "2",
        name: "featured-article",
        selector: ["section.secondary-section:has(.featured-article)", "#main-content > section.section.secondary-section:nth-of-type(2)"],
        style: "secondary",
        blocks: ["columns-featured"],
        defaultContent: []
      },
      {
        id: "3",
        name: "browse-by-activity",
        selector: ["section.section:has(.tab-container)", "#main-content > section.section:nth-of-type(3)"],
        style: null,
        blocks: ["tabs-activity"],
        defaultContent: [".section-heading"]
      },
      {
        id: "4",
        name: "ticker",
        selector: [".ticker-strip"],
        style: "ticker",
        blocks: [],
        defaultContent: [".ticker-track"]
      },
      {
        id: "5",
        name: "start-here",
        selector: ["section.inverse-section:not(:has(.grid-images))", "#main-content > section.section.inverse-section:nth-of-type(4)"],
        style: "dark",
        blocks: [],
        defaultContent: [".container > .tag", ".container > h2", ".container > p.paragraph-lg", ".button-group"]
      },
      {
        id: "6",
        name: "quick-answers",
        selector: ["section.section:has(.faq-list)", "#main-content > section.section:nth-of-type(5)"],
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: [".section-heading"]
      },
      {
        id: "7",
        name: "how-we-work",
        selector: ["section.secondary-section:has(.editorial-index)", "#main-content > section.section.secondary-section:nth-of-type(6)"],
        style: "secondary",
        blocks: ["columns-numbered"],
        defaultContent: [".section-heading"]
      },
      {
        id: "8",
        name: "in-the-field",
        selector: ["section.inverse-section:has(.grid-images)", "#main-content > section.section.inverse-section:nth-of-type(7)"],
        style: "dark",
        blocks: ["columns-gallery"],
        defaultContent: [".section-heading", ".utility-margin-top-lg"]
      },
      {
        id: "9",
        name: "closing-cta",
        selector: ["section.accent-section"],
        style: "accent",
        blocks: [],
        defaultContent: [".container > h2", ".container > p", ".button-group"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/wknd-home" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
