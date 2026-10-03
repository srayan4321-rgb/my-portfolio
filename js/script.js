/* =========================================================
   HERO SCROLL-AWAY
   The hero is a fixed stage. While the first screen is scrolled
   its parts fly out (driven by the --p CSS variable, 0 → 1) and
   the About section slides up over it like a curtain.
   ========================================================= */

(function heroScrollAway() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let heroHeight = hero.offsetHeight;
  let queued = false;

  const update = () => {
    queued = false;
    const y = window.scrollY || window.pageYOffset || 0;
    const p = Math.min(1, Math.max(0, y / heroHeight));

    hero.style.setProperty('--p', reduceMotion ? 0 : p.toFixed(4));
    hero.classList.toggle('is-gone', y >= heroHeight);
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  const measure = () => {
    heroHeight = hero.offsetHeight;
    document.documentElement.style.setProperty('--hero-h', heroHeight + 'px');
    update();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', () => {
    measure();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  measure();
})();


document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* =========================================================
     PROJECT CARD STACK
     ========================================================= */

  const stack = document.querySelector('.project-stack');
  const cards = gsap.utils.toArray('.project-card');

  if (stack && cards.length >= 2) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set(cards, { yPercent: 0 });
    } else {
      cards.forEach((card, i) => {
        gsap.set(card, {
          yPercent: i === 0 ? 0 : 100,
          zIndex: i + 1
        });
      });

      const distance = () => Math.max(
        window.innerHeight * 0.9,
        (cards.length - 1) * window.innerHeight
      );

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stack,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      cards.slice(1).forEach((card) => {
        timeline.to(card, {
          yPercent: 0,
          duration: 1
        });
      });
    }
  }

  /* =========================================================
     FULL-PAGE WEBSITE MOCKUPS
     Hover a desktop/mobile viewport and its long screenshot
     smoothly scrolls from the top to the bottom.
     ========================================================= */

  const mockups = document.querySelectorAll('.desktop-mockup');

  mockups.forEach((mockup) => {
    const viewport = mockup.querySelector('.mockup-viewport, .phone-viewport');
    const image = viewport?.querySelector('img');

    if (!viewport || !image) return;

    let scrollTween;

    const getTravel = () => Math.max(0, image.getBoundingClientRect().height - viewport.clientHeight);

    const scrollToBottom = () => {
      const travel = getTravel();

      if (scrollTween) scrollTween.kill();

      if (travel <= 2) return;

      scrollTween = gsap.to(image, {
        y: -travel,
        duration: Math.min(7, Math.max(2.5, travel / 170)),
        ease: 'power1.inOut'
      });
    };

    const resetToTop = () => {
      if (scrollTween) scrollTween.kill();

      scrollTween = gsap.to(image, {
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    };

    mockup.addEventListener('mouseenter', scrollToBottom);
    mockup.addEventListener('mouseleave', resetToTop);

    image.addEventListener('load', () => {
      gsap.set(image, { y: 0 });
    });
  });

  /* =========================================================
     LIVE MOBILE IFRAME SCALE
     Render live sites at a normal ~375px mobile CSS width,
     then scale that viewport into the phone frame.
     ========================================================= */

  const livePhones = document.querySelectorAll('.phone-mockup iframe');

  const sizeLivePhones = () => {
    livePhones.forEach((iframe) => {
      const viewport = iframe.closest('.phone-viewport');
      if (!viewport) return;

      const targetWidth = 375;
      const scale = viewport.clientWidth / targetWidth;
      const cssHeight = viewport.clientHeight / scale;

      iframe.style.setProperty('--phone-iframe-scale', scale);
      iframe.style.height = `${cssHeight}px`;
    });
  };

  sizeLivePhones();
  window.addEventListener('resize', sizeLivePhones);

  ScrollTrigger.refresh();
});
