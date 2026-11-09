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

  // Нижняя панель: подсвечиваем раздел, который сейчас на экране
  var links = document.querySelectorAll(".dockbar a");
  var ids = ["projects", "about", "stack", "links"];
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.4, cur = ids[0];
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = "links";
    else ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + window.scrollY <= y) cur = id;
    });
    links.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("data-s") === cur); });
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(spy); }, { passive: true });
  spy();

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
