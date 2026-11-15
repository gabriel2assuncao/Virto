// Rodapé "lanterna": a luz segue o mouse (ou o dedo, no celular).
document.querySelectorAll('.logo-lanterna').forEach(function (area) {
  function mover(e) {
    var r = area.getBoundingClientRect();
    area.style.setProperty('--x', (e.clientX - r.left) + 'px');
    area.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }
  function ligar(e) { mover(e); area.classList.add('ativo'); }
  function desligar() { area.classList.remove('ativo'); }

  area.addEventListener('pointerenter', ligar);
  area.addEventListener('pointerdown', ligar);
  area.addEventListener('pointermove', mover);
  area.addEventListener('pointerleave', desligar);
  area.addEventListener('pointercancel', desligar);
  area.addEventListener('pointerup', function (e) {
    // No mouse a luz continua enquanto o cursor estiver em cima; no toque apaga ao soltar.
    if (e.pointerType !== 'mouse') desligar();
  });
});

// Procura a logo em vários caminhos (data-fontes) e usa o primeiro que carregar.
document.querySelectorAll('.logo-lanterna[data-fontes]').forEach(function (area) {
  var fontes = area.dataset.fontes.split(',');
  var imgs = area.querySelectorAll('img');
  (function tentar(i) {
    if (i >= fontes.length) { console.warn('Lanterna: nenhuma imagem encontrada em', fontes); return; }
    var teste = new Image();
    teste.onload = function () {
      imgs.forEach(function (img) { img.src = fontes[i]; });
      if (i > 0) console.warn('Lanterna: usando "' + fontes[i] + '". Não achei "' + fontes[0] + '".');
    };
    teste.onerror = function () { tentar(i + 1); };
    teste.src = fontes[i];
  })(0);
});
