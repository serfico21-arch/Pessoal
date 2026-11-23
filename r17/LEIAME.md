# Sistema Cadeira Cheia: Barbearia R-17

Guia simples do **site** e do **app (painel)** da Espaço Barber Shop R-17.
Feito pela **FCOSTA Sistemas & Apps**. Versão atual: **29** (novembro de 2026).

> Aqui não tem senha, código de ativação nem chave secreta. Isso fica só com o Sérgio.

---

## 1. O que é

São duas partes:

1. **Site do cliente:** a página que o cliente da barbearia abre no celular. Mostra serviços, preços, fotos, vídeos, horário e endereço. Para marcar horário, o cliente toca no botão verde do WhatsApp.
2. **Painel (app do dono):** o app que o Rodrigo (Rô) usa no celular para agendar, ver os agendados, receber e controlar o caixa. Tudo o que ele posta no painel aparece no site.

**Barbearia:** Espaço Barber Shop R-17. Dono: Rodrigo (Rô).
WhatsApp (11) 98254-4101. Rua Desembargador Flávio Torres, 230, Jardim Kemel, Itaim Paulista.

---

## 2. Links

| Para quê | Link |
|---|---|
| Site do cliente | https://serfico21-arch.github.io/Pessoal/r17/ |
| Painel do Rodrigo | https://serfico21-arch.github.io/Pessoal/r17/painel/ |
| Instalador do banco | https://serfico21-arch.github.io/Pessoal/r17/instalar.html |
| Página de vendas | https://serfico21-arch.github.io/Pessoal/cadeira-cheia/ |

---

## 3. O painel (app do Rodrigo)

Na tela inicial tem dois botões grandes e quatro menores:

- **AGENDAR:** marca um horário para o cliente (nome, dia, hora e serviço).
- **AGENDADOS:** mostra os clientes marcados no dia.
  - Cada cliente tem o botão vermelho **🔴 A EXECUTAR**.
  - Quando termina o corte, o Rodrigo toca nele. Ele fica verde, **✅ EXECUTADO**, e o valor vai sozinho para o caixa.
  - Errou? Tem o botão **Desfazer**.
- **💰 Caixa:** mostra quanto entrou e quanto saiu no dia, na semana e no mês.
- **⚙️ Ajustes:** abre outras opções:
  - **Preços:** mudar serviços e valores.
  - **Clientes:** clientes VIP e anotações.
  - **Horário e WhatsApp:** dias e horas de trabalho e o número do WhatsApp.
- **📣 Postar no site:** colocar avisos (Novidades), fotos e vídeos. Aparecem no site na hora.
- **📤 Mandar o site para o cliente:** botão amarelo que abre o WhatsApp com o link do site pronto para enviar.

### Instalar o painel no celular

- **Android:** abrir o link do painel no Chrome, tocar nos 3 pontinhos ⋮ e em **Instalar app**.
- **iPhone:** abrir o link do painel no **Safari**, tocar em **Compartilhar** e em **Adicionar à Tela de Início**.
  Se já tinha um ícone antigo, apague antes.

O ícone se chama **"R-17 Painel"**.

---

## 4. O site do cliente

Visual escuro, estilo barbearia americana. Tem, de cima para baixo:

1. **Início:** nome, frase e o botão verde **Agende seu horário** (abre o WhatsApp da barbearia).
2. **Novidades:** os avisos que o Rodrigo posta no painel.
3. **Tabela da casa:** serviços e preços.
4. **Sobre:** o Rodrigo, o Rô.
5. **Nossos cortes:** galeria de fotos. Enquanto não tiver foto postada, mostra fotos de exemplo (grátis, do Unsplash).
6. **Veja na prática:** vídeos (só aparece se tiver vídeo postado).
7. **Instalar o app:** botão para o cliente pôr o site na tela do celular (Android e iPhone).
8. **Quando abrimos:** horário de funcionamento e mapa.

O botão verde do WhatsApp também fica fixo embaixo da tela.
**Não tem agendamento online.** O cliente marca pelo WhatsApp.

---

## 5. O banco de dados (Supabase)

- Onde: **Supabase**, projeto **"variaveis"** (id `avvhnajfczdedlydkcrb`), na conta do Sérgio. Plano grátis.
- Guarda: agenda, clientes, caixa, preços, fotos, vídeos, avisos e horário.
- O mesmo banco serve para várias barbearias. Cada uma tem um código curto (a R-17 é `r17`).

**Para rodar uma atualização do banco:**

1. Abrir o **Instalador do banco** (link acima).
2. Tocar em **Copiar comando**.
3. Abrir o Supabase, ir em **SQL Editor**, colar e tocar em **Run**.
4. Se aparecer aviso amarelo ("destructive operations"), é normal: tocar em **Run this query**.

**Cuidado:** o plano grátis pausa depois de 7 dias sem uso. Com o painel aberto todo dia, isso não acontece.

---

## 6. Como publicar uma nova versão

Toda vez que mudar o site ou o painel:

1. Aumentar o número em `const VERSAO="29"` (ex.: para `"30"`) em **dois arquivos**:
   - `r17/index.html` (site)
   - `r17/painel/index.html` (painel)
2. Aumentar também o número do cache em `r17/sw.js` (ex.: `r17-v19` para `r17-v20`).
3. Publicar no GitHub (repositório `serfico21-arch/Pessoal`, ramo `main`).
4. Esperar uns **10 minutos**. O app confere a versão sozinho e se atualiza.
   Não precisa reinstalar o app.

---

## 7. Como fazer para um cliente novo

Resumo (o passo a passo completo está em `cadeira-cheia/COMO-CRIAR-NOVO-CLIENTE.md`):

1. **Juntar os dados:** nome da barbearia, logo, endereço, WhatsApp, barbeiros, serviços e preços, horário e fotos.
2. **Copiar a pasta** `r17/` inteira (com a pasta `painel/`) para uma pasta nova, ex.: `bigode/`.
3. **Trocar** nos arquivos: nome, código da loja, barbeiros, endereço, WhatsApp, logo e ícones.
4. **Gerar um código de ativação novo** e rodar o comando no Supabase para criar a barbearia no banco.
5. **Publicar** e mandar ao dono, pelo WhatsApp, o link do painel e o código de ativação.

> **Nunca** escreva o código de ativação, senhas ou chaves no repositório. Ele é público.

---

## 8. Arquivos da pasta `r17/`

| Arquivo | Para quê |
|---|---|
| `index.html` | Site do cliente |
| `painel/index.html` | Painel do Rodrigo |
| `painel/manifest.webmanifest` | Nome e ícone do app do painel |
| `manifest.webmanifest` | Nome e ícone do app do site |
| `instalar.html` | Gera o comando para atualizar o banco |
| `email.html` | Configura o e-mail de recuperação de senha |
| `sw.js` | Faz o app funcionar e se atualizar |
| `og.jpg` | Imagem que aparece quando o link é enviado no WhatsApp |
| `icon-*.png`, `apple-touch-icon.png`, `favicon-32.png` | Ícones |

---

**FCOSTA Sistemas & Apps**: Sérgio Costa, CRECI-SP 294791-F.
