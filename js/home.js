/* Homepage UX enhancements: blur-up image reveal + a deferred warm-up for the
   use-case images. Gated on the `js` class that index.html sets on <html> in
   the head, so with JS off every image renders at full opacity rather than
   staying invisible. */
(function () {
  'use strict';

  /* ── Image reveal ──
     Two flavours, because a faded-out image hides its own background:
       data-blur  cover-fitted photos. A tiny inline LQIP is painted on the
                  <picture> behind them, so they can fade in over it.
       data-skel  contain-fitted images (product shots, app screenshots). No
                  fade — they just sit on a neutral box until they decode,
                  which is then dropped so it can't letterbox a transparent PNG.
     Errors resolve too: a broken image must not stay invisible. */
  (function initImageReveal() {
    var imgs = document.querySelectorAll('img[data-blur],img[data-skel]');
    Array.prototype.forEach.call(imgs, function (img) {
      function reveal() { img.classList.add('is-loaded'); }
      if (img.complete && img.naturalWidth) { reveal(); return; }
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', reveal, { once: true });
    });
  })();

  /* ── Deferred warm-up ──
     All six use-case images are lazy, so any that never enters the viewport
     keeps showing its 20px placeholder indefinitely — a blurred photo rather
     than an honest empty box. That is what a full-page screenshot capture
     records, and what a visitor who jumps straight down the page sees while
     the lazy loader catches up.

     Once the page has finished loading and the main thread goes idle, promote
     the stragglers to eager so the browser fetches them on its own schedule.
     Nothing here competes with the initial render: it cannot start before the
     load event, and every image it touches is below the fold. */
  (function initDeferredWarmup() {
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1500); };

    function warm() {
      idle(function () {
        var lazy = document.querySelectorAll('.use-case-image img[loading="lazy"]');
        Array.prototype.forEach.call(lazy, function (img) {
          if (!img.complete) img.loading = 'eager';
        });
      });
    }

    if (document.readyState === 'complete') warm();
    else window.addEventListener('load', warm, { once: true });
  })();
})();
