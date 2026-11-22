# Como criar um novo cliente (barbearia) do sistema Cadeira Cheia

Receita feita a partir da R-17 (Espaço Barber Shop R-17), o primeiro cliente, em 21/11/2026.
**Sem chaves nem senhas aqui.** Códigos, senhas e chaves ficam só com o Sérgio e no banco.

---

## 1. O que o sistema é

- **Site do cliente** (público): fotos, serviços e preços, endereço, e o formulário **Pedir horário**.
  O cliente final NÃO vê horários livres e NÃO marca sozinho. Ele escolhe dia, barbeiro e período
  (manhã/tarde/noite). O pedido é gravado no banco e o WhatsApp do barbeiro escolhido é aberto com a mensagem pronta.
- **Painel do dono** (pasta `painel/`, gerada a partir do mesmo index.html; link `.../painel/`): app separado no celular ("R-17 Painel").
  - Abas: Agenda, Novo horário, Clientes, Caixa, Preços, Ajustes.
  - Pedido novo: sirene própria que repete a cada 2,5 s, faixa vermelha piscando e aviso no celular (push) a cada 1 minuto, até tocar em "Parar alarme".
  - Clientes VIP com anotação. "✅ Feito, receber" lança o valor no caixa.
  - Caixa com entradas e saídas, separado por barbeiro.
  - Preços editáveis com salvamento automático.
  - WhatsApp da barbearia e de cada barbeiro, fotos, vídeos e horário de funcionamento.
- Tudo é um único site estático (GitHub Pages) + um banco Supabase compartilhado por todas as barbearias.

## 2. Onde está cada coisa

| Item | Local |
|---|---|
| Site R-17 (modelo) | repositório `serfico21-arch/Pessoal`, pasta `r17/` → https://serfico21-arch.github.io/Pessoal/r17/ |
| Painel R-17 | https://serfico21-arch.github.io/Pessoal/r17/painel/ |
| Página que gera o comando SQL | `r17/instalar.html` (atualizações de banco) e `r17/email.html` (e-mail de recuperação) |
| Banco | Supabase projeto "variaveis", id `avvhnajfczdedlydkcrb` (região São Paulo, plano grátis) |
| Arquivos SQL (ordem) | pasta de arquivos do projeto `barbearia/supabase/`: `instalar-banco.sql` (001), `atualizar-codigo.sql` (002/003), `004-agenda-dono-caixa.sql`, `005-pedidos.sql`, `006-saidas-barbeiro.sql`, `007-avisos-celular.sql`, `008-alarme-repete.sql` |
| Função de aviso no celular | Edge Function `push-pedido` (cópia em `cadeira-cheia/receita/push-pedido.ts`) |
| Página de vendas | `cadeira-cheia/index.html` e demonstração `cadeira-cheia/demo/` |

O banco já é **multi-barbearia**: cada barbearia é uma linha na tabela `lojas` (id curto, ex.: `r17`).
Agenda, clientes, caixa, pedidos, fotos e avisos têm `loja_id`.

## 3. Passo a passo para um cliente novo

### 3.1 Juntar os dados do cliente
- Nome da barbearia, frase/slogan, logo (de preferência vetor/PNG grande, sem marca d'água).
- Endereço completo e WhatsApp da barbearia.
- Barbeiros: nome e WhatsApp de cada um.
- Serviços e preços, e o horário de cada dia da semana.
- Fotos reais (até 40) e links de vídeos, se tiver.
- E-mail do dono (para recuperar a senha).

### 3.2 Banco (só uma linha nova, o resto já existe)
Escolha um id curto sem espaço, ex.: `bigode`. Rode no SQL Editor do Supabase (troque os valores):

```sql
insert into public.lojas(id, nome) values ('bigode','Barbearia do Bigode') on conflict (id) do nothing;
insert into public.lojas_segredo(loja_id, codigo_hash)
values ('bigode', extensions.crypt('<CODIGO-DE-ATIVACAO-EM-MAIUSCULAS-SEM-ESPACO>', extensions.gen_salt('bf')))
on conflict (loja_id) do nothing;
```

- O **código de ativação** é entregue ao dono só pelo WhatsApp. NUNCA escrever no repositório,
  porque o repositório é público.
- O código é comparado em MAIÚSCULAS e sem espaços/traços (`_limpa_codigo`). Grave o hash já assim.
- No primeiro acesso ao painel, o dono digita esse código e cria: código de recuperação próprio + dica + senha.

### 3.3 Site (copiar a pasta)
1. Copiar `r17/` inteira para uma pasta nova, ex.: `bigode/` (ou um repositório próprio, que é melhor; veja Armadilhas).
2. Em `index.html`, trocar:
   - `CONFIG.loja` → `"bigode"`; `CONFIG.whatsapp` → `"55" + DDD + número`.
     `CONFIG.api` e `CONFIG.chave` (chave publicável, pode ser pública) ficam iguais.
   - `BARBEIROS` (id curto + nome), `PADRAO` (horário), lista inicial de serviços e `CATEGORIAS`.
   - `ENDERECO` e o texto de `msgConfirma` (nome da barbearia).
   - Títulos, `<title>`, textos do topo, cores (variáveis no `:root`), logo SVG/imagens, galeria padrão (`#galPadrao`).
   - Metas de compartilhamento (og:title, og:description, og:image) e `og.jpg` (imagem 1200x630).
3. `manifest.webmanifest` (app do cliente) e `manifest-adm.webmanifest` (app do painel):
   nome, short_name, **id** e `start_url` com o caminho novo, ícones novos.
4. Ícones: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png`.
5. `sw.js`: trocar o prefixo do cache `r17-` por um próprio (ex.: `bigode-v1`), nos 2 lugares.
6. `instalar.html` / `email.html`: trocar `'r17'` pelo id novo onde aparecer.
7. Na Edge Function `push-pedido`, o mapa `NOMES` tem os barbeiros da R-17. Com outra barbearia,
   trocar para pegar o nome do banco ou acrescentar os ids novos, e reimplantar a função.
8. **Gerar o painel:** `python3 cadeira-cheia/receita/gerar-painel.py bigode "Bigode Painel"` cria `bigode/painel/index.html` (cópia com `<base href="../">`). Criar `bigode/painel/manifest.webmanifest` (id e start_url próprios, ícones com `../`). **Rodar o gerador de novo a cada mudança no index.html.**
9. Publicar (push na main). Esperar uns 10 minutos para o GitHub Pages atualizar.

### 3.4 Entregar ao dono
1. Mandar o link do painel (`.../bigode/?painel=1#adm`) e o código de ativação pelo WhatsApp.
2. Ele ativa, cria a senha, confere preços, horário e WhatsApp de cada barbeiro (aba Ajustes),
   e coloca as fotos reais em Ajustes (botão "+ Colocar fotos").
3. Em cada celular de barbeiro: abrir o painel, instalar o app, tocar em **📲 Receber avisos no celular** e aceitar.
   No iPhone, só funciona com o app instalado na tela inicial (iOS 16.4 ou mais novo).
4. Testar: pedir um horário pelo site do cliente. O painel deve apitar e o celular deve vibrar a cada minuto até "Parar alarme".
5. Divulgar o link do cliente (botão "Convidar clientes" no topo do painel já manda o convite com a imagem).

## 4. Peças técnicas (para quem for mexer)

- **Acesso ao banco:** o site só chama funções `security definer` via `/rest/v1/rpc/...` com a chave publicável.
  - As tabelas têm RLS e o anônimo não lê nada.
  - Funções do dono recebem `p_token` (sessão de 30 dias, guardada no aparelho em `adm-<loja>`) e validam com `_sessao`.
  - Cliente final só tem `pedir(...)`, que limita a 3 pedidos abertos por telefone e 40 pedidos por hora.
- **Senha e recuperação:**
  - Tudo é guardado só como hash bcrypt (`extensions.crypt`).
  - 5 erros bloqueiam o acesso em tempo crescente.
  - "Esqueci" mostra a dica e pede o código, ou manda um código de 6 dígitos por e-mail.
- **E-mail (Resend):**
  - A chave `resend_key` fica na tabela `sistema` e é gerada colando em `email.html`. A chave nunca passa pelo chat.
  - Remetente `onboarding@resend.dev` só entrega para o e-mail dono da conta Resend.
  - Para várias barbearias receberem, é preciso **verificar um domínio** no Resend.
- **Aviso no celular (Web Push):**
  - Chaves VAPID (`vapid_public` / `vapid_private` na tabela `sistema`) são geradas no navegador pela `instalar.html` (007). Nunca no repositório nem no chat. Elas servem para todas as barbearias.
  - O gatilho `pedido_push` (pg_net) chama a função `push-pedido` quando entra um pedido.
  - O cron `r17-alarme` (pg_cron, a cada minuto) chama de novo enquanto houver pedido novo não silenciado com menos de 30 min.
  - `push_dados()` decide o que mandar: no máximo 1 aviso a cada 50 s por pedido.
  - "Parar alarme" chama `adm_silenciar`.
  - A assinatura de cada celular fica em `push_subs` com `loja_id`.
- **Alarme no painel:**
  - Sirene WebAudio (onda quadrada 760/1320 Hz) a cada 2,5 s, com vibração.
  - Pedidos já vistos ficam no aparelho em `ped-vistos-<loja>`. Se fechar sem parar, o alarme volta a tocar ao abrir.
  - O painel consulta pedidos a cada 20 s, mas não redesenha a lista enquanto alguém digita.
- **Versão e atualização:**
  - `const VERSAO` no `index.html` aparece no selo verde do painel.
  - O app confere a cada 5 min e ao voltar para a tela, e recarrega sozinho.
  - **A cada mudança: subir VERSAO e o número do cache no `sw.js`.**
  - O `sw.js` busca sempre da rede (no-cache) e só usa a cópia guardada sem internet.
- **Testes:**
  - Usamos scripts Playwright com o Supabase simulado (rota falsa para `/rest/v1/rpc/*`), em largura 390 (celular) e 1100.
  - Conferir também que a página não rola para o lado no celular.

## 5. Armadilhas que já aconteceram

0. **App do painel abria o app do cliente:** os dois tinham o mesmo endereço. Por isso o painel mora na pasta `painel/` com manifesto próprio. A tela inicial do painel tem só 3 botões grandes (Agenda, Caixa, Ajustes), porque o dono se confundia com muita informação.

1. **Pedido do cliente não chegava:** o site abria o WhatsApp antes de terminar de gravar.
   Agora grava primeiro (espera até 4 s) e depois abre o WhatsApp.
2. **Sem som no painel:** o navegador só libera som depois de um toque na tela.
   O som já vem ligado e libera no primeiro toque. Com a tela bloqueada, quem avisa é o push,
   e o Android usa o som de notificação dele (dá para trocar nas configurações do celular).
3. **"Nada muda" depois de atualizar:** o GitHub Pages demora uns 10 minutos.
   Conferir pelo número da versão no selo verde. Não precisa reinstalar o app.
4. **Link da barbearia abrindo dentro do app "FCosta":** o app instalado do site raiz do repositório
   captura os links da pasta. Para clientes novos, o ideal é **um repositório/endereço próprio por barbearia**.
5. **Página de instalação antiga no cache:** pedir Ctrl+F5 e conferir o título da página antes de copiar.
6. **Aviso amarelo "destructive operations" no Supabase:** é normal nos nossos comandos. Clicar em "Run this query".
7. **Plano grátis do Supabase pausa após 7 dias sem uso.** O painel aberto todo dia já evita isso.
   Com muitos clientes, avaliar o plano pago (perguntar ao Sérgio antes).
8. **Nunca** colocar o código de ativação/recuperação, chave do Resend ou chave VAPID privada no repositório.
   O repositório é público.
9. Celular Android antigo: evitar CSS novo sem alternativa (`color-mix`, `aspect-ratio`) e sempre testar em 390 px de largura.
10. Outro trabalho também publica no mesmo repositório: sempre `git pull --rebase` antes de publicar.

## 6. Pendências para vender em escala

- Edge Function com nomes de barbeiro vindos do banco (hoje o mapa é fixo da R-17).
- Domínio verificado no Resend para mandar e-mail a qualquer dono.
- Um repositório (ou subdomínio) por barbearia, para não misturar apps instalados.
- Definir preços reais dos planos na página de vendas (hoje são exemplo).
