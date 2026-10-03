/* Interaction layer: smooth scroll (Lenis), fixed nav with sliding highlight,
   scroll progress bar, interactive hero background. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- section positions (pin-spacer aware) ---------- */
  const ids = ['home', 'about', 'projects', 'design-work', 'skills', 'contact'];
  const topOf = (id) => {
    if (id === 'home') return 0;
    const el = document.getElementById(id);
    if (!el) return 0;
    const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
    return box.getBoundingClientRect().top + window.scrollY;
  };
  const goTo = (id) => {
    const y = topOf(id);
    if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!ids.includes(id)) return;
    e.preventDefault();
    goTo(id);
  });

  /* ---------- dock nav: magnify on hover + active section ---------- */
  const dock = document.querySelector('.dock');
  const links = dock ? [...dock.querySelectorAll('.dock-item')] : [];
  let active = null;
  const setActive = (link) => {
    active = link;
    links.forEach((l) => l.classList.toggle('is-active', l === link));
  };
  if (links[0]) setActive(links[0]);

  if (dock && fine && !reduce) {
    const n = links.length, GAP = 8, RANGE = 130, PEAK = 1.65;
    const sc = links.map(() => 1);
    const bgs = links.map((l) => l.querySelector('.dock-bg'));
    let mx = null, raf = 0;
    const tick = () => {
      raf = 0;
      const base = links[0].offsetWidth;
      const left = dock.getBoundingClientRect().left + dock.clientLeft;
      const rest = links.map((l) => left + l.offsetLeft + base / 2);
      let moving = false;
      links.forEach((l, i) => {
        let t = 1;
        if (mx !== null) {
          const d = Math.abs(mx - rest[i]);
          if (d < RANGE) t = 1 + (PEAK - 1) * (0.5 + 0.5 * Math.cos((d / RANGE) * Math.PI));
        }
        const next = sc[i] + (t - sc[i]) * 0.22;
        sc[i] = Math.abs(next - t) < 0.003 ? t : next;
        if (sc[i] !== t) moving = true;
      });
      const total = sc.reduce((a, s) => a + base * s, 0) + GAP * (n - 1);
      const restMid = (rest[0] + rest[n - 1]) / 2;
      let x = restMid - total / 2;
      links.forEach((l, i) => {
        const w = base * sc[i];
        l.style.transform = `translateX(${(x + w / 2 - rest[i]).toFixed(2)}px)`;
        bgs[i].style.transform = `scale(${sc[i].toFixed(3)})`;
        l.style.setProperty('--lift', ((sc[i] - 1) * base).toFixed(1) + 'px');
        x += w + GAP;
      });
      if (moving || mx !== null) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    dock.addEventListener('mousemove', (e) => { mx = e.clientX; kick(); });
    dock.addEventListener('mouseleave', () => { mx = null; kick(); });
  }

  /* ---------- scroll: progress bar + active link ---------- */
  const bar = document.querySelector('.scroll-progress');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    let cur = 0;
    const probe = y + innerHeight * 0.4;
    ids.forEach((id, i) => { if (topOf(id) <= probe) cur = i; });
    if (y + innerHeight >= document.documentElement.scrollHeight - 4) cur = ids.length - 1;
    const link = links.find((l) => l.getAttribute('href') === '#' + ids[cur]);
    if (link && link !== active) setActive(link);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- projects heading reveal ---------- */
  if (!reduce && window.gsap && window.ScrollTrigger) {
    gsap.from('.projects-heading', {
      yPercent: 60, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.projects', start: 'top 70%', once: true }
    });
  }

  /* ---------- hero interactive background ---------- */
  const canvas = document.querySelector('.hero-fx');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, dots = [];
  const mouse = { x: -9999, y: -9999 };

  const build = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, Math.max(28, (W * H) / 16000)) * (fine ? 1 : 0.6));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: 1.2 + Math.random() * 1.8
    }));
  };

  const LINK = 120, PUSH = 140;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < PUSH && dist > 0) { const f = (1 - dist / PUSH) * 1.4; d.vx += (dx / dist) * f * 0.12; d.vy += (dy / dist) * f * 0.12; }
      d.vx *= 0.985; d.vy *= 0.985;
      d.x += d.vx + (Math.random() - 0.5) * 0.04; d.y += d.vy + (Math.random() - 0.5) * 0.04;
      if (d.x < -10) d.x = W + 10; else if (d.x > W + 10) d.x = -10;
      if (d.y < -10) d.y = H + 10; else if (d.y > H + 10) d.y = -10;
    }
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j], dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK) {
          ctx.strokeStyle = `rgba(46,46,46,${(1 - dist / LINK) * 0.22})`;
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(46,46,46,.5)';
    for (const d of dots) { ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill(); }
  };

  let running = false;
  const loop = () => {
    if (!running) return;
    if (!hero.classList.contains('is-gone') && !document.hidden) draw();
    requestAnimationFrame(loop);
  };
  build();
  if (reduce) { draw(); }
  else { running = true; requestAnimationFrame(loop); }
  if (fine) {
    addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener('mouseout', (e) => { if (!e.relatedTarget) { mouse.x = mouse.y = -9999; } });
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
})();
