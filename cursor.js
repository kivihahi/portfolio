// Свой курсор: точка и кольцо. Только для мыши; на тачскринах ничего не меняется.
(function () {
  if (!window.matchMedia || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var root = document.documentElement;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dot = document.createElement("div");
  var ring = document.createElement("div");
  dot.className = "cur-dot";
  ring.className = "cur-ring";
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  root.classList.add("has-cursor");

  var x = 0, y = 0, rx = 0, ry = 0, raf = 0, seen = false;
  var links = "a,button,[role=button],.copyable,.trk,.card,.id-card-avatar,summary";

  function draw() {
    rx += (x - rx) * (reduced ? 1 : 0.2);
    ry += (y - ry) * (reduced ? 1 : 0.2);
    dot.style.transform = "translate(" + x + "px," + y + "px)";
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    raf = (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) ? requestAnimationFrame(draw) : 0;
  }

  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; rx = x; ry = y; root.classList.add("cur-on"); }
    ring.classList.toggle("is-link", !!(e.target.closest && e.target.closest(links)));
    if (!raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
  document.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse") ring.classList.add("is-down"); });
  document.addEventListener("pointerup", function () { ring.classList.remove("is-down"); });
  document.documentElement.addEventListener("mouseleave", function () { root.classList.remove("cur-on"); seen = false; });
})();
