/* =========================================================
   DESIGN VIEWER
   "View image / presentation / book" buttons (and a click on the
   artwork itself) open the piece large in a lightbox.
   Independent of GSAP, so it also works with reduced motion.
   ========================================================= */
(function () {
  const buttons = document.querySelectorAll('.design-view');
  if (!buttons.length) return;

  const box = document.createElement('div');
  box.className = 'design-lightbox';
  box.setAttribute('data-lenis-prevent', '');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Design preview');
  box.innerHTML =
    '<button type="button" class="dl-close" aria-label="Close preview">&times;</button>' +
    '<figure class="dl-figure">' +
      '<img class="dl-img" alt="">' +
      '<figcaption class="dl-caption">' +
        '<span class="dl-title"></span><span class="dl-kind"></span>' +
        '<a class="dl-open" target="_blank" rel="noopener noreferrer">Open original &nearr;</a>' +
      '</figcaption>' +
    '</figure>';
  document.body.appendChild(box);

  const img = box.querySelector('.dl-img');
  const title = box.querySelector('.dl-title');
  const kind = box.querySelector('.dl-kind');
  const open = box.querySelector('.dl-open');
  const close = box.querySelector('.dl-close');
  let lastFocus = null;

  const isOpen = () => box.classList.contains('is-open');

  function show(src, name, type, alt, from) {
    lastFocus = from || document.activeElement;
    img.src = src;
    img.alt = alt || name;
    title.textContent = name;
    kind.textContent = type;
    open.href = src;
    box.classList.add('is-open');
    close.focus({ preventScroll: true });
  }

  function hide() {
    if (!isOpen()) return;
    box.classList.remove('is-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function infoFrom(card) {
    const t = card.querySelector('.design-info h3');
    const ty = card.querySelector('.design-type');
    const im = card.querySelector('.design-art-frame img');
    return { src: im.getAttribute('src'), name: t ? t.textContent.trim() : '', type: ty ? ty.textContent.trim() : '', alt: im.alt };
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.design-card');
      const d = infoFrom(card);
      show(btn.dataset.full || d.src, d.name, d.type, d.alt, btn);
    });
  });

  document.querySelectorAll('.design-art-frame img').forEach((im) => {
    im.addEventListener('click', () => {
      const d = infoFrom(im.closest('.design-card'));
      show(d.src, d.name, d.type, d.alt, im.closest('.design-card').querySelector('.design-view'));
    });
  });

  box.addEventListener('click', (e) => {
    if (e.target === box || e.target === close || e.target.closest('.dl-close')) hide();
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); hide(); return; }
    if (e.key === 'Tab') {                       /* keep focus inside the dialog */
      const items = [close, open];
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
      return;
    }
    if ([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  });

  /* the page behind (pinned sections) must not scroll while viewing */
  const stop = (e) => e.preventDefault();
  box.addEventListener('wheel', stop, { passive: false });
  box.addEventListener('touchmove', stop, { passive: false });
})();
