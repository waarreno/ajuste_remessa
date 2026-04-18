# Ajuste de Remessa — Automacao TopSaude

Automacao de ajuste de remessa de consultas de medicos cooperados no sistema **TopSaude**.

O programa le um arquivo CSV exportado do sistema, filtra as remessas de consultas de cooperados com status valido e executa automaticamente os fechamentos no navegador, registrando o resultado em um log CSV.

---

## Pre-requisitos

- Windows 10 ou superior
- Conexao com a internet (apenas na primeira instalacao)
- Node.js v22+ instalado **ou** deixar o `instalar.bat` baixar uma versao portatil

---

## Instalacao

Execute o arquivo `instalar.bat` com duplo clique. Ele ira:

1. Baixar o Node.js v22 portatil (caso o Node nao esteja disponivel no sistema)
2. Instalar as dependencias do projeto (`npm install`)
3. Baixar o navegador Chromium do Playwright (~150 MB)

---

## Configuracao

Crie um arquivo `.env` na raiz do projeto com as seguintes variaveis:

```env
TS_URL=https://endereco-do-topsaude
TS_USUARIO=seu_usuario
TS_SENHA=sua_senha
CSV_PATH=./dados.csv
```

| Variavel    | Descricao                                           |
|-------------|-----------------------------------------------------|
| `TS_URL`    | URL de acesso ao sistema TopSaude                   |
| `TS_USUARIO`| Usuario de login                                    |
| `TS_SENHA`  | Senha de login                                      |
| `CSV_PATH`  | Caminho para o arquivo CSV (padrao: `./dados.csv`)  |

---

## Formato do CSV

O arquivo CSV deve ser separado por **ponto e virgula** (`;`) e conter ao menos 15 colunas. As colunas utilizadas sao:

| Indice | Campo              | Descricao                                    |
|--------|--------------------|----------------------------------------------|
| 0      | Referencia         | Periodo de competencia (ex: `012025`)        |
| 1      | Remessa            | Numero da remessa                            |
| 4      | Codigo Prestador   | Codigo do medico/prestador                   |
| 6      | Tipo               | Deve conter `"Cooperado"` para ser incluido  |
| 8      | Tipo Atendimento   | Deve ser `"Consulta"` para ser incluido      |
| 14     | Status             | `"Analisada OK"` ou `"Analisada c/ glosa"`   |

A primeira linha e tratada como cabecalho e ignorada automaticamente.

---

## Uso

### Executar a automacao

```
executar.bat
```

O programa ira:
1. Ler e filtrar o CSV
2. Exibir um resumo dos prestadores e remessas encontrados
3. Solicitar confirmacao antes de iniciar
4. Abrir o navegador e executar os fechamentos automaticamente
5. Gerar um log CSV com o resultado de cada operacao

### Testar a leitura do CSV (sem abrir o navegador)

```
lerCsv.bat
```

Util para validar o arquivo CSV antes de executar a automacao completa.

### Limpar instalacao

```
limpar.bat
```

Remove `node_portavel\`, `node_modules\`, `package-lock.json` e os arquivos de log (`log_*.csv`).

---

## Log de saida

Ao final de cada execucao e gerado um arquivo `log_AAAAMMDD.csv` na raiz do projeto com o seguinte formato:

```
"timestamp";"referencia";"codigoPrestador";"remessa";"fechamento";"status"
"2026-04-18 10:23:45";"012025";"12345";"9876";"1";"SUCESSO"
"2026-04-18 10:23:50";"012025";"12345";"9876";"2";"ERRO"
```

---

## Estrutura do projeto

```
ajuste_remessa/
├── src/
│   ├── index.js        # Ponto de entrada: leitura do CSV, confirmacao e orquestração
│   ├── automacao.js    # Logica de automacao com Playwright (login, navegacao, fechamentos)
│   ├── lerCsv.js       # Leitura, filtragem e agrupamento do CSV
│   └── logger.js       # Gravacao do log de resultados em CSV
├── dados.csv           # Arquivo de entrada (nao versionado)
├── executar.bat        # Inicia a automacao
├── instalar.bat        # Instala Node.js portatil e dependencias
├── lerCsv.bat          # Testa a leitura do CSV
├── limpar.bat          # Remove instalacao e logs
├── package.json
└── .env                # Credenciais (nao versionado)
```

---

## Dependencias

| Pacote       | Versao  | Finalidade                          |
|--------------|---------|-------------------------------------|
| `playwright` | ^1.59.1 | Automacao de navegador (Chromium)   |
| `dotenv`     | ^16.4.5 | Leitura de variaveis do arquivo .env|

---

## Licenca

Proprietario — uso interno. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

© 2026 Warreno Hendrick Costa Lima Guimaraes
