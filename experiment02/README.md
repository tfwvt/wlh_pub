# experiment02

A second version of the Wayne Herpich website, laid out like a gallery website: white walls, quiet type, and a separate page for each series of paintings. It uses the same content as [experiment01](../experiment01), which is a single long page.

The photos have not been copied. Every painting is embedded straight from where it already lives on wayneherpich.com (`https://wayneherpich.com/images/...`), so the original site must stay online.

It's a static site with no build step: open `index.html`, or serve the folder with GitHub Pages.

## Pages

| Page | What it shows |
| --- | --- |
| `index.html` | Home: a large slideshow of selected paintings, then the list of series |
| `work.html` | Work: one card per series |
| `series.html?s=paintings-1` | One page per series: the paintings hung on a "wall", tabs to the other series, and previous/next links. Click a painting to see it full screen |
| `about.html` | Bio, photograph and CV |
| `contact.html` | Email, Instagram and location |

There is one `series.html` for all the series. The `?s=` part of the address chooses which series it shows, so a new series doesn't need a new file. Each painting also has its own link, e.g. `series.html?s=paintings-3#12`.

## Files

| File | What it is |
| --- | --- |
| `content.js` | **All the content.** Artist details, home slideshow, every series of paintings, the bio and the CV |
| `site.js` | Builds every page from `content.js`: header, footer, slideshow, series cards, the painting wall and the full-screen viewer |
| `styles.css` | Design tokens (colours, font, spacing) at the top, then styles for each page |
| `*.html` | Page shells. They are all the same except for the title and `data-page` |

## Adding a new section of paintings

Edit `content.js` only:

1. Find `sections`. Copy a whole block, from `{ title:` to its closing `},`.
2. Paste it where the new series should appear (series are listed in this order everywhere).
3. Change `title` and list the new images:

```js
{
  title: "Paintings 4",
  description: "Optional sentence shown on the series page.",
  images: [
    { file: "new_painting_01.jpg" },
    { file: "new_painting_02.jpg", title: "Untitled", year: 2026, medium: "Oil on canvas", size: "40 × 30 in" },
  ],
},
```

The new series automatically gets its own page (here `series.html?s=paintings-4`), a card on the Work and home pages, a tab on every series page and previous/next links.

- `file` is the image's name in `https://wayneherpich.com/images/` (set once as `imageBase`). Upload new photos there the same way as before. For an image hosted anywhere else, use `src: "https://..."` instead of `file`.
- `width` and `height` (in pixels) are optional. With them, the wall is laid out before the photos arrive. Without them, the page reads each photo's size as it loads.
- `title`, `year`, `medium` and `size` are optional. They appear in the caption under the painting and in the full-screen viewer. Paintings without them are captioned with their number.
- `cover` on a series (e.g. `cover: "new_painting_02.jpg"`) picks the image on its card. Otherwise the first image is used.
- If an image can't be found (for example a misspelt file name), it is left out of the page rather than shown broken. It still counts in the number of works, so double-check file names.

## Other updates

- **Home slideshow:** list file names in `home.slides`. Each must also appear in one of the sections, so its caption can link to that series. `secondsPerSlide` sets the speed.
- **Bio and CV:** edit `bio` and `cv`, the same way as in experiment01. Copy a line to add a show or review (newest first), add `url: "https://..."` to link one, or copy a whole `{ heading: ..., items: [...] }` block for a new group.
- **Contact details:** `artist` at the top. Delete a line to hide it. A `phone: "..."` line can be added to show a phone number.
- **About photo:** `aboutImage`.

## Design notes

- On series pages the paintings are sized by area rather than all at the same height, so a tall, narrow strip appears taller and a wide piece wider. Each painting sits at the bottom of its grid cell, so a row shares a baseline like a hang on a wall.
- The full-screen viewer is white, like the walls. Use the arrow keys or swipe to move between paintings, and Esc or Close to return.
- The slideshow can be paused, and it doesn't auto-advance for visitors who have reduced motion turned on.

## Sources

Painting content was gathered on 2026-10-26 from wayneherpich.com (the three gallery pages and all 61 painting pages). The bio, CV, email and location come from the artist's resume. The Instagram link is the account linked from wayneherpich.com, @wayne_herpich_art.
