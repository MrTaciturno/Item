// Aitem - Sistema de Elaboração e Automação de Laudos Periciais
// Main Application Script

document.addEventListener('DOMContentLoaded', () => {
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
      naturezaExame: 'Constatar funcionalidade',
      lacresEntrada: 'invólucro plástico de lacre nº 030310'
    },
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
  const inputLacresEntrada = document.getElementById('input-lacres-entrada');

  // Fechamento Inputs
  const inputLacreSaida = document.getElementById('input-lacre-saida');
  const inputDataElaboracao = document.getElementById('input-data-elaboracao');
  const inputNomePerito = document.getElementById('input-nome-perito');
  const inputTextoFechamentoCustom = document.getElementById('input-texto-fechamento-custom');

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

  // Download Button
  const btnExportDocx = document.getElementById('btn-export-docx');

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
  // CARREGAR COMPÊNDIO JSON
  // ==========================================
  async function loadCompendio() {
    try {
      const resp = await fetch('compendio.json');
      laudoState.compendioData = await resp.json();
      renderCompendioCategories();
    } catch (err) {
      console.error('Erro ao carregar compêndio.json:', err);
    }
  }

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
    renderDynamicForm(category);
    objetoFormContainer.classList.remove('hidden');
  }

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

    // Construir texto formatado da descrição usando template
    let descFormatada = cat.modelo_descricao;
    Object.keys(campoValues).forEach(key => {
      const val = campoValues[key] || '';
      descFormatada = descFormatada.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
    });

    // Limpar marcadores vazios remanescentes no template
    descFormatada = descFormatada.replace(/\{[a-zA-Z0-9_]+\}/g, '').replace(/\s+/g, ' ').replace(/\s+\./g, '.');

    // Tratar informações adicionais (SIM cards / memória)
    if (campoValues.sim_cards) {
      descFormatada += ` Anexo ao aparelho havia ${campoValues.sim_cards}.`;
    }
    if (campoValues.cartao_memoria) {
      descFormatada += ` Continha cartão de memória ${campoValues.cartao_memoria}.`;
    }

    const novoObjeto = {
      id: Date.now(),
      categoriaNome: cat.nome,
      descricaoFormatada: descFormatada,
      campos: campoValues
    };

    laudoState.objetos.push(novoObjeto);
    renderObjetosLista();
    updatePreview();

    // Resetar formulário
    objetoFormContainer.classList.add('hidden');
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  });

  function renderObjetosLista() {
    objetosLista.innerHTML = '';
    if (laudoState.objetos.length === 0) {
      objetosLista.innerHTML = '<p class="empty-msg">Nenhum objeto adicionado ainda.</p>';
      return;
    }

    laudoState.objetos.forEach((obj, idx) => {
      const item = document.createElement('div');
      item.className = 'objeto-item';
      item.innerHTML = `
        <div>
          <strong>Item ${idx + 1} - ${obj.categoriaNome}</strong>
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
  // LEVANTAMENTO FOTOGRÁFICO
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
        <img src="${foto.src}" alt="Foto Pericial ${idx + 1}">
        <div class="foto-card-body">
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
  // OCR & PARSER INTELIGENTE DE TEXTO
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

  function parseAndFillText(text) {
    const detected = [];

    // Protocolo (ex: P01412/26, P 0 1412/26)
    const protocoloMatch = text.match(/(?:protocolo|protocolada|sob\s*n?º?\s*)\s*([P|p]\s*[\d\s\/]+)/i) || text.match(/\b(P\s*\d{4,5}\/\d{2})\b/i);
    if (protocoloMatch) {
      const cleanProtocolo = protocoloMatch[1].replace(/\s+/g, '');
      laudoState.preambulo.protocolo = cleanProtocolo;
      inputProtocolo.value = cleanProtocolo;
      detected.push(`Protocolo: ${cleanProtocolo}`);
    }

    // Número do Laudo (ex: 162836/2026)
    const laudoMatch = text.match(/(?:laudo|laudo\s*n?º?\s*)\s*(\d{5,7}\s*\/\s*\d{4})/i);
    if (laudoMatch) {
      const cleanLaudo = laudoMatch[1].replace(/\s+/g, '');
      laudoState.preambulo.laudoNum = cleanLaudo;
      inputLaudoNum.value = cleanLaudo;
      detected.push(`Nº Laudo: ${cleanLaudo}`);
    }

    // BO (ex: EM7833-1/2026 ou BO Nº GS2889-1/2026)
    const boMatch = text.match(/(?:BO\s*N?º?\s*|boletim\s*n?º?\s*)([A-Z]{2}\d{4,6}-\d\/\d{4})/i) || text.match(/\b([A-Z]{2}\d{4,6}-\d\/\d{4})\b/i);
    if (boMatch) {
      laudoState.objetivo.boNum = boMatch[1].trim();
      inputBoNum.value = boMatch[1].trim();
      detected.push(`BO: ${boMatch[1].trim()}`);
    }

    // Delegacia de Elaboração
    const delElabMatch = text.match(/(?:Elaboração\s*:\s*|Del\.?\s*Pol\.?\s*)([^,\n\)]+)/i);
    if (delElabMatch) {
      let val = delElabMatch[1].trim();
      if (!val.startsWith('Del. Pol.')) val = 'Del. Pol. ' + val;
      laudoState.objetivo.delElaboracao = val;
      inputDelElaboracao.value = val;
      detected.push(`Del. Elaboração: ${val}`);
    }

    // Delegacia de Circunscrição
    const delCircMatch = text.match(/(?:Circunscrição\s*:\s*)([^,\n\)]+)/i);
    if (delCircMatch) {
      laudoState.objetivo.delCircunscricao = delCircMatch[1].trim();
      inputDelCircunscricao.value = delCircMatch[1].trim();
      detected.push(`Del. Circunscrição: ${delCircMatch[1].trim()}`);
    }

    // Natureza do Exame
    const naturezaMatch = text.match(/(?:natureza\s*de\s*exame\s*:\s*|exame\s*:\s*)["“]?([^"”\n\.]+)/i);
    if (naturezaMatch) {
      laudoState.objetivo.naturezaExame = naturezaMatch[1].trim();
      inputNaturezaExame.value = naturezaMatch[1].trim();
      detected.push(`Natureza: ${naturezaMatch[1].trim()}`);
    }

    // Lacre de Entrada
    const lacreMatch = text.match(/(?:lacre\s*n?º?\s*|invólucro\s*n?º?\s*)(\d{5,8})/i);
    if (lacreMatch) {
      const lacreText = `invólucro plástico de lacre nº ${lacreMatch[1]}`;
      laudoState.objetivo.lacresEntrada = lacreText;
      inputLacresEntrada.value = lacreText;
      detected.push(`Lacre de Entrada: ${lacreMatch[1]}`);
    }

    // Data da Designação
    const dataMatch = text.match(/(?:Em\s*)(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})/i);
    if (dataMatch) {
      laudoState.preambulo.dataDesignacao = dataMatch[1].trim();
      inputDataDesignacao.value = dataMatch[1].trim();
      detected.push(`Data Designação: ${dataMatch[1].trim()}`);
    }

    if (detected.length > 0) {
      ocrResultsSummary.classList.remove('hidden');
      ocrDetectedFieldsList.innerHTML = detected.join('<br>');
      updatePreview();
    } else {
      alert('Não foi possível identificar campos automaticamente no texto fornecido.');
    }
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
    inputLacresEntrada.value = laudoState.objetivo.lacresEntrada;
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
      { input: inputLacresEntrada, target: 'objetivo', field: 'lacresEntrada' },
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

  function updatePreview() {
    // Preâmbulo
    document.getElementById('pv-data-designacao').innerText = laudoState.preambulo.dataDesignacao || '[Data]';
    document.getElementById('pv-protocolo').innerText = laudoState.preambulo.protocolo || '[Protocolo]';
    document.getElementById('pv-laudo-num').innerText = laudoState.preambulo.laudoNum || '[Laudo]';
    document.getElementById('pv-footer-laudo').innerText = laudoState.preambulo.laudoNum || '000000/2026';

    // Objetivo
    document.getElementById('pv-bo-num').innerText = laudoState.objetivo.boNum || '[BO]';
    document.getElementById('pv-del-elaboracao').innerText = laudoState.objetivo.delElaboracao || '[Del. Elaboração]';
    document.getElementById('pv-del-circunscricao').innerText = laudoState.objetivo.delCircunscricao || '[Del. Circunscrição]';
    document.getElementById('pv-natureza-exame').innerText = laudoState.objetivo.naturezaExame || '[Natureza]';
    document.getElementById('pv-lacres-entrada').innerText = laudoState.objetivo.lacresEntrada || '[Lacre]';

    // Objetos
    const pvObjetosContainer = document.getElementById('pv-objetos-container');
    pvObjetosContainer.innerHTML = '';
    if (laudoState.objetos.length === 0) {
      pvObjetosContainer.innerHTML = '<p class="document-p text-justify">[Descrição do(s) objeto(s) e exames efetuados]</p>';
    } else {
      laudoState.objetos.forEach(obj => {
        const p = document.createElement('p');
        p.className = 'document-p text-justify';
        p.innerText = obj.descricaoFormatada;
        pvObjetosContainer.appendChild(p);
      });
    }

    // Fotos
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

    // Fechamento
    document.getElementById('pv-lacre-saida').innerText = laudoState.fechamento.lacreSaida || '[Lacre Saída]';
    document.getElementById('pv-data-elaboracao').innerText = laudoState.fechamento.dataElaboracao || '[Local e Data]';
    document.getElementById('pv-nome-perito').innerHTML = `<strong>${laudoState.fechamento.nomePerito || '[Nome do Perito]'}</strong><br>Perito Criminal`;
  }

  // ==========================================
  // EXPORTAÇÃO PARA ARQUIVO .DOCX (DOCX.JS)
  // ==========================================
  btnExportDocx.addEventListener('click', async () => {
    try {
      btnExportDocx.disabled = true;
      btnExportDocx.innerHTML = '⏳ Gerando Laudo .docx...';

      const docx = window.docx;
      if (!docx) throw new Error('Biblioteca docx.js não carregada');

      const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, Header, Footer, PageNumber, NumberFormat } = docx;

      // Carregar cabeçalho.png como ArrayBuffer
      let cabecalhoBuffer = null;
      try {
        const resp = await fetch('cabecalho.png');
        cabecalhoBuffer = await resp.arrayBuffer();
      } catch (err) {
        console.warn('Não foi possível carregar cabecalho.png para a exportação:', err);
      }

      const docParagraphs = [];

      // 1. PREÂMBULO
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { line: 276, after: 200 },
          children: [
            new TextRun({ text: `Em ${laudoState.preambulo.dataDesignacao}, no Núcleo de Perícias Criminalísticas de Americana, do Instituto de Criminalística, da Superintendência da Polícia Técnico-Científica, da Secretaria de Negócios de Segurança Pública do Estado de São Paulo, em conformidade com o disposto no Decreto-Lei n.º 3.689/41 combinado com os Decretos n.º 42.815/08 e n.º 42.847/08, o Diretor deste Instituto de Criminalística, designou o Perito Criminal signatário para proceder a este exame pericial, em atendimento à requisição protocolada sob n.º `, font: "Calibri", size: 22 }),
            new TextRun({ text: laudoState.preambulo.protocolo, bold: true, font: "Calibri", size: 22 }),
            new TextRun({ text: `, laudo `, font: "Calibri", size: 22 }),
            new TextRun({ text: laudoState.preambulo.laudoNum, bold: true, font: "Calibri", size: 22 }),
            new TextRun({ text: `.`, font: "Calibri", size: 22 })
          ]
        })
      );

      // 2. OBJETIVO
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 150 },
          children: [new TextRun({ text: "OBJETIVO", bold: true, font: "Calibri", size: 24 })]
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { line: 276, after: 150 },
          children: [
            new TextRun({ text: `O objetivo deste exame pericial é atender a requisição relacionada ao BO Nº ${laudoState.objetivo.boNum} (Elaboração: ${laudoState.objetivo.delElaboracao} e Circunscrição: ${laudoState.objetivo.delCircunscricao}), tendo como natureza de exame: "${laudoState.objetivo.naturezaExame}".`, font: "Calibri", size: 22 })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { line: 276, after: 250 },
          children: [
            new TextRun({ text: `O(s) objeto(s) descrito(s) estava(m) acondicionado(s) em ${laudoState.objetivo.lacresEntrada}.`, font: "Calibri", size: 22 })
          ]
        })
      );

      // 3. DO OBJETO E DOS EXAMES
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 150 },
          children: [new TextRun({ text: "DO(S) OBJETO(S) E DOS EXAMES", bold: true, font: "Calibri", size: 24 })]
        })
      );

      if (laudoState.objetos.length === 0) {
        docParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { line: 276, after: 200 },
            children: [new TextRun({ text: "[Nenhum objeto cadastrado]", italic: true, font: "Calibri", size: 22 })]
          })
        );
      } else {
        laudoState.objetos.forEach(obj => {
          docParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              spacing: { line: 276, after: 200 },
              children: [new TextRun({ text: obj.descricaoFormatada, font: "Calibri", size: 22 })]
            })
          );
        });
      }

      // 4. LEVANTAMENTO FOTOGRÁFICO
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 150 },
          children: [new TextRun({ text: "LEVANTAMENTO FOTOGRÁFICO", bold: true, font: "Calibri", size: 24 })]
        })
      );

      for (const foto of laudoState.fotos) {
        try {
          // Converter dataURL em Uint8Array
          const base64Data = foto.src.split(',')[1];
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Calcular dimensões (min 8cm de altura = ~302px a 96dpi, preservando aspect ratio)
          const img = new Image();
          img.src = foto.src;
          await new Promise(r => img.onload = r);

          const targetHeight = 302; // 8cm em pixels
          const aspectRatio = img.width / img.height;
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
              children: [new TextRun({ text: foto.legendaText, italic: true, font: "Calibri", size: 20 })]
            })
          );
        } catch (imgErr) {
          console.error('Erro ao adicionar foto no docx:', imgErr);
        }
      }

      // 5. DAS CONSIDERAÇÕES FINAIS
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 150 },
          children: [new TextRun({ text: "DAS CONSIDERAÇÕES FINAIS", bold: true, font: "Calibri", size: 24 })]
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { line: 276, after: 250 },
          children: [
            new TextRun({ text: `O(s) objetos(s) descrito(s) segue(m) em ${laudoState.fechamento.lacreSaida} anexo a este laudo pericial, ficando assinado digitalmente nos termos da MP nº2200-2/2001 de 24/08/2001.`, font: "Calibri", size: 22 })
          ]
        })
      );

      // Data e Assinatura
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
          children: [new TextRun({ text: laudoState.fechamento.dataElaboracao, font: "Calibri", size: 22 })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 50 },
          children: [new TextRun({ text: laudoState.fechamento.nomePerito, bold: true, font: "Calibri", size: 22 })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Perito Criminal", font: "Calibri", size: 20 })]
        })
      );

      // CRIAR DOCUMENTO DOCX
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
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: `Laudo nº ${laudoState.preambulo.laudoNum} - Fls. `, font: "Calibri", size: 18 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18 }),
                    new TextRun({ text: " | Instituto de Criminalística - SPTC", font: "Calibri", size: 18 })
                  ]
                })
              ]
            })
          },
          children: docParagraphs
        }]
      });

      // GERAR E FAZER DOWNLOAD DO ARQUIVO
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
  loadCompendio();
  setupFormSync();
  updatePreview();
});
