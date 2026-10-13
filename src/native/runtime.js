/*
 * Harborview Law native interaction runtime.
 * Replaces jQuery + webflow.js (2.4MB). Plays the site's original Webflow
 * IX2 interactions from a compiled data blob (window.__IX, prepended by
 * scripts/build-native.mjs), and reimplements the three Webflow components
 * the site uses: navbar collapse, testimonial sliders, Lottie graphics.
 * The compiled data preserves the original timings/easings exactly, and the
 * captured inline styles on [data-w-id] elements remain the initial states.
 */
(function () {
  "use strict";
  var D = window.__IX || { e: [], l: [] };

  /* ---------- easing map (Webflow IX2 names -> CSS) ---------- */
  var EASE = {
    "": "linear",
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    inSine: "cubic-bezier(.47,0,.745,.715)",
    outSine: "cubic-bezier(.39,.575,.565,1)",
    inOutSine: "cubic-bezier(.445,.05,.55,.95)",
    inQuad: "cubic-bezier(.55,.085,.68,.53)",
    outQuad: "cubic-bezier(.25,.46,.45,.94)",
    inOutQuad: "cubic-bezier(.455,.03,.515,.955)",
    inCubic: "cubic-bezier(.55,.055,.675,.19)",
    outCubic: "cubic-bezier(.215,.61,.355,1)",
    inOutCubic: "cubic-bezier(.645,.045,.355,1)",
    inQuart: "cubic-bezier(.895,.03,.685,.22)",
    outQuart: "cubic-bezier(.165,.84,.44,1)",
    inOutQuart: "cubic-bezier(.77,0,.175,1)",
    inQuint: "cubic-bezier(.755,.05,.855,.06)",
    outQuint: "cubic-bezier(.23,1,.32,1)",
    inOutQuint: "cubic-bezier(.86,0,.07,1)",
    inExpo: "cubic-bezier(.95,.05,.795,.035)",
    outExpo: "cubic-bezier(.19,1,.22,1)",
    inOutExpo: "cubic-bezier(1,0,0,1)",
    inCirc: "cubic-bezier(.6,.04,.98,.335)",
    outCirc: "cubic-bezier(.075,.82,.165,1)",
    inOutCirc: "cubic-bezier(.785,.135,.15,.86)",
  };
  function cssEase(e) { return EASE[e] || "ease"; }

  /* ---------- per-element transform state ---------- */
  var tstate = new WeakMap();
  var T_RE = {
    move: /translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/,
    scale: /scale3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/,
    rx: /rotateX\(([^)]+)\)/,
    ry: /rotateY\(([^)]+)\)/,
    rz: /rotateZ\(([^)]+)\)/,
  };
  function getState(el) {
    var s = tstate.get(el);
    if (!s) {
      s = { x: "0px", y: "0px", z: "0px", sx: 1, sy: 1, rx: "0deg", ry: "0deg", rz: "0deg" };
      var t = el.style.transform || "";
      var m;
      if ((m = t.match(T_RE.move))) { s.x = m[1].trim(); s.y = m[2].trim(); s.z = m[3].trim(); }
      if ((m = t.match(T_RE.scale))) { s.sx = parseFloat(m[1]); s.sy = parseFloat(m[2]); }
      if ((m = t.match(T_RE.rx))) s.rx = m[1].trim();
      if ((m = t.match(T_RE.ry))) s.ry = m[1].trim();
      if ((m = t.match(T_RE.rz))) s.rz = m[1].trim();
      tstate.set(el, s);
    }
    return s;
  }
  function transformString(s) {
    return (
      "translate3d(" + s.x + ", " + s.y + ", " + s.z + ") scale3d(" +
      s.sx + ", " + s.sy + ", 1) rotateX(" + s.rx + ") rotateY(" + s.ry +
      ") rotateZ(" + s.rz + ")"
    );
  }
  function unit(v, u) {
    if (v === undefined || v === null) return null;
    return v + ((u && u === u.toLowerCase()) ? u : "px");
  }

  /* ---------- transition bookkeeping ---------- */
  var trans = new WeakMap(); // el -> { prop: "dur ease delay" }
  function setTransition(el, props, dur, ease, instant) {
    var map = trans.get(el) || {};
    props.forEach(function (p) {
      map[p] = instant ? null : p + " " + dur + "ms " + cssEase(ease);
    });
    trans.set(el, map);
    var parts = [];
    for (var k in map) if (map[k]) parts.push(map[k]);
    el.style.transition = parts.join(", ");
    if (instant) void el.offsetWidth; // flush so the next write transitions
  }

  /* ---------- action application ---------- */
  function rgba(c) {
    return "rgba(" + (c.rValue || 0) + ", " + (c.gValue || 0) + ", " + (c.bValue || 0) + ", " +
      (c.aValue === undefined ? 1 : c.aValue) + ")";
  }
  function applyItem(item, targets, instant) {
    var c = item.v;
    targets.forEach(function (el) {
      switch (item.t) {
        case "op":
          setTransition(el, ["opacity"], item.u, item.e, instant);
          el.style.opacity = String(c.value);
          break;
        case "mv": {
          var s = getState(el);
          if (c.xValue !== undefined) s.x = unit(c.xValue, c.xUnit);
          if (c.yValue !== undefined) s.y = unit(c.yValue, c.yUnit);
          if (c.zValue !== undefined) s.z = unit(c.zValue, c.zUnit);
          setTransition(el, ["transform"], item.u, item.e, instant);
          el.style.transform = transformString(s);
          el.style.willChange = "transform";
          break;
        }
        case "sc": {
          var s2 = getState(el);
          if (c.xValue !== undefined) s2.sx = c.xValue;
          if (c.yValue !== undefined) s2.sy = c.yValue;
          setTransition(el, ["transform"], item.u, item.e, instant);
          el.style.transform = transformString(s2);
          break;
        }
        case "rt": {
          var s3 = getState(el);
          if (c.xValue !== undefined) s3.rx = unit(c.xValue, "deg");
          if (c.yValue !== undefined) s3.ry = unit(c.yValue, "deg");
          if (c.zValue !== undefined) s3.rz = unit(c.zValue, "deg");
          setTransition(el, ["transform"], item.u, item.e, instant);
          el.style.transform = transformString(s3);
          break;
        }
        case "sz": {
          var props = [];
          if (c.widthValue !== undefined) props.push("width");
          if (c.heightValue !== undefined) props.push("height");
          setTransition(el, props, item.u, item.e, instant);
          if (c.widthValue !== undefined)
            el.style.width = c.widthUnit === "AUTO" ? "auto" : unit(c.widthValue, c.widthUnit);
          if (c.heightValue !== undefined)
            el.style.height = c.heightUnit === "AUTO" ? "auto" : unit(c.heightValue, c.heightUnit);
          break;
        }
        case "bc":
          setTransition(el, ["border-color"], item.u, item.e, instant);
          el.style.borderColor = rgba(c);
          break;
        case "tc":
          setTransition(el, ["color"], item.u, item.e, instant);
          el.style.color = rgba(c);
          break;
        case "dp":
          el.style.display = c.value;
          break;
        case "lt": {
          targetsLottie(el);
          break;
        }
      }
    });
  }
  function targetsLottie(el) {
    var nodes = el.matches && el.matches("[data-animation-type=lottie]")
      ? [el]
      : el.querySelectorAll("[data-animation-type=lottie]");
    Array.prototype.forEach.call(nodes, function (n) {
      var a = n.__lottie;
      if (a) a.goToAndPlay(0, true);
    });
  }

  /* ---------- target resolution ---------- */
  function resolve(item, eventEl) {
    if (item.s) {
      if (item.s.charAt(0) === "c") {
        var sel = item.s.slice(2);
        return Array.prototype.slice.call(eventEl.querySelectorAll(sel));
      }
      return Array.prototype.slice.call(document.querySelectorAll(item.s.slice(2)));
    }
    return [eventEl];
  }

  /* ---------- action list playback ---------- */
  var timers = new WeakMap(); // eventEl -> [timeout ids] for interruptible lists
  function clearTimers(el) {
    (timers.get(el) || []).forEach(clearTimeout);
    timers.set(el, []);
  }
  function play(list, eventEl, skipInitial) {
    clearTimers(eventEl);
    var ids = timers.get(eventEl) || [];
    var groups = list.g;
    var start = 0;
    var from = 0;
    if (list.f) {
      if (!skipInitial) {
        groups[0].forEach(function (item) {
          applyItem(item, resolve(item, eventEl), true);
        });
      }
      from = 1;
    }
    for (var gi = from; gi < groups.length; gi++) {
      (function (group, offset) {
        var groupEnd = 0;
        group.forEach(function (item) {
          var at = offset + (item.d || 0);
          groupEnd = Math.max(groupEnd, (item.d || 0) + (item.u || 0));
          var id = setTimeout(function () {
            applyItem(item, resolve(item, eventEl), (item.u || 0) === 0);
          }, at);
          ids.push(id);
        });
        start = offset + groupEnd;
      })(groups[gi], start);
    }
    timers.set(eventEl, ids);
  }

  /* ---------- media query gate ---------- */
  function mqOk(flag) {
    if (!flag) return true; // applies to all breakpoints
    if (flag === "m") return window.matchMedia("(min-width: 992px)").matches;
    return window.matchMedia("(max-width: 991px)").matches; // "s": medium/small/tiny
  }

  /* ---------- wire events ---------- */
  var navHooks = { open: [], close: [] };
  function wire() {
    var observers = {}; // offset -> IntersectionObserver
    var pending = new WeakMap(); // element -> [event records] for scroll
    D.e.forEach(function (ev) {
      // ev: [wfid, type, listIndex, offset, mq]
      var wfid = ev[0], type = ev[1], list = D.l[ev[2]], off = ev[3] || 0, mq = ev[4];
      var els = document.querySelectorAll('[data-w-id="' + wfid + '"]');
      if (!els.length || !list) return;
      Array.prototype.forEach.call(els, function (el) {
        if (type === "siv") {
          if (!observers[off]) {
            observers[off] = new IntersectionObserver(
              function (entries) {
                entries.forEach(function (entry) {
                  if (!entry.isIntersecting) return;
                  var evs = pending.get(entry.target) || [];
                  var allPlayed = true;
                  evs.forEach(function (rec) {
                    if (rec.played) return;
                    if (!mqOk(rec.mq)) { allPlayed = false; return; }
                    rec.played = true;
                    play(rec.list, entry.target, true);
                  });
                  if (allPlayed && entry.target.__ixObs)
                    entry.target.__ixObs.unobserve(entry.target);
                });
              },
              { rootMargin: "0px 0px -" + off + "% 0px", threshold: 0 }
            );
          }
          var arr = pending.get(el) || [];
          arr.push({ list: list, mq: mq, played: false });
          pending.set(el, arr);
          el.__ixObs = observers[off];
          observers[off].observe(el);
        } else if (type === "mo") {
          el.addEventListener("mouseenter", function () {
            if (mqOk(mq)) play(list, el, true);
          });
        } else if (type === "mu") {
          el.addEventListener("mouseleave", function () {
            if (mqOk(mq)) play(list, el, true);
          });
        } else if (type === "no") {
          navHooks.open.push(function (navEl) {
            if (navEl.getAttribute("data-w-id") === wfid && mqOk(mq)) play(list, navEl, true);
          });
        } else if (type === "nc") {
          navHooks.close.push(function (navEl) {
            if (navEl.getAttribute("data-w-id") === wfid && mqOk(mq)) play(list, navEl, true);
          });
        }
      });
    });
  }

  /* ---------- navbar (replaces Webflow w-nav plugin) ---------- */
  function initNav() {
    Array.prototype.forEach.call(document.querySelectorAll(".w-nav"), function (nav) {
      var button = nav.querySelector(".w-nav-button");
      var menu = nav.querySelector(".w-nav-menu");
      if (!button || !menu) return;
      var overlay = document.createElement("div");
      overlay.className = "w-nav-overlay";
      nav.appendChild(overlay);
      var parent = menu.parentNode;
      var next = menu.nextSibling;
      var open = false;

      button.setAttribute("role", "button");
      button.setAttribute("tabindex", "0");
      button.setAttribute("aria-label", "menu");
      button.setAttribute("aria-expanded", "false");

      function collapsed() {
        // data-collapse="medium" -> collapsed at <=991px
        return window.matchMedia("(max-width: 991px)").matches;
      }
      function doOpen() {
        if (open) return;
        open = true;
        overlay.appendChild(menu);
        overlay.style.display = "block";
        menu.setAttribute("data-nav-menu-open", "");
        button.classList.add("w--open");
        button.setAttribute("aria-expanded", "true");
        overlay.style.height = menu.offsetHeight + "px";
        navHooks.open.forEach(function (fn) { fn(nav); });
      }
      function doClose() {
        if (!open) return;
        open = false;
        menu.removeAttribute("data-nav-menu-open");
        overlay.style.display = "none";
        overlay.style.height = "";
        parent.insertBefore(menu, next);
        button.classList.remove("w--open");
        button.setAttribute("aria-expanded", "false");
        navHooks.close.forEach(function (fn) { fn(nav); });
      }
      button.addEventListener("click", function () {
        open ? doClose() : doOpen();
      });
      button.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open ? doClose() : doOpen();
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") doClose();
      });
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) doClose();
      });
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) doClose();
      });
      window.addEventListener("resize", function () {
        if (!collapsed()) doClose();
      });
    });
  }

  /* ---------- slider (replaces Webflow w-slider plugin) ---------- */
  function initSliders() {
    Array.prototype.forEach.call(document.querySelectorAll(".w-slider"), function (slider) {
      var mask = slider.querySelector(".w-slider-mask");
      if (!mask) return;
      var slides = Array.prototype.filter.call(mask.children, function (c) {
        return c.classList.contains("w-slide");
      });
      if (slides.length < 2) return;
      var left = slider.querySelector(".w-slider-arrow-left");
      var right = slider.querySelector(".w-slider-arrow-right");
      var navEl = slider.querySelector(".w-slider-nav");
      var duration = parseInt(slider.getAttribute("data-duration") || "500", 10);
      var easing = slider.getAttribute("data-easing") || "ease";
      var infinite = slider.getAttribute("data-infinite") === "true";
      var autoplay = slider.getAttribute("data-autoplay") === "true";
      var delay = parseInt(slider.getAttribute("data-delay") || "4000", 10);
      var spacing = slider.getAttribute("data-nav-spacing") || "3";
      var current = 0;
      var dots = [];

      mask.setAttribute("aria-live", "polite");
      slides.forEach(function (s, i) {
        s.setAttribute("role", "group");
        s.setAttribute("aria-label", (i + 1) + " of " + slides.length);
        s.style.transition = "transform " + duration + "ms " + cssEase(easing);
      });

      if (navEl) {
        navEl.textContent = "";
        slides.forEach(function (_, i) {
          var d = document.createElement("div");
          d.className = "w-slider-dot" + (i === 0 ? " w-active" : "");
          // CSS gives dots 8px padding (clipped from the painted box) so the
          // 8px dots get non-overlapping 24px touch targets (WCAG 2.5.8).
          d.style.margin = "0 " + Math.max(parseInt(spacing, 10) - 8, 0) + "px 0.5em";
          d.setAttribute("role", "button");
          d.setAttribute("tabindex", "0");
          d.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + slides.length);
          d.addEventListener("click", function () { go(i); });
          d.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(i); }
          });
          navEl.appendChild(d);
          dots.push(d);
        });
      }

      function go(i) {
        if (!infinite) i = Math.max(0, Math.min(slides.length - 1, i));
        else i = (i + slides.length) % slides.length;
        current = i;
        slides.forEach(function (s) {
          s.style.transform = "translateX(" + -100 * i + "%)";
        });
        dots.forEach(function (d, di) {
          d.classList.toggle("w-active", di === i);
        });
      }
      function prev() { go(infinite ? current - 1 : Math.max(0, current - 1)); }
      function next() { go(infinite ? current + 1 : current + 1 > slides.length - 1 ? 0 : current + 1); }

      if (left) {
        left.setAttribute("role", "button");
        left.setAttribute("tabindex", "0");
        left.setAttribute("aria-label", "previous slide");
        left.addEventListener("click", prev);
        left.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); prev(); }
        });
      }
      if (right) {
        right.setAttribute("role", "button");
        right.setAttribute("tabindex", "0");
        right.setAttribute("aria-label", "next slide");
        right.addEventListener("click", next);
        right.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
        });
      }

      // swipe
      if (slider.getAttribute("data-disable-swipe") !== "true") {
        var startX = null;
        mask.addEventListener("pointerdown", function (e) { startX = e.clientX; });
        mask.addEventListener("pointerup", function (e) {
          if (startX === null) return;
          var dx = e.clientX - startX;
          startX = null;
          if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
        });
      }

      if (autoplay) {
        var timer = setInterval(next, delay);
        slider.addEventListener("pointerenter", function () { clearInterval(timer); });
      }
    });
  }

  /* ---------- Lottie ---------- */
  function initLottie() {
    var nodes = document.querySelectorAll("[data-animation-type=lottie]");
    if (!nodes.length) return;
    var s = document.createElement("script");
    s.src = "/wf/js/lottie_light.min.js";
    s.onload = function () {
      Array.prototype.forEach.call(nodes, function (n) {
        var dur = parseFloat(n.getAttribute("data-duration") || "0");
        var def = parseFloat(n.getAttribute("data-default-duration") || "0");
        var anim = window.lottie.loadAnimation({
          container: n,
          renderer: "svg",
          loop: n.getAttribute("data-loop") === "1",
          autoplay: n.getAttribute("data-autoplay") === "1",
          path: n.getAttribute("data-src"),
          rendererSettings: { preserveAspectRatio: "xMidYMid meet", progressiveLoad: true },
        });
        if (dur > 0 && def > 0) {
          anim.addEventListener("DOMLoaded", function () {
            anim.setSpeed(def / dur);
          });
        }
        n.__lottie = anim;
      });
    };
    document.head.appendChild(s);
  }

  /* ---------- boot ---------- */
  function boot() {
    wire();
    initNav();
    initSliders();
    initLottie();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
