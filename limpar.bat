@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

set "ROOT=%~dp0"

echo =================================================
echo   Limpar - Ajuste Remessa
echo   v1.0.0
echo   ^(c^) 2026 Warreno Hendrick Costa Lima Guimaraes
echo =================================================
echo.
echo Itens que serao removidos:
echo   - node_portavel\
echo   - node_modules\
echo   - package-lock.json
echo   - log_*.csv
echo.
set /p "CONFIRMA=Confirmar limpeza? (s/n): "
if /i not "!CONFIRMA!"=="s" (
    echo.
    echo Operacao cancelada.
    echo.
    pause
    exit /b 0
)
echo.

:: ── node_portavel\ ────────────────────────────────────────────
if exist "%ROOT%node_portavel\" (
    echo [..] Removendo node_portavel\...
    rmdir /s /q "%ROOT%node_portavel"
    if exist "%ROOT%node_portavel\" (
        echo [ERRO] Nao foi possivel remover node_portavel\
    ) else (
        echo [OK]  node_portavel\ removido.
    )
) else (
    echo [--]  node_portavel\ nao existe, ignorando.
)

:: ── node_modules\ ─────────────────────────────────────────────
if exist "%ROOT%node_modules\" (
    echo [..] Removendo node_modules\...
    rmdir /s /q "%ROOT%node_modules"
    if exist "%ROOT%node_modules\" (
        echo [ERRO] Nao foi possivel remover node_modules\
    ) else (
        echo [OK]  node_modules\ removido.
    )
) else (
    echo [--]  node_modules\ nao existe, ignorando.
)

:: ── package-lock.json ─────────────────────────────────────────
if exist "%ROOT%package-lock.json" (
    del /f /q "%ROOT%package-lock.json"
    echo [OK]  package-lock.json removido.
) else (
    echo [--]  package-lock.json nao existe, ignorando.
)

:: ── log_*.csv ─────────────────────────────────────────────────
set "LOGS_ENCONTRADOS=0"
for %%f in ("%ROOT%log_*.csv") do set "LOGS_ENCONTRADOS=1"

if "!LOGS_ENCONTRADOS!"=="1" (
    del /f /q "%ROOT%log_*.csv"
    echo [OK]  Arquivos log_*.csv removidos.
) else (
    echo [--]  Nenhum log_*.csv encontrado, ignorando.
)

echo.
echo =================================================
echo   Limpeza concluida.
echo   ^(c^) 2026 Warreno Hendrick Costa Lima Guimaraes
echo =================================================
echo.
pause
endlocal
