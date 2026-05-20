/**
 * main.js — johnvrhovnik.com rebuild
 *
 * 1. Mobile nav toggle
 * 2. Scroll-reveal (IntersectionObserver)
 * 3. Active nav link detection
 * 4. Hide-on-scroll nav
 * 5. Lazy image loading (native + polyfill fallback)
 * 6. Video play/pause buttons
 * 7. Copyright year
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. MOBILE NAV TOGGLE
     ---------------------------------------------------------- */
  const navToggle  = document.querySelector('.nav-toggle');
  const navDrawer  = document.querySelector('.nav-drawer');
  const body       = document.body;

  if (navToggle && navDrawer) {
    function closeDrawer(callback) {
      if (!navDrawer.classList.contains('is-open')) return;
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      body.style.overflow = '';
      navDrawer.classList.remove('is-open');
      navDrawer.classList.add('is-closing');
      navDrawer.addEventListener('animationend', function onEnd() {
        navDrawer.classList.remove('is-closing');
        navDrawer.removeEventListener('animationend', onEnd);
        if (callback) callback();
      }, { once: true });
    }

    navToggle.addEventListener('click', function () {
      if (navDrawer.classList.contains('is-open')) {
        closeDrawer();
      } else {
        navDrawer.classList.remove('is-closing');
        navToggle.classList.add('is-open');
        navToggle.setAttribute('aria-expanded', 'true');
        navDrawer.classList.add('is-open');
        body.style.overflow = 'hidden';
      }
    });

    // Close drawer on link click
    navDrawer.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDrawer();
      });
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDrawer.classList.contains('is-open')) {
        closeDrawer(function () { navToggle.focus(); });
      }
    });
  }


  /* ----------------------------------------------------------
     2. SCROLL REVEAL
     Adds .is-visible to .reveal elements when they enter
     the viewport. Matches the subtle fade-up defined in CSS.
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* ----------------------------------------------------------
     3. ACTIVE NAV LINK
     Marks the correct nav link as active based on the current
     page path. Works for both the fixed nav and mobile drawer.
     ---------------------------------------------------------- */
  (function setActiveNav() {
    const path = window.location.pathname;

    // Map page paths to their nav link data attributes
    const navMap = {
      '/pages/progressive-purpose.html':    '01',
      '/pages/fetchmate.html':              '02',
      '/pages/progressive-digital.html':    '03',
      '/pages/branding.html':               null, // no numbered nav item
      '/pages/etcetera.html':               'etc',
      '/pages/sitemapper-pro.html':         'etc',
      '/pages/pete-for-america.html':       'etc',
      '/pages/experimental-typography.html': 'etc',
    };

    // Also handle root-relative and GitHub Pages paths
    const normalised = path.replace(/^\/[^/]+\/pages\//, '/pages/');
    const activeKey  = normalised.split('/').pop(); // filename

    // Empty string (path "/") or "index.html" means home — no active item
    if (!activeKey || activeKey === 'index.html') return;

    const activePage = Object.keys(navMap).find(function (k) {
      return k.endsWith(activeKey);
    });

    if (!activePage) return;

    const marker = navMap[activePage];
    if (!marker) return;

    document.querySelectorAll('.nav-link').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      if (
        (marker === 'etc' && (href.includes('etcetera') || href.includes('sitemapper') || href.includes('pete') || href.includes('experimental'))) ||
        (marker === '01'  && href.includes('progressive-purpose')) ||
        (marker === '02'  && href.includes('fetchmate')) ||
        (marker === '03'  && href.includes('progressive-digital'))
      ) {
        link.classList.add('is-active');
      }
    });
  })();


  /* ----------------------------------------------------------
     4. HIDE-ON-SCROLL-DOWN NAV
     Hides the nav when scrolling down, reveals it on scroll up.
     ---------------------------------------------------------- */
  (function () {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function () {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= nav.offsetHeight) {
        // Always visible near the top of the page
        nav.classList.remove('is-hidden');
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down — hide
        nav.classList.add('is-hidden');
      } else {
        // Scrolling up — reveal
        nav.classList.remove('is-hidden');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  })();


  /* ----------------------------------------------------------
     5. LAZY IMAGE LOADING
     Native lazy loading is set on all <img loading="lazy">.
     This observer enhances it for older browsers.
     ---------------------------------------------------------- */
  if (!('loading' in HTMLImageElement.prototype)) {
    // Polyfill: swap data-src → src when image enters viewport
    const lazyImgs = document.querySelectorAll('img[data-src]');

    if (lazyImgs.length && 'IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imgObserver.unobserve(img);
          }
        });
      });

      lazyImgs.forEach(function (img) {
        imgObserver.observe(img);
      });
    }
  }


  /* ----------------------------------------------------------
     6. VIDEO PLAY/PAUSE BUTTONS
     Injects an accessible play/pause button into every
     .site-video wrapper. Transparent when playing, opaque
     when paused. No HTML changes required across pages.
     ---------------------------------------------------------- */
  (function () {
    if (window.location.pathname.includes('progressive-digital')) return;

    const SVG_PLAY = '<svg aria-hidden="true" focusable="false" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L10 6L0 12V0Z" fill="currentColor"/></svg>';
    const SVG_PAUSE = '<svg aria-hidden="true" focusable="false" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="3.5" height="12" fill="currentColor"/><rect x="6.5" y="0" width="3.5" height="12" fill="currentColor"/></svg>';

    document.querySelectorAll('.site-video').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      if (!video) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video-play-btn';
      btn.setAttribute('aria-label', 'Pause video');
      btn.innerHTML =
        '<span class="icon-play" aria-hidden="true">'  + SVG_PLAY  + '</span>' +
        '<span class="icon-pause" aria-hidden="true">' + SVG_PAUSE + '</span>';

      wrap.appendChild(btn);

      function updateState() {
        if (video.paused) {
          btn.classList.add('is-paused');
          btn.setAttribute('aria-label', 'Play video');
        } else {
          btn.classList.remove('is-paused');
          btn.setAttribute('aria-label', 'Pause video');
        }
      }

      btn.addEventListener('click', function () {
        video.paused ? video.play() : video.pause();
      });

      video.addEventListener('play',    updateState);
      video.addEventListener('playing', updateState);
      video.addEventListener('pause',   updateState);

      // Sync after autoplay resolves
      updateState();
      video.addEventListener('loadeddata', updateState);
    });
  })();


  /* ----------------------------------------------------------
     8. COPYRIGHT YEAR
     Replaces the hard-coded year in the footer with the
     current year so it never needs a manual update.
     ---------------------------------------------------------- */
  const copyEl = document.querySelector('.site-footer__copy');
  if (copyEl) {
    copyEl.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent = node.textContent.replace(/\d{4}/, new Date().getFullYear());
      }
    });
  }

})();
