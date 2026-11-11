// Переключатель темы. Начальную тему выставляет маленький скрипт в <head>,
// здесь только кнопка, запоминание выбора и слежение за системной темой.
(function () {
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  var meta = document.querySelector('meta[name="theme-color"]');
  var colors = { light: "#f7f5f2", dark: "#000000" };
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

  function hasSaved() {
    try {
      var v = localStorage.getItem("theme");
      return v === "light" || v === "dark";
    } catch (e) {
      return false;
    }
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    if (meta) meta.setAttribute("content", colors[theme]);
    if (button) {
      button.setAttribute("aria-label",
        theme === "light" ? "Включить тёмную тему" : "Включить светлую тему");
    }
  }

  apply(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (button) {
    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      var change = function () { apply(next); };

      var reduced = window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && !reduced) {
        document.startViewTransition(change); // плавное перетекание цветов
      } else {
        change();
      }

      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // Пока пользователь сам не выбирал, тема следует за системной.
  if (media && media.addEventListener) {
    media.addEventListener("change", function (event) {
      if (!hasSaved()) apply(event.matches ? "light" : "dark");
    });
  }
})();
