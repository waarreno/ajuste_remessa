@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

set "ROOT=%~dp0"
set "NODE_DIR=%ROOT%node_portavel"

echo =================================================
echo   Ajuste Remessa
echo   v1.0.0
echo   ^(c^) 2026 Warreno Hendrick Costa Lima Guimaraes
echo =================================================
echo.

:: ── 1. Localizar Node.js ─────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% == 0 (
    set "NODE_CMD=node"
) else if exist "%NODE_DIR%\node.exe" (
    set "NODE_CMD=%NODE_DIR%\node.exe"
) else (
    echo [ERRO] Node.js nao encontrado.
    echo        Execute instalar.bat antes de prosseguir.
    echo.
    pause
    exit /b 1
)

:: ── 2. Verificar dependencias instaladas ─────────────────────
if not exist "%ROOT%node_modules\playwright" (
    echo [ERRO] Dependencias nao instaladas.
    echo        Execute instalar.bat antes de prosseguir.
    echo.
    pause
    exit /b 1
)

:: ── 3. Verificar arquivo .env ─────────────────────────────────
if not exist "%ROOT%.env" (
    echo [ERRO] Arquivo .env nao encontrado.
    echo        Crie o arquivo .env com as variaveis:
    echo          TS_URL=
    echo          TS_USUARIO=
    echo          TS_SENHA=
    echo          CSV_PATH=
    echo.
    pause
    exit /b 1
)

:: ── 4. Verificar arquivo CSV ──────────────────────────────────
:: Le CSV_PATH do .env (fallback para dados.csv)
set "CSV_FILE=dados.csv"
for /f "usebackq tokens=1,* delims==" %%a in ("%ROOT%.env") do (
    if /i "%%a"=="CSV_PATH" set "CSV_FILE=%%b"
)
:: Remove espacos e ponto-e-virgula extras
set "CSV_FILE=!CSV_FILE: =!"

:: Resolve caminho relativo a partir da raiz do projeto
set "CSV_ABS=%ROOT%%CSV_FILE:./=%"
if not exist "!CSV_ABS!" (
    echo [AVISO] Arquivo CSV nao encontrado: !CSV_ABS!
    echo         Coloque o arquivo CSV na pasta do projeto e tente novamente.
    echo.
    pause
    exit /b 1
)

:: ── 5. Executar ───────────────────────────────────────────────
echo [OK] Node.js   : !NODE_CMD!
echo [OK] CSV        : !CSV_ABS!
echo.

cd /d "%ROOT%"
"%NODE_CMD%" src\index.js
set "EXIT_CODE=%errorlevel%"

echo.
if %EXIT_CODE% == 0 (
    echo =================================================
    echo   Execucao finalizada com sucesso.
    echo   ^(c^) 2026 Warreno Hendrick Costa Lima Guimaraes
    echo =================================================
) else (
    echo =================================================
    echo   Execucao encerrada com erro ^(codigo %EXIT_CODE%^).
    echo   ^(c^) 2026 Warreno Hendrick Costa Lima Guimaraes
    echo =================================================
)
echo.
pause
endlocal
