      // Newsletter Form Handler
      const newsletterForm = document.getElementById('newsletterForm');
      if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const emailInput = newsletterForm.querySelector('.newsletter-input');
          const email = emailInput.value;

          alert(`Thank you for subscribing! We'll send updates to ${email}`);
          emailInput.value = '';
        });
      }

      // Image Slider Functionality
      document.addEventListener('DOMContentLoaded', () => {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        const headlineText = document.querySelector('.headline-text');
        let currentSlide = 0;
        let isTyping = false;
        const slideInterval = 5000;

        const headlines = [
          'Loko - Long Range Offline GPS Tracker',
          'Track Anything, Anywhere',
          'IOT Data Managment Platform',
        ];

        function typeWriter(text, element, speed = 50) {
          if (isTyping) return Promise.resolve();

          return new Promise((resolve) => {
            isTyping = true;
            element.textContent = '';
            let i = 0;

            function type() {
              if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
              } else {
                isTyping = false;
                resolve();
              }
            }

            type();
          });
        }

        async function showSlide(index) {
          slides.forEach(slide => slide.classList.remove('active'));
          dots.forEach(dot => { dot.classList.remove('active'); dot.removeAttribute('aria-current'); });

          slides[index].classList.add('active');
          dots[index].classList.add('active');
          dots[index].setAttribute('aria-current', 'true');

          await typeWriter(headlines[index], headlineText);
          currentSlide = index;
        }

        function nextSlide() {
          let next = currentSlide + 1;
          if (next >= slides.length) next = 0;
          showSlide(next);
        }

        typeWriter(headlines[0], headlineText);

        setTimeout(() => {
          let slideTimer = setInterval(nextSlide, slideInterval);

          dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
              clearInterval(slideTimer);
              showSlide(index);
              slideTimer = setInterval(nextSlide, slideInterval);
            });
          });

          const slider = document.getElementById('slider');
          if (slider) {
            slider.addEventListener('mouseenter', () => clearInterval(slideTimer));
            slider.addEventListener('mouseleave', () => {
              slideTimer = setInterval(nextSlide, slideInterval);
            });
          }

          const appFeatures = document.querySelectorAll('.app-feature');
          appFeatures.forEach(feature => {
            feature.addEventListener('mouseenter', () => {
              clearInterval(slideTimer);
              const slideIndex = parseInt(feature.getAttribute('data-slide'));
              showSlide(slideIndex);
            });

            feature.addEventListener('mouseleave', () => {
              slideTimer = setInterval(nextSlide, slideInterval);
            });
          });
        }, headlines[0].length * 50 + 500);
      });

      // FAQ Accordion
      document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
          const item = button.parentElement;
          const isActive = item.classList.contains('active');

          document.querySelectorAll('.faq-item').forEach(otherItem => {
            otherItem.classList.remove('active');
          });

          if (!isActive) {
            item.classList.add('active');
          }
        });
      });

      // Interactive Visualization Functionality
      document.addEventListener("DOMContentLoaded", function() {
        const scenarioBtns = document.querySelectorAll(".scenario-btn");
        const infoContents = document.querySelectorAll(".info-content");

        scenarioBtns.forEach(btn => {
          btn.addEventListener("click", () => {
            const scenario = btn.getAttribute("data-scenario");

            scenarioBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            infoContents.forEach(content => {
              content.classList.remove("active");
              if(content.getAttribute("data-scenario") === scenario) {
                content.classList.add("active");
              }
            });

            moveTrackingPoints(scenario);
          });
        });

        function moveTrackingPoints(scenario) {
          const points = document.querySelectorAll(".point");
          points.forEach(point => {
            point.style.animation = "none";
            setTimeout(() => {
              point.style.animation = "pulse 2s infinite";
            }, 10);
          });

          const positions = {
            pet: { top: "25%", left: "15%" },
            drone: { top: "40%", left: "30%" },
            farm: { top: "60%", left: "20%" },
            military: { top: "35%", left: "60%" },
            outdoor: { top: "55%", left: "70%" },
            balloon: { top: "15%", left: "50%" }
          };

          const targetPoint = document.querySelector(`.point.${scenario}-tracking`);
          if(targetPoint) {
            targetPoint.style.transition = "all 1s ease";
            targetPoint.style.top = positions[scenario].top;
            targetPoint.style.left = positions[scenario].left;
          }
        }

        moveTrackingPoints("pet");
      });

      // App Slider Functionality
      document.addEventListener('DOMContentLoaded', () => {
        const appSlider = document.getElementById('appSlider');
        if (!appSlider) return;

        const slides = appSlider.querySelectorAll('.app-slide');
        const dots = appSlider.querySelectorAll('.app-slider-dot');
        const prevBtn = appSlider.querySelector('.app-slider-prev');
        const nextBtn = appSlider.querySelector('.app-slider-next');

        let currentSlide = 0;
        const slideCount = slides.length;

        function updateSlider() {
          slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentSlide) {
              slide.classList.add('active');
            }
          });

          dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSlide) {
              dot.classList.add('active');
            }
          });
        }

        function nextSlide() {
          currentSlide = (currentSlide + 1) % slideCount;
          updateSlider();
        }

        function prevSlide() {
          currentSlide = (currentSlide - 1 + slideCount) % slideCount;
          updateSlider();
        }

        function goToSlide(index) {
          currentSlide = index;
          updateSlider();
        }

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => goToSlide(index));
        });

        setInterval(nextSlide, 5000);
      });
