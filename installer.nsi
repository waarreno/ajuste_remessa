; ============================================================
;  Instalador — Ajuste Remessa
;  Gerado para: Unimed Cerrado / Contas Médicas
;  (c) 2026 Warreno Hendrick Costa Lima Guimaraes
; ============================================================

!define APPNAME     "Ajuste Remessa"
!define APPVERSION  "1.0"
!define PUBLISHER   "Warreno Hendrick Costa Lima Guimaraes"
!define DESTDIR     "C:\Ajuste Remessa"
!define EXECBAT     "executar.bat"
!define ICONFILE    "icone.ico"
!define UNINSTEXE   "desinstalar.exe"
!define REGKEY      "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"

Name                "${APPNAME}"
OutFile             "Instalador_Ajuste_Remessa.exe"
InstallDir          "${DESTDIR}"
RequestExecutionLevel user

; Ícone do próprio instalador
Icon                "${ICONFILE}"

; ============================================================
;  Páginas do instalador
; ============================================================
Page instfiles

; ============================================================
;  Seção principal — copia arquivos e cria atalho
; ============================================================
Section "Instalar"

  ; --- Pasta: node_modules ---
  SetOutPath "${DESTDIR}\node_modules"
  File /r "node_modules\*.*"

  ; --- Pasta: node_portavel ---
  SetOutPath "${DESTDIR}\node_portavel"
  File /r "node_portavel\*.*"

  ; --- Pasta: src ---
  SetOutPath "${DESTDIR}\src"
  File /r "src\*.*"

  ; --- Arquivos da raiz ---
  SetOutPath "${DESTDIR}"
  File ".env"
  File "dados.csv"
  File "executar.bat"
  File "icone.ico"
  File "lerCsv.bat"
  File "LICENSE"
  File "package.json"
  File "package-lock.json"
  File "README.md"

  ; --- Gera o desinstalador dentro da pasta de destino ---
  WriteUninstaller "${DESTDIR}\${UNINSTEXE}"

  ; --- Atalho na Área de Trabalho ---
  CreateShortcut \
    "$DESKTOP\${APPNAME}.lnk" \
    "${DESTDIR}\${EXECBAT}" \
    "" \
    "${DESTDIR}\${ICONFILE}" \
    0

  ; --- Registro no Painel de Controle → Programas e Recursos ---
  WriteRegStr   HKLM "${REGKEY}" "DisplayName"      "${APPNAME}"
  WriteRegStr   HKLM "${REGKEY}" "DisplayVersion"   "${APPVERSION}"
  WriteRegStr   HKLM "${REGKEY}" "Publisher"        "${PUBLISHER}"
  WriteRegStr   HKLM "${REGKEY}" "InstallLocation"  "${DESTDIR}"
  WriteRegStr   HKLM "${REGKEY}" "DisplayIcon"      "${DESTDIR}\${ICONFILE}"
  WriteRegStr   HKLM "${REGKEY}" "UninstallString"  "${DESTDIR}\${UNINSTEXE}"
  WriteRegDWORD HKLM "${REGKEY}" "NoModify"         1
  WriteRegDWORD HKLM "${REGKEY}" "NoRepair"         1

SectionEnd

; ============================================================
;  Seção de desinstalação
; ============================================================
Section "Uninstall"

  ; --- Remove atalho da Área de Trabalho ---
  Delete "$DESKTOP\${APPNAME}.lnk"

  ; --- Remove toda a pasta de instalação (incluindo logs gerados) ---
  RMDir /r "${DESTDIR}"

  ; --- Remove entrada do Painel de Controle ---
  DeleteRegKey HKLM "${REGKEY}"

SectionEnd
