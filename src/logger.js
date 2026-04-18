'use strict';

var fs   = require('fs');
var path = require('path');

var CABECALHO = '"timestamp";"referencia";"codigoPrestador";"remessa";"fechamento";"status"\n';

function Logger(caminhoLog) {
  this.caminhoLog = path.resolve(caminhoLog);
  if (!fs.existsSync(this.caminhoLog)) {
    fs.writeFileSync(this.caminhoLog, CABECALHO, 'utf8');
  }
}

Logger.prototype.registrar = function(params) {
  var timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  var linha = [
    timestamp,
    params.referencia,
    params.codigoPrestador,
    params.remessa,
    params.fechamento,
    params.status,
  ].map(function(v) { return '"' + v + '"'; }).join(';') + '\n';

  fs.appendFileSync(this.caminhoLog, linha, 'utf8');
};

Logger.prototype.sucesso = function(params) { this.registrar(Object.assign({}, params, { status: 'SUCESSO' })); };
Logger.prototype.erro    = function(params) { this.registrar(Object.assign({}, params, { status: 'ERRO' })); };

module.exports = { Logger: Logger };