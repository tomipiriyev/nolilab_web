(function () {
  'use strict';

  /* ── Gallery ───────────────────────────────────────────────────── */
  var galleryMain     = document.querySelector('.gallery-main');
  var thumbsContainer = document.querySelector('.gallery-thumbs');
  var thumbs          = document.querySelectorAll('.gallery-thumb');
  var prevBtn         = document.getElementById('gallery-prev');
  var nextBtn         = document.getElementById('gallery-next');
  var lightbox        = document.getElementById('lightbox');
  var lightImg        = document.getElementById('lightbox-img');
  var lightClose      = document.getElementById('lightbox-close');
  var currentIdx      = 0;

  /* Per-variant gallery image sets.
     Loko Air  = tracker-only shots.
     Loko Bundle = full kit (Air + Ground) shots first, then the Air detail shots. */
  var AIR_SHOTS = [
    { base: 'loko-air-gps-tracker-antenna-extended-front', alt: 'Loko Air GPS tracker with extended antenna — front view' },
    { base: 'loko-air-gps-tracker-antenna-extended-side',  alt: 'Loko Air GPS tracker with extended antenna — side view' },
    { base: 'loko-air-gps-tracker-red-with-antenna',       alt: 'Loko Air GPS tracker with antenna — red unit' },
    { base: 'loko-air-gps-tracker-red-front-view',         alt: 'Loko Air GPS tracker — red unit front view' }
  ];
  var KIT_SHOTS = [
    { base: 'loko-gps-tracker-kit-air-ground-receiver', alt: 'Loko GPS tracker kit — Loko Air tracker, Loko Ground receiver and antenna' },
    { base: 'loko-gps-tracker-complete-kit-air-ground', alt: 'Loko GPS tracker complete kit — Loko Air and Loko Ground with antenna' }
  ];
  var GALLERY_SETS = {
    'LOKO-AIR':    AIR_SHOTS,
    'LOKO-BUNDLE': KIT_SHOTS.concat(AIR_SHOTS)
  };
  function gallerySet(sku) { return GALLERY_SETS[sku] || GALLERY_SETS['LOKO-BUNDLE']; }
  function optPath(base, ext) { return '/images/optimized/' + base + '.' + ext; }

  function getMainImg() { return document.getElementById('gallery-main-img'); }

  function switchToIndex(idx) {
    if (!thumbs.length) return;
    currentIdx = (idx + thumbs.length) % thumbs.length;
    var thumb = thumbs[currentIdx];

    thumbs.forEach(function (t) { t.classList.remove('active'); });
    thumb.classList.add('active');

    var full = thumb.dataset.full;
    var webp = thumb.dataset.srcset || '';
    var alt  = thumb.dataset.alt   || '';

    var newPicture = document.createElement('picture');
    if (webp) {
      var src = document.createElement('source');
      src.srcset = webp;
      src.type   = webp.endsWith('.avif') ? 'image/avif' : 'image/webp';
      newPicture.appendChild(src);
    }
    var newImg = document.createElement('img');
    newImg.id  = 'gallery-main-img';
    newImg.src = full;
    newImg.alt = alt;
    newImg.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:var(--spacing-lg);display:block;transition:transform 0.4s ease';
    newPicture.appendChild(newImg);

    var old = galleryMain.querySelector('picture');
    if (old) galleryMain.replaceChild(newPicture, old);
  }

  function bindThumbs() {
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () { switchToIndex(i); });
    });
  }

  /* Rebuild the thumbnail strip for the selected variant and reset the main image. */
  function renderGallery(sku) {
    if (!thumbsContainer) return;
    var html = gallerySet(sku).map(function (it, i) {
      return '' +
        '<button class="gallery-thumb' + (i === 0 ? ' active' : '') + '" role="listitem" aria-label="View: ' + it.alt + '"' +
        ' data-full="' + optPath(it.base, 'jpg') + '"' +
        ' data-srcset="' + optPath(it.base, 'avif') + '"' +
        ' data-alt="' + it.alt + '">' +
          '<picture>' +
            '<source srcset="' + optPath(it.base, 'avif') + '" type="image/avif"/>' +
            '<img src="' + optPath(it.base, 'jpg') + '" alt="" loading="lazy" width="80" height="80"/>' +
          '</picture>' +
        '</button>';
    }).join('');
    thumbsContainer.innerHTML = html;
    thumbs = thumbsContainer.querySelectorAll('.gallery-thumb');
    bindThumbs();
    switchToIndex(0);
  }

  bindThumbs();

  if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); switchToIndex(currentIdx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); switchToIndex(currentIdx + 1); });

  function openLightbox() {
    var img = getMainImg();
    if (!img || !lightbox) return;
    lightImg.src = img.src;
    lightImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (galleryMain) {
    galleryMain.addEventListener('click', openLightbox);
    galleryMain.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        openLightbox();
      }
    });
  }
  if (lightClose)  lightClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ── Variant + Quantity helpers ───────────────────────────────── */
  var variants     = document.querySelectorAll('.variant-option');
  var priceDisplay = document.getElementById('price-display');
  var buyBtn       = document.getElementById('btn-buy-now');
  var cartBtn      = document.getElementById('btn-add-cart');
  var qtyInput     = document.getElementById('qty-input');
  var qtyMinus     = document.getElementById('qty-minus');
  var qtyPlus      = document.getElementById('qty-plus');
  function getActiveVariant() {
    var v = document.querySelector('.variant-option.active') || variants[0];
    if (!v) return { sku: 'LOKO-BUNDLE', price: 119, name: 'Loko Bundle' };
    var nameEl = v.querySelector('.variant-name');
    return {
      sku:   v.dataset.sku   || 'LOKO-BUNDLE',
      price: parseInt(v.dataset.price, 10) || 119,
      name:  nameEl ? nameEl.textContent.trim() : 'Loko Bundle'
    };
  }

  function getQty() {
    if (!qtyInput) return 1;
    var v = parseInt(qtyInput.value, 10);
    return isNaN(v) || v < 1 ? 1 : (v > 10 ? 10 : v);
  }

  function updatePurchaseLinks() { /* Buy Now wired via click handler below */ }

  /* ── Cart helpers (delegate to global CartStore) ──────────────── */
  function addLine(sku, name, price, qty) {
    CartStore.add(sku, name, price, qty, '/images/optimized/loko-gps-tracker-red-transparent.png');
    return sku; // use sku as identifier
  }

  function removeLine(sku) { CartStore.remove(sku); }

  function updateLineQty(sku, qty) {
    if (qty < 1) CartStore.remove(sku);
    else CartStore.update(sku, qty);
  }

  function getCartSubtotal() { return CartStore.getSubtotal(); }

  /* ── Cart Sheet ────────────────────────────────────────────────── */
  var cartSheet           = document.getElementById('cart-sheet');
  var cartSheetBackdrop   = document.getElementById('cart-sheet-backdrop');
  var cartSheetClose      = document.getElementById('cart-sheet-close');
  var cartSheetContinue   = document.getElementById('cart-sheet-continue');
  var cartSheetEmpty      = document.getElementById('cart-sheet-empty');
  var cartSheetItems      = document.getElementById('cart-sheet-items');
  var cartSheetSubtotal   = document.getElementById('cart-sheet-subtotal');
  var cartSheetSubRow     = document.getElementById('cart-sheet-subtotal-row');
  var cartSheetMultiNote  = document.getElementById('cart-sheet-multi-note');
  var cartSheetCheckout   = document.getElementById('cart-sheet-checkout');
  var cartSheetTitle      = document.getElementById('cart-sheet-title');

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }

  function makeLineEl(line) {
    var el = document.createElement('div');
    el.className = 'cart-sheet-item';
    el.dataset.lineId = line.sku; // sku is the stable identifier now

    var imgBox = document.createElement('div');
    imgBox.className = 'cart-sheet-item-img';
    var img = document.createElement('img');
    img.src = '/images/optimized/loko-gps-tracker-red-transparent.png';
    img.alt = 'Loko GPS Tracker';
    img.width = 80; img.height = 80;
    img.loading = 'lazy';
    imgBox.appendChild(img);
    el.appendChild(imgBox);

    var info = document.createElement('div');
    info.className = 'cart-sheet-item-info';

    var name = document.createElement('div');
    name.className = 'cart-sheet-item-name';
    name.textContent = 'Loko GPS Tracker';
    info.appendChild(name);

    var meta = document.createElement('div');
    meta.className = 'cart-sheet-item-meta';
    var variantSpan = document.createElement('span');
    variantSpan.className = 'cart-sheet-item-variant';
    variantSpan.textContent = line.name;
    meta.appendChild(variantSpan);
    info.appendChild(meta);

    var controls = document.createElement('div');
    controls.className = 'cart-sheet-item-controls';

    var qtyGroup = document.createElement('div');
    qtyGroup.className = 'cart-sheet-item-qty';
    qtyGroup.setAttribute('role', 'group');
    qtyGroup.setAttribute('aria-label', 'Quantity for ' + line.name);

    var decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'cart-sheet-qty-btn';
    decBtn.dataset.act = 'dec';
    decBtn.setAttribute('aria-label', 'Decrease quantity');
    decBtn.textContent = '−';
    qtyGroup.appendChild(decBtn);

    var qtyVal = document.createElement('span');
    qtyVal.className = 'cart-sheet-qty-val';
    qtyVal.textContent = String(line.qty);
    qtyGroup.appendChild(qtyVal);

    var incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'cart-sheet-qty-btn';
    incBtn.dataset.act = 'inc';
    incBtn.setAttribute('aria-label', 'Increase quantity');
    incBtn.textContent = '+';
    qtyGroup.appendChild(incBtn);

    controls.appendChild(qtyGroup);

    var price = document.createElement('div');
    price.className = 'cart-sheet-item-price';
    price.textContent = '$' + (line.price * line.qty);
    controls.appendChild(price);

    info.appendChild(controls);
    el.appendChild(info);

    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'cart-sheet-item-remove';
    remove.dataset.act = 'remove';
    remove.setAttribute('aria-label', 'Remove ' + line.name);
    remove.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    el.appendChild(remove);

    return el;
  }

  function renderCartSheet(flashSku) {
    if (!cartSheet) return;
    var cartItems = CartStore.getItems();
    var count     = cartItems.length;
    var itemCount = CartStore.getCount();

    if (cartSheetTitle) {
      cartSheetTitle.textContent = count === 0 ? 'Your Cart' :
        (itemCount === 1 ? 'Your Cart (1 item)' : 'Your Cart (' + itemCount + ' items)');
    }

    setHidden(cartSheetEmpty,  count > 0);
    setHidden(cartSheetItems,  count === 0);
    setHidden(cartSheetSubRow, count === 0);

    if (count > 0 && cartSheetItems) {
      cartSheetItems.innerHTML = '';
      cartItems.forEach(function (item) {
        // Adapt CartStore shape to the lineEl format product.js expects
        var line = { lineId: item.sku, sku: item.sku, name: item.name, price: item.price, qty: item.quantity };
        var lineEl = makeLineEl(line);
        if (flashSku && item.sku === flashSku) {
          lineEl.classList.add('cart-sheet-item--just-added');
        }
        cartSheetItems.appendChild(lineEl);
      });
    }

    if (cartSheetSubtotal) cartSheetSubtotal.textContent = '$' + getCartSubtotal();
    if (cartSheetMultiNote) setHidden(cartSheetMultiNote, true); // no longer needed

    if (cartSheetCheckout) {
      if (count === 0) {
        cartSheetCheckout.setAttribute('aria-disabled', 'true');
        cartSheetCheckout.removeAttribute('href');
        var span = document.getElementById('cart-sheet-checkout-text');
        if (span) span.textContent = 'Cart is empty';
      } else {
        cartSheetCheckout.removeAttribute('aria-disabled');
        cartSheetCheckout.href = '/cart/';
        var span2 = document.getElementById('cart-sheet-checkout-text');
        if (span2) span2.textContent = 'Proceed to Checkout';
      }
    }
  }

  function openCartSheet() {
    if (!cartSheet) return;
    renderCartSheet();
    cartSheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    setTimeout(function () { if (cartSheetClose) cartSheetClose.focus(); }, 80);
  }

  function closeCartSheet() {
    if (!cartSheet) return;
    cartSheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
    if (cartBtn) cartBtn.focus();
  }

  function addCurrentToCart() {
    var v = getActiveVariant();
    var q = getQty();
    addLine(v.sku, v.name, v.price, q);
    renderCartSheet(v.sku);
    openCartSheet();
  }

  /* Add to Cart — push to CartStore, open sheet */
  if (cartBtn) {
    cartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      addCurrentToCart();
    });
  }

  /* Buy Now — add to cart then go straight to checkout */
  if (buyBtn) {
    buyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var v = getActiveVariant();
      var q = getQty();
      CartStore.add(v.sku, v.name, v.price, q, '/images/optimized/loko-gps-tracker-red-transparent.png');
      window.location.href = '/checkout/';
    });
  }
  if (cartSheetClose)    cartSheetClose.addEventListener('click', closeCartSheet);
  if (cartSheetBackdrop) cartSheetBackdrop.addEventListener('click', closeCartSheet);
  if (cartSheetContinue) cartSheetContinue.addEventListener('click', closeCartSheet);

  /* Event delegation for ±, × inside the items list */
  if (cartSheetItems) {
    cartSheetItems.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var lineEl = btn.closest('.cart-sheet-item');
      if (!lineEl) return;
      var sku = lineEl.dataset.lineId; // stored as sku
      var act = btn.dataset.act;
      if (act === 'remove') {
        removeLine(sku);
      } else if (act === 'inc' || act === 'dec') {
        var items = CartStore.getItems();
        var item = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].sku === sku) { item = items[i]; break; }
        }
        if (!item) return;
        var newQty = item.quantity + (act === 'inc' ? 1 : -1);
        updateLineQty(sku, newQty);
      }
      renderCartSheet();
    });
  }

  /* ── Variant + qty changes ─────────────────────────────────────── */
  var currentSku = getActiveVariant().sku;
  variants.forEach(function (v) {
    v.addEventListener('click', function () {
      variants.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      v.classList.add('active');
      v.setAttribute('aria-pressed', 'true');
      if (priceDisplay) priceDisplay.textContent = '$' + v.dataset.price;
      if (v.dataset.sku !== currentSku) {
        currentSku = v.dataset.sku;
        renderGallery(currentSku);
      }
    });
  });

  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10);
      if (v > 1) qtyInput.value = v - 1;
    });
    qtyPlus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10);
      if (v < 10) qtyInput.value = v + 1;
    });
    qtyInput.addEventListener('change', function () {
      var v = parseInt(qtyInput.value, 10);
      if (isNaN(v) || v < 1) qtyInput.value = 1;
      if (v > 10) qtyInput.value = 10;
    });
  }

  /* ── Tabs ──────────────────────────────────────────────────────── */
  var tabBtns  = document.querySelectorAll('.tab-btn');
  var tabPanes = document.querySelectorAll('.tab-pane');

  function activateTab(btn) {
    var target = btn.dataset.tab;
    tabBtns.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    tabPanes.forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');
    var pane = document.getElementById('tab-' + target);
    if (pane) pane.classList.add('active');
  }

  tabBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () { activateTab(btn); });
    // Arrow-key navigation between tabs (WAI-ARIA tablist pattern)
    btn.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabBtns[(i + dir + tabBtns.length) % tabBtns.length];
      activateTab(next);
      next.focus();
    });
  });

  /* ── Smooth scroll for in-page anchors ────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href.length > 1 && document.querySelector(href)) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });

  /* ── Global Esc key handler (lightbox OR cart sheet) ─────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (cartSheet && cartSheet.getAttribute('aria-hidden') === 'false') {
      closeCartSheet();
    } else if (lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

})();
