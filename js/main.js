document.addEventListener('DOMContentLoaded', () => {

  // ── Smooth scroll for anchor navigation links ────────────────────────────
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.getElementById(href.substring(1));
        if (target) {
          window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
      }
    });
  });

  // ── Image slider ─────────────────────────────────────────────────────────
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  const headlineText = document.querySelector('.headline-text');
  const slider = document.getElementById('slider');

  if (slides.length && headlineText) {
    let currentSlide = 0;
    const SLIDE_INTERVAL = 3000;

    const headlines = [
      'Long Range Offline GPS Tracker',
      'Precision GPS Tracking Technology',
      'Track Anything, Anywhere',
    ];

    function typeWriter(text, element, speed = 50) {
      return new Promise(resolve => {
        element.textContent = '';
        let i = 0;
        function type() {
          if (i < text.length) {
            element.textContent += text.charAt(i++);
            setTimeout(type, speed);
          } else {
            resolve();
          }
        }
        type();
      });
    }

    async function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[index].classList.add('active');
      dots[index]?.classList.add('active');
      await typeWriter(headlines[index], headlineText);
      currentSlide = index;
    }

    function nextSlide() {
      showSlide((currentSlide + 1) % slides.length);
    }

    let slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(slideTimer);
        showSlide(i);
        slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
      });
    });

    if (slider) {
      slider.addEventListener('mouseenter', () => clearInterval(slideTimer));
      slider.addEventListener('mouseleave', () => {
        slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
      });
    }

    typeWriter(headlines[0], headlineText);
  }

  // ── FAQ accordion ────────────────────────────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

});
