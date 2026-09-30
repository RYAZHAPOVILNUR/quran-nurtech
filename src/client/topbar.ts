// Контекст тулбара и shortcut настроек.
// Контекст-заголовок тулбара: текущее «местоположение» (как в Finder/Preview).
  function qFillContext() {
    var el = document.querySelector('[data-context]');
    if (!el) return;
    var p = location.pathname;
    var t = '',
      s = '';
    var mush = p.match(/^\/mushaf\/(\d+)/);
    var body = document.body;
    if (mush) {
      t = 'Мусхаф';
      s = 'Страница ' + mush[1] + ' из 604';
    } else if (/^\/(surah|ayah)\//.test(p) || /^\/\d+:\d+/.test(p)) {
      var h1 = document.querySelector('.surah-head h1, h1');
      var sur = body.getAttribute('data-surah');
      var ay = body.getAttribute('data-ayah');
      t = (h1 && h1.textContent.trim()) || 'Сура';
      s = sur ? (ay ? sur + ':' + ay : 'Сура ' + sur) : '';
    } else if (p === '/search' || p.indexOf('/search') === 0) {
      t = 'Поиск';
    } else if (p.indexOf('/progress') === 0) {
      t = 'Мой прогресс';
    }
    if (t) el.innerHTML = '<span class="tc-t"></span><span class="tc-s"></span>';
    if (t) el.querySelector('.tc-t').textContent = t;
    if (s) el.querySelector('.tc-s').textContent = s;
    else if (t) el.querySelector('.tc-s').remove();
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', qFillContext);
  else qFillContext();

  // Переключатель ЯЗЫКА перевода (Русский / العربية) в шапке — на всех страницах.
  // Меняет q_tr и открывает суру на выбранном языке (текущую в читалке, иначе
  // последнюю читанную или Аль-Фатиху). q_tr хранится JSON-строкой (LS.set).
  function initLang() {
    function readTr() {
      var v = document.body.getAttribute('data-tr');
      if (v) return v;
      try {
        return JSON.parse(localStorage.getItem('q_tr') || '"kuliev"');
      } catch (e) {
        return 'kuliev';
      }
    }
    var isAr = readTr() === 'muyassar';
    var label = document.querySelector('[data-lang-current]');
    if (label) label.textContent = isAr ? 'ع' : 'RU';
    var btns = document.querySelectorAll('button[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        var v = b.getAttribute('data-lang');
        b.classList.toggle('on', v === 'muyassar' ? isAr : !isAr);
        b.addEventListener('click', function () {
          try {
            localStorage.setItem('q_tr', JSON.stringify(v));
          } catch (e) {}
          var sid = document.body.getAttribute('data-surah');
          if (sid) {
            location.href = '/surah/' + sid + '/' + v;
            return;
          }
          var s = 1;
          try {
            var last = JSON.parse(localStorage.getItem('q_last') || 'null');
            if (last && last.s) s = last.s;
          } catch (e) {}
          location.href = '/surah/' + s + '/' + v;
        });
      })(btns[i]);
    }
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initLang);
  else initLang();

  // ⌘, / Ctrl+, — открыть инспектор настроек (как в macOS-приложениях)
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      var btn = document.querySelector('[aria-label="Настройки чтения"]');
      if (btn) {
        e.preventDefault();
        btn.click();
      }
    }
  });
