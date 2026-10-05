(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.motion-toggle');
  const videos = [...document.querySelectorAll('.film-card video')];
  const visibleVideos = new Set();
  const dialog = document.querySelector('.film-dialog');
  const dialogVideo = dialog.querySelector('video');
  let paused = reducedMotion.matches;
  let animationContext;
  let introHasPlayed = false;
  let previousFocus;
  let lastScroll = 0;
  let progressFrame = 0;

  function updateProgress() {
    progressFrame = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector('.reading-progress').style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  window.addEventListener('scroll', () => {
    lastScroll = window.scrollY;
    if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  function setupAnimations() {
    if (!window.gsap || !window.ScrollTrigger || paused) return;
    gsap.registerPlugin(ScrollTrigger);
    animationContext = gsap.context(() => {
      if (!introHasPlayed) {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.from('.hero-intro', { y: 16, opacity: 0, duration: .85 }, .05)
          .from('.birthday-line', { yPercent: 110, rotate: 4, duration: 1.2 }, .1)
          .from('.name-line', { yPercent: 110, rotate: 4, duration: 1.3 }, .25)
          .from('.hero-description, .explore-link', { y: 20, opacity: 0, duration: .95, stagger: .12 }, .65)
          .from('.hero-portrait', { y: 50, rotate: 12, opacity: 0, duration: 1.5 }, .2)
          .from('.portrait-image', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power4.inOut' }, .15)
          .from('.portrait-outline, .portrait-shadow', { rotate: 4, scale: .94, opacity: 0, duration: 1.4, stagger: .1 }, .3)
          .from('.portrait-flower', { scale: .65, rotate: 25, opacity: 0, duration: 1.3 }, .8)
          .from('.handwritten-note, .hero-bottom', { opacity: 0, y: 8, duration: .9 }, 1.1);
        introHasPlayed = true;
      }
      gsap.utils.toArray('.reveal').forEach(element => {
        gsap.from(element, { y: 35, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
      gsap.from('.world-image-wrap', { clipPath: 'inset(12% 0 12% 0 round 220px 220px 0 0)', opacity: .4, duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: '.world-visual', start: 'top 85%', once: true } });
      gsap.fromTo('.world-image-wrap img', { scale: 1.16, yPercent: 3 }, { scale: 1.03, yPercent: -1, ease: 'none', scrollTrigger: { trigger: '.world-visual', start: 'top bottom', end: 'bottom top', scrub: 1.4 } });
      gsap.to('.hero-art', { y: -38, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 } });
      gsap.to('.hero-branch', { rotate: 4, y: -20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.8 } });
      gsap.from('.film-one', { y: 65, rotate: -9, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.film-gallery', start: 'top 85%', once: true } });
      gsap.from('.film-two', { y: 95, rotate: 9, opacity: 0, duration: 1.5, delay: .12, ease: 'power3.out', scrollTrigger: { trigger: '.film-gallery', start: 'top 85%', once: true } });
      gsap.to('.finale-ring', { scale: 1.16, rotate: 20, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom top', scrub: 1.8 } });
      gsap.to('.world-flower', { rotate: -25, ease: 'none', scrollTrigger: { trigger: '.her-world', start: 'top bottom', end: 'bottom top', scrub: 2 } });
      if (matchMedia('(pointer: fine)').matches) {
        const rotateX = gsap.quickTo('.hero-art', 'rotationX', { duration: 1.3, ease: 'power3.out' });
        const rotateY = gsap.quickTo('.hero-art', 'rotationY', { duration: 1.3, ease: 'power3.out' });
        const hero = document.querySelector('.hero');
        const pointerMove = event => {
          const bounds = hero.getBoundingClientRect();
          rotateX((.5 - (event.clientY - bounds.top) / bounds.height) * 4);
          rotateY(((event.clientX - bounds.left) / bounds.width - .5) * 5);
        };
        const pointerLeave = () => { rotateX(0); rotateY(0); };
        hero.addEventListener('pointermove', pointerMove);
        hero.addEventListener('pointerleave', pointerLeave);
        return () => { hero.removeEventListener('pointermove', pointerMove); hero.removeEventListener('pointerleave', pointerLeave); };
      }
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  function ensureVideo(video) {
    if (!video.getAttribute('src')) { video.src = video.dataset.src; video.load(); }
  }
  function syncVideos() {
    videos.forEach(video => {
      if (!paused && !document.hidden && !dialog.open && visibleVideos.has(video)) {
        ensureVideo(video);
        video.play().catch(() => {});
      } else video.pause();
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleVideos.add(entry.target);
        else visibleVideos.delete(entry.target);
      });
      syncVideos();
    }, { threshold: .15 });
    videos.forEach(video => observer.observe(video));
  }
  document.querySelectorAll('.film-card').forEach(card => card.addEventListener('click', () => {
    previousFocus = card;
    const preview = card.querySelector('video');
    dialogVideo.src = preview.dataset.src;
    dialogVideo.poster = preview.poster;
    dialog.showModal();
    document.body.classList.add('modal-open');
    syncVideos();
    dialogVideo.play().catch(() => {});
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => {
    dialogVideo.pause();
    dialogVideo.removeAttribute('src');
    dialogVideo.load();
    document.body.classList.remove('modal-open');
    syncVideos();
    previousFocus?.focus({ preventScroll: true });
  });

  // A small, bounded field of petals: depth, slow wind, and a soft tumbling profile.
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  let width = innerWidth;
  let height = innerHeight;
  let petalFrame = 0;
  let lastTime = 0;
  let elapsed = 0;
  const petalPath = new Path2D('M0 8 C-10 1 -8 -8 -3 -9 L0 -6 L3 -9 C10 -7 9 3 0 8Z');
  let seed = 19;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  const petals = Array.from({ length: innerWidth < 760 ? 15 : 25 }, () => ({ x: random() * width, y: random() * height, depth: .45 + random() * .6, angle: random() * Math.PI * 2, phase: random() * Math.PI * 2, speed: 14 + random() * 15, turn: (random() - .5) * .6 }));
  function sizeCanvas() {
    const oldWidth = width, oldHeight = height;
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    petals.forEach(p => { p.x *= width / oldWidth; p.y *= height / oldHeight; });
  }
  function drawPetals(time) {
    petalFrame = 0;
    if (paused || document.hidden || !ctx) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, .04) : 0;
    lastTime = time; elapsed += dt;
    ctx.clearRect(0, 0, width, height);
    for (const p of petals) {
      p.y += dt * p.speed * p.depth;
      p.x += dt * (9 + Math.sin(elapsed * .4 + p.phase) * 12) * p.depth;
      p.angle += dt * p.turn;
      if (p.y > height + 20) { p.y = -20; p.x = random() * width; }
      if (p.x > width + 25) p.x = -25;
      ctx.save();
      ctx.translate(p.x + Math.sin(elapsed * .6 + p.phase) * 16, p.y);
      ctx.rotate(p.angle);
      ctx.scale(p.depth * (.38 + Math.abs(Math.cos(elapsed * .75 + p.phase)) * .62), p.depth);
      ctx.globalAlpha = .22 + p.depth * .24;
      const color = ctx.createLinearGradient(-5, -7, 5, 7);
      color.addColorStop(0, '#ffcad5'); color.addColorStop(1, '#c986a5');
      ctx.fillStyle = color; ctx.fill(petalPath); ctx.restore();
    }
    petalFrame = requestAnimationFrame(drawPetals);
  }
  function syncPetals() {
    if (petalFrame) cancelAnimationFrame(petalFrame);
    petalFrame = 0; lastTime = 0;
    if (paused || document.hidden) ctx?.clearRect(0, 0, width, height);
    else if (ctx) petalFrame = requestAnimationFrame(drawPetals);
  }
  function setMotion(value) {
    paused = value;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
    motionButton.title = paused ? 'Resume animations' : 'Pause animations';
    document.documentElement.classList.toggle('motion-paused', paused);
    if (animationContext) { animationContext.revert(); animationContext = undefined; }
    if (!paused) setupAnimations();
    syncPetals(); syncVideos();
  }
  motionButton.addEventListener('click', () => setMotion(!paused));
  reducedMotion.addEventListener('change', event => setMotion(event.matches));
  document.addEventListener('visibilitychange', () => { syncPetals(); syncVideos(); });
  window.addEventListener('resize', sizeCanvas, { passive: true });
  sizeCanvas(); updateProgress(); setMotion(paused);
})();
