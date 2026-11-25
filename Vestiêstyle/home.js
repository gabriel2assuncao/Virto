document.querySelector('.busca input')?.addEventListener('keydown',e=>{if(e.key==='Enter')location.href='explorar.html?busca='+encodeURIComponent(e.target.value.trim());});
document.querySelectorAll('.categoria-item').forEach((item,i)=>item.addEventListener('click',()=>{location.href=i===0?'explorar.html':'montar.html?categoria='+['','roupas','calcados','acessorios'][i];}));
document.querySelector('.btn-notificacao')?.addEventListener('click',()=>alert('As notificações estarão disponíveis com a integração de contas.'));

/* Carrossel da Home: troca automática a cada 4 segundos. */
(() => {
  const slides = Array.from(document.querySelectorAll('.banner-slide'));
  const indicadores = Array.from(document.querySelectorAll('.banner-indicadores .indicador'));
  if (!slides.length || slides.length !== indicadores.length) return;

  let indiceAtual = 0;
  let temporizador = null;

  function mostrarSlide(indice) {
    indiceAtual = indice;
    slides.forEach((slide, i) => {
      slide.classList.toggle('ativa', i === indiceAtual);
      slide.setAttribute('aria-hidden', i === indiceAtual ? 'false' : 'true');
    });
    indicadores.forEach((botao, i) => {
      const ativo = i === indiceAtual;
      botao.classList.toggle('ativo', ativo);
      if (ativo) botao.setAttribute('aria-current', 'true');
      else botao.removeAttribute('aria-current');
    });
  }

  function iniciarCarrossel() {
    window.clearInterval(temporizador);
    if (!document.hidden) {
      temporizador = window.setInterval(() => {
        mostrarSlide((indiceAtual + 1) % slides.length);
      }, 4000);
    }
  }

  indicadores.forEach((botao, i) => {
    botao.addEventListener('click', () => {
      mostrarSlide(i);
      iniciarCarrossel();
    });
  });

  document.addEventListener('visibilitychange', iniciarCarrossel);
  mostrarSlide(0);
  iniciarCarrossel();
})();

