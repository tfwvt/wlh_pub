/*
 * Builds every page of the site from window.SITE (content.js).
 * Each HTML file says which page it is with <body data-page="...">.
 * You shouldn't need to edit this file to add paintings or sections.
 */
(function () {
  "use strict";

  const SITE = window.SITE;
  if (!SITE) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Small element helper: h("a", { href: "#" }, "text", childNode)
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === "class") el.className = value;
      else if (key === "style") el.style.cssText = value;
      else el.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      el.append(child.nodeType ? child : String(child));
    }
    return el;
  }

  const slug = (text) =>
    String(text).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-");

  const srcOf = (img) => img.src || (SITE.imageBase || "") + img.file;
  const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;
  const pad = (n) => String(n).padStart(2, "0");

  const artist = SITE.artist || {};
  const page = document.body.dataset.page;

  // Prepare sections: give each an id and drop any empty ones.
  const sections = (SITE.sections || [])
    .filter((s) => s && Array.isArray(s.images) && s.images.length)
    .map((s, i) => ({ ...s, id: s.id || slug(s.title) || `series-${i + 1}`, index: i }));

  const seriesUrl = (s, n) => `series.html?s=${encodeURIComponent(s.id)}${n ? "#" + n : ""}`;

  function findImage(file) {
    for (const s of sections) {
      const i = s.images.findIndex((img) => img.file === file || img.src === file);
      if (i >= 0) return { section: s, index: i, img: s.images[i] };
    }
    return null;
  }

  function altText(section, img, i) {
    if (img.alt) return img.alt;
    return img.title
      ? `${img.title}, painting by ${artist.name}`
      : `Painting by ${artist.name}, ${section.title}, ${i + 1} of ${section.images.length}`;
  }

  // "Title — 2020, Oil on canvas, 40 × 30 in" as nodes; empty if no details.
  function details(img) {
    const facts = [img.year, img.medium, img.size].filter(Boolean).join(", ");
    return [
      img.title && h("span", { class: "title" }, img.title),
      img.title && facts && ", ",
      facts,
    ];
  }

  // The image server sometimes drops a request; retry a couple of times
  // before giving up on an image.
  function withRetry(imgEl, src, onFail) {
    let retries = 0;
    imgEl.addEventListener("error", () => {
      if (retries >= 2) return onFail && onFail();
      retries++;
      setTimeout(() => {
        imgEl.src = src + (src.includes("?") ? "&" : "?") + "retry=" + retries;
      }, 1500 * retries);
    });
    imgEl.src = src;
  }

  /* ---------- Header and footer (every page) ---------- */

  function renderHeader() {
    const current = page === "series" ? "work" : page;
    const link = (href, id, text) =>
      h("a", { href, "aria-current": current === id ? "page" : null }, text);
    $(".site-header").append(
      h("div", { class: "wrap header-inner" },
        h("a", { class: "wordmark", href: "index.html" }, artist.name),
        h("nav", { class: "site-nav", "aria-label": "Main" },
          link("work.html", "work", "Work"),
          link("about.html", "about", "About"),
          link("contact.html", "contact", "Contact"))));
  }

  function renderFooter() {
    $(".site-footer").append(
      h("div", { class: "wrap footer-inner" },
        h("p", null, `© ${new Date().getFullYear()} ${artist.name}`)));
  }

  /* ---------- Series cards (Work page) ---------- */

  function seriesCards() {
    return h("ul", { class: "series-cards" },
      sections.map((s) => {
        const cover = (s.cover && findImage(s.cover)?.img) || s.images[0];
        const img = h("img", { alt: "", loading: "lazy", decoding: "async" });
        withRetry(img, srcOf(cover));
        return h("li", null,
          h("a", { class: "series-card", href: seriesUrl(s) },
            h("div", { class: "series-card-wall" }, img),
            h("div", { class: "series-card-text" },
              h("span", { class: "series-card-title" }, s.title),
              h("span", { class: "series-card-count" }, plural(s.images.length, "work")))));
      }));
  }

  /* ---------- Home ---------- */

  function renderHome() {
    const photo = SITE.home && SITE.home.image;
    const photoEl = photo && h("img", {
      alt: photo.alt || "",
      width: photo.width,
      height: photo.height,
      fetchpriority: "high",
      decoding: "async",
    });
    if (photoEl) withRetry(photoEl, srcOf(photo), () => photoEl.closest("figure").remove());

    $("#main").append(
      h("h1", { class: "sr-only" }, `${artist.name} — Paintings`),
      photoEl && h("figure", { class: "wrap home-image" }, photoEl));
  }

  /* ---------- Work ---------- */

  function renderWork() {
    $("#main").append(
      h("div", { class: "wrap work-page" },
        h("h1", { class: "sr-only" }, "Work"),
        seriesCards()));
  }

  /* ---------- Series ---------- */

  function renderSeries() {
    const main = $("#main");
    const id = new URLSearchParams(location.search).get("s");
    const s = sections.find((x) => x.id === id) || (!id && sections[0]);

    if (!s) {
      document.title = `Not found — ${artist.name}`;
      main.append(
        h("div", { class: "wrap not-found" },
          h("h1", { class: "page-title" }, "Series not found"),
          h("p", null, "This series may have moved. ", h("a", { href: "work.html" }, "See all work"), ".")));
      return;
    }

    document.title = `${s.title} — ${artist.name}`;

    const wall = h("div", { class: "wall" });
    s.images.forEach((img, i) => {
      const known = img.width && img.height;
      const ratio = known ? img.width / img.height : 1;
      const pic = h("img", { alt: altText(s, img, i), loading: "lazy", decoding: "async", width: img.width, height: img.height });
      const inner = h("button", {
        class: "work-inner",
        type: "button",
        style: `--r:${ratio};--rw:${Math.sqrt(ratio)}`,
        "aria-label": `View larger: ${altText(s, img, i)}`,
      },
        h("span", { class: "work-frame" }, pic),
        h("span", { class: "work-caption" }, h("span", { class: "num" }, pad(i + 1)), img.title || img.year ? [" — ", details(img)] : null));
      const cell = h("div", { class: "work" }, inner);

      // Without width/height in content.js, use the real proportions as soon
      // as the browser knows them (well before a slow image finishes).
      if (!known) {
        const poll = setInterval(() => {
          if (pic.naturalWidth) {
            const r = pic.naturalWidth / pic.naturalHeight;
            inner.style.setProperty("--r", r);
            inner.style.setProperty("--rw", Math.sqrt(r));
          }
          if (pic.naturalWidth || !cell.isConnected) clearInterval(poll);
        }, 200);
      }
      pic.addEventListener("load", () => pic.classList.add("is-loaded"), { once: true });
      withRetry(pic, srcOf(img), () => cell.remove());

      inner.addEventListener("click", () => viewer.open(i));
      wall.append(cell);
    });

    const prev = sections[s.index - 1];
    const next = sections[s.index + 1];

    main.append(
      h("div", { class: "wrap" },
        h("header", { class: "page-head" },
          h("div", null,
            h("p", { class: "crumb" }, h("a", { href: "work.html" }, "Work"), " / "),
            h("h1", { class: "page-title" }, s.title)),
          h("p", { class: "page-meta" }, plural(s.images.length, "work")),
          s.description && h("p", { class: "page-desc" }, s.description)),
        sections.length > 1 && h("nav", { class: "series-tabs", "aria-label": "Series" },
          sections.map((x) => h("a", { href: seriesUrl(x), "aria-current": x === s ? "page" : null }, x.title))),
        wall,
        (prev || next) && h("nav", { class: "series-pager", "aria-label": "Previous and next series" },
          prev && h("a", { class: "prev", href: seriesUrl(prev) },
            h("span", { class: "label" }, "← Previous"), h("span", { class: "pager-title" }, prev.title)),
          next && h("a", { class: "next", href: seriesUrl(next) },
            h("span", { class: "label" }, "Next →"), h("span", { class: "pager-title" }, next.title)))));

    const viewer = makeViewer(s);

    // A link like series.html?s=paintings-3#12 opens painting 12.
    function syncFromHash() {
      const n = Number((location.hash.match(/^#(\d+)$/) || [])[1]);
      if (n >= 1 && n <= s.images.length) viewer.open(n - 1, { push: false });
      else viewer.hide();
    }
    window.addEventListener("popstate", syncFromHash);
    syncFromHash();
  }

  function makeViewer(s) {
    const imgEl = h("img", { class: "viewer-img", alt: "" });
    const countEl = h("span", { class: "viewer-count" });
    const captionEl = h("p", { class: "viewer-caption", "aria-live": "polite" });
    const icon = (d) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = `<path d="${d}"/>`;
      return svg;
    };
    const closeBtn = h("button", { class: "viewer-close", type: "button" }, "Close", icon("M6 6l12 12M18 6L6 18"));
    const prevBtn = h("button", { type: "button", "aria-label": "Previous painting" }, icon("M15 5l-7 7 7 7"));
    const nextBtn = h("button", { type: "button", "aria-label": "Next painting" }, icon("M9 5l7 7-7 7"));
    const stage = h("div", { class: "viewer-stage" }, imgEl);

    const dialog = h("dialog", { class: "viewer", "aria-label": `${s.title} viewer` },
      h("div", { class: "viewer-top" }, h("span", { class: "viewer-series" }, s.title), closeBtn),
      stage,
      h("div", { class: "viewer-bottom" },
        captionEl,
        s.images.length > 1 && h("div", { class: "viewer-arrows" }, prevBtn, nextBtn)));
    document.body.append(dialog);

    let idx = 0;
    let pushedState = false;

    function render() {
      const img = s.images[idx];
      imgEl.classList.add("is-loading");
      imgEl.onload = () => imgEl.classList.remove("is-loading");
      imgEl.src = srcOf(img);
      imgEl.alt = altText(s, img, idx);
      countEl.textContent = `${idx + 1} / ${s.images.length}`;
      captionEl.replaceChildren(countEl);
      if (img.title || img.year || img.medium || img.size) captionEl.append(h("br"), ...details(img).filter(Boolean));

      // Warm the cache for neighbours so stepping through feels instant.
      for (const d of [-1, 1]) new Image().src = srcOf(s.images[(idx + d + s.images.length) % s.images.length]);
    }

    function open(i, { push = true } = {}) {
      idx = i;
      render();
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = "hidden";
      }
      if (push) {
        history.pushState({ viewer: true }, "", `#${idx + 1}`);
        pushedState = true;
      }
    }

    function step(d) {
      idx = (idx + d + s.images.length) % s.images.length;
      render();
      history.replaceState(history.state, "", `#${idx + 1}`);
    }

    function hide() {
      if (dialog.open) dialog.close();
    }

    function close() {
      if (!dialog.open) return;
      if (pushedState) history.back(); // popstate hides the dialog
      else {
        history.replaceState(null, "", location.pathname + location.search);
        hide();
      }
    }

    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
      pushedState = false;
      const tile = $$(".work-inner")[idx];
      if (tile) {
        tile.focus({ preventScroll: true });
        tile.scrollIntoView({ block: "nearest" });
      }
    });
    dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    stage.addEventListener("click", (e) => { if (e.target === stage) close(); });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });

    // Swipe left / right on touch screens.
    let touchX = null;
    let touchY = null;
    dialog.addEventListener("touchstart", (e) => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    dialog.addEventListener("touchend", (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      touchX = touchY = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    return { open, hide };
  }

  /* ---------- About ---------- */

  // Turns [text](https://...) in a bio paragraph into a link that opens in a new tab.
  function withLinks(text) {
    const parts = [];
    let last = 0;
    for (const m of String(text).matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) {
      parts.push(text.slice(last, m.index), h("a", { href: m[2], target: "_blank", rel: "noopener" }, m[1]));
      last = m.index + m[0].length;
    }
    parts.push(text.slice(last));
    return parts;
  }

  function renderAbout() {
    const photo = SITE.aboutImage;
    const photoEl = photo && h("img", { alt: photo.alt || "", width: photo.width, height: photo.height, loading: "lazy", decoding: "async" });
    if (photoEl) withRetry(photoEl, srcOf(photo), () => photoEl.closest("figure").remove());

    // A group lists `items`, or holds smaller `groups` under its heading (e.g. Bibliography).
    const hasItems = (g) => g && ((g.items && g.items.length) || (g.groups || []).some(hasItems));
    const groups = (SITE.cv || []).filter(hasItems);

    const cvGroup = (g, sub) =>
      h("section", { class: `cv-group${sub ? " cv-subgroup" : ""}${g.groups ? " cv-parent" : ""}${g.quoteTitles ? " quoted" : ""}` },
        sub ? h("h3", { class: "cv-subhead" }, g.heading) : h("h2", { class: "label" }, g.heading),
        g.items && g.items.length && h("ul", { class: "cv-list" },
          g.items.map((item) => {
            const title = g.quoteTitles ? `“${item.title}”` : item.title;
            return h("li", { class: "cv-item" },
              h("span", { class: "cv-year" }, item.year),
              h("span", null,
                h("span", { class: "cv-title" },
                  item.url ? h("a", { href: item.url, target: "_blank", rel: "noopener" }, title) : title),
                item.detail && h("span", { class: "cv-detail" }, item.detail)));
          })),
        (g.groups || []).filter(hasItems).map((s) => cvGroup(s, true)));

    $("#main").append(
      h("div", { class: "wrap" },
        h("header", { class: "page-head" }, h("h1", { class: "page-title" }, "Biography")),
        h("div", { class: "two-col" },
          h("div", null,
            h("div", { class: "bio" }, [].concat(SITE.bio || []).map((t) => h("p", null, withLinks(t)))),
            photoEl && h("figure", { class: "about-photo" }, photoEl)),
          h("div", { class: "cv" }, groups.map((g) => cvGroup(g, false))))));
  }

  /* ---------- Contact ---------- */

  function renderContact() {
    const item = (label, value) => value && h("div", { class: "contact-item" }, h("dt", null, label), h("dd", null, value));
    const igHandle = artist.instagram && "@" + artist.instagram.replace(/\/+$/, "").split("/").pop();
    const photo = SITE.contactImage;
    const photoEl = photo && h("img", { alt: photo.alt || "", width: photo.width, height: photo.height, fetchpriority: "high", decoding: "async" });
    if (photoEl) withRetry(photoEl, srcOf(photo), () => photoEl.closest("figure").remove());

    $("#main").append(
      h("div", { class: "wrap contact-layout" },
        photoEl && h("figure", { class: "contact-photo" }, photoEl),
        h("div", { class: "contact-text" },
          h("h1", { class: "sr-only" }, "Contact"),
          h("dl", { class: "contact-list" },
            item("Email", artist.email && h("a", { href: `mailto:${artist.email}?subject=${encodeURIComponent("Inquiry from wayneherpich.com")}` }, artist.email)),
            item("Phone", artist.phone && h("a", { href: "tel:" + artist.phone.replace(/[^\d+]/g, "") }, artist.phone)),
            item("Instagram", igHandle && h("a", { href: artist.instagram, target: "_blank", rel: "noopener" }, igHandle))))));
  }

  /* ---------- Go ---------- */

  renderHeader();
  renderFooter();
  ({ home: renderHome, work: renderWork, series: renderSeries, about: renderAbout, contact: renderContact }[page] || (() => {}))();
})();
