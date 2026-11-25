(function () {
'use strict';

// ---- VERSÃO / DIAGNÓSTICO (abra perfil.html?debug=1 para ver) ----
const VERSAO = 'perfil.js v5';
const errosPagina = [];
window.addEventListener('error', e => errosPagina.push(e.message));

// Busca elemento por id; se não existir, devolve um elemento solto para
// o script não quebrar inteiro por causa de um detalhe do HTML.
function $(id) {
  return document.getElementById(id) || document.createElement('div');
}

function mostrarDiagnostico() {
  if (new URLSearchParams(location.search).get('debug') !== '1') return;

  const caixa = document.createElement('div');
  caixa.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:99999;padding:8px;' +
    'background:#111;color:#7CFC00;font:12px monospace;' +
    'white-space:pre-wrap;max-height:45vh;overflow:auto';

  const uso = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      uso.push(k + ': ' + Math.round((localStorage.getItem(k) || '').length / 1024) + ' KB');
    }
  } catch (e) {
    uso.push('localStorage bloqueado: ' + e.message);
  }

  caixa.textContent =
    VERSAO + ' carregado\nErros: ' +
    (errosPagina.join(' | ') || 'nenhum') + '\n' + (uso.join('\n') || '(localStorage vazio)') + '\n';

  const limpar = document.createElement('button');
  limpar.textContent = 'Limpar dados do app e recarregar';
  limpar.style.cssText = 'margin-top:6px;padding:8px;font:12px sans-serif';
  limpar.addEventListener('click', () => {
    try { localStorage.clear(); } catch (e) {}
    location.reload();
  });
  caixa.appendChild(limpar);
  document.body.appendChild(caixa);
}
window.addEventListener('load', () => setTimeout(mostrarDiagnostico, 0));


// ==================================
// VESTIÊ STILE - PERFIL
// ==================================

const paginas = document.querySelectorAll('.pagina');
const tituloPagina = $('titulo-pagina');

let paginaAtual = 'pagina-perfil';

// ==================================
// NAVEGAÇÃO INTERNA
// ==================================

function mostrarPagina(id) {
  paginas.forEach(pagina => {
    pagina.classList.toggle('ativa', pagina.id === id);
  });

  paginaAtual = id;

  const titulos = {
    'pagina-perfil': '',
    'pagina-editar': 'Editar perfil',
    'pagina-estilo': 'Meu estilo',
    'pagina-salvos': 'Looks salvos',
    'pagina-preferencias': 'Preferências',
    'pagina-configuracoes': 'Configurações'
  };

  // O título não existe no HTML; sem esta verificação o script quebrava aqui
  // e o "Meu estilo" nunca era atualizado.
  if (tituloPagina) tituloPagina.textContent = titulos[id] || '';

  $('btn-config-topo').style.visibility =
    id === 'pagina-perfil' ? 'visible' : 'hidden';

  carregarLooksSalvos();
  carregarMeuEstilo();

  window.scrollTo({ top: 0, behavior: 'instant' });
}

document.querySelectorAll('[data-pagina]').forEach(botao => {
  botao.addEventListener('click', () => {
    mostrarPagina(botao.dataset.pagina);
  });
});

$('btn-config-topo')
  .addEventListener('click', () => {
    mostrarPagina('pagina-configuracoes');
  });

$('editar-perfil')
  .addEventListener('click', () => {
    mostrarPagina('pagina-editar');
  });

$('atalho-salvos')
  .addEventListener('click', () => {
    mostrarPagina('pagina-salvos');
  });

(document.querySelector('.voltar') || document.createElement('a'))
  .addEventListener('click', evento => {
    if (paginaAtual !== 'pagina-perfil') {
      evento.preventDefault();
      mostrarPagina('pagina-perfil');
    }
  });

// Contadores demonstrativos
['btn-seguidores', 'btn-seguindo'].forEach(id => {
  $(id).addEventListener('click', () => {
    alert('A lista de usuários estará disponível futuramente.');
  });
});

// ==================================
// DADOS DO PERFIL
// ==================================

const nomeUsuario = $('nome-usuario');
const bioUsuario = $('bio-usuario');

const editarNome = $('editar-nome');
const editarBio = $('editar-bio');

const fotoUsuario = $('foto-usuario');
const previewFoto = $('preview-foto');

let dadosPerfil = {
  nome: 'apollo',
  bio: 'Estilo é uma forma de se expressar.',
  foto: 'imagens/foto-perfil.jpg'
};

try {
  const dadosSalvos = JSON.parse(
    localStorage.getItem('vestiePerfil') || 'null'
  );

  if (dadosSalvos && typeof dadosSalvos === 'object' && !Array.isArray(dadosSalvos)) {
    dadosPerfil = { ...dadosPerfil, ...dadosSalvos };
  }
} catch (erro) {
  console.warn('Não foi possível carregar o perfil.');
}

function atualizarPerfil() {
  nomeUsuario.textContent = dadosPerfil.nome || 'apollo';
  bioUsuario.textContent = dadosPerfil.bio;

  editarNome.value = dadosPerfil.nome;
  editarBio.value = dadosPerfil.bio;

  fotoUsuario.src = dadosPerfil.foto || 'imagens/foto-perfil.jpg';
  previewFoto.src = dadosPerfil.foto || 'imagens/foto-perfil.jpg';
}

function salvarPerfil() {
  try {
    localStorage.setItem(
      'vestiePerfil',
      JSON.stringify(dadosPerfil)
    );
    return true;
  } catch (erro) {
    alert('Não foi possível salvar o perfil neste navegador.');
    return false;
  }
}

// Preenche nome, bio e foto imediatamente
atualizarPerfil();

// ==================================
// EDITAR NOME E BIOGRAFIA
// ==================================

$('form-editar')
  .addEventListener('submit', evento => {
    evento.preventDefault();

    const nome = editarNome.value.trim();
    const bio = editarBio.value.trim();

    if (!nome) {
      alert('Digite um nome de usuário.');
      return;
    }

    dadosPerfil.nome = nome;
    dadosPerfil.bio = bio;

    if (salvarPerfil()) {
      atualizarPerfil();
      mostrarPagina('pagina-perfil');
    }
  });

// ==================================
// ALTERAR FOTO
// ==================================

$('nova-foto')
  .addEventListener('change', evento => {

    const arquivo = evento.target.files[0];

    if (!arquivo) return;

    if (arquivo.type && !arquivo.type.startsWith('image/')) {
      alert('Selecione uma imagem válida.');
      return;
    }

    // Fotos de celular costumam ter vários MB e estouram o localStorage.
    // Por isso a imagem é reduzida e comprimida antes de salvar.
    aplicarFoto(arquivo).finally(() => { evento.target.value = ''; });
  });

// Reduz a imagem (lado maior = max px) e devolve um JPEG em base64
function reduzirImagem(arquivo, max, qualidade) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();

    img.onload = () => {
      const escala = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', qualidade));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('imagem inválida'));
    };

    img.src = url;
  });
}

// Reduz, salva e mostra a foto. Se o armazenamento estiver apertado,
// tenta de novo com versões menores.
async function aplicarFoto(arquivo) {
  const tentativas = [[500, 0.8], [320, 0.7], [200, 0.6]];

  for (const [max, qualidade] of tentativas) {
    let foto;

    try {
      foto = await reduzirImagem(arquivo, max, qualidade);
    } catch (erro) {
      alert('Não foi possível carregar essa imagem.');
      return;
    }

    const anterior = dadosPerfil.foto;
    dadosPerfil.foto = foto;

    try {
      localStorage.setItem('vestiePerfil', JSON.stringify(dadosPerfil));
      atualizarPerfil();
      return;
    } catch (erro) {
      dadosPerfil.foto = anterior;
    }
  }

  alert('Não foi possível salvar a foto: o armazenamento do navegador está cheio.');
}

// ==================================
// LOOKS SALVOS
// ==================================

const looksDisponiveis = {
  casual: {
    nome: 'Look casual',
    imagem: 'imagens/look-casual.jpg'
  },
  urbano: {
    nome: 'Look urbano',
    imagem: 'imagens/look-urbano.jpg'
  },
  elegante: {
    nome: 'Look elegante',
    imagem: 'imagens/look-elegante.jpg'
  },
  trabalho: {
    nome: 'Look para trabalho',
    imagem: 'imagens/look-trabalho.jpg'
  }
};

function obterLooksSalvos() {
  try {
    const salvos = JSON.parse(
      localStorage.getItem('vestieLooksSalvos') || '[]'
    );

    return Array.isArray(salvos) ? salvos : [];
  } catch {
    return [];
  }
}

function carregarLooksSalvos() {
  const salvos = obterLooksSalvos();

  const grade = $('grade-salvos');
  const vazio = $('salvos-vazio');

  // Mostra a quantidade real de looks salvos
  $('numero-looks').textContent =
    salvos.length;

  grade.innerHTML = '';

  const looksValidos = salvos.filter(id => looksDisponiveis[id]);

  vazio.style.display =
    looksValidos.length === 0 ? 'block' : 'none';

  looksValidos.forEach(id => {
    const look = looksDisponiveis[id];

    const card = document.createElement('article');
    card.className = 'look-salvo';

    const imagem = document.createElement('img');
    imagem.src = look.imagem;
    imagem.alt = look.nome;

    const info = document.createElement('div');
    info.className = 'look-salvo-info';

    const titulo = document.createElement('h3');
    titulo.textContent = look.nome;

    const remover = document.createElement('button');
    remover.textContent = '♡ Remover dos salvos';

    remover.addEventListener('click', () => {
      const atualizados = obterLooksSalvos()
        .filter(item => item !== id);

      localStorage.setItem(
        'vestieLooksSalvos',
        JSON.stringify(atualizados)
      );

      carregarLooksSalvos();
    });

    info.append(titulo, remover);
    card.append(imagem, info);
    grade.appendChild(card);
  });
}

// ==================================
// MEU ESTILO
// ==================================

const estilos = {
  Casual: {
    imagem: 'imagens/look-casual.png',
    descricao:
      'Você prefere conforto, leveza e peças versáteis ' +
      'para aproveitar todos os momentos.'
  },
  Urbano: {
    imagem: 'imagens/look_urbano.png',
    descricao:
      'Você gosta de produções modernas, práticas ' +
      'e com personalidade.'
  },
  Elegante: {
    imagem: 'imagens/look-elegante.png',
    descricao:
      'Você valoriza sofisticação, harmonia e ' +
      'peças que se destacam pela elegância.'
  },
  'Clássico': {
    imagem: 'imagens/look-trabalho.png',
    descricao:
      'Você prefere peças atemporais, combinações ' +
      'refinadas e um visual equilibrado.'
  }
};

function carregarMeuEstilo() {
  let estiloSalvo = null;

  try {
    estiloSalvo = localStorage.getItem('vestieMeuEstilo');
  } catch (erro) {
    console.warn('Não foi possível acessar o resultado do quiz.', erro);
  }

  const estilo = estilos[estiloSalvo];

  const nome = $('nome-estilo');
  const imagem = $('imagem-estilo');
  const descricao = $('descricao-estilo');

  // Elementos do cartão de estilo exibido no perfil principal.
  const textoCartao = document.querySelector('.estilo-info p');
  const imagemCartao = document.querySelector('.estilo-imagem img');

  if (estilo) {
    if (nome) nome.textContent = estiloSalvo;

    if (imagem) {
      imagem.src = estilo.imagem;
      imagem.alt = `Look do estilo ${estiloSalvo}`;
    }

    if (descricao) descricao.textContent = estilo.descricao;

    if (textoCartao) {
      textoCartao.textContent = `Seu estilo: ${estiloSalvo}`;
    }

    if (imagemCartao) {
      imagemCartao.src = estilo.imagem;
      imagemCartao.alt = `Look do estilo ${estiloSalvo}`;
    }
  } else {
    if (nome) nome.textContent = 'Descubra seu estilo';

    if (descricao) {
      descricao.textContent =
        'Faça o quiz e descubra as combinações ' +
        'que mais combinam com você.';
    }

    if (textoCartao) textoCartao.textContent = 'Seu estilo: Não definido';
  }
}

// Atualiza o estilo ao voltar para a página (ex.: botão voltar do navegador)
window.addEventListener('pageshow', carregarMeuEstilo);

// ==================================
// PREFERÊNCIAS
// ==================================

let preferencias = {
  estilos: [],
  cores: []
};

try {
  const armazenadas = JSON.parse(
    localStorage.getItem('vestiePreferencias') || 'null'
  );

  if (armazenadas && typeof armazenadas === 'object') {
    preferencias = {
      ...armazenadas,
      estilos: Array.isArray(armazenadas.estilos) ? armazenadas.estilos : [],
      cores: Array.isArray(armazenadas.cores) ? armazenadas.cores : []
    };
  }
} catch {
  console.warn('Preferências não disponíveis.');
}

document.querySelectorAll('.chip').forEach(botao => {
  const estilo = botao.dataset.estilo;

  if (preferencias.estilos.includes(estilo)) {
    botao.classList.add('selecionado');
  }

  botao.addEventListener('click', () => {
    botao.classList.toggle('selecionado');
  });
});

document.querySelectorAll('.cor-preferencia').forEach(botao => {
  const cor = botao.dataset.cor;

  if (preferencias.cores.includes(cor)) {
    botao.classList.add('selecionada');
  }

  botao.addEventListener('click', () => {
    botao.classList.toggle('selecionada');
  });
});

$('salvar-preferencias')
  .addEventListener('click', () => {

    preferencias.estilos = [
      ...document.querySelectorAll('.chip.selecionado')
    ].map(item => item.dataset.estilo);

    preferencias.cores = [
      ...document.querySelectorAll(
        '.cor-preferencia.selecionada'
      )
    ].map(item => item.dataset.cor);

    try {
      localStorage.setItem(
        'vestiePreferencias',
        JSON.stringify(preferencias)
      );

      alert('Preferências salvas com sucesso!');
      mostrarPagina('pagina-perfil');
    } catch {
      alert('Não foi possível salvar as preferências.');
    }
  });

// ==================================
// INICIALIZAÇÃO
// ==================================

atualizarPerfil();
carregarLooksSalvos();
carregarMeuEstilo();
mostrarPagina('pagina-perfil');

// ==================================
// HISTÓRICO DE LOOKS GERADOS LOCALMENTE
// ==================================
function carregarHistorico() {
  const grade=$('grade-historico');
  if(!grade)return;
  grade.replaceChildren();
  const lista=(window.Vestie&&Vestie.historico)?Vestie.historico():[];
  for(const look of lista){
    const card=document.createElement('article');card.className='look-salvo';
    const img=document.createElement('img');img.alt=look.titulo||'Look criado';img.src=Object.values(look.pecas||{})[0]?.imagem||'assets/sem-imagem.svg';
    const info=document.createElement('div');info.className='look-salvo-info';
    const titulo=document.createElement('h3');titulo.textContent=look.titulo||'Look personalizado';
    const data=document.createElement('p');data.textContent=(look.estilo||'Look')+' • '+new Date(look.criadoEm).toLocaleDateString('pt-BR')+(look.origem==='ia'?' • IA':' • Prévia');
    const acoes=document.createElement('div');acoes.className='mini-acoes';
    const reabrir=document.createElement('a');reabrir.href='montar.html?reabrir='+encodeURIComponent(look.id);reabrir.textContent='Reabrir';
    const favorito=document.createElement('button');favorito.type='button';favorito.textContent=look.favorito?'♥ Favorito':'♡ Favoritar';favorito.addEventListener('click',()=>{const atual=Vestie.historico();const item=atual.find(x=>x.id===look.id);if(item){item.favorito=!item.favorito;Vestie.salvar('vestieLooksCriados',atual);carregarHistorico();}});
    const excluir=document.createElement('button');excluir.type='button';excluir.textContent='Excluir';excluir.addEventListener('click',()=>{if(confirm('Excluir este look do histórico?')){Vestie.salvar('vestieLooksCriados',Vestie.historico().filter(x=>x.id!==look.id));carregarHistorico();carregarLooksSalvos();}});
    acoes.append(reabrir,favorito,excluir);info.append(titulo,data,acoes);card.append(img,info);grade.append(card);
  }
  if(!lista.length){const p=document.createElement('p');p.textContent='Você ainda não criou looks. Comece na aba Montar.';p.className='descricao-secao';grade.append(p);}
  const numero=$('numero-looks');numero.textContent=lista.length+obterLooksSalvos().length;
  $('salvos-vazio').style.display=lista.length||obterLooksSalvos().length?'none':'block';
}
const carregarLooksSalvosOriginal=carregarLooksSalvos;
carregarLooksSalvos=function(){carregarLooksSalvosOriginal();carregarHistorico();};
carregarHistorico();
// câmera frontal e fallback pela galeria
// o input da câmera não existia no HTML; agora é criado aqui
let cameraPerfil=$('nova-foto-camera');
if(!cameraPerfil){
  cameraPerfil=document.createElement('input');
  cameraPerfil.type='file';cameraPerfil.accept='image/*';cameraPerfil.setAttribute('capture','user');cameraPerfil.hidden=true;
  document.body.appendChild(cameraPerfil);
}
$('foto-camera')?.addEventListener('click',()=>cameraPerfil.click());
cameraPerfil.addEventListener('change',e=>{
  const file=e.target.files?.[0];if(!file)return;
  aplicarFoto(file).finally(()=>{e.target.value='';});
});
// fotos pela galeria também são otimizadas para evitar exceder o espaço local
const galeriaPerfil=$('nova-foto');
// listener original permanece como fallback.
if(new URLSearchParams(location.search).get('salvos')==='1')mostrarPagina('pagina-salvos');

})();
