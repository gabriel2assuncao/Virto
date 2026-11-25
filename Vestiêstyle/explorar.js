
// ========================================
// VESTIÊ STILE - EXPLORAR LOOKS
// ========================================

const telas = document.querySelectorAll('.tela');

function mostrarTela(id) {
  telas.forEach(tela => {
    tela.classList.toggle('ativa', tela.id === id);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ========================================
// DADOS DOS LOOKS
// ========================================

const looks = {
  casual: {
    titulo: 'Look casual confortável',
    categoria: 'Casual',
    tags: ['Casual', 'Confortável', 'Minimalista'],
    imagem: 'imagens/look-casual.png',
    detalhes: [
      'imagens/look-casual-lado.png',
      'imagens/look-casual-costas.png',
      
    ],
    descricao:
      'Uma combinação leve e confortável, perfeita ' +
      'para passeios, encontros e momentos descontraídos.',
    curtidas: '1,8k',
    visualizacoes: '6,2k',
    cores: ['#c9ae92', '#8e745f', '#714b31']
  },

  urbano: {
    titulo: 'Look urbano minimalista',
    categoria: 'Urbano',
    tags: ['Urbano', 'Casual', 'Minimalista'],
    imagem: 'imagens/look_urbano.png',
    detalhes: [
      'imagens/look-urbano-lado.png',
      'imagens/look-urbano-costas.png'
    ],
    descricao:
      'Conforto e estilo na medida certa. Ideal para ' +
      'o dia a dia, sem abrir mão da elegância.',
    curtidas: '2,4k',
    visualizacoes: '8,7k',
    cores: ['#c3aa8a', '#927357', '#433328']
  },

  elegante: {
    titulo: 'Elegância atemporal',
    categoria: 'Elegante',
    tags: ['Elegante', 'Sofisticado', 'Clássico'],
    imagem: 'imagens/look-elegante.png',
    detalhes: [
      'imagens/look-elegante-lado.png',
      'imagens/look-elegante-costas.png'
    ],
    descricao:
      'Peças sofisticadas e tons harmoniosos para ' +
      'ocasiões especiais e momentos inesquecíveis.',
    curtidas: '3,1k',
    visualizacoes: '9,5k',
    cores: ['#c0a586', '#9d8166', '#6d4a32']
  },

  trabalho: {
    titulo: 'Look clássico para trabalho',
    categoria: 'Trabalho',
    tags: ['Trabalho', 'Clássico', 'Elegante'],
    imagem: 'imagens/look-trabalho.png',
    detalhes: [
      'imagens/look-trabalho-lado.png',
      'imagens/look-trabalho-costas.png'
    ],
    descricao:
      'Uma produção moderna e profissional, ' +
      'combinando praticidade, confiança e sofisticação.',
    curtidas: '1,6k',
    visualizacoes: '5,3k',
    cores: ['#f2e9df', '#5c534c', '#292624']
  }
};

let lookAtual = 'urbano';

// ========================================
// FILTROS
// ========================================

const filtros = document.querySelectorAll('.filtro');
const cards = document.querySelectorAll('.look-card');

function selecionarFiltro(categoria) {
  filtros.forEach(botao => {
    botao.classList.toggle(
      'ativo',
      botao.dataset.filtro === categoria
    );
  });

  cards.forEach(card => {
    const mostrar =
      categoria === 'todos' ||
      card.dataset.categoria === categoria;

    card.classList.toggle('oculto', !mostrar);
  });
}

filtros.forEach(botao => {
  botao.addEventListener('click', () => {
    selecionarFiltro(botao.dataset.filtro);
  });
});

// ========================================
// FAVORITOS E LOOKS SALVOS
// ========================================

function lerSalvos() {
  try {
    return JSON.parse(
      localStorage.getItem('vestieLooksSalvos') || '[]'
    );
  } catch {
    return [];
  }
}

let salvos = new Set(lerSalvos());

function guardarSalvos() {
  localStorage.setItem(
    'vestieLooksSalvos',
    JSON.stringify([...salvos])
  );
}

function atualizarFavoritos() {
  document.querySelectorAll('[data-favorito]').forEach(botao => {
    const id = botao.dataset.favorito;
    const ativo = salvos.has(id);

    botao.textContent = ativo ? '♥' : '♡';
    botao.classList.toggle('favoritado', ativo);
    botao.setAttribute('aria-pressed', String(ativo));
  });

  const ativo = salvos.has(lookAtual);

  document.getElementById('curtir-detalhe').textContent =
    ativo ? '♥' : '♡';

  document.getElementById('salvar-look').textContent =
    ativo ? 'Look salvo' : 'Salvar look';
}

function alternarFavorito(id) {
  if (salvos.has(id)) {
    salvos.delete(id);
  } else {
    salvos.add(id);
  }

  guardarSalvos();
  atualizarFavoritos();
}

document.querySelectorAll('[data-favorito]').forEach(botao => {
  botao.addEventListener('click', evento => {
    evento.stopPropagation();
    alternarFavorito(botao.dataset.favorito);
  });
});

// ========================================
// ABRIR DETALHES
// ========================================

function abrirDetalhes(id) {
  const look = looks[id];

  if (!look) return;

  lookAtual = id;

  document.getElementById('titulo-look').textContent =
    look.titulo;

  document.getElementById('imagem-principal').src =
    look.imagem;

  document.getElementById('imagem-principal').alt =
    look.titulo;

  document.getElementById('descricao-look').textContent =
    look.descricao;

  document.getElementById('curtidas-look').textContent =
    look.curtidas;

  document.getElementById('visualizacoes-look').textContent =
    look.visualizacoes;

  document.getElementById('tags-look').innerHTML =
    look.tags.map(tag => `<span>${tag}</span>`).join('');

  document.getElementById('paleta-look').innerHTML =
    look.cores.map(cor =>
      `<span style="background:${cor}"></span>`
    ).join('');

  look.detalhes.forEach((imagem, indice) => {
    document.getElementById(
      `detalhe-imagem-${indice + 1}`
    ).src = imagem;
  });

  atualizarFavoritos();
  mostrarTela('tela-detalhes');
}

cards.forEach(card => {
  card.addEventListener('click', () => {
    abrirDetalhes(card.dataset.look);
  });
});

document.getElementById('voltar-explorar')
  .addEventListener('click', () => {
    mostrarTela('tela-explorar');
  });

// ========================================
// GALERIA DE IMAGENS
// ========================================

document.querySelectorAll('.foto-detalhe').forEach(botao => {
  botao.addEventListener('click', () => {
    const imagemClicada = botao.querySelector('img');
    const principal = document.getElementById('imagem-principal');

    const imagemAnterior = principal.src;
    const altAnterior = principal.alt;

    principal.src = imagemClicada.src;
    principal.alt = imagemClicada.alt;

    imagemClicada.src = imagemAnterior;
    imagemClicada.alt = altAnterior;
  });
});

// ========================================
// SALVAR E COMPARTILHAR
// ========================================

document.getElementById('curtir-detalhe')
  .addEventListener('click', () => {
    alternarFavorito(lookAtual);
  });

document.getElementById('salvar-look')
  .addEventListener('click', () => {
    alternarFavorito(lookAtual);
  });

document.getElementById('compartilhar-look')
  .addEventListener('click', async () => {
    const titulo = looks[lookAtual].titulo;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Vestiê Stile',
          text: `Confira este look: ${titulo}`,
          url: window.location.href
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${titulo} - ${window.location.href}`
        );
        alert('Link copiado!');
      } else {
        alert(titulo);
      }
    } catch (erro) {
      if (erro.name !== 'AbortError') {
        alert('Não foi possível compartilhar.');
      }
    }
  });

// ========================================
// QUIZ - CINCO PERGUNTAS
// ========================================

const perguntas = [
  {
    titulo: 'Qual look te representa mais?',
    opcoes: ['Casual', 'Urbano', 'Elegante', 'Clássico']
  },
  {
    titulo: 'Qual roupa você usaria para sair?',
    opcoes: ['Casual', 'Urbano', 'Elegante', 'Clássico']
  },
  {
    titulo: 'Qual estilo combina com seu dia a dia?',
    opcoes: ['Casual', 'Urbano', 'Elegante', 'Clássico']
  },
  {
    titulo: 'Qual combinação você escolheria?',
    opcoes: ['Casual', 'Urbano', 'Elegante', 'Clássico']
  },
  {
    titulo: 'Qual visual faz você se sentir melhor?',
    opcoes: ['Casual', 'Urbano', 'Elegante', 'Clássico']
  }
];

const opcoesEstilo = {
  Casual: {
    imagem: 'imagens/look-casual.png',
    look: 'casual',
    descricao:
      'Você prefere conforto, leveza e peças versáteis ' +
      'para aproveitar todos os momentos.'
  },
  Urbano: {
    imagem: 'imagens/look_urbano.png',
    look: 'urbano',
    descricao:
      'Você gosta de produções modernas, práticas ' +
      'e com personalidade.'
  },
  Elegante: {
    imagem: 'imagens/look-elegante.png',
    look: 'elegante',
    descricao:
      'Você valoriza sofisticação, harmonia e ' +
      'peças que se destacam pela elegância.'
  },
  Clássico: {
    imagem: 'imagens/look-trabalho.png',
    look: 'trabalho',
    descricao:
      'Você prefere peças atemporais, combinações ' +
      'refinadas e um visual equilibrado.'
  }
};

let perguntaAtual = 0;
let respostas = [];
let respostaSelecionada = null;
let estiloResultado = null;

function renderizarPergunta() {
  const pergunta = perguntas[perguntaAtual];

  document.getElementById('pergunta-quiz').textContent =
    pergunta.titulo;

  document.getElementById('numero-pergunta').textContent =
    `${perguntaAtual + 1}/${perguntas.length}`;

  document.getElementById('progresso-preenchido').style.width =
    `${((perguntaAtual + 1) / perguntas.length) * 100}%`;

  document.getElementById('opcoes-quiz').innerHTML =
    pergunta.opcoes.map(opcao => `
      <button class="opcao-estilo"
              data-estilo="${opcao}">
        <img src="${opcoesEstilo[opcao].imagem}"
             alt="Estilo ${opcao}">
        <span>${opcao}</span>
      </button>
    `).join('');

  respostaSelecionada = respostas[perguntaAtual] || null;

  document.querySelectorAll('.opcao-estilo').forEach(botao => {
    if (botao.dataset.estilo === respostaSelecionada) {
      botao.classList.add('selecionada');
    }

    botao.addEventListener('click', () => {
      respostaSelecionada = botao.dataset.estilo;

      document.querySelectorAll('.opcao-estilo')
        .forEach(item => item.classList.remove('selecionada'));

      botao.classList.add('selecionada');
    });
  });

  document.getElementById('proxima-pergunta').textContent =
    perguntaAtual === perguntas.length - 1
      ? 'Ver meu resultado '
      : 'Próximo ';
}

function iniciarQuiz() {
  perguntaAtual = 0;
  respostas = [];
  respostaSelecionada = null;
  renderizarPergunta();
  mostrarTela('tela-quiz');
}

document.getElementById('abrir-quiz')
  .addEventListener('click', iniciarQuiz);

document.getElementById('voltar-quiz')
  .addEventListener('click', () => {
    if (perguntaAtual > 0) {
      perguntaAtual--;
      renderizarPergunta();
    } else {
      mostrarTela('tela-explorar');
    }
  });

document.getElementById('proxima-pergunta')
  .addEventListener('click', () => {

    if (!respostaSelecionada) {
      alert('Escolha uma opção para continuar.');
      return;
    }

    respostas[perguntaAtual] = respostaSelecionada;

    if (perguntaAtual < perguntas.length - 1) {
      perguntaAtual++;
      renderizarPergunta();
    } else {
      finalizarQuiz();
    }
  });

// ========================================
// RESULTADO DO QUIZ
// ========================================

function finalizarQuiz() {
  const pontuacao = {
    Casual: 0,
    Urbano: 0,
    Elegante: 0,
    Clássico: 0
  };

  respostas.forEach(resposta => {
    pontuacao[resposta]++;
  });

  // Em caso de empate, considera a última
  // preferência entre os estilos empatados.
  const maior = Math.max(...Object.values(pontuacao));

  const empatados = Object.keys(pontuacao).filter(
    estilo => pontuacao[estilo] === maior
  );

  estiloResultado = [...respostas].reverse().find(
    estilo => empatados.includes(estilo)
  );

  const resultado = opcoesEstilo[estiloResultado];

  document.getElementById('estilo-resultado').textContent =
    estiloResultado;

  document.getElementById('imagem-resultado').src =
    resultado.imagem;

  document.getElementById('descricao-resultado').textContent =
    resultado.descricao;

  // Salva o nome do estilo usando a mesma chave lida em perfil.js.
  // O resultado permanece disponível mesmo depois de fechar ou atualizar o site.
  try {
    localStorage.setItem('vestieMeuEstilo', estiloResultado);
  } catch (erro) {
    console.warn('Não foi possível salvar o resultado do quiz.', erro);
  }

  mostrarTela('tela-resultado');
}

document.getElementById('explorar-resultado')
  .addEventListener('click', () => {

    const resultado = opcoesEstilo[estiloResultado];

    selecionarFiltro(
      resultado.look === 'trabalho' ? 'todos' : resultado.look
    );

    mostrarTela('tela-explorar');
  });

document.getElementById('refazer-quiz')
  .addEventListener('click', iniciarQuiz);

// Inicializar favoritos
atualizarFavoritos();

const parametros = new URLSearchParams(window.location.search);

if (parametros.get('quiz') === '1') {
  iniciarQuiz();
}
