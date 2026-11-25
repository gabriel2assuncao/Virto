/* Vestiê Stile — quatro referências demonstrativas e estúdio de looks. */
const produtos = document.querySelectorAll('.produto');
const selecionados = new Set();
const pecas = {cima:null,baixo:null,calcado:null,acessorio:null};
const categoriasPecas = {cima:'Parte de cima',baixo:'Parte de baixo / vestido',calcado:'Calçados',acessorio:'Acessórios'};
const botaoCriar = document.getElementById('criar-look');
const estudio = document.getElementById('estudio-look');
const mensagem = document.getElementById('mensagem-gerador');
const btnGerar = document.getElementById('gerar-look');
const preview = document.getElementById('resultado-gerador');
let slotUpload = null;
let resultadoAtual = null;
for(const produto of produtos){
  const slot=produto.dataset.slot;
  function alternar(){
    if(selecionados.has(slot))selecionados.delete(slot);else selecionados.add(slot);
    produto.classList.toggle('selecionado',selecionados.has(slot));
    produto.setAttribute('aria-pressed',String(selecionados.has(slot)));
  }
  produto.addEventListener('click',alternar);
  produto.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();alternar();}});
}
function abrirEstudio(){estudio.hidden=false;estudio.scrollIntoView({behavior:'smooth',block:'start'});}
botaoCriar.addEventListener('click',()=>{
  abrirEstudio();
  mensagem.textContent=selecionados.size
    ?'Referências selecionadas: '+[...selecionados].map(s=>categoriasPecas[s]).join(', ')+'. Adicione as fotos abaixo.'
    :'Adicione suas fotos usando Câmera ou Galeria.';
});
document.getElementById('fechar-estudio').addEventListener('click',()=>{estudio.hidden=true;});
const camera=document.getElementById('camera-peca'),galeria=document.getElementById('galeria-peca');
document.querySelectorAll('[data-upload]').forEach(btn=>btn.addEventListener('click',()=>{slotUpload=btn.dataset.upload;const input=btn.dataset.origem==='camera'?camera:galeria;input.value='';input.click();}));
async function receberImagem(event){const file=event.target.files?.[0];if(!file||!slotUpload)return;const slot=slotUpload;try{mensagem.textContent='Preparando imagem...';const imagem=await Vestie.imagemArquivo(file);pecas[slot]={nome:file.name.slice(0,80),imagem,demo:false};const pos=Object.keys(pecas).indexOf(slot);const alvo=document.querySelectorAll('.peca-preview')[pos];alvo.src=imagem;alvo.hidden=false;mensagem.textContent='Imagem adicionada em '+categoriasPecas[slot]+'.';}catch(e){mensagem.textContent=e.message;}}
camera.addEventListener('change',receberImagem);galeria.addEventListener('change',receberImagem);
function criarDemo(estilo,ocasiao,itens){const nomes=itens.map(([slot,p])=>p.nome||categoriasPecas[slot]);const contexto=ocasiao?` para ${ocasiao}`:'';const descricoes={casual:'Equilibre peças confortáveis e tons que conversem entre si.',elegante:'Prefira uma paleta harmoniosa e destaque apenas um elemento.',festa:'Valorize uma peça de destaque e use acessórios para complementar.',streetwear:'Combine proporções amplas com peças mais estruturadas.',role:'Aposte no equilíbrio entre conforto e personalidade.',trabalho:'Priorize praticidade, peças coordenadas e acessórios discretos.',esportivo:'Combine peças que permitam mobilidade e conforto.'};return {titulo:'Sua combinação '+estilo,descricao:`Sugestão demonstrativa${contexto}: ${nomes.join(' + ')}. ${descricoes[estilo]||descricoes.casual} Confira se as cores e o caimento combinam na prática.`,cores:'Harmonize tons próximos ou use um tom neutro para equilibrar peças contrastantes.',origem:'demo'};}
async function gerarRemoto(estilo,ocasiao,genero,itens){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({estilo,ocasiao,genero,pecas:Object.fromEntries(itens)}),signal:controller.signal});const json=await r.json().catch(()=>({}));if(!r.ok)throw new Error(json.error||'O serviço de IA não respondeu.');return json;}finally{clearTimeout(timeout);}}
document.getElementById('form-gerador').addEventListener('submit',async e=>{
  e.preventDefault();
  const estilo=document.getElementById('estilo-look').value;
  const ocasiao=document.getElementById('ocasiao-look').value.trim();
  const genero=document.getElementById('genero-look').value;
  const itens=Object.entries(pecas).filter(([,p])=>p);
  const normalizarTexto = texto => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const contextoNormalizado = normalizarTexto(`${estilo} ${ocasiao}`);
  const lookFemininoTrabalho = normalizarTexto(genero) === 'feminino' && contextoNormalizado.includes('trabalh');
  const lookCasualMasculino = normalizarTexto(genero) === 'masculino' && normalizarTexto(estilo) === 'casual';
  const imagemResultado=document.getElementById('imagem-look-gerado');

  btnGerar.disabled=true;
  btnGerar.textContent='Gerando look...';
  mensagem.textContent='Preparando sua combinação...';
  preview.hidden=true;
  imagemResultado.hidden=true;

  try{
    let look;
    if(lookCasualMasculino){
      look={id:crypto.randomUUID?.()||String(Date.now()),criadoEm:new Date().toISOString(),estilo,ocasiao,genero,pecas:{},titulo:'Look casual masculino',descricao:'Uma combinação casual com camiseta marrom lisa, calça jeans azul de modelagem ampla e tênis branco.',cores:'Marrom, azul jeans e branco.',origem:'demo',imagemResultado:'imagens/look-casual-masculino.jpeg',favorito:false};
      imagemResultado.src=look.imagemResultado;
      imagemResultado.alt='Look casual masculino com camiseta marrom, calça jeans larga e tênis branco';
      imagemResultado.hidden=false;
    }else if(lookFemininoTrabalho){
      look={id:crypto.randomUUID?.()||String(Date.now()),criadoEm:new Date().toISOString(),estilo,ocasiao,genero,pecas:{},titulo:'Look feminino para trabalho',descricao:'Uma combinação elegante e profissional: camisa azul listrada, calça preta de alfaiataria, scarpin preto e acessórios dourados.',cores:'Azul, preto e dourado.',origem:'demo',imagemResultado:'imagens/look-feminino-trabalho.jpeg',favorito:false};
      imagemResultado.src=look.imagemResultado;
      imagemResultado.alt='Look feminino para trabalho';
      imagemResultado.hidden=false;
    }else{
      if(!itens.length){mensagem.textContent='Adicione pelo menos uma peça. Para uma sugestão completa, envie parte de cima, parte de baixo e calçados.';return;}
      let res;
      try{res=await gerarRemoto(estilo,ocasiao,genero,itens);}
      catch(err){if(location.protocol==='file:'||err instanceof TypeError){res=criarDemo(estilo,ocasiao,itens);mensagem.textContent='Prévia local: para análise visual por IA, execute o servidor e configure OPENAI_API_KEY.';}else throw err;}
      look={id:crypto.randomUUID?.()||String(Date.now()),criadoEm:new Date().toISOString(),estilo,ocasiao,genero,pecas:Object.fromEntries(itens),titulo:String(res.titulo||'Look personalizado'),descricao:String(res.descricao||''),cores:String(res.cores||''),origem:res.origem==='ia'?'ia':'demo',favorito:false};
    }
    if (window.Vestie && typeof Vestie.salvarLook === 'function') Vestie.salvarLook(look);
    resultadoAtual=look;
    document.getElementById('resultado-titulo').textContent=look.titulo;
    document.getElementById('resultado-descricao').textContent=look.descricao;
    document.getElementById('resultado-cores').textContent=look.cores;
    document.getElementById('resultado-origem').textContent=look.imagemResultado?'Sugestão de look':'Sugestão ilustrativa, sem análise real de imagem';
    preview.classList.toggle('resultado-casual-masculino', lookCasualMasculino);
    preview.hidden=false;
    if(lookFemininoTrabalho || lookCasualMasculino)mensagem.textContent='Look gerado com sucesso!';
    else if(!mensagem.textContent.startsWith('Prévia local:'))mensagem.textContent='Look salvo no histórico deste navegador.';
    preview.scrollIntoView({behavior:'smooth',block:'nearest'});
  }catch(err){mensagem.textContent=err.name==='AbortError'?'O serviço demorou muito. Tente novamente.':err.message||'Não foi possível gerar o look.';}
  finally{btnGerar.disabled=false;btnGerar.textContent='Gerar look';}
});
document.getElementById('novo-look').addEventListener('click',()=>{for(const k in pecas)pecas[k]=null;document.querySelectorAll('.peca-preview').forEach(img=>{img.hidden=true;img.removeAttribute('src');});document.getElementById('imagem-look-gerado').hidden=true;document.getElementById('imagem-look-gerado').removeAttribute('src');preview.hidden=true;preview.classList.remove('resultado-casual-masculino');resultadoAtual=null;mensagem.textContent='Adicione novas peças para começar outra combinação.';});
const params=new URLSearchParams(location.search);
if(params.has('reabrir') && window.Vestie && typeof Vestie.historico === 'function'){const old=Vestie.historico().find(x=>x.id===params.get('reabrir'));if(old){abrirEstudio();document.getElementById('estilo-look').value=old.estilo||'casual';document.getElementById('ocasiao-look').value=old.ocasiao||'';document.getElementById('genero-look').value=old.genero||'nao_informar';for(const [slot,p] of Object.entries(old.pecas||{})){if(!(slot in pecas))continue;pecas[slot]=p;const index=Object.keys(pecas).indexOf(slot),img=document.querySelectorAll('.peca-preview')[index];img.src=p.imagem;img.hidden=false;}document.getElementById('resultado-titulo').textContent=old.titulo;document.getElementById('resultado-descricao').textContent=old.descricao;document.getElementById('resultado-cores').textContent=old.cores;document.getElementById('resultado-origem').textContent=old.origem==='ia'?'Análise gerada por IA':'Sugestão ilustrativa';preview.classList.toggle('resultado-casual-masculino', String(old.genero||'').toLowerCase()==='masculino' && String(old.estilo||'').toLowerCase()==='casual');if(old.imagemResultado){const imagemResultado=document.getElementById('imagem-look-gerado');imagemResultado.src=old.imagemResultado;imagemResultado.alt=old.genero==='masculino'?'Look casual masculino':'Look sugerido';imagemResultado.hidden=false;}preview.hidden=false;}}
