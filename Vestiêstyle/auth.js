document.querySelector('form')?.addEventListener('submit',event=>{
  event.preventDefault();const email=document.querySelector('#email').value.trim().toLowerCase();const nome=document.querySelector('#nome')?.value.trim();
  if(!document.querySelector('form').reportValidity())return;
  const perfil=Vestie.ler('vestiePerfil',{});
  if(nome){perfil.nome=nome;Vestie.salvar('vestiePerfil',perfil);}
  sessionStorage.setItem('vestieSessaoDemo',JSON.stringify({email,nome:nome||perfil.nome||'Visitante'}));
  window.location.href='home.html';
});