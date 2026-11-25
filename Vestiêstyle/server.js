/* Servidor opcional sem dependências (Node.js 20+). A chave não chega ao browser. */
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const ROOT=__dirname,PORT=Number(process.env.PORT||3000),MAX_BODY=7*1024*1024;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.webp':'image/webp'};
function send(res,code,obj){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
const styles=new Set(['casual','elegante','festa','streetwear','role','trabalho','esportivo']);
function demo(estilo,ocasiao,pecas){const nomes=Object.values(pecas).map(p=>p.nome).join(', ');return {titulo:'Look '+estilo,descricao:`Combinação demonstrativa de ${nomes}${ocasiao?' para '+ocasiao:''}. Ajuste as proporções e experimente tons neutros para equilibrar as peças. Esta sugestão não analisa visualmente as imagens.`,cores:'Sugestão genérica: combine tons próximos ou um neutro com uma cor de destaque.',origem:'demo'};}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.method==='POST'&&req.url==='/api/generate'){
   let total=0,chunks=[];for await(const chunk of req){total+=chunk.length;if(total>MAX_BODY){send(res,413,{error:'Imagens grandes demais. Envie arquivos menores.'});return;}chunks.push(chunk);}
   let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{send(res,400,{error:'Dados inválidos.'});return;}
   const {estilo,ocasiao='',genero='nao_informar',pecas}=body||{};if(!styles.has(estilo)||!['feminino','masculino','neutro','nao_informar'].includes(genero)||typeof ocasiao!=='string'||ocasiao.length>70||!pecas||typeof pecas!=='object'||Array.isArray(pecas)){send(res,400,{error:'Estilo, ocasião ou peças inválidos.'});return;}
   const entradas=Object.entries(pecas);if(!entradas.length||entradas.length>4||entradas.some(([k,p])=>!['cima','baixo','calcado','acessorio'].includes(k)||!p||typeof p.nome!=='string'||p.nome.length>80||typeof p.imagem!=='string'||p.imagem.length>1500000||!(p.imagem.startsWith('data:image/jpeg;base64,')||(/^https?:\/\//.test(p.imagem)&&p.demo===true)))){send(res,400,{error:'Envie até quatro imagens válidas, uma por categoria.'});return;}
   if(!process.env.OPENAI_API_KEY){send(res,200,demo(estilo,ocasiao,pecas));return;}
   const content=[{type:'text',text:`Analise as fotos fornecidas de peças de roupas separadas pelas categorias indicadas. O usuário deseja estilo ${estilo}, ocasião ${ocasiao||'não especificada'}, preferência de gênero/apresentação ${genero} (sem restringir peças por gênero). Sugira uma combinação factível, explique harmonização de cores, avise quando não for possível identificar uma peça, seja inclusivo quanto a gênero. Responda SOMENTE JSON com strings: titulo, descricao, cores. Não afirme que foi feita simulação de caimento.`}];
   for(const [slot,p] of entradas){content.push({type:'text',text:`Categoria ${slot}: ${p.nome}`});if(p.imagem.startsWith('data:image/'))content.push({type:'image_url',image_url:{url:p.imagem,detail:'low'}});}
   const ai=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',messages:[{role:'user',content}],response_format:{type:'json_object'},max_tokens:550}),signal:AbortSignal.timeout(20000)});
   const raw=await ai.json();if(!ai.ok){console.error('IA status',ai.status,raw?.error?.type);send(res,502,{error:'Não foi possível consultar a IA. Verifique a chave, os créditos e o modelo configurado.'});return;}
   let out;try{out=JSON.parse(raw.choices[0].message.content);}catch{send(res,502,{error:'A IA retornou uma resposta inesperada.'});return;}
   send(res,200,{titulo:String(out.titulo||'Look personalizado').slice(0,120),descricao:String(out.descricao||'').slice(0,1800),cores:String(out.cores||'').slice(0,700),origem:'ia'});return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){send(res,405,{error:'Método não permitido'});return;}
  let url;try{url=new URL(req.url,'http://localhost');}catch{send(res,400,{error:'URL inválida'});return;}
  let file=path.resolve(ROOT,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(ROOT+path.sep)){send(res,403,{error:'Acesso negado'});return;}
  if(!mime[path.extname(file)]){send(res,404,{error:'Arquivo não encontrado'});return;}
  const data=await fs.readFile(file).catch(()=>null);if(!data){send(res,404,{error:'Arquivo não encontrado'});return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});if(req.method==='HEAD')res.end();else res.end(data);
 }catch(err){console.error(err.message);if(!res.headersSent)send(res,500,{error:'Falha interna do servidor.'});}
});
server.listen(PORT,()=>console.log('Vestiê Stile: http://localhost:'+PORT));
