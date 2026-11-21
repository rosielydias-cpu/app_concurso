/**
 * Reels de Concurso — banco de dados no Google Planilhas.
 *
 * Como instalar (uma vez):
 *  1. Na planilha: Extensões > Apps Script. Apague o que houver e cole este arquivo inteiro. Salve.
 *  2. Volte à planilha e recarregue a página. Aparece o menu "Reels de Concurso".
 *     Clique em Reels de Concurso > Configurar planilha. Autorize quando o Google pedir.
 *     O token aparece numa janela (e fica guardado na aba Config).
 *  3. No Apps Script: Implantar > Nova implantação > tipo "App da Web".
 *     Executar como: Eu. Quem pode acessar: Qualquer pessoa. Implantar e copiar a URL (termina em /exec).
 *  4. No app: Ajustes > Banco de dados no Google Planilhas. Cole a URL e o token e toque em Salvar e testar.
 *     Depois toque em "Enviar conteúdo do app para a planilha" para preencher as abas.
 *
 * Abas usadas (a primeira linha de cada uma é o cabeçalho):
 *  Materias:  id | nome | peso | ordem | grupo
 *  Topicos:   id | materia | nome
 *  Cards:     id | materia | topico | frente | resposta | aprofunde | pegadinha
 *  Questoes:  id | materia | topico | tipo | enunciado | alternativas | gabarito | explicacao | fonte
 *             tipo: multipla | certo_errado | lacuna | ordenar
 *             alternativas: separadas por " | " (em "ordenar", as etapas na ordem CORRETA)
 *             gabarito: letra (A, B, C...) em multipla e lacuna; C ou E em certo_errado; vazio em ordenar
 *  Progresso: chave | atualizado_em | parte1 | parte2 | ...   (preenchida pelo app; não edite)
 *  Config:    token (gerado em Configurar planilha)
 *
 * Linhas sem "id" são ignoradas. Para desativar um card ou pergunta, basta apagar o id da linha.
 */

var ABAS = {
  Materias: ['id', 'nome', 'peso', 'ordem', 'grupo'],
  Topicos: ['id', 'materia', 'nome'],
  Cards: ['id', 'materia', 'topico', 'frente', 'resposta', 'aprofunde', 'pegadinha'],
  Questoes: ['id', 'materia', 'topico', 'tipo', 'enunciado', 'alternativas', 'gabarito', 'explicacao', 'fonte']
};
var ABA_PROGRESSO = 'Progresso';
var ABA_CONFIG = 'Config';
var TAMANHO_PARTE = 45000; // uma célula aceita até 50.000 caracteres

/* ---------- Menu e configuração ---------- */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Reels de Concurso')
    .addItem('Configurar planilha', 'configurarPlanilha')
    .addItem('Mostrar token', 'mostrarToken')
    .addItem('Gerar novo token', 'gerarNovoToken')
    .addToUi();
}

function configurarPlanilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(ABAS).forEach(function (nome) { garantirAba_(ss, nome, ABAS[nome]); });
  garantirAba_(ss, ABA_PROGRESSO, ['chave', 'atualizado_em', 'parte1']);
  var token = obterToken_() || gerarToken_();
  avisar_('Planilha configurada.\n\nToken do app (copie e cole em Ajustes > Banco de dados):\n\n' + token +
    '\n\nAgora publique: Extensões > Apps Script > Implantar > Nova implantação > App da Web ' +
    '(Executar como: Eu; Quem pode acessar: Qualquer pessoa).');
}

function mostrarToken() {
  avisar_('Token do app:\n\n' + (obterToken_() || 'ainda não gerado: use Configurar planilha.'));
}

function gerarNovoToken() {
  var token = gerarToken_();
  avisar_('Novo token gerado. Atualize-o no app (Ajustes > Banco de dados):\n\n' + token);
}

/* ---------- Web App ---------- */

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'ping') {
      verificarToken_(p.token);
      return json_({ ok: true, contagem: contarConteudo_() });
    }
    if (p.action === 'content') return json_(lerConteudo_());
    if (p.action === 'progress') {
      verificarToken_(p.token);
      return json_(lerProgresso_(p.chave || 'principal'));
    }
    return json_({ error: 'Ação desconhecida.' });
  } catch (err) {
    return json_({ error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    verificarToken_(body.token);
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (body.action === 'saveProgress') {
        salvarProgresso_(body.chave || 'principal', String(body.data || ''), Number(body.updatedAt) || Date.now());
        return json_({ ok: true });
      }
      if (body.action === 'seedContent') {
        return json_(escreverConteudo_(body.content || {}, !!body.overwrite));
      }
      return json_({ error: 'Ação desconhecida.' });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ error: String(err && err.message ? err.message : err) });
  }
}

/* ---------- Conteúdo ---------- */

function lerConteudo_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = {};
  Object.keys(ABAS).forEach(function (nome) { out[nome.toLowerCase()] = lerAba_(ss, nome); });
  return out;
}

function contarConteudo_() {
  var c = lerConteudo_();
  return { materias: c.materias.length, topicos: c.topicos.length, cards: c.cards.length, questoes: c.questoes.length };
}

function escreverConteudo_(content, sobrescrever) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var atual = contarConteudo_();
  if (!sobrescrever && (atual.cards > 0 || atual.questoes > 0)) {
    return { error: 'A planilha já tem conteúdo.', code: 'NOT_EMPTY', contagem: atual };
  }
  Object.keys(ABAS).forEach(function (nome) {
    var cab = ABAS[nome];
    var linhas = (content[nome.toLowerCase()] || []).map(function (obj) {
      return cab.map(function (col) { return obj[col] == null ? '' : obj[col]; });
    });
    var aba = garantirAba_(ss, nome, cab);
    if (aba.getLastRow() > 1) aba.getRange(2, 1, aba.getLastRow() - 1, aba.getMaxColumns()).clearContent();
    if (linhas.length) aba.getRange(2, 1, linhas.length, cab.length).setValues(linhas);
  });
  return { ok: true, contagem: contarConteudo_() };
}

/* ---------- Progresso ---------- */

function lerProgresso_(chave) {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_PROGRESSO);
  if (!aba || aba.getLastRow() < 2) return { data: null, updatedAt: 0 };
  var valores = aba.getRange(2, 1, aba.getLastRow() - 1, aba.getLastColumn()).getValues();
  for (var i = 0; i < valores.length; i++) {
    if (String(valores[i][0]) === chave) {
      return { data: valores[i].slice(2).join(''), updatedAt: Number(valores[i][1]) || 0 };
    }
  }
  return { data: null, updatedAt: 0 };
}

function salvarProgresso_(chave, dados, atualizadoEm) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = garantirAba_(ss, ABA_PROGRESSO, ['chave', 'atualizado_em', 'parte1']);
  var partes = [];
  for (var i = 0; i < dados.length; i += TAMANHO_PARTE) partes.push(dados.slice(i, i + TAMANHO_PARTE));
  if (!partes.length) partes.push('');
  var linha = [chave, atualizadoEm].concat(partes);
  if (aba.getMaxColumns() < linha.length) aba.insertColumnsAfter(aba.getMaxColumns(), linha.length - aba.getMaxColumns());
  var n = aba.getLastRow();
  var idx = -1;
  if (n >= 2) {
    var chaves = aba.getRange(2, 1, n - 1, 1).getValues();
    for (var j = 0; j < chaves.length; j++) if (String(chaves[j][0]) === chave) { idx = j + 2; break; }
  }
  if (idx < 0) idx = n + 1;
  aba.getRange(idx, 1, 1, aba.getMaxColumns()).clearContent();
  aba.getRange(idx, 1, 1, linha.length).setValues([linha]);
}

/* ---------- Utilitários ---------- */

function lerAba_(ss, nome) {
  var aba = ss.getSheetByName(nome);
  if (!aba || aba.getLastRow() < 2) return [];
  var valores = aba.getRange(1, 1, aba.getLastRow(), aba.getLastColumn()).getValues();
  var cab = valores[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var out = [];
  for (var i = 1; i < valores.length; i++) {
    var obj = {};
    cab.forEach(function (h, k) { if (h) obj[h] = valores[i][k] === '' ? '' : String(valores[i][k]); });
    if (obj.id && String(obj.id).trim()) out.push(obj);
  }
  return out;
}

function garantirAba_(ss, nome, cabecalho) {
  var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
  var atual = aba.getLastColumn() ? aba.getRange(1, 1, 1, cabecalho.length).getValues()[0] : [];
  var vazio = !atual.length || atual.every(function (v) { return v === ''; });
  if (vazio) {
    aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight('bold');
    aba.setFrozenRows(1);
  }
  return aba;
}

function obterToken_() {
  return PropertiesService.getScriptProperties().getProperty('TOKEN');
}

function gerarToken_() {
  var token = Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('TOKEN', token);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABA_CONFIG) || ss.insertSheet(ABA_CONFIG);
  aba.getRange(1, 1, 1, 2).setValues([['token', token]]);
  return token;
}

function verificarToken_(token) {
  var certo = obterToken_();
  if (!certo) throw new Error('Planilha não configurada: use o menu Reels de Concurso > Configurar planilha.');
  if (String(token || '') !== certo) throw new Error('Token inválido.');
}

function avisar_(msg) {
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
