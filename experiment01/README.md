# experiment01

A redesigned website for the painter Wayne Herpich, based on the current site at [wayneherpich.com](https://wayneherpich.com/).

The photos have not been copied. Every painting is embedded straight from where it already lives on wayneherpich.com (`https://wayneherpich.com/images/...`), so the original site must stay online.

It's a static site with no build step: open `index.html`, or serve the folder with GitHub Pages.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page structure: header, hero, series overview, contact, footer and the full-screen viewer |
| `content.js` | **All the content.** The artist's details, the hero photo and every section of paintings |
| `app.js` | Turns `content.js` into the page: menu, series cards, painting grids and the viewer |
| `styles.css` | Design tokens (colours, fonts, spacing) at the top, then styles for each part. Light and dark mode are included |

## Adding a new section of paintings

Edit `content.js` only:

1. Find `sections`. Copy a whole block, from `{ title:` to its closing `},`.
2. Paste it where the new section should appear (sections show in the order listed).
3. Change `title` and list the new images:

```js
{
  title: "Paintings 4",
  description: "Optional sentence shown under the title.",
  images: [
    { file: "new_painting_01.jpg" },
    { file: "new_painting_02.jpg", title: "Untitled", year: 2026, medium: "Oil on canvas", size: "40 × 30 in" },
  ],
},
```

The menu link, the series card, the counts and the grid are all created automatically.

- `file` is the image's name in `https://wayneherpich.com/images/` (set once as `imageBase`). Upload new photos there the same way as before. For an image hosted anywhere else, use `src: "https://..."` instead of `file`.
- `width` and `height` (in pixels) are optional. With them, the grid is laid out before the photos arrive. Without them, the page reads each photo's size as it loads.
- `title`, `year`, `medium` and `size` are optional. They appear as a caption in the full-screen viewer.
- `cover` on a section (e.g. `cover: "new_painting_02.jpg"`) picks the image on its series card. Otherwise the first image is used.
- If an image can't be found (for example a misspelt file name), it is left out of the page rather than shown broken.

## Features

- A justified grid: each row lines up and every painting keeps its proportions and order. Images load as you scroll.
- Click any painting for a full-screen viewer with arrow keys, swipe on phones, and Esc to close. Each painting has its own link (e.g. `#paintings-3/12`) that can be shared.
- Light and dark mode follow the visitor's system setting, with a toggle in the header.
- Works on phones, tablets and desktops.

## Sources

Content gathered on 2026-10-26 from wayneherpich.com: the home page, the three gallery pages (Paintings 1–3) and all 61 painting pages. The old site has no titles or captions for the paintings, so none are shown yet. Add them in `content.js` when available.
