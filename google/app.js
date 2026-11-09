(function () {
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    menu.classList.toggle("is-open", open);
  }
  burger.addEventListener("click", function () {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  var tabs = document.querySelectorAll(".tab");
  var cards = document.querySelectorAll("#grid .card");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var f = tab.getAttribute("data-f");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      cards.forEach(function (c) { c.hidden = f !== "all" && c.getAttribute("data-c") !== f; });
    });
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
