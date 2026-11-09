// Смена акцентного цвета по клику на «Kivi.»: оранжевый → синий → розовый,
// с волной от слова. Начальный цвет выставляет скрипт в <head>.
(function () {
  var root = document.documentElement;
  var word = document.getElementById("accent-word");
  if (!word) return;
  var order = ["", "blue", "pink"];
  var meta = document.querySelector('meta[name="theme-color"]');

  function current() {
    var a = root.getAttribute("data-accent");
    return a === "blue" || a === "pink" ? a : "";
  }
  function set(a) {
    if (a) root.setAttribute("data-accent", a);
    else root.removeAttribute("data-accent");
  }

  function rings(cx, cy) {
    var far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    for (var i = 0; i < 3; i++) {
      var r = document.createElement("div");
      r.className = "accent-ring";
      r.setAttribute("aria-hidden", "true");
      r.style.setProperty("--cx", cx + "px");
      r.style.setProperty("--cy", cy + "px");
      r.style.setProperty("--s", (far * 2 / 60).toFixed(2));
      r.style.setProperty("--d", (i * 0.12) + "s");
      document.body.appendChild(r);
      (function (el) { setTimeout(function () { el.remove(); }, 1300); })(r);
    }
  }

  word.addEventListener("click", function () {
    var next = order[(order.indexOf(current()) + 1) % order.length];
    var box = word.getBoundingClientRect();
    var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    try { if (next) localStorage.setItem("accent", next); else localStorage.removeItem("accent"); } catch (e) {}
    document.dispatchEvent(new CustomEvent("accent-change", { detail: { accent: next || "orange" } }));

    if (reduced) { set(next); return; }
    rings(cx, cy);
    if (!document.startViewTransition) { set(next); return; }

    root.classList.add("accent-wave");
    var vt = document.startViewTransition(function () { set(next); });
    vt.ready.then(function () {
      var far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      root.animate(
        { clipPath: ["circle(0px at " + cx + "px " + cy + "px)", "circle(" + far + "px at " + cx + "px " + cy + "px)"] },
        { duration: 800, easing: "cubic-bezier(.2,.7,.3,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(function () {});
    vt.finished.finally(function () { root.classList.remove("accent-wave"); });
  });
})();
