(function () {
  function cover(id) {
    var covers = {
      t3kot: ["assets/cover-t3kot.jpg", "T3KOT"],
      mzvpn: ["assets/cover-mzvpn.jpg", "mzvpn"],
      t3kotsite: ["assets/cover-t3kotsite.jpg", "T3KOTsite"]
    };
    var item = covers[id] || covers.t3kot;
    return "<img src='" + item[0] + "' alt='Обложка проекта " + item[1] + "' loading='lazy' width='200' height='200'>";
  }

  document.querySelectorAll("[data-cover]").forEach(function (el) {
    el.innerHTML = cover(el.getAttribute("data-cover"));
  });

  var titles = { home: "Портфолио", projects: "Проекты", links: "Профиль" };
  var views = Object.keys(titles);

  function route() {
    var hash = location.hash.replace("#", "");
    if (views.indexOf(hash) < 0) hash = "home";

    views.forEach(function (view) {
      document.getElementById("view-" + view).hidden = view !== hash;
    });

    document.getElementById("ttl-text").textContent = titles[hash];
    document.querySelectorAll("#nav a").forEach(function (link) {
      if (link.getAttribute("data-v") === hash) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  route();

  var galleryTrigger = document.getElementById("gallery-trigger");
  var galleryModal = document.getElementById("gallery-modal");
  var galleryPanel = galleryModal && galleryModal.querySelector(".gallery-panel");
  var galleryCloseButtons = galleryModal ? galleryModal.querySelectorAll("[data-gallery-close]") : [];
  var previousGalleryFocus = null;
  var galleryCloseTimer = 0;

  function closeGallery() {
    if (!galleryModal || galleryModal.hidden) return;
    galleryModal.classList.remove("is-open");
    galleryModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");
    window.clearTimeout(galleryCloseTimer);
    galleryCloseTimer = window.setTimeout(function () {
      galleryModal.hidden = true;
      if (previousGalleryFocus && typeof previousGalleryFocus.focus === "function") {
        previousGalleryFocus.focus();
      }
    }, 360);
  }

  function openGallery() {
    if (!galleryModal) return;
    window.clearTimeout(galleryCloseTimer);
    previousGalleryFocus = document.activeElement;
    galleryModal.hidden = false;
    galleryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");
    window.requestAnimationFrame(function () {
      galleryModal.classList.add("is-open");
      var closeButton = galleryModal.querySelector(".gallery-close");
      if (closeButton) closeButton.focus();
    });
  }

  if (galleryTrigger && galleryModal) {
    galleryTrigger.addEventListener("click", openGallery);
    galleryCloseButtons.forEach(function (button) {
      button.addEventListener("click", closeGallery);
    });

    document.addEventListener("keydown", function (event) {
      if (galleryModal.hidden || !galleryModal.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeGallery();
        return;
      }
      if (event.key === "Tab" && galleryPanel) {
        var focusable = galleryPanel.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])");
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  var card = document.getElementById("id-card");
  var hint = document.getElementById("tilt-hint");
  var motionButton = document.getElementById("motion-button");
  if (!card) return;

  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var maxTilt = 7.5;
  var currentX = 0;
  var currentY = 0;
  var targetX = 0;
  var targetY = 0;
  var animationFrame = 0;
  var orientationEnabled = false;
  var orientationBaseline = null;
  var lastScreenAngle = getScreenAngle();

  function getScreenAngle() {
    if (window.screen && window.screen.orientation &&
        typeof window.screen.orientation.angle === "number") {
      return window.screen.orientation.angle;
    }

    return typeof window.orientation === "number" ? window.orientation : 0;
  }

  function clamp(value, limit) {
    return Math.max(-limit, Math.min(limit, value));
  }

  function scheduleRender() {
    if (reducedMotion || animationFrame) return;
    animationFrame = window.requestAnimationFrame(renderTilt);
  }

  function setTarget(x, y) {
    targetX = clamp(x, maxTilt);
    targetY = clamp(y, maxTilt);
    if (Math.abs(targetX) > 0.12 || Math.abs(targetY) > 0.12) {
      card.classList.add("is-active");
    }
    scheduleRender();
  }

  function renderTilt() {
    var easing = 0.14;

    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;

    if (Math.abs(targetX - currentX) < 0.025) currentX = targetX;
    if (Math.abs(targetY - currentY) < 0.025) currentY = targetY;

    card.style.setProperty("--tilt-x", currentX.toFixed(3) + "deg");
    card.style.setProperty("--tilt-y", currentY.toFixed(3) + "deg");
    card.style.setProperty("--shine-x", (50 + currentY * 2.4).toFixed(1) + "%");
    card.style.setProperty("--shine-y", (50 - currentX * 2.4).toFixed(1) + "%");

    var isSettled = currentX === targetX && currentY === targetY;
    if (isSettled) {
      animationFrame = 0;
      if (Math.abs(currentX) < 0.03 && Math.abs(currentY) < 0.03) {
        card.classList.remove("is-active");
      }
      return;
    }

    animationFrame = window.requestAnimationFrame(renderTilt);
  }

  function resetTilt() {
    setTarget(0, 0);
  }

  card.addEventListener("pointermove", function (event) {
    if (event.pointerType === "touch") return;

    var rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var px = (event.clientX - rect.left) / rect.width;
    var py = (event.clientY - rect.top) / rect.height;
    setTarget((0.5 - py) * maxTilt * 1.5, (px - 0.5) * maxTilt * 1.5);
  });

  card.addEventListener("pointerleave", function (event) {
    if (event.pointerType !== "touch") resetTilt();
  });

  function applyDeadZone(value) {
    var deadZone = 1.25;
    if (Math.abs(value) <= deadZone) return 0;
    return Math.sign(value) * (Math.abs(value) - deadZone);
  }

  function handleOrientation(event) {
    if (event.beta == null || event.gamma == null) return;

    if (!orientationBaseline) {
      orientationBaseline = { beta: event.beta, gamma: event.gamma };
      return;
    }

    var beta = applyDeadZone(event.beta - orientationBaseline.beta);
    var gamma = applyDeadZone(event.gamma - orientationBaseline.gamma);
    var angle = ((getScreenAngle() % 360) + 360) % 360;
    var x;
    var y;

    if (angle >= 45 && angle < 135) {
      x = gamma;
      y = beta;
    } else if (angle >= 135 && angle < 225) {
      x = beta;
      y = -gamma;
    } else if (angle >= 225 && angle < 315) {
      x = -gamma;
      y = -beta;
    } else {
      x = -beta;
      y = gamma;
    }

    var sensitivity = maxTilt / 24;
    setTarget(clamp(x * sensitivity, maxTilt), clamp(y * sensitivity, maxTilt));
  }

  function enableOrientation() {
    if (orientationEnabled) return;
    orientationEnabled = true;
    orientationBaseline = null;
    window.addEventListener("deviceorientation", handleOrientation, true);

    if (hint) hint.textContent = "Наклоняй телефон — карточка повторит движение";
    if (motionButton) motionButton.hidden = true;
  }

  function resetOrientationBaseline() {
    orientationBaseline = null;
    resetTilt();
  }

  window.addEventListener("orientationchange", function () {
    var angle = getScreenAngle();
    if (angle !== lastScreenAngle) {
      lastScreenAngle = angle;
      resetOrientationBaseline();
    }
  });

  var hasTouchInput = (navigator.maxTouchPoints > 0) ||
    ("ontouchstart" in window) ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  if ("DeviceOrientationEvent" in window && hasTouchInput) {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      if (motionButton) {
        motionButton.hidden = false;
        motionButton.addEventListener("click", function () {
          DeviceOrientationEvent.requestPermission().then(function (permission) {
            if (permission === "granted") {
              enableOrientation();
            } else if (hint) {
              hint.textContent = "Разрешение на датчики не выдано";
            }
          }).catch(function () {
            if (hint) hint.textContent = "Не удалось включить датчик. Проверь разрешение браузера.";
          });
        });
      }
    } else {
      enableOrientation();
    }
  } else if (hint) {
    hint.textContent = "На этом устройстве доступно управление мышью";
  }
})();
