/*
 * Builds the page from window.SITE (content.js).
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
    for (const child of children.flat()) {
      if (child == null || child === false) continue;
      el.append(child.nodeType ? child : String(child));
    }
    return el;
  }

  const slug = (text) =>
    String(text).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-");

  const srcOf = (img) => img.src || (SITE.imageBase || "") + img.file;
  const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;

  // Prepare sections: give each an id and drop any empty ones.
  const sections = (SITE.sections || [])
    .filter((s) => s && Array.isArray(s.images) && s.images.length)
    .map((s, i) => ({ ...s, id: s.id || slug(s.title) || `section-${i + 1}`, index: i }));

  const totalWorks = sections.reduce((n, s) => n + s.images.length, 0);

  function altText(section, img, i) {
    if (img.alt) return img.alt;
    const name = SITE.artist.name;
    return img.title
      ? `${img.title}, painting by ${name}`
      : `Painting by ${name}, ${section.title}, ${i + 1} of ${section.images.length}`;
  }

  /* ---------- Artist details ---------- */

  function fillArtist() {
    const { name, location, email, phone, instagram } = SITE.artist;
    $$("[data-artist-name]").forEach((el) => (el.textContent = name));
    document.title = `${name} — Paintings`;

    const emailLink = $("[data-email]");
    if (email) {
      emailLink.href = `mailto:${email}?subject=${encodeURIComponent("Contact from wayneherpich.com")}`;
      $("[data-email-text]").textContent = email;
    } else emailLink.remove();

    const igLink = $("[data-instagram]");
    if (instagram) {
      igLink.href = instagram;
      const handle = instagram.replace(/\/+$/, "").split("/").pop();
      $("[data-instagram-text]").textContent = "@" + handle;
    } else igLink.remove();

    const phoneLink = $("[data-phone]");
    if (phone) {
      phoneLink.href = "tel:" + phone.replace(/[^\d+]/g, "");
      $("[data-phone-text]").textContent = phone;
    } else phoneLink.remove();

    if (location) {
      $("[data-location]").textContent = location;
      $("[data-studio-text]").textContent = location;
    } else {
      $("[data-location-sep]").remove();
      $("[data-studio]").remove();
    }

    $("[data-year]").textContent = new Date().getFullYear();
  }

  /* ---------- Hero ---------- */

  function fillHero() {
    const hero = SITE.hero;
    const img = $("[data-hero-img]");
    if (hero) {
      img.src = srcOf(hero);
      img.alt = hero.alt || "";
      if (hero.width && hero.height) {
        img.width = hero.width;
        img.height = hero.height;
      }
    } else img.closest("figure").remove();

    $("[data-hero-meta]").textContent =
      `${plural(totalWorks, "painting")} in ${plural(sections.length, "series", "series")}`;
  }

  /* ---------- Navigation and overview ---------- */

  function buildNav() {
    const nav = $(".site-nav");
    const firstFixed = $("a", nav); // About, Contact stay after the sections
    for (const s of sections) {
      nav.insertBefore(h("a", { href: `#${s.id}`, "data-nav": s.id }, s.title), firstFixed);
    }
  }

  function buildOverview() {
    const list = $("[data-overview]");
    for (const s of sections) {
      const cover = s.cover ? { file: s.cover } : s.images[0];
      list.append(
        h("li", null,
          h("a", { class: "overview-card", href: `#${s.id}` },
            h("div", { class: "overview-cover" },
              h("img", { src: srcOf(cover), alt: "", loading: "lazy", decoding: "async" })),
            h("div", { class: "overview-text" },
              h("span", { class: "overview-title" }, s.title),
              h("span", { class: "overview-count" }, plural(s.images.length, "painting"))))));
    }
  }

  /* ---------- Painting grids ---------- */

  function buildSections() {
    const host = $("[data-sections]");
    for (const s of sections) {
      const grid = h("div", { class: "grid" });

      s.images.forEach((img, i) => {
        const ratio = img.width && img.height ? img.width / img.height : 1;
        const pic = h("img", {
          src: srcOf(img),
          alt: altText(s, img, i),
          loading: "lazy",
          decoding: "async",
          width: img.width,
          height: img.height,
        });
        const tile = h("button", {
          class: "tile",
          type: "button",
          style: `--ratio:${ratio}`,
          "aria-label": `View larger: ${altText(s, img, i)}`,
        }, pic);

        // Without width/height in content.js, use the real proportions as soon
        // as the browser knows them (well before a slow image finishes).
        if (!(img.width && img.height)) {
          const poll = setInterval(() => {
            if (pic.naturalWidth) tile.style.setProperty("--ratio", pic.naturalWidth / pic.naturalHeight);
            if (pic.naturalWidth || !tile.isConnected) clearInterval(poll);
          }, 200);
        }

        const onLoad = () => pic.classList.add("is-loaded");
        if (pic.complete && pic.naturalWidth) onLoad();
        else pic.addEventListener("load", onLoad, { once: true });
        // The image server sometimes drops a request; retry a couple of times
        // before hiding a painting whose image really is missing.
        let retries = 0;
        pic.addEventListener("error", () => {
          if (retries >= 2) return tile.remove();
          retries++;
          setTimeout(() => {
            pic.src = srcOf(img) + (srcOf(img).includes("?") ? "&" : "?") + "retry=" + retries;
          }, 1500 * retries);
        });

        tile.addEventListener("click", () => viewer.open(s.index, i));
        grid.append(tile);
      });

      host.append(
        h("section", { class: "series", id: s.id, "aria-labelledby": `${s.id}-title` },
          h("div", { class: "wrap" },
            h("header", { class: "series-head" },
              h("span", { class: "series-num" }, String(s.index + 1).padStart(2, "0")),
              h("h2", { class: "series-title", id: `${s.id}-title` }, s.title),
              h("span", { class: "series-count" }, plural(s.images.length, "painting")),
              s.description && h("p", { class: "series-desc" }, s.description)),
            grid)));
    }
  }

  /* ---------- About and CV ---------- */

  function buildAbout() {
    const bio = [].concat(SITE.bio || []);
    const groups = (SITE.cv || []).filter((g) => g && g.items && g.items.length);
    if (!bio.length && !groups.length) {
      $("#about").remove();
      $('[data-nav="about"]').remove();
      return;
    }

    $("[data-bio]").append(...bio.map((text) => h("p", null, text)));

    $("[data-cv]").append(...groups.map((g) =>
      h("section", { class: "cv-group" },
        h("h3", { class: "cv-heading" }, g.heading),
        h("ul", { class: "cv-list" },
          g.items.map((item) => {
            const title = g.quoteTitles ? `“${item.title}”` : item.title;
            return h("li", { class: "cv-item" },
              h("span", { class: "cv-year" }, item.year),
              h("span", { class: "cv-text" },
                h("span", { class: "cv-title" },
                  item.url ? h("a", { href: item.url, target: "_blank", rel: "noopener" }, title) : title),
                item.detail && h("span", { class: "cv-detail" }, item.detail)));
          })))));
  }

  /* ---------- Full-screen viewer ---------- */

  const viewer = (function () {
    const dialog = $(".viewer");
    const imgEl = $(".viewer-img", dialog);
    const countEl = $(".viewer-count", dialog);
    const captionEl = $(".viewer-caption", dialog);
    let sec = 0;
    let idx = 0;
    let pushedState = false;

    const hashFor = (si, i) => `#${sections[si].id}/${i + 1}`;

    function render() {
      const s = sections[sec];
      const img = s.images[idx];
      imgEl.classList.add("is-loading");
      imgEl.onload = () => imgEl.classList.remove("is-loading");
      imgEl.src = srcOf(img);
      imgEl.alt = altText(s, img, idx);
      countEl.textContent = `${s.title} · ${idx + 1} / ${s.images.length}`;

      captionEl.replaceChildren();
      const details = [img.year, img.medium, img.size].filter(Boolean).join(", ");
      if (img.title) captionEl.append(h("em", null, img.title));
      if (img.title && details) captionEl.append(" — ");
      if (details) captionEl.append(details);

      // Warm the cache for neighbours so stepping through feels instant.
      for (const d of [-1, 1]) {
        const n = s.images[(idx + d + s.images.length) % s.images.length];
        new Image().src = srcOf(n);
      }
    }

    function open(si, i, { push = true } = {}) {
      sec = si;
      idx = i;
      render();
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = "hidden";
      }
      if (push) {
        history.pushState({ viewer: true }, "", hashFor(sec, idx));
        pushedState = true;
      }
    }

    function step(d) {
      const n = sections[sec].images.length;
      idx = (idx + d + n) % n;
      render();
      history.replaceState(history.state, "", hashFor(sec, idx));
    }

    // Close the dialog without touching history (used by popstate).
    function hide() {
      if (!dialog.open) return;
      dialog.close();
    }

    function close() {
      if (!dialog.open) return;
      if (pushedState) {
        history.back(); // popstate will hide the dialog
      } else {
        history.replaceState(null, "", `#${sections[sec].id}`);
        hide();
      }
    }

    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
      pushedState = false;
      // Return focus to the tile that was opened.
      const tile = $$(`#${CSS.escape(sections[sec].id)} .tile`)[idx];
      if (tile) tile.focus({ preventScroll: true });
    });

    // Esc fires "cancel"; route it through close() so history stays in step.
    dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });

    $(".viewer-close", dialog).addEventListener("click", close);
    $(".viewer-prev", dialog).addEventListener("click", () => step(-1));
    $(".viewer-next", dialog).addEventListener("click", () => step(1));

    // Click on the dark background (not the painting or buttons) closes.
    $(".viewer-stage", dialog).addEventListener("click", (e) => {
      if (e.target === e.currentTarget) close();
    });

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
  })();

  // Links like #paintings-3/12 open the viewer on that painting.
  function syncFromHash() {
    const m = location.hash.match(/^#([\w-]+)\/(\d+)$/);
    if (m) {
      const si = sections.findIndex((s) => s.id === m[1]);
      const i = Number(m[2]) - 1;
      if (si >= 0 && i >= 0 && i < sections[si].images.length) {
        viewer.open(si, i, { push: false });
        return;
      }
    }
    viewer.hide();
  }
  window.addEventListener("popstate", syncFromHash);

  /* ---------- Header behaviour ---------- */

  function headerEffects() {
    const header = $(".site-header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Highlight the menu link for the section currently on screen.
    const nav = $(".site-nav");
    const links = new Map($$("a", nav).map((a) => [a.dataset.nav, a]));
    const targets = [...sections.map((s) => s.id), "about", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
      const current = targets.find((t) => visible.has(t.id));
      links.forEach((a, id) => {
        if (current && id === current.id) {
          a.setAttribute("aria-current", "true");
          // On narrow screens the menu scrolls sideways; keep this link in view.
          nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2 });
        } else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach((t) => observer.observe(t));
  }

  function themeToggle() {
    const root = document.documentElement;
    $(".theme-toggle").addEventListener("click", () => {
      const dark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = dark ? "light" : "dark";
      try { localStorage.setItem("wh-theme", root.dataset.theme); } catch (e) {}
    });
  }

  /* ---------- Go ---------- */

  fillArtist();
  fillHero();
  buildNav();
  buildOverview();
  buildSections();
  buildAbout();
  headerEffects();
  themeToggle();
  syncFromHash();

  // Sections are built by script, so jump to e.g. #paintings-2 once they exist.
  const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView();
})();
