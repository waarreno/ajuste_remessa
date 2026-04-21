!define APPNAME "AjsuteRemessa"
!define DESTDIR "C:\AjusteRemessa"
!define EXECBAT "executar.bat"
!define ICONFILE "icone.ico"

Name "${APPNAME}"
OutFile "Instalador_${APPNAME}.exe"
InstallDir "${DESTDIR}"
RequestExecutionLevel admin

Icon "${ICONFILE}"                   ; ícone do próprio instalador

Section "Instalar"
  SetOutPath "${DESTDIR}"
  
  ; Copia tudo do projeto
  File /r "node\*.*"
  File /r "node_modules\*.*"
  File /r "src\*.*"
  File "executar.bat"
  File "icone.ico"

  ; Cria atalho na Área de Trabalho
  CreateShortcut "$DESKTOP\${APPNAME}.lnk" \
    "${DESTDIR}\${EXECBAT}" \
    "" \
    "${DESTDIR}\${ICONFILE}" \
    0                                ; índice do ícone

SectionEnd