#!/usr/bin/env python3
"""Gera <pasta>/painel/index.html a partir de <pasta>/index.html.
O painel do dono precisa de um endereço próprio (pasta painel/) para o app instalado
no celular não se misturar com o app do cliente. RODAR A CADA MUDANÇA no index.html.
Uso: python3 cadeira-cheia/receita/gerar-painel.py r17 "R-17 Painel"
"""
import sys, re, pathlib
pasta, titulo = sys.argv[1], sys.argv[2]
s = pathlib.Path(pasta, "index.html").read_text()
def troca(a, b, n=1):
    global s
    assert s.count(a) == n, f"não achei: {a[:60]}"
    s = s.replace(a, b)
troca('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">\n<!-- GERADO por gerar-painel.py a partir de ../index.html. Não editar aqui. -->')
i = s.index('<script id="modoScript">'); j = s.index('</script>', i) + len('</script>')
s = s[:i] + ('<script>document.getElementById("mf").href="painel/manifest.webmanifest"; document.title=%r; '
             'document.documentElement.classList.add("modo-painel"); '
             'if(location.hash!=="#adm") history.replaceState(null,"",location.pathname+location.search+"#adm");</script>' % titulo) + s[j:]
s = s.replace('/[?&]painel/.test(location.search)', 'true')
troca('location.pathname+"?painel=1#adm"', 'location.pathname+"#adm"')
pathlib.Path(pasta, "painel").mkdir(exist_ok=True)
pathlib.Path(pasta, "painel", "index.html").write_text(s)
print("ok:", pathlib.Path(pasta, "painel", "index.html"))
