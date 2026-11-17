/* ==========================================================
   Bhavesh & Shivani — Royal Wedding Invitation
   One script (was 10). Same behaviour, lighter on the main thread.
   ========================================================== */
(() => {
  'use strict';

  const C = window.CONFIG;
  const $ = id => document.getElementById(id);
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = matchMedia('(max-width: 900px), (pointer: coarse)').matches;

  // Always start at the top (the film), even if the browser remembers a scroll position or #rsvp in the link
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: 'instant' });

  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const setText = (id, v) => { const n = $(id); if (n) n.textContent = v == null ? '' : v; };

  /* ======================= RENDER CONFIG ======================= */
  function dateParts(iso) {
    const d = new Date(iso);
    const opt = { timeZone: 'Asia/Kolkata' };
    const fmt = o => new Intl.DateTimeFormat('en-IN', { ...opt, ...o }).format(d);
    return {
      day: String(Number(fmt({ day: '2-digit' }))),
      month: fmt({ month: 'long' }),
      shortMonth: fmt({ month: 'short' }),
      weekday: fmt({ weekday: 'short' }),
      year: fmt({ year: 'numeric' })
    };
  }

  function render() {
    const groom = C.groomName, bride = C.brideName;
    const names = `${groom} & ${bride}`;
    const date = dateParts(C.countdownIso);

    $('gateTitle').innerHTML = `<span>${esc(groom)}</span><em>&amp;</em><span>${esc(bride)}</span>`;
    $('gateKicker').innerHTML = `${esc(C.gateLine1)}<br>${esc(C.gateLine2)}`;
    setText('gateForever', C.gateForever);
    setText('gateHashtag', C.hashtag);
    setText('navNames', names);

    setText('filmLead', C.welcomeLead);
    setText('filmGroomName', groom);
    setText('filmGroomRelation', C.groomRelation);
    setText('filmGroomParents', C.groomParents);
    setText('filmBrideName', bride);
    setText('filmBrideRelation', C.brideRelation);
    setText('filmBrideParents', C.brideParents);

    setText('scratchYear', date.year);
    setText('scratchMonth', date.shortMonth);
    setText('scratchDay', date.day);
    setText('scratchDow', date.weekday);
    $('countdown').setAttribute('aria-label', `Countdown to ${date.day} ${date.month} ${date.year}`);

    setText('contactLabel', C.contactLabel);
    setText('rsvpNumber', C.rsvpNumber);
    let phone = String(C.rsvpNumber).replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    $('rsvpWhatsappLink').href = `https://wa.me/${phone}?text=${encodeURIComponent(C.rsvpWhatsappMessage || '')}`;
    setText('footerNamesDate', `${names} ✦ ${date.month} ${date.year}`);

    /* ribbon: 3 phrases × 4 = seamless loop at -50% */
    const phrases = [`${C.ribbonPlace} ✦ ${date.month} ${date.year}`, 'Two hearts, one celebration', C.hashtag];
    $('ribbonTrack').innerHTML = Array.from({ length: 12 }, (_, i) => `<span>${esc(phrases[i % 3])}</span>`).join('');

    /* function cards */
    const list = (C.functions || []).filter(f => f && f.enabled !== false);
    $('events').hidden = !list.length;
    const pin = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.7"/></svg>';
    $('eventStack').innerHTML = list.map((f, i) => `
      <article class="event-card${f.dark ? ' is-dark' : ''}" style="--slide-bg:${f.bg};--accent:${f.accent};z-index:${i + 1}">
        <span class="event-badge">Function ${String(i + 1).padStart(2, '0')}</span>
        <div class="event-media">
          <img class="is-loading" src="${esc(f.image)}" alt="${esc(f.title)} celebration" loading="lazy" decoding="async" width="700" height="500">
        </div>
        <div class="event-copy">
          <h3><span class="event-title-main">${esc(f.title)}</span>${f.subtitle ? `<span class="event-title-sub">${esc(f.subtitle)}</span>` : ''}</h3>
          <div class="event-when"><b>On ${esc(f.day)} | ${esc(f.date)}</b><b>${esc(f.time)}</b></div>
          <div class="event-divider" aria-hidden="true"><i></i><span>&#10086;</span><i></i></div>
          <div class="event-where">${pin}<b>${esc(f.venueArea)}</b></div>
        </div>
      </article>`).join('');

    $('eventStack').querySelectorAll('img').forEach(img => {
      const done = () => img.classList.remove('is-loading');
      if (img.complete) done(); else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
  }
  render();

  /* ======================= PETALS ======================= */
  const petals = $('petals');
  (() => {
    const colours = ['#c89c5a', '#a07a3d', '#7f1d1d', '#ffffff', '#c89c5a'];
    const count = isPhone ? 10 : 20;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.cssText =
        `--left:${Math.random() * 100}%;--size:${7 + Math.random() * 10}px;--petal-color:${colours[i % colours.length]};` +
        `--duration:${10 + Math.random() * 12}s;--delay:${-Math.random() * 18}s;--drift:${-90 + Math.random() * 180}px`;
      frag.appendChild(p);
    }
    petals.appendChild(frag);
    petals.classList.add('is-paused'); // hidden behind the gate — no need to animate yet
  })();

  /* ======================= FIREWORKS & CONFETTI ======================= */
  const fireworks = (() => {
    const canvas = $('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    const colours = ['#c89c5a', '#7f1d1d', '#c89c5a', '#ffffff', '#9b2424', '#0d9488'];
    const confettiColours = ['#c89c5a', '#7f1d1d', '#c89c5a', '#ffffff', '#9b2424', '#f5e9cf', '#9b2424'];
    const sparks = [], flakes = [];
    let raf = 0, W = 0, H = 0, sized = false;

    function size() {
      const dpr = Math.min(isPhone ? 1.5 : 2, devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sized = true;
    }
    addEventListener('resize', () => { sized = false; }, { passive: true });

    function start() {
      if (!sized) size();
      if (!raf) raf = requestAnimationFrame(draw);
    }

    function burst(x, y, colour) {
      const total = innerWidth < 650 ? 38 : 56;
      for (let i = 0; i < total; i++) {
        const a = Math.PI * 2 * i / total + Math.random() * .12;
        const s = 2.2 + Math.random() * 4.8;
        sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          g: .035 + Math.random() * .025, alpha: 1, decay: .012 + Math.random() * .012,
          colour, w: 1.4 + Math.random() * 2 });
      }
      start();
    }

    function confetti(x, y) {
      const total = reducedMotion ? 24 : (innerWidth < 650 ? 95 : 160);
      for (let i = 0; i < total; i++) {
        const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.2;
        const s = 4 + Math.random() * 9.5;
        flakes.push({ x: x + (Math.random() - .5) * 46, y: y + (Math.random() - .5) * 24,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .14 + Math.random() * .09,
          w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
          rot: Math.random() * Math.PI * 2, spin: (Math.random() - .5) * .3,
          alpha: 1, decay: .005 + Math.random() * .006, colour: confettiColours[i % confettiColours.length] });
      }
      start();
    }

    function draw() {
      const dpr = canvas.width / W;
      ctx.clearRect(0, 0, W, H);

      // solid (not 'lighter') so the sparks stand out on the light website background too
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.px = p.x; p.py = p.y;
        p.x += p.vx; p.y += p.vy;
        p.vx *= .988; p.vy = p.vy * .988 + p.g;
        p.alpha -= p.decay;
        if (p.alpha <= 0) { sparks[i] = sparks[sparks.length - 1]; sparks.pop(); continue; }
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.colour;
        ctx.globalAlpha = p.alpha;
        ctx.lineWidth = p.w;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.x += f.vx; f.y += f.vy;
        f.vx *= .986; f.vy = f.vy * .986 + f.g;
        f.rot += f.spin;
        f.alpha -= f.decay;
        if (f.alpha <= 0 || f.y > H + 80) { flakes[i] = flakes[flakes.length - 1]; flakes.pop(); continue; }
        // one setTransform per flake instead of save/translate/rotate/restore
        const c = Math.cos(f.rot), s = Math.sin(f.rot);
        ctx.setTransform(c * dpr, s * dpr, -s * dpr, c * dpr, f.x * dpr, f.y * dpr);
        ctx.globalAlpha = Math.min(1, f.alpha);
        ctx.fillStyle = f.colour;
        ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h * (.3 + Math.abs(c) * .7));
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;

      if (sparks.length || flakes.length) raf = requestAnimationFrame(draw);
      else { raf = 0; ctx.clearRect(0, 0, W, H); }
    }

    const status = $('fireworkStatus');
    $('fireworkButton').addEventListener('click', () => {
      status.textContent = 'Celebration fireworks launched';
      const n = reducedMotion ? 1 : (innerWidth < 650 ? 5 : 7);
      for (let i = 0; i < n; i++) {
        setTimeout(() => burst(innerWidth * (.14 + Math.random() * .72), innerHeight * (.12 + Math.random() * .45),
          colours[i % colours.length]), reducedMotion ? 0 : i * 150);
      }
      setTimeout(() => { status.textContent = ''; }, 1800);
    });

    return { burst, confetti, colours };
  })();

  /* ======================= MUSIC ======================= */
  const music = (() => {
    const audio = $('bgMusic');
    const btn = $('musicButton');
    const label = $('musicLabel');
    const VOLUME = .55;
    let wanted = false, fadeRaf = 0;

    function fade(to, done) {
      cancelAnimationFrame(fadeRaf);
      const from = audio.volume, t0 = performance.now(), dur = 700;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        audio.volume = Math.min(1, Math.max(0, from + (to - from) * k));
        if (k < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
      };
      fadeRaf = requestAnimationFrame(step);
    }
    function ui(on) {
      btn.classList.toggle('is-muted', !on);
      btn.classList.toggle('is-playing', on);
      btn.setAttribute('aria-pressed', String(on));
      label.textContent = on ? 'Music' : 'Music off';
    }
    function play() {
      wanted = true;
      audio.volume = 0;
      const p = audio.play();
      if (p && p.then) p.then(() => { ui(true); fade(VOLUME); }).catch(() => ui(false));
      else { ui(true); fade(VOLUME); }
    }
    function stop() {
      wanted = false;
      ui(false);
      fade(0, () => { if (!wanted) audio.pause(); });
    }
    btn.addEventListener('click', () => (audio.paused || !wanted ? play() : stop()));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) audio.pause();
      else if (wanted) audio.play().catch(() => {});
    });
    return { play, pause: () => audio.pause(), resume: () => { if (wanted) audio.play().catch(() => {}); } };
  })();

  /* ======================= FILM ======================= */
  const film = (() => {
    const section = $('film');
    const video = $('bannerVideo');
    const playBtn = $('bannerPlay');
    const playText = $('bannerPlayText');
    const bar = $('bannerProgress');
    const pct = $('bannerPercent');
    const hint = $('bannerScrollHint');
    const captions = [...section.querySelectorAll('.banner-caption')].map(el => ({
      el, start: parseFloat(el.dataset.start), end: parseFloat(el.dataset.end), on: false
    }));
    // The film is 30 fps and already the right pace — play at normal speed.
    const SPEED = 1;
    let raf = 0, lastPct = -1, preloaded = false;

    // Laptops / landscape screens get the sharp 1920x1080 widescreen film (no browser zoom = no blur);
    // phones get the vertical film, which already matches their screen.
    if (matchMedia('(min-aspect-ratio: 4/5)').matches && video.dataset.srcWide) {
      video.poster = video.dataset.posterWide;
      video.src = video.dataset.srcWide;
    }

    function setButton(text, hidden) {
      playText.textContent = text;
      playBtn.classList.toggle('is-hidden', hidden);
    }

    function update() {
      const d = video.duration || 0;
      const k = d ? video.currentTime / d : 0;
      bar.style.transform = `scaleY(${Math.max(k, .001)})`;
      const p = Math.round(k * 100);
      if (p !== lastPct) { lastPct = p; pct.textContent = String(p).padStart(2, '0'); }
      let any = false;
      for (const c of captions) {
        const on = k >= c.start && k <= c.end;
        any = any || on;
        if (on !== c.on) { c.on = on; c.el.classList.toggle('is-active', on); }
      }
      section.classList.toggle('has-caption', any);
    }
    // PERF: only animate while the film is actually playing (old version ran forever)
    function loop() { update(); raf = requestAnimationFrame(loop); }
    function stopLoop() { cancelAnimationFrame(raf); raf = 0; update(); }

    /* ---- Loading: download the whole film once, then play it from memory ----
       Partial streaming can freeze mid-scene on slow mobile data. Downloading the film
       in full (it starts the moment the guest taps Enter) guarantees smooth playback. */
    let waitingToStart = false, blobReady = false, fetchFailed = false, loadPct = 0;
    const filmUrl = video.getAttribute('src') && video.src;  // chosen file (wide or vertical)

    function setLoading(on) {
      playBtn.classList.toggle('is-loading', on);
      if (on) setButton(loadPct ? `Loading ${loadPct}%` : 'Loading', false);
    }
    function reallyPlay() {
      waitingToStart = false;
      setLoading(false);
      video.playbackRate = SPEED;
      const p = video.play();
      if (p && p.catch) p.catch(() => setButton('Play', false));
    }
    function start() {
      if (video.ended) video.currentTime = 0;
      hint.classList.remove('is-visible');
      warm();
      if (blobReady || fetchFailed) return reallyPlay();
      waitingToStart = true;
      setLoading(true);
    }

    function warm() {
      if (preloaded) return;
      preloaded = true;
      if (!window.fetch || !window.ReadableStream) { fetchFailed = true; video.preload = 'auto'; return; }
      video.removeAttribute('src'); video.load();   // don't download twice
      fetch(filmUrl).then(async res => {
        if (!res.ok || !res.body) throw new Error('fetch');
        const total = +res.headers.get('content-length') || 0;
        const reader = res.body.getReader(), parts = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value); got += value.length;
          if (total) {
            const p = Math.min(99, Math.floor(got / total * 100));
            if (p !== loadPct) { loadPct = p; if (waitingToStart) setLoading(true); }
          }
        }
        video.src = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' }));
        video.load();
        blobReady = true;
        if (waitingToStart) video.addEventListener('canplay', reallyPlay, { once: true });
      }).catch(() => {
        // e.g. opened from a file on disk — fall back to normal streaming
        fetchFailed = true;
        video.src = filmUrl; video.preload = 'auto'; video.load();
        if (waitingToStart) reallyPlay();
      });
    }

    video.addEventListener('playing', () => { setLoading(false); setButton('', true); });

    // Tap anywhere on the film (video, "Tap to play our film" label, captions) to play / pause
    section.addEventListener('click', e => {
      if (e.target.closest('#bannerScrollHint')) return;
      if (waitingToStart) return;
      if (video.paused || video.ended) start(); else video.pause();
    });

    video.addEventListener('play', () => {
      video.playbackRate = SPEED;
      body.classList.add('film-playing');
      section.classList.add('is-playing');
      setButton('', true);
      if (!raf) loop();
    });
    video.addEventListener('pause', () => {
      stopLoop();
      body.classList.remove('film-playing');
      if (video.ended) return;
      section.classList.remove('is-playing');
      if (!waitingToStart) setButton('Continue', false);
    });
    video.addEventListener('ended', () => {
      stopLoop();
      section.classList.remove('is-playing');
      setButton('', true);
      hint.classList.add('is-visible');
    });
    video.addEventListener('loadedmetadata', update);

    hint.addEventListener('click', () => {
      const next = section.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Pause the film when it is scrolled fully out of view (frees the GPU for the cards)
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && !video.paused) video.pause();
    }, { threshold: 0 }).observe(section);

    return { warm, start };
  })();

  /* ======================= ENTRY GATE ======================= */
  (() => {
    const gate = $('enterGate');
    $('enterButton').addEventListener('click', () => {
      gate.classList.add('is-open');
      body.classList.remove('is-locked');
      body.classList.add('has-entered');
      petals.classList.remove('is-paused');
      music.play();
      film.warm();
      window.scrollTo({ top: 0, behavior: 'instant' }); // always open on the film
      setTimeout(() => {
        gate.setAttribute('aria-hidden', 'true');
        gate.style.display = 'none';
      }, 900);
    }, { once: true });
  })();

  document.addEventListener('visibilitychange', () => {
    if (body.classList.contains('has-entered')) petals.classList.toggle('is-paused', document.hidden);
  });

  /* ======================= REVEAL ON SCROLL ======================= */
  (() => {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }, { threshold: .14 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  })();

  /* ======================= COUNTDOWN ======================= */
  (() => {
    const els = ['days', 'hours', 'minutes', 'seconds'].map($);
    const target = new Date(C.countdownIso).getTime();
    const last = [];
    function tick() {
      const t = Math.max(0, target - Date.now());
      const v = [Math.floor(t / 864e5), Math.floor(t % 864e5 / 36e5), Math.floor(t % 36e5 / 6e4), Math.floor(t % 6e4 / 1e3)];
      v.forEach((n, i) => { if (n !== last[i]) { last[i] = n; els[i].textContent = String(n).padStart(2, '0'); } });
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ======================= HEART SCRATCH CARD ======================= */
  (() => {
    const stage = $('scratchStage');
    const wrap = $('scratchWrap');
    const canvas = $('scratchCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let w = 0, h = 0, rect = null, scratching = false, lastX = null, lastY = null;
    let lastCheck = 0, lastSpark = 0;

    function drawCover() {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      if (!w || !h) return;
      // PERF: 1.5x is plenty for a scratch layer and halves the pixels getImageData has to read
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#9b2424');
      g.addColorStop(.35, '#7f1d1d');
      g.addColorStop(.62, '#b31217');
      g.addColorStop(1, '#5c1414');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = .2;
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = i % 2 ? '#c89c5a' : '#fff';
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fffdf8';
      ctx.font = `700 ${Math.max(11, w * .032)}px Cinzel, Marcellus, Georgia`;
      ctx.fillText('SCRATCH TO REVEAL', w / 2, h * .42 - 10);
      ctx.fillStyle = '#f5e9cf';
      ctx.font = `600 ${Math.max(9, w * .022)}px Cinzel, Marcellus, Georgia`;
      ctx.fillText('✦ A DATE MADE FOR CELEBRATION ✦', w / 2, h * .42 + 16);

      stage.classList.remove('is-revealed');
      wrap.classList.remove('is-revealed');
      lastX = lastY = null;
    }

    // PERF: map pointer → canvas using one cached rect (old code walked every
    // ancestor's computed transform on every pointermove).
    const toCanvas = (cx, cy) => ({ x: (cx - rect.left) * (w / rect.width), y: (cy - rect.top) * (h / rect.height) });
    const radius = () => Math.max(38, w * .105);

    function scratchTo(x, y) {
      const r = radius();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.lineWidth = r * 2;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = r * .45;
      ctx.beginPath();
      if (lastX === null) { ctx.moveTo(x, y); ctx.lineTo(x + .01, y + .01); }
      else { ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.shadowBlur = 0;
      lastX = x; lastY = y;
    }

    function check() {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 256) { total++; if (data[i] < 30) clear++; }
      if (total && clear / total > .28 && !stage.classList.contains('is-revealed')) {
        stage.classList.add('is-revealed');
        wrap.classList.add('is-revealed');
        scratching = false;
        const r = stage.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        fireworks.confetti(cx, cy);
        setTimeout(() => fireworks.confetti(cx - r.width * .32, cy + 20), 160);
        setTimeout(() => fireworks.confetti(cx + r.width * .32, cy + 20), 300);
      }
    }

    function sparkle() {
      if (reducedMotion) return;
      const now = performance.now();
      if (now - lastSpark < 430) return;
      lastSpark = now;
      const x = rect.left + rect.width * (Math.random() < .5 ? -.12 - Math.random() * .18 : 1.12 + Math.random() * .18);
      const y = rect.top + rect.height * (.05 + Math.random() * .55);
      fireworks.burst(Math.min(innerWidth - 10, Math.max(10, x)), Math.max(40, y),
        fireworks.colours[Math.floor(Math.random() * fireworks.colours.length)]);
    }

    function move(e) {
      if (!scratching) return;
      const pts = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const p of (pts.length ? pts : [e])) { const c = toCanvas(p.clientX, p.clientY); scratchTo(c.x, c.y); }
      sparkle();
      // PERF: read pixels at most ~6×/sec instead of every frame
      const now = performance.now();
      if (now - lastCheck > 160) { lastCheck = now; check(); }
    }

    function end() {
      if (!scratching) return;
      scratching = false;
      lastX = lastY = null;
      check();
    }

    canvas.addEventListener('pointerdown', e => {
      if (stage.classList.contains('is-revealed')) return;
      scratching = true;
      rect = canvas.getBoundingClientRect();
      lastX = lastY = null;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      move(e);
    });
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    $('scratchReset').addEventListener('click', drawCover);

    let lastW = 0;
    new ResizeObserver(() => { if (canvas.offsetWidth !== lastW) { lastW = canvas.offsetWidth; drawCover(); } }).observe(stage);
    // Redraw once the Cinzel font is ready so the cover text uses it
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!stage.classList.contains('is-revealed')) drawCover(); });
  })();
})();
