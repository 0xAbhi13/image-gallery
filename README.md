# Responsive Image Gallery — Veda Technology Internship Task 9

Day 9 of a 45-day Web Development Internship at **Veda Technology**.
A polished, fully responsive image gallery with an accessible lightbox, built with
**HTML5, CSS3 and Vanilla JavaScript** — no frameworks, no libraries, no build step.

**Developer:** Abhishek Jadhav · **GitHub:** [@0xAbhi13](https://github.com/0xAbhi13)

---

## Table of Contents

- [Task Objective](#task-objective)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [How the Gallery Works](#how-the-gallery-works)
- [Lightbox Behaviour](#lightbox-behaviour)
- [Image Loading and Failure Handling](#image-loading-and-failure-handling)
- [Why CSS Grid, Alt Text and DOM Events Matter](#why-css-grid-alt-text-and-dom-events-matter)
- [Screenshots](#screenshots)
- [Testing](#testing)
- [Deployment with GitHub Pages](#deployment-with-github-pages)
- [Image Source and Attribution](#image-source-and-attribution)
- [Limitations](#limitations)

---

## Task Objective

Build a responsive image gallery that displays at least 12 photographs in a CSS Grid layout and
lets the user open any photograph in a large modal preview, navigating between images without
leaving the preview.

Deliverables required by the brief, and where they are implemented:

| Requirement | Where |
|-------------|-------|
| Responsive CSS Grid layout | `style.css` → `.gallery` |
| At least 12 images (16 used) | `script.js` → `ITEMS` |
| Publicly accessible photographs | Unsplash CDN, see [Attribution](#image-source-and-attribution) |
| Varied subjects (5 themes) | Mountains, Nature, Wildlife, Architecture, Travel |
| Descriptive `alt` text | `script.js` → `alt` on every item |
| Consistent dimensions + `object-fit: cover` | `style.css` → `.tile__media`, `.tile__image` |
| Hover effects and transitions | `style.css` → `.tile:hover`, `.tile__image` transform |
| Every image clickable | `script.js` → delegated `click` on the grid |
| Title, subtitle, clean layout | `index.html` → `.page__header` |
| Modal lightbox with close / prev / next / caption / counter | `index.html` → `<dialog id="lightbox">` |
| Dark overlay, open/close animation | `style.css` → `::backdrop`, `lightbox-in` / `lightbox-out` |
| Click outside closes | `script.js` → overlay `click` handler |
| `Escape` closes | `script.js` → `keydown` + `cancel` handlers |
| Arrow keys navigate | `script.js` → `keydown` handler |
| Background scroll prevented / restored | `script.js` → `lockBackgroundScroll` / `unlockBackgroundScroll` |
| Lazy loading | `script.js` → `loading` attribute |
| Graceful failure handling | `script.js` → `buildSources`, `advanceToNextSource`, `placeholderFor` |

---

## Features

- **16 photographs** across 5 themes — well above the 12 required.
- **Fluid CSS Grid** — `repeat(auto-fill, minmax(240px, 1fr))` reflows from 4 columns down to 2
  with no per-breakpoint column counts.
- **Consistent 4:3 frames** with `object-fit: cover`, so every card is the same size whatever the
  photograph's native proportions.
- **Accessible lightbox** built on the native `<dialog>` element opened with `showModal()`, so the
  browser supplies real modal semantics, top-layer rendering and Escape handling.
- **Full keyboard support** — `Tab` cycles only inside the preview, `←` / `→` navigate, `Esc` closes,
  and focus returns to the thumbnail that opened it.
- **Background scroll lock** with scrollbar-width compensation so the page does not jump sideways.
- **Three-layer image fallback** — two candidate URLs per photograph, then a locally generated SVG
  placeholder, so there is never a broken-image icon or an empty card.
- **Lazy loading** — the first four thumbnails load eagerly (they are above the fold on desktop), the
  other twelve only load as they scroll into view.
- **Honest failure messaging** — a tile shows "Photograph unavailable" and the lightbox explains
  itself in its caption instead of silently showing nothing.
- **Respects `prefers-reduced-motion`** — all animation collapses to ~0 s.
- **Visible keyboard focus rings** and `forced-colors` support for Windows High Contrast.
- **No horizontal scrolling** from 320 px upwards.

---

## Technologies

| Technology | Use |
|------------|-----|
| HTML5 | Semantic landmarks, native `<dialog>`, `figure`/`figcaption`, native `<button>` |
| CSS3 | Custom properties, CSS Grid, Flexbox, `aspect-ratio`, `object-fit`, `clamp()`, keyframes, `::backdrop`, media queries, `prefers-reduced-motion` |
| JavaScript (ES6+) | Array dataset, DOM creation, event delegation, capture-phase listeners, `showModal()`, keyboard handling, focus management |

No React, Vue, Bootstrap, Tailwind or jQuery. No npm packages — the test suites used during
development were run with Node's built-in modules only.

---

## Project Structure

```text
internship-task-9/
├── index.html                                       # Semantic markup + lightbox <dialog>
├── style.css                                        # Design tokens, grid, cards, lightbox, responsive
├── script.js                                        # Dataset, rendering, lightbox logic
├── README.md                                        # This file
└── assets/
    ├── favicon.svg                                  # Local SVG favicon (blue photo mark)
    ├── screenshot-desktop.png                       # 1440 × 1100
    ├── screenshot-lightbox.png                      # 1280 × 900 — lightbox open
    ├── screenshot-tablet.png                        # 820 × 1180
    ├── screenshot-mobile.png                        # 390 × 844
    └── screenshot-mobile-lightbox.png               # 390 × 844 — lightbox open
```

All paths in `index.html` are **relative** (`./style.css`, `./script.js`, `./assets/favicon.svg`)
so the project works from GitHub Pages without configuration.

---

## How to Run

No install, no build step.

```powershell
# Option 1 — just open it
start ".\index.html"

# Option 2 — local server (recommended, mirrors how Pages serves it)
python -m http.server 8000
# then browse to http://localhost:8000

# Option 3 — VS Code Live Server
# right-click index.html → Open with Live Server
```

Quick syntax check:

```powershell
node --check script.js
```

> **An internet connection is required to view the photographs** — they are loaded from the Unsplash
> CDN at runtime. With no connection the gallery still renders, but every card shows the built-in
> "Image unavailable" placeholder instead of a photo.

---

## How the Gallery Works

`script.js` is deliberately split into six commented sections so the logic stays easy to follow:

1. **DATA** — the `ITEMS` array. Each entry holds `id`, `photoId`, `title`, `category` and `alt`.
2. **IMAGE SOURCES** — `buildSources()` turns a `photoId` into a list of candidate URLs, and
   `placeholderFor()` builds the offline SVG fallback.
3. **GALLERY** — `buildTile()` creates one `<li><button><img>` per item; `renderGallery()` appends
   them all in a single `DocumentFragment`.
4. **LIGHTBOX** — open, close, navigate and scroll locking.
5. **EVENTS** — one delegated listener per behaviour.
6. **START** — `init()` wires everything together.

Keeping the data separate from the rendering means the gallery can grow simply by adding one object
to the array — no markup changes needed. The "Photographs: 16" and "Themes: 5" figures in the header
are also derived from the data at runtime, so they cannot drift out of sync.

---

## Lightbox Behaviour

| Interaction | Result |
|-------------|--------|
| Click / `Enter` / `Space` on a thumbnail | Opens the preview on that image |
| **Next** button, or `→` | Advances one image |
| **Previous** button, or `←` | Goes back one image |
| **Close** button, or `Esc` | Closes the preview |
| Click on the dark overlay | Closes the preview |
| Click **on the photograph** | Does nothing — the preview stays open |
| Click on the caption | Does nothing — the preview stays open |
| `Tab` / `Shift+Tab` | Cycles only between the three lightbox controls |

**Navigation wraps around on purpose.** Next on image 16 returns to image 1, and Previous on image 1
returns to image 16. This is a deliberate, consistent choice — the arrow buttons are never dead ends,
and the counter can never point past either end.

```js
function wrapIndex(index) {
  const total = ITEMS.length;
  if (total === 0) return -1;
  return ((index % total) + total) % total;
}
```

The preview image uses `object-fit: contain` with a `max-height`, so the whole photograph is always
visible rather than cropped.

---

## Image Loading and Failure Handling

Each photograph is never served from a single URL. `buildSources()` returns an ordered list:

1. `https://images.unsplash.com/<photoId>?auto=format&fit=crop&w=…&q=80`
2. the same photograph with a different CDN parameter signature, as a retry
3. a locally generated SVG placeholder showing the image's title

If a URL fails, the browser fires an `error` event and `advanceToNextSource()` moves to the next
candidate. If all candidates fail, `placeholderFor()` draws the placeholder and the interface says so
— the tile shows "Photograph unavailable", and the lightbox shows an explanatory line in its caption.

`load` and `error` events do **not** bubble, so they are captured on the container:

```js
dom.gallery.addEventListener('error', handleImageError, true);   // capture = true
```

One capture-phase listener per container means there is never a duplicate binding, no matter how many
images are rendered. Tile clicks use the same idea — a single delegated listener with
`event.target.closest('.tile')` instead of sixteen separate handlers.

A small but real detail: thumbnails fade in via an `is-loaded` class, so an image is only visible once
it has actually loaded. An image that comes from the browser cache can finish *before* the listener is
attached, so `renderGallery()` also re-checks `img.complete` and shows those immediately — otherwise
such an image would stay invisible at `opacity: 0` forever.

---

## Why CSS Grid, Alt Text and DOM Events Matter

### CSS Grid

A gallery is fundamentally a two-dimensional layout problem: rows **and** columns that must stay
aligned. Grid solves that directly.

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
}
```

- `auto-fill` + `minmax(240px, 1fr)` computes the column count from the available width, so the grid
  reflows on its own — 4 columns at 1440 px, 3 at 820 px, 2 at 390 px — with no hard-coded breakpoints
  and no JavaScript measuring the screen.
- Every item is placed into the next free cell, so the rows stay aligned no matter how long the
  captions are.
- `aspect-ratio: 4 / 3` on each card plus `object-fit: cover` on the image gives every photograph the
  same frame and the same crop, which is what makes the grid look tidy rather than ragged.

Flexbox is still used where it is the right tool — the header facts row and the lightbox control row
are one-dimensional, so Flexbox fits them better.

### Alt text

`alt` is not decoration; it is the content of the image for anyone who cannot see it.

- A screen-reader user browsing this gallery hears *"A red fox standing in snow and looking back over
  its shoulder."* instead of *"image"*.
- If the image fails to load or the page is used on a slow connection, alt text is what remains — which
  is why a photo-only card with no alt text is an empty box to those users.
- Alt text should describe what is in the picture, not repeat the caption or say "photo of". Every
  alt string here was written after actually looking at the corresponding photograph.
- Decorative icons in the lightbox are `aria-hidden="true"` with `focusable="false"`, so they are not
  announced at all — alt text is only useful when it is not diluted by noise.

Each thumbnail is also wrapped in a `<button>` with its own `aria-label` ("View image 5 of 16: The
Cascade, Nature"), so the *action* is announced, not just the picture.

### JavaScript DOM events

The gallery is rendered from data, so the DOM has to be built and then made interactive.

- **Event delegation** — one `click` listener on the grid handles all sixteen tiles. Adding a
  seventeenth photo adds zero listeners.
- **Capture-phase listeners** for `load` / `error`, because those events do not bubble.
- **`keydown` for keyboard control** — `←` / `→` / `Esc` / `Tab` handled in one `switch`, with
  `preventDefault()` so arrow keys do not also scroll the page.
- **`cancel` on the `<dialog>`** — the browser's own Escape signal, intercepted so the close can be
  animated instead of snapping shut.
- **Focus management** — focus enters the dialog on open, is trapped inside it, and is returned to
  the originating thumbnail on close. Without this, a keyboard user is stranded or silently dumped
  back at the top of the page.
- **`animationend`** finishes the close once the fade-out has played.

---

## Screenshots

**Desktop — 1440 × 1100**

![Responsive Image Gallery desktop view](./assets/screenshot-desktop.png)

**Lightbox — 1280 × 900**

![Lightbox preview with caption and counter](./assets/screenshot-lightbox.png)

**Tablet — 820 × 1180**

![Responsive Image Gallery tablet view](./assets/screenshot-tablet.png)

**Mobile — 390 × 844**

![Responsive Image Gallery mobile view](./assets/screenshot-mobile.png)

**Mobile lightbox — 390 × 844**

![Lightbox on a mobile screen](./assets/screenshot-mobile-lightbox.png)

---

## Testing

Everything below was actually executed against these files.

### Real browser — Microsoft Edge 155 headless (Chrome DevTools Protocol)

**124 / 124 checks passed.** Driven through a real Edge instance using Node's built-in WebSocket —
real mouse clicks at real coordinates, real key events, real network requests.

- Page loads from `file://`; `style.css` applies and `script.js` executes.
- 16 tiles render, each a native `<button type="button">` wrapping one `<img>`.
- Every image has unique, meaningful `alt` text; every tile has an `aria-label`.
- Grid resolves to 4 / 4 / 3 / 3 / 2 / 2 columns at 1440 / 1100 / 820 / 600 / 390 / 320 px.
- **No horizontal scrolling at any of those six widths**; all tiles inside the viewport.
- Every thumbnail keeps an exact 4:3 frame at every width, with `object-fit: cover`.
- All 16 photographs downloaded successfully from the CDN; 4 eager + 12 lazy.
- Clicking a thumbnail opens a real modal (`dialog.open` and `:modal` both true).
- Counter reads `5 / 16` when the fifth photo is clicked; title, category and alt text match that photo.
- Next / Previous buttons and `→` / `→` / `←` all step the counter correctly.
- Next on image 16 wraps to 1; Previous on image 1 wraps to 16; wrapping stable over 19 advances.
- `Esc` closes; the close button closes; clicking the dark overlay closes.
- Clicking **on the photograph** does *not* close it; clicking the caption does *not* close it.
- Background scrolling locked while open and restored on close, with padding removed.
- Focus returns to the exact thumbnail that opened the preview.
- `Tab` cycles only between the three lightbox controls and never escapes to the page.
- Open → navigate → close repeated 4/4 times with no leftover state.
- Forced image failure: both candidate URLs were tried, then the placeholder was drawn — tile keeps its
  size, no broken-image icon, and the lightbox explains the failure.
- `prefers-reduced-motion: reduce` collapses animation to `0.000001s` and the modal still closes.
- At 390 px the lightbox has no horizontal scroll, the image fits the viewport, and all three buttons
  are ≥ 44 px.
- Previous button sits left of the photo, Next sits right of it, neither overlaps, photo centred.
- Favicon loads from the local relative path. **No uncaught exceptions and no console errors.**

### Static and logic suite — Node.js 24

**97 / 97 checks passed.**

- HTML: doctype, `lang`, charset, viewport, single `<h1>`, meta description, semantic landmarks, all
  buttons typed, no inline `on*` handlers, no inline `<script>` blocks.
- `script.js`: no `eval()`, no `new Function()`, no `innerHTML`, no `document.write`; strict mode and
  an IIFE wrapper; every `getElementById()` target exists in the HTML.
- Linked files all exist and all paths are relative.
- CSS: custom properties, `display: grid`, `auto-fill` + `minmax()`, `object-fit: cover` and
  `contain`, media queries, `prefers-reduced-motion`, `:focus-visible`, `::backdrop`, balanced braces.
- Dataset: 16 items, no duplicate ids/titles/alt text/photo ids, all five required themes present.
- **Live HTTP check: all 16 photograph URLs returned HTTP 200 with a valid `image/*` body.**
- `node --check script.js` passes.

### Bugs found and fixed during testing

| Bug | Cause | Fix |
|-----|-------|-----|
| Tab escaped the lightbox onto the page | The handler only *corrected* focus after it had already left | Explicit focus trap that cycles between the dialog's controls |
| Arrow buttons both sat left of the photo | `next` button was written before `<figure>` in the HTML | Moved `next` after the figure |
| Arrow buttons stacked vertically on mobile | `flex-direction: column` + `order` | Grid areas, keeping one DOM order for both layouts |
| Cached thumbnails could stay invisible | `load` listener attached after render; image already complete | Re-check `img.complete` after rendering |
| Skip link moved focus nowhere | Targeted a `<ul>`, which is not focusable | `id` moved to the `<section>` with `tabindex="-1"` |

**Not verified here:** behaviour in Firefox or Safari, real touch gestures on a physical phone, and
screen-reader output (NVDA / Narrator / VoiceOver) — these need a manual session with assistive
technology. Automated checks confirm the ARIA attributes and focus behaviour are correct, but cannot
prove how a given screen reader announces them.

---

## Deployment with GitHub Pages

The commands below are provided for the submission step. **Nothing has been committed or pushed yet**,
and no repository URL has been created — replace `<your-repository-url>` with your real one.

```powershell
cd "C:\Users\EDIUS X.30\Documents\Default Project\internship-task-9"

git init -b main
git add index.html style.css script.js README.md assets
git commit -m "Task 9: Responsive Image Gallery with lightbox (HTML + CSS + JS)"
git remote add origin <your-repository-url>
git push -u origin main
```

Then on GitHub:

1. Open the repository → **Settings** → **Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch `main`, folder `/ (root)` → **Save**.
4. GitHub publishes the site and shows the live URL, which will look like
   `https://0xAbhi13.github.io/<your-repository>/`.

If you keep all internship tasks in one repository, set the Pages source to the
`internship-task-9` folder, or open the site through the repository path.

---

## Image Source and Attribution

All 16 photographs are served from the **Unsplash** image CDN
(`https://images.unsplash.com/`) using their standard public photo URLs.

- Unsplash home: <https://unsplash.com>
- Unsplash licence: <https://unsplash.com/license> — free to use, no attribution required, though it
  is credited here as good practice.

The photographs remain the property of their respective Unsplash photographers. This project is an
educational exercise for a Veda Technology internship and is not endorsed by Unsplash.

---

## Limitations

- **An internet connection is required** to display the photographs. Offline, every card shows the
  built-in "Image unavailable" placeholder by design.
- **The fallback URLs are retries of the same photograph**, not mirrors on a different provider. They
  handle a failed or rate-limited request; they cannot help if `images.unsplash.com` is unreachable
  altogether, which is what the local SVG placeholder is for.
- **Wrapping, not clamping** — next on the last image returns to the first. This is intentional and
  consistent, but it does mean you cannot stop at the end of the set.
- **No lightbox preloading** of the neighbouring images, so the first frame after a fast arrow-key
  press may take a moment to appear on a slow connection.
- **No filtering, search, favourites or download** — out of scope for Task 9; controls were kept
  minimal on purpose.
- **No data is stored or transmitted.** The gallery is entirely client-side.
