(function () {
  const page = document.documentElement;
  const body = document.body;
  const menuButton = document.querySelector('.guji-menu-button');
  const nav = document.getElementById('gujiNav');
  const topButton = document.querySelector('.guji-top');

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) { /* 本地存储不可用时静默降级 */ }
  }

  menuButton?.addEventListener('click', function () {
    const open = nav?.classList.toggle('open') || false;
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('scroll', function () {
    topButton?.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  topButton?.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  function bindFilter(input, selector, emptySelector) {
    const items = Array.from(document.querySelectorAll(selector));
    const empty = document.querySelector(emptySelector);
    if (!input || items.length === 0) return;
    function update() {
      const query = input.value.trim().toLocaleLowerCase('zh-CN');
      let visible = 0;
      items.forEach(function (item) {
        const haystack = (item.dataset.search || item.textContent || '').toLocaleLowerCase('zh-CN');
        const show = !query || haystack.includes(query);
        item.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }
    input.addEventListener('input', update);
    input.closest('form')?.addEventListener('submit', function (event) { event.preventDefault(); update(); });
  }

  bindFilter(document.getElementById('classicSearch'), '.classic-card', '.classic-empty');
  bindFilter(document.getElementById('catalogSearch'), '.classic-toc > li', '.catalog-empty');

  const reader = document.querySelector('.classic-reader');
  if (!reader) return;

  const savedTheme = storageGet('guji:theme');
  const savedSize = Number(storageGet('guji:fontSize'));
  const savedLine = Number(storageGet('guji:lineHeight'));
  if (savedTheme === 'dark') body.classList.add('reader-dark');
  if (savedSize >= 16 && savedSize <= 30) page.style.setProperty('--reader-size', `${savedSize}px`);
  if (savedLine >= 1.6 && savedLine <= 2.6) page.style.setProperty('--reader-line', String(savedLine));

  document.querySelector('[data-theme="toggle"]')?.setAttribute('aria-pressed', String(body.classList.contains('reader-dark')));
  document.querySelectorAll('.classic-settings button').forEach(function (button) {
    button.addEventListener('click', function () {
      if (button.dataset.font) {
        const current = parseFloat(getComputedStyle(page).getPropertyValue('--reader-size')) || 18.88;
        const next = Math.min(30, Math.max(16, current + (button.dataset.font === 'up' ? 2 : -2)));
        page.style.setProperty('--reader-size', `${next}px`);
        storageSet('guji:fontSize', String(next));
      }
      if (button.dataset.line) {
        const current = parseFloat(getComputedStyle(page).getPropertyValue('--reader-line')) || 2.05;
        const next = current > 2.2 ? 1.8 : Number((current + .2).toFixed(2));
        page.style.setProperty('--reader-line', String(next));
        storageSet('guji:lineHeight', String(next));
      }
      if (button.dataset.theme) {
        const dark = body.classList.toggle('reader-dark');
        button.setAttribute('aria-pressed', String(dark));
        button.textContent = dark ? '日间' : '夜间';
        storageSet('guji:theme', dark ? 'dark' : 'light');
      }
    });
  });

  const readerKey = `guji:position:${reader.dataset.readerKey}`;
  if (!window.location.hash) {
    const savedPosition = Number(storageGet(readerKey));
    if (savedPosition > 0) window.requestAnimationFrame(function () { window.scrollTo(0, savedPosition); });
  }
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      storageSet(readerKey, String(Math.round(window.scrollY)));
      ticking = false;
    });
  }, { passive: true });
})();

