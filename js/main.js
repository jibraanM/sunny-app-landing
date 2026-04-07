(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
  }

  /* ——— Mobile nav ——— */
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.getElementById("mobile-nav");
  if (toggle && panel) {
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 900px)").matches) setOpen(false);
    });
  }

  /* ——— Scroll progress + header ——— */
  var scrollProgress = document.getElementById("scroll-progress");
  var header = document.getElementById("site-header");

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? doc.scrollTop / max : 0;
    if (scrollProgress) {
      scrollProgress.style.transform = "scaleX(" + p + ")";
      scrollProgress.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    }
    if (header) {
      if (doc.scrollTop > 32) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ——— Reveal on scroll + stagger ——— */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    document.querySelectorAll(".hero-copy [data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 70 + "ms");
    });
    document.querySelectorAll(".cap-grid [data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 55 + "ms");
    });
    document.querySelectorAll(".bento [data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 60 + "ms");
    });
    document.querySelectorAll(".trust-grid [data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 70 + "ms");
    });
    document.querySelectorAll(".quote-grid [data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 80 + "ms");
    });

    if (reduceMotion) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revObs.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealEls.forEach(function (el) {
        revObs.observe(el);
      });
    }
  }

  /* ——— Hero chart bars (after panel reveal) ——— */
  var chart = document.getElementById("hero-chart");
  var heroPanel = document.getElementById("hero-panel");
  function kickChart() {
    if (chart) chart.classList.add("is-animated");
  }
  if (chart && heroPanel && !reduceMotion) {
    if (heroPanel.classList.contains("is-visible")) {
      kickChart();
    } else {
      var mo = new MutationObserver(function () {
        if (heroPanel.classList.contains("is-visible")) {
          kickChart();
          mo.disconnect();
        }
      });
      mo.observe(heroPanel, { attributes: true, attributeFilter: ["class"] });
      setTimeout(function () {
        if (!chart.classList.contains("is-animated")) kickChart();
        mo.disconnect();
      }, 2400);
    }
  } else if (chart) {
    kickChart();
  }

  /* ——— Stat counters ——— */
  function runCounter(el, target, suffix) {
    var start = performance.now();
    var dur = 1600;
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(target * eased);
      el.textContent = val + (suffix || "");
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + (suffix || "");
    }
    requestAnimationFrame(tick);
  }

  var statsSection = document.getElementById("stats-section");
  var counters = document.querySelectorAll(".counter");
  var statsDone = false;

  function initStats() {
    if (statsDone) return;
    statsDone = true;
    counters.forEach(function (el) {
      if (el.classList.contains("counter--static")) {
        el.textContent = el.getAttribute("data-value") || "24/7";
        return;
      }
      var target = parseInt(el.getAttribute("data-target"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion || isNaN(target)) {
        el.textContent = target + suffix;
        return;
      }
      runCounter(el, target, suffix);
    });
  }

  if (statsSection && counters.length) {
    if (reduceMotion) {
      initStats();
    } else {
      var statObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              initStats();
              statObs.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      statObs.observe(statsSection);
    }
  }

  /* ——— Hero cursor spotlight (desktop) ——— */
  var hero = document.querySelector(".hero");
  var spotlight = document.getElementById("hero-spotlight");
  if (hero && spotlight && finePointer && !reduceMotion) {
    var sx = 50;
    var sy = 40;
    var tx = sx;
    var ty = sy;
    var raf = 0;

    function loop() {
      raf = 0;
      sx += (tx - sx) * 0.08;
      sy += (ty - sy) * 0.08;
      spotlight.style.setProperty("--sx", sx + "%");
      spotlight.style.setProperty("--sy", sy + "%");
      if (Math.abs(tx - sx) > 0.2 || Math.abs(ty - sy) > 0.2) {
        raf = requestAnimationFrame(loop);
      }
    }

    function queue() {
      if (!raf) raf = requestAnimationFrame(loop);
    }

    hero.addEventListener(
      "pointermove",
      function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width) * 100;
        ty = ((e.clientY - r.top) / r.height) * 100;
        spotlight.classList.add("is-active");
        queue();
      },
      { passive: true }
    );

    hero.addEventListener("pointerleave", function () {
      spotlight.classList.remove("is-active");
    });
  }

  /* ——— Magnetic buttons ——— */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (wrap) {
      var strength = wrap.classList.contains("magnetic--strong") ? 0.35 : 0.22;
      wrap.addEventListener("pointermove", function (e) {
        var r = wrap.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = (e.clientX - cx) * strength;
        var dy = (e.clientY - cy) * strength;
        wrap.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      wrap.addEventListener("pointerleave", function () {
        wrap.style.transform = "";
      });
    });
  }

  /* ——— Subtle tilt on cards ——— */
  if (finePointer && !reduceMotion) {
    var maxTilt = 7;
    document.querySelectorAll(".tilt-surface[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        var rx = (-py * maxTilt).toFixed(2);
        var ry = (px * maxTilt).toFixed(2);
        el.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) scale3d(1.01,1.01,1)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }
})();
