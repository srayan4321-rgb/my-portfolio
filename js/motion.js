/* Additional motion layer. Project mockups and project stack remain in script.js unchanged. */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const mm = gsap.matchMedia();

  /* A failure in one section must never stop the others (pins) from being created. */
  const safe = (name, fn) => (...args) => {
    try { return fn(...args); }
    catch (err) { console.error('[motion] ' + name + ' failed:', err); }
  };

  /* ---------- ABOUT ---------- */
  const about = document.querySelector('.about');

  mm.add('(min-width: 901px)', safe('about', () => {
    if (!about) return;
    const svg = about.querySelector('.about-dots');
    const paths = gsap.utils.toArray('.dot-path', svg);
    const nodes = gsap.utils.toArray('.dot-node', svg);
    const NS = 'http://www.w3.org/2000/svg';

    /* The curves are dotted, so a plain dashoffset would just slide
       the dots. A solid mask path is drawn instead and the original
       dotted curve is revealed through it — geometry stays untouched. */
    const defs = document.createElementNS(NS, 'defs');
    svg.prepend(defs);
    const maskPaths = paths.map((p, i) => {
      const mask = document.createElementNS(NS, 'mask');
      mask.setAttribute('id', 'dotmask' + i);
      mask.setAttribute('maskUnits', 'userSpaceOnUse');
      Object.entries({ x: -300, y: -100, width: 1000, height: 900 }).forEach(([k, v]) => mask.setAttribute(k, v));
      const m = p.cloneNode();
      m.removeAttribute('class');
      m.setAttribute('stroke', '#fff');
      m.setAttribute('stroke-width', 14);
      m.removeAttribute('stroke-dasharray');
      const len = p.getTotalLength();
      m.style.strokeDasharray = len;
      m.style.strokeDashoffset = len;
      mask.appendChild(m);
      defs.appendChild(mask);
      p.setAttribute('mask', `url(#dotmask${i})`);
      return m;
    });

    gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });

    const photo = about.querySelector('.about-photo');
    const heading = about.querySelector('.about-heading');
    const paras = gsap.utils.toArray('.about-text p', about);

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: about, start: 'top 70%', end: 'top 10%', scrub: 0.8 }
    });

    tl.fromTo(photo, { yPercent: 14, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, 0);

   maskPaths.forEach((m, i) => {
 tl.to(m, {
  strokeDashoffset: 0,
  duration: 0.55,
  ease: 'none'
}, 0.85 + i * 0.35)

  .to(nodes[i], {
    scale: 1,
    duration: 0.2,
    ease: 'back.out(3)'
  }, 0.65 + i * 0.3);
});

tl.fromTo(heading,
    { clipPath: 'inset(0% -10% 100% -10%)', yPercent: 40 },
    { clipPath: 'inset(-25% -10% -25% -10%)', yPercent: 0, duration: 0.5 }, 1.35)
  .from(paras, {
    y: 50,
    opacity: 0,
    stagger: 0.15,
    duration: 0.4
  }, 1.95);

    /* Settled: the whole composition drifts up and out as projects arrive */
    gsap.to(svg, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: about, start: 'bottom 80%', end: 'bottom top', scrub: true }
    });
  }));

  /* Mobile: no curves, just a simple staggered entrance */
  mm.add('(max-width: 900px)', () => {
    if (!about) return;
    gsap.from(['.about-photo', '.about-heading', '.about-text p'].flatMap((s) => gsap.utils.toArray(s, about)), {
      y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: about, start: 'top 70%', once: true }
    });
  });

  // DESIGN — horizontal scroll exhibition.
  mm.add('(min-width: 901px) and (min-height: 521px)', safe('design', () => {
    const section = document.querySelector('.design-showcase');
    const stack = document.querySelector('.design-stack');
    const cards = stack ? gsap.utils.toArray('.design-card', stack) : [];
    if (!section || !stack || cards.length < 2) return;

    gsap.set(stack, { x: 0 });

    const getDistance = () => Math.max(0, stack.scrollWidth - window.innerWidth);

    const horizontal = gsap.to(stack, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.max(window.innerHeight * 1.15, getDistance())}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // Subtle depth while each design travels through the viewport.
    cards.forEach((card, i) => {
      const art = card.querySelector('.design-art-frame');
      const info = card.querySelector('.design-info');
      if (art) {
        gsap.fromTo(art,
          { scale: i === 0 ? 1 : 0.94 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontal,
              start: 'left 90%',
              end: 'left 20%',
              scrub: true
            }
          }
        );
      }
      if (info) {
        gsap.fromTo(info,
          { x: 35, opacity: i === 0 ? 1 : 0.55 },
          {
            x: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontal,
              start: 'left 88%',
              end: 'left 30%',
              scrub: true
            }
          }
        );
      }
    });

    return () => {
      horizontal.scrollTrigger?.kill();
      horizontal.kill();
    };
  }));

  mm.add('(max-width: 900px), (max-height: 520px)', () => {
    const cards=gsap.utils.toArray('.design-card');
    if(!cards.length) return;
    gsap.from(cards,{y:28,opacity:0,stagger:.08,duration:.6,ease:'power2.out',scrollTrigger:{trigger:'.design-showcase',start:'top 75%',once:true}});
  });

  // SKILLS — staggered reveal.
  const skillCards = gsap.utils.toArray('.skill-group');
  if (skillCards.length) {
    gsap.from('.skills-intro > *', {
      y: 40, opacity: 0, stagger: .12, duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: '.skills', start: 'top 75%', once: true }
    });
    gsap.from(skillCards, {
      y: 60, opacity: 0, stagger: .12, duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: '.skills-grid', start: 'top 85%', once: true }
    });
  }

  const toolItems = gsap.utils.toArray('.tool');
  if (toolItems.length) {
    gsap.from(toolItems, {
      y: 30, opacity: 0, stagger: .08, duration: .6, ease: 'power2.out',
      scrollTrigger: { trigger: '.skills-tools', start: 'top 90%', once: true }
    });
  }

  // CONTACT — gentle reveal.
  if (document.querySelector('.contact')) {
    gsap.from(['.contact-left > *', '.contact-form'], {
      y: 40, opacity: 0, stagger: .1, duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact', start: 'top 70%', once: true }
    });
  }

  window.addEventListener('load',()=>ScrollTrigger.refresh());
});