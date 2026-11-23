; Instalador da Central Pinheiro & Costa (Windows). Construir com: makensis instalador.nsi
; Instala só para o usuário (não pede senha de administrador) e cria atalhos na Área de Trabalho e no Menu Iniciar.
Unicode true
SetCompressor /SOLID lzma
!include "MUI2.nsh"

!define APP_NOME "Central Pinheiro & Costa"
!define APP_VERSAO "1.0.0"

Name "${APP_NOME}"
OutFile "Central-Pinheiro-Costa-Instalador.exe"
InstallDir "$LOCALAPPDATA\Central Pinheiro e Costa"
RequestExecutionLevel user
BrandingText "FCOSTA Sistemas & Apps"

VIProductVersion "${APP_VERSAO}.0"
VIAddVersionKey /LANG=1046 "ProductName" "${APP_NOME}"
VIAddVersionKey /LANG=1046 "CompanyName" "FCOSTA Sistemas & Apps"
VIAddVersionKey /LANG=1046 "FileDescription" "Instalador da ${APP_NOME}"
VIAddVersionKey /LANG=1046 "FileVersion" "${APP_VERSAO}"
VIAddVersionKey /LANG=1046 "ProductVersion" "${APP_VERSAO}"
VIAddVersionKey /LANG=1046 "LegalCopyright" "FCOSTA Sistemas & Apps"

!define MUI_ICON "icone.ico"
!define MUI_UNICON "icone.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Central Pinheiro & Costa"
!define MUI_WELCOMEPAGE_TEXT "Este programa instala a Central da loja Pinheiro & Costa: pedidos do site, avisos e ofertas, produtos do gestor e condições da loja.$\r$\n$\r$\nPrecisa de internet para funcionar.$\r$\n$\r$\nClique em Avançar."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_FUNCTION AbrirAgora
!define MUI_FINISHPAGE_RUN_TEXT "Abrir a Central agora"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "PortugueseBR"

Function AbrirAgora
  ExecShell "" "$SYSDIR\wscript.exe" '"$INSTDIR\abrir-central.vbs"'
FunctionEnd

Section "Instalar"
  SetOutPath "$INSTDIR"
  File "abrir-central.vbs"
  File "icone.ico"
  WriteUninstaller "$INSTDIR\Desinstalar.exe"
  CreateShortcut "$DESKTOP\Central Pinheiro & Costa.lnk" "$SYSDIR\wscript.exe" '"$INSTDIR\abrir-central.vbs"' "$INSTDIR\icone.ico"
  CreateDirectory "$SMPROGRAMS\Central Pinheiro & Costa"
  CreateShortcut "$SMPROGRAMS\Central Pinheiro & Costa\Central Pinheiro & Costa.lnk" "$SYSDIR\wscript.exe" '"$INSTDIR\abrir-central.vbs"' "$INSTDIR\icone.ico"
  CreateShortcut "$SMPROGRAMS\Central Pinheiro & Costa\Desinstalar.lnk" "$INSTDIR\Desinstalar.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta" "DisplayName" "${APP_NOME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta" "UninstallString" '"$INSTDIR\Desinstalar.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta" "DisplayIcon" "$INSTDIR\icone.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta" "DisplayVersion" "${APP_VERSAO}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta" "Publisher" "FCOSTA Sistemas & Apps"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\Central Pinheiro & Costa.lnk"
  Delete "$SMPROGRAMS\Central Pinheiro & Costa\Central Pinheiro & Costa.lnk"
  Delete "$SMPROGRAMS\Central Pinheiro & Costa\Desinstalar.lnk"
  RMDir "$SMPROGRAMS\Central Pinheiro & Costa"
  Delete "$INSTDIR\abrir-central.vbs"
  Delete "$INSTDIR\icone.ico"
  Delete "$INSTDIR\Desinstalar.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta"
SectionEnd
