(function () {
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Мобильное меню
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    menu.classList.toggle("is-open", open);
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  // Меняющееся слово в заголовке
  var swap = document.getElementById("swap");
  var words = ["исследовать", "создавать", "играть", "кодить"];
  var wi = 0;
  if (!reduced) {
    setInterval(function () {
      swap.classList.add("is-out");
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        swap.textContent = words[wi];
        swap.classList.remove("is-out");
      }, 260);
    }, 2400);
  }


  // Ленты: на компьютере листаем стрелками и перетаскиванием мышью
  var canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.querySelectorAll(".rail").forEach(function (rail) {
    var box = document.createElement("div");
    box.className = "rail-box";
    rail.parentNode.insertBefore(box, rail);
    box.appendChild(rail);
    if (!canHover) return;

    function mk(dir) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rail-btn rail-" + (dir < 0 ? "prev" : "next");
      b.setAttribute("aria-label", dir < 0 ? "Назад" : "Вперёд");
      b.innerHTML = dir < 0 ? "&#8592;" : "&#8594;";
      b.addEventListener("click", function () {
        var step = (rail.firstElementChild ? rail.firstElementChild.offsetWidth : 300) + 20;
        rail.scrollBy({ left: dir * step, behavior: reduced ? "auto" : "smooth" });
      });
      box.appendChild(b);
      return b;
    }
    var prev = mk(-1), next = mk(1);
    function edges() {
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    }
    rail.addEventListener("scroll", function () { requestAnimationFrame(edges); }, { passive: true });
    window.addEventListener("resize", edges);
    edges();

    var down = false, startX = 0, startLeft = 0, moved = false;
    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; rail.classList.add("is-drag"); }
      if (moved) rail.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      if (moved) setTimeout(function () { rail.classList.remove("is-drag"); }, 0);
    });
    // после перетаскивания не открываем карточку по случайному клику
    rail.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    rail.addEventListener("dragstart", function (e) { e.preventDefault(); });
  });

  // Точки под лентой с карточками
  var rail = document.getElementById("rail-facts");
  var dotsBox = document.getElementById("dots");
  var cards = rail.children;
  for (var i = 0; i < cards.length; i++) dotsBox.appendChild(document.createElement("i"));
  var dots = dotsBox.children;
  function updateDots() {
    var center = rail.scrollLeft + rail.clientWidth / 2, best = 0, bestD = 1e9;
    for (var k = 0; k < cards.length; k++) {
      var d = Math.abs(cards[k].offsetLeft + cards[k].offsetWidth / 2 - center);
      if (d < bestD) { bestD = d; best = k; }
    }
    for (var j = 0; j < dots.length; j++) dots[j].classList.toggle("is-on", j === best);
  }
  rail.addEventListener("scroll", function () { requestAnimationFrame(updateDots); }, { passive: true });
  updateDots();

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
