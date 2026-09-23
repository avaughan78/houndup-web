(function () {
  var track = document.querySelector("[data-carousel]");
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");

  if (track && prevBtn && nextBtn) {
    var scrollByCard = function (direction) {
      var card = track.querySelector(".screen-frame");
      var amount = card ? card.getBoundingClientRect().width + 28 : track.clientWidth * 0.8;
      track.scrollBy({ left: direction * amount, behavior: "smooth" });
    };
    prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    nextBtn.addEventListener("click", function () { scrollByCard(1); });
  }

  var lightbox = document.querySelector("[data-lightbox]");
  var lightboxImg = lightbox && lightbox.querySelector("[data-lightbox-img]");
  var triggers = document.querySelectorAll("[data-lightbox-trigger]");
  var lastFocused = null;

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImg) return;
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
