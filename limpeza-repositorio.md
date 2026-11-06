# Limpeza do repositório Pessoal (serfico21-arch/Pessoal)

Nada foi apagado. Esta sessão só consegue LER o repositório, então esta é a lista para você conferir e apagar pelo GitHub.
Critério: arquivo que nenhuma página, o index, o sw.js ou o manifest usa.

## 1) Pode apagar (ninguém usa) — ~3,1 MB no total (1,7 MB de arquivos soltos + 1,4 MB de zips)
| Arquivo | Motivo |
|---|---|
| `calculadora-comissao (1).html` | cópia duplicada de `calculadora-comissao.html` |
| `contratos-creci.html` | substituída por `contratos-editor.html` (o index aponta para o editor) |
| `ferramentas.html` (705 KB) | versão antiga de painel, o index atual não usa |
| `fcosta-gestor.html` (418 KB) | página antiga, sem link em lugar nenhum |
| `consulta-imovel.html` | sem link em lugar nenhum |
| `fcosta-corretor-padronizado.zip` (995 KB) | backup compactado |
| `pwa-tv-fcosta.zip` (391 KB) | backup compactado do PWA da TV |
| `banner-tv-fcosta.png` | só a versão `-v2` é usada pela TV |
| `fcosta_horizontal_dark.png`, `fcosta_horizontal_transparent.png`, `fcosta_stacked_dark.png`, `fcosta_stacked_transparent.png` | logos soltos, sem uso |
| `icone-apple-touch-180.png`, `icone-favicon-32.png`, `icone-master-1024.png`, `icon-192 e mais mesclados_1.jpg` | ícones duplicados dos que o painel usa (`icone-tela-inicial-*`, `favicon-32`, `apple-touch-icon`) |

## 2) Confira antes de apagar (podem ser links já compartilhados)
12 páginas de vídeo da TV + os 12 vídeos .mp4 delas (~105 MB) não aparecem mais na lista da `tv-fcosta.html`:
`v-xjvn4c, v-coydnl, v-scn9mf, v-1xp8jv, v-e65azt, v-1rbc1o, v-mlfc2u, v-ha6et4, v-m0jn2b, v-2ughp8, v-xl3v8g, v-u89h2n`
(cada uma = `v-ID.html` + `v-ID.jpg` + `v-ID-p.jpg` + `v-ID-og.jpg`; os mp4 são `v-t78xlc, v-t79dof, v-t75pe6, v-t786z4, v-t76d2p, v-t78lhs, v-t7729g, v-t78aik, v-t76xhf, v-t77ibw, v-t77plv, v-t5v9a2`).
Se você já mandou esses links no WhatsApp/Facebook, eles deixam de abrir. Se são vídeos velhos, apague.
O repositório tem 361 MB; só esses vídeos antigos são ~105 MB.

## 3) Manter (parecem sobrando, mas são usados)
`manifest.webmanifest` (usado por tv-fcosta e gravador), `splash-*.png` (tv-fcosta), `fluxo-metrocasa.html` (construtoras), `portfolio-fcosta.html` e `selecao-fcosta.html` (publicação), `repositorios-github.html` (index), `portfolio.html` e `portfolio-admin.html` (quase idênticos, mas ambos têm botão no index).

## 4) Atenção
`manual-fiat-idea-2012.html` tem 21 MB: deixa o repositório pesado. Considere hospedar como PDF.
