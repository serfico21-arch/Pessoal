/* FCOSTA — barra padrão (logo + título + voltar ao painel).
   Uso: <script src="fcosta-padrao.js" defer></script> no <head> da página.
   Não faz nada se a página já tem logo no cabeçalho, está dentro de iframe ou usa layout flex/grid no body. */
(function () {
  try {
    if (window.self !== window.top) return;
    var b = document.body;
    if (!b || document.getElementById('fc-barra')) return;
    if (document.querySelector('header .logo, header .selo, header img, .brand img, .brand .selo, .selo, [class*="logo"] img')) return;
    var cs = getComputedStyle(b);
    if (/flex|grid/.test(cs.display)) return;
    function rgb(s) { var m = (s || '').match(/[\d.]+/g); return m ? m.map(Number) : [255, 255, 255, 1]; }
    var c = rgb(cs.backgroundColor);
    if (c.length > 3 && c[3] === 0) c = rgb(getComputedStyle(document.documentElement).backgroundColor);
    if (c.length > 3 && c[3] === 0) c = [255, 255, 255];
    var escuro = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 < 0.45;
    var titulo = (document.title || 'Página').split(/\s[—–|]\s/)[0].trim();
    var st = document.createElement('style');
    st.textContent =
      '#fc-barra{display:flex;align-items:center;gap:12px;padding:10px 16px;font:14px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
      'background:' + (escuro ? '#0f1729' : '#ffffff') + ';color:' + (escuro ? '#eaf0ff' : '#17332b') + ';' +
      'border-bottom:1px solid ' + (escuro ? 'rgba(148,163,184,.2)' : 'rgba(16,185,129,.28)') + ';box-sizing:border-box;width:100%}' +
      '#fc-barra img{width:40px;height:40px;border-radius:50%;background:#000;object-fit:cover;box-shadow:0 0 0 2px #059669;flex:none}' +
      '#fc-barra .t{flex:1;min-width:0}#fc-barra b{display:block;font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#fc-barra small{display:block;font-size:12px;opacity:.7}' +
      '#fc-barra a{flex:none;background:#047857;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:8px 14px;border-radius:999px}' +
      '@media print{#fc-barra{display:none!important}}';
    document.head.appendChild(st);
    var d = document.createElement('div');
    d.id = 'fc-barra';
    d.innerHTML = '<img src="sen_fundo_logo.png" alt="FCOSTA"><div class="t"><b></b><small>FCOSTA · Corretor de imóveis</small></div><a href="index.html">&#8592; Painel</a>';
    d.querySelector('b').textContent = titulo;
    b.insertBefore(d, b.firstChild);
  } catch (e) {}
})();
