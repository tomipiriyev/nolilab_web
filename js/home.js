/* Homepage UX enhancement: blur-up image reveal.
   Gated on the `js` class that index.html sets on <html> in the head, so with
   JS off every image renders at full opacity rather than staying invisible. */
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
})();
