/**
 * layout.js — loads and injects the shared header and footer partials,
 * then initialises all header-related interactions (mobile menu, language
 * selector).
 *
 * To change the nav or footer: edit /partials/header.html or
 * /partials/footer.html — no other files need to be touched.
 *
 * Note: requires a web server (file:// protocol won't work with fetch).
 */

// Set light theme immediately so there is no flash on load.
document.documentElement.setAttribute('data-theme', 'light');

(function () {
  var BASE_URL  = 'https://nolilab.com';
  var LANG_DIRS = ['ru', 'zh', 'ja', 'fr', 'es'];
  var LANG_MAP  = { en: 'EN', ru: 'RU', ja: 'JA', zh: 'ZH', fr: 'FR', es: 'ES' };
  var ALL_LANGS = ['en', 'ru', 'zh', 'ja', 'fr', 'es'];

  // ── Detect current language and canonical page path ───────────────────────
  // e.g. /ru/blog/some-post/ → currentLang = 'ru', pagePath = 'blog/some-post/'
  //      /blog/some-post/    → currentLang = 'en', pagePath = 'blog/some-post/'

  var parts = window.location.pathname.split('/').filter(Boolean);
  var currentLang   = 'en';
  var pathRemainder = parts.slice();

  if (parts.length > 0 && LANG_DIRS.indexOf(parts[0]) !== -1) {
    currentLang   = parts[0];
    pathRemainder = parts.slice(1);
  }

  // Strip trailing 'index' / 'index.html' — treat as the directory root.
  var last = pathRemainder[pathRemainder.length - 1];
  if (last === 'index' || last === 'index.html') {
    pathRemainder = pathRemainder.slice(0, -1);
  }

  var pagePath = pathRemainder.length ? pathRemainder.join('/') + '/' : '';

  // Helper: build a clean URL for a given language.
  function langUrl(lang) {
    return lang === 'en'
      ? '/' + pagePath
      : '/' + lang + '/' + pagePath;
  }

  // ── Inject canonical <link> tag ───────────────────────────────────────────
  // Skip if the page already has a custom canonical.

  if (!document.querySelector('link[rel="canonical"]')) {
    var canonical = document.createElement('link');
    canonical.rel  = 'canonical';
    canonical.href = BASE_URL + langUrl(currentLang);
    document.head.appendChild(canonical);
  }

  // ── Inject hreflang <link> tags ───────────────────────────────────────────
  // Individual blog posts have per-post static hreflang that reflects which
  // languages actually have a translation — skip injection for those pages.

  var isBlogPost = pagePath.indexOf('blog/') === 0 && pagePath !== 'blog/';

  if (!isBlogPost) {
    ALL_LANGS.forEach(function (lang) {
      var link = document.createElement('link');
      link.rel      = 'alternate';
      link.hreflang = lang;
      link.href     = BASE_URL + langUrl(lang);
      document.head.appendChild(link);
    });

    // x-default → English root
    var xdef = document.createElement('link');
    xdef.rel      = 'alternate';
    xdef.hreflang = 'x-default';
    xdef.href     = BASE_URL + '/' + pagePath;
    document.head.appendChild(xdef);
  }

  // ── Fetch and inject partials ─────────────────────────────────────────────

  Promise.all([
    fetch('/partials/header.html').then(function (r) { return r.text(); }),
    fetch('/partials/footer.html').then(function (r) { return r.text(); }),
  ]).then(function (results) {
    var headerEl = document.getElementById('site-header');
    var footerEl = document.getElementById('site-footer');

    if (headerEl) headerEl.outerHTML = results[0];
    if (footerEl) footerEl.outerHTML = results[1];

    initMobileMenu();
    initNavLinks();
    initLanguageSelector();
  });

  // ── Mobile menu ───────────────────────────────────────────────────────────

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav    = document.querySelector('.nav-links');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });

    document.addEventListener('click', function (e) {
      if (
        document.body.classList.contains('menu-open') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }

  // ── Language-aware nav links ──────────────────────────────────────────────
  // When browsing a non-English language, prefix the logo and all nav link
  // hrefs so the user stays in their language tree.

  function initNavLinks() {
    if (currentLang === 'en') return;

    var prefix = '/' + currentLang;

    var logo = document.querySelector('a.logo');
    if (logo) logo.href = prefix + '/';

    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      // Only rewrite root-relative links that don't already carry a lang prefix.
      if (href.charAt(0) === '/' && href.indexOf(prefix) !== 0) {
        link.href = prefix + href;
      }
    });
  }

  // ── Language selector ─────────────────────────────────────────────────────

  function initLanguageSelector() {
    // Show the active language in the button label.
    var labelEl = document.querySelector('.current-lang');
    if (labelEl) labelEl.textContent = LANG_MAP[currentLang] || 'EN';

    document.querySelectorAll('.language-option').forEach(function (option) {
      var targetLang = option.dataset.lang;
      var targetPath = langUrl(targetLang);

      // Set a real href so right-click / open-in-new-tab works.
      option.href = targetPath;

      // Mark the current language as active.
      if (targetLang === currentLang) {
        option.classList.add('active');
      }

      // Persist selection; let the href handle navigation naturally.
      option.addEventListener('click', function () {
        localStorage.setItem('selectedLanguage', targetLang);
      });
    });
  }
})();
