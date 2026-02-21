      // Smooth scroll for navigation links
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
              });
            }
          }
        });
      });

      // Image Slider Functionality
      document.addEventListener('DOMContentLoaded', () => {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        const headlineText = document.querySelector('.headline-text');
        let currentSlide = 0;
        const slideInterval = 3000; // 3 seconds
        
        // Headlines corresponding to each slide
        const headlines = [
          'Long Range Offline GPS Tracker',
          'Precision GPS Tracking Technology',
          'Track Anything, Anywhere'
        ];

        function typeWriter(text, element, speed = 50) {
          return new Promise((resolve) => {
            element.textContent = '';
            let i = 0;
            
            function type() {
              if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
              } else {
                resolve();
              }
            }
            
            type();
          });
        }

        async function showSlide(index) {
          // Remove active classes
          slides.forEach(slide => slide.classList.remove('active'));
          dots.forEach(dot => dot.classList.remove('active'));
          
          // Add active classes
          slides[index].classList.add('active');
          dots[index].classList.add('active');
          
          // Change headline with typing animation
          await typeWriter(headlines[index], headlineText);
          currentSlide = index;
        }

        function nextSlide() {
          let next = currentSlide + 1;
          if (next >= slides.length) next = 0;
          showSlide(next);
        }

        // Initialize slider
        let slideTimer = setInterval(nextSlide, slideInterval);

        // Add click events to dots
        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
            clearInterval(slideTimer);
            showSlide(index);
            slideTimer = setInterval(nextSlide, slideInterval);
          });
        });

        // Pause on hover
        const slider = document.getElementById('slider');
        slider.addEventListener('mouseenter', () => clearInterval(slideTimer));
        slider.addEventListener('mouseleave', () => {
          slideTimer = setInterval(nextSlide, slideInterval);
        });
        
        // Initialize first headline animation
        typeWriter(headlines[0], headlineText);
       });

      // FAQ Accordion
      document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
          const item = button.parentElement;
          const isActive = item.classList.contains('active');
          
          // Close all other items
          document.querySelectorAll('.faq-item').forEach(otherItem => {
            otherItem.classList.remove('active');
          });
          
          // Toggle current item if it wasn't active
          if (!isActive) {
            item.classList.add('active');
          }
        });
      });
