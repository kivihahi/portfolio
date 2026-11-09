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

  word.addEventListener("click", function () {
    var next = order[(order.indexOf(current()) + 1) % order.length];
    var box = word.getBoundingClientRect();
    var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    try { if (next) localStorage.setItem("accent", next); else localStorage.removeItem("accent"); } catch (e) {}
    document.dispatchEvent(new CustomEvent("accent-change", { detail: { accent: next || "orange" } }));

    if (reduced) { set(next); return; }
    if (!document.startViewTransition) { set(next); return; }

    root.classList.add("accent-wave");
    var vt = document.startViewTransition(function () { set(next); });
    vt.ready.then(function () {
      var far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      root.style.setProperty("--wx", cx + "px");
      root.style.setProperty("--wy", cy + "px");
      var front = document.createElement("div");
      front.className = "accent-wavefront";
      front.setAttribute("aria-hidden", "true");
      front.style.setProperty("--wx", cx + "px");
      front.style.setProperty("--wy", cy + "px");
      document.body.appendChild(front);
      front.animate(
        { "--wave-r": ["0px", (far + 160) + "px"] },
        { duration: 1100, easing: "cubic-bezier(.35,.1,.25,1)", fill: "both" }
      ).finished.then(function () { front.remove(); }, function () { front.remove(); });
      root.animate(
        { "--wave-r": ["0px", (far + 160) + "px"] },
        { duration: 1100, easing: "cubic-bezier(.35,.1,.25,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(function () {});
    vt.finished.finally(function () { root.classList.remove("accent-wave"); });
  });
})();
