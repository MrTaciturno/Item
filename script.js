
function apagaFotos() {
  const fotos = document.querySelectorAll('.foto-importada, .foto-importada-secreta');
  fotos.forEach(foto => {
    foto.remove();
  });
}

function abrirLegendasPadrao() {
  document.getElementById('popupLegendasPadrao').style.display = 'block';
}


function fecharLegendasPadrao() {
  document.getElementById('popupLegendasPadrao').style.display = 'none';
}
// Array para armazenar os dadosGerais
let dadosGerais = [{
  naturezaDoExame:"",
  Perito:"",
  Diretor:"",
  Nucleo:"",
  Equipe:"",
  placa:"",
  chassi:"",
  tipo:"",
  anoFabricacao:"",
  marca:"",
  cor:"",
  protocolo:"",
  bo:"",
  delegacia:"",
  delegado:"",
  REP:""
}];

dadosGerais.naturezaDoExame = "";
dadosGerais.Perito = "";
dadosGerais.Diretor = "";
dadosGerais.Nucleo = "";
dadosGerais.Equipe = "";
dadosGerais.placa = "";
dadosGerais.chassi = "";
dadosGerais.tipo = "";
dadosGerais.anoFabricacao = "";
dadosGerais.marca = "";
dadosGerais.cor = "";
dadosGerais.protocolo = "";
dadosGerais.bo = "";
dadosGerais.delegacia = "";
dadosGerais.delegado = "";
dadosGerais.REP = "";

function abrirPopupTeste() {
    document.getElementById('popupTeste').style.display = 'block';
}

function proximoSSeg(){
    document.getElementById('popupTeste').style.display = 'none';
    const operantes = document.getElementById('a1');
    const inoperantes = document.getElementById('a2');
    const prejudicados = document.getElementById('a3');

    if (operantes.checked) {
        document.getElementById('popupSistSeg').style.display = 'block';
    } else if (inoperantes.checked) {
        document.getElementById('popupSistSeg2').style.display = 'block';
    } else if (prejudicados.checked) {
        document.getElementById('popupPneumatico').style.display = 'block';
    }
    
    
}

function testePneumatico() {
    document.getElementById('popupSistSeg').style.display = 'none';
    document.getElementById('popupSistSeg2').style.display = 'none';
    document.getElementById('popupPneumatico').style.display = 'block';
}
function testePneumatico2() {
    document.getElementById('popupPneumatico').style.display = 'none';
    document.getElementById('popupPneumatico2').style.display = 'block';
}





function finalizarTeste() {
    document.getElementById('popupPneumatico2').style.display = 'none';
    
    let texto = '';
    const operantes = document.getElementById('a1');
    const inoperantes = document.getElementById('a2');
    const prejudicados = document.getElementById('a3');

    // Verificar sistemas de segurança
    if (operantes.checked) {
        texto = 'Quando dos exames, seus sistemas de segurança para o tráfego (freio, direção e elétrico) se encontravam articulados e atuantes.';
        
        // Verificar itens não funcionais
        const checkboxesTeste = document.getElementById('popupSistSeg')
            .querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxesTeste.length > 0) {
            texto = texto.slice(0, -1) + ', exceto: ';
            checkboxesTeste.forEach((checkbox, index) => {
                if(index === 0){
                    texto += checkbox.nextElementSibling.textContent;
                } else if (index === checkboxesTeste.length - 1) {
                    texto += ' e ' + checkbox.nextElementSibling.textContent;
                } else {
                    texto += ',' +checkbox.nextElementSibling.textContent;
                }
            });
            texto += '. ';
        }
    } else if (inoperantes.checked) {
        texto = 'Quando dos exames, seus sistemas de segurança para o tráfego se encontravam inoperantes. ';
        
        // Verificar observações
        const checkboxesAvariados = document.getElementById('popupSistSeg2')
            .querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxesAvariados.forEach(checkbox => {
            texto += checkbox.nextElementSibling.textContent + ' ';
        });
    } else if (prejudicados.checked) {
        texto = 'Quando dos exames, seus sistemas de segurança para o tráfego se encontravam prejudicados pelos danos. ';
    }

    // Verificar estado dos pneumáticos
    const pneuRegular = document.getElementById('b1');
    const pneuIrregular = document.getElementById('b2'); 
    const pneuDesinflado = document.getElementById('b3');
    const pneuAusente = document.getElementById('b4');
    const pneuDanificado = document.getElementById('b5');
    

    if (pneuRegular.checked) {
        texto += 'Pneumáticos em estado regular.';
    } else if (pneuIrregular.checked){
        texto += 'Pneumáticos em estado aquém do regular.';
    } else if (pneuDesinflado.checked) {
        texto += 'Pneumáticos encontravam-se desinflados.';
    } else if (pneuAusente.checked) {
        texto += 'Pneumáticos ausentes.';
    } else if (pneuDanificado.checked) {
        texto += 'Pneumáticos danificados.';
    }
    const checkboxesPneu = document.getElementById('popupPneumatico2')
        .querySelectorAll('input[type="checkbox"]:checked');
    
    let tempPneus = ", exceto: ";
    if (checkboxesPneu.length > 0) {
        checkboxesPneu.forEach((checkbox, index) => {
            if (index === 0) {
                tempPneus += checkbox.nextElementSibling.textContent;
            } else if (index === checkboxesPneu.length - 1) {
                tempPneus += ' e ' + checkbox.nextElementSibling.textContent;
            } else {
                tempPneus += ', ' + checkbox.nextElementSibling.textContent;
            }
        });
        tempPneus += '.';
        texto = texto.slice(0,-1) + tempPneus;
    }
    

    document.getElementById('testesVeic').value = texto;


}

function abrirPopupDano() {
    document.getElementById('popupTipoDano').style.display = 'block';
}

function proximoOrientacao() {
    document.getElementById('popupTipoDano').style.display = 'none';
    document.getElementById('popupOrientacao').style.display = 'block';
}

function proximoSituado() {
    document.getElementById('popupOrientacao').style.display = 'none';
    document.getElementById('popupSituado').style.display = 'block';
}

function finalizarDano() {
    document.getElementById('popupSituado').style.display = 'none';
    // Pegar todas as checkboxes marcadas
    let texto = '';
    
    // Tipo de dano
    const tipoDano = document.getElementById('popupTipoDano')
                            .querySelectorAll('input[type="checkbox"]:checked');
    
    // Orientação
    const orientacao = document.getElementById('popupOrientacao')
                              .querySelectorAll('input[type="checkbox"]:checked');
    
    // Situado
    const situado = document.getElementById('popupSituado')
                          .querySelectorAll('input[type="checkbox"]:checked');

    // Montar o texto com as opções selecionadas
    for (let i = 0; i < tipoDano.length; i++){
        let comma =', ';
        if((tipoDano.length==2)&&i==0) comma = ' e ';
        //if((tipoDano.length==3)&&i==0) comma = ', ';
        if((tipoDano.length==3)&&i==1) comma = ' e ';
        texto += tipoDano[i].nextElementSibling.textContent + comma;
    }
    texto += 'orientado(s) ';

    orientacao.forEach(checkbox => {
        texto += checkbox.nextElementSibling.textContent + ', ';
    });
    texto += 'situado(s) '
    situado.forEach(checkbox => {
        texto += checkbox.nextElementSibling.textContent + ', ';
    });
    texto = texto.slice(0, -2)+ '.';
    
    // Desmarcar todas as checkboxes
    tipoDano.forEach(checkbox => checkbox.checked = false);
    orientacao.forEach(checkbox => checkbox.checked = false); 
    situado.forEach(checkbox => checkbox.checked = false);
    // Adicionar ao textarea

    document.getElementById('danosVeic').value = document.getElementById('danosVeic').value + texto + '\n';
}

// Carregar dados padrão do arquivo pref.csv
window.onload = function() {

    const dadosBase = document.getElementById('dadosBase');
    dadosBase.value = 
`Perito: Leonardo Reis da Silva
Diretor:
Núcleo: Núcleo de Perícias Criminalísticas de Americana
Equipe:`;
}


function importarPref() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = function(e) {
        const arquivo = e.target.files[0];
        const leitor = new FileReader();
        
        leitor.onload = function(evento) {
            const dadosBase = document.getElementById('dadosBase');
            dadosBase.value = evento.target.result;
        };
        
        leitor.readAsText(arquivo);
    };
    
    input.click();
}

function salvarPref() {
    // Garantir que os dados estejam em UTF-8
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8');
    const dadosUTF8 = encoder.encode(document.getElementById('dadosBase').value);
    const dadosVerificados = decoder.decode(dadosUTF8);
    const dadosBase = document.getElementById('dadosBase').value;
    const blob = new Blob([dadosBase], { type: 'text/txt' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pref.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}

let resultado = document.getElementById('resultado');

function abrirFoto() {
    // Criar input de arquivo oculto
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        let file = e.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function(event) {
                // Criar uma imagem temporária
                let img = new Image();
                img.onload = function() {
                    canvas.style.display = 'block';
                    video.style.display = 'none';
                    botaoCaptFoto.disabled = true;
                    botaoAbreFoto.disabled = true;

                    // Configurar dimensões do canvas
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Desenhar imagem no canvas
                    let ctx = canvas.getContext('2d',{ willReadFrequently: true });
                    ctx.drawImage(img, 0, 0);
                    
                    // Melhorar a imagem para OCR
                    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let data = imageData.data;

                    // Aumentar DPI para 300
                    let tempCanvas = document.createElement('canvas');
                    let scale = 300 / 96; // 96 é o DPI padrão
                    tempCanvas.width = canvas.width * scale;
                    tempCanvas.height = canvas.height * scale;
                    let tempCtx = tempCanvas.getContext('2d');
                    
                    // Configurar para melhor qualidade de redimensionamento
                    tempCtx.imageSmoothingEnabled = true;
                    tempCtx.imageSmoothingQuality = 'high';
                    
                    // Redimensionar a imagem
                    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                    
                    // Copiar de volta para o canvas original
                    canvas.width = tempCanvas.width;
                    canvas.height = tempCanvas.height;
                    ctx.drawImage(tempCanvas, 0, 0);
                    
                    // Atualizar o contexto e os dados da imagem
                    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    data = imageData.data;

                    // Converter para escala de cinza e aumentar contraste
                    for (let i = 0; i < data.length; i += 4) {
                        let r = data[i];
                        let g = data[i + 1];
                        let b = data[i + 2];
                        
                        // Converter para escala de cinza
                        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                        
                        // Aumentar contraste
                        gray = gray < 128 ? gray * 0.8 : gray * 1.2;
                        
                        // Limitar valores entre 0 e 255
                        gray = Math.min(255, Math.max(0, gray));
                        
                        data[i] = data[i + 1] = data[i + 2] = gray;
                    }
                    
                    ctx.putImageData(imageData, 0, 0);
                    reconhecerTexto();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();

}

function capturarFoto() {
    canvas.style.display = 'block';
    video.style.display = 'none';
    botaoCaptFoto.disabled = true;
    botaoAbreFoto.disabled = true;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    // Melhorar a imagem para OCR
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    

    // Aumentar DPI para 300
    let tempCanvas = document.createElement('canvas');
    let scale = 300 / 96; // 96 é o DPI padrão
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    let tempCtx = tempCanvas.getContext('2d');
    
    // Configurar para melhor qualidade de redimensionamento
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    // Redimensionar a imagem
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Copiar de volta para o canvas original
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Atualizar o contexto e os dados da imagem
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;
    // Converter para escala de cinza e aumentar contraste
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Converter para escala de cinza
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Aumentar contraste
        gray = gray < 128 ? gray * 0.8 : gray * 1.2;
        
        // Limitar valores entre 0 e 255
        gray = Math.min(255, Math.max(0, gray));
        
        data[i] = gray;
        data[i + 1] = gray; 
        data[i + 2] = gray;
    }
    
    ctx.putImageData(imageData, 0, 0);

    reconhecerTexto();
}

function reconhecerTexto() {
    const resultado = document.getElementById('resultado');
    const areaTexto = document.getElementById('textoOCR');
    

    areaTexto.value = 'Processando...';



    
    Tesseract.recognize(
        canvas,
        'por', // Idioma português
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        areaTexto.value = text;
        canvas.style.display = 'none';
        video.style.display = 'block';
        botaoCaptFoto.disabled = false;
        botaoAbreFoto.disabled = false;
    }).catch(erro => {
        console.error('Erro no reconhecimento:', erro);
        areaTexto.value = 'Erro no reconhecimento de texto.';
        canvas.style.display = 'none';
        video.style.display = 'block';
        botaoCaptFoto.disabled = false;
        botaoAbreFoto.disabled = false;
    });

}
function analisarTexto() {
    const texto = document.getElementById('textoOCR').value;
    const textoAnalisado = document.getElementById('textoAnalisado');
    
    let naturezaDoExame = "";
    let placa = "";
    let chassi = "";
    
    // Procurar Natureza do Exame
    const regexNatureza = /Natureza do Exame:?\s*([^\n]+)/i;
    const matchNatureza = texto.match(regexNatureza);
    if (matchNatureza) {

        naturezaDoExame = matchNatureza[1].trim();
        // Remove eventuais ':' da string
        naturezaDoExame = naturezaDoExame.replace(/:/g, '');
        // Remover pontos finais da natureza do exame
        naturezaDoExame = naturezaDoExame.replace(/\.$/, '');
        
    }

    dadosGerais.naturezaDoExame = naturezaDoExame.toUpperCase();
    
    // Procurar Placa
    const regexPlaca = /placa:?\s*([A-Z0-9]{7})/i;
    const matchPlaca = texto.match(regexPlaca);
    if (matchPlaca) {
        placa = matchPlaca[1].trim();
    }
    dadosGerais.placa = placa.toUpperCase();
    // Procurar Chassi
    // Procurar Chassi com tolerância a erros e espaços
    const regexChassiFlexivel = /chassi:?\s*([A-Z0-9\s]{15,25})/i; 
    const matchChassiFlexivel = texto.match(regexChassiFlexivel);
    if (matchChassiFlexivel) {
        let chassiEncontrado = matchChassiFlexivel[1].trim();
        // Se o chassi encontrado não tiver exatamente 17 caracteres, tenta ajustar
        if (chassiEncontrado.length !== 17) {
            // Remove caracteres especiais mantendo apenas letras, números e espaços
            chassiEncontrado = chassiEncontrado.replace(/[^A-Z0-9\s]/gi, '');
            // Remove espaços extras
            chassiEncontrado = chassiEncontrado.replace(/\s+/g, ' ');
            // Remove todos os espaços para normalizar
            chassiEncontrado = chassiEncontrado.replace(/\s/g, '');
            // Pega os primeiros 17 caracteres se tiver mais
            if (chassiEncontrado.length > 17) {
                chassiEncontrado = chassiEncontrado.substring(0, 17);
            }
        }
        chassi = chassiEncontrado;
    }
    const regexChassi = /chassi:?\s*([A-Z0-9]{17})/i;
    const matchChassi = texto.match(regexChassi);
    if (matchChassi) {
        chassi = matchChassi[1].trim();
    }
    dadosGerais.chassi = chassi.toUpperCase();

    
    // Procurar Tipo
    
    let tipo = '';
    const regexTipo = /tipo:?\s*([^]*?)(?=\s*Ano|$)/i;
    const matchTipo = texto.match(regexTipo);
    if (matchTipo) {
        tipo = matchTipo[1].trim();
    }
    dadosGerais.tipo = tipo.toUpperCase();

    // Procurar Ano de Fabricação
    let anoFabricacao = '';
    const regexAnoFabricacao = /(?:ano(?:\s+de)?\s+fabrica[çc][aã]o|fab\/mod)[:.]?\s*(\d{4})/i;
    const matchAnoFabricacao = texto.match(regexAnoFabricacao);
    if (matchAnoFabricacao) {
        anoFabricacao = matchAnoFabricacao[1].trim();
    }
    dadosGerais.anoFabricacao = anoFabricacao.toUpperCase();

    // Procurar Marca até a palavra Combustível
    let marca = '';
    const regexMarca = /marca:?\s*([^]*?)(?=\s*Comb|$)/i;
    const matchMarca = texto.match(regexMarca);
    if (matchMarca) {
        marca = matchMarca[1].trim();
    }

    dadosGerais.marca = marca.toUpperCase();
    // Procurar Cor como palavra isolada

    let cor = '';
    const regexCorIsolada = /\b(?:cor|Cor)\b:?\s*([^\n]+)/i;
    const matchCorIsolada = texto.match(regexCorIsolada);
    if (matchCorIsolada) {
        // Pegar apenas a primeira palavra da cor
        cor = matchCorIsolada[1].trim().split(/\s+/)[0];
        // Converter cores no masculino para feminino
        const coresMasculino = {
            'branco': 'branca',
            'preto': 'preta', 
            'vermelho': 'vermelha',
            'amarelo': 'amarela',
            'azul': 'azul',
            'verde': 'verde',
            'marrom': 'marrom',
            'cinza': 'cinza',
            'prata': 'prata',
            'dourado': 'dourada',
            'laranja': 'laranja',
            'roxo': 'roxa',
            'bege': 'bege'
        };
        
        cor = cor.toLowerCase();
        if (coresMasculino[cor]) {
            cor = coresMasculino[cor];
        }
    }
    dadosGerais.cor = cor.toUpperCase();




    // Procurar Protocolo
    let protocolo = '';
    const regexProtocolo = /[Vv]\d{5}\/\d{2}/;
    const matchProtocolo = texto.match(regexProtocolo);
    if (matchProtocolo) {
        protocolo = matchProtocolo[0];
    }
    dadosGerais.protocolo = protocolo.toUpperCase();

    // Procurar BO/Boletim
    let bo = '';
    let boletim = '';
    
    // Procura no formato específico XX0000-0/0000
    const regexBoFormato = /[A-Z]{2}\d{4}-\d\/\d{4}/;
    const matchBoFormato = texto.match(regexBoFormato);
    
    // Procura genérica por BO ou Boletim
    const regexBo = /(?:BO|Boletim)[:\s]+([^\n]+)/i;
    const matchBo = texto.match(regexBo);
    
    if (matchBoFormato) {
        // Se encontrou no formato específico, usa este
        bo = matchBoFormato[0];
        boletim = bo;
    } else if (matchBo) {
        // Se encontrou no formato genérico, usa este
        bo = matchBo[1].trim();
        boletim = bo;
    }

    dadosGerais.bo = bo.toUpperCase();

    // Procurar nome do Delegado
    let delegado = '';
    const regexDelegado = /(?:Dr\.|Dra\.|Delegado|Delegada|Delegado\(a\))[.\s]+([^,\n]+)/i; 

    const matchDelegado = texto.search(regexDelegado);
                
    if (matchDelegado!=-1) {

        // Procura um nome antes da posição do delegado
        const textoAntesDoMatch = texto.substring(0, matchDelegado);
        const linhas = textoAntesDoMatch.split('\n');
        let ultimaLinha = linhas[linhas.length - 1].trim();
        if (ultimaLinha=="") ultimaLinha = linhas[linhas.length - 2].trim();
        delegado = ultimaLinha;

    }

    
    dadosGerais.delegado =delegado.toUpperCase();

    // Procurar Delegacia
    let delegacia = '';
    //const regexDelegacia = /(?:\d{3}\s*[-]?\s*)?([^,\n]*Delegacia[^,\n]*)/i;
    const regexDelegacia = /Delegacia?\s*([^\n]+)/i;
    const matchDelegacia = texto.match(regexDelegacia);
    
    if (matchDelegacia) {
        // Pega o grupo capturado que exclui os 3 dígitos iniciais
        delegacia = matchDelegacia[1].trim().slice(6);

    }
    dadosGerais.delegacia = delegacia.toUpperCase();
    // Montar texto de resultado

    dadosGerais.REP = document.getElementById('REP').value;

      
    const resultado = `Natureza do Exame: ${naturezaDoExame}
Tipo: ${tipo}
Placa: ${placa}
Chassi: ${chassi}
Ano de Fabricação: ${anoFabricacao}
Marca: ${marca}
Cor: ${cor}
Protocolo: ${protocolo}
BO: ${bo}
Delegacia:${delegacia}
Delegado:${delegado}
REP:${dadosGerais.REP}`;

    textoAnalisado.value = resultado;

}


const compressImage = async (file, { quality = 1, type = file.type }) => {
    // Get as image data
    const imageBitmap = await createImageBitmap(file);

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);

    // Turn into Blob
    const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, type, quality)
    );

    // Turn Blob into File
    return new File([blob], file.name, {
        type: blob.type,
    });
};
async function pegaFotos() {
    try {
        // Solicitar permissão para acessar arquivos
        // Criar input de arquivo para selecionar múltiplas fotos
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        
        input.onchange = async function(e) {
                                
            // Array para armazenar as fotos selecionadas
            const fotos = [];

            // Processar cada arquivo selecionado
            for (const arquivo of e.target.files) {
                const dataModificacao = arquivo.lastModified;
                
                // Adicionar ao array com data de modificação
                fotos.push({
                    arquivo: arquivo,
                    data: dataModificacao
                });

            }

            // Ordenar fotos por data de modificação (mais recentes primeiro)
            // fotos.sort((a, b) => b.data - a.data);

            // Criar elementos de imagem para as fotos selecionadas





            for (const foto of fotos) {
                const compressedFile = await compressImage(foto.arquivo, {
                    // 0: is maximum compression
                    // 1: is no compression
                    quality: 0.2,

                    // We want a JPEG file
                    type: 'image/jpeg',
                });
                const url = URL.createObjectURL(compressedFile);

                const img = document.createElement('img');
                const img2 = document.createElement('img');
                img.src = url;
                img2.src = url;
                img.className = 'foto-importada';
                img2.className = 'foto-importada-secreta';
                img.style.marginTop = '10px';
                img.style.width = '454';
                img2.style.width = '100%';
                img.style.display = 'none';
                //img.style.inlineSize = '100%';
                //img.width = 454;
                document.getElementById('bedeibagens').appendChild(img2);
                document.getElementById('bedeibagens').appendChild(img);

            }
            
        };

        // Acionar o seletor de arquivos
        input.click();

    } catch (erro) {
        console.error('Erro ao acessar diretório:', erro);
        alert('Não foi possível acessar o diretório de fotos.');
    }
}


function montaLaudo(){
    document.getElementById('gerarDocumentoWord').disabled = true;
    const dadosBase = document.getElementById('dadosBase').value;
    let linhas = dadosBase.split('\n');


    for (let linha of linhas) {
        if (linha.startsWith('Perito:')) {
            dadosGerais.Perito = linha.replace('Perito:', '').trim();
        }
        else if (linha.startsWith('Diretor:')) {
            dadosGerais.Diretor = linha.replace('Diretor:', '').trim();
        }
        else if (linha.startsWith('Núcleo:')) {
            dadosGerais.Nucleo = linha.replace('Núcleo:', '').trim();
        }
        else if (linha.startsWith('Equipe:')) {
            dadosGerais.Equipe = linha.replace('Equipe:', '').trim();
        }
    }
    const textoAnalisado = document.getElementById('textoAnalisado').value;
    let linhasTextoAnalisado = textoAnalisado.split('\n');

    for (let linha of linhasTextoAnalisado) {
        if (linha.startsWith('Delegado:')) {
            dadosGerais.delegado = linha.replace('Delegado:', '').trim();
        }
        else if (linha.startsWith('Delegacia:')) {
            dadosGerais.delegacia = linha.replace('Delegacia:', '').trim();
        }
        else if (linha.startsWith('Chassi:')) {
            dadosGerais.chassi = linha.replace('Chassi:', '').trim();
        }
        
        else if (linha.startsWith('Natureza do Exame:')) {
            dadosGerais.naturezaDoExame = linha.replace('Natureza do Exame:', '').trim();
        }
        else if (linha.startsWith('Tipo:')) {
            dadosGerais.tipo = linha.replace('Tipo:', '').trim();
        }
        else if (linha.startsWith('Marca:')) {
            dadosGerais.marca = linha.replace('Marca:', '').trim();
        }
        else if (linha.startsWith('Cor:')) {
            dadosGerais.cor = linha.replace('Cor:', '').trim();
        }
        else if (linha.startsWith('Ano de Fabricação:')) {
            dadosGerais.anoFabricacao = linha.replace('Ano de Fabricação:', '').trim();
        }
        else if (linha.startsWith('Placa:')) {
            dadosGerais.placa = linha.replace('Placa:', '').trim();
        }
        else if (linha.startsWith('Protocolo:')) {
            dadosGerais.protocolo = linha.replace('Protocolo:', '').trim();
        }
        else if (linha.startsWith('BO:')) {
            dadosGerais.bo = linha.replace('BO:', '').trim();
        }
        else if (linha.startsWith('REP:')) {
            dadosGerais.REP = linha.replace('REP:', '').trim();
        }
    }


    ///entender pq delegado so aparece com texto
    var currentDate = new Date();
    var day = ("0" + currentDate.getDate()).slice(-2);
    var month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    var mesExtenso = ["janeiro", "fevereiro", "março", "abril", "maio","junho","julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    
    let data =	
    '\tEm '+ day + " de "+mesExtenso[currentDate.getMonth()]+" de "+currentDate.getFullYear() + (dadosGerais.Equipe!=""? ', na '+dadosGerais.Equipe: "") + (dadosGerais.Nucleo!=""? ', no '+dadosGerais.Nucleo: "")+', do Instituto de Criminalística, da Superintendência da Polícia Técnico-Científica, da Secretaria de Segurança Pública do Estado de São Paulo, em conformidade com o disposto no Decreto-Lei n.º 3.689/41, o Diretor deste instituto '+ dadosGerais.Diretor+' designou o Perito Criminal '+(dadosGerais.Perito!=""? dadosGerais.Perito: "signatário") +' para proceder a este exame pericial, em atendimento à requisição da autoridade de polícia judiciária'+ (dadosGerais.delegacia!=""? " da "+dadosGerais.delegacia : "") + (dadosGerais.delegado!=""? ', Dr(a). '+dadosGerais.delegado+'.' : ".");
    
    let aL = [data]; // array de laudo - armazena os textos e o formata {1 - preambulo}
    let fT = [0];

    aL.push("DISPOSIÇÕES PRELIMINARES"); fT.push(1);
    
    data = "\t Exame pericial em objeto(s)" 
    +(dadosGerais.protocolo==""?"": ", referente ao protocolo IC Americana: " +dadosGerais.protocolo)
    +(dadosGerais.REP==""?"": ", que deu origem ao laudo " +dadosGerais.REP+"/"+data.getFullYear())
    +(dadosGerais.bo==""?"": ", relacionado(s) ao Boletim de Ocorrência "+dadosGerais.bo)
    +(dadosGerais.delegacia!=""? ", cuja delegacia de origem é "+dadosGerais.delegacia : "")
    +", tendo como natureza/objetivo do exame: "+(dadosGerais.naturezaDoExame==""? '"Descrição e fotografação"': +dadosGerais.naturezaDoExame) 
    + ".";

    aL.push(data); fT.push(0);

    aL.push("DO(s) OBJETOS(S)"); fT.push(1);

    data = "\tConforme ilustrado pelas figuras abaixo, tratava-se de veículo do tipo "+ (dadosGerais.tipo==""? "XXXXXXX": dadosGerais.tipo)+ ", marca/modelo " + (dadosGerais.marca==""? "XXXXXXX": dadosGerais.marca) + ", na cor " + (dadosGerais.cor==""? "XXXXXXX": dadosGerais.cor) + ", ano de fabricação " +(dadosGerais.anoFabricacao==""? "XXXX": dadosGerais.anoFabricacao) + " e placa(s) " + (dadosGerais.placa==""? "XXX0000": dadosGerais.placa) + ".";

//INCLUIR OS LACRES
    
    aL.push(data); fT.push(0);

    data = '\tQuando dos exames, o referido veículo '+(document.getElementById('danosVeic').value==""? 'não apresentava danos de aspecto recente.': "apresentava os seguintes danos de aspecto recente:");
    aL.push(data); fT.push(0);
    

    if (document.getElementById('danosVeic').value!=""){
        let linhasDanosVeic = document.getElementById('danosVeic').value.split('\n');
        for (let linhaDanoVeic of linhasDanosVeic) {
            if (linhaDanoVeic!=""){
                aL.push(linhaDanoVeic);
                fT.push(3);
            }
        }
    }

    if (document.getElementById('testesVeic').value==""){
        aL.push('\tOs seus sistemas de segurança para o tráfego (freio, direção e elétrico) se encontravam articulados e atuantes, quando dos exames. Pneumáticos em estado regular.');
        fT.push(0);
    }else{
        aL.push('\t' + document.getElementById('testesVeic').value);
        fT.push(0);
    }

    aL.push("DO LEVANTAMENTO FOTOGRÁFICO"); fT.push(1);


    

    
    
    gerarDocx(aL, fT);

}

//+ Carlos R. L. Rodrigues
//@ http://jsfromhell.com/string/extenso [rev. #3]
String.prototype.extenso = function(c){
    var ex = [
    ["zero", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
    ["dez", "vinte", "trinta", "quarenta", "cinqüenta", "sessenta", "setenta", "oitenta", "noventa"],
    ["cem", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
    ["mil", "milhão", "bilhão", "trilhão", "quadrilhão", "quintilhão", "sextilhão", "setilhão", "octilhão", "nonilhão", "decilhão", "undecilhão", "dodecilhão", "tredecilhão", "quatrodecilhão", "quindecilhão", "sedecilhão", "septendecilhão", "octencilhão", "nonencilhão"]
];
    var a, n, v, i, n = this.replace(c ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = "real", d = "centavo", sl;
    for(var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []){
        j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
        if(!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
        for(a = -1, l = v.length; ++a < l; t = ""){
            if(!(i = v[a] * 1)) continue;
            i % 100 < 20 && (t += ex[0][i % 100]) ||
            i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
            s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
            ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("ão", "ões") : ex[3][t]) : ""));
        }
        a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
        a && r.push(a + (c ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
    }
    return r.join(e);
}

async function gerarDocx(textoLaudo, formatacao) {

    try {
        let arrParagraf = [];
        for (var i=0; i< textoLaudo.length; i++){
            //default '0':
            var alinhamentoDX = docx.AlignmentType.JUSTIFIED;
            var linhaDX = 250;
            var antesDX = 20 * 72 * 0.01;
            var depoisDX = 20 * 72 * 0.01;
            var tamanhoDX = 24;
            var negritoDX = false;
            var propositoGeral;

            switch(formatacao[i]){
                case 0: // paragrafo
                    propositoGeral = new docx.Paragraph({
                        alignment: alinhamentoDX,
                        spacing:{
                            line: linhaDX,
                            before: antesDX,
                            after: depoisDX
                        },
                        children: [
                            new docx.TextRun({
                                text: textoLaudo[i],
                                font:'Arial',
                                size: tamanhoDX,
                                bold: negritoDX,
                            }),
                        ],
                    });
                break;

                case 1: //titulo
                    alinhamentoDX = docx.AlignmentType.LEFT;
                    linhaDX = 276;
                    antesDX = 20 * 72 * 0.1;
                    depoisDX = 20 * 72 * 0.05;
                    tamanhoDX = 26;
                    negritoDX = true;
                    propositoGeral = new docx.Paragraph({
                        alignment: alinhamentoDX,


                        spacing:{
                            line: linhaDX,
                            before: antesDX,
                            after: depoisDX
                        },
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 1,
                        },
                        children: [
                            new docx.TextRun({
                                text: textoLaudo[i],
                                font:'Arial',
                                size: tamanhoDX,
                                bold: negritoDX,
                            }),
                        ],
                    });
                break;
                case 2: //assinatura
                    alinhamentoDX = docx.AlignmentType.CENTER;
                    linhaDX = 250;
                    antesDX = 20 * 72 * 0.01;
                    depoisDX = 20 * 72 * 0.01;
                    tamanhoDX = 24;
                    negritoDX = false;
                    propositoGeral = new docx.Paragraph({
                        alignment: alinhamentoDX,
                        spacing:{
                            line: linhaDX,
                            before: antesDX,
                            after: depoisDX
                        },
                        children: [
                            new docx.TextRun({
                                text: textoLaudo[i],
                                font:'Arial',
                                size: tamanhoDX,
                                bold: negritoDX,
                            }),
                        ],
                    });
                break;
                case 3:
                propositoGeral = new docx.Paragraph({
                        alignment: alinhamentoDX,
                        spacing:{
                            line: linhaDX,
                            before: antesDX,
                            after: depoisDX
                        },
                        numbering: {
                            reference: "my-unique-bullet-points",
                            level: 1,
                        },
                        children: [
                            new docx.TextRun({
                                text: textoLaudo[i],
                                font:'Arial',
                                size: tamanhoDX,
                                bold: negritoDX,
                            }),
                        ],
                    });
                break;
            }

            arrParagraf.push(propositoGeral);
        
        }

        let legendasMarcadas = [];
        const legendas = document.querySelectorAll('input[type="checkbox"]:checked + label');
        legendas.forEach(legenda => {
            legendasMarcadas.push(legenda.textContent);
        });
        let indices = "0";
        const fotos = document.getElementsByClassName('foto-importada');
        let fotosss = [];

        if (fotos.length > 0) {
            for (let foto of fotos) {
                
                // Converter imagem para base64
                const canvas = document.createElement('canvas');
                canvas.width = foto.width;
                canvas.height = foto.height;
                
                let ctx = canvas.getContext('2d');
              
                ctx.drawImage(foto,0,0);

                const base64 = canvas.toDataURL('image/jpeg').split(',')[1];

                // Adicionar imagem ao documento]
                
                let propFoto = 
                        new docx.Paragraph({
                            spacing:{
                                line: 250,
                                before: 20 * 72 * 0.05,
                                after: 20 * 72 * 0.01,
                            },
                            children: [
                                new docx.ImageRun({
                                    data: Uint8Array.from(atob(base64), c => c.charCodeAt(0)),
                                    transformation: {
                                        width: 454,
                                        height: 340
                                    }
                                })
                            ],
                            alignment: docx.AlignmentType.CENTER
                        });
                let propLegendas = new docx.Paragraph({
                    
                    alignment: docx.AlignmentType.CENTER,

                        spacing:{
                            line: 250,
                            before: 10 * 72 * 0.01,
                            after: 20 * 72 * 0.05,
                        },

                        children: [
                            new docx.TextRun({
                                text: legendasMarcadas[indices],
                                font:'Arial',
                                size: 24,
                                bold: false,
                            }),
                        ],
                    });
                fotosss.push(propFoto);
                fotosss.push(propLegendas);
                indices++;
            }
        }

        // Nova função para calcular o número de páginas. O resultado será no mínimo duas páginas
        let numPaginas = 1;
        
        
        
        let numFotos = Math.round((fotosss.length)/2);
        numPaginas = Math.floor(numFotos/2)+1;
        if (numFotos==1)numPaginas = 2;


        let numPaginasExtenso = ""+numPaginas;
        numPaginasExtenso = numPaginasExtenso.extenso(false);
        numPaginas = ""+numPaginas+" (" + numPaginasExtenso +")" + " página"+(numPaginas==1?"":"s");
        //console.log(numPaginas);
        let dataExt = new Date().getDate() + " de " + new Date().toLocaleString('pt-BR', { month: 'long' }) + " de " + new Date().getFullYear();

        // Criar novo documento
        const doc = new docx.Document({
            numbering: {
                config: [
                    {
                        reference: "my-crazy-numbering",
                        levels: [
                            {
                                level: 0,
                                format: docx.LevelFormat.UPPER_ROMAN,
                                text: "%1",
                                alignment: docx.AlignmentType.START,
                                style: {
                                    paragraph: {
                                        indent: { left: 720, hanging: 2592 },
                                    },
                                },
                            },
                            {
                                level: 1,
                                format: docx.LevelFormat.DECIMAL,
                                text: "%2.",
                                alignment: docx.AlignmentType.START,
                                style: {
                                    paragraph: {
                                        
                                        indent: { left: docx.convertInchesToTwip(1), hanging: docx.convertInchesToTwip(0.68) },
                                    },
                                },
                            },
                            {
                                level: 2,
                                format: docx.LevelFormat.LOWER_LETTER,
                                text: "%3)",
                                alignment: docx.AlignmentType.START,
                                style: {
                                    paragraph: {
                                        indent: { left: docx.convertInchesToTwip(1.5), hanging: docx.convertInchesToTwip(1.18) },
                                    },
                                },
                            },
                            {
                                level: 3,
                                format: docx.LevelFormat.UPPER_LETTER,
                                text: "%4)",
                                alignment: docx.AlignmentType.START,
                                style: {
                                    paragraph: {
                                        indent: { left: 2880, hanging: 2420 },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        reference: "my-unique-bullet-points",
                        levels: [
                            {
                                level: 0,
                                format: docx.LevelFormat.BULLET,
                                text: "\u1F60",
                                alignment: docx.AlignmentType.LEFT,
                                style: {
                                    paragraph: {
                                        indent: { left: docx.convertInchesToTwip(0.5), hanging: docx.convertInchesToTwip(0.25) },
                                    },
                                },
                            },
                            {
                                level: 1,
                                format: docx.LevelFormat.BULLET,
                                text: "\u25CF", //u00A5
                                alignment: docx.AlignmentType.LEFT,
                                style: {
                                    paragraph: {
                                        indent: { left: docx.convertInchesToTwip(1), hanging: docx.convertInchesToTwip(0.25) },
                                    },
                                },
                            },
                            {
                                level: 2,
                                format: docx.LevelFormat.BULLET,
                                text: "\u273F",
                                alignment: docx.AlignmentType.LEFT,
                                style: {
                                    paragraph: {
                                        indent: { left: 2160, hanging: docx.convertInchesToTwip(0.25) },
                                    },
                                },
                            },
                            {
                                level: 3,
                                format: docx.LevelFormat.BULLET,
                                text: "\u267A",
                                alignment: docx.AlignmentType.LEFT,
                                style: {
                                    paragraph: {
                                        indent: { left: 2880, hanging: docx.convertInchesToTwip(0.25) },
                                    },
                                },
                            },
                            {
                                level: 4,
                                format: docx.LevelFormat.BULLET,
                                text: "\u2603",
                                alignment: docx.AlignmentType.LEFT,
                                style: {
                                    paragraph: {
                                        indent: { left: 3600, hanging: docx.convertInchesToTwip(0.25) },
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 2000,
                        },
                    },
                },
                headers: {
                    default: new docx.Header({
                        children: [
                            new docx.Paragraph({
                                font:'Arial',
                                children: [
                                    new docx.ImageRun({
                                        //data: await fetch('cabecalho.png').then(r => r.arrayBuffer()),
                                        transformation: {
                                            width: 628,
                                            height: 78
                                        },
                                    })
                                    // new docx.TextRun({
                                    //     font:'Arial',
                                    //     alignment: docx.AlignmentType.LEFT,
                                    //     text: 'BO: '
                                    // }),          
                                    // new docx.TextRun({
                                    //     font:'Arial',
                                    //     alignment: docx.AlignmentType.RIGHT,
                                    //     text: 'REP '
                                    // })   
                          
                                ],
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new docx.Footer({
                        children: [
                            new docx.Paragraph({
                                alignment: docx.AlignmentType.RIGHT,
                                font:'Arial',
                                size: 18,
                                children: [
                                    new docx.TextRun({
                                        font:'Arial',
                                        size: 18,
                                        alignment: docx.AlignmentType.RIGHT,
                                        text: 'Superintendência da Polícia Técnico-Científica. Proibida divulgação ou cópia sem autorização. Página '
                                    }),
                                    new docx.TextRun({
                                        children: [docx.PageNumber.CURRENT]
                                    }),
                                    new docx.TextRun(" de "),
                                    
                                    new docx.TextRun({
                                        children: [docx.PageNumber.TOTAL_PAGES]
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                },

                children: 
                
                    arrParagraf.concat(fotosss).concat(
                        [new docx.Paragraph({
                            alignment: docx.AlignmentType.JUSTIFIED,
                            spacing:{
                                line: 250,
                                before: 20 * 72 * 0.01,
                                after: 20 * 72 * 0.01,
                            },
                            children: [
                                new docx.TextRun({
                                    text: '\tEra o que havia a relatar.',
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                            ],
                        }),
                        new docx.Paragraph({
                            alignment: docx.AlignmentType.JUSTIFIED,
                            spacing:{
                                line: 250,
                                before: 20 * 72 * 0.1,
                                after: 20 * 72 * 0.01,
                            },
                            children: [
                                new docx.TextRun({
                                    text: '\tEste laudo foi elaborado em ',
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                                new docx.TextRun({
                                    text: numPaginas+' com cópia digital arquivada no Sistema Gestor de Documentos e Laudos da Superintendência da Polícia Técnico-Científica do Estado de São Paulo (Portaria SPTC 145/2012).',
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                                
                            ],
                        }),
                        new docx.Paragraph({
                            alignment: docx.AlignmentType.CENTER,
                            spacing:{
                                line: 250,
                                before: 20 * 72 * 0.1,
                                after: 20 * 72 * 0.01,
                            },
                            children: [
                                new docx.TextRun({
                                    text: 'Americana, ',
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                                new docx.TextRun({
                                    text: dataExt,
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                                
                            ],
                        }),
                        new docx.Paragraph({
                            alignment: docx.AlignmentType.CENTER,
                            spacing:{
                                line: 250,
                                before: 20 * 72 * 0.01,
                                after: 20 * 72 * 0.01,
                            },
                            children: [
                                new docx.TextRun({
                                    text: '-assinado digitalmente-',
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                            ],
                        }),
                        new docx.Paragraph({
                            alignment: docx.AlignmentType.CENTER,
                            spacing:{
                                line: 250,
                                before: 20 * 72 * 0.01,
                                after: 20 * 72 * 0.01,
                            },
                            children: [
                                new docx.TextRun({
                                    text: dadosGerais.Perito,
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                            ],
                        }),
                        new docx.Paragraph({
                            alignment: docx.AlignmentType.CENTER,
                            spacing:{
                                line: 250,
                                before: 20 * 72 * 0.01,
                                after: 20 * 72 * 0.01,
                            },
                            children: [
                                new docx.TextRun({
                                    text: 'Perito Criminal',
                                    font:'Arial',
                                    size: 24,
                                    bold: false,
                                }),
                            ],
                        })
                        ]
                    )

                
            }]
        });
        // Adicionar fotos ao documento
        
        let nomeArq = "laudo";
        const data = new Date();
        const hora = data.getHours() + "_" + data.getMinutes() + "_" + data.getSeconds();
        const dia = data.getDate() + "_" + (data.getMonth() + 1) + "_" + data.getFullYear();
        nomeArq = `_${dia}_${hora}`;

        if (dadosGerais.protocolo) {
            nomeArq = `prot_${dadosGerais.protocolo}`;
        }
        if (dadosGerais.REP) {
            nomeArq = `${dadosGerais.REP}_${data.getFullYear()}`;
        }
        // Gerar e baixar o arquivo
        const blob = await docx.Packer.toBlob(doc);
        saveAs(blob, nomeArq);

    } catch (erro) {
        console.error('Erro ao gerar documento:', erro);
        alert('Erro ao gerar documento Word');
    }
    document.getElementById('gerarDocumentoWord').disabled = false;
}