/* Homepage UX enhancements: use-case tabs + blur-up image reveal.
   Both are progressive enhancements gated on the `js` class that index.html
   sets on <html> in the head. With JS off, all six use-case panels stay
   visible as a plain stack (the pre-tabs layout) and every image renders at
   full opacity, so non-JS AI crawlers still see the complete section. */
(function () {
  'use strict';

  /* ── Use-case tabs ── */
  (function initUseCaseTabs() {
    var section = document.querySelector('.use-cases[data-uc-tabs]');
    if (!section) return;

    var tablist = section.querySelector('.use-case-tabs');
    var tabs = Array.prototype.slice.call(section.querySelectorAll('.use-case-tab'));
    var panels = Array.prototype.slice.call(section.querySelectorAll('.use-case-panel'));
    if (!tablist || tabs.length < 2 || tabs.length !== panels.length) return;

    function activate(slug, moveFocus) {
      var match = tabs.filter(function (t) { return t.getAttribute('data-uc') === slug; })[0];
      if (!match) return false;

      tabs.forEach(function (t) {
        var on = t === match;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-uc') === slug);
      });
      if (moveFocus) match.focus();
      return true;
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        var slug = tab.getAttribute('data-uc');
        if (!activate(slug)) return;
        /* keep the panel deep-linkable without the jump a real hash change causes */
        if (window.history && history.replaceState) {
          history.replaceState(null, '', '#uc-' + slug);
        }
      });

      tab.addEventListener('keydown', function (e) {
        var last = tabs.length - 1;
        var next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = last;
        else return;
        e.preventDefault();
        activate(tabs[next].getAttribute('data-uc'), true);
      });
    });

    function fromHash() {
      var h = window.location.hash || '';
      return h.indexOf('#uc-') === 0 ? h.slice(4) : '';
    }

    if (!activate(fromHash())) activate(tabs[0].getAttribute('data-uc'));
    section.setAttribute('data-uc-ready', '');

    window.addEventListener('hashchange', function () {
      var slug = fromHash();
      if (slug) activate(slug);
    });
  })();

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
