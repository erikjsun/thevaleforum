/* ==========================================================================
   THE VALE FORUM 2026
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG — the three things you will actually want to change
   --------------------------------------------------------------------------

   FORM_URL / FORM_SHORT
     Two spellings of the same published form, because they do different jobs.

     FORM_URL is the canonical link and is what the embed uses — the iframe
     needs "?embedded=true" appended, and forms.gle drops query parameters
     when it redirects, so the short link cannot carry it.

     FORM_SHORT is the shareable one, used for the "open in a new tab" link
     and for anything you paste into Slack or an email.

     To re-derive either: open the form → Send → the link (🔗) tab. The box
     gives the canonical link, and ticking "Shorten URL" gives the forms.gle
     one.

   OPENS_AT / CLOSES_AT
     Application window. The whole Apply section (countdown, button, copy)
     switches itself between three states off these two dates, so you do not
     have to redeploy on the 15th or the 30th.
---------------------------------------------------------------------------- */

const FORM_URL   = "https://docs.google.com/forms/d/e/1FAIpQLScMXuIlctrGVdsHcPNLDpRCClSSdnHjmQB_gsb0YgoPVQmKLw/viewform";
const FORM_SHORT = "https://forms.gle/nGhcSqWJtoXxDkTbA";

const OPENS_AT  = new Date("2026-08-17T09:00:00+02:00");
const CLOSES_AT = new Date("2026-08-30T23:59:59+02:00");

const CONTACT = "info@thevale.eu";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ==========================================================================
   1 · Rising embers
   The Symposium has snow falling. The Forum has sparks going up.
   ========================================================================== */
(function embers() {
  const cv = $("#embers");
  if (!cv || reduceMotion) { if (cv) cv.remove(); return; }

  const ctx = cv.getContext("2d");
  let w = 0, h = 0, dpr = 1, parts = [], raf = null, gust = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function spawn(seeded) {
    return {
      x: rand(0, w),
      y: seeded ? rand(0, h) : h + rand(0, 60),
      r: rand(0.6, 2.1),
      vy: rand(0.18, 0.62),
      drift: rand(-0.22, 0.22),
      phase: rand(0, Math.PI * 2),
      wob: rand(0.004, 0.014),
      life: rand(0.35, 1),
      hue: rand(20, 42)
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(90, Math.round((w * h) / 26000));
    parts = Array.from({ length: target }, () => spawn(true));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    gust *= 0.96;
    for (const p of parts) {
      p.phase += p.wob;
      p.y -= p.vy * (1 + gust);
      p.x += p.drift + Math.sin(p.phase) * 0.35;

      // Fade out over the top two thirds of the screen
      const alpha = Math.max(0, Math.min(1, (p.y / h) * 1.5)) * p.life * 0.75;
      if (p.y < -20 || p.x < -40 || p.x > w + 40) Object.assign(p, spawn(false));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, ${58 + p.r * 6}%, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${alpha * 0.8})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) raf = requestAnimationFrame(frame); }
  function stop()  { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  resize();
  start();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

  // Poke the sun, feed the fire.
  const sun = $("#sun");
  if (sun) sun.addEventListener("click", () => { gust = 3.4; });
})();

/* ==========================================================================
   2 · Reveal on scroll
   ========================================================================== */
(function reveals() {
  const groups = $$("[data-reveal-group]");
  groups.forEach(g => Array.from(g.children).forEach((c, i) => c.style.setProperty("--i", i)));

  const targets = $$("[data-reveal], [data-reveal-group], .showcase-figure");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(t => t.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  targets.forEach(t => io.observe(t));
})();

/* ==========================================================================
   3 · The invitation — one line at a time
   ========================================================================== */
(function steps() {
  const steps = $$(".q-step");
  if (!steps.length) return;
  if (!("IntersectionObserver" in window)) { steps.forEach(s => s.classList.add("is-live")); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle("is-live", e.isIntersecting);
  }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });
  steps.forEach(s => io.observe(s));
})();

/* ==========================================================================
   4 · Header + side rail
   ========================================================================== */
(function chrome() {
  const head = $("#head");
  const onScroll = () => head && head.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const links = $$(".rail a");
  const sections = links
    .map(a => ({ a, el: document.querySelector(a.getAttribute("href")) }))
    .filter(s => s.el);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
    let current = null;
    for (const s of sections) if (visible.has(s.el)) { current = s; break; }
    links.forEach(a => a.removeAttribute("aria-current"));
    if (current) current.a.setAttribute("aria-current", "true");
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
  sections.forEach(s => io.observe(s.el));
})();

/* ==========================================================================
   5 · Dialogs
   ========================================================================== */
(function dialogs() {
  // showModal() scrolls the page to the top when body is itself a scroll
  // container (we set overflow-x: hidden). Pin the body while a panel is
  // open — fixes the jump and stops the page scrolling behind the drawer.
  let parked = 0;

  function lock() {
    parked = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${parked}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
  }
  function unlock() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    // instant, or smooth scrolling animates the restore
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, parked);
    document.documentElement.style.scrollBehavior = prev;
  }

  $$("[data-dlg]").forEach(btn => {
    btn.addEventListener("click", () => {
      const d = document.getElementById(btn.dataset.dlg);
      if (!d) return;
      lock();
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", "");
      const body = $(".dlg-body", d);
      if (body) body.scrollTop = 0;
    });
  });

  $$(".dlg").forEach(d => {
    const x = $(".dlg-x", d);
    if (x) x.addEventListener("click", () => d.close());
    // Click outside the panel to dismiss
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    // Covers the close button, the backdrop and Escape in one place
    d.addEventListener("close", unlock);
  });
})();

/* ==========================================================================
   6 · The arc — two threads, eight years
   ========================================================================== */
(function arc() {
  const stage = $(".arc-stage");
  const card  = $("#arc-card");
  if (!stage || !card) return;

  const nodes = $$(".nd", stage);
  const yr = $(".arc-card-yr", card);
  const ti = $(".arc-card-t", card);
  const de = $(".arc-card-d", card);
  const forum = nodes[nodes.length - 1];

  // Draw the threads in once the section is on screen
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { stage.classList.add("is-drawn"); io.disconnect(); }
    }, { threshold: 0.18 });
    io.observe(stage);
  } else {
    stage.classList.add("is-drawn");
  }

  function show(n) {
    if (!n) return;
    const kind = n.classList.contains("nd-sym") ? "sym"
               : n.classList.contains("nd-forum") ? "forum"
               : n.classList.contains("nd-mark") ? "mark" : "course";
    const label = n.getAttribute("aria-label") || "";
    const [head, ...rest] = label.split(" — ");
    const [title, detail] = rest.join(" — ").split(/\.\s(?=[^.]*$)/);

    yr.textContent = head;
    ti.textContent = title || "";
    de.textContent = (detail || "").replace(/\.$/, "");

    card.classList.remove("is-sym", "is-forum", "is-mark");
    if (kind !== "course") card.classList.add("is-" + kind);
    card.classList.add("is-live");

    nodes.forEach(o => o.classList.toggle("is-on", o === n));
    stage.classList.remove("dim-course", "dim-sym", "lift-course", "lift-sym");
    if (kind === "course") stage.classList.add("dim-sym", "lift-course");
    if (kind === "sym")    stage.classList.add("dim-course", "lift-sym");
  }

  function rest() {
    stage.classList.remove("dim-course", "dim-sym", "lift-course", "lift-sym");
    nodes.forEach(o => o.classList.remove("is-on"));
    show(forum);
    nodes.forEach(o => o.classList.remove("is-on"));
  }

  nodes.forEach(n => {
    n.addEventListener("mouseenter", () => show(n));
    n.addEventListener("focus", () => show(n));
    n.addEventListener("click", () => show(n));
    n.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(n); }
    });
  });
  stage.addEventListener("mouseleave", rest);

  // The Forum is what the card says when nothing is hovered
  rest();

  /* Drag to pan the timeline, for anyone without a trackpad */
  const scroller = $("#arc-scroll");
  if (scroller) {
    let down = false, sx = 0, sl = 0, moved = false;
    scroller.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;      // native touch scroll is better
      down = true; moved = false; sx = e.clientX; sl = scroller.scrollLeft;
    });
    scroller.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 3) moved = true;
      scroller.scrollLeft = sl - dx;
    });
    const up = () => { down = false; };
    scroller.addEventListener("pointerup", up);
    scroller.addEventListener("pointerleave", up);
    scroller.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
  }
})();

/* ==========================================================================
   7 · Venue carousel
   Native scroll-snap does the moving; this only adds buttons, dots and
   arrow keys on top, so it still works if the JS never runs.
   ========================================================================== */
(function carousel() {
  const track = $("#venue-track");
  const dots  = $("#venue-dots");
  if (!track) return;

  const slides = $$(".slide", track);
  if (!slides.length) return;

  slides.forEach((_, i) => {
    const d = document.createElement("i");
    if (!i) d.className = "is-on";
    dots && dots.appendChild(d);
  });

  const go = (dir) => {
    const step = slides[0].getBoundingClientRect().width + 16;
    track.scrollBy({ left: dir * step, behavior: reduceMotion ? "auto" : "smooth" });
  };

  $$(".carousel-btn").forEach(b =>
    b.addEventListener("click", () => go(Number(b.dataset.dir)))
  );

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); go(-1); }
  });

  // Mark the slide nearest the centre of the track
  let tick = null;
  track.addEventListener("scroll", () => {
    if (tick) return;
    tick = requestAnimationFrame(() => {
      tick = null;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      slides.forEach((s, i) => {
        const c = s.offsetLeft + s.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (dots) Array.from(dots.children).forEach((d, i) => d.classList.toggle("is-on", i === best));
    });
  }, { passive: true });
})();

/* ==========================================================================
   8 · Apply — countdown, state machine, form embed
   ========================================================================== */
(function apply() {
  const wrap    = $("#form-wrap");
  const btn     = $("#apply-btn");
  const alt     = $("#form-alt");
  const link    = $("#form-link");
  const copy    = $("#apply-copy");
  const count   = $("#count");
  const label   = $("#count-label");
  const status  = $("#apply-status");
  const cells   = { d: $("#c-d"), h: $("#c-h"), m: $("#c-m"), s: $("#c-s") };

  const embedUrl = FORM_URL + (FORM_URL.includes("?") ? "&" : "?") + "embedded=true";
  const remind = `mailto:${CONTACT}?subject=${encodeURIComponent("Remind me – The VALE Forum 2026")}` +
                 `&body=${encodeURIComponent("Hi! Please let me know the moment applications for the Forum open.")}`;
  const late = `mailto:${CONTACT}?subject=${encodeURIComponent("Late application – The VALE Forum 2026")}`;

  function state() {
    const now = new Date();
    if (now < OPENS_AT)  return "before";
    if (now > CLOSES_AT) return "closed";
    return "open";
  }

  /* --- rebuild the control, so re-rendering across a date boundary is safe --- */
  function setControl(kind, text, href) {
    const old = $("#apply-btn");
    const el = document.createElement(kind === "link" ? "a" : "button");
    el.id = "apply-btn";
    el.className = "btn btn-xl";
    el.textContent = text;
    if (kind === "link") el.href = href;
    else el.type = "button";
    if (old) old.replaceWith(el);
    else wrap.prepend(el);
    return el;
  }

  function loadForm() {
    if ($(".form-frame", wrap)) return;
    const frame = document.createElement("iframe");
    frame.className = "form-frame";
    frame.src = embedUrl;
    frame.title = "Application form – The VALE Forum 2026";
    frame.loading = "lazy";
    frame.setAttribute("allow", "clipboard-write");
    wrap.prepend(frame);
    const live = $("#apply-btn");
    if (live) live.remove();
    if (alt) alt.classList.remove("is-hidden");
    frame.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  /* --- countdown --- */
  let target = null;
  function tick() {
    if (!target) return;
    let diff = Math.max(0, target - new Date());
    const s = Math.floor(diff / 1000);
    const set = (el, v) => { if (el) el.textContent = String(v).padStart(2, "0"); };
    set(cells.d, Math.floor(s / 86400));
    set(cells.h, Math.floor((s % 86400) / 3600));
    set(cells.m, Math.floor((s % 3600) / 60));
    set(cells.s, s % 60);
    // Rolled past a boundary while the page was open — re-render.
    if (diff === 0) { target = null; render(); }
  }

  /* The pill above the countdown. `live` is the only state that gets the warm
     treatment — the rest read as information, not as an invitation. */
  function setStatus(text, live) {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("is-live", live);
  }

  function render() {
    const st = state();

    if (link) link.href = FORM_SHORT;

    if (st === "before") {
      setStatus("APPLICATIONS OPEN MONDAY", false);
      if (label) label.textContent = "UNTIL APPLICATIONS OPEN";
      if (count) count.classList.remove("is-hidden");
      target = OPENS_AT;
      if (copy) {
        copy.innerHTML = "Applications open on <strong>Monday 17 August</strong> and close on " +
          "<strong>30 August 2026</strong>. Fifty places, and we read every application — " +
          "we are far more interested in what you are curious about than in your CV.";
      }
      setControl("link", "Remind me when it opens", remind);
      if (alt) alt.classList.add("is-hidden");

    } else if (st === "open") {
      setStatus("APPLICATIONS ARE OPEN NOW", true);
      // "UNTIL APPLICATIONS CLOSE", not "LEFT TO APPLY" — the latter reads as time
      // remaining before you may apply, which is the opposite of what it means.
      if (label) label.textContent = "UNTIL APPLICATIONS CLOSE";
      if (count) count.classList.remove("is-hidden");
      target = CLOSES_AT;
      if (copy) {
        copy.innerHTML = "Applications are <strong>open now</strong> and close on " +
          "<strong>30 August 2026</strong>. Take your time with it — we read every one, " +
          "and we are far more interested in what you are curious about than in your CV.";
      }
      setControl("button", "Open the application form").addEventListener("click", loadForm);
      // Offer the new-tab route up front too — some people would rather not use an embed,
      // and it is the escape hatch if Google's iframe ever refuses to render.
      if (alt) alt.classList.remove("is-hidden");

    } else {
      /* The formal window is over, but the form itself stays open — we would far rather
         read a late application than turn someone away at the door. */
      setStatus("LATE APPLICATIONS STILL WELCOME", true);
      if (label) label.textContent = "THE FORM IS STILL OPEN";
      if (count) count.classList.add("is-hidden");
      target = null;
      if (copy) {
        copy.innerHTML = "The deadline was <strong>30 August 2026</strong>, but the form is " +
          "still open. Places occasionally free up, and we would rather hear from you late " +
          "than not at all — send it in and we will read it. If you would rather write first, " +
          "we are at <a href=\"" + late + "\">" + CONTACT + "</a>.";
      }
      setControl("button", "Open the application form").addEventListener("click", loadForm);
      if (alt) alt.classList.remove("is-hidden");
    }

    tick();
  }

  if (wrap && btn) render();
  setInterval(tick, 1000);

  /* --- every other Apply button just brings you here --- */
  $$(".js-apply").forEach(b => {
    if (b.id === "apply-btn") return;
    b.addEventListener("click", () => {
      const t = $("#apply");
      if (t) t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
})();

/* ==========================================================================
   Imagine — carousel (arrows on PC, swipe on mobile)
   ========================================================================== */
(function imagineCarousel() {
  const track = $(".imagine-track");
  if (!track) return;
  const cards = $$(".imagine-card", track);
  if (!cards.length) return;
  const prev = $(".imagine-prev");
  const next = $(".imagine-next");
  const dotsWrap = $(".imagine-dots");

  const dots = dotsWrap ? cards.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "imagine-dot";
    b.setAttribute("aria-label", "Go to item " + (i + 1));
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
    return b;
  }) : [];

  // Card whose centre is nearest the track's centre.
  function current() {
    const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
    let best = 0, bd = Infinity;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  function go(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    const c = cards[i];
    const tr = track.getBoundingClientRect();
    const cr = c.getBoundingClientRect();
    const delta = (cr.left + cr.width / 2) - (tr.left + tr.width / 2);
    track.scrollTo({ left: track.scrollLeft + delta, behavior: reduceMotion ? "auto" : "smooth" });
  }

  // Side padding so any card — including the first and last — can sit
  // centred; without it, cards narrower than the track never reach centre.
  function pad() {
    const cw = cards[0].getBoundingClientRect().width;
    const p = Math.max(0, (track.clientWidth - cw) / 2);
    track.style.paddingLeft = p + "px";
    track.style.paddingRight = p + "px";
  }

  let raf = 0;
  function update() {
    const i = current();
    dots.forEach((d, j) => d.classList.toggle("is-on", j === i));
  }

  const n = cards.length;
  // Wrap around, so the ends loop infinitely.
  if (prev) prev.addEventListener("click", () => go((current() - 1 + n) % n));
  if (next) next.addEventListener("click", () => go((current() + 1) % n));
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener("resize", () => { pad(); update(); });
  pad();
  update();
})();
