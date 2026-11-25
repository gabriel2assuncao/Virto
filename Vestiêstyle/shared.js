/* Vestiê Stile — utilitários compartilhados entre páginas. */
window.Vestie = (() => {
  const prefixo = 'vestieLooksCriados';
  function ler(chave, padrao) { try { const valor=JSON.parse(localStorage.getItem(chave)); return valor ?? padrao; } catch { return padrao; } }
  function salvar(chave, valor) { localStorage.setItem(chave, JSON.stringify(valor)); }
  const historico=()=>{const x=ler(prefixo,[]);return Array.isArray(x)?x:[];};
  function salvarLook(look) { const lista=historico(); lista.unshift(look); salvar(prefixo,lista.slice(0,25)); }
  function imagemArquivo(file) { return new Promise((resolve,reject)=>{
    if(!file || !file.type.startsWith('image/'))return reject(new Error('Selecione uma imagem válida.'));
    if(file.size>8*1024*1024)return reject(new Error('A imagem deve ter no máximo 8 MB.'));
    const fr=new FileReader();fr.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));fr.onload=()=>{
      const img=new Image();img.onerror=()=>reject(new Error('Imagem inválida.'));img.onload=()=>{
        const escala=Math.min(1,840/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*escala));canvas.height=Math.max(1,Math.round(img.height*escala));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.72));};img.src=fr.result;
    };fr.readAsDataURL(file);
  }); }
  function svgFaltante(texto='Peça de moda') {
    const label=texto.replace(/[<>&"']/g,'').slice(0,34);
    return 'assets/sem-imagem.svg';
  }
  function corrigirImagens(){document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>{if(!img.dataset.fallback){img.dataset.fallback='1';img.src=svgFaltante(img.alt);}});if(img.complete && img.naturalWidth===0){img.src=svgFaltante(img.alt);}});}
  document.addEventListener('DOMContentLoaded',corrigirImagens);
  return {ler,salvar,historico,salvarLook,imagemArquivo,corrigirImagens};
})();