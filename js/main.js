(() => {
  'use strict';

  /* ==========================================================
     HELPERS
  ========================================================== */

  function select(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function selectAll(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  }

  function setHidden(element, isHidden) {
    element.hidden = isHidden;
  }

  function handleKeyboardActivation(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }

  /* ==========================================================
     DOM REFERENCES
  ========================================================== */

  const elements = {
    app: select('#app'),
    loadingScreen: select('#loading-screen'),
    progress: select('#scroll-progress'),
    nav: select('#site-nav'),
    navInner: select('#nav-inner'),
    brand: select('#brand'),
    brandSub: select('#brand-sub'),
    navBook: select('#nav-book'),
    menuToggle: select('#menu-toggle'),
    mobileMenu: select('#mobile-menu'),
    backToTop: select('#back-to-top'),
    heroContent: select('#hero-content'),
    heroBottom: select('#hero-bottom'),
    scrollIndicator: select('#scroll-indicator'),
    roomModal: select('#room-modal'),
    galleryModal: select('#gallery-modal'),
    bookingForm: select('#booking-form'),
    bookingThanks: select('#booking-thanks'),
    contactForm: select('#contact-form'),
    contactSuccess: select('#contact-success')
  };

  /* ==========================================================
     HERO
  ========================================================== */

  function updateHero() {
    const progress = Math.min(window.scrollY / (window.innerHeight * 0.8), 1);
    const opacity = Math.max(0, 1 - progress * 1.2);

    elements.heroContent.style.opacity = opacity;
    elements.heroContent.style.filter = `blur(${progress * 8}px)`;
    elements.heroContent.style.transform = `translateY(${-progress * 40}px)`;
    elements.scrollIndicator.style.opacity = opacity;
    elements.heroBottom.style.opacity = progress;
  }

  function setupMagneticButtons() {
    selectAll('.magnetic').forEach((button) => {
      button.addEventListener('mousemove', (event) => {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - (bounds.left + bounds.width / 2)) * 0.15;
        const y = (event.clientY - (bounds.top + bounds.height / 2)) * 0.15;

        button.style.transform = `translate(${x}px, ${y}px)`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    });
  }

  function setupHero() {
    let animationFrame = 0;

    window.addEventListener('scroll', () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateHero);
    }, { passive: true });

    updateHero();
    setupMagneticButtons();
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  function getSceneIsDark() {
    if (window.scrollY < 80) {
      return true;
    }

    let isDark = false;

    selectAll('.scene, .scene-dark, .scene-light').forEach((scene) => {
      const bounds = scene.getBoundingClientRect();

      if (bounds.top <= 60 && bounds.bottom > 60) {
        isDark = scene.classList.contains('scene-dark');
      }
    });

    return isDark;
  }

  function updateNavigation() {
    const isScrolled = window.scrollY > 80;
    const isDark = getSceneIsDark();
    const useLightText = !isScrolled && isDark;

    elements.nav.classList.toggle('glass-nav', isScrolled);
    elements.nav.classList.toggle('bg-transparent', !isScrolled);
    elements.navInner.classList.toggle('h-14', isScrolled);
    elements.navInner.classList.toggle('h-18', !isScrolled);

    [elements.brand, elements.brandSub, elements.menuToggle].forEach((item) => {
      item.classList.toggle('text-white', useLightText);
      item.classList.toggle('text-rich-black', !useLightText);
    });

    elements.brandSub.classList.toggle('text-white/60', useLightText);
    elements.brandSub.classList.toggle('text-graphite/60', !useLightText);
    elements.navBook.classList.toggle('glass', useLightText);
    elements.navBook.classList.toggle('bg-rich-black', !useLightText);
    elements.navBook.classList.toggle('text-white', true);

    selectAll('.nav-link').forEach((link) => {
      link.classList.toggle('text-white/60', useLightText);
      link.classList.toggle('text-graphite/70', !useLightText);
    });

    setHidden(elements.backToTop, window.scrollY <= 800);
  }

  function closeMobileMenu() {
    setHidden(elements.mobileMenu, true);
    elements.mobileMenu.classList.remove('is-open');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    setHidden(elements.mobileMenu, false);
    window.requestAnimationFrame(() => {
      elements.mobileMenu.classList.add('is-open');
    });
    elements.menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function setupSmoothScrollLinks() {
    selectAll('.js-scroll, .nav-link, footer a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = select(link.getAttribute('href'));

        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function setupNavigation() {
    window.addEventListener('scroll', updateNavigation, { passive: true });
    updateNavigation();

    elements.menuToggle.addEventListener('click', () => {
      if (elements.mobileMenu.hidden) {
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    });

    selectAll('a', elements.mobileMenu).forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    elements.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    setupSmoothScrollLinks();
  }

  /* ==========================================================
     GALLERY
  ========================================================== */

  function closeGalleryModal() {
    setHidden(elements.galleryModal, true);
  }

  function showGalleryItem(card) {
    const image = select('img', card);
    const title = select('.gallery-caption', card);
    const counter = select('.gallery-counter', card);

    select('#gallery-modal-image').src = image.currentSrc || image.src;
    select('#gallery-modal-image').alt = image.alt;
    select('#gallery-modal-caption').textContent = title.textContent;
    select('#gallery-modal-count').textContent = counter.textContent;
    elements.galleryModal.dataset.index = card.dataset.gallery;
    setHidden(elements.galleryModal, false);
  }

  function showAdjacentGalleryItem(direction) {
    const cards = selectAll('.gallery-card');
    const currentIndex = Number(elements.galleryModal.dataset.index);
    const nextIndex = (currentIndex + direction + cards.length) % cards.length;

    showGalleryItem(cards[nextIndex]);
  }

  function setupGallery() {
    selectAll('.gallery-card').forEach((card) => {
      const showCard = () => showGalleryItem(card);

      card.addEventListener('click', showCard);
      card.addEventListener('keydown', (event) => {
        handleKeyboardActivation(event, showCard);
      });
    });

    select('#gallery-modal-close').addEventListener('click', closeGalleryModal);
    select('#gallery-modal-backdrop').addEventListener('click', closeGalleryModal);
    select('#gallery-prev').addEventListener('click', () => showAdjacentGalleryItem(-1));
    select('#gallery-next').addEventListener('click', () => showAdjacentGalleryItem(1));
  }

  /* ==========================================================
     ROOMS
  ========================================================== */

  function closeRoomModal() {
    setHidden(elements.roomModal, true);
  }

  function showRoomModal(card) {
    const image = select('img', card);
    const amenities = select('.room-amenities', card);

    select('#room-modal-image').src = image.currentSrc || image.src;
    select('#room-modal-image').alt = image.alt;
    select('#room-modal-type').textContent = select('.room-type', card).textContent;
    select('#room-modal-title').textContent = select('.room-name', card).textContent;
    select('#room-modal-price').textContent = select('.room-price', card).firstChild.textContent;
    select('#room-modal-description').textContent = select('.room-description', card).textContent;
    select('#room-modal-amenities').replaceChildren(...[...amenities.children].map((item) => item.cloneNode(true)));
    setHidden(elements.roomModal, false);
  }

  function setupRoomTilt() {
    selectAll('.room-tilt').forEach((wrapper) => {
      const card = select('.room-card', wrapper);

      wrapper.addEventListener('mousemove', (event) => {
        const bounds = wrapper.getBoundingClientRect();
        const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -6;
        const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 6;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      wrapper.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  function setupRooms() {
    setupRoomTilt();

    selectAll('.room-card').forEach((card) => {
      const showCard = () => showRoomModal(card);

      card.addEventListener('click', showCard);
      card.addEventListener('keydown', (event) => {
        handleKeyboardActivation(event, showCard);
      });
    });

    select('#room-modal-close').addEventListener('click', closeRoomModal);
    select('#room-modal-backdrop').addEventListener('click', closeRoomModal);
    select('#room-modal-book').addEventListener('click', closeRoomModal);
  }

  /* ==========================================================
     BOOKING
  ========================================================== */

  function showBookingStep(stepNumber) {
    selectAll('.booking-step').forEach((step) => {
      setHidden(step, Number(step.dataset.step) !== stepNumber);
    });

    selectAll('[data-booking-step]').forEach((indicator) => {
      const indicatorStep = Number(indicator.dataset.bookingStep);
      const isComplete = indicatorStep < stepNumber;
      const isCurrent = indicatorStep === stepNumber;

      indicator.classList.toggle('bg-gold', isComplete || isCurrent);
      indicator.classList.toggle('text-white', isComplete || isCurrent);
      indicator.classList.toggle('th-card', !isComplete && !isCurrent);
      indicator.classList.toggle('th-body', !isComplete && !isCurrent);
      select('.booking-number', indicator).hidden = isComplete;
      select('.booking-check', indicator).hidden = !isComplete;
    });

    selectAll('[data-booking-connector]').forEach((connector) => {
      connector.classList.toggle('bg-gold', Number(connector.dataset.bookingConnector) < stepNumber);
      connector.classList.toggle('th-divider', Number(connector.dataset.bookingConnector) >= stepNumber);
    });
  }

  function updateReview() {
    const selectedRoom = select('.room-choice.is-selected');
    const roomName = selectedRoom
      ? select('.room-choice-name', selectedRoom).textContent
      : '';
    const checkIn = select('#check-in').value
      || '';
    const checkOut = select('#check-out').value
      || '';
    const guests = select('#guests').value;

    select('#review-room').textContent = roomName;
    select('#review-check-in').textContent = checkIn;
    select('#review-check-out').textContent = checkOut;
    select('#review-guests').textContent = guests;
  }

  function setupBooking() {
    selectAll('.room-choice').forEach((choice) => {
      choice.addEventListener('click', () => {
        selectAll('.room-choice').forEach((item) => item.classList.remove('is-selected', 'bg-gold/10', 'border', 'border-gold/30'));
        choice.classList.add('is-selected', 'bg-gold/10', 'border', 'border-gold/30');
      });
    });

    select('#booking-to-step-2').addEventListener('click', () => showBookingStep(2));
    select('#booking-to-step-1').addEventListener('click', () => showBookingStep(1));
    select('#booking-to-step-3').addEventListener('click', () => {
      updateReview();
      showBookingStep(3);
    });
    select('#booking-back-to-step-2').addEventListener('click', () => showBookingStep(2));
    select('#booking-confirm').addEventListener('click', () => {
      setHidden(elements.bookingForm, true);
      setHidden(elements.bookingThanks, false);
    });
    select('#new-reservation').addEventListener('click', () => {
      setHidden(elements.bookingForm, false);
      setHidden(elements.bookingThanks, true);
      showBookingStep(1);
    });

    selectAll('[data-booking-step]').forEach((indicator) => {
      indicator.addEventListener('click', () => {
        const currentStep = Number(select('.booking-step:not([hidden])').dataset.step);
        const requestedStep = Number(indicator.dataset.bookingStep);

        if (requestedStep < currentStep) {
          showBookingStep(requestedStep);
        }
      });
    });
  }

  /* ==========================================================
     CONTACT
  ========================================================== */

  function setupContact() {
    elements.contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      setHidden(elements.contactForm, true);
      setHidden(elements.contactSuccess, false);
    });

    select('#send-another').addEventListener('click', () => {
      elements.contactForm.reset();
      setHidden(elements.contactForm, false);
      setHidden(elements.contactSuccess, true);
    });
  }

  /* ==========================================================
     ANIMATIONS
  ========================================================== */

  function setupReveals() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    selectAll('.reveal, .mask-reveal, .split-text, .stagger').forEach((item) => {
      observer.observe(item);
    });
  }

  function setupCounters() {
    const stats = select('#stats');
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        return;
      }

      selectAll('.stat-value', stats).forEach((counter) => {
        const end = Number(counter.dataset.value);

        if (!Number.isFinite(end)) {
          return;
        }

        const duration = end === 2 ? 1500 : 2000;
        const start = performance.now();

        function count(now) {
          const progress = Math.min((now - start) / duration, 1);
          counter.textContent = Math.round((1 - (1 - progress) ** 3) * end);

          if (progress < 1) {
            window.requestAnimationFrame(count);
          }
        }

        window.requestAnimationFrame(count);
      });

      observer.disconnect();
    }, { threshold: 0.3 });

    observer.observe(stats);
  }

  function setupHorizontalScroll() {
    selectAll('[data-horizontal]').forEach((section) => {
      const track = select('.horizontal-track', section);
      let animationFrame = 0;
      let horizontalDistance = 0;
      let viewportHeight = 0;

      function render() {
        animationFrame = 0;

        const sectionTop = section.getBoundingClientRect().top;
        const travelledDistance = Math.max(
          0,
          Math.min(horizontalDistance, -sectionTop)
        );

const offset =
    section.id === 'gallery'
        ? travelledDistance - horizontalDistance
        : -travelledDistance;

track.style.transform = `translate3d(${offset}px, 0, 0)`;      }

      function requestRender() {
        if (!animationFrame) {
          animationFrame = window.requestAnimationFrame(render);
        }
      }

      function measure() {
        const viewportWidth = document.documentElement.clientWidth;

        viewportHeight = window.innerHeight;
        horizontalDistance = Math.max(0, track.scrollWidth - viewportWidth);
        section.style.height = `${viewportHeight + horizontalDistance}px`;
        requestRender();
      }

      const resizeObserver = new ResizeObserver(measure);

      resizeObserver.observe(track);
      window.addEventListener('scroll', requestRender, { passive: true });
      window.addEventListener('resize', measure, { passive: true });
      selectAll('img', track).forEach((image) => {
        if (!image.complete) {
          image.addEventListener('load', measure, { once: true });
        }
      });

      measure();
    });
  }

  function setupAccordions() {
    selectAll('.accordion-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const isOpen = trigger.classList.contains('is-open');

        selectAll('.accordion-trigger').forEach((item) => {
          item.classList.remove('is-open');
        });

        if (!isOpen) {
          trigger.classList.add('is-open');
        }
      });
    });
  }

  /* ==========================================================
     STORY SECTION (scroll-driven split-screen storytelling)
  ========================================================== */

  function setupStorySection() {
    const section = select('[data-story]');

    if (!section) {
      return;
    }

    const slides = selectAll('.story-slide', section);
    const images = selectAll('.story-image', section);
    const countCurrent = select('.story-count-current', section);
    const countTotal = select('.story-count-total', section);
    const progressFill = select('.story-progress-fill', section);
    const total = slides.length;

    if (!total) {
      return;
    }

    if (countTotal) {
      countTotal.textContent = String(total).padStart(2, '0');
    }

    let activeIndex = -1;
    let animationFrame = 0;

    function applyActiveIndex(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
        slide.classList.toggle('is-before', i < index);
      });

      images.forEach((image, i) => {
        image.classList.toggle('is-active', i === index);
        image.classList.toggle('is-before', i < index);
      });

      if (countCurrent) {
        countCurrent.textContent = String(index + 1).padStart(2, '0');
      }
    }

    function measure() {
      section.style.height = `${total * 100}vh`;
    }

    function updateStory() {
      animationFrame = 0;

      const bounds = section.getBoundingClientRect();
      const scrollable = Math.max(bounds.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-bounds.top / scrollable, 0), 1);
      const index = Math.min(Math.floor(progress * total), total - 1);

      if (progressFill) {
        progressFill.style.width = `${(progress * 100).toFixed(2)}%`;
      }

      if (index !== activeIndex) {
        activeIndex = index;
        applyActiveIndex(activeIndex);
      }
    }

    function requestUpdate() {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateStory);
      }
    }

    function handleResize() {
      measure();
      requestUpdate();
    }

    applyActiveIndex(0);
    measure();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    requestUpdate();
  }

  /* ==========================================================
     ROOFTOP SHOWCASE
  ========================================================== */

  function setupRooftopShowcase() {
    const showcase = select('#rooftop-showcase');

    if (!showcase) {
      return;
    }

    const panels = selectAll('.rooftop-panel', showcase);
    let animationFrame = 0;

    function updatePanels() {
      animationFrame = 0;
      const viewportHeight = window.innerHeight;

      panels.forEach((panel) => {
        const bounds = panel.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, (viewportHeight - bounds.top) / (viewportHeight * 0.7))
        );

        panel.style.setProperty('--showcase-progress', progress.toFixed(3));
      });
    }

    function requestUpdate() {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updatePanels);
      }
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    requestUpdate();
  }

  function setupEscapeKey() {
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      closeRoomModal();
      closeGalleryModal();
      closeMobileMenu();
    });
  }

  function finishLoading() {
    window.setTimeout(() => {
      setHidden(elements.app, false);
      window.requestAnimationFrame(() => {
        elements.loadingScreen.classList.add('is-leaving');
      });
      window.setTimeout(() => elements.loadingScreen.remove(), 1000);
    }, 2600);
  }

  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    select('#year').textContent = new Date().getFullYear();
    setupHero();
    setupNavigation();
    setupGallery();
    setupRooms();
    setupBooking();
    setupContact();
    setupReveals();
    setupCounters();
    setupHorizontalScroll();
    setupAccordions();
    setupStorySection();
    setupRooftopShowcase();
    setupEscapeKey();
    finishLoading();
  });
})();
