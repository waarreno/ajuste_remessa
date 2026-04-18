/**
 * lerCsv.js
 * Lê o arquivo CSV, filtra as linhas relevantes e agrupa por prestador.
 *
 * Filtros aplicados:
 *  - Coluna 7  : contém "Cooperado"
 *  - Coluna 9  : é "Consulta"
 *  - Coluna 15 : é "Analisada OK" ou "Analisada c/ glosa"
 *
 * Colunas utilizadas (índice base-0):
 *  col[0]  → Referência
 *  col[1]  → Remessa
 *  col[4]  → Código do Prestador
 *  col[6]  → Tipo (filtro "Cooperado")
 *  col[8]  → Tipo Atendimento (filtro "Consulta")
 *  col[14] → Status (filtro "Analisada OK" / "Analisada c/ glosa")
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const STATUS_VALIDOS = ['Analisada OK', 'Analisada c/ glosa'];

/**
 * Remove as aspas envolventes de um valor CSV, se presentes.
 * @param {string} val
 * @returns {string}
 */
function limpar(val) {
  if (!val) return '';
  return val.trim().replace(/^"|"$/g, '');
}

/**
 * Lê e filtra o CSV, retornando um Map agrupado por código de prestador.
 *
 * Estrutura retornada:
 * Map {
 *   'codigoPrestador' => {
 *     referencia: string,
 *     codigoPrestador: string,
 *     remessas: Set { 'remessa1', 'remessa2', ... }
 *   },
 *   ...
 * }
 *
 * @param {string} caminhoArquivo  Caminho absoluto ou relativo ao CSV.
 * @returns {Map<string, object>}
 */
function lerCsv(caminhoArquivo) {
  const arquivoAbsoluto = path.resolve(caminhoArquivo);

  if (!fs.existsSync(arquivoAbsoluto)) {
    throw new Error(`Arquivo CSV não encontrado: ${arquivoAbsoluto}`);
  }

  const conteudo = fs.readFileSync(arquivoAbsoluto, 'utf8');
  const linhas   = conteudo.split(/\r?\n/).filter(l => l.trim() !== '');

  // Ignora a primeira linha se for cabeçalho (detecta pela ausência de dígitos na col[1])
  const inicio = /^\d/.test(limpar(linhas[0].split(';')[1])) ? 0 : 1;

  const grupos = new Map(); // chave: codigoPrestador

  for (let i = inicio; i < linhas.length; i++) {
    const cols = linhas[i].split(';');

    // Garante que a linha tem colunas suficientes
    if (cols.length < 15) continue;

    const referencia       = limpar(cols[0]);
    const remessa          = limpar(cols[1]);
    const codigoPrestador  = limpar(cols[4]);
    const tipo             = limpar(cols[6]);
    const tipoAtendimento  = limpar(cols[8]);
    const status           = limpar(cols[14]);

    // ── Filtros ──────────────────────────────────────────────
    if (!tipo.includes('Cooperado'))           continue;
    if (tipoAtendimento !== 'Consulta')        continue;
    if (!STATUS_VALIDOS.includes(status))      continue;
    // ─────────────────────────────────────────────────────────

    if (!grupos.has(codigoPrestador)) {
      grupos.set(codigoPrestador, {
        referencia,
        codigoPrestador,
        remessas: new Set(),
      });
    }

    grupos.get(codigoPrestador).remessas.add(remessa);
  }

  return grupos;
}

// ── Execução direta para teste ───────────────────────────────
if (require.main === module) {
  require('dotenv').config();
  const csvPath = process.env.CSV_PATH || './dados.csv';

  try {
    const grupos = lerCsv(csvPath);
    console.log(`\n✅ Linhas filtradas — ${grupos.size} prestador(es) encontrado(s):\n`);

    for (const [cod, dados] of grupos) {
      console.log(`  Prestador : ${cod}`);
      console.log(`  Referência: ${dados.referencia}`);
      console.log(`  Remessas  : ${[...dados.remessas].join(', ')}`);
      console.log('  ' + '─'.repeat(50));
    }
  } catch (err) {
    console.error('❌ Erro ao ler CSV:', err.message);
    process.exit(1);
  }
}

module.exports = { lerCsv };