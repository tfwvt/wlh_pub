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

  // Screens wider than a phone show an image's `wideScreen` version, if it
  // has one (e.g. a horizontal photo of a work that phones show upright).
  // Everything else about the image (title, caption, alt text) stays.
  const wideScreen = matchMedia("(min-width: 561px)");
  const shown = (img) =>
    img.wideScreen && wideScreen.matches ? { ...img, file: null, src: null, ...img.wideScreen } : img;
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

  // An image's `alt` from content.js, or else e.g. "Wayne Herpich, 108 by 48
  // inch Marker on Cotton Duck, 3 of 19" (so screen readers don't read the
  // inch marks as quotes, and sculpture isn't called painting).
  function altText(section, img, i) {
    if (img.alt) return img.alt;
    const where = section.title.replace(/(\d+)"\s*x\s*(\d+)"/gi, "$1 by $2 inch");
    return img.title
      ? `${img.title}, by ${artist.name}`
      : `${artist.name}, ${where}, ${i + 1} of ${section.images.length}`;
  }

  /* ---------- Search engines ---------- */

  // The live site's address. Search engines and link previews are always
  // pointed here, including from the GitHub Pages test copy.
  const SITE_URL = "https://wayneherpich.com/";

  // Adds schema.org data for search engines. The pages' <head> already
  // describes the artist (#artist) and the site (#website).
  function addStructuredData(data) {
    const json = JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
    document.head.append(h("script", { type: "application/ld+json" }, json));
  }

  // A work's photo, credited to the artist (shown in Google Images).
  const imageObject = (img, caption) => ({
    "@type": "ImageObject",
    contentUrl: new URL(srcOf(img), SITE_URL).href,
    caption,
    creator: { "@type": "Person", "@id": SITE_URL + "#artist", name: artist.name },
    creditText: artist.name,
    copyrightNotice: `© ${artist.name}`,
  });

  // Sets a <meta> tag (e.g. "description" or "og:title"), adding it if missing.
  function setMeta(key, value) {
    const attr = key.startsWith("og:") ? "property" : "name";
    let el = $(`meta[${attr}="${key}"]`);
    if (!el) document.head.append(el = h("meta", { [attr]: key }));
    el.content = value;
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
        // Home is the folder itself (…/), not …/index.html, except when the
        // files are opened straight from disk, where a folder wouldn't open.
        h("a", { class: "wordmark", href: location.protocol === "file:" ? "index.html" : "./" },
          artist.name,
          artist.tagline && h("span", { class: "wordmark-tagline" }, artist.tagline)),
        h("nav", { class: "site-nav", "aria-label": "Main" },
          link("work.html", "work", "View Work"),
          link("about.html", "about", "About"),
          link("contact.html", "contact", "Contact + Social Media"))));
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
        // The cover can be one of the section's images or any other image file.
        const cover = s.cover
          ? findImage(s.cover)?.img || (s.cover.includes("/") ? { src: s.cover } : { file: s.cover })
          : s.images[0];
        const img = h("img", { alt: "", loading: "lazy", decoding: "async" });
        withRetry(img, srcOf(cover));
        return h("li", null,
          h("a", { class: "series-card", href: seriesUrl(s) },
            h("div", { class: "series-card-wall" }, img),
            h("div", { class: "series-card-text" },
              h("span", { class: "sr-only" }, `${s.title}, `),
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
      h("h1", { class: "sr-only" }, `${artist.name} — ${artist.tagline || "Painting + Sculpture"}`),
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

    // For search engines that run scripts: each section is its own page, with
    // its own title, description and address, and its works listed as images
    // by the artist.
    const pageUrl = new URL(seriesUrl(s), SITE_URL).href;
    const title = `${s.title} — ${artist.name}`;
    const description = `${s.title}: ${plural(s.images.length, "work")} by the artist ${artist.name}.${s.description ? " " + s.description : ""}`;
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:url", pageUrl);
    document.head.append(h("link", { rel: "canonical", href: pageUrl }));
    addStructuredData({
      "@type": "ImageGallery",
      "@id": pageUrl,
      url: pageUrl,
      name: title,
      description,
      inLanguage: "en-US",
      isPartOf: { "@id": SITE_URL + "#website" },
      author: { "@id": SITE_URL + "#artist" },
      associatedMedia: s.images.map((img, i) => imageObject(img, altText(s, img, i))),
    });

    const wall = h("div", { class: "wall" });
    s.images.forEach((img, i) => {
      const frame = h("span", { class: "work-frame" });
      const inner = h("button", {
        class: "work-inner",
        type: "button",
        "aria-label": `View larger: ${altText(s, img, i)}`,
      },
        frame,
        h("span", { class: "work-caption" }, h("span", { class: "num" }, pad(i + 1)), img.title || img.year ? [" — ", details(img)] : null));
      const cell = h("div", { class: img.wide ? "work work-wide" : "work" }, inner);

      // Puts the photo in the frame: its `wideScreen` version on wider
      // screens, and again whenever the screen crosses that width.
      function showPhoto() {
        const v = shown(img);
        const setRatio = (r) => {
          inner.style.setProperty("--r", r);
          inner.style.setProperty("--rw", Math.sqrt(r));
        };
        const known = v.width && v.height;
        setRatio(known ? v.width / v.height : 1);
        const pic = h("img", { alt: altText(s, img, i), loading: "lazy", decoding: "async", width: v.width, height: v.height });
        // Without width/height in content.js, use the real proportions as
        // soon as the browser knows them (well before a slow image finishes).
        if (!known) {
          const poll = setInterval(() => {
            if (pic.naturalWidth) setRatio(pic.naturalWidth / pic.naturalHeight);
            if (pic.naturalWidth || !pic.isConnected) clearInterval(poll);
          }, 200);
        }
        pic.addEventListener("load", () => pic.classList.add("is-loaded"), { once: true });
        withRetry(pic, srcOf(v), () => cell.remove());
        frame.replaceChildren(pic);
      }
      showPhoto();
      if (img.wideScreen) wideScreen.addEventListener("change", showPhoto);

      inner.addEventListener("click", () => { if (!viewer.justClosed()) viewer.open(i); });
      wall.append(cell);
    });

    const prev = sections[s.index - 1];
    const next = sections[s.index + 1];

    main.append(
      h("div", { class: "wrap" },
        h("header", { class: "page-head" },
          h("h1", { class: "page-title" }, s.title),
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

    // On narrow screens the tabs scroll sideways: start with the current one
    // centred, so the sections either side of it are in view.
    const tabs = $(".series-tabs", main);
    const centreTab = () => {
      const cur = tabs && $('[aria-current="page"]', tabs);
      if (!cur || tabs.scrollWidth <= tabs.clientWidth) return;
      const t = tabs.getBoundingClientRect(), c = cur.getBoundingClientRect();
      tabs.scrollLeft += c.left + c.width / 2 - (t.left + t.width / 2);
    };
    centreTab();
    document.fonts?.ready.then(centreTab); // widths change once the web font arrives

    const viewer = makeViewer(s);

    // A link like series.html?s=portraits-self-portraits#12 opens painting 12.
    function syncFromHash() {
      const n = Number((location.hash.match(/^#(\d+)$/) || [])[1]);
      if (n >= 1 && n <= s.images.length) viewer.open(n - 1);
      else viewer.hide();
    }
    window.addEventListener("popstate", syncFromHash);
    // A page brought back by the browser's back / forward buttons can be
    // restored as it was left: match the viewer to the address again.
    window.addEventListener("pageshow", (e) => { if (e.persisted) syncFromHash(); });
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
    const arrows = s.images.length > 1 && h("div", { class: "viewer-arrows" }, prevBtn, nextBtn);

    const dialog = h("dialog", { class: "viewer", "aria-label": `${s.title} viewer` },
      h("div", { class: "viewer-top" }, h("span", { class: "viewer-series" }, s.title), closeBtn),
      stage,
      h("div", { class: "viewer-bottom" },
        captionEl,
        arrows));
    document.body.append(dialog);

    let idx = 0;
    let firstIdx = null; // the painting the viewer was opened on
    const zoom = { s: 1, x: 0, y: 0 }; // pinch zoom: scale, and offset from the stage's centre

    // On larger screens the arrows sit just below the bottom of the painting
    // the viewer was opened on, centred halfway between its right edge and
    // the right of the page, and stay there while stepping through the
    // others. Measured in the viewer's own units (offset*, client*), so this
    // still holds while fitToScreen() has it scaled.
    // On phones and other touch screens, and while a painting is zoomed in,
    // they stay in the bottom-right corner instead, below the painting area:
    // a taller painting further on, or a zoomed one, would otherwise cover them.
    const bottomRight = matchMedia("(max-width: 560px), (pointer: coarse)");
    function placeArrows() {
      if (!arrows || firstIdx == null) return;
      const img = shown(s.images[firstIdx]);
      const w = img.width || (idx === firstIdx && imgEl.naturalWidth);
      const ht = img.height || (idx === firstIdx && imgEl.naturalHeight);
      arrows.style.transform = "";
      if (bottomRight.matches || zoom.s > 1) return;
      if (!w || !ht) return; // no size known yet: placed again once it loads
      const cs = getComputedStyle(stage);
      const padL = parseFloat(cs.paddingLeft);
      const availW = stage.clientWidth - padL - parseFloat(cs.paddingRight);
      const availH = stage.clientHeight;
      // Where a painting is drawn: fitted to the stage, never enlarged, centred.
      const drawn = (pw, ph) => {
        const k = Math.min(1, availW / pw, availH / ph);
        const left = stage.offsetLeft + padL + (availW - pw * k) / 2;
        return { left, right: left + pw * k, bottom: stage.offsetTop + (availH + ph * k) / 2 };
      };
      const first = drawn(w, ht);
      const arrowsW = arrows.offsetWidth;
      // Never further right than they were, i.e. not into the page margin.
      const dx = Math.min(0, (first.right + dialog.clientWidth) / 2 - (arrows.offsetLeft + arrowsW / 2));
      // Just below this painting, but low enough to clear any other painting
      // in the section that would reach them.
      const left = arrows.offsetLeft + dx;
      let top = first.bottom + 18;
      for (const other of s.images.map(shown)) {
        if (!(other.width && other.height)) continue;
        const d = drawn(other.width, other.height);
        if (d.left < left + arrowsW && d.right > left) top = Math.max(top, d.bottom + 18);
      }
      const dy = Math.min(0, top - arrows.offsetTop);
      if (dx || dy) arrows.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    window.addEventListener("resize", placeArrows);

    // The viewer can't be zoomed (see the touch handlers below), but if the
    // page is zoomed in anyway, e.g. it was pinched before the viewer opened,
    // fit the viewer to the part of the page that's on screen. Otherwise every
    // painting shows as an enlarged corner, or just white.
    const vv = window.visualViewport;
    function fitToScreen() {
      if (!vv || !dialog.open) return;
      const zoomed = vv.scale !== 1 || vv.offsetLeft || vv.offsetTop;
      dialog.style.transform = zoomed
        ? `translate(${vv.offsetLeft}px, ${vv.offsetTop}px) scale(${1 / vv.scale})`
        : "";
    }
    vv?.addEventListener("resize", fitToScreen);
    vv?.addEventListener("scroll", fitToScreen);

    // The screen crossed the phone width (e.g. a phone turned sideways): show
    // the open painting's other version, if it has one.
    wideScreen.addEventListener("change", () => {
      if (dialog.open && s.images[idx].wideScreen) render();
      placeArrows();
    });

    let renders = 0;
    function render() {
      const img = s.images[idx];
      const photo = shown(img);
      const src = srcOf(photo);
      const n = ++renders;
      let retries = 0;
      setZoom(1, 0, 0);
      imgEl.classList.add("is-loading");
      imgEl.onload = () => {
        imgEl.classList.remove("is-loading");
        if (idx === firstIdx && !(photo.width && photo.height)) placeArrows();
      };
      // The image server sometimes drops a request: try again rather than
      // leave a blank screen, and show the alt text if it still fails.
      imgEl.onerror = () => {
        if (n !== renders) return;
        if (retries >= 2) return imgEl.classList.remove("is-loading");
        retries++;
        setTimeout(() => {
          if (n === renders) imgEl.src = src + (src.includes("?") ? "&" : "?") + "retry=" + retries;
        }, 1500 * retries);
      };
      imgEl.src = src;
      imgEl.alt = altText(s, img, idx);
      countEl.textContent = `${idx + 1} / ${s.images.length}`;
      captionEl.replaceChildren(countEl);
      if (img.title || img.year || img.medium || img.size) captionEl.append(h("br"), ...details(img).filter(Boolean));

      // Warm the cache for neighbours so stepping through feels instant.
      for (const d of [-1, 1]) new Image().src = srcOf(shown(s.images[(idx + d + s.images.length) % s.images.length]));
    }

    // The address shows the painting (#n), so it can be shared, but opening,
    // paging and closing only ever replace the address: they add no history
    // steps. Steps added and removed by the page are unreliable on iPhones
    // (Chrome there especially), e.g. a white screen until touched.
    const setHash = (hash) => history.replaceState(history.state, "", location.pathname + location.search + hash);

    function open(i) {
      idx = i;
      render();
      if (!dialog.open) {
        dialog.showModal();
        firstIdx = i;
        fitToScreen();
        placeArrows();
      }
      setHash(`#${idx + 1}`);
    }

    function step(d) {
      idx = (idx + d + s.images.length) % s.images.length;
      render();
      setHash(`#${idx + 1}`);
    }

    function hide() {
      if (dialog.open) dialog.close();
    }

    function close() {
      if (!dialog.open) return;
      setHash("");
      hide();
    }

    // When the viewer last closed: a quick second tap on Close then lands on
    // the wall, and shouldn't open the painting under it.
    let closedAt = 0;
    const justClosed = () => Date.now() - closedAt < 400;

    // Back on the wall exactly where it was: nothing scrolls on closing, so
    // the tabs are still in view if they were, and an iPhone has nothing to
    // repaint but the viewer going away. Keyboard focus returns to the
    // painting the viewer was opened on.
    dialog.addEventListener("close", () => {
      closedAt = Date.now();
      setZoom(1, 0, 0);
      $$(".work-inner")[firstIdx ?? idx]?.focus({ preventScroll: true });
      firstIdx = null;
    });
    dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    // Clicking beside the painting closes the viewer, but not a tap on a
    // touch screen, where it's usually a near miss of the arrows.
    let pointerType = "";
    stage.addEventListener("pointerdown", (e) => { pointerType = e.pointerType; });
    stage.addEventListener("click", (e) => { if (e.target === stage && pointerType === "mouse") close(); });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });

    // The browser never zooms or scrolls from the viewer. A double tap that
    // misses the arrows, or a pinch, would zoom the whole page, and it stays
    // zoomed while paging; a drag would scroll the page behind.
    // `touch-action: none` in styles.css stops these in most browsers; the
    // preventDefault()s stop them in older Safari. (With a mouse, styles.css
    // locks the page's scrolling instead.) The viewer does its own zooming:
    dialog.addEventListener("gesturestart", (e) => e.preventDefault());

    /*
     * Touch: swipe left / right to page; pinch (or pull apart) to zoom into
     * the painting, and drag it while zoomed. The zoomed painting is clipped
     * to the stage (overflow: hidden in styles.css), which runs from just
     * below Close to just above the arrows, so it never covers the controls.
     * Paging or closing goes back to the whole painting.
     */
    const MAX_ZOOM = 5;
    // A touch's position in the stage's own units, from its centre, which is
    // where the unzoomed painting's centre is.
    function stagePoint(touch) {
      const r = stage.getBoundingClientRect();
      const k = r.width / stage.offsetWidth || 1; // fitToScreen() may scale the viewer
      return {
        x: (touch.clientX - r.left) / k - stage.offsetWidth / 2,
        y: (touch.clientY - r.top) / k - stage.offsetHeight / 2,
      };
    }
    function setZoom(scale, x, y, settle = false) {
      const wasZoomed = zoom.s > 1;
      // Keep the edges of a zoomed painting at or beyond the stage's edges,
      // and keep it centred along any side where it's smaller than the stage.
      const mx = Math.max(0, (imgEl.offsetWidth * scale - stage.offsetWidth) / 2);
      const my = Math.max(0, (imgEl.offsetHeight * scale - stage.offsetHeight) / 2);
      zoom.s = scale;
      zoom.x = Math.min(mx, Math.max(-mx, x));
      zoom.y = Math.min(my, Math.max(-my, y));
      imgEl.classList.toggle("is-settling", settle);
      imgEl.style.transform = scale === 1 ? "" : `translate(${zoom.x}px, ${zoom.y}px) scale(${scale})`;
      if (wasZoomed !== zoom.s > 1) placeArrows();
    }
    window.addEventListener("resize", () => setZoom(1, 0, 0));

    let gesture = null;
    const startPan = (touch) => {
      const p = stagePoint(touch);
      gesture = { type: "pan", x0: p.x - zoom.x, y0: p.y - zoom.y };
    };
    dialog.addEventListener("touchstart", (e) => {
      const t = e.touches;
      if (t.length >= 2) {
        // Keep the point of the painting between the fingers under them.
        const a = stagePoint(t[0]), b = stagePoint(t[1]);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        gesture = {
          type: "pinch",
          d0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          s0: zoom.s,
          px: (mx - zoom.x) / zoom.s,
          py: (my - zoom.y) / zoom.s,
        };
      } else if (zoom.s > 1) startPan(t[0]);
      else gesture = { type: "swipe", x: t[0].clientX, y: t[0].clientY };
    }, { passive: true });
    dialog.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const t = e.touches;
      if (gesture?.type === "pinch" && t.length >= 2) {
        const a = stagePoint(t[0]), b = stagePoint(t[1]);
        const scale = Math.min(MAX_ZOOM, Math.max(0.85, gesture.s0 * Math.hypot(a.x - b.x, a.y - b.y) / gesture.d0));
        setZoom(scale, (a.x + b.x) / 2 - gesture.px * scale, (a.y + b.y) / 2 - gesture.py * scale);
      } else if (gesture?.type === "pan") {
        const p = stagePoint(t[0]);
        setZoom(zoom.s, p.x - gesture.x0, p.y - gesture.y0);
      }
    }, { passive: false });
    const endTouch = (e) => {
      if (!gesture) return;
      const t = e.touches;
      if (gesture.type === "swipe") {
        const dx = e.changedTouches[0].clientX - gesture.x;
        const dy = e.changedTouches[0].clientY - gesture.y;
        gesture = null;
        const onScreen = Math.abs(dx) * (vv ? vv.scale : 1); // the same swipe length if the page is zoomed
        if (e.type === "touchend" && onScreen > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
      } else if (t.length === 1 && zoom.s > 1) startPan(t[0]); // one finger left after a pinch: drag on
      else if (!t.length) {
        gesture = null;
        if (zoom.s < 1.05) setZoom(1, 0, 0, true); // pinched back down: the whole painting again
      }
    };
    dialog.addEventListener("touchend", endTouch, { passive: true });
    dialog.addEventListener("touchcancel", endTouch, { passive: true });

    return { open, hide, justClosed };
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
    // Photographs below the biography, top to bottom. A photo that won't load is left out.
    const photos = [].concat(SITE.aboutImages || SITE.aboutImage || []).map((photo) => {
      const img = h("img", { alt: photo.alt || "", width: photo.width, height: photo.height, loading: "lazy", decoding: "async" });
      const figure = h("figure", { class: `about-photo${photo.bottomOnNarrowScreens ? " about-photo-last" : ""}` }, img);
      withRetry(img, srcOf(photo), () => figure.remove());
      return figure;
    });

    // A group lists `items`, or holds smaller `groups` under its heading (e.g. Bibliography).
    const hasItems = (g) => g && ((g.items && g.items.length) || (g.groups || []).some(hasItems));
    const groups = (SITE.cv || []).filter(hasItems);

    const cvGroup = (g, sub) =>
      h("section", { class: `cv-group${sub ? " cv-subgroup" : ""}${g.quoteTitles ? " quoted" : ""}` },
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
        h("div", { class: "two-col about-cols" },
          h("div", { class: "about-left" },
            h("div", { class: "bio" }, [].concat(SITE.bio || []).map((t) => h("p", null, withLinks(t)))),
            photos),
          h("div", { class: "cv" },
            groups.map((g) => cvGroup(g, false)),
            SITE.resume && SITE.resume.url && h("p", { class: "cv-resume" },
              h("a", { href: SITE.resume.url, target: "_blank", rel: "noopener" }, SITE.resume.label || "Resume"))))));
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
