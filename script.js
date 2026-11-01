(function () {
  function cover(id) {
    var covers = {
      t3kot: ["assets/cover-t3kot.jpg", "T3KOT"],
      mzvpn: ["assets/cover-mzvpn.jpg", "mzvpn"],
      t3kotsite: ["assets/cover-t3kotsite.jpg", "T3KOTsite"]
    };
    var item = covers[id] || covers.t3kot;
    return "<img src='" + item[0] + "' alt='Обложка проекта " + item[1] + "' loading='lazy' width='200' height='200'>";
  }
  document.querySelectorAll('[data-cover]').forEach(function (el) {
    el.innerHTML = cover(el.getAttribute('data-cover'));
  });

  var titles = { home: 'Портфолио', projects: 'Проекты', links: 'Профиль' };
  var views = Object.keys(titles);
  function route() {
    var h = location.hash.replace('#', '');
    if (views.indexOf(h) < 0) h = 'home';
    views.forEach(function (v) { document.getElementById('view-' + v).hidden = v !== h; });
    document.getElementById('ttl-text').textContent = titles[h];
    document.querySelectorAll('#nav a').forEach(function (a) {
      if (a.getAttribute('data-v') === h) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();

  var card = document.getElementById('id-card');
  var hint = document.getElementById('tilt-hint');
  var motionButton = document.getElementById('motion-button');
  if (!card) return;

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var maxTilt = 10;
  var raf = 0;
  var targetX = 0;
  var targetY = 0;

  function setTilt(x, y) {
    if (reducedMotion) return;
    targetX = Math.max(-maxTilt, Math.min(maxTilt, x));
    targetY = Math.max(-maxTilt, Math.min(maxTilt, y));
    if (raf) return;
    raf = requestAnimationFrame(function () {
      card.style.setProperty('--tilt-x', targetX.toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', targetY.toFixed(2) + 'deg');
      card.style.setProperty('--shine-x', (50 + targetY * 2.2) + '%');
      card.style.setProperty('--shine-y', (50 - targetX * 2.2) + '%');
      raf = 0;
    });
  }
  function resetTilt() {
    setTilt(0, 0);
    card.classList.remove('is-active');
  }

  card.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    var rect = card.getBoundingClientRect();
    var px = (event.clientX - rect.left) / rect.width;
    var py = (event.clientY - rect.top) / rect.height;
    setTilt((0.5 - py) * maxTilt * 2, (px - 0.5) * maxTilt * 2);
    card.classList.add('is-active');
  });
  card.addEventListener('pointerleave', resetTilt);
  card.addEventListener('pointerdown', function (event) {
    if (event.pointerType !== 'touch') return;
    var rect = card.getBoundingClientRect();
    var px = (event.clientX - rect.left) / rect.width;
    var py = (event.clientY - rect.top) / rect.height;
    setTilt((0.5 - py) * maxTilt, (px - 0.5) * maxTilt);
    card.classList.add('is-active');
  });
  card.addEventListener('pointerup', resetTilt);
  card.addEventListener('pointercancel', resetTilt);

  function handleOrientation(event) {
    if (event.beta == null || event.gamma == null) return;
    var beta = Math.max(-35, Math.min(35, event.beta));
    var gamma = Math.max(-35, Math.min(35, event.gamma));
    setTilt((beta / 35) * maxTilt, (gamma / 35) * maxTilt);
    card.classList.add('is-active');
  }
  function enableOrientation() {
    window.addEventListener('deviceorientation', handleOrientation, true);
    if (hint) hint.textContent = 'Карточка реагирует на наклон телефона';
    if (motionButton) motionButton.hidden = true;
  }
  if ('DeviceOrientationEvent' in window) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      motionButton.hidden = false;
      motionButton.addEventListener('click', function () {
        DeviceOrientationEvent.requestPermission().then(function (permission) {
          if (permission === 'granted') enableOrientation();
          else if (hint) hint.textContent = 'Доступ к датчикам не разрешён';
        }).catch(function () {
          if (hint) hint.textContent = 'Не удалось включить датчики. Проверь разрешения браузера.';
        });
      });
    } else enableOrientation();
  } else if (hint) hint.textContent = 'Двигай мышью, чтобы наклонять карточку';
})();