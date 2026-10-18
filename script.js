/* =========================================================
   White & Black — product showcase script
   GSAP + ScrollTrigger + Lenis. Without them (or with reduced
   motion) every section still renders in its finished state.
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const motion = !!(window.gsap && window.ScrollTrigger) && !reduce;
  const isMobile = () => innerWidth < 900;
  const body = document.body;
  const YT_ID = 'KWUpe5uIIhE';

  if (motion) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }

  /* ---------- split text into masked chars ---------- */
  function split(el) {
    if (el.dataset.splitDone) return $$('.c', el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            w.setAttribute('aria-hidden', 'true');
            [...part].forEach(ch => {
              const c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              w.appendChild(c);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.hasAttribute('data-nosplit')) {
            const w = document.createElement('span');
            w.className = 'w';
            n.replaceWith(w);
            w.appendChild(n);
            n.classList.add('c');
          } else walk(n);
        }
      });
    };
    walk(el);
    el.dataset.splitDone = '1';
    return $$('.c', el);
  }

  /* ---------- small DOM setup ---------- */
  $$('.btn').forEach(b => {
    const t = b.textContent.trim();
    b.innerHTML = `<span class="btn__fill"></span><span class="roll-label" data-text="${t}"><span>${t}</span></span>`;
  });
  $$('.roll').forEach(r => {
    const t = r.textContent.trim();
    r.innerHTML = `<span class="roll-label" data-text="${t}"><span>${r.innerHTML.trim()}</span></span>`;
  });
  // floating wrapper around every hero product
  $$('.prod > .tilt').forEach(t => {
    const f = document.createElement('div');
    f.className = 'float';
    t.replaceWith(f);
    f.appendChild(t);
  });
  // dust in the spotlight
  const dust = $('#dust');
  for (let i = 0; i < 28; i++) {
    const d = document.createElement('i');
    d.className = 'dust';
    d.style.cssText = `left:${40 + Math.random() * 55}%;top:${20 + Math.random() * 70}%;--s:${1 + Math.random() * 2.5}px;--d:${7 + Math.random() * 8}s;--delay:${-Math.random() * 12}s;--dx:${-30 + Math.random() * 60}px`;
    dust.appendChild(d);
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const stopScroll = () => lenis && lenis.stop();
  const startScroll = () => lenis && lenis.start();
  const scrollToTarget = target => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- header hides on scroll down ---------- */
  const header = $('#header');
  let lastY = 0;
  const onScrollY = y => {
    if (!body.classList.contains('menu-open')) {
      if (y > lastY + 4 && y > 300) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    lastY = y;
  };
  if (lenis) lenis.on('scroll', l => onScrollY(l.scroll));
  else window.addEventListener('scroll', () => onScrollY(window.scrollY), { passive: true });

  /* ---------- menu ---------- */
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    open ? stopScroll() : startScroll();
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) { e.preventDefault(); return; }
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    if (menu.classList.contains('is-open')) setMenu(false);
    scrollToTarget(target);
  }));

  /* ---------- quote popup ---------- */
  const popup = $('#popup');
  const openPopup = note => {
    if (note) {
      $('#popupNotes').value = note;
      const printBox = $$('.chk input', popup)[0];
      if (printBox) printBox.checked = true;
    }
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    stopScroll();
  };
  const closePopup = () => { popup.classList.remove('is-open'); popup.setAttribute('aria-hidden', 'true'); startScroll(); };
  $$('[data-open-popup]').forEach(b => b.addEventListener('click', () => openPopup(b.closest('.build') ? cardSummary(true) : '')));
  $('#popupClose').addEventListener('click', closePopup);
  popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
  // Quote form: sends the details to White & Black on WhatsApp
  $('#popupForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const [name, email, phone, place] = $$('input:not([type=checkbox]):not(#popupNotes)', f).map(i => i.value.trim());
    const wants = $$('.chk input:checked', f).map(c => c.parentElement.textContent.trim());
    const notes = $('#popupNotes').value.trim();
    const msg = `Hi White & Black, I'd like a quote.
Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${place}` +
      (wants.length ? `
Looking for: ${wants.join(', ')}` : '') + (notes ? `
Notes: ${notes}` : '');
    window.open(`https://wa.me/919842355203?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    f.innerHTML = '<h4>Thank you!</h4><p>WhatsApp has opened with your details. Press send and we will reply shortly, or call +91 98423 55203.</p>';
    setTimeout(closePopup, 4000);
  });

  /* ---------- showreel video ---------- */
  const videoModal = $('#videoModal');
  const videoBox = $('#videoBox');
  const openVideo = () => {
    videoBox.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Showreel"></iframe>`;
    videoModal.classList.add('is-open');
    stopScroll();
  };
  const closeVideo = () => {
    videoModal.classList.remove('is-open');
    setTimeout(() => { videoBox.innerHTML = ''; }, 500);
    startScroll();
  };
  $('#showreelFrame').addEventListener('click', openVideo);
  $('#videoClose').addEventListener('click', closeVideo);
  videoModal.addEventListener('click', e => { if (e.target === videoModal) closeVideo(); });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('is-open')) setMenu(false);
    if (popup.classList.contains('is-open')) closePopup();
    if (videoModal.classList.contains('is-open')) closeVideo();
  });

  /* =========================================================
     CONFIGURATOR — works with or without GSAP
     ========================================================= */
  const ccard = $('#ccard');
  const buildStage = $('#buildStage');
  const choice = { paper: 'white', finish: 'matte', corner: 'square' };
  const labels = { white: 'Snow White', black: 'Jet Black', kraft: 'Kraft', matte: 'Matte', gloss: 'Gloss', foil: 'Gold Foil', square: 'Square', round: 'Rounded' };
  function cardSummary(long) {
    const s = `${labels[choice.paper]} · ${labels[choice.finish]} · ${labels[choice.corner]}`;
    return long ? `Business card: ${s} — Name: ${$('#cName').textContent}, ${$('#cRole').textContent}` : s;
  }
  function applyCard() {
    ccard.className = ccard.className.replace(/\b(paper|finish|corner)-\S+/g, '').trim();
    ccard.classList.add(`paper-${choice.paper}`, `finish-${choice.finish}`, `corner-${choice.corner}`);
    $('#buildSummary').textContent = cardSummary(false);
  }
  $$('.swatches').forEach(group => group.addEventListener('click', e => {
    const btn = e.target.closest('.swatch');
    if (!btn) return;
    $$('.swatch', group).forEach(s => s.classList.toggle('is-active', s === btn));
    choice[group.dataset.group] = btn.dataset.value;
    applyCard();
    if (!reduce) { ccard.classList.remove('spin'); void ccard.offsetWidth; ccard.classList.add('spin'); }
  }));
  $('#inName').addEventListener('input', e => { $('#cName').textContent = e.target.value.trim() || 'Your Name'; });
  $('#inRole').addEventListener('input', e => { $('#cRole').textContent = e.target.value.trim() || 'Founder'; });
  buildStage.addEventListener('click', () => ccard.classList.toggle('is-flipped'));
  const wrap = $('#ccardWrap');
  const tiltState = { rx: 8, ry: -14, sx: 30, sy: 20, sp: 100 };
  const paintTilt = () => {
    wrap.style.setProperty('--rx', tiltState.rx + 'deg');
    wrap.style.setProperty('--ry', tiltState.ry + 'deg');
    ccard.style.setProperty('--sx', tiltState.sx + '%');
    ccard.style.setProperty('--sy', tiltState.sy + '%');
    ccard.style.setProperty('--sp', tiltState.sp + '%');
  };
  buildStage.addEventListener('pointermove', e => {
    const r = buildStage.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const target = { rx: 8 - ny * 26, ry: -14 + nx * 46, sx: 50 + nx * 120, sy: 40 + ny * 120, sp: 100 - nx * 160 };
    if (motion) gsap.to(tiltState, { ...target, duration: 0.8, ease: 'power3.out', overwrite: true, onUpdate: paintTilt });
    else { Object.assign(tiltState, target); paintTilt(); }
  });
  buildStage.addEventListener('pointerleave', () => {
    const target = { rx: 8, ry: -14, sx: 30, sy: 20, sp: 100 };
    if (motion) gsap.to(tiltState, { ...target, duration: 1.2, ease: 'power3.out', overwrite: true, onUpdate: paintTilt });
    else { Object.assign(tiltState, target); paintTilt(); }
  });

  /* =========================================================
     TRI-VISION BILLBOARD — slats turn to reveal the next ad
     ========================================================= */
  const triFace = $('#triFace');
  const wcases = $$('.wcase');
  const srcs = wcases.map(w => w.dataset.img);
  const imgs = srcs.map(src => { const im = new Image(); im.src = src; return im; });
  const slatCount = () => (isMobile() ? 8 : 12);
  let slats = [];
  let triCur = 0;
  let triBusy = false;
  function buildSlats() {
    triFace.innerHTML = '';
    slats = Array.from({ length: slatCount() }, () => {
      const s = document.createElement('div');
      s.className = 'slat';
      s.innerHTML = '<div class="slat__f"></div><div class="slat__b"></div>';
      triFace.appendChild(s);
      return s;
    });
  }
  function paint(side, k) {
    const im = imgs[k];
    const W = triFace.clientWidth;
    const H = triFace.clientHeight;
    const sw = W / slats.length;
    const ar = (im.naturalWidth || 16) / (im.naturalHeight || 9);
    let bw, bh;
    if (W / H > ar) { bw = W; bh = W / ar; } else { bh = H; bw = H * ar; }
    const ox = (bw - W) / 2;
    const oy = (bh - H) / 2;
    slats.forEach((s, i) => {
      const el = s.children[side === 'f' ? 0 : 1];
      el.style.backgroundImage = `url(${srcs[k]})`;
      el.style.backgroundSize = `${bw}px ${bh}px`;
      el.style.backgroundPosition = `${-(i * sw + ox)}px ${-oy}px`;
    });
  }
  function swapTo(k) {
    k = (k + srcs.length) % srcs.length;
    if (triBusy || k === triCur) return;
    wcases.forEach((w, i) => w.classList.toggle('is-active', i === k));
    paint('b', k);
    if (motion) {
      triBusy = true;
      gsap.to(slats, {
        rotationY: 180, duration: 0.9, ease: 'power3.inOut', stagger: 0.045,
        onComplete: () => { paint('f', k); gsap.set(slats, { rotationY: 0 }); triCur = k; triBusy = false; }
      });
    } else { paint('f', k); triCur = k; }
  }
  buildSlats();
  const firstPaint = () => paint('f', triCur);
  imgs[0].complete ? firstPaint() : imgs[0].addEventListener('load', firstPaint, { once: true });
  window.addEventListener('resize', () => { buildSlats(); paint('f', triCur); });
  wcases.forEach((w, i) => w.addEventListener('click', () => { swapTo(i); restartTri(); }));
  $('#trivision').addEventListener('click', () => { swapTo(triCur + 1); restartTri(); });
  let triTimer = null;
  let triVisible = false;
  function restartTri() {
    clearInterval(triTimer);
    if (triVisible) triTimer = setInterval(() => swapTo(triCur + 1), 4500);
  }
  new IntersectionObserver(([en]) => { triVisible = en.isIntersecting; restartTri(); }, { threshold: 0.3 }).observe(triFace);

  /* =========================================================
     HERO PRODUCT STAGE
     ========================================================= */
  const prods = $$('.prod');
  const verbs = $$('.stage__verb');
  const infos = $$('.stage__info');
  const snavs = $$('.snav');
  const word = $('#stageWord');
  const words = ['Packaging', 'Cards', 'Brochures', 'Outdoor'];
  const verbChars = motion ? verbs.map(split) : [];
  let pCur = 0;
  let pBusy = false;
  let pAuto = null;

  function startProdAuto() {
    if (!motion) return;
    if (pAuto) pAuto.kill();
    gsap.set(snavs.map(s => $('b', s)), { scaleX: 0 });
    pAuto = gsap.to($('b', snavs[pCur]), { scaleX: 1, duration: 5.5, ease: 'none', onComplete: () => showProd(pCur + 1) });
  }
  function showProd(i) {
    i = (i + prods.length) % prods.length;
    if (pBusy || i === pCur) return;
    const prev = pCur;
    pCur = i;
    snavs.forEach((s, k) => s.classList.toggle('is-active', k === i));
    $('#seeInside').setAttribute('href', ['#products', '#story-cards', '#story-brochure', '#story-outdoor'][i]);
    if (!motion) {
      [prods, verbs, infos].forEach(list => { list[prev].classList.remove('is-active'); list[i].classList.add('is-active'); });
      word.textContent = words[i];
      return;
    }
    pBusy = true;
    gsap.timeline({ onComplete: () => { pBusy = false; } })
      .to(prods[prev], { autoAlpha: 0, scale: 0.7, y: 70, filter: 'blur(10px)', duration: 0.7, ease: 'power3.in' }, 0)
      .add(() => { prods[prev].classList.remove('is-active'); prods[i].classList.add('is-active'); }, 0.55)
      .fromTo(prods[i], { autoAlpha: 0, scale: 1.25, y: -50, filter: 'blur(14px)' }, { autoAlpha: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' }, 0.55)
      .to(verbChars[prev], { yPercent: -110, stagger: 0.02, duration: 0.5, ease: 'power3.in' }, 0)
      .add(() => { verbs[prev].classList.remove('is-active'); verbs[i].classList.add('is-active'); }, 0.45)
      .fromTo(verbChars[i], { yPercent: 110 }, { yPercent: 0, stagger: 0.03, duration: 0.9, ease: 'power4.out' }, 0.45)
      .to(infos[prev], { autoAlpha: 0, y: -14, duration: 0.4, ease: 'power2.in' }, 0)
      .add(() => { infos[prev].classList.remove('is-active'); infos[i].classList.add('is-active'); }, 0.4)
      .fromTo(infos[i], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.5)
      .to(word, { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: 'power2.in' }, 0)
      .add(() => { word.textContent = words[i]; }, 0.45)
      .to(word, { autoAlpha: 1, scale: 1, duration: 1, ease: 'expo.out' }, 0.5)
      .fromTo('.stage__spot', { rotate: i % 2 ? 6 : -6 }, { rotate: 0, duration: 1.6, ease: 'expo.out' }, 0.3);
    startProdAuto();
  }
  snavs.forEach((s, k) => s.addEventListener('click', () => showProd(k)));
  // drag / tap products to change
  const stageProducts = $('#stageProducts');
  let dragX = null;
  stageProducts.addEventListener('pointerdown', e => { dragX = e.clientX; });
  window.addEventListener('pointerup', e => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    dragX = null;
    showProd(pCur + (dx > 40 ? -1 : 1));
  });

  /* ---------- anatomy helpers ---------- */
  const layers = $('#layers');
  const callouts = $$('.callout');
  function placeCallouts(gap) {
    const scale = isMobile() ? 0.55 : 1;
    const base = layers.offsetTop;
    callouts.forEach(c => {
      const i = +c.dataset.i;
      c.style.setProperty('--y', `${base - Math.sin(58 * Math.PI / 180) * i * gap * scale}px`);
    });
  }

  /* ---------- cut one image into strips (hoarding sheets) ---------- */
  function coverSlices(box, strips, src) {
    const im = new Image();
    im.onload = () => {
      const W = box.clientWidth;
      const H = box.clientHeight;
      if (!W || !H) return;
      const sw = W / strips.length;
      const ar = im.naturalWidth / im.naturalHeight;
      const bw = W / H > ar ? W : H * ar;
      const bh = W / H > ar ? W / ar : H;
      strips.forEach((el, i) => {
        el.style.backgroundImage = `url(${src})`;
        el.style.backgroundSize = `${bw}px ${bh}px`;
        el.style.backgroundPosition = `${-(i * sw + (bw - W) / 2)}px ${-(bh - H) / 2}px`;
      });
    };
    im.src = src;
  }
  const hoardFrame = $('#hoardFrame');
  const hoardSheets = $$('.hoard__sheet');
  const paintHoarding = () => coverSlices(hoardFrame, hoardSheets, 'images/case-2.jpg');
  paintHoarding();
  window.addEventListener('resize', paintHoarding);

  /* =========================================================
     PRODUCT STORIES
     Each story is a timeline. With motion it is pinned and
     scrubbed by scroll; without, it is jumped to its last frame.
     ========================================================= */
  const stories = [];
  const story = (sel, thresholds, build, length = 2.6) => stories.push({ sec: $(sel), thresholds, build, length });
  function setStoryStep(s, p) {
    let n = 0;
    s.thresholds.forEach((t, k) => { if (p >= t) n = k; });
    $$('.ustep', s.sec).forEach((el, k) => el.classList.toggle('is-active', k === n));
    const bar = $('.story__bar b', s.sec);
    if (bar) bar.style.transform = `scaleX(${p})`;
  }

  // 01 — Packaging: the box opens and the stationery comes out
  const unboxScene = $('#unboxScene');
  const items = $$('.item', unboxScene);
  const itemSpots = [[-0.34, -0.27, -8], [-0.37, 0.18, 5], [0.31, 0.31, -4], [0.36, -0.29, 0], [0.4, 0.03, 6]];
  const spot = k => ({ x: itemSpots[k][0] * unboxScene.offsetWidth, y: itemSpots[k][1] * unboxScene.offsetHeight });
  story('#products', [0, 0.14, 0.42, 0.62, 0.86], tl => {
    const bigBox = $('#bigBox');
    const bigLid = $('.lid', bigBox);
    gsap.set(bigBox, { rotationY: -38 });
    gsap.set(bigLid, { '--open': '0deg' });
    gsap.set(items, { xPercent: -50, yPercent: -50, x: 0, y: -60, scale: 0.3, autoAlpha: 0, '--lbl': 0 });
    tl.to(bigBox, { rotationY: -14, duration: 1.2 }, 0)
      .to(bigLid, { '--open': '118deg', duration: 1.2, ease: 'power3.inOut' }, 0.6);
    items.forEach((it, k) => {
      const t = 1.6 + k * 0.55;
      tl.to(it, { autoAlpha: 1, y: () => -unboxScene.offsetHeight * 0.36, scale: 0.85, duration: 0.45, ease: 'power2.out' }, t)
        .to(it, { x: () => spot(k).x, y: () => spot(k).y, scale: 1, rotation: itemSpots[k][2], duration: 0.7, ease: 'power3.inOut' }, t + 0.45);
    });
    tl.to(items, { '--lbl': 1, duration: 0.3, stagger: 0.05 }, '+=0.1')
      .to(bigBox, { rotationY: 8, duration: 1 }, '<')
      .to({}, { duration: 0.4 });
  });

  // 02 — Business cards: stack → fan → foil flip → spread of finishes
  story('#story-cards', [0, 0.2, 0.42, 0.7], tl => {
    const tilt = $('#deckTilt');
    const deck = $('#deck');
    const cards = $$('.dcard', deck);
    const n = cards.length;
    const hero = cards[n - 1];
    const heroFlip = $('.dcard__flip', hero);
    const sweep = $('.foil-sweep', hero);
    const mid = (n - 1) / 2;
    const grid = k => (isMobile()
      ? { x: ((k % 2) - 0.5) * 262, y: (Math.floor(k / 2) - 1) * 176 }
      : { x: ((k % 3) - 1) * 256, y: (Math.floor(k / 3) - 0.5) * 186 });
    gsap.set(tilt, { rotationX: 62, scale: 0.8, y: 60 });
    gsap.set(deck, { rotation: -25 });
    cards.forEach((c, k) => gsap.set(c, { x: 0, y: -k * 2, z: k * 3, rotation: 0, transformOrigin: '50% 150%', '--lbl': 0 }));
    tl.to(tilt, { scale: 1, y: 0, duration: 0.8 }, 0)
      .to(deck, { rotation: 0, duration: 1 }, 0.6)
      .to(tilt, { rotationX: 30, duration: 1 }, 0.6)
      .to(cards, { rotation: k => (k - mid) * 13, y: k => -Math.abs(k - mid) * 6, duration: 1, stagger: 0.03 }, 0.6)
      .to(tilt, { rotationX: 6, duration: 0.8 }, 1.8)
      .to(cards.slice(0, -1), { y: 70, z: -90, duration: 0.8 }, 1.8)
      .to(hero, { rotation: 0, y: -30, z: 150, duration: 0.8 }, 1.8)
      .to(heroFlip, { rotationY: 180, duration: 1, ease: 'power3.inOut' }, 2.5)
      .fromTo(sweep, { backgroundPosition: '130% 0%' }, { backgroundPosition: '-30% 0%', duration: 0.8, ease: 'none' }, 3.3)
      .to(heroFlip, { rotationY: 360, duration: 0.8 }, 4.1)
      .to(tilt, { rotationX: 12, duration: 1 }, 4.1)
      .to(cards, { x: k => grid(k).x, y: k => grid(k).y, z: 0, rotation: 0, duration: 1.2, stagger: 0.05, ease: 'power3.inOut' }, 4.2)
      .to(cards, { '--lbl': 1, duration: 0.3, stagger: 0.05 }, 5.4)
      .to({}, { duration: 0.4 });
  });

  // 03 — Brochure: closed tri-fold opens panel by panel, content prints in
  story('#story-brochure', [0, 0.24, 0.55, 0.82], (tl, sec) => {
    const tilt = $('#foldTilt');
    const L = $('#flapLeft');
    const R = $('#flapRight');
    const lines = $$('.fface--in .fline', sec);
    const pics = $$('.fface--in .fimg', sec);
    const extras = $$('.fqr, .fbtn', sec);
    const tags = $$('.ftag', sec);
    gsap.set(tilt, { rotationY: -28, rotationX: 12, y: 60, scale: 0.9 });
    gsap.set(L, { rotationY: 176 });
    gsap.set(R, { rotationY: -178 });
    gsap.set(lines, { scaleX: 0 });
    gsap.set(pics, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(extras, { autoAlpha: 0, y: 10 });
    gsap.set(tags, { autoAlpha: 0, y: 10 });
    tl.to(tilt, { y: 0, scale: 1, rotationY: -14, duration: 1 }, 0)
      .to(L, { rotationY: 0, duration: 1.2, ease: 'power3.inOut' }, 0.9)
      .to(R, { rotationY: 0, duration: 1.2, ease: 'power3.inOut' }, 1.9)
      .to(tilt, { rotationY: 0, rotationX: 6, duration: 1.4 }, 1.9)
      .to(pics, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, stagger: 0.15 }, 3.2)
      .to(lines, { scaleX: 1, duration: 0.5, stagger: 0.04 }, 3.4)
      .to(extras, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, 3.7)
      .to(tags, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12 }, 4.1)
      .to(L, { rotationY: 16, duration: 1 }, 4.5)
      .to(R, { rotationY: -16, duration: 1 }, 4.5)
      .to(tilt, { rotationY: 10, rotationX: 10, duration: 1 }, 4.5)
      .to({}, { duration: 0.4 });
  });

  // 04 — Outdoor: steel, frame, pasted sheets, lights, then standee + glow sign
  story('#story-outdoor', [0, 0.14, 0.36, 0.6, 0.8], (tl, sec) => {
    const city = $('#city');
    const hoard = $('#hoard');
    const legs = $$('.hoard__legs i', sec);
    const walk = $('.hoard__walk', sec);
    const lamps = $('.hoard__lamps', sec);
    const rollup = $('#rollup');
    const banner = $('.rollup__banner', sec);
    const glow = $('#glowSign');
    const gbox = $('.glowsign__box', sec);
    const pole = $('.glowsign__pole', sec);
    gsap.set(city, { scale: 1.25, transformOrigin: '50% 70%' });
    gsap.set(legs, { scaleY: 0 });
    gsap.set(walk, { scaleX: 0 });
    gsap.set(hoardFrame, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(lamps, { autoAlpha: 0, y: -10 });
    gsap.set(hoardSheets, { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set(hoard, { '--lamp': 0, '--bright': 0.35, '--lbl': 0 });
    gsap.set(rollup, { autoAlpha: 0, '--lbl': 0 });
    gsap.set(banner, { scaleY: 0 });
    gsap.set(glow, { autoAlpha: 0, '--lbl': 0 });
    gsap.set(pole, { scaleY: 0 });
    gsap.set(gbox, { autoAlpha: 0, y: 20, '--lit': 0.25, '--glow': '0px' });
    tl.to(city, { scale: 1.1, duration: 0.8 }, 0)
      .to(legs, { scaleY: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.6)
      .to(walk, { scaleX: 1, duration: 0.4 }, 1.2)
      .to(hoardFrame, { scaleY: 1, duration: 0.6, ease: 'power3.out' }, 1.4)
      .to(lamps, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.9)
      .to(hoardSheets, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, stagger: 0.3 }, 2.3)
      .to(hoard, { '--lamp': 1, duration: 0.12, repeat: 2, yoyo: true, ease: 'none' }, 3.6)
      .to(hoard, { '--bright': 1, duration: 0.6 }, 3.7)
      .to(city, { scale: 1, duration: 1 }, 4.3)
      .to(glow, { autoAlpha: 1, duration: 0.1 }, 4.4)
      .to(pole, { scaleY: 1, duration: 0.5 }, 4.4)
      .to(gbox, { autoAlpha: 1, y: 0, duration: 0.4 }, 4.8)
      .to(gbox, { '--lit': 1, '--glow': '34px', duration: 0.5 }, 5.1)
      .to(rollup, { autoAlpha: 1, duration: 0.1 }, 4.6)
      .to(banner, { scaleY: 1, duration: 0.8, ease: 'power3.out' }, 4.7)
      .to([hoard, rollup, glow], { '--lbl': 1, duration: 0.3, stagger: 0.1 }, 5.5)
      .to({}, { duration: 0.4 });
  });

  // 05 — Logo: grid and circles draw, sketch, ink fill, then real-world uses
  story('#story-logo', [0, 0.2, 0.45, 0.7], (tl, sec) => {
    const scene = $('#logoScene');
    const board = $('#artboard');
    const guides = $$('.cl--grid, .cl--diag', sec);
    const circles = $$('.cl--c1, .cl--c2, .cl--c3, .cl--c4', sec);
    const sketch = $('.artboard__sketch', sec);
    const ink = $('.artboard__ink', sec);
    const dims = $$('.artboard__dim', sec);
    const apps = $$('.lapp', sec);
    const appSpots = [[-0.33, -0.27], [0.34, -0.25], [-0.34, 0.27], [0.32, 0.29]];
    const aspot = k => ({ x: appSpots[k][0] * scene.offsetWidth, y: appSpots[k][1] * scene.offsetHeight });
    gsap.set([...guides, ...circles], { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(sketch, { autoAlpha: 0 });
    gsap.set(ink, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(dims, { autoAlpha: 0 });
    gsap.set(board, { rotationX: 20, y: 60, scale: 0.9, transformPerspective: 1200 });
    gsap.set(apps, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.3, autoAlpha: 0, '--lbl': 0 });
    tl.to(board, { rotationX: 0, y: 0, scale: 1, duration: 0.8 }, 0)
      .to(guides, { strokeDashoffset: 0, duration: 0.8, stagger: 0.1 }, 0.3)
      .to(circles, { strokeDashoffset: 0, duration: 1, stagger: 0.15 }, 1.1)
      .to(dims, { autoAlpha: 1, duration: 0.3 }, 1.6)
      .to(sketch, { autoAlpha: 0.7, duration: 0.5 }, 1.9)
      .to(ink, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, 2.6)
      .to(sketch, { autoAlpha: 0, duration: 0.4 }, 3.4)
      .to([...guides, ...circles, ...dims], { opacity: 0.15, duration: 0.5 }, 3.5)
      .to(board, { scale: 0.62, duration: 1 }, 3.9)
      .to(apps, { autoAlpha: 1, scale: 1, x: k => aspot(k).x, y: k => aspot(k).y, duration: 1, stagger: 0.15, ease: 'back.out(1.4)' }, 4.1)
      .to(apps, { '--lbl': 1, duration: 0.3, stagger: 0.05 }, 5)
      .to({}, { duration: 0.4 });
  });

  // 06 — Social: phone rises, feed scrolls, a post gets loved, notifications pop
  story('#story-social', [0, 0.22, 0.48, 0.72], (tl, sec) => {
    const scene = $('#socialScene');
    const phone = $('#phone');
    const feed = $('#feed');
    const burst = $('#burst');
    const hearts = $$('#miniHearts i');
    const likeEl = $('#likeCount');
    const likeHeart = $('.like-heart', sec);
    const bubbles = $$('.bubble', sec);
    const bSpots = [[-0.34, -0.3], [0.34, -0.17], [-0.34, 0.16], [0.32, 0.31]];
    const likes = { v: 0 };
    const feedShift = () => -($('.igpost--hero', sec).offsetTop - 30);
    gsap.set(phone, { rotationX: 35, rotationY: -25, y: 140, scale: 0.85, transformPerspective: 1200 });
    gsap.set(feed, { y: 0 });
    gsap.set(burst, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
    gsap.set(hearts, { x: 0, y: 0, autoAlpha: 0, scale: 0.5 });
    gsap.set(bubbles, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.4, autoAlpha: 0 });
    tl.to(phone, { rotationX: 0, rotationY: 0, y: 0, scale: 1, duration: 1 }, 0)
      .to(feed, { y: feedShift, duration: 1.6, ease: 'power1.inOut' }, 1)
      .to(burst, { autoAlpha: 1, scale: 1.2, duration: 0.35, ease: 'back.out(2)' }, 2.7)
      .to(burst, { autoAlpha: 0, scale: 1.6, duration: 0.35 }, 3.1)
      .fromTo(likeHeart, { scale: 1 }, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1 }, 2.8)
      .to(likes, { v: 1240, duration: 1, ease: 'power2.out', onUpdate: () => { likeEl.textContent = `${Math.round(likes.v).toLocaleString('en-IN')} likes`; } }, 2.8)
      .to(hearts, { autoAlpha: 1, scale: 1, x: k => (k - 2.5) * 34, y: k => -120 - (k % 3) * 40, duration: 0.8, stagger: 0.06, ease: 'power2.out' }, 2.8)
      .to(hearts, { autoAlpha: 0, y: '-=60', duration: 0.5, stagger: 0.06 }, 3.6)
      .to(bubbles, { autoAlpha: 1, scale: 1, x: k => bSpots[k][0] * scene.offsetWidth, y: k => bSpots[k][1] * scene.offsetHeight, duration: 0.8, stagger: 0.25, ease: 'back.out(1.6)' }, 4)
      .to(phone, { rotationY: -8, duration: 1 }, 4.2)
      .to({}, { duration: 0.4 });
  });

  /* =========================================================
     Static fallback
     ========================================================= */
  if (!motion) {
    $('#loader').remove();
    $('#progress').style.display = 'none';
    $$('.step, .anchor').forEach(s => s.classList.add('is-active'));
    if (window.gsap) {
      // reduced motion: every story shows its finished frame
      stories.forEach(s => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
        s.build(tl, s.sec);
        tl.progress(1);
        setStoryStep(s, 1);
      });
    } else {
      $('.lid', unboxScene).style.setProperty('--open', '115deg');
      items.forEach((it, k) => {
        const p = spot(k);
        it.style.transform = `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) rotate(${itemSpots[k][2]}deg)`;
        it.style.opacity = 1;
        it.style.setProperty('--lbl', 1);
      });
      stories.forEach(s => setStoryStep(s, 1));
    }
    layers.style.setProperty('--gap', '90px');
    placeCallouts(90);
    callouts.forEach(c => { c.style.opacity = 1; });
    setInterval(() => showProd(pCur + 1), 5500);
    return;
  }

  /* =========================================================
     Motion
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  body.classList.add('is-loading');
  stopScroll();

  /* ---------- cursor + magnetic + parallax ---------- */
  if (finePointer) {
    body.classList.add('has-cursor');
    const dot = $('#cursor');
    const label = $('#cursorLabel');
    const labelText = $('span', label);
    const dx = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3' });
    const lx = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3' });
    const ly = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); lx(e.clientX); ly(e.clientY); });
    document.addEventListener('pointerover', e => {
      const tagged = e.target.closest('[data-cursor]');
      const inner = e.target.closest('.play, .btn, input');
      if (tagged && !inner) { labelText.textContent = tagged.dataset.cursor; label.classList.add('is-on'); dot.classList.add('is-hidden'); }
      else { label.classList.remove('is-on'); dot.classList.remove('is-hidden'); }
      dot.classList.toggle('is-hover', !!e.target.closest('a, button, .chk') && !(tagged && !inner));
      if (e.target.closest('input')) dot.classList.add('is-hidden');
    });
    $$('[data-magnetic]').forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || 0.3;
      const mx = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      const my = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * strength);
        my((e.clientY - r.top - r.height / 2) * strength);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
    // products lean towards the mouse
    const stage = $('#hero');
    const lean = { mx: 0, my: 0 };
    const applyLean = () => { stageProducts.style.setProperty('--mx', lean.mx); stageProducts.style.setProperty('--my', lean.my); };
    stage.addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      gsap.to(lean, { mx: nx * 22, my: -ny * 14, duration: 1, ease: 'power3.out', overwrite: true, onUpdate: applyLean });
      gsap.to('.stage__word', { x: nx * -40, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
    });
  }

  /* ---------- idle product loops ---------- */
  gsap.to('.prod .box3d', { rotationY: '+=360', duration: 16, repeat: -1, ease: 'none' });
  gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
    .to('#heroFlipCard', { rotationY: 180, duration: 1.2, ease: 'expo.inOut', delay: 1.2 })
    .to('#heroFlipCard', { rotationY: 360, duration: 1.2, ease: 'expo.inOut', delay: 1.6 })
    .set('#heroFlipCard', { rotationY: 0 });
  gsap.fromTo('#trifold', { '--fold': '10deg' }, { '--fold': '70deg', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.board__face img', { scale: 1.12, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.board__lamps i', { opacity: 0.55, duration: 0.08, repeat: -1, repeatDelay: 3.2, yoyo: true, stagger: 1.1 });

  /* ---------- scroll progress ---------- */
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- headline chars + fade-ups ---------- */
  $$('[data-split]').forEach(el => {
    const chars = split(el);
    gsap.set(chars, { yPercent: 110 });
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(chars, { yPercent: 0, stagger: 0.022, duration: 1.1, ease: 'power4.out' }) });
  });
  const reveals = $$('[data-reveal]');
  gsap.set(reveals, { y: 50, autoAlpha: 0 });
  ScrollTrigger.batch(reveals, { start: 'top 90%', once: true, onEnter: b => gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 1.1, ease: 'power3.out' }) });

  /* ---------- count + ink statement ---------- */
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 2, delay: 0.3, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });
  $$('[data-ink]').forEach(el => {
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="iw" aria-hidden="true">${w}</span>`).join(' ');
    gsap.fromTo($$('.iw', el), { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  /* ---------- arches rise like products onto a shelf ---------- */
  gsap.fromTo('.arch', { y: 140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.09, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '#arches', start: 'top 85%', once: true } });
  gsap.fromTo('.arch__img img', { scale: 1.5 }, { scale: 1.15, stagger: 0.09, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: '#arches', start: 'top 85%', once: true } });

  /* ---------- configurator card drops in ---------- */
  gsap.fromTo('#ccardWrap', { y: -120, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4, ease: 'bounce.out', scrollTrigger: { trigger: '#buildStage', start: 'top 70%', once: true } });

  /* ---------- journal images ---------- */
  $$('.post__img').forEach(box => {
    gsap.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: box, start: 'top 90%', once: true } });
  });

  /* ---------- billboard + work list ---------- */
  gsap.fromTo('#trivision', { y: 80, rotationX: -25, autoAlpha: 0, transformPerspective: 1200 }, { y: 0, rotationX: 0, autoAlpha: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.work', start: 'top 70%', once: true } });
  gsap.fromTo('.wcase', { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.work', start: 'top 60%', once: true } });
  gsap.fromTo('.wave--top path', { attr: { d: 'M0,120 L0,120 C240,120 480,120 720,120 C960,120 1200,120 1440,120 L1440,120 Z' } }, { attr: { d: 'M0,120 L0,60 C240,0 480,0 720,50 C960,100 1200,100 1440,40 L1440,120 Z' }, ease: 'none', scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'top 40%', scrub: true } });

  /* ---------- showreel frame expands ---------- */
  const reelST = { trigger: '.showreel', start: 'top 95%', end: 'top top', scrub: true };
  gsap.fromTo('#showreelFrame', { clipPath: 'inset(16% 20% 16% 20% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: reelST });
  gsap.fromTo('#showreelFrame img', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { ...reelST } });
  gsap.fromTo('.sr-a', { xPercent: 45 }, { xPercent: 0, ease: 'none', scrollTrigger: { ...reelST } });
  gsap.fromTo('.sr-b', { xPercent: -45 }, { xPercent: 0, ease: 'none', scrollTrigger: { ...reelST } });

  /* =========================================================
     PRODUCT STORIES (pinned + scrubbed)
     ========================================================= */
  stories.forEach(s => {
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: s.sec, start: 'top top', end: () => '+=' + innerHeight * s.length,
        pin: $('.story__pin', s.sec), scrub: 1, invalidateOnRefresh: true,
        onUpdate: self => setStoryStep(s, self.progress)
      }
    });
    s.build(tl, s.sec);
  });

  /* =========================================================
     ANATOMY (pinned exploded view)
     ========================================================= */
  gsap.set(layers, { '--gap': '0px', '--rz': '-32deg' });
  gsap.set(callouts, { autoAlpha: 0, x: (i, el) => (el.classList.contains('callout--l') ? -30 : 30) });
  placeCallouts(0);
  const anaTl = gsap.timeline({
    scrollTrigger: { trigger: '.anatomy', start: 'top top', end: () => '+=' + innerHeight * 2, pin: '.anatomy__pin', scrub: 1, invalidateOnRefresh: true, onRefresh: () => placeCallouts(parseFloat(gsap.getProperty(layers, '--gap')) || 0) }
  });
  anaTl
    .to(layers, {
      '--gap': () => (isMobile() ? '135px' : '85px'), '--rz': '-20deg', duration: 2, ease: 'power2.inOut',
      onUpdate: () => placeCallouts(parseFloat(gsap.getProperty(layers, '--gap')) || 0)
    }, 0)
    .to('.layer--print .logo-mask', { opacity: 1, duration: 0.4 }, 0.6);
  callouts.forEach((c, k) => anaTl.to(c, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out' }, 0.5 + k * 0.4));
  anaTl.to({}, { duration: 0.6 });

  /* ---------- pen-tool process (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const pen = $('#pen');
    const path = $('.pen__path');
    const nib = $('#penNib');
    const anchors = $$('.anchor');
    const stepEls = $$('.step');
    const len = path.getTotalLength();
    const anchorX = [15, 272, 530, 788];
    const samples = Array.from({ length: 401 }, (_, s) => path.getPointAtLength(len * s / 400).x);
    const stops = anchorX.map(ax => {
      let best = 0;
      samples.forEach((x, s) => { if (Math.abs(x - ax) < Math.abs(samples[best] - ax)) best = s; });
      return best / 400;
    });
    const placeNib = p => {
      const pt = path.getPointAtLength(len * p);
      gsap.set(nib, { x: pt.x / 1000 * pen.offsetWidth, y: pt.y / 120 * pen.offsetHeight });
      stepEls.forEach((s, i) => s.classList.toggle('is-active', p >= stops[i] - 0.005));
      anchors.forEach((a, i) => a.classList.toggle('is-active', p >= stops[i] - 0.005));
    };
    gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
    placeNib(0);
    gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.process', start: 'top 70%', end: 'bottom 80%', scrub: 0.8 }, onUpdate() { placeNib(this.progress()); } });
  });
  mm.add('(max-width: 899px)', () => {
    $$('.step').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 80%', once: true, onEnter: () => s.classList.add('is-active') }));
  });

  /* ---------- testimonials ---------- */
  const tSlides = $$('.testi__slide');
  let t = 0;
  let tTimer;
  function showT(i) {
    const prev = t;
    t = (i + tSlides.length) % tSlides.length;
    if (prev === t) return;
    $('#tCur').textContent = String(t + 1).padStart(2, '0');
    gsap.to(tSlides[prev].children, { y: -30, autoAlpha: 0, stagger: 0.05, duration: 0.45, ease: 'power2.in', onComplete: () => { tSlides[prev].classList.remove('is-active'); gsap.set(tSlides[prev].children, { clearProps: 'all' }); } });
    tSlides[t].classList.add('is-active');
    gsap.fromTo(tSlides[t].children, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.9, delay: 0.4, ease: 'power3.out' });
    clearInterval(tTimer);
    tTimer = setInterval(() => showT(t + 1), 8000);
  }
  $('#tPrev').addEventListener('click', () => showT(t - 1));
  $('#tNext').addEventListener('click', () => showT(t + 1));
  tTimer = setInterval(() => showT(t + 1), 8000);

  /* ---------- hero intro (after the loader) ---------- */
  verbChars.slice(1).forEach(ch => gsap.set(ch, { yPercent: 110 }));
  const intro = gsap.timeline({ paused: true, onComplete: startProdAuto })
    .from('.header__inner', { yPercent: -100, autoAlpha: 0, duration: 1, ease: 'power3.out' }, 0)
    .from('.stage__spot', { autoAlpha: 0, rotate: -25, duration: 1.8, ease: 'expo.out' }, 0)
    .from('.stage__word', { autoAlpha: 0, scale: 1.2, duration: 1.6, ease: 'expo.out' }, 0.1)
    .from(prods[0], { autoAlpha: 0, scale: 1.4, y: -80, filter: 'blur(16px)', duration: 1.6, ease: 'expo.out' }, 0.2)
    .from('.stage__floor', { autoAlpha: 0, scaleX: 0.3, duration: 1.4, ease: 'expo.out' }, 0.4)
    .from('.stage__card', { x: -60, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.3)
    .from(verbChars[0], { yPercent: 110, stagger: 0.04, duration: 1.1, ease: 'power4.out' }, 0.5)
    .from('.stage__nav .snav', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.9);

  /* ---------- preloader ---------- */
  const loader = $('#loader');
  const countEl = $('#loaderCount');
  const loaderChars = split($('.loader__word'));
  const critical = $$('.stage img, .work img');
  const ready = Promise.race([
    Promise.all([
      document.fonts ? document.fonts.ready : 1,
      ...critical.map(img => img.complete ? 1 : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }))
    ]),
    new Promise(r => setTimeout(r, 3000))
  ]);
  const counter = { v: 0 };
  const loadTl = gsap.timeline()
    .from('.loader__logo', { scale: 0, rotate: -90, duration: 0.9, ease: 'expo.out' }, 0)
    .from(loaderChars, { yPercent: 110, stagger: 0.035, duration: 0.9, ease: 'power4.out' }, 0.1)
    .from('.loader__meta', { autoAlpha: 0, duration: 0.6 }, 0.3)
    .to(counter, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0);

  Promise.all([ready, loadTl]).then(() => {
    gsap.timeline({
      onComplete: () => {
        loader.remove();
        body.classList.remove('is-loading');
        window.scrollTo(0, 0);
        startScroll();
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
        ScrollTrigger.refresh();
      }
    })
      .to(loaderChars, { yPercent: -110, stagger: 0.02, duration: 0.5, ease: 'power3.in' }, 0)
      .to('.loader__logo, .loader__meta', { autoAlpha: 0, duration: 0.4 }, 0)
      .to('.loader__panel--top', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 0.45)
      .to('.loader__panel--bottom', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, 0.45)
      .add(() => intro.play(), 0.75);
  });

  setTimeout(() => {
    try { if (sessionStorage.getItem('wbPopup')) return; sessionStorage.setItem('wbPopup', '1'); } catch (err) { /* storage blocked */ }
    if (!menu.classList.contains('is-open') && !videoModal.classList.contains('is-open')) openPopup('');
  }, 25000);

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
