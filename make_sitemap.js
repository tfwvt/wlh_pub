#!/usr/bin/env node
/*
 * Writes <folder>/sitemap.xml from <folder>/content.js: every page of the
 * site, each section's page, and the photos on each page (so search engines
 * find them even though the pages build themselves with JavaScript).
 *
 * Run it again after adding, renaming or removing a section or a photo:
 *   node make_sitemap.js experiment03
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const folder = process.argv[2] || "experiment03";
const SITE_URL = "https://wayneherpich.com/";

const window = {};
vm.runInNewContext(fs.readFileSync(path.join(folder, "content.js"), "utf8"), { window });
const SITE = window.SITE;

// The same section ids as site.js gives them (series.html?s=<id>).
const slug = (text) =>
  String(text).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-");
const sections = (SITE.sections || [])
  .filter((s) => s && Array.isArray(s.images) && s.images.length)
  .map((s, i) => ({ ...s, id: s.id || slug(s.title) || `series-${i + 1}` }));

const photoUrl = (img) => new URL(img.src || (SITE.imageBase || "") + img.file, SITE_URL).href;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const photos = (list) => [].concat(list || []).filter(Boolean).flatMap((img) => [img, img.wideScreen].filter(Boolean));

const pages = [
  { loc: "", images: photos(SITE.home && SITE.home.image) },
  { loc: "work.html", images: [] },
  ...sections.map((s) => ({ loc: `series.html?s=${encodeURIComponent(s.id)}`, images: photos(s.images) })),
  { loc: "about.html", images: photos(SITE.aboutImages || SITE.aboutImage) },
  { loc: "contact.html", images: photos(SITE.contactImage) },
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  "<!-- Made by make_sitemap.js from content.js. Run it again after changing sections or photos. -->",
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...pages.map((p) => [
    "  <url>",
    `    <loc>${esc(new URL(p.loc, SITE_URL).href)}</loc>`,
    ...[...new Set(p.images.map(photoUrl))].map((u) => `    <image:image><image:loc>${esc(u)}</image:loc></image:image>`),
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");

const out = path.join(folder, "sitemap.xml");
fs.writeFileSync(out, xml);
const imageCount = pages.reduce((n, p) => n + new Set(p.images.map(photoUrl)).size, 0);
console.log(`Wrote ${out}: ${pages.length} pages, ${imageCount} photos`);
