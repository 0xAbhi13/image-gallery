/* ==========================================================================
   Responsive Image Gallery — application script
   Veda Technology Web Development Internship — Task 9

   Vanilla JavaScript only. The file is split into four clear sections:
     1. DATA          the photo dataset
     2. IMAGE SOURCES URL builders + graceful fallback
     3. GALLERY       builds the CSS Grid tiles
     4. LIGHTBOX      modal open / close / navigate

   No frameworks, no eval(), no inline onclick handlers.
   ========================================================================== */

(function () {
  'use strict';

  /* =========================================================================
     1. DATA
     -------------------------------------------------------------------------
     Each photograph is one plain object. Keeping the data separate from the
     DOM code means the gallery can grow without touching the rendering logic.

       id        stable identifier, also used as the tile's data attribute
       photoId   the Unsplash photo id used to build every image URL
       title     short display name
       category  theme used for the small badge
       alt       descriptive alternative text describing what is pictured
     ========================================================================= */
  const ITEMS = [
    {
      id: 'above-the-clouds',
      photoId: 'photo-1506905925346-21bda4d32df4',
      title: 'Above the Clouds',
      category: 'Mountains',
      alt: 'A snow-capped mountain ridge rising above a thick sea of clouds lit by a warm sunset.'
    },
    {
      id: 'turquoise-cove',
      photoId: 'photo-1501785888041-af3ef285b470',
      title: 'Turquoise Cove',
      category: 'Mountains',
      alt: 'A single wooden rowboat floating on clear turquoise alpine water below grey cliffs and pine slopes.'
    },
    {
      id: 'blue-hour-summit',
      photoId: 'photo-1483728642387-6c3bdd6c93e5',
      title: 'Blue Hour Summit',
      category: 'Mountains',
      alt: 'A snow-covered mountain summit silhouetted against a deep blue dusk sky.'
    },
    {
      id: 'light-through-trees',
      photoId: 'photo-1441974231531-c6227db76b6e',
      title: 'Light Through the Trees',
      category: 'Nature',
      alt: 'Sunbeams streaming through the trunks of tall forest trees onto a path on the ground.'
    },
    {
      id: 'fogbound-pines',
      photoId: 'photo-1418065460487-3e41a6c84dc5',
      title: 'Fogbound Pines',
      category: 'Nature',
      alt: 'A stand of conifer trees fading gradually into dense grey fog.'
    },
    {
      id: 'forest-walk',
      photoId: 'photo-1447752875215-b2761acb3c5d',
      title: 'Forest Walk',
      category: 'Nature',
      alt: 'A wooden footbridge with metal railings leading into a green forest.'
    },
    {
      id: 'the-cascade',
      photoId: 'photo-1433086966358-54859d0ed716',
      title: 'The Cascade',
      category: 'Nature',
      alt: 'A tall waterfall dropping in several tiers through dense green foliage.'
    },
    {
      id: 'meadow-poppies',
      photoId: 'photo-1465146344425-f00d5f5c8f07',
      title: 'Meadow Poppies',
      category: 'Nature',
      alt: 'Red poppies scattered across a wild grass meadow under a pale sky.'
    },
    {
      id: 'red-fox',
      photoId: 'photo-1474511320723-9a56873867b5',
      title: 'Red Fox',
      category: 'Wildlife',
      alt: 'A red fox standing in snow and looking back over its shoulder.'
    },
    {
      id: 'kingfisher',
      photoId: 'photo-1444464666168-49d633b86797',
      title: 'Kingfisher',
      category: 'Wildlife',
      alt: 'A blue and orange kingfisher perched on the bare end of a branch.'
    },
    {
      id: 'tabby-at-rest',
      photoId: 'photo-1518791841217-8f162f1e1131',
      title: 'Tabby at Rest',
      category: 'Wildlife',
      alt: 'A grey tabby cat lying down on a pale blanket with its head raised.'
    },
    {
      id: 'bay-bridge',
      photoId: 'photo-1449034446853-66c86144b0ad',
      title: 'Bay Bridge',
      category: 'Architecture',
      alt: 'A large red-orange suspension bridge spanning a bay with hills rising behind it.'
    },
    {
      id: 'desert-metropolis',
      photoId: 'photo-1512453979798-5ea266f8880c',
      title: 'Desert Metropolis',
      category: 'Architecture',
      alt: 'A dense modern city skyline at sunset with a very tall tapering skyscraper at its centre.'
    },
    {
      id: 'tropical-resort',
      photoId: 'photo-1520250497591-112f2f40a3f4',
      title: 'Tropical Resort',
      category: 'Travel',
      alt: 'A turquoise swimming pool beside a resort with thatched-roof huts and palm trees.'
    },
    {
      id: 'from-the-boat',
      photoId: 'photo-1476514525535-07fb3b4ae5f1',
      title: 'From the Boat',
      category: 'Travel',
      alt: 'The wooden bow of a rowing boat pointing towards a still green lake ringed by mountains.'
    },
    {
      id: 'surf-and-rocks',
      photoId: 'photo-1500375592092-40eb2168fd21',
      title: 'Surf and Rocks',
      category: 'Travel',
      alt: 'White sea foam washing over dark coastal rocks under a hazy sky.'
    }
  ];

  /* Sizes requested from the image CDN. Both use a 4:3 crop so the thumbnail
     and the full-size preview frame the photograph identically. */
  const THUMB_SIZE = { width: 640, height: 480 };
  const FULL_SIZE = { width: 1600, height: 1200 };

  /* How many leading photographs load eagerly (above the fold on desktop).
     Everything after that is lazy-loaded. */
  const EAGER_COUNT = 4;

  /* Used when the close animation is skipped (reduced motion, old browser). */
  const CLOSE_FALLBACK_MS = 400;

  /* =========================================================================
     2. IMAGE SOURCES
     -------------------------------------------------------------------------
     A photograph is never served from one single URL. Each item produces an
     ordered list of candidate URLs; the next candidate is tried whenever the
     browser fires an `error` event. If every candidate fails, a locally
     generated SVG placeholder is drawn instead — so a dead network can never
     leave a broken-image icon or an empty gallery card.
     ========================================================================= */

  function buildSources(item, size) {
    const base = 'https://images.unsplash.com/' + item.photoId;
    const w = size.width;
    const h = size.height;

    return [
      base + '?auto=format&fit=crop&w=' + w + '&h=' + h + '&q=80',
      base + '?ixlib=rb-4.0.3&auto=format&fit=crop&w=' + w + '&h=' + h + '&q=70&fm=jpg'
    ];
  }

  /* Escapes the five characters that cannot appear literally in XML text. */
  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /* Shortens a caption so it always fits on one line of the placeholder. */
  function shorten(text, maxLength) {
    const clean = String(text).trim();
    return clean.length > maxLength ? clean.slice(0, maxLength - 1) + '…' : clean;
  }

  /* Builds the offline placeholder shown after every candidate URL has failed. */
  function placeholderFor(item) {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">',
      '<rect width="640" height="480" fill="#eef2f8"/>',
      '<g fill="none" stroke="#94a3b8" stroke-width="8" stroke-linejoin="round">',
      '<rect x="238" y="150" width="164" height="128" rx="10"/>',
      '<path d="M246 262l44-46 34 32 30-26 40 40"/>',
      '<circle cx="288" cy="186" r="12"/>',
      '</g>',
      '<text x="320" y="330" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"',
      ' font-size="27" font-weight="600" fill="#334155">' + escapeXml(shorten(item.title, 28)) + '</text>',
      '<text x="320" y="364" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"',
      ' font-size="19" fill="#64748b">Image unavailable</text>',
      '</svg>'
    ].join('');

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* =========================================================================
     3. GALLERY RENDERING
     ========================================================================= */
  const dom = {};

  function cacheDom() {
    dom.gallery = document.getElementById('galleryGrid');
    dom.factCount = document.getElementById('factCount');
    dom.factThemes = document.getElementById('factThemes');
    dom.lightbox = document.getElementById('lightbox');
    dom.image = document.getElementById('lightboxImage');
    dom.title = document.getElementById('lightboxTitle');
    dom.category = document.getElementById('lightboxCategory');
    dom.counter = document.getElementById('lightboxCounter');
    dom.notice = document.getElementById('lightboxNotice');
    dom.close = document.getElementById('lightboxClose');
    dom.prev = document.getElementById('lightboxPrev');
    dom.next = document.getElementById('lightboxNext');
  }

  /* Builds one <li><button><img> tile. The button (not the image) is the
     click target, so the gallery is fully keyboard operable for free. */
  function buildTile(item, index) {
    const sources = buildSources(item, THUMB_SIZE);

    const li = document.createElement('li');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tile';
    button.style.setProperty('--tile-index', String(index));
    button.dataset.index = String(index);
    button.dataset.itemId = item.id;
    button.setAttribute(
      'aria-label',
      'View image ' + (index + 1) + ' of ' + ITEMS.length + ': ' + item.title + ', ' + item.category
    );

    const media = document.createElement('div');
    media.className = 'tile__media';

    const img = document.createElement('img');
    img.className = 'tile__image';
    img.alt = item.alt;                       // meaningful alternative text
    img.decoding = 'async';
    img.loading = index < EAGER_COUNT ? 'eager' : 'lazy';
    img.dataset.itemId = item.id;
    img.dataset.sources = JSON.stringify(sources);
    img.dataset.attempt = '0';
    img.src = sources[0];

    const status = document.createElement('span');
    status.className = 'tile__status';
    status.hidden = true;
    status.textContent = 'Photograph unavailable';

    media.appendChild(img);
    media.appendChild(status);

    const caption = document.createElement('span');
    caption.className = 'tile__caption';

    const category = document.createElement('span');
    category.className = 'tile__category';
    category.textContent = item.category;

    const title = document.createElement('span');
    title.className = 'tile__title';
    title.textContent = item.title;

    const meta = document.createElement('span');
    meta.className = 'tile__meta';
    meta.textContent = 'Image ' + (index + 1) + ' of ' + ITEMS.length;

    caption.appendChild(category);
    caption.appendChild(title);
    caption.appendChild(meta);

    button.appendChild(media);
    button.appendChild(caption);
    li.appendChild(button);

    return li;
  }

  function renderGallery() {
    const fragment = document.createDocumentFragment();

    ITEMS.forEach(function (item, index) {
      fragment.appendChild(buildTile(item, index));
    });

    dom.gallery.appendChild(fragment);

    /* An image that is already in the browser cache can finish loading before
       the `load` listener is attached below, which would leave it stuck at
       opacity 0. Anything already complete is shown straight away. */
    Array.prototype.forEach.call(dom.gallery.querySelectorAll('img'), function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('is-loaded');
      }
    });

    const themes = {};
    ITEMS.forEach(function (item) { themes[item.category] = true; });

    dom.factCount.textContent = String(ITEMS.length);
    dom.factThemes.textContent = String(Object.keys(themes).length);
  }

  /* --- Image load / error handling -------------------------------------
     `load` and `error` do not bubble, so both listeners are registered on the
     container in the capture phase. One listener per container means there is
     never a duplicate binding no matter how many images are rendered. */

  function markLoaded(event) {
    const img = event.target;
    if (img && img.tagName === 'IMG') {
      img.classList.add('is-loaded');
    }
  }

  /* Tries the next candidate URL; on the last failure draws the placeholder. */
  function advanceToNextSource(img) {
    const sources = readSources(img);
    const attempt = parseInt(img.dataset.attempt || '0', 10);

    if (attempt + 1 < sources.length) {
      img.dataset.attempt = String(attempt + 1);
      img.src = sources[attempt + 1];
      return;
    }

    showPlaceholder(img);
  }

  function readSources(img) {
    try {
      const parsed = JSON.parse(img.dataset.sources || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function findItem(id) {
    for (let i = 0; i < ITEMS.length; i++) {
      if (ITEMS[i].id === id) return ITEMS[i];
    }
    return ITEMS[0];
  }

  function showPlaceholder(img) {
    const item = findItem(img.dataset.itemId);

    img.classList.add('is-loaded');
    img.classList.add('is-fallback');
    img.src = placeholderFor(item);

    /* Thumbnail: raise the small "unavailable" note over the placeholder */
    const status = img.parentElement && img.parentElement.querySelector('.tile__status');
    if (status) status.hidden = false;

    /* Lightbox: raise the note inside the caption */
    if (img === dom.image && dom.notice) {
      dom.notice.hidden = false;
    }
  }

  function handleImageError(event) {
    const img = event.target;
    if (img && img.tagName === 'IMG') {
      advanceToNextSource(img);
    }
  }

  /* =========================================================================
     4. LIGHTBOX (native <dialog>)
     -------------------------------------------------------------------------
     `showModal()` gives correct modal semantics, focus containment and Escape
     handling from the browser itself. The parts below manage the state,
     navigation, background scrolling and focus restoration.
     ========================================================================= */
  const state = {
    index: -1,
    isOpen: false,
    isClosing: false,
    lastFocused: null,
    closeTimer: null,
    scrollbarWidth: 0,
    previousOverflow: '',
    previousPaddingRight: ''
  };

  /* Navigation wraps around on purpose, so the arrow buttons are never dead
     ends: next on the last image returns to the first, and vice versa. */
  function wrapIndex(index) {
    const total = ITEMS.length;
    if (total === 0) return -1;
    return ((index % total) + total) % total;
  }

  function lockBackgroundScroll() {
    state.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    state.previousOverflow = document.body.style.overflow;
    state.previousPaddingRight = document.body.style.paddingRight;

    /* Compensate for the removed scrollbar so the page does not jump sideways */
    if (state.scrollbarWidth > 0) {
      document.body.style.paddingRight = state.scrollbarWidth + 'px';
    }
    document.body.style.overflow = 'hidden';
  }

  function unlockBackgroundScroll() {
    document.body.style.overflow = state.previousOverflow;
    document.body.style.paddingRight = state.previousPaddingRight;
  }

  /* Restarts the image fade-in animation on every navigation. */
  function replayImageAnimation() {
    dom.image.style.animation = 'none';
    /* Reading a layout property forces the browser to notice the change */
    void dom.image.offsetWidth;
    dom.image.style.animation = '';
  }

  function showItem(index) {
    state.index = wrapIndex(index);
    const item = ITEMS[state.index];
    const sources = buildSources(item, FULL_SIZE);

    dom.image.dataset.itemId = item.id;
    dom.image.dataset.sources = JSON.stringify(sources);
    dom.image.dataset.attempt = '0';
    dom.image.alt = item.alt;
    dom.image.src = sources[0];

    if (dom.notice) dom.notice.hidden = true;

    dom.category.textContent = item.category;
    dom.title.textContent = item.title;
    dom.counter.textContent = (state.index + 1) + ' / ' + ITEMS.length;

    replayImageAnimation();
  }

  function goTo(delta) {
    if (!state.isOpen) return;
    showItem(state.index + delta);
  }

  function openLightbox(index, trigger) {
    if (state.isOpen) return;

    clearTimeout(state.closeTimer);
    state.isOpen = true;
    state.isClosing = false;
    state.lastFocused = trigger || document.activeElement;

    showItem(index);
    lockBackgroundScroll();

    dom.lightbox.classList.remove('is-closing');
    /* Force a reflow so the opening animation always replays */
    void dom.lightbox.offsetWidth;
    dom.lightbox.classList.add('is-open');

    dom.lightbox.showModal();
    dom.close.focus();
  }

  /* Runs the closing animation, then actually closes the dialog. */
  function closeLightbox() {
    if (!state.isOpen || state.isClosing) return;

    state.isClosing = true;
    dom.lightbox.classList.remove('is-open');
    dom.lightbox.classList.add('is-closing');

    /* Safety net in case the animation never fires `animationend` */
    state.closeTimer = setTimeout(finishClose, CLOSE_FALLBACK_MS);
  }

  function finishClose() {
    clearTimeout(state.closeTimer);
    state.closeTimer = null;

    if (dom.lightbox.open) {
      dom.lightbox.close();
    }

    dom.lightbox.classList.remove('is-closing');
    dom.lightbox.classList.remove('is-open');

    state.isOpen = false;
    state.isClosing = false;
    state.index = -1;

    unlockBackgroundScroll();

    /* Send focus back to the thumbnail that opened the preview */
    if (state.lastFocused && document.contains(state.lastFocused)) {
      state.lastFocused.focus();
    }
    state.lastFocused = null;
  }

  /* =========================================================================
     5. EVENTS
     ========================================================================= */

  /* Every control the user can reach with Tab while the preview is open. */
  const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function getFocusableControls() {
    return Array.prototype.filter.call(
      dom.lightbox.querySelectorAll(FOCUSABLE),
      function (element) {
        return element.getClientRects().length > 0;   /* visible */
      }
    );
  }

  /* Keeps Tab and Shift+Tab cycling inside the preview instead of letting
     focus escape onto the page behind it. */
  function trapFocus(event) {
    const controls = getFocusableControls();

    if (controls.length === 0) {
      event.preventDefault();
      return;
    }

    const current = controls.indexOf(document.activeElement);
    let next;

    if (current === -1) {
      next = 0;
    } else if (event.shiftKey) {
      next = (current - 1 + controls.length) % controls.length;
    } else {
      next = (current + 1) % controls.length;
    }

    event.preventDefault();
    controls[next].focus();
  }

  function bindEvents() {
    /* One delegated listener for every tile click — no per-tile bindings */
    dom.gallery.addEventListener('click', function (event) {
      const tile = event.target.closest('.tile');
      if (!tile || !dom.gallery.contains(tile)) return;
      openLightbox(parseInt(tile.dataset.index, 10), tile);
    });

    /* Capture-phase listeners catch load/error, which do not bubble */
    dom.gallery.addEventListener('load', markLoaded, true);
    dom.gallery.addEventListener('error', handleImageError, true);
    dom.lightbox.addEventListener('load', markLoaded, true);
    dom.lightbox.addEventListener('error', handleImageError, true);

    dom.close.addEventListener('click', closeLightbox);
    dom.prev.addEventListener('click', function () { goTo(-1); });
    dom.next.addEventListener('click', function () { goTo(1); });

    /* Clicking the dark overlay (anywhere outside the photo and caption) closes */
    dom.lightbox.addEventListener('click', function (event) {
      if (event.target.closest('.lightbox__figure')) return;
      if (event.target.closest('.lightbox__btn')) return;
      closeLightbox();
    });

    /* Escape is handled by the browser: intercept it so we can animate out */
    dom.lightbox.addEventListener('cancel', function (event) {
      event.preventDefault();
      closeLightbox();
    });

    /* Keyboard: arrows navigate, Escape closes, Tab stays inside the dialog */
    dom.lightbox.addEventListener('keydown', function (event) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goTo(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          goTo(1);
          break;
        case 'Escape':
          /* Handled by the `cancel` event above; prevented here so the
             browser does not close the dialog before the animation runs. */
          event.preventDefault();
          closeLightbox();
          break;
        case 'Tab':
          trapFocus(event);
          break;
        default:
          break;
      }
    });

    /* Finish the close as soon as the fade-out animation ends */
    dom.lightbox.addEventListener('animationend', function (event) {
      if (event.animationName === 'lightbox-out' && event.target === dom.lightbox) {
        finishClose();
      }
    });
  }

  /* =========================================================================
     6. START
     ========================================================================= */
  function init() {
    cacheDom();
    renderGallery();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Exposed for console-based testing only — nothing else reads it. */
  window.galleryApp = {
    items: ITEMS,
    state: state,
    buildSources: buildSources,
    wrapIndex: wrapIndex,
    open: openLightbox,
    close: closeLightbox
  };
}());
