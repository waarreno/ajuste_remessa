'use strict';

require('dotenv').config();

var path                  = require('path');
var readline              = require('readline');
var lerCsvModule          = require('./lerCsv');
var loggerModule          = require('./logger');
var automacaoModule       = require('./automacao');

var lerCsv            = lerCsvModule.lerCsv;
var Logger            = loggerModule.Logger;
var executarAutomacao = automacaoModule.executarAutomacao;

var CSV_PATH = process.env.CSV_PATH || './dados.csv';
var LOG_PATH = process.env.LOG_PATH || ('./log_' + dataHoje() + '.csv');

function dataHoje() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function confirmar(pergunta) {
  return new Promise(function(resolve) {
    var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(pergunta, function(resposta) {
      rl.close();
      resolve(resposta.trim().toLowerCase() === 's');
    });
  });
}

(async function() {
  console.log('\n=======================================================');
  console.log('   Ajuste Remessa');
  console.log('=======================================================\n');

  var grupos;
  try {
    grupos = lerCsv(CSV_PATH);
  } catch (err) {
    console.error('ERRO ao ler o CSV: ' + err.message);
    process.exit(1);
  }

  if (grupos.size === 0) {
    console.warn('Nenhuma linha passou pelos filtros. Verifique o arquivo CSV.');
    process.exit(0);
  }

  var totalRemessas = 0;
  for (var g of grupos.values()) totalRemessas += g.remessas.size;

  console.log('CSV lido com sucesso.');
  console.log('   Prestadores a processar : ' + grupos.size);
  console.log('   Total de remessas        : ' + totalRemessas);
  console.log('   Log de saida             : ' + path.resolve(LOG_PATH) + '\n');

  console.log('Resumo dos grupos:');
  console.log('----------------------------------------------------------------');
  for (var entry of grupos) {
    var cod   = entry[0];
    var dados = entry[1];
    console.log('  Prestador ' + cod + ' | Ref: ' + dados.referencia + ' | Remessas: ' + Array.from(dados.remessas).join(', '));
  }
  console.log('----------------------------------------------------------------\n');

  var prosseguir = await confirmar('Iniciar automacao? (s/n): ');
  if (!prosseguir) {
    console.log('\nOperacao cancelada pelo usuario.\n');
    process.exit(0);
  }

  var logger = new Logger(LOG_PATH);

  try {
    await executarAutomacao(grupos, logger);
    console.log('\nLog gravado em: ' + path.resolve(LOG_PATH) + '\n');
  } catch (err) {
    console.error('\nA automacao foi encerrada com erro: ' + err.message);
    console.log('Log parcial gravado em: ' + path.resolve(LOG_PATH) + '\n');
    process.exit(1);
  }
})();