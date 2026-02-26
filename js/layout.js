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
  // ── Fetch and inject partials ─────────────────────────────────────────────

  Promise.all([
    fetch('/partials/header.html').then(function (r) { return r.text(); }),
    fetch('/partials/footer.html').then(function (r) { return r.text(); }),
  ]).then(function (results) {
    var headerHtml = results[0];
    var footerHtml = results[1];

    var headerEl = document.getElementById('site-header');
    var footerEl = document.getElementById('site-footer');

    if (headerEl) headerEl.outerHTML = headerHtml;
    if (footerEl) footerEl.outerHTML = footerHtml;

    initMobileMenu();
    initLanguageSelector();
  });

  // ── Mobile menu ───────────────────────────────────────────────────────────

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.querySelector('.nav-links');
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

  // ── Language selector ─────────────────────────────────────────────────────

  function initLanguageSelector() {
    var langMap = { en: 'EN', ru: 'RU', ja: 'JA', zh: 'ZH', fr: 'FR', es: 'ES' };
    var LANG_DIRS = ['ru', 'zh', 'ja', 'fr', 'es'];

    // Restore saved language label
    var saved = localStorage.getItem('selectedLanguage');
    var labelEl = document.querySelector('.current-lang');
    if (labelEl && saved) labelEl.textContent = langMap[saved] || 'EN';

    document.querySelectorAll('.language-option').forEach(function (option) {
      option.addEventListener('click', function (e) {
        e.preventDefault();
        var targetLang = option.dataset.lang;
        localStorage.setItem('selectedLanguage', targetLang);

        // Determine current language prefix and the rest of the path.
        var parts = window.location.pathname.split('/').filter(Boolean);
        var pathRemainder = parts;
        if (parts.length > 0 && LANG_DIRS.indexOf(parts[0]) !== -1) {
          pathRemainder = parts.slice(1);
        }

        var suffix = pathRemainder.length ? pathRemainder.join('/') + '/' : '';
        var newPath = targetLang === 'en'
          ? '/' + suffix
          : '/' + targetLang + '/' + suffix;

        window.location.href = newPath;
      });
    });
  }
})();
