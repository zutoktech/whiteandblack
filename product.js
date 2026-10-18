/* Product landing pages: light script (no animation libraries) */
(() => {
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;

  // button / link text roll
  $$('.btn').forEach(b => {
    const t = b.textContent.trim();
    b.innerHTML = `<span class="btn__fill"></span><span class="roll-label" data-text="${t}"><span>${t}</span></span>`;
  });
  $$('.roll').forEach(r => {
    const t = r.textContent.trim();
    r.innerHTML = `<span class="roll-label" data-text="${t}"><span>${r.innerHTML.trim()}</span></span>`;
  });
  // gentle float around the 3D product
  $$('.prod > .tilt').forEach(t => {
    const f = document.createElement('div');
    f.className = 'float';
    t.replaceWith(f);
    f.appendChild(t);
  });

  // FAQ: opening one answer closes the others
  document.querySelectorAll('.faq__list').forEach(list => list.addEventListener('toggle', e => {
    if (!e.target.open) return;
    list.querySelectorAll('details[open]').forEach(d => { if (d !== e.target) d.open = false; });
  }, true));

  // header hides while scrolling down
  const header = $('#header');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!body.classList.contains('menu-open')) {
      if (y > lastY + 4 && y > 300) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    lastY = y;
  }, { passive: true });

  // menu
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // quote popup → WhatsApp
  const popup = $('#popup');
  const openPopup = () => {
    $('#popupNotes').value = `Interested in: ${body.dataset.product}`;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
  };
  const closePopup = () => { popup.classList.remove('is-open'); popup.setAttribute('aria-hidden', 'true'); };
  $$('[data-open-popup]').forEach(b => b.addEventListener('click', openPopup));
  $('#popupClose').addEventListener('click', closePopup);
  popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
  $('#popupForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const [name, email, phone, place] = $$('input:not([type=checkbox]):not(#popupNotes)', f).map(i => i.value.trim());
    const wants = $$('.chk input:checked', f).map(c => c.parentElement.textContent.trim());
    const notes = $('#popupNotes').value.trim();
    const msg = `Hi White & Black, I'd like a quote.\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${place}` +
      (wants.length ? `\nLooking for: ${wants.join(', ')}` : '') + (notes ? `\nNotes: ${notes}` : '');
    window.open(`https://wa.me/919842355203?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    f.innerHTML = '<h4>Thank you!</h4><p>WhatsApp has opened with your details. Press send and we will reply shortly, or call +91 98423 55203.</p>';
    setTimeout(closePopup, 4000);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    setMenu(false);
    closePopup();
  });

  // fade-up on scroll
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { threshold: 0.15 });
  $$('[data-reveal]').forEach(el => io.observe(el));
})();
