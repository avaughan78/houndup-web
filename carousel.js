(function () {
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");
  var stage = document.querySelector("[data-carousel-stage]");
  var ring = document.querySelector("[data-carousel-ring]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var pause = function () {};
  var resume = function () {};
  var consumeDragFlag = function () { return false; };

  if (stage && ring) {
    var cards = Array.prototype.slice.call(ring.querySelectorAll("[data-carousel-card]"));
    var n = cards.length;

    if (n > 1) {
      var step = 360 / n;
      var cardWidth = 220;
      var radius = 230;

      function readGeometry() {
        var styles = window.getComputedStyle(stage);
        cardWidth = parseFloat(styles.getPropertyValue("--card-width")) || cardWidth;
        radius = parseFloat(styles.getPropertyValue("--radius")) || radius;
        cards.forEach(function (card) { card.style.width = cardWidth + "px"; });
      }

      // Degrees, not radians — every angle in this file is degrees so it
      // reads directly against the CSS rotateY() values it produces.
      var angle = 0; // current live rotation of the whole ring
      var velocity = 360 / 26000; // deg/ms — one full turn every 26s
      var paused = false;
      var dragging = false;
      var dragStartX = 0;
      var dragStartAngle = 0;
      var lastFrameTime = null;

      function normalize(deg) {
        var d = deg % 360;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        return d;
      }

      function render() {
        cards.forEach(function (card, i) {
          var cardAngle = i * step + angle;
          var facing = Math.abs(normalize(cardAngle)) / 180; // 0 front, 1 back
          var opacity = 1 - facing * 0.8;
          card.style.transform =
            "translate(-50%, -50%) rotateY(" + cardAngle + "deg) translateZ(" + radius + "px)";
          card.style.opacity = String(Math.max(0.15, opacity));
          // Cards facing away shouldn't intercept clicks meant for
          // whatever's currently in front of them.
          card.style.pointerEvents = facing > 0.6 ? "none" : "auto";
        });
      }

      function tick(time) {
        if (lastFrameTime === null) lastFrameTime = time;
        var dt = time - lastFrameTime;
        lastFrameTime = time;
        if (!paused && !dragging) {
          angle = (angle + velocity * dt) % 360;
        }
        render();
        window.requestAnimationFrame(tick);
      }

      readGeometry();
      render();
      if (!reducedMotion) {
        window.requestAnimationFrame(tick);
      }

      var resizeTimer = null;
      window.addEventListener("resize", function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(readGeometry, 150);
      });

      pause = function () { paused = true; };
      resume = function () { paused = false; };

      function step_(direction) {
        angle = (angle + direction * step) % 360;
        render();
      }

      if (prevBtn) prevBtn.addEventListener("click", function () { step_(1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { step_(-1); });

      stage.addEventListener("mouseenter", pause);
      stage.addEventListener("mouseleave", resume);
      stage.addEventListener("focusin", pause);
      stage.addEventListener("focusout", resume);

      // Drag-to-spin — pointer events cover mouse and touch alike.
      var dragMoved = false;
      // Captured lazily (see dragMove), not on every pointerdown — see
      // that function's own comment for why unconditional capture here
      // silently broke the lightbox.
      var capturedPointerId = null;
      function dragStart(clientX) {
        dragging = true;
        dragMoved = false;
        pause();
        dragStartX = clientX;
        dragStartAngle = angle;
        ring.classList.add("is-dragging");
      }
      function dragMove(clientX) {
        if (!dragging) return;
        var deltaX = clientX - dragStartX;
        if (Math.abs(deltaX) > 4 && !dragMoved) {
          dragMoved = true;
          // Only capture once this is confirmed to be a real drag, not
          // a plain click/tap — confirmed live: capturing unconditionally
          // on every pointerdown (the previous behavior) retargets the
          // browser's synthesized `click` event to `ring` instead of
          // whatever card was actually under the pointer, which silently
          // broke every screenshot's "enlarge" click — the magnifying-
          // glass cursor still appeared on hover, but nothing happened
          // on click, since the card's own click listener never fired.
          if (capturedPointerId !== null && ring.setPointerCapture) ring.setPointerCapture(capturedPointerId);
        }
        // Degrees per pixel dragged — tied to radius so a drag around a
        // tighter/wider ring still feels proportional.
        angle = dragStartAngle + (deltaX / radius) * 60;
        render();
      }
      function dragEnd() {
        if (!dragging) return;
        dragging = false;
        ring.classList.remove("is-dragging");
        if (capturedPointerId !== null && ring.releasePointerCapture) {
          try { ring.releasePointerCapture(capturedPointerId); } catch (e) {}
        }
        capturedPointerId = null;
        resume();
      }
      consumeDragFlag = function () {
        var moved = dragMoved;
        dragMoved = false;
        return moved;
      };

      ring.addEventListener("pointerdown", function (event) {
        if (event.button !== undefined && event.button !== 0) return;
        capturedPointerId = event.pointerId;
        dragStart(event.clientX);
      });
      ring.addEventListener("pointermove", function (event) {
        if (dragging) dragMove(event.clientX);
      });
      ring.addEventListener("pointerup", dragEnd);
      ring.addEventListener("pointercancel", dragEnd);
    }
  }

  var lightbox = document.querySelector("[data-lightbox]");
  var lightboxImg = lightbox && lightbox.querySelector("[data-lightbox-img]");
  var triggers = document.querySelectorAll("[data-lightbox-trigger]");
  var lastFocused = null;

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImg) return;
    pause();
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
    resume();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      // A drag that ends over a card fires a click too — don't also
      // open the lightbox on the way past.
      if (consumeDragFlag()) {
        event.preventDefault();
        return;
      }
      openLightbox(trigger);
    });
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
