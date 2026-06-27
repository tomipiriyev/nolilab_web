/**
 * CartStore — global cart backed by localStorage.
 * Exposed as window.CartStore for use across all pages.
 *
 * Item shape: { sku, name, price (number), quantity, image }
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'nll_cart';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) { /* storage full — ignore */ }
    global.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: items } }));
  }

  var CartStore = {
    getItems: function () { return load(); },

    getCount: function () {
      return load().reduce(function (n, item) { return n + item.quantity; }, 0);
    },

    getSubtotal: function () {
      return load().reduce(function (s, item) { return s + item.price * item.quantity; }, 0);
    },

    add: function (sku, name, price, quantity, image) {
      var items = load();
      var existing = items.find(function (i) { return i.sku === sku; });
      if (existing) {
        existing.quantity = Math.min(10, existing.quantity + (quantity || 1));
      } else {
        items.push({
          sku: sku,
          name: name,
          price: Number(price),
          quantity: Math.min(10, quantity || 1),
          image: image || '/images/optimized/loko-gps-tracker-red-transparent.png',
        });
      }
      save(items);
    },

    update: function (sku, quantity) {
      var items = load();
      var idx = items.findIndex(function (i) { return i.sku === sku; });
      if (idx === -1) return;
      var qty = Math.max(1, Math.min(10, Number(quantity)));
      items[idx].quantity = qty;
      save(items);
    },

    remove: function (sku) {
      save(load().filter(function (i) { return i.sku !== sku; }));
    },

    clear: function () { save([]); },
  };

  global.CartStore = CartStore;
})(window);
