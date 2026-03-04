// Slider functionality without headline animation
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  const slider = document.getElementById('slider');

  if (slides.length) {
    let currentSlide = 0;
    const SLIDE_INTERVAL = 5000; // 5 seconds

    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[index].classList.add('active');
      if (dots[index]) {
        dots[index].classList.add('active');
        dots[index].setAttribute('aria-current', 'true');
      }
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

    // App feature hover interactions
    document.querySelectorAll('.app-feature').forEach(feature => {
      feature.addEventListener('mouseenter', () => {
        clearInterval(slideTimer);
        const slideIndex = parseInt(feature.getAttribute('data-slide'));
        if (!isNaN(slideIndex) && slideIndex < slides.length) {
          showSlide(slideIndex);
        }
      });
      
      feature.addEventListener('mouseleave', () => {
        slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
      });
    });

    // Initialize first slide
    showSlide(0);
  }
});
