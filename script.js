(function () {
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

  // Фоновая надпись за карточкой: бесконечная лента «ТимофейТимофей…»,
  // едет по диагонали из правого верхнего угла в левый нижний.
  // Строки собираются под реальный размер карточки (ничего лишнего не рисуем),
  // а анимация сдвигает ленту ровно на один период текста — стык не виден.
  var nameFlow = document.getElementById("card-name-flow");
  if (nameFlow) {
    var nameField = nameFlow.parentNode;
    var nameBackdrop = nameField.parentNode;
    var nameUnit = "ТимофейТимофей";
    var nameKey = "";

    var buildNameFlow = function () {
      var w = nameBackdrop.clientWidth;
      var h = nameBackdrop.clientHeight;
      if (!w || !h) return; // вкладка профиля ещё скрыта

      var angle = Math.abs(parseFloat(getComputedStyle(nameBackdrop).getPropertyValue("--flow-angle"))) * Math.PI / 180;
      var fontSize = parseFloat(getComputedStyle(nameFlow).fontSize);

      var probe = document.createElement("span");
      probe.className = "card-name-group";
      probe.style.cssText = "position:absolute;visibility:hidden";
      probe.textContent = nameUnit.repeat(20);
      nameFlow.appendChild(probe);
      var unitW = probe.offsetWidth / 20;
      var rowH = probe.offsetHeight;
      nameFlow.removeChild(probe);
      if (!unitW || !rowH) return;

      var along = w * Math.cos(angle) + h * Math.sin(angle);   // длина вдоль строки
      var across = w * Math.sin(angle) + h * Math.cos(angle);  // высота поперёк строк
      var rows = Math.ceil(across / rowH) + 1;
      var units = Math.ceil((along + fontSize * 3.5) / unitW) + 1;

      nameField.style.width = Math.ceil(along) + "px";
      nameFlow.style.setProperty("--flow-shift", (-unitW).toFixed(3) + "px");
      nameFlow.style.animationDuration = (unitW / 120).toFixed(2) + "s"; // ~120 px/с

      var key = rows + "|" + units;
      if (key === nameKey) return;
      nameKey = key;

      var text = nameUnit.repeat(units);
      var frag = document.createDocumentFragment();
      for (var r = 0; r < rows; r++) {
        var row = document.createElement("div");
        row.className = "card-name-row";
        var group = document.createElement("span");
        group.className = "card-name-group";
        group.textContent = text;
        row.appendChild(group);
        frag.appendChild(row);
      }
      nameFlow.textContent = "";
      nameFlow.appendChild(frag);
    };

    if (window.ResizeObserver) {
      new ResizeObserver(buildNameFlow).observe(nameBackdrop);
    } else {
      window.addEventListener("resize", buildNameFlow);
    }
    buildNameFlow();
  }

  var card = document.getElementById("id-card");
  var hint = document.getElementById("tilt-hint");
  var motionButton = document.getElementById("motion-button");
  if (!card) return;

  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var maxTilt = 10;
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

  // Касание: карточка наклоняется туда, где палец. Разрешений не нужно.
  var touching = false;

  function tiltFromTouch(event) {
    var touch = event.touches && event.touches[0];
    if (!touch) return;
    var rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var px = (touch.clientX - rect.left) / rect.width;
    var py = (touch.clientY - rect.top) / rect.height;
    setTarget((0.5 - py) * maxTilt * 1.5, (px - 0.5) * maxTilt * 1.5);
  }

  function endTouch() {
    if (!touching) return;
    touching = false;
    resetTilt();
  }

  card.addEventListener("touchstart", function (event) {
    touching = true;
    tiltFromTouch(event);
  }, { passive: true });
  card.addEventListener("touchmove", tiltFromTouch, { passive: true });
  card.addEventListener("touchend", endTouch, { passive: true });
  card.addEventListener("touchcancel", endTouch, { passive: true });

  function applyDeadZone(value) {
    var deadZone = 1.25;
    if (Math.abs(value) <= deadZone) return 0;
    return Math.sign(value) * (Math.abs(value) - deadZone);
  }

  function handleOrientation(event) {
    if (event.beta == null || event.gamma == null) return;
    confirmGyro();
    if (touching) return;

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

  var gyroConfirmed = false;

  function enableOrientation() {
    if (orientationEnabled) return;
    orientationEnabled = true;
    orientationBaseline = null;
    window.addEventListener("deviceorientation", handleOrientation, true);
  }

  // Первое настоящее событие датчика: гироскоп работает, кнопка не нужна.
  function confirmGyro() {
    if (gyroConfirmed) return;
    gyroConfirmed = true;
    if (hint) hint.textContent = "Води пальцем по карточке или наклоняй телефон";
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

  if (hasTouchInput) {
    // Наклон от касания работает сразу, без разрешений.
    if (hint) hint.textContent = "Води пальцем по карточке";

    if ("DeviceOrientationEvent" in window) {
      // Слушаем датчик сразу: на Android и в Chrome разрешение не нужно.
      enableOrientation();

      // Только iPhone/iPad ждут явного разрешения. Если за 1,2 с данных нет,
      // показываем необязательную кнопку.
      if (typeof DeviceOrientationEvent.requestPermission === "function" && motionButton) {
        window.setTimeout(function () {
          if (gyroConfirmed) return;
          motionButton.textContent = "Включить гироскоп (необязательно)";
          motionButton.hidden = false;
          motionButton.addEventListener("click", function () {
            DeviceOrientationEvent.requestPermission().then(function (permission) {
              if (permission === "granted") {
                orientationBaseline = null;
                motionButton.hidden = true;
              } else if (hint) {
                hint.textContent = "Гироскоп не включён, но карточка двигается от касания";
              }
            }).catch(function () {
              if (hint) hint.textContent = "Гироскоп не включился, но карточка двигается от касания";
            });
          });
        }, 1200);
      }
    }
  } else if (hint) {
    hint.textContent = "Двигай мышью по карточке";
  }
})();
