(function () {
  'use strict';

  /* ── Gallery ───────────────────────────────────────────────────── */
  var galleryMain = document.querySelector('.gallery-main');
  var thumbs      = document.querySelectorAll('.gallery-thumb');
  var prevBtn     = document.getElementById('gallery-prev');
  var nextBtn     = document.getElementById('gallery-next');
  var lightbox    = document.getElementById('lightbox');
  var lightImg    = document.getElementById('lightbox-img');
  var lightClose  = document.getElementById('lightbox-close');
  var currentIdx  = 0;

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

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener('click', function () { switchToIndex(i); });
  });

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

  if (galleryMain) galleryMain.addEventListener('click', openLightbox);
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
  var SEEED_URL    = 'https://www.seeedstudio.com/Loko-GPS-Tracker-p-6261.html';

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

  function buildSeeedUrl(sku, qty) {
    try {
      var u = new URL(SEEED_URL);
      u.searchParams.set('ref',           'nolilab-product');
      u.searchParams.set('sku',           sku);
      u.searchParams.set('qty',           String(qty));
      u.searchParams.set('utm_source',    'nolilab');
      u.searchParams.set('utm_medium',    'product_page');
      u.searchParams.set('utm_campaign',  sku === 'LOKO-BUNDLE' ? 'buy_bundle' : 'buy_air');
      return u.toString();
    } catch (e) {
      var sep = SEEED_URL.indexOf('?') === -1 ? '?' : '&';
      return SEEED_URL + sep +
             'ref=nolilab-product&sku=' + encodeURIComponent(sku) +
             '&qty=' + qty +
             '&utm_source=nolilab&utm_medium=product_page&utm_campaign=' +
             (sku === 'LOKO-BUNDLE' ? 'buy_bundle' : 'buy_air');
    }
  }

  function updatePurchaseLinks() {
    if (buyBtn) {
      var v = getActiveVariant();
      var q = getQty();
      buyBtn.href = buildSeeedUrl(v.sku, q);
    }
  }

  /* ── Cart state + line helpers ────────────────────────────────── */
  var cart = []; // { lineId, sku, name, price, qty }
  var nextLineId = 1;

  function addLine(sku, name, price, qty) {
    /* Merge into an existing line if the SKU matches */
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].sku === sku) { existing = cart[i]; break; }
    }
    if (existing) {
      existing.qty = Math.min(10, existing.qty + qty);
      return existing.lineId;
    }
    var line = { lineId: 'l' + (nextLineId++), sku: sku, name: name, price: price, qty: qty };
    cart.push(line);
    return line.lineId;
  }

  function removeLine(lineId) {
    cart = cart.filter(function (l) { return l.lineId !== lineId; });
  }

  function updateLineQty(lineId, qty) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].lineId === lineId) {
        cart[i].qty = Math.max(1, Math.min(10, qty));
        return;
      }
    }
  }

  function getCartSubtotal() {
    var sum = 0;
    for (var i = 0; i < cart.length; i++) sum += cart[i].price * cart[i].qty;
    return sum;
  }

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
    el.dataset.lineId = line.lineId;

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

  function renderCartSheet(flashLineId) {
    if (!cartSheet) return;
    var count = cart.length;
    var itemCount = cart.reduce(function (s, l) { return s + l.qty; }, 0);

    if (cartSheetTitle) {
      cartSheetTitle.textContent = count === 0 ? 'Your Cart' :
        (itemCount === 1 ? 'Your Cart (1 item)' : 'Your Cart (' + itemCount + ' items)');
    }

    setHidden(cartSheetEmpty,     count > 0);
    setHidden(cartSheetItems,     count === 0);
    setHidden(cartSheetSubRow,    count === 0);

    if (count > 0 && cartSheetItems) {
      cartSheetItems.innerHTML = '';
      cart.forEach(function (line) {
        var lineEl = makeLineEl(line);
        if (flashLineId && line.lineId === flashLineId) {
          lineEl.classList.add('cart-sheet-item--just-added');
        }
        cartSheetItems.appendChild(lineEl);
      });
    }

    if (cartSheetSubtotal) cartSheetSubtotal.textContent = '$' + getCartSubtotal();
    setHidden(cartSheetMultiNote, count < 2);

    if (cartSheetCheckout) {
      if (count === 0) {
        cartSheetCheckout.setAttribute('aria-disabled', 'true');
        cartSheetCheckout.removeAttribute('href');
        var span = document.getElementById('cart-sheet-checkout-text');
        if (span) span.textContent = 'Cart is empty';
      } else {
        cartSheetCheckout.removeAttribute('aria-disabled');
        var first = cart[0];
        cartSheetCheckout.href = buildSeeedUrl(first.sku, first.qty);
        var span2 = document.getElementById('cart-sheet-checkout-text');
        if (span2) {
          span2.textContent = count === 1
            ? 'Checkout at Seeed Studio'
            : 'Add ' + cart.length + ' items to Seeed Studio';
        }
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
    var id = addLine(v.sku, v.name, v.price, q);
    renderCartSheet(id);
    openCartSheet();
  }

  /* Add to Cart — intercept, push to cart, open sheet */
  if (cartBtn) {
    cartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      addCurrentToCart();
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
      var lineId = lineEl.dataset.lineId;
      var act = btn.dataset.act;
      if (act === 'remove') {
        removeLine(lineId);
      } else if (act === 'inc' || act === 'dec') {
        var line = null;
        for (var i = 0; i < cart.length; i++) {
          if (cart[i].lineId === lineId) { line = cart[i]; break; }
        }
        if (!line) return;
        var newQty = line.qty + (act === 'inc' ? 1 : -1);
        if (newQty < 1) {
          removeLine(lineId);
        } else {
          updateLineQty(lineId, newQty);
        }
      }
      renderCartSheet();
    });
  }

  /* ── Wire up variant + qty changes (page-level, not cart) ─────── */
  variants.forEach(function (v) {
    v.addEventListener('click', function () {
      variants.forEach(function (x) { x.classList.remove('active'); });
      v.classList.add('active');
      if (priceDisplay) priceDisplay.textContent = '$' + v.dataset.price;
      updatePurchaseLinks();
    });
  });

  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10);
      if (v > 1) { qtyInput.value = v - 1; updatePurchaseLinks(); }
    });
    qtyPlus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10);
      if (v < 10) { qtyInput.value = v + 1; updatePurchaseLinks(); }
    });
    qtyInput.addEventListener('change', function () {
      var v = parseInt(qtyInput.value, 10);
      if (isNaN(v) || v < 1)  qtyInput.value = 1;
      if (v > 10) qtyInput.value = 10;
      updatePurchaseLinks();
    });
  }

  updatePurchaseLinks();

  /* ── Tabs ──────────────────────────────────────────────────────── */
  var tabBtns  = document.querySelectorAll('.tab-btn');
  var tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.dataset.tab;
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabPanes.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var pane = document.getElementById('tab-' + target);
      if (pane) pane.classList.add('active');
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
