; Instalador da Central Pinheiro & Costa (Windows). Construir com: makensis instalador.nsi
; Instala só para o usuário (não pede senha de administrador) e cria atalhos na Área de Trabalho e no Menu Iniciar.
; Desde a 1.1.0 não usa mais script .vbs (antivírus desconfiam de instalador que grava script):
; o atalho abre o Edge/Chrome direto com --app, ou um atalho de internet (.url) se não achar.
Unicode true
SetCompressor /SOLID lzma
!include "MUI2.nsh"

!define APP_NOME "Central Pinheiro & Costa"
!define APP_VERSAO "1.1.0"
!define URL_CENTRAL "https://serfico21-arch.github.io/Pessoal/mercado/painel/"

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
VIAddVersionKey /LANG=1046 "OriginalFilename" "Central-Pinheiro-Costa-Instalador.exe"
VIAddVersionKey /LANG=1046 "InternalName" "Central-Pinheiro-Costa-Instalador"
VIAddVersionKey /LANG=1046 "Comments" "Cria atalhos para abrir a Central da loja (${URL_CENTRAL})"

!define MUI_ICON "icone.ico"
!define MUI_UNICON "icone.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEFINISHPAGE_BITMAP "lateral.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "lateral.bmp"
!define MUI_WELCOMEPAGE_TITLE "Central Pinheiro & Costa"
!define MUI_WELCOMEPAGE_TEXT "Este programa instala a Central da loja Pinheiro & Costa: pedidos do site, avisos e ofertas, produtos do gestor e condições da loja.$\r$\n$\r$\nPrecisa de internet para funcionar.$\r$\n$\r$\nClique em Avançar.$\r$\n$\r$\nDesenvolvido por FCOSTA Sistemas & Apps."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_FUNCTION AbrirAgora
!define MUI_FINISHPAGE_RUN_TEXT "Abrir a Central agora"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "PortugueseBR"

Var NAVEGADOR

; Procura o Edge (vem no Windows 10/11) ou o Chrome para abrir a Central em janela própria.
Function AcharNavegador
  StrCpy $NAVEGADOR ""
  IfFileExists "$PROGRAMFILES32\Microsoft\Edge\Application\msedge.exe" 0 +3
    StrCpy $NAVEGADOR "$PROGRAMFILES32\Microsoft\Edge\Application\msedge.exe"
    Return
  IfFileExists "$PROGRAMFILES64\Microsoft\Edge\Application\msedge.exe" 0 +3
    StrCpy $NAVEGADOR "$PROGRAMFILES64\Microsoft\Edge\Application\msedge.exe"
    Return
  IfFileExists "$PROGRAMFILES64\Google\Chrome\Application\chrome.exe" 0 +3
    StrCpy $NAVEGADOR "$PROGRAMFILES64\Google\Chrome\Application\chrome.exe"
    Return
  IfFileExists "$PROGRAMFILES32\Google\Chrome\Application\chrome.exe" 0 +3
    StrCpy $NAVEGADOR "$PROGRAMFILES32\Google\Chrome\Application\chrome.exe"
    Return
  IfFileExists "$LOCALAPPDATA\Google\Chrome\Application\chrome.exe" 0 +2
    StrCpy $NAVEGADOR "$LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
FunctionEnd

; Cria um atalho no lugar indicado (pilha: caminho do .lnk sem extensão)
!macro CriarAtalho ONDE
  StrCmp $NAVEGADOR "" +3
    CreateShortcut "${ONDE}.lnk" "$NAVEGADOR" "--app=${URL_CENTRAL}" "$INSTDIR\icone.ico"
    Goto +4
  WriteINIStr "${ONDE}.url" "InternetShortcut" "URL" "${URL_CENTRAL}"
  WriteINIStr "${ONDE}.url" "InternetShortcut" "IconFile" "$INSTDIR\icone.ico"
  WriteINIStr "${ONDE}.url" "InternetShortcut" "IconIndex" "0"
!macroend

Function AbrirAgora
  StrCmp $NAVEGADOR "" 0 +3
    ExecShell "open" "${URL_CENTRAL}"
    Return
  Exec '"$NAVEGADOR" --app=${URL_CENTRAL}'
FunctionEnd

Section "Instalar"
  SetOutPath "$INSTDIR"
  ; tira o script antigo da versão 1.0.0, se existir
  Delete "$INSTDIR\abrir-central.vbs"
  File "icone.ico"
  WriteUninstaller "$INSTDIR\Desinstalar.exe"
  Call AcharNavegador
  !insertmacro CriarAtalho "$DESKTOP\Central Pinheiro & Costa"
  CreateDirectory "$SMPROGRAMS\Central Pinheiro & Costa"
  !insertmacro CriarAtalho "$SMPROGRAMS\Central Pinheiro & Costa\Central Pinheiro & Costa"
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
  Delete "$DESKTOP\Central Pinheiro & Costa.url"
  Delete "$SMPROGRAMS\Central Pinheiro & Costa\Central Pinheiro & Costa.url"
  Delete "$SMPROGRAMS\Central Pinheiro & Costa\Central Pinheiro & Costa.lnk"
  Delete "$SMPROGRAMS\Central Pinheiro & Costa\Desinstalar.lnk"
  RMDir "$SMPROGRAMS\Central Pinheiro & Costa"
  Delete "$INSTDIR\abrir-central.vbs"
  Delete "$INSTDIR\icone.ico"
  Delete "$INSTDIR\Desinstalar.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CentralPinheiroCosta"
SectionEnd
