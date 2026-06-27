(function (global) {
  'use strict';

  var API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000' : 'https://api.nolilab.com';

  var TOKEN_KEY = 'nll_admin_token';

  /* ── Auth helpers ───────────────────────────────────────────── */
  function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
  function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }

  function requireAuth() {
    if (!getToken()) {
      window.location.href = '/admin/';
      return false;
    }
    return true;
  }

  function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
  }

  function apiFetch(path, opts) {
    return fetch(API_BASE + path, Object.assign({ headers: authHeaders() }, opts || {}))
      .then(function (r) {
        if (r.status === 401) { clearToken(); window.location.href = '/admin/'; return null; }
        if (!r.ok) return r.json().then(function (e) { throw new Error(e.detail || 'API error'); });
        if (r.status === 204) return null;
        return r.json();
      });
  }

  /* ── Toast ─────────────────────────────────────────────────── */
  function toast(msg, isError) {
    var el = document.getElementById('admin-toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'admin-toast' + (isError ? ' error' : '');
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 3500);
  }

  /* ── Badge rendering ────────────────────────────────────────── */
  function statusBadge(status) {
    return '<span class="badge badge-' + status + '">' + status + '</span>';
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function fmtAddr(a) {
    if (!a) return '—';
    return (a.street || '') + (a.apt ? ', ' + a.apt : '') + '<br>' +
      (a.city || '') + (a.state ? ', ' + a.state : '') + ' ' + (a.postal_code || '') + '<br>' + (a.country || '');
  }

  /* ── Logout wiring (shared) ─────────────────────────────────── */
  function wireLogout() {
    var btn = document.getElementById('btn-logout');
    if (btn) {
      btn.addEventListener('click', function () {
        clearToken();
        window.location.href = '/admin/';
      });
    }
  }

  /* ════════════════════════════════════════════════════════════
     LOGIN PAGE
  ════════════════════════════════════════════════════════════ */
  function initLogin() {
    // If already logged in, redirect
    if (getToken()) { window.location.href = '/admin/orders/'; return; }

    var form    = document.getElementById('login-form');
    var errEl   = document.getElementById('login-error');
    var submitBtn = document.getElementById('login-btn');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.className = 'admin-error';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in…';

      var username = document.getElementById('username').value.trim();
      var password = document.getElementById('password').value;

      fetch(API_BASE + '/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password }),
      })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (e) { throw new Error(e.detail || 'Login failed'); });
        return r.json();
      })
      .then(function (data) {
        setToken(data.access_token);
        window.location.href = '/admin/orders/';
      })
      .catch(function (err) {
        errEl.textContent = err.message;
        errEl.className = 'admin-error show';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     ORDERS LIST PAGE
  ════════════════════════════════════════════════════════════ */
  function initOrders() {
    if (!requireAuth()) return;
    wireLogout();

    var currentPage   = 1;
    var searchTimeout = null;

    function loadStats() {
      apiFetch('/api/admin/orders/stats').then(function (s) {
        if (!s) return;
        document.getElementById('stat-total').textContent     = s.total_orders;
        document.getElementById('stat-pending').textContent   = s.pending_orders;
        document.getElementById('stat-processing').textContent = s.processing_orders;
        document.getElementById('stat-revenue').textContent   = '$' + Number(s.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        document.getElementById('stat-today').textContent     = s.orders_today;
      });
    }

    function loadOrders(page) {
      var search  = document.getElementById('search-input').value.trim();
      var status  = document.getElementById('filter-status').value;
      var payment = document.getElementById('filter-payment').value;

      var qs = '?page=' + page + '&per_page=25';
      if (search)  qs += '&search=' + encodeURIComponent(search);
      if (status)  qs += '&status=' + encodeURIComponent(status);
      if (payment) qs += '&payment_status=' + encodeURIComponent(payment);

      var tbody = document.getElementById('orders-tbody');
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#57606a">Loading…</td></tr>';

      apiFetch('/api/admin/orders' + qs).then(function (data) {
        if (!data) return;
        currentPage = data.page;

        if (data.items.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#57606a">No orders found</td></tr>';
        } else {
          tbody.innerHTML = data.items.map(function (o) {
            return '<tr>' +
              '<td><a href="/admin/orders/detail/?id=' + o.id + '">' + o.order_number + '</a></td>' +
              '<td>' + fmtDate(o.created_at) + '</td>' +
              '<td>' + o.customer_name + '</td>' +
              '<td>' + o.customer_email + '</td>' +
              '<td>' + (o.country || '—') + '</td>' +
              '<td style="font-weight:600">$' + Number(o.total).toFixed(2) + '</td>' +
              '<td>' + statusBadge(o.payment_status) + '</td>' +
              '<td>' + statusBadge(o.status) + '</td>' +
              '</tr>';
          }).join('');
        }

        var info = document.getElementById('pagination-info');
        info.textContent = 'Showing ' + Math.min((data.page - 1) * data.per_page + 1, data.total) +
          '–' + Math.min(data.page * data.per_page, data.total) + ' of ' + data.total;

        var btns = document.getElementById('pagination-btns');
        btns.innerHTML = '';
        var prev = document.createElement('button');
        prev.className = 'btn-page';
        prev.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
        prev.setAttribute('aria-label', 'Previous page');
        prev.disabled = data.page <= 1;
        prev.addEventListener('click', function () { if (data.page > 1) loadOrders(data.page - 1); });
        btns.appendChild(prev);

        for (var p = Math.max(1, data.page - 2); p <= Math.min(data.pages, data.page + 2); p++) {
          (function (pp) {
            var btn = document.createElement('button');
            btn.className = 'btn-page' + (pp === data.page ? ' active' : '');
            btn.textContent = pp;
            btn.addEventListener('click', function () { loadOrders(pp); });
            btns.appendChild(btn);
          })(p);
        }

        var next = document.createElement('button');
        next.className = 'btn-page';
        next.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';
        next.setAttribute('aria-label', 'Next page');
        next.disabled = data.page >= data.pages;
        next.addEventListener('click', function () { if (data.page < data.pages) loadOrders(data.page + 1); });
        btns.appendChild(next);
      });
    }

    document.getElementById('search-input').addEventListener('input', function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () { loadOrders(1); }, 400);
    });
    document.getElementById('filter-status').addEventListener('change', function () { loadOrders(1); });
    document.getElementById('filter-payment').addEventListener('change', function () { loadOrders(1); });

    loadStats();
    loadOrders(1);
  }

  /* ════════════════════════════════════════════════════════════
     ORDER DETAIL PAGE
  ════════════════════════════════════════════════════════════ */
  function initOrderDetail() {
    if (!requireAuth()) return;
    wireLogout();

    var params  = new URLSearchParams(window.location.search);
    var orderId = params.get('id');
    if (!orderId) { window.location.href = '/admin/orders/'; return; }

    var currentOrder = null;

    function loadOrder() {
      apiFetch('/api/admin/orders/' + orderId).then(function (order) {
        if (!order) return;
        currentOrder = order;
        renderOrder(order);
      }).catch(function (err) {
        document.getElementById('loading').textContent = 'Error: ' + err.message;
      });
    }

    function renderOrder(o) {
      document.getElementById('page-title').textContent = o.order_number;
      document.title = o.order_number + ' — Nolilab Admin';
      document.getElementById('status-badge-wrap').innerHTML =
        statusBadge(o.payment_status) + ' ' + statusBadge(o.status);

      // Items
      var itemsHtml = o.items.map(function (item) {
        return '<div class="detail-row">' +
          '<span class="label">' + item.name + ' × ' + item.quantity + '<br><small>SKU: ' + item.sku + '</small></span>' +
          '<span class="value">$' + Number(item.subtotal).toFixed(2) + '</span></div>';
      }).join('');
      document.getElementById('detail-items').innerHTML = itemsHtml;

      // Totals
      document.getElementById('detail-totals').innerHTML =
        '<div class="detail-row"><span class="label">Subtotal</span><span class="value">$' + Number(o.subtotal).toFixed(2) + '</span></div>' +
        '<div class="detail-row"><span class="label">Shipping</span><span class="value">$' + Number(o.shipping_cost).toFixed(2) + '</span></div>' +
        '<div class="detail-row" style="font-weight:700"><span class="label" style="color:#1f2328">Total</span><span class="value">$' + Number(o.total).toFixed(2) + '</span></div>';

      // Customer
      var c = o.customer;
      document.getElementById('detail-customer').innerHTML =
        '<div class="detail-row"><span class="label">Name</span><span class="value">' + c.first_name + ' ' + c.last_name + '</span></div>' +
        '<div class="detail-row"><span class="label">Email</span><span class="value">' + c.email + '</span></div>' +
        (c.phone ? '<div class="detail-row"><span class="label">Phone</span><span class="value">' + c.phone + '</span></div>' : '');

      // Addresses
      document.getElementById('detail-ship-addr').innerHTML = '<p style="font-size:0.8rem;margin:0;color:#24292e">' + fmtAddr(o.shipping_address) + '</p>';
      document.getElementById('detail-bill-addr').innerHTML = '<p style="font-size:0.8rem;margin:0;color:#24292e">' + fmtAddr(o.billing_address) + '</p>';

      // Shipping method
      var sm = o.shipping_method;
      document.getElementById('detail-shipping').innerHTML = sm ?
        '<div class="detail-row"><span class="label">Method</span><span class="value">' + sm.name + '</span></div>' +
        (sm.carrier ? '<div class="detail-row"><span class="label">Carrier</span><span class="value">' + sm.carrier + '</span></div>' : '') +
        '<div class="detail-row"><span class="label">Rate</span><span class="value">$' + Number(sm.rate).toFixed(2) + '</span></div>'
        : '<p style="font-size:0.8rem;color:#57606a;margin:0">—</p>';

      // Tracking
      var trackEl = document.getElementById('current-tracking');
      trackEl.textContent = o.tracking_number ? 'Current: ' + o.tracking_number : 'No tracking number set';
      if (o.tracking_number) document.getElementById('tracking-input').value = o.tracking_number;

      // Notes
      document.getElementById('detail-notes').textContent = o.internal_notes || 'No notes yet.';

      document.getElementById('loading').setAttribute('hidden', '');
      document.getElementById('detail-wrap').removeAttribute('hidden');
    }

    // Status buttons
    document.querySelector('.action-btn-group').addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-action');
      if (!btn) return;
      var action = btn.dataset.action;
      btn.disabled = true;

      var endpoint, body;
      if (action === 'paid') {
        endpoint = '/api/admin/orders/' + orderId + '/status';
        body = { status: 'paid' };
        // Actually payment status update — use a different approach
        // For simplicity, map 'paid' to payment_status via status route
        // The backend maps "paid" specially in the status set
        body = { status: 'processing' };
        // Send payment status separately:
        apiFetch('/api/admin/orders/' + orderId + '/status', {
          method: 'PUT', body: JSON.stringify({ status: 'processing' })
        }).then(function () {
          toast('Status updated to Processing');
          loadOrder();
        }).catch(function (err) {
          toast(err.message, true);
          btn.disabled = false;
        });
        return;
      } else {
        endpoint = '/api/admin/orders/' + orderId + '/status';
        body = { status: action };
      }

      apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) })
        .then(function () {
          toast('Status updated to ' + action);
          loadOrder();
        })
        .catch(function (err) {
          toast(err.message, true);
          btn.disabled = false;
        });
    });

    // Tracking
    document.getElementById('btn-save-tracking').addEventListener('click', function () {
      var val = document.getElementById('tracking-input').value.trim();
      if (!val) return;
      apiFetch('/api/admin/orders/' + orderId + '/tracking', {
        method: 'PUT', body: JSON.stringify({ tracking_number: val })
      }).then(function () {
        toast('Tracking number saved');
        loadOrder();
      }).catch(function (err) { toast(err.message, true); });
    });

    // Notes
    document.getElementById('btn-add-note').addEventListener('click', function () {
      var val = document.getElementById('note-input').value.trim();
      if (!val) return;
      apiFetch('/api/admin/orders/' + orderId + '/notes', {
        method: 'POST', body: JSON.stringify({ note: val })
      }).then(function () {
        toast('Note added');
        document.getElementById('note-input').value = '';
        loadOrder();
      }).catch(function (err) { toast(err.message, true); });
    });

    loadOrder();
  }

  /* ════════════════════════════════════════════════════════════
     SHIPPING SETTINGS PAGE
  ════════════════════════════════════════════════════════════ */
  function initShipping() {
    if (!requireAuth()) return;
    wireLogout();

    var editingMethodId = null;

    function loadZones() {
      apiFetch('/api/admin/shipping/zones').then(function (zones) {
        if (!zones) return;
        renderZones(zones);
      });
    }

    function renderZones(zones) {
      var wrap = document.getElementById('zones-wrap');
      if (zones.length === 0) {
        wrap.innerHTML = '<p style="color:#57606a;text-align:center;padding:32px">No shipping zones. Add one to get started.</p>';
        return;
      }
      wrap.innerHTML = zones.map(function (zone) {
        var countriesList = zone.countries.length > 0 ? zone.countries.join(', ') : 'Fallback (all other countries)';
        var methodsHtml = zone.methods.length > 0 ? zone.methods.map(function (m) {
          var freeLabel = m.free_above ? ' · free above $' + m.free_above : '';
          return '<div class="zone-method-row">' +
            '<div><div class="method-name">' + m.name + (m.carrier ? ' <span style="color:#57606a;font-weight:400">— ' + m.carrier + '</span>' : '') + '</div>' +
            '<div class="method-meta">' + (m.estimated_days_min ? m.estimated_days_min + '–' + m.estimated_days_max + ' days' : '') + freeLabel + '</div></div>' +
            '<div style="color:' + (Number(m.rate) === 0 ? '#1a7f37' : '#1f2328') + ';font-weight:600">' + (Number(m.rate) === 0 ? 'Free' : '$' + Number(m.rate).toFixed(2)) + '</div>' +
            '<div><span class="badge ' + (m.is_active ? 'badge-shipped' : 'badge-cancelled') + '">' + (m.is_active ? 'Active' : 'Off') + '</span></div>' +
            '<div><button class="btn-action" style="padding:4px 10px;font-size:0.75rem" data-edit-method="' + m.id + '" data-zone="' + zone.id + '">Edit</button></div>' +
            '<div><button class="btn-action red" style="padding:4px 10px;font-size:0.75rem" data-del-method="' + m.id + '">Del</button></div>' +
            '</div>';
        }).join('') : '<p style="font-size:0.8rem;color:#57606a;padding:12px 16px;margin:0">No methods. Add one below.</p>';

        return '<div class="zone-card">' +
          '<div class="zone-header">' +
            '<div><div>' + zone.name + '</div><div class="zone-countries">' + countriesList + '</div></div>' +
            '<div style="display:flex;gap:8px">' +
              '<button class="btn-admin-add" data-add-method="' + zone.id + '" style="font-size:0.75rem;padding:0 12px">+ Method</button>' +
              '<button class="btn-action red" data-del-zone="' + zone.id + '" style="padding:4px 10px;font-size:0.75rem">Delete Zone</button>' +
            '</div>' +
          '</div>' +
          '<div class="zone-methods">' + methodsHtml + '</div>' +
          '</div>';
      }).join('');

      bindZoneEvents();
    }

    function bindZoneEvents() {
      document.querySelectorAll('[data-add-method]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          showMethodForm(parseInt(btn.dataset.addMethod, 10), null);
        });
      });
      document.querySelectorAll('[data-del-zone]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm('Delete this zone and all its methods?')) return;
          apiFetch('/api/admin/shipping/zones/' + btn.dataset.delZone, { method: 'DELETE' })
            .then(function () { toast('Zone deleted'); loadZones(); })
            .catch(function (e) { toast(e.message, true); });
        });
      });
      document.querySelectorAll('[data-edit-method]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          showMethodForm(parseInt(btn.dataset.zone, 10), parseInt(btn.dataset.editMethod, 10));
        });
      });
      document.querySelectorAll('[data-del-method]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm('Delete this shipping method?')) return;
          apiFetch('/api/admin/shipping/methods/' + btn.dataset.delMethod, { method: 'DELETE' })
            .then(function () { toast('Method deleted'); loadZones(); })
            .catch(function (e) { toast(e.message, true); });
        });
      });
    }

    function showMethodForm(zoneId, methodId) {
      editingMethodId = methodId;
      document.getElementById('mf-zone-id').value  = zoneId;
      document.getElementById('mf-method-id').value = methodId || '';
      document.getElementById('mf-name').value      = '';
      document.getElementById('mf-carrier').value   = '';
      document.getElementById('mf-rate').value      = '';
      document.getElementById('mf-free-above').value = '';
      document.getElementById('mf-days-min').value  = '';
      document.getElementById('mf-days-max').value  = '';
      document.getElementById('method-form-title').textContent = methodId ? 'Edit Shipping Method' : 'Add Shipping Method';

      if (methodId) {
        apiFetch('/api/admin/shipping/methods').then(function (methods) {
          var m = methods && methods.find(function (x) { return x.id === methodId; });
          if (!m) return;
          document.getElementById('mf-name').value      = m.name || '';
          document.getElementById('mf-carrier').value   = m.carrier || '';
          document.getElementById('mf-rate').value      = m.rate || '';
          document.getElementById('mf-free-above').value = m.free_above || '';
          document.getElementById('mf-days-min').value  = m.estimated_days_min || '';
          document.getElementById('mf-days-max').value  = m.estimated_days_max || '';
        });
      }

      document.getElementById('method-form-wrap').style.display = 'block';
      document.getElementById('mf-name').focus();
    }

    document.getElementById('btn-save-method').addEventListener('click', function () {
      var name = document.getElementById('mf-name').value.trim();
      var rate = document.getElementById('mf-rate').value;
      if (!name || rate === '') { toast('Name and rate are required', true); return; }

      var payload = {
        zone_id: parseInt(document.getElementById('mf-zone-id').value, 10),
        name: name,
        carrier: document.getElementById('mf-carrier').value.trim() || null,
        rate: parseFloat(rate),
        free_above: document.getElementById('mf-free-above').value ? parseFloat(document.getElementById('mf-free-above').value) : null,
        estimated_days_min: document.getElementById('mf-days-min').value ? parseInt(document.getElementById('mf-days-min').value, 10) : null,
        estimated_days_max: document.getElementById('mf-days-max').value ? parseInt(document.getElementById('mf-days-max').value, 10) : null,
        is_active: true,
      };

      var mid = document.getElementById('mf-method-id').value;
      var url = mid ? '/api/admin/shipping/methods/' + mid : '/api/admin/shipping/methods';
      var method = mid ? 'PUT' : 'POST';

      apiFetch(url, { method: method, body: JSON.stringify(payload) })
        .then(function () {
          toast(mid ? 'Method updated' : 'Method added');
          document.getElementById('method-form-wrap').style.display = 'none';
          loadZones();
        })
        .catch(function (e) { toast(e.message, true); });
    });

    document.getElementById('btn-add-zone').addEventListener('click', function () {
      var name = prompt('Zone name (e.g. "Canada"):');
      if (!name) return;
      var countriesStr = prompt('Country codes, comma-separated (e.g. CA,MX).\nLeave blank for "Rest of World" fallback:') || '';
      var countries = countriesStr.split(',').map(function (c) { return c.trim().toUpperCase(); }).filter(Boolean);

      apiFetch('/api/admin/shipping/zones', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), countries: countries }),
      }).then(function () {
        toast('Zone created');
        loadZones();
      }).catch(function (e) { toast(e.message, true); });
    });

    loadZones();
  }

  /* ── Public API ─────────────────────────────────────────────── */
  global.AdminApp = {
    initLogin:       initLogin,
    initOrders:      initOrders,
    initOrderDetail: initOrderDetail,
    initShipping:    initShipping,
  };

})(window);
