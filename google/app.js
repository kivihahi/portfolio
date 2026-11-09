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

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
