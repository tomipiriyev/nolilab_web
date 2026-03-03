document.documentElement.setAttribute('data-theme', 'light');

(function () {
  var BASE_URL = 'https://www.nolilab.com';
  var LANG_LABELS = { en: 'EN', ru: 'RU', ja: 'JA', zh: 'ZH', fr: 'FR', es: 'ES' };
  var NON_EN_LANGS = ['ru', 'zh', 'ja', 'fr', 'es'];
  var ALL_LANGS = ['en', 'ru', 'zh', 'ja', 'fr', 'es'];

  // Translations used only for the i18n group (ru, zh, fr, es)
  var i18n = {
    ru: { shop: 'Магазин', specs: 'Характеристики', software: 'Программы', contact: 'Контакт', home: 'Главная', setupGuides: 'Руководства', privacy: 'Конфиденциальность' },
    zh: { shop: '商店', specs: '规格', software: '软件', contact: '联系我们', home: '首页', setupGuides: '设置指南', privacy: '隐私政策' },
    fr: { shop: 'Boutique', specs: 'Spécifications', software: 'Logiciel', contact: 'Contact', home: 'Accueil', setupGuides: 'Guides', privacy: 'Confidentialité' },
    es: { shop: 'Tienda', specs: 'Especificaciones', software: 'Software', contact: 'Contacto', home: 'Inicio', setupGuides: 'Guías', privacy: 'Privacidad' }
  };

  // Determine current language and page slug from URL
  var parts = window.location.pathname.split('/').filter(Boolean);
  var currentLang = 'en';
  var pageParts = parts.slice();
  if (parts.length > 0 && NON_EN_LANGS.indexOf(parts[0]) !== -1) {
    currentLang = parts[0];
    pageParts = parts.slice(1);
  }
  var lastPart = pageParts[pageParts.length - 1];
  if (lastPart === 'index' || lastPart === 'index.html') {
    pageParts = pageParts.slice(0, -1);
  }
  var pageSlug = pageParts.length ? pageParts.join('/') + '/' : '';

  function langUrl(lang) {
    return lang === 'en' ? '/' + pageSlug : '/' + lang + '/' + pageSlug;
  }

  // Partial file selection:
  //   English  → header.html / footer.html         (hardcoded English)
  //   Japanese → header.ja.html / footer.ja.html   (hardcoded Japanese)
  //   Others   → header.i18n.html / footer.i18n.html (data-i18n, filled by JS)
  var suffix = currentLang === 'en' ? '' : currentLang === 'ja' ? '.ja' : '.i18n';

  // Inject canonical link
  if (!document.querySelector('link[rel="canonical"]')) {
    var canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = BASE_URL + langUrl(currentLang);
    document.head.appendChild(canonical);
  }

  // Inject hreflang alternates (skip individual blog posts, skip if already present in HTML)
  if (!(pageSlug.indexOf('blog/') === 0 && pageSlug !== 'blog/') && !document.querySelector('link[rel="alternate"][hreflang]')) {
    ALL_LANGS.forEach(function (lang) {
      var alt = document.createElement('link');
      alt.rel = 'alternate';
      alt.hreflang = lang;
      alt.href = BASE_URL + langUrl(lang);
      document.head.appendChild(alt);
    });
    var xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = BASE_URL + '/' + pageSlug;
    document.head.appendChild(xDefault);
  }

  // Nav HTML is now inlined in the page source — no fetch needed.
  // Run initialisation directly (layout.js loads with defer, so DOM is ready).
  if (suffix === '.i18n') applyTranslations();
  applyLangPrefix();
  initLangSelector();
  initMobileMenu();

  function applyTranslations() {
    var t = i18n[currentLang];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });
  }

  function applyLangPrefix() {
    if (currentLang === 'en') return;
    var prefix = '/' + currentLang;

    document.querySelectorAll('a.logo, a.footer-logo').forEach(function (el) {
      el.href = prefix + '/';
    });

    document.querySelectorAll('.nav-link, .footer-link').forEach(function (el) {
      var href = el.getAttribute('href') || '';
      if (href.charAt(0) === '/' && href.indexOf(prefix) !== 0) {
        el.href = prefix + href;
      }
    });
  }

  function initLangSelector() {
    var currentLangEl = document.querySelector('.current-lang');
    if (currentLangEl) currentLangEl.textContent = LANG_LABELS[currentLang] || 'EN';

    var langBtn = document.querySelector('.language-btn');
    var langSel = document.querySelector('.language-selector');
    var langDd  = langSel ? langSel.querySelector('.language-dropdown') : null;

    if (langBtn && langSel && langDd) {
      // Move dropdown to <body> — removes it from the header CSS cascade entirely,
      // so index.css mobile overrides (left:0, right:auto, transition:all) cannot interfere.
      document.body.appendChild(langDd);

      // Apply stable base styles once
      langDd.style.cssText =
        'position:fixed;top:auto;bottom:auto;left:auto;right:auto;' +
        'opacity:0;visibility:hidden;transform:none;' +
        'transition:opacity .15s ease,visibility .15s ease;' +
        'width:auto;min-width:180px;max-width:220px;z-index:9999;' +
        'background:var(--bg-primary,#fff);' +
        'border:1px solid var(--border,#d0d7de);' +
        'border-radius:var(--radius-md,0.5rem);' +
        'box-shadow:var(--shadow-lg,0 10px 15px rgba(0,0,0,.12))';

      // Inject active-language highlight (not in index.css)
      var ddStyle = document.createElement('style');
      ddStyle.textContent =
        '.language-option.active{background:var(--bg-secondary);color:var(--text-primary)}' +
        '.language-option.active .lang-code{color:var(--accent)}';
      document.head.appendChild(ddStyle);

      var isOpen = false;
      var chevron = langSel.querySelector('.fa-chevron-down');

      function openDropdown() {
        var rect = langBtn.getBoundingClientRect();
        langDd.style.top        = (rect.bottom + 6) + 'px';
        langDd.style.right      = (document.documentElement.clientWidth - rect.right) + 'px';
        langDd.style.left       = 'auto';
        langDd.style.opacity    = '1';
        langDd.style.visibility = 'visible';
        isOpen = true;
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      }

      function closeDropdown() {
        langDd.style.opacity    = '0';
        langDd.style.visibility = 'hidden';
        isOpen = false;
        if (chevron) chevron.style.transform = '';
      }

      langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        isOpen ? closeDropdown() : openDropdown();
      });

      document.addEventListener('click', closeDropdown);
      window.addEventListener('scroll', closeDropdown, { passive: true });
      langDd.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    document.querySelectorAll('.language-option').forEach(function (el) {
      var lang = el.getAttribute('data-lang');
      el.href = langUrl(lang);
      if (lang === currentLang) el.classList.add('active');
      el.addEventListener('click', function () {
        localStorage.setItem('selectedLanguage', lang);
      });
    });
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });

    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('menu-open')) return;
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }
})();
