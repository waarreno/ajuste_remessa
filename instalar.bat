@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

set "ROOT=%~dp0"
set "NODE_DIR=%ROOT%node_portavel"
set "NODE_VERSION=22.14.0"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-win-x64.zip"
set "NODE_ZIP=%ROOT%node-v%NODE_VERSION%-win-x64.zip"
set "NODE_FOLDER=%ROOT%node-v%NODE_VERSION%-win-x64"

echo =================================================
echo   Instalador - Ajuste Remessa
echo   v1.0.0
echo   ^(c^) 2026 Warreno Hendrick Costa Lima Guimaraes
echo =================================================
echo.

:: ── 1. Remover node_portavel anterior se existir ─────────────
if exist "%NODE_DIR%\" (
    echo [..] Removendo node_portavel anterior...
    rmdir /s /q "%NODE_DIR%"
    echo [OK] node_portavel anterior removido.
)

:: ── 2. Baixar Node.js portavel ───────────────────────────────
echo [..] Baixando Node.js v%NODE_VERSION% portavel...
echo      URL: %NODE_URL%
echo.

curl -L --progress-bar -o "%NODE_ZIP%" "%NODE_URL%"
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao baixar Node.js.
    echo        Verifique sua conexao com a internet e tente novamente.
    pause
    exit /b 1
)
echo.
echo [OK] Download concluido.

:: ── 3. Extrair com tar (nativo Win 10+) ─────────────────────
echo [..] Extraindo Node.js...
pushd "%ROOT%"
tar -xf "%NODE_ZIP%"
popd
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao extrair o arquivo zip.
    pause
    exit /b 1
)

if not exist "%NODE_FOLDER%\" (
    echo [ERRO] Pasta extraida nao encontrada: %NODE_FOLDER%
    pause
    exit /b 1
)

rename "%NODE_FOLDER%" "node_portavel"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao renomear a pasta extraida.
    pause
    exit /b 1
)

del /f /q "%NODE_ZIP%"

for /f "tokens=*" %%v in ('"%NODE_DIR%\node.exe" --version 2^>nul') do set "NODE_VER=%%v"
echo [OK] Node.js portavel instalado: !NODE_VER!
echo      Pasta: %NODE_DIR%

:: ── 4. Instalar dependencias do projeto ──────────────────────
echo.
echo [..] Instalando dependencias do projeto (npm install)...
cd /d "%ROOT%"
call "%NODE_DIR%\npm.cmd" install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.

:: ── 5. Instalar browsers do Playwright ──────────────────────
echo.
echo [..] Instalando browsers do Playwright (chromium)...
echo      Isso pode demorar alguns minutos na primeira vez (~150 MB).
echo.
call "%ROOT%node_modules\.bin\playwright.cmd" install chromium
if %errorlevel% neq 0 (
    echo [AVISO] Falha ao instalar browsers do Playwright automaticamente.
    echo         Execute manualmente: npx playwright install chromium
)

:: ── Conclusao ─────────────────────────────────────────────────
echo.
echo =================================================
echo   Instalacao concluida com sucesso!
echo   ^(c^) 2026 Warreno Hendrick Costa Lima Guimaraes
echo =================================================
echo.
echo Para executar o projeto:
echo   executar.bat
echo.
pause
endlocal
