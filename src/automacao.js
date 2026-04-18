'use strict';

const { chromium } = require('playwright');

const TIMEOUT_NAVEGACAO = 60000;
const TIMEOUT_ELEMENTO  = 15000;
const DELAY_ENTRE_ACOES =   800;

var SELETOR_AJUSTE_REMESSA = '#dropdown-lvlCTM12_2 > div > ul > li:nth-child(1) > a';

function aguardar(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function fazerLogin(page, credenciais) {
  console.log('  -> Acessando o sistema...');
  await page.goto(credenciais.url, { waitUntil: 'networkidle', timeout: TIMEOUT_NAVEGACAO });

  console.log('  -> Preenchendo credenciais...');
  await page.getByRole('textbox', { name: 'Usu\u00e1rio' }).fill(credenciais.usuario);
  await page.getByRole('textbox', { name: 'Senha' }).fill(credenciais.senha);
  await page.getByRole('button',  { name: 'Entrar' }).click();

  await page.waitForURL(/AreaLogada/, { timeout: TIMEOUT_NAVEGACAO });
  console.log('  OK Login realizado com sucesso.');
}

async function navegarParaAjusteRemessa(page) {
  console.log('  -> Navegando para Ajuste de Remessa...');

  await page.getByRole('link', { name: ' Contas M\u00e9dicas' }).click();
  await aguardar(DELAY_ENTRE_ACOES);

  await page.getByRole('link', { name: ' Processamento Remessas' }).click();
  await aguardar(DELAY_ENTRE_ACOES);

  await page.locator(SELETOR_AJUSTE_REMESSA).waitFor({ state: 'visible', timeout: TIMEOUT_NAVEGACAO });
  await page.locator(SELETOR_AJUSTE_REMESSA).click();

  await page.locator('#MES_ANO_REF').waitFor({ state: 'visible', timeout: TIMEOUT_NAVEGACAO });
  console.log('  OK Tela de Ajuste de Remessa carregada.');
}

async function recarregarAjusteRemessa(page) {
  console.log('  -> Recarregando Ajuste de Remessa para proximo prestador...');
  await page.locator(SELETOR_AJUSTE_REMESSA).waitFor({ state: 'visible', timeout: TIMEOUT_NAVEGACAO });
  await page.locator(SELETOR_AJUSTE_REMESSA).click();
  await page.locator('#MES_ANO_REF').waitFor({ state: 'visible', timeout: TIMEOUT_NAVEGACAO });
  console.log('  OK Tela recarregada.');
}

async function selecionarReferencia(page, referencia) {
  console.log('  -> Selecionando referencia: ' + referencia);
  await page.locator('#MES_ANO_REF').selectOption(referencia);
  await aguardar(DELAY_ENTRE_ACOES);
}

async function buscarPrestador(page, codigoPrestador) {
  console.log('  -> Buscando prestador: ' + codigoPrestador);

  var campo = page.locator('#COD_PRESTADOR');
  await campo.waitFor({ state: 'visible', timeout: TIMEOUT_ELEMENTO });
  await campo.click();
  await campo.fill(codigoPrestador);

  await page.locator('.btn.btn-default.btBuscaPrestador').click();
  await aguardar(DELAY_ENTRE_ACOES * 2);
}

async function executarFechamentosRemessa(page, contexto, logger) {
  var referencia      = contexto.referencia;
  var codigoPrestador = contexto.codigoPrestador;
  var remessa         = contexto.remessa;
  var todosSucesso    = true;

  for (var tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      console.log('      -> Fechamento ' + tentativa + '/3 da remessa ' + remessa + '...');

      await page.getByRole('gridcell', { name: remessa }).click();
      await aguardar(DELAY_ENTRE_ACOES);

      await page.getByTitle('Realizar fechamento').click();
      await aguardar(DELAY_ENTRE_ACOES);

      console.log('         SUCESSO');
      logger.sucesso({
        referencia:      referencia,
        codigoPrestador: codigoPrestador,
        remessa:         remessa,
        fechamento:      tentativa,
      });

    } catch (err) {
      console.error('         ERRO: ' + err.message);
      logger.erro({
        referencia:      referencia,
        codigoPrestador: codigoPrestador,
        remessa:         remessa,
        fechamento:      tentativa,
      });
      todosSucesso = false;
    }
  }

  return todosSucesso;
}

async function executarAutomacao(grupos, logger) {
  var URL     = process.env.TS_URL;
  var USUARIO = process.env.TS_USUARIO;
  var SENHA   = process.env.TS_SENHA;

  if (!URL || !USUARIO || !SENHA) {
    throw new Error('Variaveis TS_URL, TS_USUARIO e TS_SENHA sao obrigatorias no .env');
  }

  var primeiroGrupo = grupos.values().next().value;
  var referencia    = primeiroGrupo.referencia;

  console.log('\nIniciando navegador...');
  var browser = await chromium.launch({ headless: false, slowMo: 100 });
  var context = await browser.newContext();
  var page    = await context.newPage();

  try {
    console.log('\n[ETAPA 1] Login');
    await fazerLogin(page, { url: URL, usuario: USUARIO, senha: SENHA });

    console.log('\n[ETAPA 2] Navegacao');
    await navegarParaAjusteRemessa(page);

    console.log('\n[ETAPA 3] Referencia');
    await selecionarReferencia(page, referencia);

    var numPrestador     = 0;
    var totalPrestadores = grupos.size;
    var prestadoresArr   = Array.from(grupos);

    for (var p = 0; p < prestadoresArr.length; p++) {
      var codigoPrestador = prestadoresArr[p][0];
      var dados           = prestadoresArr[p][1];
      var ehUltimo        = (p === prestadoresArr.length - 1);
      numPrestador++;

      var remessasArr = Array.from(dados.remessas);
      console.log('\n[PRESTADOR ' + numPrestador + '/' + totalPrestadores + '] ' + codigoPrestador + ' - ' + remessasArr.length + ' remessa(s)');

      await buscarPrestador(page, codigoPrestador);

      for (var r = 0; r < remessasArr.length; r++) {
        console.log('\n    [REMESSA] ' + remessasArr[r]);
        await executarFechamentosRemessa(page, {
          referencia:      referencia,
          codigoPrestador: codigoPrestador,
          remessa:         remessasArr[r],
        }, logger);
        await aguardar(DELAY_ENTRE_ACOES);
      }

      if (!ehUltimo) {
        await recarregarAjusteRemessa(page);
        await selecionarReferencia(page, referencia);
      }
    }

    console.log('\nAutomacao concluida com sucesso.');

  } catch (err) {
    console.error('\nErro critico na automacao: ' + err.message);
    logger.erro({
      referencia:      referencia || '',
      codigoPrestador: 'N/A',
      remessa:         'N/A',
      fechamento:      0,
    });
    throw err;

  } finally {
    await aguardar(2000);
    await browser.close();
    console.log('Navegador encerrado.');
  }
}

module.exports = {
  executarAutomacao:        executarAutomacao,
  fazerLogin:               fazerLogin,
  navegarParaAjusteRemessa: navegarParaAjusteRemessa,
};