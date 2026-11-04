// Питомец: тап по нему, и он подпрыгивает и что-то говорит.
(function () {
  var pet = document.getElementById("pet");
  var btn = document.getElementById("pet-btn");
  var bubble = document.getElementById("pet-bubble");
  if (!pet || !btn || !bubble) return;

  var svg = btn.querySelector(".pet-svg");

  var lines = {
    common: [
      "Мяу!",
      "Мррр…",
      "Прыг-скок!",
      "Ещё раз! Ещё!",
      "Ой, щекотно!",
      "Я охраняю этот сайт.",
      "Я не толстый, я пушистый.",
      "Тимофей делает игры, а я делаю прыжки.",
      "Тебе тоже нравятся коты?",
      "Хорошего дня!"
    ],
    home: [
      "Заглянешь в проекты?",
      "Тут всё про Kivi."
    ],
    projects: [
      "T3KOT — это туман и высота.",
      "mzvpn на Rust. Звучит умно, да?",
      "Нажми на любую карточку!"
    ],
    links: [
      "Попробуй наклонить карточку!",
      "Ник можно скопировать, нажми на него."
    ]
  };

  var last = "";
  var taps = [];
  var bubbleTimer = 0;
  var jumpTimer = 0;

  function currentView() {
    var hash = location.hash.replace("#", "");
    return lines[hash] && hash !== "common" ? hash : "home";
  }

  function pickLine() {
    var pool = lines.common.concat(lines[currentView()]);
    var line = last;
    for (var i = 0; i < 6 && line === last; i++) {
      line = pool[Math.floor(Math.random() * pool.length)];
    }
    return line;
  }

  function say(text) {
    last = text;
    bubble.textContent = text;
    bubble.classList.add("is-on");
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(function () {
      bubble.classList.remove("is-on");
    }, Math.max(2200, text.length * 70));
  }

  function jump() {
    window.clearTimeout(jumpTimer);
    pet.classList.remove("is-jumping");
    void pet.offsetWidth; // перезапуск анимации при быстрых тапах
    pet.classList.add("is-jumping");
    jumpTimer = window.setTimeout(function () {
      pet.classList.remove("is-jumping");
    }, 800);
  }

  btn.addEventListener("click", function () {
    var now = Date.now();
    taps = taps.filter(function (t) { return now - t < 4000; });
    taps.push(now);

    jump();

    if (taps.length >= 7) {
      taps = [];
      say("Ой, голова закружилась…");
    } else {
      say(pickLine());
    }
  });

  // Реакция на пасхалку с дождём (событие шлёт код ниже в этом файле)
  document.addEventListener("easter-rain", function (event) {
    jump();
    say(event.detail && event.detail.reduced
      ? "Дождя не будет: у тебя включено уменьшение анимации."
      : "Дождь из котиков!");
  });

  // Один раз за сессию тихо подсказываем, что питомца можно потрогать.
  var greeted = false;
  try { greeted = sessionStorage.getItem("pet-greeted") === "1"; } catch (e) {}
  if (!greeted) {
    window.setTimeout(function () {
      if (bubble.classList.contains("is-on")) return;
      say("Мяу! Потрогай меня.");
      try { sessionStorage.setItem("pet-greeted", "1"); } catch (e) {}
    }, 3500);
  }
})();

// Пасхалка: дождь из аватарок.
// Запуск: три быстрых касания по аватарке на карточке профиля
// или Konami-код на клавиатуре (↑ ↑ ↓ ↓ ← → ← → B A).
(function () {
  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var avatar = document.querySelector(".id-card-avatar");
  var src = (avatar && avatar.getAttribute("src")) || "assets/profile-cat.webp";
  var busy = false;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function startRain() {
    // питомец отреагирует в любом случае (см. выше)
    document.dispatchEvent(new CustomEvent("easter-rain", { detail: { reduced: !!reduced } }));
    if (reduced || busy) return;
    busy = true;

    var layer = document.createElement("div");
    layer.className = "rain";
    layer.setAttribute("aria-hidden", "true");

    var count = window.innerWidth < 600 ? 22 : 36;
    var longest = 0;
    for (var i = 0; i < count; i++) {
      var img = new Image();
      img.src = src;
      img.alt = "";
      img.decoding = "async";
      img.draggable = false;
      var dur = rand(2.4, 4.2);
      var delay = rand(0, 1.8);
      longest = Math.max(longest, dur + delay);
      img.style.setProperty("--x", rand(-2, 94).toFixed(1) + "%");
      img.style.setProperty("--size", Math.round(rand(34, 82)) + "px");
      img.style.setProperty("--dur", dur.toFixed(2) + "s");
      img.style.setProperty("--delay", delay.toFixed(2) + "s");
      img.style.setProperty("--spin", Math.round(rand(-70, 70)) + "deg");
      img.style.setProperty("--sway", Math.round(rand(-36, 36)) + "px");
      layer.appendChild(img);
    }

    document.body.appendChild(layer);
    window.setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      busy = false;
    }, Math.ceil(longest * 1000) + 200);
  }

  // тройной тап (клик) по аватарке: три касания в пределах 1,6 с
  var avatarTaps = [];
  if (avatar) {
    avatar.addEventListener("click", function () {
      var now = Date.now();
      avatarTaps = avatarTaps.filter(function (t) { return now - t < 1600; });
      avatarTaps.push(now);
      if (avatarTaps.length >= 3 &&
          avatarTaps[avatarTaps.length - 1] - avatarTaps[avatarTaps.length - 3] < 1600) {
        avatarTaps = [];
        startRain();
      }
    });
  }

  // Konami-код по физическим клавишам, чтобы работало и в русской раскладке
  var code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight",
              "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
  var progress = 0;
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code === code[progress]) {
      progress++;
      if (progress === code.length) {
        progress = 0;
        startRain();
      }
    } else {
      progress = event.code === code[0] ? 1 : 0;
    }
  });
})();
