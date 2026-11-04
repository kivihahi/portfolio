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
