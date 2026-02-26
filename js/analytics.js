// Centralized Google Analytics 4 loader
// Edit GA_ID here to update tracking across the entire site
(function () {
  var GA_ID = 'G-R6WM8QE17R';

  // Inject the gtag.js script into <head>
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_ID);

  // Expose globally so pages can fire custom events: gtag('event', ...)
  window.gtag = gtag;
})();
