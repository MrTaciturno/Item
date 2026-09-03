// Aitem - Sistema de Elaboração e Automação de Laudos Periciais
// Main Application Script with Word 2016 OpenXML Schema Compliant Footer and Conditional Template Blocks [?campo: texto {campo}]

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
  // HELPER DATA DE HOJE POR EXTENSO
  // ==========================================
  function getTodayExtenso() {
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[now.getMonth()];
    const ano = now.getFullYear();
    return `${dia} de ${mes} de ${ano}`;
  }

  const currentYear = new Date().getFullYear();
  const todayExtenso = getTodayExtenso();

  // ==========================================
  // VALORES PADRÃO (DEFAULTS DO MODELO DE LAUDO)
  // ==========================================
  const DEFAULTS = {
    dataDesignacao: todayExtenso,
    protocolo: 'P00000/26',
    laudoNum: `000000/${currentYear}`,
    boNum: 'AA0000-1/2026',
    delElaboracao: 'Del. Pol. Elaboração',
    delCircunscricao: 'Del. Pol. Circunscrição',
    naturezaExame: 'Descrição e fotografação',
    lacreNumero: '000000',
    dataElaboracao: `Americana, ${todayExtenso}`,
    lacreSaida: 'invólucro plástico (de lacre informado na capa deste laudo)',
    nomePerito: 'Perito Criminal Signatário'
  };

  // ==========================================
  // ESTADO GLOBAL DA APLICAÇÃO (LAUDO STATE)
  // ==========================================
  const laudoState = {
    preambulo: {
      dataDesignacao: DEFAULTS.dataDesignacao,
      protocolo: DEFAULTS.protocolo,
      laudoNum: DEFAULTS.laudoNum
    },
    objetivo: {
      boNum: DEFAULTS.boNum,
      delElaboracao: DEFAULTS.delElaboracao,
      delCircunscricao: DEFAULTS.delCircunscricao,
      naturezaExame: DEFAULTS.naturezaExame
    },
    lacres: [
      { id: 1, letra: 'a', numero: DEFAULTS.lacreNumero }
    ],
    objetos: [],
    fotos: [],
    fechamento: {
      lacreSaida: DEFAULTS.lacreSaida,
      dataElaboracao: DEFAULTS.dataElaboracao,
      nomePerito: DEFAULTS.nomePerito,
      textoCustom: ''
    },
    compendioData: null,
    selectedCategory: null
  };

  let editingObjetoId = null;
  let editingCompendioCatId = null;

  const mesesMap = {
    'JAN': 'janeiro', 'FEV': 'fevereiro', 'MAR': 'março', 'ABR': 'abril',
    'MAI': 'maio', 'JUN': 'junho', 'JUL': 'julho', 'AGO': 'agosto',
    'SET': 'setembro', 'OUT': 'outubro', 'NOV': 'novembro', 'DEZ': 'dezembro'
  };

  // ==========================================
  // HELPER NUMERAÇÃO POR EXTENSO
  // ==========================================
  function numeroParaExtenso(num) {
    const n = parseInt(num) || 1;
    const extensos = { 1: 'uma', 2: 'duas', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez' };
    return extensos[n] || `${n}`;
  }

  // ==========================================
  // HELPER FORMATAÇÃO DE NOME DE DELEGACIA
  // ==========================================
  function formatDelegaciaName(rawName) {
    if (!rawName) return '';
    const raw = rawName.trim();
    if (/^\d+[\s°º]*d\.?p\.?/i.test(raw)) {
      const num = raw.match(/^(\d+)/)[1];
      const rest = raw.replace(/^\d+[\s°º]*d\.?p\.?\s*/i, '');
      const cleanRest = rest.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      return `${parseInt(num)}DP ${cleanRest}`;
    }
    let str = raw.replace(/^\d+[-_\s]*/, '').replace(/^DEL\.?\s*POL\.?\s*/i, 'Del. Pol. ');
    if (!str.toLowerCase().startsWith('del') && !/^\d+/.test(str)) {
      str = 'Del. Pol. ' + str;
    }
    return str.split(/\s+/).map(word => {
      if (word.toUpperCase() === 'DEL.' || word.toUpperCase() === 'POL.') return word;
      if (/^\d+D\.?P\.?$/i.test(word) || word.toUpperCase() === 'D.P.' || word.toUpperCase() === 'DDM' || word.toUpperCase() === '1DP') return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
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

  // Preferences & Compêndio Manager Inputs
  const prefNomePerito = document.getElementById('pref-nome-perito');
  const prefDelElaboracao = document.getElementById('pref-del-elaboracao');
  const prefCidade = document.getElementById('pref-cidade');
  const btnSavePreferences = document.getElementById('btn-save-preferences');
  const inputCustomCompendioFile = document.getElementById('input-custom-compendio-file');
  const btnImportCompendio = document.getElementById('btn-import-compendio');
  const btnExportCompendioJSON = document.getElementById('btn-export-compendio-json');
  const btnResetCompendio = document.getElementById('btn-reset-compendio');

  // OCR Elements
  const ocrFileInput = document.getElementById('ocr-file-input');
  const ocrPastedText = document.getElementById('ocr-pasted-text');
  const btnParseText = document.getElementById('btn-parse-text');
  const ocrStatus = document.getElementById('ocr-status');
  const ocrStatusText = document.getElementById('ocr-status-text');
  const ocrResultsSummary = document.getElementById('ocr-results-summary');
  const ocrDetectedFieldsList = document.getElementById('ocr-detected-fields-list');

  // Compêndio & Objetos (Capítulo 2)
  const compendioCategoriesContainer = document.getElementById('compendio-categories');
  const objetoFormContainer = document.getElementById('objeto-form-container');
  const formDinamicoObjeto = document.getElementById('form-dinamico-objeto');
  const paragrafosAdicionaisContainer = document.getElementById('paragrafos-adicionais-container');
  const paragrafosAdicionaisList = document.getElementById('paragrafos-adicionais-list');
  const btnSalvarObjeto = document.getElementById('btn-salvar-objeto');
  const btnCancelarObjeto = document.getElementById('btn-cancelar-objeto');
  const objetosLista = document.getElementById('objetos-lista');

  // Editor do Compêndio (Aba 6)
  const compendioManagerList = document.getElementById('compendio-manager-list');
  const btnNovoModeloCompendio = document.getElementById('btn-novo-modelo-compendio');
  const compendioEditorContainer = document.getElementById('compendio-editor-container');
  const compendioEditorTitle = document.getElementById('compendio-editor-title');
  const editorCatNome = document.getElementById('editor-cat-nome');
  const editorCatIcone = document.getElementById('editor-cat-icone');
  const editorCatTemplate = document.getElementById('editor-cat-template');
  const editorCamposBuilder = document.getElementById('editor-campos-builder');
  const btnAddCampoBuilder = document.getElementById('btn-add-campo-builder');
  const editorParagrafosBuilder = document.getElementById('editor-paragrafos-builder');
  const btnAddParagrafoBuilder = document.getElementById('btn-add-paragrafo-builder');
  const btnSalvarModeloCompendio = document.getElementById('btn-salvar-modelo-compendio');
  const btnCancelarModeloCompendio = document.getElementById('btn-cancelar-modelo-compendio');

  // Leitor de Laudo Pronto (DOCX / PDF)
  const laudoProntoFileInput = document.getElementById('laudo-pronto-file-input');
  const laudoProntoStatus = document.getElementById('laudo-pronto-status');
  const laudoProntoStatusText = document.getElementById('laudo-pronto-status-text');
  const laudoProntoResults = document.getElementById('laudo-pronto-results');
  const laudoProntoParagraphsList = document.getElementById('laudo-pronto-paragraphs-list');

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
  // CARREGAR & EXPORTAR COMPÊNDIO JSON
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
      renderCompendioManagerList();
    } catch (err) {
      console.error('Erro ao carregar compêndio:', err);
    }
  }

  btnExportCompendioJSON.addEventListener('click', () => {
    if (!laudoState.compendioData) return;
    const jsonStr = JSON.stringify(laudoState.compendioData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'compendio_custom.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });

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
        renderCompendioManagerList();
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

  function saveCompendioStateToLocalStorage() {
    localStorage.setItem('aitem_custom_compendio', JSON.stringify(laudoState.compendioData));
    renderCompendioCategories();
    renderCompendioManagerList();
  }

  function renderCompendioCategories() {
    if (!laudoState.compendioData || !laudoState.compendioData.categorias) return;
    compendioCategoriesContainer.innerHTML = '';

    laudoState.compendioData.categorias.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `<span class="icon">${cat.icone || '📦'}</span><span>${cat.nome}</span>`;
      card.addEventListener('click', (e) => selectCategory(cat, e));
      compendioCategoriesContainer.appendChild(card);
    });
  }

  function selectCategory(category, e) {
    laudoState.selectedCategory = category;
    editingObjetoId = null;
    
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
    if (e && e.currentTarget) e.currentTarget.classList.add('selected');

    document.getElementById('objeto-form-title').innerText = `Preencher: ${category.nome}`;
    btnSalvarObjeto.innerText = '➕ Adicionar Objeto ao Laudo';
    renderObjetoLacreSelect();
    renderDynamicForm(category);
    renderParagrafosAdicionaisCheckboxes(category);
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
      const isDefault = (lacre.numero === DEFAULTS.lacreNumero);
      const tag = document.createElement('div');
      tag.className = 'lacre-tag';
      tag.innerHTML = `
        <span><strong>${laudoState.lacres.length > 1 ? `${lacre.letra}. ` : ''}</strong>Lacre nº <span class="${isDefault ? 'pv-field' : ''}">${lacre.numero}</span></span>
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
  // FORMULÁRIO DINÂMICO E PARÁGRAFOS ADICIONAIS DE EXAME
  // ==========================================
  function renderDynamicForm(category) {
    formDinamicoObjeto.innerHTML = '';

    if (!category.campos || !Array.isArray(category.campos)) return;

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

        if (campo.opcoes && Array.isArray(campo.opcoes)) {
          campo.opcoes.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.innerText = opt;
            inputEl.appendChild(option);
          });
        }
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

  function renderParagrafosAdicionaisCheckboxes(category) {
    paragrafosAdicionaisList.innerHTML = '';
    if (!category.paragrafos_adicionais || category.paragrafos_adicionais.length === 0) {
      paragrafosAdicionaisContainer.classList.add('hidden');
      return;
    }

    paragrafosAdicionaisContainer.classList.remove('hidden');

    category.paragrafos_adicionais.forEach(pAdd => {
      const item = document.createElement('div');
      item.className = 'paragrafo-adicional-checkbox-item';
      item.innerHTML = `
        <input type="checkbox" id="chk-padd-${pAdd.id}" data-padd-id="${pAdd.id}">
        <div>
          <strong>${pAdd.titulo}</strong>
          <p style="color: #475569; margin-top: 0.1rem;">${pAdd.texto_padrao}</p>
        </div>
      `;
      paragrafosAdicionaisList.appendChild(item);
    });
  }

  btnCancelarObjeto.addEventListener('click', () => {
    editingObjetoId = null;
    objetoFormContainer.classList.add('hidden');
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  });

  btnSalvarObjeto.addEventListener('click', () => {
    if (!laudoState.selectedCategory) return;

    const cat = laudoState.selectedCategory;
    const campoValues = {};
    if (cat.campos) {
      cat.campos.forEach(campo => {
        const el = document.getElementById(`dyn-field-${campo.id}`);
        if (el) {
          campoValues[campo.id] = el.value.trim();
        }
      });
    }

    const selectedParagrafosAdicionais = [];
    if (cat.paragrafos_adicionais) {
      cat.paragrafos_adicionais.forEach(pAdd => {
        const chk = document.getElementById(`chk-padd-${pAdd.id}`);
        if (chk && chk.checked) {
          selectedParagrafosAdicionais.push({
            id: pAdd.id,
            titulo: pAdd.titulo,
            texto_padrao: pAdd.texto_padrao
          });
        }
      });
    }

    const descFormatada = buildFormattedDescription(cat.modelo_descricao, campoValues);
    const lacreIdSelected = parseInt(selectObjetoLacre.value) || laudoState.lacres[0].id;

    if (editingObjetoId) {
      const index = laudoState.objetos.findIndex(o => o.id === editingObjetoId);
      if (index !== -1) {
        laudoState.objetos[index] = {
          id: editingObjetoId,
          lacreId: lacreIdSelected,
          categoriaNome: cat.nome,
          categoriaId: cat.id,
          descricaoFormatada: descFormatada,
          campos: campoValues,
          paragrafosAdicionais: selectedParagrafosAdicionais
        };
      }
      editingObjetoId = null;
    } else {
      const novoObjeto = {
        id: Date.now() + Math.random(),
        lacreId: lacreIdSelected,
        categoriaNome: cat.nome,
        categoriaId: cat.id,
        descricaoFormatada: descFormatada,
        campos: campoValues,
        paragrafosAdicionais: selectedParagrafosAdicionais
      };
      laudoState.objetos.push(novoObjeto);
    }

    renderObjetosLista();
    updatePreview();

    objetoFormContainer.classList.add('hidden');
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  });

  // ==========================================
  // CONSTRUTOR DE DESCRIÇÃO COM BLOCOS CONDICIONAIS [?campo: texto {campo}]
  // ==========================================
  function buildFormattedDescription(template, campoValues) {
    let desc = template || '';

    // 1. Processar blocos condicionais explícitos: [?campo: texto com {campo}] ou [se:campo: texto] ou [campo? texto]
    const blockRegex = /\[\s*(?:\?|se:)?\s*([a-zA-Z0-9_]+)\s*[:\?]\s*([^\]]+)\]/gi;

    desc = desc.replace(blockRegex, (fullMatch, key, blockContent) => {
      const val = (campoValues[key] || '').trim();
      if (val && val !== '[Omitir]') {
        return blockContent.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
      } else {
        return '';
      }
    });

    // 2. Fallbacks de retrocompatibilidade para placeholders padrão {key}
    if (campoValues.imei2 && campoValues.imei2.trim() && campoValues.imei2.trim() !== '[Omitir]') {
      if (!desc.includes(campoValues.imei2.trim())) {
        desc = desc.replace('{imei2}', ` e IMEI 2: ${campoValues.imei2.trim()}`);
      }
    } else {
      desc = desc.replace('{imei2}', '');
    }

    if (campoValues.sn && campoValues.sn.trim() && campoValues.sn.trim() !== '[Omitir]') {
      if (!desc.includes(campoValues.sn.trim())) {
        desc = desc.replace('{sn}', `, S/N: ${campoValues.sn.trim()}`);
      }
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

    // 3. Sanitização final de pontuação dupla e espaços excedentes
    desc = desc.replace(/\{[a-zA-Z0-9_]+\}/g, '')
               .replace(/;\s*;/g, ';')
               .replace(/;\s*\./g, '.')
               .replace(/,\s*\./g, '.')
               .replace(/\s+/g, ' ')
               .replace(/\s+\./g, '.')
               .replace(/\s+;/g, ';');

    if (campoValues.sim_cards && campoValues.sim_cards.trim() && campoValues.sim_cards.trim() !== '[Omitir]') {
      if (!desc.includes(campoValues.sim_cards.trim())) {
        desc += ` Anexo ao aparelho havia ${campoValues.sim_cards.trim()}.`;
      }
    }
    if (campoValues.cartao_memoria && campoValues.cartao_memoria.trim() && campoValues.cartao_memoria.trim() !== '[Omitir]') {
      if (!desc.includes(campoValues.cartao_memoria.trim())) {
        desc += ` Continha cartão de memória ${campoValues.cartao_memoria.trim()}.`;
      }
    }

    return desc.trim();
  }

  // ==========================================
  // FUNÇÕES DE EDIÇÃO E DUPLICAÇÃO DE OBJETOS
  // ==========================================
  window.editarObjeto = function(id) {
    const obj = laudoState.objetos.find(o => o.id === id);
    if (!obj) return;

    editingObjetoId = id;

    const category = laudoState.compendioData.categorias.find(cat => cat.nome === obj.categoriaNome || cat.id === obj.categoriaId) 
                  || laudoState.compendioData.categorias[0];

    laudoState.selectedCategory = category;

    document.getElementById('objeto-form-title').innerText = `✏️ Editar Objeto: ${category.nome}`;
    btnSalvarObjeto.innerText = '💾 Salvar Alterações do Objeto';

    renderObjetoLacreSelect();
    selectObjetoLacre.value = obj.lacreId;
    renderDynamicForm(category);
    renderParagrafosAdicionaisCheckboxes(category);

    if (obj.campos) {
      Object.keys(obj.campos).forEach(key => {
        const el = document.getElementById(`dyn-field-${key}`);
        if (el) {
          el.value = obj.campos[key];
        }
      });
    }

    if (obj.paragrafosAdicionais && Array.isArray(obj.paragrafosAdicionais)) {
      obj.paragrafosAdicionais.forEach(pAdd => {
        const chk = document.getElementById(`chk-padd-${pAdd.id}`);
        if (chk) chk.checked = true;
      });
    }

    objetoFormContainer.classList.remove('hidden');
    objetoFormContainer.scrollIntoView({ behavior: 'smooth' });
  };

  window.duplicarObjeto = function(id) {
    const obj = laudoState.objetos.find(o => o.id === id);
    if (!obj) return;

    const clone = {
      id: Date.now() + Math.random(),
      lacreId: obj.lacreId,
      categoriaNome: obj.categoriaNome,
      categoriaId: obj.categoriaId,
      descricaoFormatada: obj.descricaoFormatada,
      campos: obj.campos ? JSON.parse(JSON.stringify(obj.campos)) : {},
      paragrafosAdicionais: obj.paragrafosAdicionais ? JSON.parse(JSON.stringify(obj.paragrafosAdicionais)) : []
    };

    laudoState.objetos.push(clone);
    renderObjetosLista();
    updatePreview();
  };

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
          ${obj.paragrafosAdicionais && obj.paragrafosAdicionais.length > 0 ? `<small style="color: #2563eb;">+ ${obj.paragrafosAdicionais.length} parágrafo(s) de exame adicional(is)</small>` : ''}
        </div>
        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="editarObjeto(${obj.id})">✏️ Editar</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="duplicarObjeto(${obj.id})">📋 Duplicar</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="removerObjeto(${obj.id})">🗑️ Excluir</button>
        </div>
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
  // GERENCIADOR VISUAL DE MODELOS DO COMPÊNDIO (ABA 6)
  // ==========================================
  function renderCompendioManagerList() {
    compendioManagerList.innerHTML = '';
    if (!laudoState.compendioData || !laudoState.compendioData.categorias) return;

    laudoState.compendioData.categorias.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'objeto-item';
      item.innerHTML = `
        <div>
          <strong>${cat.icone || '📦'} ${cat.nome}</strong>
          <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.1rem;">${(cat.modelo_descricao || '').slice(0, 90)}...</p>
          <small style="color: #475569;">${(cat.campos || []).length} campo(s) | ${(cat.paragrafos_adicionais || []).length} parágrafo(s) de exame</small>
        </div>
        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="editarModeloCompendio('${cat.id}')">✏️ Editar Modelo</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="duplicarModeloCompendio('${cat.id}')">📋 Duplicar</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="excluirModeloCompendio('${cat.id}')">🗑️ Excluir</button>
        </div>
      `;
      compendioManagerList.appendChild(item);
    });
  }

  btnNovoModeloCompendio.addEventListener('click', () => {
    editingCompendioCatId = null;
    compendioEditorTitle.innerText = '➕ Criar Novo Modelo de Objeto no Compêndio';
    editorCatNome.value = '';
    editorCatIcone.value = '📦';
    editorCatTemplate.value = '01 (um) objeto periciado de marca {marca}, modelo {modelo}[?etiqueta:; ostentando etiqueta {etiqueta}].';
    
    renderCamposBuilder([
      { id: 'marca', label: 'Marca', tipo: 'text', placeholder: 'ex: Samsung' },
      { id: 'modelo', label: 'Modelo', tipo: 'text', placeholder: 'ex: Galaxy' }
    ]);
    renderParagrafosBuilder([]);

    compendioEditorContainer.classList.remove('hidden');
    compendioEditorContainer.scrollIntoView({ behavior: 'smooth' });
  });

  window.editarModeloCompendio = function(catId) {
    const cat = laudoState.compendioData.categorias.find(c => c.id === catId);
    if (!cat) return;

    editingCompendioCatId = catId;
    compendioEditorTitle.innerText = `✏️ Editar Modelo: ${cat.nome}`;
    editorCatNome.value = cat.nome;
    editorCatIcone.value = cat.icone || '📦';
    editorCatTemplate.value = cat.modelo_descricao || '';

    renderCamposBuilder(cat.campos || []);
    renderParagrafosBuilder(cat.paragrafos_adicionais || []);

    compendioEditorContainer.classList.remove('hidden');
    compendioEditorContainer.scrollIntoView({ behavior: 'smooth' });
  };

  window.duplicarModeloCompendio = function(catId) {
    const cat = laudoState.compendioData.categorias.find(c => c.id === catId);
    if (!cat) return;

    const cloneCat = JSON.parse(JSON.stringify(cat));
    cloneCat.id = `cat_${Date.now()}`;
    cloneCat.nome = `${cat.nome} (Cópia)`;

    laudoState.compendioData.categorias.push(cloneCat);
    saveCompendioStateToLocalStorage();
    alert(`Modelo "${cloneCat.nome}" duplicado com sucesso!`);
  };

  window.excluirModeloCompendio = function(catId) {
    if (laudoState.compendioData.categorias.length <= 1) {
      alert('Você não pode excluir a única categoria do compêndio.');
      return;
    }
    const cat = laudoState.compendioData.categorias.find(c => c.id === catId);
    if (confirm(`Deseja realmente excluir a categoria "${cat ? cat.nome : ''}" do compêndio?`)) {
      laudoState.compendioData.categorias = laudoState.compendioData.categorias.filter(c => c.id !== catId);
      saveCompendioStateToLocalStorage();
    }
  };

  function renderCamposBuilder(campos) {
    editorCamposBuilder.innerHTML = '';
    campos.forEach(c => addCampoBuilderRow(c));
  }

  function addCampoBuilderRow(campo = {}) {
    const row = document.createElement('div');
    row.className = 'editor-campo-row';
    const cId = campo.id || `campo_${Date.now()}`;
    row.innerHTML = `
      <input type="text" placeholder="ID (ex: marca)" value="${cId}" class="campo-builder-id" style="width: 110px;">
      <input type="text" placeholder="Rótulo (ex: Marca de Fabricação)" value="${campo.label || ''}" class="campo-builder-label" style="flex: 1;">
      <select class="campo-builder-tipo" style="width: 100px;">
        <option value="text" ${campo.tipo === 'text' ? 'selected' : ''}>Texto</option>
        <option value="select" ${campo.tipo === 'select' ? 'selected' : ''}>Dropdown</option>
        <option value="textarea" ${campo.tipo === 'textarea' ? 'selected' : ''}>Textarea</option>
      </select>
      <input type="text" placeholder="Opções (separadas por vírgula se dropdown)" value="${(campo.opcoes || []).join(', ')}" class="campo-builder-opcoes" style="flex: 1;">
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
    `;
    editorCamposBuilder.appendChild(row);
  }

  btnAddCampoBuilder.addEventListener('click', () => addCampoBuilderRow());

  function renderParagrafosBuilder(paragrafos) {
    editorParagrafosBuilder.innerHTML = '';
    paragrafos.forEach(p => addParagrafoBuilderRow(p));
  }

  function addParagrafoBuilderRow(p = {}) {
    const row = document.createElement('div');
    row.className = 'editor-paragrafo-row';
    const pId = p.id || `padd_${Date.now()}`;
    row.innerHTML = `
      <input type="text" placeholder="ID (ex: res_thc)" value="${pId}" class="padd-builder-id" style="width: 110px;">
      <input type="text" placeholder="Título (ex: Resultado para THC)" value="${p.titulo || ''}" class="padd-builder-titulo" style="flex: 1;">
      <textarea placeholder="Texto padrão resultante no laudo..." class="padd-builder-texto" style="flex: 2;" rows="2">${p.texto_padrao || ''}</textarea>
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
    `;
    editorParagrafosBuilder.appendChild(row);
  }

  btnAddParagrafoBuilder.addEventListener('click', () => addParagrafoBuilderRow());

  btnCancelarModeloCompendio.addEventListener('click', () => {
    editingCompendioCatId = null;
    compendioEditorContainer.classList.add('hidden');
  });

  btnSalvarModeloCompendio.addEventListener('click', () => {
    const nome = editorCatNome.value.trim();
    if (!nome) {
      alert('Por favor, informe o nome da categoria.');
      return;
    }

    const icone = editorCatIcone.value.trim() || '📦';
    const template = editorCatTemplate.value.trim();

    const campoRows = Array.from(editorCamposBuilder.querySelectorAll('.editor-campo-row'));
    const campos = campoRows.map(row => {
      const cId = row.querySelector('.campo-builder-id').value.trim() || `campo_${Math.random()}`;
      const cLabel = row.querySelector('.campo-builder-label').value.trim() || cId;
      const cTipo = row.querySelector('.campo-builder-tipo').value;
      const cOpcoesRaw = row.querySelector('.campo-builder-opcoes').value.trim();
      const cOpcoes = cOpcoesRaw ? cOpcoesRaw.split(',').map(o => o.trim()).filter(o => o.length > 0) : [];

      return {
        id: cId,
        label: cLabel,
        tipo: cTipo,
        opcoes: cTipo === 'select' ? cOpcoes : undefined
      };
    });

    const paddRows = Array.from(editorParagrafosBuilder.querySelectorAll('.editor-paragrafo-row'));
    const paragrafos = paddRows.map(row => {
      const pId = row.querySelector('.padd-builder-id').value.trim() || `padd_${Math.random()}`;
      const pTitulo = row.querySelector('.padd-builder-titulo').value.trim() || 'Resultado de Exame';
      const pTexto = row.querySelector('.padd-builder-texto').value.trim() || '';

      return {
        id: pId,
        titulo: pTitulo,
        texto_padrao: pTexto
      };
    });

    if (editingCompendioCatId) {
      const index = laudoState.compendioData.categorias.findIndex(c => c.id === editingCompendioCatId);
      if (index !== -1) {
        laudoState.compendioData.categorias[index] = {
          id: editingCompendioCatId,
          nome,
          icone,
          modelo_descricao: template,
          campos,
          paragrafos_adicionais: paragrafos
        };
      }
    } else {
      const newId = `cat_${Date.now()}`;
      laudoState.compendioData.categorias.push({
        id: newId,
        nome,
        icone,
        modelo_descricao: template,
        campos,
        paragrafos_adicionais: paragrafos
      });
    }

    saveCompendioStateToLocalStorage();
    compendioEditorContainer.classList.add('hidden');
    editingCompendioCatId = null;
    alert(`Modelo de objeto "${nome}" salvo no compêndio!`);
  });

  // ==========================================
  // LEITOR E EXTRATOR DE LAUDO PRONTO (DOCX / PDF)
  // ==========================================
  laudoProntoFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    laudoProntoStatus.classList.remove('hidden');
    laudoProntoStatusText.innerText = `Extraindo parágrafos do capítulo 2 do arquivo ${file.name}...`;

    try {
      let extractedParagraphs = [];

      if (file.name.endsWith('.docx')) {
        extractedParagraphs = await extractChapter2FromDocxFile(file);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extractedParagraphs = await extractChapter2FromPdfFile(file);
      }

      laudoProntoStatus.classList.add('hidden');

      if (extractedParagraphs.length > 0) {
        laudoProntoResults.classList.remove('hidden');
        renderLaudoProntoParagraphs(extractedParagraphs);
      } else {
        alert('Não foi possível localizar o Capítulo 2 ("DO(S) OBJETO(S) E DOS EXAMES") neste arquivo.');
      }
    } catch (err) {
      console.error('Erro ao ler laudo pronto:', err);
      laudoProntoStatus.classList.add('hidden');
      alert('Erro ao extrair conteúdo do arquivo: ' + err.message);
    }
  });

  async function extractChapter2FromDocxFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const fullContent = decoder.decode(new Uint8Array(arrayBuffer));

    const paragraphs = [];
    const pRegex = /<w:p[^>]*>(.*?)<\/w:p>/gs;
    const tRegex = /<w:t[^>]*>(.*?)<\/w:t>/gs;

    let pMatch;
    while ((pMatch = pRegex.exec(fullContent)) !== null) {
      const pContent = pMatch[1];
      let pText = '';
      let tMatch;
      while ((tMatch = tRegex.exec(pContent)) !== null) {
        pText += tMatch[1];
      }
      pText = cleanString(pText);
      if (pText) paragraphs.push(pText);
    }

    let inChapter2 = false;
    const chapter2Paragraphs = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      if (/2\.\s*DO\(S\)\s*OBJETO\(S\)\s*E\s*DOS\s*EXAMES/i.test(p) || /DO\(S\)\s*OBJETO\(S\)\s*E\s*DOS\s*EXAMES/i.test(p)) {
        inChapter2 = true;
        continue;
      }
      if (inChapter2) {
        if (/^\d\.\s*[A-Z\s]+/i.test(p) || /3\.\s*LEVANTAMENTO/i.test(p) || /4\.\s*DAS\s*CONSIDERAÇÕES/i.test(p)) {
          break;
        }
        chapter2Paragraphs.push(p);
      }
    }

    return chapter2Paragraphs.length > 0 ? chapter2Paragraphs : paragraphs.slice(0, 15);
  }

  async function extractChapter2FromPdfFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    const lines = fullText.split('\n').map(l => cleanString(l)).filter(l => l.length > 0);
    let inChapter2 = false;
    const chapter2Paragraphs = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/2\.\s*DO\(S\)\s*OBJETO\(S\)\s*E\s*DOS\s*EXAMES/i.test(line) || /DO\(S\)\s*OBJETO\(S\)\s*E\s*DOS\s*EXAMES/i.test(line)) {
        inChapter2 = true;
        continue;
      }
      if (inChapter2) {
        if (/^\d\.\s*[A-Z\s]+/i.test(line) || /3\.\s*LEVANTAMENTO/i.test(line) || /4\.\s*DAS\s*CONSIDERAÇÕES/i.test(line)) {
          break;
        }
        chapter2Paragraphs.push(line);
      }
    }

    return chapter2Paragraphs.length > 0 ? chapter2Paragraphs : lines.slice(0, 15);
  }

  function renderLaudoProntoParagraphs(paragraphs) {
    laudoProntoParagraphsList.innerHTML = '';
    paragraphs.forEach((pText, idx) => {
      const item = document.createElement('div');
      item.className = 'objeto-item';
      item.innerHTML = `
        <div style="flex: 1;">
          <strong>Parágrafo Extraído ${idx + 1}:</strong>
          <p style="font-size: 0.8rem; color: #475569; margin-top: 0.2rem;">${pText}</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="converterParagrafoEmModelo('${encodeURIComponent(pText)}')">⚡ Criar Modelo com Este Texto</button>
      `;
      laudoProntoParagraphsList.appendChild(item);
    });
  }

  window.converterParagrafoEmModelo = function(encodedText) {
    const rawText = decodeURIComponent(encodedText);
    editingCompendioCatId = null;
    compendioEditorTitle.innerText = '⚡ Criar Modelo do Compêndio a partir de Laudo Pronto';
    editorCatNome.value = 'Modelo Importado';
    editorCatIcone.value = '📋';
    editorCatTemplate.value = rawText;

    renderCamposBuilder([
      { id: 'marca', label: 'Marca', tipo: 'text', placeholder: 'ex: Samsung' }
    ]);
    renderParagrafosBuilder([]);

    compendioEditorContainer.classList.remove('hidden');
    compendioEditorContainer.scrollIntoView({ behavior: 'smooth' });
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
  // OCR & PARSER INTELIGENTE REFINADO
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
    const text = rawText.replace(/\r/g, '');
    const cleanSingleLine = rawText.replace(/\s+/g, ' ');
    const detected = [];

    // 1. Protocolo
    const protocoloMatch = text.match(/(?:protocolo[^\n]*?)\s*([P|p]\s*[\d\s\/]+)/i) 
                        || cleanSingleLine.match(/\b(P\s*\d{4,5}\/\d{2})\b/i);
    if (protocoloMatch) {
      const cleanProtocolo = protocoloMatch[1].replace(/\s+/g, '');
      laudoState.preambulo.protocolo = cleanProtocolo;
      inputProtocolo.value = cleanProtocolo;
      detected.push(`Protocolo: ${cleanProtocolo}`);
    }

    // 2. Número do Laudo Manuscrito / Rotulado
    let laudoNum = '';
    const laudoRotulado = text.match(/(?:laudo|laudo\s*n?[º°]?\s*)\s*(\d{4,6}(?:\s*\/\s*\d{2,4})?)/i);
    const laudoStandalone = text.match(/\b(\d{5,6}\s*\/\s*\d{2,4})\b/);

    if (laudoRotulado) {
      laudoNum = laudoRotulado[1].replace(/\s+/g, '');
    } else if (laudoStandalone) {
      laudoNum = laudoStandalone[1].replace(/\s+/g, '');
    }

    if (laudoNum) {
      if (!laudoNum.includes('/')) {
        laudoNum = `${laudoNum}/${currentYear}`;
      } else {
        const [numPart, yearPart] = laudoNum.split('/');
        if (yearPart.length === 2) {
          laudoNum = `${numPart}/20${yearPart}`;
        }
      }
      laudoState.preambulo.laudoNum = laudoNum;
      inputLaudoNum.value = laudoNum;
      detected.push(`Nº Laudo Detectado: ${laudoNum}`);
    }

    // 3. BO
    const boMatch = text.match(/(?:BO\s*N?[º°]?\s*:?\s*|boletim\s*n?[º°]?\s*:?\s*)([A-Z]{2}\d{4,6}-\d\/\d{4})/i) 
                 || cleanSingleLine.match(/\b([A-Z]{2}\d{4,6}-\d\/\d{4})\b/i);
    if (boMatch) {
      laudoState.objetivo.boNum = boMatch[1].trim();
      inputBoNum.value = boMatch[1].trim();
      detected.push(`BO: ${boMatch[1].trim()}`);
    }

    // 4. Delegacia de Elaboração
    let delElaboracao = '';
    const elabMatchLens = text.match(/Delegacia\s*:\s*(?:\d+[-_\s]*)?([^\n\r,]+)/i);
    const elabMatchPara = cleanSingleLine.match(/Elabora[^\s:]*\s*:\s*([^;\)\n\r]+?)(?=\s*e\s*Circunscri|\s*Circunscri|\s*\)|$)/i);
    if (elabMatchLens) {
      delElaboracao = formatDelegaciaName(elabMatchLens[1]);
    } else if (elabMatchPara) {
      delElaboracao = formatDelegaciaName(elabMatchPara[1]);
    }
    if (delElaboracao) {
      laudoState.objetivo.delElaboracao = delElaboracao;
      inputDelElaboracao.value = delElaboracao;
      detected.push(`Del. Elaboração: ${delElaboracao}`);
    }

    // 5. Delegacia de Circunscrição
    let delCircunscricao = '';
    const circMatch = text.match(/Circunscri[^\s:]*\s*:\s*([^;\)\n\r]+)/i);
    if (circMatch) {
      delCircunscricao = formatDelegaciaName(circMatch[1]);
      laudoState.objetivo.delCircunscricao = delCircunscricao;
      inputDelCircunscricao.value = delCircunscricao;
      detected.push(`Del. Circunscrição: ${delCircunscricao}`);
    }

    // 6. Natureza / Objetivo do Exame
    let naturezaExame = '';
    const natMatch = text.match(/(?:Natureza\s*do\s*Exame|Objetivo\s*da\s*Per[ií]cia)\s*:\s*([^"”\n\r]+)/i)
                  || cleanSingleLine.match(/(?:natureza\s*de\s*exame\s*:\s*|exame\s*:\s*)["“]?([^"”\n\.]+)/i);
    if (natMatch) {
      naturezaExame = natMatch[1].trim();
      laudoState.objetivo.naturezaExame = naturezaExame;
      inputNaturezaExame.value = naturezaExame;
      detected.push(`Natureza do Exame: ${naturezaExame}`);
    }

    // 7. BUSCA DE LACRES
    const lacresEncontrados = [];
    const lRegex1 = /(?:lacre|inv[oó]lucro)(?:[^\d\n\r]{0,35})?(\b\d{5,8}\b)/gi;
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

    // 8. Data da Designação
    let dataDesignacao = '';
    const dataCarimboMatch = text.match(/\b(\d{1,2})\s+([A-Z]{3})\s+(\d{4})\b/i);
    const dataExtensoMatch = text.match(/(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})/i);
    const dataNumericaMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);

    if (dataCarimboMatch) {
      const dia = dataCarimboMatch[1];
      const mesAbbr = dataCarimboMatch[2].toUpperCase();
      const ano = dataCarimboMatch[3];
      const mesNome = mesesMap[mesAbbr] || mesAbbr.toLowerCase();
      dataDesignacao = `${dia} de ${mesNome} de ${ano}`;
    } else if (dataExtensoMatch) {
      dataDesignacao = dataExtensoMatch[1].trim();
    } else if (dataNumericaMatch) {
      const dia = dataNumericaMatch[1];
      const mesNum = parseInt(dataNumericaMatch[2]);
      const ano = dataNumericaMatch[3];
      const mesesArr = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const mesNome = mesesArr[mesNum] || `${mesNum}`;
      dataDesignacao = `${dia} de ${mesNome} de ${ano}`;
    }

    if (dataDesignacao) {
      laudoState.preambulo.dataDesignacao = dataDesignacao;
      inputDataDesignacao.value = dataDesignacao;
      detected.push(`Data Designação: ${dataDesignacao}`);
    }

    // 9. AUTO-DETECÇÃO DE OBJETOS PERICIAIS
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
        marcaEncontrada = m === 'iPhone' ? 'Apple' : m;
        break;
      }
    }

    let modeloEncontrado = '';
    const modeloMatch = text.match(/(?:modelo\s*|modelo:\s*)([A-Z0-9\s-]+?)(?=;|\.|\n|IMEI|SN|S\/N|operante|bloqueado)/i) 
                     || text.match(/\b(iPhone\s+[A-Z0-9\s]+|Galaxy\s+[A-Z0-9\s]+|Redmi\s+[A-Z0-9\s]+|Moto\s+[A-Z0-9\s]+|XT\d{4}|BM\s*\d+|BM\d+)\b/i);
    if (modeloMatch) {
      modeloEncontrado = modeloMatch[1] || modeloMatch[0];
      modeloEncontrado = modeloEncontrado.trim();
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
        id: Date.now() + Math.random(),
        lacreId: laudoState.lacres[0] ? laudoState.lacres[0].id : 1,
        categoriaNome: 'Aparelho Celular (Smartphone)',
        categoriaId: 'smartphone',
        descricaoFormatada: desc,
        campos: {
          marca: marcaEncontrada,
          modelo: modeloEncontrado,
          estado_op: estadoOp,
          estado_bloqueio: estadoBloqueio,
          imei1: imei1,
          imei2: imei2,
          sn: sn
        },
        paragrafosAdicionais: []
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

    previewEditableContent.addEventListener('input', (e) => {
      const target = e.target;
      if (target && target.classList && target.classList.contains('pv-field')) {
        const id = target.id;
        let def = '';
        if (id === 'pv-data-designacao') def = DEFAULTS.dataDesignacao;
        else if (id === 'pv-protocolo') def = DEFAULTS.protocolo;
        else if (id === 'pv-laudo-num') def = DEFAULTS.laudoNum;
        else if (id === 'pv-bo-num') def = DEFAULTS.boNum;
        else if (id === 'pv-del-elaboracao') def = DEFAULTS.delElaboracao;
        else if (id === 'pv-del-circunscricao') def = DEFAULTS.delCircunscricao;
        else if (id === 'pv-natureza-exame') def = DEFAULTS.naturezaExame;
        else if (id === 'pv-lacre-saida') def = DEFAULTS.lacreSaida;

        if (def && target.innerText.trim() !== def.trim()) {
          target.classList.remove('pv-field');
        }
      }
    });
  }

  function calculateTotalPagesCalculated() {
    let numPages = 2;
    if (laudoState.fotos.length > 2 || laudoState.objetos.length > 3) {
      numPages = Math.ceil(laudoState.fotos.length / 2) + 1;
    }
    return Math.max(2, numPages);
  }

  function formatSpanField(id, text, defaultVal) {
    const cleanVal = (text || '').trim();
    const cleanDef = (defaultVal || '').trim();
    const isDefault = (!cleanVal || cleanVal === cleanDef);
    const displayVal = cleanVal || cleanDef;
    return `<span id="${id}" class="${isDefault ? 'pv-field' : ''}">${displayVal}</span>`;
  }

  function updatePreview() {
    document.getElementById('pv-data-designacao').innerHTML = formatSpanField('pv-data-designacao', laudoState.preambulo.dataDesignacao, DEFAULTS.dataDesignacao);
    document.getElementById('pv-protocolo').innerHTML = formatSpanField('pv-protocolo', laudoState.preambulo.protocolo, DEFAULTS.protocolo);
    document.getElementById('pv-laudo-num').innerHTML = formatSpanField('pv-laudo-num', laudoState.preambulo.laudoNum, DEFAULTS.laudoNum);

    document.getElementById('pv-bo-num').innerHTML = formatSpanField('pv-bo-num', laudoState.objetivo.boNum, DEFAULTS.boNum);
    document.getElementById('pv-del-elaboracao').innerHTML = formatSpanField('pv-del-elaboracao', laudoState.objetivo.delElaboracao, DEFAULTS.delElaboracao);
    document.getElementById('pv-del-circunscricao').innerHTML = formatSpanField('pv-del-circunscricao', laudoState.objetivo.delCircunscricao, DEFAULTS.delCircunscricao);
    document.getElementById('pv-natureza-exame').innerHTML = formatSpanField('pv-natureza-exame', laudoState.objetivo.naturezaExame, DEFAULTS.naturezaExame);

    const lacresResumoText = laudoState.lacres.length === 1 
      ? `invólucro plástico de lacre nº ${formatSpanField('pv-lacre-' + laudoState.lacres[0].id, laudoState.lacres[0].numero, DEFAULTS.lacreNumero)}`
      : `invólucros plásticos de lacres nº ${laudoState.lacres.map(l => formatSpanField('pv-lacre-' + l.id, l.numero, DEFAULTS.lacreNumero)).join(', ')}`;
    document.getElementById('pv-lacres-resumo').innerHTML = `O(s) objeto(s) descrito(s) estava(m) acondicionado(s) em ${lacresResumoText}.`;

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

          if (obj.paragrafosAdicionais && obj.paragrafosAdicionais.length > 0) {
            obj.paragrafosAdicionais.forEach(pAdd => {
              const pExtra = document.createElement('p');
              pExtra.className = 'document-p text-justify';
              pExtra.innerText = pAdd.texto_padrao;
              pvObjetosContainer.appendChild(pExtra);
            });
          }
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

              if (obj.paragrafosAdicionais && obj.paragrafosAdicionais.length > 0) {
                obj.paragrafosAdicionais.forEach(pAdd => {
                  const pExtra = document.createElement('p');
                  pExtra.className = 'document-p text-justify';
                  pExtra.innerText = pAdd.texto_padrao;
                  pvObjetosContainer.appendChild(pExtra);
                });
              }
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
    document.getElementById('pv-footer-pagina').innerText = 2;

    document.getElementById('pv-lacre-saida').innerHTML = formatSpanField('pv-lacre-saida', laudoState.fechamento.lacreSaida, DEFAULTS.lacreSaida);
    
    // CIDADE E DATA COM VÍRGULA NO FINAL
    let dataElabText = laudoState.fechamento.dataElaboracao || DEFAULTS.dataElaboracao;
    dataElabText = dataElabText.trim();
    if (dataElabText && !dataElabText.endsWith(',')) {
      dataElabText += ',';
    }
    document.getElementById('pv-data-elaboracao').innerHTML = formatSpanField('pv-data-elab-span', dataElabText, DEFAULTS.dataElaboracao + ',');

    // NOME E CARGO EM PARÁGRAFOS SEPARADOS
    const elNomePerito = document.getElementById('pv-nome-perito-nome');
    if (elNomePerito) {
      elNomePerito.innerHTML = `<strong>${formatSpanField('pv-nome-perito-span', laudoState.fechamento.nomePerito, DEFAULTS.nomePerito)}</strong>`;
    }
    const elCargoPerito = document.getElementById('pv-nome-perito-cargo');
    if (elCargoPerito) {
      elCargoPerito.innerText = `Perito Criminal`;
    }
  }

  function sanitizeYellowHighlightsBeforeExport() {
    const pvFields = previewEditableContent.querySelectorAll('.pv-field');
    pvFields.forEach(el => {
      const txt = el.innerText.trim();
      const id = el.id;
      let def = '';
      if (id === 'pv-data-designacao') def = DEFAULTS.dataDesignacao;
      else if (id === 'pv-protocolo') def = DEFAULTS.protocolo;
      else if (id === 'pv-laudo-num') def = DEFAULTS.laudoNum;
      else if (id === 'pv-bo-num') def = DEFAULTS.boNum;
      else if (id === 'pv-del-elaboracao') def = DEFAULTS.delElaboracao;
      else if (id === 'pv-del-circunscricao') def = DEFAULTS.delCircunscricao;
      else if (id === 'pv-natureza-exame') def = DEFAULTS.naturezaExame;
      else if (id === 'pv-lacre-saida') def = DEFAULTS.lacreSaida;
      else if (id && id.startsWith('pv-lacre-')) def = DEFAULTS.lacreNumero;

      if (def && txt !== def.trim()) {
        el.classList.remove('pv-field');
      }
    });
  }

  function getExportFileName() {
    let sufixoObjeto = 'objeto';
    if (laudoState.objetos && laudoState.objetos.length > 0) {
      const primeiroObj = laudoState.objetos[0];
      const raw = primeiroObj.categoriaId || primeiroObj.categoriaNome || 'objeto';
      const clean = raw.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      if (clean) sufixoObjeto = clean;
    }
    const numClean = (laudoState.preambulo.laudoNum || '000000_2026').replace(/\//g, '_');
    return `${numClean}$${sufixoObjeto}.docx`;
  }

  function cleanString(str) {
    return (str || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ==========================================
  // EXPORTAÇÃO PARA ARQUIVO .DOCX
  // ==========================================
  btnExportDocx.addEventListener('click', async () => {
    try {
      btnExportDocx.disabled = true;
      btnExportDocx.innerHTML = '⏳ Gerando Laudo .docx...';

      sanitizeYellowHighlightsBeforeExport();

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

      let rodapeBuffer = null;
      try {
        const resp = await fetch('rodape.png');
        rodapeBuffer = await resp.arrayBuffer();
      } catch (err) {
        console.warn('Não foi possível carregar rodape.png para a exportação:', err);
      }

      const docParagraphs = [];

      function processElementTree(node) {
        const children = Array.from(node.children);

        children.forEach(child => {
          const tagName = child.tagName.toUpperCase();

          if (tagName === 'H3') {
            const hText = cleanString(child.innerText);
            if (hText) {
              docParagraphs.push(
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 180, after: 80 },
                  children: [new TextRun({ text: hText, bold: true, font: "Arial", size: 24 })]
                })
              );
            }
          }
          else if (tagName === 'P') {
            const isRight = child.classList.contains('text-right');
            const isSublacre = child.classList.contains('document-sublacre');
            const isPBold = child.querySelector('strong') !== null || isSublacre;

            const textRuns = [];

            function parseParagraphChildNodes(parent) {
              const childNodes = Array.from(parent.childNodes);
              childNodes.forEach(n => {
                if (n.nodeType === 3) { // TEXT_NODE
                  let txt = n.nodeValue;
                  if (txt) {
                    txt = txt.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');

                    if (textRuns.length === 0) {
                      txt = txt.trimStart();
                    }

                    if (txt) {
                      let isYellow = false;
                      let curr = n.parentElement;
                      while (curr && curr !== child) {
                        if (curr.classList && curr.classList.contains('pv-field')) {
                          isYellow = true;
                          break;
                        }
                        curr = curr.parentElement;
                      }

                      const isBoldNode = isPBold || (n.parentElement && n.parentElement.tagName === 'STRONG');

                      textRuns.push(new TextRun({
                        text: txt,
                        bold: isBoldNode,
                        highlight: isYellow ? "yellow" : undefined,
                        font: "Arial",
                        size: 24
                      }));
                    }
                  }
                } else if (n.nodeType === 1) { // ELEMENT_NODE
                  if (n.tagName !== 'BR') {
                    parseParagraphChildNodes(n);
                  }
                }
              });
            }

            parseParagraphChildNodes(child);

            if (textRuns.length > 0) {
              docParagraphs.push(
                new Paragraph({
                  alignment: isRight ? AlignmentType.RIGHT : alignJustified,
                  indent: isRight ? undefined : { firstLine: 709 },
                  spacing: { line: isRight ? 240 : 360, after: isRight ? 0 : 200 },
                  children: textRuns
                })
              );
            }
          }
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
          else if (child.id === 'pv-objetos-container' || child.classList.contains('signature-block-right') || child.tagName === 'DIV') {
            processElementTree(child);
          }
        });
      }

      processElementTree(previewEditableContent);

      const cell1Children = [];
      if (rodapeBuffer) {
        cell1Children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: rodapeBuffer,
                transformation: { width: 480, height: 26 }
              })
            ]
          })
        );
      } else {
        cell1Children.push(new Paragraph({ alignment: AlignmentType.CENTER }));
      }

      const footerTable = new Table({
        width: { size: 5000, type: WidthType.PERCENTAGE },
        columnWidths: [4250, 750],
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
                width: { size: 4250, type: WidthType.PERCENTAGE },
                children: cell1Children
              }),
              new TableCell({
                width: { size: 750, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: "Fls. ", font: "Arial", size: 16 }),
                      new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16 })
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
              pageNumbers: { start: 2 },
              margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }
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
              ] : [new Paragraph({})]
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
      const fileName = getExportFileName();

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
