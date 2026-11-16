// Carrossel de destaques da página inicial: troca sozinho, pausa ao interagir.
(function () {
  var INTERVALO = 4000; // tempo de cada destaque, em milissegundos

  var area = document.querySelector('.destaque-area');
  if (!area) return;
  var slides = area.querySelectorAll('.slide');
  var bolinhas = area.querySelectorAll('.bolinha');
  if (slides.length < 2) return;

  var atual = 0;
  var timer = null;
  var pausado = false;
  var reduzirMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mostrar(n) {
    atual = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('ativo', i === atual); });
    bolinhas.forEach(function (b, i) {
      b.classList.toggle('ativa', i === atual);
      b.setAttribute('aria-current', i === atual ? 'true' : 'false');
    });
  }

  function parar() { clearInterval(timer); timer = null; }
  function iniciar() {
    parar();
    if (reduzirMovimento || pausado || document.hidden) return;
    timer = setInterval(function () { mostrar(atual + 1); }, INTERVALO);
  }

  bolinhas.forEach(function (b, i) {
    b.addEventListener('click', function () { mostrar(i); iniciar(); });
  });

  // Pausa com o mouse em cima ou com o foco do teclado dentro do carrossel
  area.addEventListener('mouseenter', function () { pausado = true; parar(); });
  area.addEventListener('mouseleave', function () { pausado = false; iniciar(); });
  area.addEventListener('focusin', function () { pausado = true; parar(); });
  area.addEventListener('focusout', function () { pausado = false; iniciar(); });

  // Não gasta tempo com a aba escondida
  document.addEventListener('visibilitychange', iniciar);

  iniciar();
})();
