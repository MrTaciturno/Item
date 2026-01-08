
    // Mostra/esconde menu disco
    function toggleDiscoMenu() {
      const menu = document.getElementById('disco-opcoes');
      menu.classList.toggle('ativa');
      setTimeout(()=>{
        if(menu.classList.contains('ativa')){
          document.addEventListener('click', cliqueFora);
        } else {
          document.removeEventListener('click', cliqueFora);
        }
      },25);
    }
    function cliqueFora(e){
      const menu = document.getElementById('disco-opcoes');
      const botao = document.querySelector('.botao-mais');
      if (!menu.contains(e.target) && !botao.contains(e.target)) {
        menu.classList.remove('ativa');
        document.removeEventListener('click', cliqueFora);
      }
    }

    // Botão incluir foto
    function adicionarFoto() {
      document.getElementById('input-foto').click();
    }
    function handleFoto(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e){
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "220px";
        img.style.margin = "14px 0";
        document.getElementById('preview-items').appendChild(img);
      }
      reader.readAsDataURL(file);
      // Limpar input p/ permitir múltiplas seleções iguais
      event.target.value = '';
    }

    // Botão incluir texto
    function adicionarTexto() {
      const texto = prompt('Digite o texto a incluir:');
      if (texto && texto.trim() !== '') {
        const p = document.createElement('p');
        p.textContent = texto;
        p.style.margin = "12px 0";
        p.style.fontSize = "1.1rem";
        document.getElementById('preview-items').appendChild(p);
      }
    }

    // Opções do menu disco
    function incluirOpcao(tipo) {
      let elem;
      switch(tipo.toLowerCase()) {
        case 'perito':
          elem = document.createElement('p');
          elem.innerHTML = "<b>Perito:</b> <span style='color:#2774ae;'>[nome do perito]</span>";
          elem.style.margin = "10px 0 10px 0";
          break;
        case 'data':
          elem = document.createElement('p');
          elem.innerHTML = "<b>Data:</b> <span style='color:#19324d;'>"+ (new Date()).toLocaleDateString() +"</span>";
          elem.style.margin = "10px 0 10px 0";
          break;
        case 'geral':
          elem = document.createElement('hr');
          elem.style.margin = "14px 0";
          break;
      }
      if (elem) document.getElementById('preview-items').appendChild(elem);
      // Fecha o menu após inclusão
      document.getElementById('disco-opcoes').classList.remove('ativa');
      document.removeEventListener('click', cliqueFora);
    }
  