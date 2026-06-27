(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────────── */
  var API_BASE = (function () {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8000';
    return 'https://api.nolilab.com';  // production
  })();

  var STRIPE_PK = window.__STRIPE_PK__ || '';  // populated from /api/config below (or injected)

  // Fetch the publishable key from the backend so test/live is driven by the
  // server's env, never hardcoded in this deployed static file.
  if (!STRIPE_PK) {
    fetch(API_BASE + '/api/config')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cfg) { if (cfg && cfg.stripe_publishable_key) STRIPE_PK = cfg.stripe_publishable_key; })
      .catch(function () { /* offline / dev mode — checkout falls back to no-payment */ });
  }

  /* ── Countries list ──────────────────────────────────────────── */
  var COUNTRIES = [
    ['AF','Afghanistan'],['AL','Albania'],['DZ','Algeria'],['AR','Argentina'],
    ['AU','Australia'],['AT','Austria'],['BE','Belgium'],['BR','Brazil'],
    ['CA','Canada'],['CN','China'],['CZ','Czech Republic'],['DK','Denmark'],
    ['FI','Finland'],['FR','France'],['DE','Germany'],['GR','Greece'],
    ['HK','Hong Kong'],['HU','Hungary'],['IN','India'],['ID','Indonesia'],
    ['IE','Ireland'],['IL','Israel'],['IT','Italy'],['JP','Japan'],
    ['KR','South Korea'],['MY','Malaysia'],['MX','Mexico'],['NL','Netherlands'],
    ['NZ','New Zealand'],['NO','Norway'],['PL','Poland'],['PT','Portugal'],
    ['RO','Romania'],['RU','Russia'],['SA','Saudi Arabia'],['SG','Singapore'],
    ['SK','Slovakia'],['ZA','South Africa'],['ES','Spain'],['SE','Sweden'],
    ['CH','Switzerland'],['TW','Taiwan'],['TH','Thailand'],['TR','Turkey'],
    ['UA','Ukraine'],['AE','United Arab Emirates'],['GB','United Kingdom'],
    ['US','United States'],['VN','Vietnam']
  ];

  /* ── State ───────────────────────────────────────────────────── */
  var state = {
    currentStep: 1,
    customer: {},
    shippingAddress: {},
    billingAddress: null,   // null = same as shipping
    selectedMethod: null,   // {method_id, name, rate, description}
    shippingRates: [],
    orderNumber: null,
    clientSecret: null,
    stripe: null,
    stripeElements: null,
    paymentElement: null,
  };

  /* ── Helpers ─────────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return '$' + Number(n).toFixed(2).replace(/\.00$/, ''); }

  function showToast(msg, isError) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' error' : '');
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 4000);
  }

  function setError(fieldId, msg) {
    var el = $(fieldId);
    if (el) { el.textContent = msg; }
    var input = el && el.previousElementSibling;
    if (input && msg) input.classList.add('error');
    else if (input) input.classList.remove('error');
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('input.error, select.error').forEach(function (e) { e.classList.remove('error'); });
  }

  /* ── Country dropdowns ───────────────────────────────────────── */
  function populateCountries(selectId) {
    var sel = $(selectId);
    if (!sel) return;
    COUNTRIES.forEach(function (pair) {
      var opt = document.createElement('option');
      opt.value = pair[0];
      opt.textContent = pair[1];
      sel.appendChild(opt);
    });
  }
  populateCountries('ship-country');
  populateCountries('bill-country');

  /* ── Progress bar ────────────────────────────────────────────── */
  function updateProgress(step) {
    document.querySelectorAll('.progress-step').forEach(function (el) {
      var n = parseInt(el.dataset.step, 10);
      el.classList.toggle('active', n === step);
      el.classList.toggle('done', n < step);
    });
    document.querySelectorAll('.progress-connector').forEach(function (el, idx) {
      el.classList.toggle('done', idx + 1 < step);
    });
  }

  /* ── Step navigation ─────────────────────────────────────────── */
  function showStep(n) {
    document.querySelectorAll('.checkout-step').forEach(function (el) {
      var sn = parseInt(el.dataset.step, 10);
      if (sn === n) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
    state.currentStep = n;
    updateProgress(n);
    if (n === 4) loadShippingRates();
    if (n === 5) renderReview();
    if (n === 6) initPaymentStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Sidebar summary ─────────────────────────────────────────── */
  function renderSidebar() {
    var items = CartStore.getItems();
    var sidebarItems = $('sidebar-items');
    sidebarItems.innerHTML = '';
    items.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'summary-item';
      div.innerHTML =
        '<div class="summary-item-img"><img src="' + item.image + '" alt="' + item.name + '" width="48" height="48" loading="lazy"/></div>' +
        '<div class="summary-item-info">' +
          '<div class="summary-item-name">' + item.name + '</div>' +
          '<div class="summary-item-qty">Qty: ' + item.quantity + '</div>' +
        '</div>' +
        '<div class="summary-item-price">' + fmt(item.price * item.quantity) + '</div>';
      sidebarItems.appendChild(div);
    });

    var subtotal = CartStore.getSubtotal();
    $('sidebar-subtotal').textContent = fmt(subtotal);
    $('sidebar-shipping').textContent = state.selectedMethod ? fmt(state.selectedMethod.rate) : '—';
    var total = subtotal + (state.selectedMethod ? Number(state.selectedMethod.rate) : 0);
    $('sidebar-total').textContent = state.selectedMethod ? fmt(total) : '—';
  }
  renderSidebar();

  /* ── Validation ──────────────────────────────────────────────── */
  function validateStep1() {
    clearErrors();
    var ok = true;
    var fn = $('first-name').value.trim();
    var ln = $('last-name').value.trim();
    var em = $('email').value.trim();
    if (!fn) { setError('err-first-name', 'First name is required'); ok = false; }
    if (!ln) { setError('err-last-name', 'Last name is required'); ok = false; }
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError('err-email', 'Valid email is required'); ok = false; }
    if (ok) {
      state.customer = { first_name: fn, last_name: ln, email: em, phone: $('phone').value.trim() };
    }
    return ok;
  }

  function validateStep2() {
    clearErrors();
    var ok = true;
    var country = $('ship-country').value;
    var city    = $('ship-city').value.trim();
    var postal  = $('ship-postal').value.trim();
    var street  = $('ship-street').value.trim();
    if (!country) { setError('err-ship-country', 'Country is required'); ok = false; }
    if (!city)    { setError('err-ship-city', 'City is required'); ok = false; }
    if (!postal)  { setError('err-ship-postal', 'Postal code is required'); ok = false; }
    if (!street)  { setError('err-ship-street', 'Street address is required'); ok = false; }
    if (ok) {
      state.shippingAddress = {
        country: country, state: $('ship-state').value.trim(),
        city: city, postal_code: postal, street: street,
        apt: $('ship-apt').value.trim() || null,
      };
    }
    return ok;
  }

  function validateStep3() {
    var same = $('bill-same').checked;
    if (same) { state.billingAddress = null; return true; }
    var country = $('bill-country').value;
    var city    = $('bill-city').value.trim();
    var postal  = $('bill-postal').value.trim();
    var street  = $('bill-street').value.trim();
    if (!country || !city || !postal || !street) {
      showToast('Please fill in all required billing fields', true);
      return false;
    }
    state.billingAddress = {
      country: country, state: $('bill-state').value.trim(),
      city: city, postal_code: postal, street: street,
      apt: $('bill-apt').value.trim() || null,
    };
    return true;
  }

  function validateStep4() {
    if (!state.selectedMethod) {
      showToast('Please select a shipping method', true);
      return false;
    }
    return true;
  }

  /* ── Billing same-as-shipping toggle ─────────────────────────── */
  $('bill-same').addEventListener('change', function () {
    var billFields = $('billing-fields');
    if (this.checked) billFields.setAttribute('hidden', '');
    else billFields.removeAttribute('hidden');
  });

  /* ── Shipping rates ──────────────────────────────────────────── */
  function loadShippingRates() {
    var wrap = $('shipping-options-wrap');
    wrap.innerHTML = '<p class="shipping-loading">Loading shipping options…</p>';
    state.selectedMethod = null;
    renderSidebar();

    var country = state.shippingAddress.country;
    var subtotal = CartStore.getSubtotal();
    var items = CartStore.getItems().map(function (i) {
      return { sku: i.sku, name: i.name, price: i.price, quantity: i.quantity };
    });

    fetch(API_BASE + '/api/checkout/shipping-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: country, subtotal: subtotal, items: items }),
    })
    .then(function (r) { return r.json(); })
    .then(function (rates) {
      state.shippingRates = rates;
      if (!rates || rates.length === 0) {
        wrap.innerHTML = '<p class="shipping-loading" style="color:#cb2431">No shipping available for your country. Please contact us.</p>';
        return;
      }
      renderShippingOptions(rates);
    })
    .catch(function (err) {
      console.error('[checkout] shipping rates error:', err);
      wrap.innerHTML = '<p class="shipping-loading" style="color:#cb2431">Could not load shipping options. Please try again.</p>';
    });
  }

  function renderShippingOptions(rates) {
    var wrap = $('shipping-options-wrap');
    var html = '<div class="shipping-options">';
    rates.forEach(function (r) {
      var priceLabel = Number(r.rate) === 0 ? '<span class="shipping-option-price free">Free</span>' :
        '<span class="shipping-option-price">' + fmt(r.rate) + '</span>';
      html +=
        '<label class="shipping-option" data-id="' + r.method_id + '">' +
          '<input type="radio" name="shipping_method" value="' + r.method_id + '"/>' +
          '<div class="shipping-option-info">' +
            '<div class="shipping-option-name">' + r.name + (r.carrier ? ' — ' + r.carrier : '') + '</div>' +
            '<div class="shipping-option-desc">' + (r.description || '') + '</div>' +
          '</div>' +
          priceLabel +
        '</label>';
    });
    html += '</div>';
    wrap.innerHTML = html;

    // auto-select first
    var first = wrap.querySelector('input[type="radio"]');
    if (first) {
      first.checked = true;
      selectMethod(parseInt(first.value, 10));
    }

    wrap.querySelectorAll('.shipping-option').forEach(function (card) {
      card.addEventListener('click', function () {
        var radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        selectMethod(parseInt(card.dataset.id, 10));
        wrap.querySelectorAll('.shipping-option').forEach(function (c) { c.classList.remove('selected'); });
        card.classList.add('selected');
      });
    });

    // mark first selected
    var firstCard = wrap.querySelector('.shipping-option');
    if (firstCard) firstCard.classList.add('selected');
  }

  function selectMethod(id) {
    var rate = state.shippingRates.find(function (r) { return r.method_id === id; });
    if (rate) { state.selectedMethod = rate; renderSidebar(); }
  }

  /* ── Payment step ────────────────────────────────────────────── */
  function initPaymentStep() {
    // First create the order to get clientSecret
    createOrder().then(function (result) {
      if (!result) return;
      if (result.client_secret && STRIPE_PK) {
        mountStripe(result.client_secret);
      } else {
        $('stripe-wrap').setAttribute('hidden', '');
        $('devmode-payment').removeAttribute('hidden');
        $('btn-place-order').textContent = 'Place Order';
      }
    });
  }

  function createOrder() {
    var items = CartStore.getItems().map(function (i) {
      return { sku: i.sku, name: i.name, price: i.price, quantity: i.quantity };
    });
    var payload = {
      customer: state.customer,
      shipping_address: state.shippingAddress,
      billing_address: state.billingAddress,
      shipping_method_id: state.selectedMethod.method_id,
      items: items,
      payment_provider: STRIPE_PK ? 'stripe' : 'none',
    };

    $('btn-place-order').disabled = true;
    $('btn-place-order').textContent = 'Preparing payment…';

    return fetch(API_BASE + '/api/checkout/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw new Error(e.detail || 'Order error'); });
      return r.json();
    })
    .then(function (data) {
      state.orderNumber  = data.order_number;
      state.clientSecret = data.client_secret;
      $('btn-place-order').disabled = false;
      $('btn-place-order').textContent = 'Place Order';
      return data;
    })
    .catch(function (err) {
      showToast(err.message || 'Could not create order. Please try again.', true);
      $('btn-place-order').disabled = false;
      $('btn-place-order').textContent = 'Place Order';
      return null;
    });
  }

  function mountStripe(clientSecret) {
    if (!window.Stripe) {
      // Lazy-load Stripe.js
      var script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = function () { doMountStripe(clientSecret); };
      document.head.appendChild(script);
    } else {
      doMountStripe(clientSecret);
    }
  }

  function doMountStripe(clientSecret) {
    state.stripe = window.Stripe(STRIPE_PK);
    state.stripeElements = state.stripe.elements({ clientSecret: clientSecret });
    state.paymentElement = state.stripeElements.create('payment');
    state.paymentElement.mount('#payment-element');
    $('stripe-wrap').removeAttribute('hidden');
    $('devmode-payment').setAttribute('hidden', '');
  }

  /* ── Review step ─────────────────────────────────────────────── */
  function renderReview() {
    var items = CartStore.getItems();
    var subtotal = CartStore.getSubtotal();
    var shippingCost = state.selectedMethod ? Number(state.selectedMethod.rate) : 0;
    var total = subtotal + shippingCost;

    var itemsHtml = items.map(function (item) {
      return '<div class="review-item">' +
        '<div><div class="review-item-name">' + item.name + '</div>' +
        '<div class="review-item-qty">Qty ' + item.quantity + ' × ' + fmt(item.price) + '</div></div>' +
        '<div>' + fmt(item.price * item.quantity) + '</div>' +
        '</div>';
    }).join('');
    $('review-items').innerHTML = itemsHtml;

    $('review-totals').innerHTML =
      '<div class="review-total-row"><span>Subtotal</span><span>' + fmt(subtotal) + '</span></div>' +
      '<div class="review-total-row"><span>Shipping</span><span>' + fmt(shippingCost) + '</span></div>' +
      '<div class="review-total-row grand"><span>Total</span><span>' + fmt(total) + '</span></div>';

    var sa = state.shippingAddress;
    var ba = state.billingAddress || sa;
    var saHtml = sa.street + (sa.apt ? ', ' + sa.apt : '') + '<br>' +
      sa.city + (sa.state ? ', ' + sa.state : '') + ' ' + sa.postal_code + '<br>' + sa.country;
    var baHtml = ba.street + (ba.apt ? ', ' + ba.apt : '') + '<br>' +
      ba.city + (ba.state ? ', ' + ba.state : '') + ' ' + ba.postal_code + '<br>' + ba.country;

    $('review-details').innerHTML =
      '<div class="review-detail-block"><h4>Customer</h4><p>' +
        state.customer.first_name + ' ' + state.customer.last_name + '<br>' +
        state.customer.email + (state.customer.phone ? '<br>' + state.customer.phone : '') +
      '</p></div>' +
      '<div class="review-detail-block"><h4>Shipping Method</h4><p>' +
        (state.selectedMethod ? state.selectedMethod.name + '<br>' + (state.selectedMethod.description || '') : '—') +
      '</p></div>' +
      '<div class="review-detail-block"><h4>Ship to</h4><p>' + saHtml + '</p></div>' +
      '<div class="review-detail-block"><h4>Bill to</h4><p>' + baHtml + '</p></div>';
  }

  /* ── Place order ─────────────────────────────────────────────── */
  $('btn-place-order').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Placing order…';

    if (state.stripe && state.stripeElements && state.clientSecret) {
      state.stripe.confirmPayment({
        elements: state.stripeElements,
        // Required by Stripe at confirmation: where the customer returns after
        // a redirect-based payment method. Card payments stay on-page
        // (redirect: 'if_required'), but this URL must still be supplied.
        confirmParams: {
          return_url: window.location.origin + '/checkout/confirmation/?order=' +
            encodeURIComponent(state.orderNumber || ''),
        },
        redirect: 'if_required',
      }).then(function (result) {
        if (result.error) {
          var msgEl = $('payment-message');
          msgEl.textContent = result.error.message;
          msgEl.removeAttribute('hidden');
          btn.disabled = false;
          btn.textContent = 'Place Order';
          showStep(5);
        } else {
          confirmWithServer(result.paymentIntent.id, btn);
        }
      });
    } else {
      // Dev mode — no Stripe
      confirmWithServer(null, btn);
    }
  });

  function confirmWithServer(paymentIntentId, btn) {
    fetch(API_BASE + '/api/checkout/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_number: state.orderNumber,
        payment_intent_id: paymentIntentId || 'dev-mode',
      }),
    })
    .then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw new Error(e.detail || 'Payment error'); });
      return r.json();
    })
    .then(function () {
      CartStore.clear();
      window.location.href = '/checkout/confirmation/?order=' + encodeURIComponent(state.orderNumber);
    })
    .catch(function (err) {
      showToast(err.message || 'Could not confirm payment. Please contact support.', true);
      btn.disabled = false;
      btn.textContent = 'Place Order';
    });
  }

  /* ── Button wiring ───────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-next]');
    if (btn) {
      var target = parseInt(btn.dataset.next, 10);
      var ok = true;
      if (state.currentStep === 1) ok = validateStep1();
      else if (state.currentStep === 2) ok = validateStep2();
      else if (state.currentStep === 3) ok = validateStep3();
      else if (state.currentStep === 4) ok = validateStep4();
      if (ok) showStep(target);
    }
    var back = e.target.closest('[data-back]');
    if (back) showStep(parseInt(back.dataset.back, 10));
  });

  /* ── Guard empty cart ────────────────────────────────────────── */
  if (CartStore.getCount() === 0) {
    window.location.href = '/cart/';
  }

  showStep(1);
})();
