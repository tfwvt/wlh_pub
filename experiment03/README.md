# experiment03

A third version of the Wayne Herpich website. It builds on [experiment02](../experiment02) (a gallery-style site with a page per series): the same white walls, quiet type and page structure, with the work sections renamed by size and medium, two new sections and a few small additions. [experiment01](../experiment01) is the original single long page.

The photos have not been copied. Every image is embedded straight from where it already lives on wayneherpich.com (`https://wayneherpich.com/images/...`), so the original site must stay online.

It's a static site with no build step: open `index.html`, or serve the folder with GitHub Pages.

## Work sections

In the order they appear on the Work page:

| Section | Images |
| --- | --- |
| 108" x 48" Marker on Canvas | 22 (`wayneherpich2026-43` to `-64`) |
| 44" x 43" Oil on Linen | 42 paintings, then a full-width gallery panorama |
| 108" x 48" Oil on Canvas | 21 |
| Paintings 3 | 35 |
| Sculpture | 7 (`wayneherpich2026-65` to `-71`) |

## What's different from experiment02

- **New sections:** 108" x 48" Marker on Canvas (first) and Sculpture (last).
- **Full-width images:** add `wide: true` to an image in `content.js` to make it span the whole wall on a row of its own. The 44" x 43" gallery panorama uses it.
- **Covers from anywhere:** a section's `cover` can be any image file, not only one of the section's own images.
- **No breadcrumb:** series pages no longer show the "Work /" link above the title. The header's Work link and the series tabs do that job.

## Pages

| Page | What it shows |
| --- | --- |
| `index.html` | Home: a large photograph of the paintings installed in a gallery |
| `work.html` | Work: one card per section |
| `series.html?s=...` | One page per section: the images hung on a "wall", tabs to the other sections, and previous/next links. Click an image to see it full screen |
| `about.html` | Bio, photograph and CV |
| `contact.html` | A photograph, then email and Instagram |

There is one `series.html` for all the sections. The `?s=` part of the address chooses which section it shows, and is made from the section's title (e.g. `series.html?s=sculpture`), so a new section doesn't need a new file. Each image also has its own link, e.g. `series.html?s=sculpture#3`.

## Files

| File | What it is |
| --- | --- |
| `content.js` | **All the content.** Artist details, home photograph, every work section, the bio and the CV |
| `site.js` | Builds every page from `content.js`: header, footer, section cards, the wall and the full-screen viewer |
| `styles.css` | Design tokens (colours, font, spacing) at the top, then styles for each page |
| `*.html` | Page shells. They are all the same except for the title and `data-page` |

## Adding a new section

Edit `content.js` only:

1. Find `sections`. Copy a whole block, from `{ title:` to its closing `},`.
2. Paste it where the new section should appear (sections are listed in this order everywhere).
3. Change `title` and list the new images:

```js
{
  title: '60" x 40" Oil on Canvas',
  description: "Optional sentence shown on the section page.",
  images: [
    { file: "new_painting_01.jpg", width: 600, height: 800 },
    { file: "new_painting_02.jpg", title: "Untitled", year: 2026, medium: "Oil on canvas", size: "40 × 30 in" },
    { file: "new_panorama.jpg", width: 1600, height: 360, wide: true },
  ],
},
```

The new section automatically gets its own page, a card on the Work page, a tab on every section page and previous/next links. A section with no images is left out until it has at least one.

- `file` is the image's name in `https://wayneherpich.com/images/` (set once as `imageBase`). Upload new photos there the same way as before. For an image hosted anywhere else, use `src: "https://..."` instead of `file`.
- `width` and `height` (in pixels) are optional. With them, the wall is laid out before the photos arrive. Without them, the page reads each photo's size as it loads.
- `wide: true` is optional. It makes the image span the full width of the wall, on its own row. Use it for panoramas and other very wide images, which would otherwise be a thin strip in a normal cell.
- `title`, `year`, `medium` and `size` are optional. They appear in the caption under the image and in the full-screen viewer. Images without them are captioned with their number.
- `cover` on a section (e.g. `cover: "new_painting_02.jpg"`) picks the image on its Work card. It can be any image file, even one that isn't in the section. Otherwise the first image is used.
- If an image can't be found (for example a misspelt file name), it is left out of the page rather than shown broken. It still counts in the number of works, so double-check file names.

## Other updates

- **Home photograph:** `home.image`.
- **Bio and CV:** edit `bio` and `cv`. To link words in the bio (opening in a new tab), write `[the words](https://...)`. Copy a line to add a show or review (newest first), add `url: "https://..."` to link one, or copy a whole `{ heading: ..., items: [...] }` block for a new group. A group can instead hold smaller groups (`groups: [...]`), shown as subheadings, as Exhibitions and Bibliography do.
- **Contact details and tagline:** `artist` at the top. Delete a line to hide it. A `phone: "..."` line can be added to show a phone number.
- **About photo:** `aboutImage`.
- **Contact photo:** `contactImage`. Delete it to show the Contact page without a photo.

## Design notes

- On section pages the images are sized by area rather than all at the same height, so a tall, narrow strip appears taller and a wide piece wider. Each image sits at the bottom of its grid cell, so a row shares a baseline like a hang on a wall. Images marked `wide` are the exception: they fill a whole row.
- The full-screen viewer is white, like the walls. Use the arrow keys or swipe to move between images, and Esc or Close to return.

## Sources

The original painting content was gathered on 2026-10-26 from wayneherpich.com, as for experiment02. The Marker on Canvas, Sculpture and panorama images were added on 2026-10-31 and are also served from wayneherpich.com. The bio, CV and email come from the artist's resume. The Instagram link is the account linked from wayneherpich.com, @wayne_herpich_art.
