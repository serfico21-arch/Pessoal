' Abre a Central Pinheiro & Costa como aplicativo (janela própria, sem barra do navegador).
' Tenta o Edge (vem em todo Windows); se não achar, tenta o Chrome; senão abre no navegador padrão.
Const URL = "https://serfico21-arch.github.io/Pessoal/mercado/painel/"
Set sh = CreateObject("WScript.Shell")
On Error Resume Next
sh.Run "msedge --app=" & URL, 1, False
If Err.Number <> 0 Then
  Err.Clear
  sh.Run "chrome --app=" & URL, 1, False
  If Err.Number <> 0 Then
    Err.Clear
    sh.Run URL, 1, False
  End If
End If
