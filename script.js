// Aitem - Sistema de Elaboração e Automação de Laudos Periciais
// Main Application Script with 100% Pure Live Preview DOM Export & Static Calculated Page Count

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // REGISTRO DE SERVICE WORKER (PWA OFFLINE)
  // ==========================================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[Aitem PWA] Service Worker registrado com sucesso:', reg.scope))
      .catch(err => console.warn('[Aitem PWA] Falha ao registrar Service Worker:', err));
  }

  // ==========================================
  // ESTADO GLOBAL DA APLICAÇÃO (LAUDO STATE)
  // ==========================================
  const laudoState = {
    preambulo: {
      dataDesignacao: '29 de agosto de 2026',
      protocolo: 'P01412/26',
      laudoNum: '162836/2026'
    },
    objetivo: {
      boNum: 'EM7833-1/2026',
      delElaboracao: 'Del. Pol. Monte Mor',
      delCircunscricao: '1DP Hortolândia',
      naturezaExame: 'Constatar funcionalidade'
    },
    lacres: [
      { id: 1, letra: 'a', numero: '030310' }
    ],
    objetos: [],
    fotos: [],
    fechamento: {
      lacreSaida: 'invólucro plástico (de lacre informado na capa deste laudo)',
      dataElaboracao: 'Americana, 29 de agosto de 2026',
      nomePerito: 'Perito Criminal Signatário',
      textoCustom: ''
    },
    compendioData: null,
    selectedCategory: null
  };

  // ==========================================
  // HELPER NUMERAÇÃO POR EXTENSO
  // ==========================================
  function numeroParaExtenso(num) {
    const n = parseInt(num) || 1;
    const extensos = {
      1: 'uma',
      2: 'duas',
      3: 'três',
      4: 'quatro',
      5: 'cinco',
      6: 'seis',
      7: 'sete',
      8: 'oito',
      9: 'nove',
      10: 'dez'
    };
    return extensos[n] || `${n}`;
  }

  // ==========================================
  // INICIALIZAÇÃO DE ELEMENTOS DO DOM
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Preâmbulo / Objetivo Inputs
  const inputDataDesignacao = document.getElementById('input-data-designacao');
  const inputProtocolo = document.getElementById('input-protocolo');
  const inputLaudoNum = document.getElementById('input-laudo-num');
  const inputBoNum = document.getElementById('input-bo-num');
  const inputDelElaboracao = document.getElementById('input-del-elaboracao');
  const inputDelCircunscricao = document.getElementById('input-del-circunscricao');
  const inputNaturezaExame = document.getElementById('input-natureza-exame');

  // Lacres Elements
  const lacresContainer = document.getElementById('lacres-container');
  const inputNovoLacreNum = document.getElementById('input-novo-lacre-num');
  const btnAddLacre = document.getElementById('btn-add-lacre');
  const selectObjetoLacre = document.getElementById('select-objeto-lacre');

  // Fechamento Inputs
  const inputLacreSaida = document.getElementById('input-lacre-saida');
  const inputDataElaboracao = document.getElementById('input-data-elaboracao');
  const inputNomePerito = document.getElementById('input-nome-perito');
  const inputTextoFechamentoCustom = document.getElementById('input-texto-fechamento-custom');

  // Preferences Inputs
  const prefNomePerito = document.getElementById('pref-nome-perito');
  const prefDelElaboracao = document.getElementById('pref-del-elaboracao');
  const prefCidade = document.getElementById('pref-cidade');
  const btnSavePreferences = document.getElementById('btn-save-preferences');
  const inputCustomCompendioFile = document.getElementById('input-custom-compendio-file');
  const btnImportCompendio = document.getElementById('btn-import-compendio');
  const btnResetCompendio = document.getElementById('btn-reset-compendio');

  // OCR Elements
  const ocrFileInput = document.getElementById('ocr-file-input');
  const ocrPastedText = document.getElementById('ocr-pasted-text');
  const btnParseText = document.getElementById('btn-parse-text');
  const ocrStatus = document.getElementById('ocr-status');
  const ocrStatusText = document.getElementById('ocr-status-text');
  const ocrResultsSummary = document.getElementById('ocr-results-summary');
  const ocrDetectedFieldsList = document.getElementById('ocr-detected-fields-list');

  // Compêndio & Objetos
  const compendioCategoriesContainer = document.getElementById('compendio-categories');
  const objetoFormContainer = document.getElementById('objeto-form-container');
  const formDinamicoObjeto = document.getElementById('form-dinamico-objeto');
  const btnSalvarObjeto = document.getElementById('btn-salvar-objeto');
  const btnCancelarObjeto = document.getElementById('btn-cancelar-objeto');
  const objetosLista = document.getElementById('objetos-lista');

  // Fotos Elements
  const inputFotosUpload = document.getElementById('input-fotos-upload');
  const btnTriggerFotoUpload = document.getElementById('btn-trigger-foto-upload');
  const fotosGallery = document.getElementById('fotos-gallery');

  // Download Button & Editable Content Pane
  const btnExportDocx = document.getElementById('btn-export-docx');
  const previewEditableContent = document.getElementById('preview-editable-content');

  // ==========================================
  // NAVEGAÇÃO DE ABAS
  // ==========================================
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // ==========================================
  // LOCALSTORAGE: PREFERÊNCIAS E COMPÊNDIO
  // ==========================================
  function loadUserPreferences() {
    const savedNome = localStorage.getItem('aitem_pref_nome_perito');
    const savedDel = localStorage.getItem('aitem_pref_del_elaboracao');
    const savedCidade = localStorage.getItem('aitem_pref_cidade');

    if (savedNome) {
      prefNomePerito.value = savedNome;
      laudoState.fechamento.nomePerito = savedNome;
      inputNomePerito.value = savedNome;
    }
    if (savedDel) {
      prefDelElaboracao.value = savedDel;
      laudoState.objetivo.delElaboracao = savedDel;
      inputDelElaboracao.value = savedDel;
    }
    if (savedCidade) {
      prefCidade.value = savedCidade;
      laudoState.fechamento.dataElaboracao = `${savedCidade}, ${laudoState.preambulo.dataDesignacao}`;
      inputDataElaboracao.value = laudoState.fechamento.dataElaboracao;
    }
  }

  btnSavePreferences.addEventListener('click', () => {
    localStorage.setItem('aitem_pref_nome_perito', prefNomePerito.value.trim());
    localStorage.setItem('aitem_pref_del_elaboracao', prefDelElaboracao.value.trim());
    localStorage.setItem('aitem_pref_cidade', prefCidade.value.trim());

    if (prefNomePerito.value.trim()) {
      laudoState.fechamento.nomePerito = prefNomePerito.value.trim();
      inputNomePerito.value = prefNomePerito.value.trim();
    }
    if (prefDelElaboracao.value.trim()) {
      laudoState.objetivo.delElaboracao = prefDelElaboracao.value.trim();
      inputDelElaboracao.value = prefDelElaboracao.value.trim();
    }
    if (prefCidade.value.trim()) {
      laudoState.fechamento.dataElaboracao = `${prefCidade.value.trim()}, ${laudoState.preambulo.dataDesignacao}`;
      inputDataElaboracao.value = laudoState.fechamento.dataElaboracao;
    }

    updatePreview();
    alert('Preferências salvas com sucesso no navegador!');
  });

  // ==========================================
  // CARREGAR COMPÊNDIO JSON / CUSTOMIZADO
  // ==========================================
  async function loadCompendio() {
    try {
      const savedCompendio = localStorage.getItem('aitem_custom_compendio');
      if (savedCompendio) {
        laudoState.compendioData = JSON.parse(savedCompendio);
      } else {
        const resp = await fetch('compendio.json');
        laudoState.compendioData = await resp.json();
      }
      renderCompendioCategories();
    } catch (err) {
      console.error('Erro ao carregar compêndio:', err);
    }
  }

  btnImportCompendio.addEventListener('click', () => inputCustomCompendioFile.click());

  inputCustomCompendioFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const customData = JSON.parse(event.target.result);
        if (!customData.categorias || !Array.isArray(customData.categorias)) {
          throw new Error('Formato do JSON inválido. Deve conter a chave "categorias".');
        }
        laudoState.compendioData = customData;
        localStorage.setItem('aitem_custom_compendio', JSON.stringify(customData));
        renderCompendioCategories();
        alert('Compêndio customizado importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar compêndio JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  btnResetCompendio.addEventListener('click', async () => {
    if (confirm('Deseja restaurar o compêndio padrão do sistema?')) {
      localStorage.removeItem('aitem_custom_compendio');
      await loadCompendio();
      alert('Compêndio padrão restaurado!');
    }
  });

  function renderCompendioCategories() {
    if (!laudoState.compendioData || !laudoState.compendioData.categorias) return;
    compendioCategoriesContainer.innerHTML = '';

    laudoState.compendioData.categorias.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `<span class="icon">${cat.icone}</span><span>${cat.nome}</span>`;
      card.addEventListener('click', () => selectCategory(cat));
      compendioCategoriesContainer.appendChild(card);
    });
  }

  function selectCategory(category) {
    laudoState.selectedCategory = category;
    
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    document.getElementById('objeto-form-title').innerText = `Preencher: ${category.nome}`;
    renderObjetoLacreSelect();
    renderDynamicForm(category);
    objetoFormContainer.classList.remove('hidden');
  }

  // ==========================================
  // GESTÃO DE MÚLTIPLOS LACRES
  // ==========================================
  function renderLacresUI() {
    lacresContainer.innerHTML = '';
    const letras = 'abcdefghijklmnopqrstuvwxyz';

    laudoState.lacres.forEach((lacre, idx) => {
      lacre.letra = letras[idx] || `${idx + 1}`;
      const tag = document.createElement('div');
      tag.className = 'lacre-tag';
      tag.innerHTML = `
        <span><strong>${laudoState.lacres.length > 1 ? `${lacre.letra}. ` : ''}</strong>Lacre nº ${lacre.numero}</span>
        ${laudoState.lacres.length > 1 ? `<span class="remove-btn" onclick="removerLacre(${lacre.id})">×</span>` : ''}
      `;
      lacresContainer.appendChild(tag);
    });

    renderObjetoLacreSelect();
    updatePreview();
  }

  function renderObjetoLacreSelect() {
    selectObjetoLacre.innerHTML = '';
    laudoState.lacres.forEach(lacre => {
      const opt = document.createElement('option');
      opt.value = lacre.id;
      opt.innerText = laudoState.lacres.length > 1 
        ? `Lacre ${lacre.letra}. (nº ${lacre.numero})` 
        : `Lacre nº ${lacre.numero}`;
      selectObjetoLacre.appendChild(opt);
    });
  }

  btnAddLacre.addEventListener('click', () => {
    const num = inputNovoLacreNum.value.trim();
    if (!num) return;

    const novoLacre = {
      id: Date.now(),
      letra: '',
      numero: num
    };

    laudoState.lacres.push(novoLacre);
    inputNovoLacreNum.value = '';
    renderLacresUI();
  });

  window.removerLacre = function(id) {
    if (laudoState.lacres.length <= 1) return;
    laudoState.lacres = laudoState.lacres.filter(l => l.id !== id);
    renderLacresUI();
  };

  // ==========================================
  // FORMULÁRIO DINÂMICO E OPÇÃO "[OMITIR]"
  // ==========================================
  function renderDynamicForm(category) {
    formDinamicoObjeto.innerHTML = '';

    category.campos.forEach(campo => {
      const group = document.createElement('div');
      group.className = `form-group ${campo.tipo === 'textarea' ? 'full-width' : ''}`;
      
      const label = document.createElement('label');
      label.innerText = campo.label;
      group.appendChild(label);

      let inputEl;
      if (campo.tipo === 'select') {
        inputEl = document.createElement('select');

        const optOmitir = document.createElement('option');
        optOmitir.value = "[Omitir]";
        optOmitir.innerText = "-- Omitir (não mencionar) --";
        inputEl.appendChild(optOmitir);

        campo.opcoes.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.innerText = opt;
          inputEl.appendChild(option);
        });
      } else if (campo.tipo === 'textarea') {
        inputEl = document.createElement('textarea');
        inputEl.rows = 3;
        if (campo.placeholder) inputEl.placeholder = campo.placeholder;
      } else {
        inputEl = document.createElement('input');
        inputEl.type = campo.tipo || 'text';
        if (campo.default) inputEl.value = campo.default;
        if (campo.placeholder) inputEl.placeholder = campo.placeholder;
      }

      inputEl.id = `dyn-field-${campo.id}`;
      inputEl.dataset.fieldId = campo.id;
      group.appendChild(inputEl);
      formDinamicoObjeto.appendChild(group);
    });
  }

  btnCancelarObjeto.addEventListener('click', () => {
    objetoFormContainer.classList.add('hidden');
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  });

  btnSalvarObjeto.addEventListener('click', () => {
    if (!laudoState.selectedCategory) return;

    const cat = laudoState.selectedCategory;
    const campoValues = {};
    cat.campos.forEach(campo => {
      const el = document.getElementById(`dyn-field-${campo.id}`);
      if (el) {
        campoValues[campo.id] = el.value.trim();
      }
    });

    const descFormatada = buildFormattedDescription(cat.modelo_descricao, campoValues);

    const lacreIdSelected = parseInt(selectObjetoLacre.value) || laudoState.lacres[0].id;

    const novoObjeto = {
      id: Date.now(),
      lacreId: lacreIdSelected,
      categoriaNome: cat.nome,
      descricaoFormatada: descFormatada,
      campos: campoValues
    };

    laudoState.objetos.push(novoObjeto);
    renderObjetosLista();
    updatePreview();

    objetoFormContainer.classList.add('hidden');
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  });

  function buildFormattedDescription(template, campoValues) {
    let desc = template;

    if (campoValues.imei2 && campoValues.imei2.trim() && campoValues.imei2.trim() !== '[Omitir]') {
      desc = desc.replace('{imei2}', ` e IMEI 2: ${campoValues.imei2.trim()}`);
    } else {
      desc = desc.replace('{imei2}', '');
    }

    if (campoValues.sn && campoValues.sn.trim() && campoValues.sn.trim() !== '[Omitir]') {
      desc = desc.replace('{sn}', `, S/N: ${campoValues.sn.trim()}`);
    } else {
      desc = desc.replace('{sn}', '');
    }

    Object.keys(campoValues).forEach(key => {
      if (key === 'imei2' || key === 'sn') return;
      const val = (campoValues[key] || '').trim();

      if (!val || val === '[Omitir]') {
        desc = desc.replace(new RegExp(`;\\s*\\{${key}\\}`, 'g'), '');
        desc = desc.replace(new RegExp(`\\{${key}\\}\\s*;`, 'g'), '');
        desc = desc.replace(new RegExp(`\\{${key}\\}`, 'g'), '');
      } else {
        desc = desc.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
      }
    });

    desc = desc.replace(/\{[a-zA-Z0-9_]+\}/g, '')
               .replace(/;\s*;/g, ';')
               .replace(/;\s*\./g, '.')
               .replace(/,\s*\./g, '.')
               .replace(/\s+/g, ' ')
               .replace(/\s+\./g, '.')
               .replace(/\s+;/g, ';');

    if (campoValues.sim_cards && campoValues.sim_cards.trim() && campoValues.sim_cards.trim() !== '[Omitir]') {
      desc += ` Anexo ao aparelho havia ${campoValues.sim_cards.trim()}.`;
    }
    if (campoValues.cartao_memoria && campoValues.cartao_memoria.trim() && campoValues.cartao_memoria.trim() !== '[Omitir]') {
      desc += ` Continha cartão de memória ${campoValues.cartao_memoria.trim()}.`;
    }

    return desc;
  }

  function renderObjetosLista() {
    objetosLista.innerHTML = '';
    if (laudoState.objetos.length === 0) {
      objetosLista.innerHTML = '<p class="empty-msg">Nenhum objeto adicionado ainda.</p>';
      return;
    }

    laudoState.objetos.forEach((obj, idx) => {
      const lacreObj = laudoState.lacres.find(l => l.id === obj.lacreId) || laudoState.lacres[0];
      const item = document.createElement('div');
      item.className = 'objeto-item';
      item.innerHTML = `
        <div>
          <strong>Item ${idx + 1} ${laudoState.lacres.length > 1 ? `(Lacre ${lacreObj ? lacreObj.letra : ''}.)` : ''} - ${obj.categoriaNome}</strong>
          <p style="font-size: 0.8rem; color: #475569; margin-top: 0.2rem;">${obj.descricaoFormatada}</p>
        </div>
        <button type="button" class="btn btn-danger btn-sm" onclick="removerObjeto(${obj.id})">🗑️ Excluir</button>
      `;
      objetosLista.appendChild(item);
    });
  }

  window.removerObjeto = function(id) {
    laudoState.objetos = laudoState.objetos.filter(o => o.id !== id);
    renderObjetosLista();
    updatePreview();
  };

  // ==========================================
  // LEVANTAMENTO FOTOGRÁFICO & ROTAÇÃO DE IMAGENS
  // ==========================================
  btnTriggerFotoUpload.addEventListener('click', () => inputFotosUpload.click());

  inputFotosUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const isFirstFoto = laudoState.fotos.length === 0;
        const defaultLegenda = isFirstFoto ? 'Objeto(s) aportado(s) neste setor.' : 'Vista geral do objeto.';

        const novaFoto = {
          id: Date.now() + Math.random(),
          file: file,
          src: event.target.result,
          rotation: 0,
          legendaOption: isFirstFoto ? 'Objeto(s) aportado(s) neste setor.' : 'Vista geral do objeto.',
          legendaText: defaultLegenda
        };

        laudoState.fotos.push(novaFoto);
        renderFotosGallery();
        updatePreview();
      };
      reader.readAsDataURL(file);
    });

    inputFotosUpload.value = '';
  });

  function renderFotosGallery() {
    fotosGallery.innerHTML = '';
    if (laudoState.fotos.length === 0) {
      fotosGallery.innerHTML = '<p class="empty-msg">Nenhuma foto adicionada ao levantamento fotográfico.</p>';
      return;
    }

    laudoState.fotos.forEach((foto, idx) => {
      const card = document.createElement('div');
      card.className = 'foto-card';
      card.innerHTML = `
        <img src="${foto.src}" alt="Foto Pericial ${idx + 1}" id="foto-preview-img-${foto.id}">
        <div class="foto-card-body">
          <button type="button" class="btn btn-secondary btn-sm" onclick="girarFoto(${foto.id})">🔄 Girar Imagem 90°</button>
          <label><strong>Foto ${idx + 1} Legenda:</strong></label>
          <select onchange="atualizarOpcaoLegenda(${foto.id}, this.value)">
            <option value="Objeto(s) aportado(s) neste setor." ${foto.legendaOption === 'Objeto(s) aportado(s) neste setor.' ? 'selected' : ''}>Objeto(s) aportado(s) neste setor.</option>
            <option value="Vista geral do objeto." ${foto.legendaOption === 'Vista geral do objeto.' ? 'selected' : ''}>Vista geral do objeto.</option>
            <option value="Detalhe do objeto." ${foto.legendaOption === 'Detalhe do objeto.' ? 'selected' : ''}>Detalhe do objeto.</option>
            <option value="Personalizado" ${foto.legendaOption === 'Personalizado' ? 'selected' : ''}>Personalizado...</option>
          </select>
          <input type="text" value="${foto.legendaText}" onchange="atualizarTextoLegenda(${foto.id}, this.value)" placeholder="Texto da legenda">
          <button type="button" class="btn btn-danger btn-sm mt-1" onclick="removerFoto(${foto.id})">🗑️ Remover Foto</button>
        </div>
      `;
      fotosGallery.appendChild(card);
    });
  }

  window.girarFoto = function(id) {
    const foto = laudoState.fotos.find(f => f.id === id);
    if (!foto) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.height;
      canvas.height = img.width;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      foto.src = rotatedDataUrl;
      foto.rotation = (foto.rotation + 90) % 360;

      renderFotosGallery();
      updatePreview();
    };
    img.src = foto.src;
  };

  window.atualizarOpcaoLegenda = function(id, option) {
    const foto = laudoState.fotos.find(f => f.id === id);
    if (foto) {
      foto.legendaOption = option;
      if (option !== 'Personalizado') {
        foto.legendaText = option;
      }
      renderFotosGallery();
      updatePreview();
    }
  };

  window.atualizarTextoLegenda = function(id, text) {
    const foto = laudoState.fotos.find(f => f.id === id);
    if (foto) {
      foto.legendaText = text;
      updatePreview();
    }
  };

  window.removerFoto = function(id) {
    laudoState.fotos = laudoState.fotos.filter(f => f.id !== id);
    renderFotosGallery();
    updatePreview();
  };

  // ==========================================
  // OCR & PARSER INTELIGENTE CORRIGIDO
  // ==========================================
  btnParseText.addEventListener('click', () => {
    const text = ocrPastedText.value;
    if (!text.trim()) {
      alert('Por favor, cole o texto antes de extrair as informações.');
      return;
    }
    parseAndFillText(text);
  });

  ocrFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    ocrStatus.classList.remove('hidden');
    ocrStatusText.innerText = 'Iniciando leitura de arquivo...';

    if (file.type === 'application/pdf') {
      await processPdfOcr(file);
    } else {
      await processImageOcr(file);
    }
  });

  async function processImageOcr(file) {
    try {
      ocrStatusText.innerText = 'Executando OCR com Tesseract.js (reconhecendo caracteres)...';
      const result = await Tesseract.recognize(file, 'por', {
        logger: m => {
          if (m.status === 'recognizing text') {
            ocrStatusText.innerText = `Reconhecendo texto OCR: ${Math.round(m.progress * 100)}%`;
          }
        }
      });

      ocrStatus.classList.add('hidden');
      ocrPastedText.value = result.data.text;
      parseAndFillText(result.data.text);
    } catch (err) {
      console.error('Erro OCR:', err);
      ocrStatus.classList.add('hidden');
      alert('Falha ao processar OCR da imagem.');
    }
  }

  async function processPdfOcr(file) {
    try {
      ocrStatusText.innerText = 'Extraindo texto do PDF...';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      ocrStatus.classList.add('hidden');
      ocrPastedText.value = fullText;
      parseAndFillText(fullText);
    } catch (err) {
      console.error('Erro PDF:', err);
      ocrStatus.classList.add('hidden');
      alert('Falha ao ler arquivo PDF.');
    }
  }

  function parseAndFillText(rawText) {
    const text = rawText.replace(/\s+/g, ' ');
    const detected = [];

    // Protocolo
    const protocoloMatch = text.match(/(?:protocolo|protocolada|sob\s*n?º?\s*)\s*([P|p]\s*[\d\s\/]+)/i) || text.match(/\b(P\s*\d{4,5}\/\d{2})\b/i);
    if (protocoloMatch) {
      const cleanProtocolo = protocoloMatch[1].replace(/\s+/g, '');
      laudoState.preambulo.protocolo = cleanProtocolo;
      inputProtocolo.value = cleanProtocolo;
      detected.push(`Protocolo: ${cleanProtocolo}`);
    }

    // Número do Laudo
    const laudoMatch = text.match(/(?:laudo|laudo\s*n?º?\s*)\s*(\d{5,7}\s*\/\s*\d{4})/i);
    if (laudoMatch) {
      const cleanLaudo = laudoMatch[1].replace(/\s+/g, '');
      laudoState.preambulo.laudoNum = cleanLaudo;
      inputLaudoNum.value = cleanLaudo;
      detected.push(`Nº Laudo: ${cleanLaudo}`);
    }

    // BO
    const boMatch = text.match(/(?:BO\s*N?º?\s*|boletim\s*n?º?\s*)([A-Z]{2}\d{4,6}-\d\/\d{4})/i) || text.match(/\b([A-Z]{2}\d{4,6}-\d\/\d{4})\b/i);
    if (boMatch) {
      laudoState.objetivo.boNum = boMatch[1].trim();
      inputBoNum.value = boMatch[1].trim();
      detected.push(`BO: ${boMatch[1].trim()}`);
    }

    // Delegacia de Elaboração
    const elabMatch = text.match(/Elabora[^\s:]*\s*:\s*([^;\)\n]+?)(?=\s*e\s*Circunscri|\s*Circunscri|\s*\)|$)/i)
                   || text.match(/(?:Del\.?\s*Pol\.?\s*[^;\)\n]+?)(?=\s*e\s*Circunscri|\s*Circunscri|\s*\)|$)/i);
    if (elabMatch) {
      let val = (elabMatch[1] || elabMatch[0]).trim();
      if (!val.toLowerCase().startsWith('del')) val = 'Del. Pol. ' + val;
      laudoState.objetivo.delElaboracao = val;
      inputDelElaboracao.value = val;
      detected.push(`Del. Elaboração: ${val}`);
    }

    // Delegacia de Circunscrição
    const circMatch = text.match(/Circunscri[^\s:]*\s*:\s*([^;\)\n]+?)(?=\s*\)|$)/i);
    if (circMatch) {
      laudoState.objetivo.delCircunscricao = circMatch[1].trim();
      inputDelCircunscricao.value = circMatch[1].trim();
      detected.push(`Del. Circunscrição: ${circMatch[1].trim()}`);
    }

    // Natureza do Exame
    const naturezaMatch = text.match(/(?:natureza\s*de\s*exame\s*:\s*|exame\s*:\s*)["“]?([^"”\n\.]+)/i);
    if (naturezaMatch) {
      laudoState.objetivo.naturezaExame = naturezaMatch[1].trim();
      inputNaturezaExame.value = naturezaMatch[1].trim();
      detected.push(`Natureza: ${naturezaMatch[1].trim()}`);
    }

    // BUSCA DE LACRES
    const lacresEncontrados = [];
    const lRegex1 = /(?:lacre|inv[oó]lucro)(?:[^\d\n]{0,35})?(\b\d{5,8}\b)/gi;
    let m1;
    while ((m1 = lRegex1.exec(text)) !== null) {
      if (!lacresEncontrados.includes(m1[1])) lacresEncontrados.push(m1[1]);
    }
    const lRegex2 = /\b(?:n[º°\.]?\s*)(\d{5,8})\b/gi;
    let m2;
    while ((m2 = lRegex2.exec(text)) !== null) {
      if (!lacresEncontrados.includes(m2[1])) lacresEncontrados.push(m2[1]);
    }

    if (lacresEncontrados.length > 0) {
      laudoState.lacres = lacresEncontrados.map((num, idx) => ({
        id: Date.now() + idx,
        letra: '',
        numero: num
      }));
      renderLacresUI();
      detected.push(`Lacre(s) Encontrado(s): ${lacresEncontrados.join(', ')}`);
    }

    // Data da Designação
    const dataMatch = text.match(/(?:Em\s*)(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})/i);
    if (dataMatch) {
      laudoState.preambulo.dataDesignacao = dataMatch[1].trim();
      inputDataDesignacao.value = dataMatch[1].trim();
      detected.push(`Data Designação: ${dataMatch[1].trim()}`);
    }

    // AUTO-DETECÇÃO DE OBJETOS PERICIAIS
    const objetosDetectados = extractObjectsFromText(text);
    if (objetosDetectados.length > 0) {
      laudoState.objetos = objetosDetectados;
      renderObjetosLista();
      detected.push(`Objeto(s) Auto-Detectado(s): ${objetosDetectados.length} item(ns)`);
    }

    if (detected.length > 0) {
      ocrResultsSummary.classList.remove('hidden');
      ocrDetectedFieldsList.innerHTML = detected.join('<br>');
      updatePreview();
    } else {
      alert('Não foi possível identificar campos automaticamente no texto fornecido.');
    }
  }

  function extractObjectsFromText(text) {
    const objetos = [];
    const marcasConhecidas = ['Samsung', 'Motorola', 'Xiaomi', 'Redmi', 'Apple', 'iPhone', 'LG', 'Nokia', 'Asus', 'Positivo', 'Decwin', 'L8star'];
    
    let marcaEncontrada = '';
    for (const m of marcasConhecidas) {
      if (new RegExp(`\\b${m}\\b`, 'i').test(text)) {
        marcaEncontrada = m;
        break;
      }
    }

    let modeloEncontrado = '';
    const modeloMatch = text.match(/(?:modelo\s*|modelo:\s*)([A-Z0-9\s-]+?)(?=;|\.|\n|IMEI|SN|S\/N|operante|bloqueado)/i) 
                     || text.match(/\b(Galaxy\s+[A-Z0-9\s]+|Redmi\s+[A-Z0-9\s]+|Moto\s+[A-Z0-9\s]+|XT\d{4}|BM\s*\d+|BM\d+)\b/i);
    if (modeloMatch) {
      modeloEncontrado = modeloMatch[1].trim();
    }

    const imeiMatches = Array.from(text.matchAll(/\b(\d{14,15})\b/g)).map(m => m[1]);
    const imei1 = imeiMatches[0] || '';
    const imei2 = imeiMatches[1] || '';

    const snMatch = text.match(/(?:S\/N|SN|Serial)\s*:?\s*([A-Z0-9]+)/i);
    const sn = snMatch ? snMatch[1].trim() : '';

    let estadoOp = 'operante';
    if (/não\s+funcional|não\s+apresentou\s+funcionamento/i.test(text)) {
      estadoOp = 'não apresentou funcionamento';
    } else if (/dano|amolgamento|fratura/i.test(text)) {
      estadoOp = 'apresentando danos fisicos';
    }

    let estadoBloqueio = 'bloqueado';
    if (/desbloqueado/i.test(text)) {
      estadoBloqueio = 'desbloqueado';
    }

    if (imei1 || modeloEncontrado || marcaEncontrada) {
      const parts = ['01 (um) aparelho móvel de comunicação (smartphone)'];
      if (marcaEncontrada) parts.push(`de marca de fabricação ${marcaEncontrada}`);
      if (modeloEncontrado) parts.push(`modelo ${modeloEncontrado}`);
      if (estadoOp) parts.push(estadoOp);
      if (estadoBloqueio) parts.push(estadoBloqueio);
      
      let desc = parts.join('; ');
      if (imei1) desc += `; IMEI ${imei1}`;
      if (imei2) desc += ` e ${imei2}`;
      if (sn) desc += `, SN: ${sn}`;
      desc += '.';

      objetos.push({
        id: Date.now(),
        lacreId: laudoState.lacres[0] ? laudoState.lacres[0].id : 1,
        categoriaNome: 'Aparelho Celular (Smartphone)',
        descricaoFormatada: desc,
        campos: {
          marca: marcaEncontrada,
          modelo: modeloEncontrado,
          estado_op: estadoOp,
          estado_bloqueio: estadoBloqueio,
          imei1: imei1,
          imei2: imei2,
          sn: sn
        }
      });
    }

    return objetos;
  }

  // ==========================================
  // SINCRONIZAÇÃO DO FORMULÁRIO E PREVIEW AO VIVO
  // ==========================================
  function setupFormSync() {
    inputDataDesignacao.value = laudoState.preambulo.dataDesignacao;
    inputProtocolo.value = laudoState.preambulo.protocolo;
    inputLaudoNum.value = laudoState.preambulo.laudoNum;
    inputBoNum.value = laudoState.objetivo.boNum;
    inputDelElaboracao.value = laudoState.objetivo.delElaboracao;
    inputDelCircunscricao.value = laudoState.objetivo.delCircunscricao;
    inputNaturezaExame.value = laudoState.objetivo.naturezaExame;
    inputLacreSaida.value = laudoState.fechamento.lacreSaida;
    inputDataElaboracao.value = laudoState.fechamento.dataElaboracao;
    inputNomePerito.value = laudoState.fechamento.nomePerito;
    inputTextoFechamentoCustom.value = laudoState.fechamento.textoCustom;

    const syncInputs = [
      { input: inputDataDesignacao, target: 'preambulo', field: 'dataDesignacao' },
      { input: inputProtocolo, target: 'preambulo', field: 'protocolo' },
      { input: inputLaudoNum, target: 'preambulo', field: 'laudoNum' },
      { input: inputBoNum, target: 'objetivo', field: 'boNum' },
      { input: inputDelElaboracao, target: 'objetivo', field: 'delElaboracao' },
      { input: inputDelCircunscricao, target: 'objetivo', field: 'delCircunscricao' },
      { input: inputNaturezaExame, target: 'objetivo', field: 'naturezaExame' },
      { input: inputLacreSaida, target: 'fechamento', field: 'lacreSaida' },
      { input: inputDataElaboracao, target: 'fechamento', field: 'dataElaboracao' },
      { input: inputNomePerito, target: 'fechamento', field: 'nomePerito' },
      { input: inputTextoFechamentoCustom, target: 'fechamento', field: 'textoCustom' }
    ];

    syncInputs.forEach(item => {
      item.input.addEventListener('input', (e) => {
        laudoState[item.target][item.field] = e.target.value;
        updatePreview();
      });
    });
  }

  function calculateTotalPagesCalculated() {
    let numPages = 2;
    if (laudoState.fotos.length > 2 || laudoState.objetos.length > 3) {
      numPages = Math.ceil(laudoState.fotos.length / 2) + 1;
    }
    return Math.max(2, numPages);
  }

  function updatePreview() {
    document.getElementById('pv-data-designacao').innerText = laudoState.preambulo.dataDesignacao || '[Data]';
    document.getElementById('pv-protocolo').innerText = laudoState.preambulo.protocolo || '[Protocolo]';
    document.getElementById('pv-laudo-num').innerText = laudoState.preambulo.laudoNum || '[Laudo]';

    document.getElementById('pv-bo-num').innerText = laudoState.objetivo.boNum || '[BO]';
    document.getElementById('pv-del-elaboracao').innerText = laudoState.objetivo.delElaboracao || '[Del. Elaboração]';
    document.getElementById('pv-del-circunscricao').innerText = laudoState.objetivo.delCircunscricao || '[Del. Circunscrição]';
    document.getElementById('pv-natureza-exame').innerText = laudoState.objetivo.naturezaExame || '[Natureza]';

    const lacresResumoText = laudoState.lacres.length === 1 
      ? `invólucro plástico de lacre nº ${laudoState.lacres[0].numero}`
      : `invólucros plásticos de lacres nº ${laudoState.lacres.map(l => l.numero).join(', ')}`;
    document.getElementById('pv-lacres-resumo').innerHTML = `O(s) objeto(s) descrito(s) estava(m) acondicionado(s) em <span class="pv-field">${lacresResumoText}</span>.`;

    const pvObjetosContainer = document.getElementById('pv-objetos-container');
    pvObjetosContainer.innerHTML = '';

    if (laudoState.objetos.length === 0) {
      pvObjetosContainer.innerHTML = '<p class="document-p text-justify">[Descrição do(s) objeto(s) e exames efetuados]</p>';
    } else {
      if (laudoState.lacres.length <= 1) {
        laudoState.objetos.forEach(obj => {
          const p = document.createElement('p');
          p.className = 'document-p text-justify';
          p.innerText = obj.descricaoFormatada;
          pvObjetosContainer.appendChild(p);
        });
      } else {
        laudoState.lacres.forEach(lacre => {
          const objetosDoLacre = laudoState.objetos.filter(o => o.lacreId === lacre.id);
          if (objetosDoLacre.length > 0) {
            const subTitle = document.createElement('p');
            subTitle.className = 'document-sublacre';
            subTitle.innerText = `${lacre.letra}. Objeto(s) acondicionado(s) no invólucro plástico de lacre nº ${lacre.numero}:`;
            pvObjetosContainer.appendChild(subTitle);

            objetosDoLacre.forEach(obj => {
              const p = document.createElement('p');
              p.className = 'document-p text-justify';
              p.innerText = obj.descricaoFormatada;
              pvObjetosContainer.appendChild(p);
            });
          }
        });
      }
    }

    const pvFotosContainer = document.getElementById('pv-fotos-container');
    pvFotosContainer.innerHTML = '';
    if (laudoState.fotos.length > 0) {
      laudoState.fotos.forEach(foto => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-foto-wrapper';
        wrapper.innerHTML = `
          <img src="${foto.src}" alt="Foto Pericial">
          <div class="caption">${foto.legendaText}</div>
        `;
        pvFotosContainer.appendChild(wrapper);
      });
    }

    const totalPaginasCalculado = calculateTotalPagesCalculated();
    document.getElementById('pv-total-paginas').innerText = totalPaginasCalculado;
    document.getElementById('pv-total-paginas-extenso').innerText = numeroParaExtenso(totalPaginasCalculado);
    document.getElementById('pv-footer-pagina').innerText = totalPaginasCalculado;

    document.getElementById('pv-lacre-saida').innerText = laudoState.fechamento.lacreSaida || '[Lacre Saída]';
    document.getElementById('pv-data-elaboracao').innerText = laudoState.fechamento.dataElaboracao || '[Local e Data]';
    document.getElementById('pv-nome-perito').innerHTML = `<strong>${laudoState.fechamento.nomePerito || '[Nome do Perito]'}</strong><br>Perito Criminal`;
  }

  function cleanString(str) {
    return (str || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ==========================================
  // EXPORTAÇÃO PARA ARQUIVO .DOCX (LENDO 100% O CONTEÚDO EDITÁVEL NA TELA SEM MISTURA DE VARIÁVEIS DE ESTADO)
  // ==========================================
  btnExportDocx.addEventListener('click', async () => {
    try {
      btnExportDocx.disabled = true;
      btnExportDocx.innerHTML = '⏳ Gerando Laudo .docx...';

      const docx = window.docx;
      if (!docx) throw new Error('Biblioteca docx.js não carregada');

      const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, Header, Footer, PageNumber, Table, TableRow, TableCell, BorderStyle, WidthType } = docx;
      const alignJustified = AlignmentType.JUSTIFIED || AlignmentType.BOTH || "both";

      let cabecalhoBuffer = null;
      try {
        const resp = await fetch('cabecalho.png');
        cabecalhoBuffer = await resp.arrayBuffer();
      } catch (err) {
        console.warn('Não foi possível carregar cabecalho.png para a exportação:', err);
      }

      const docParagraphs = [];
      const totalPaginasEfetivo = calculateTotalPagesCalculated();

      // PARSE 100% PURO DO CONTEÚDO DO CONTAINER EDITÁVEL DA TELA
      function processElementTree(node) {
        const children = Array.from(node.children);

        children.forEach(child => {
          const tagName = child.tagName.toUpperCase();

          // 1. TÍTULOS (H3)
          if (tagName === 'H3') {
            const hText = cleanString(child.innerText);
            if (hText) {
              docParagraphs.push(
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 300, after: 150 },
                  children: [new TextRun({ text: hText, bold: true, font: "Arial", size: 24 })]
                })
              );
            }
          }
          // 2. PARÁGRAFOS DE TEXTO (P)
          else if (tagName === 'P') {
            const pText = cleanString(child.innerText);
            if (!pText) return;

            const isRight = child.classList.contains('text-right');
            const isSublacre = child.classList.contains('document-sublacre');

            docParagraphs.push(
              new Paragraph({
                alignment: isRight ? AlignmentType.RIGHT : alignJustified,
                indent: isRight ? undefined : { firstLine: 709 },
                spacing: { line: 360, after: isRight ? 100 : 200 },
                children: [
                  new TextRun({ text: pText, bold: isSublacre, font: "Arial", size: 24 })
                ]
              })
            );
          }
          // 3. CONTAINER DE FOTOS (LEVANTAMENTO FOTOGRÁFICO)
          else if (child.id === 'pv-fotos-container' || child.classList.contains('preview-fotos-layout')) {
            for (const foto of laudoState.fotos) {
              try {
                const base64Data = foto.src.split(',')[1];
                const binaryString = atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }

                const img = new Image();
                img.src = foto.src;

                const targetHeight = 302; // 8cm
                const aspectRatio = (img.width && img.height) ? (img.width / img.height) : 1.33;
                const targetWidth = Math.round(targetHeight * aspectRatio);

                docParagraphs.push(
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 150, after: 50 },
                    children: [
                      new ImageRun({
                        data: bytes,
                        transformation: { width: targetWidth, height: targetHeight }
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 50, after: 200 },
                    children: [new TextRun({ text: cleanString(foto.legendaText), italic: true, font: "Arial", size: 24 })]
                  })
                );
              } catch (imgErr) {
                console.error('Erro ao processar foto no docx:', imgErr);
              }
            }
          }
          // 4. CONTAINER DE OBJETOS OU ASSINATURA -> RECURSIVO PARA CAPTURAR PARÁGRAFOS INTERNOS EXATOS
          else if (child.id === 'pv-objetos-container' || child.classList.contains('signature-block-right') || child.tagName === 'DIV') {
            processElementTree(child);
          }
        });
      }

      processElementTree(previewEditableContent);

      // TABELA DE RODAPÉ COM NOTA LEGAL EM LETRA DIMINUTA E NÚMERO DE PÁGINA (ESTÁTICO / WORD NATIVO)
      const legalFooterText = "Esta folha é propriedade da Superintendência da Polícia Técnico-Científica e seu conteúdo não pode ser copiado ou revelado a terceiros sem autorização expressa";
      const footerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "auto" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 85, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: legalFooterText, font: "Arial", size: 14 }) // 7pt diminuta
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: "Fls. ", font: "Arial", size: 14 }),
                      new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 14 })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } // 2cm
            }
          },
          headers: {
            default: new Header({
              children: cabecalhoBuffer ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: cabecalhoBuffer,
                      transformation: { width: 550, height: 75 }
                    })
                  ]
                })
              ] : []
            })
          },
          footers: {
            default: new Footer({
              children: [footerTable]
            })
          },
          children: docParagraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${laudoState.preambulo.laudoNum.replace(/\//g, '_') || 'laudo'}$celular.docx`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      btnExportDocx.disabled = false;
      btnExportDocx.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Baixar Laudo (.docx)';
    } catch (err) {
      console.error('Erro ao gerar docx:', err);
      alert('Erro ao gerar o arquivo .docx: ' + err.message);
      btnExportDocx.disabled = false;
      btnExportDocx.innerHTML = 'Baixar Laudo (.docx)';
    }
  });

  // Inicializar dados e sincronia
  loadUserPreferences();
  loadCompendio();
  renderLacresUI();
  setupFormSync();
  updatePreview();
});
