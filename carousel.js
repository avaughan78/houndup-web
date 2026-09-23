(function () {
  var track = document.querySelector("[data-carousel]");
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");
  var wrap = document.querySelector(".screens-carousel-wrap");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var startAuto = function () {};
  var stopAuto = function () {};

  if (track && prevBtn && nextBtn && wrap) {
    var realCards = Array.prototype.slice.call(track.querySelectorAll(".screen-frame"));
    var n = realCards.length;

    if (n > 1) {
      // Clone the whole set before and after the real one, so stepping
      // past either end lands on a visually-identical clone — once the
      // (instant, no-animation) scroll lands back on the matching real
      // card a moment later, the loop reads as endless. Clones are
      // inert: no lightbox trigger, no tab stop, hidden from screen
      // readers — the real card (once, in the middle set) carries all
      // of that.
      function makeClone(card) {
        var clone = card.cloneNode(true);
        clone.classList.remove("reveal"); // see reveal.js — clones are
        // created after it has already run, so they'd never get
        // .is-visible and would sit at opacity:0 forever otherwise.
        clone.removeAttribute("data-lightbox-trigger");
        clone.removeAttribute("role");
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("tabindex", "-1");
        return clone;
      }

      var leading = realCards.map(makeClone);
      var trailing = realCards.map(makeClone);
      // Reversed so each successive insertBefore keeps leading clones in
      // their original left-to-right order.
      leading.slice().reverse().forEach(function (clone) { track.insertBefore(clone, track.firstChild); });
      trailing.forEach(function (clone) { track.appendChild(clone); });

      var allCards = Array.prototype.slice.call(track.querySelectorAll(".screen-frame"));
      var current = n; // first real card, now sitting at index n
      var settleTimer = null;

      function goTo(index, smooth) {
        current = index;
        allCards[current].scrollIntoView({
          behavior: smooth && !reducedMotion ? "smooth" : "auto",
          inline: "center",
          block: "nearest",
        });
      }

      function settle() {
        // Correct however far a burst of rapid clicks pushed `current`
        // past either clone band, not just by one set-width — a loop,
        // not a single if/else, so it can't land mid-clone-band.
        while (current >= 2 * n) current -= n;
        while (current < n) current += n;
        goTo(current, false);
      }

      function step(direction) {
        goTo(current + direction, true);
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(settle, 500);
      }

      goTo(n, false);

      var AUTO_MS = 3200;
      var timer = null;
      startAuto = function () {
        if (reducedMotion) return;
        stopAuto();
        timer = window.setInterval(function () { step(1); }, AUTO_MS);
      };
      stopAuto = function () {
        if (timer) window.clearInterval(timer);
        timer = null;
      };

      prevBtn.addEventListener("click", function () { step(-1); startAuto(); });
      nextBtn.addEventListener("click", function () { step(1); startAuto(); });

      wrap.addEventListener("mouseenter", stopAuto);
      wrap.addEventListener("mouseleave", startAuto);
      wrap.addEventListener("focusin", stopAuto);
      wrap.addEventListener("focusout", startAuto);
      // A manual drag/swipe is "hands on" too — don't fight it mid-drag.
      track.addEventListener("touchstart", stopAuto, { passive: true });
      track.addEventListener("touchend", startAuto, { passive: true });

      startAuto();
    }
  }

  var lightbox = document.querySelector("[data-lightbox]");
  var lightboxImg = lightbox && lightbox.querySelector("[data-lightbox-img]");
  var triggers = document.querySelectorAll("[data-lightbox-trigger]");
  var lastFocused = null;

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImg) return;
    stopAuto();
    lightboxImg.src = trigger.getAttribute("data-full-src");
    lightboxImg.alt = trigger.getAttribute("data-full-alt") || "";
    lastFocused = trigger;
    lightbox.classList.add("is-open");
    lightbox.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    var closeBtn = lightbox.querySelector("[data-lightbox-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
    startAuto();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () { openLightbox(trigger); });
    trigger.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(trigger);
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    var closeBtn = lightbox.querySelector("[data-lightbox-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }
})();
