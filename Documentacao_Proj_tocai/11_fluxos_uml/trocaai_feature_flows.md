<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Fluxos de Funcionalidades - TrocaAi

Este documento descreve o fluxo de ponta a ponta para as principais funcionalidades do sistema, mostrando como o frontend, backend e banco de dados interagem.

---

## ?? Funcionalidade 1: Cadastro de Novo Usu�rio

**Objetivo:** Um visitante se cadastra na plataforma.

1.  **[Frontend]** Usu�rio acessa a p�gina `/register`.
    -   `router/index.ts` carrega o componente `RegisterView.vue`.

2.  **[Frontend]** Usu�rio preenche o formul�rio (nome, email, senha) e clica em "Cadastrar".
    -   `RegisterView.vue` chama a a��o `authStore.register(nome, email, senha)`.

3.  **[Frontend]** A store de autentica��o faz a requisi��o para a API.
    -   `stores/auth.ts` chama `api.post('/api/auth/register', { nome, email, senha })`.
    -   `services/api.ts` (Axios) envia a requisi��o HTTP POST.
    -   O estado `conversations` � atualizado para mostrar a nova mensagem e o contador de n�o lidas.
    -   A interface do `FloatingChat.vue` � atualizada reativamente.

---

## ?? Funcionalidade 5: Login de Usu�rio Existente

**Objetivo:** Um usu�rio j� cadastrado acessa sua conta.

1.  **[Frontend]** Usu�rio acessa a p�gina `/login`.
    -   `router/index.ts` carrega o componente `LoginView.vue`.

2.  **[Frontend]** Usu�rio preenche o formul�rio (email, senha) e clica em "Entrar".
    -   `LoginView.vue` chama a a��o `authStore.login(email, senha)`.

3.  **[Frontend]** A store de autentica��o faz a requisi��o.
    -   `stores/auth.ts` chama `api.post('/api/auth/login', { email, senha })`.

4.  **[Backend]** O servidor recebe a requisi��o.
    -   `routes/index.ts` direciona `POST /api/auth/login` para `userController.login`.

5.  **[Backend]** O controller delega para o service.
    -   `controllers/user.controller.ts` chama `userService.login(email, senha)`.

6.  **[Backend]** O service executa a l�gica de autentica��o.
    -   `services/user.service.ts`:
        -   Busca o usu�rio pelo email no banco (`UserRepository.findOne`).
        -   Se o usu�rio existe, compara a senha fornecida com o hash salvo usando `bcrypt.compare`.
        -   Se a senha for v�lida, gera um novo token JWT.
        -   Retorna o usu�rio e o token.

7.  **[Backend]** O controller envia a resposta com `{ user, token }` e status 200.

8.  **[Frontend]** A store `auth.ts` recebe a resposta, salva o token no `localStorage`, atualiza o estado e redireciona o usu�rio para a p�gina principal.

---

## ??? Funcionalidade 6: Gerenciamento de Itens (Dele��o)

**Objetivo:** Um usu�rio remove um item que n�o deseja mais trocar.

1.  **[Frontend]** Usu�rio acessa a p�gina `/meus-itens`.
    -   `MyItemsView.vue` � carregado e chama `itemStore.fetchMyItems()`.
    -   A store busca os itens do usu�rio via `GET /api/items/my` e os exibe.

2.  **[Frontend]** Usu�rio clica no bot�o "Deletar" de um dos seus itens.
    -   Um modal de confirma��o � exibido.
    -   Ao confirmar, o componente chama `itemStore.deleteItem(itemId)`.

3.  **[Frontend]** A store de itens envia a requisi��o.
    -   `stores/item.ts` chama `api.delete('/api/items/:id')`.
    -   O interceptor do Axios anexa o token de autentica��o.

4.  **[Backend]** O servidor recebe a requisi��o.
    -   `routes/index.ts` direciona `DELETE /api/items/:id` para `authMiddleware` e depois `itemController.delete`.

5.  **[Backend]** O controller delega para o service.
    -   `controllers/item.controller.ts` extrai `itemId` dos par�metros e `userId` e `userRole` do `req.user`.
    -   Chama `itemService.delete(itemId, userId, userRole)`.

6.  **[Backend]** O service executa a l�gica de dele��o.
    -   `services/item.service.ts`:
        -   Busca o item no banco.
        -   Verifica se o `userId` corresponde ao `ownerId` do item (ou se o `userRole` � 'admin').
        -   Realiza um "soft delete" (marca o item como deletado, preenchendo o campo `deletedAt`, em vez de remov�-lo fisicamente).

7.  **[Backend]** O controller envia uma resposta de sucesso (ex: status 204 No Content).

8.  **[Frontend]** A store `item.ts` recebe a confirma��o, remove o item da lista local (`myItems`) e exibe uma notifica��o de sucesso.

---

## ??? Funcionalidade 7: Fluxo Administrativo (Alterar Role de Usu�rio)

**Objetivo:** Um administrador promove um usu�rio comum para "verificado".

1.  **[Frontend]** Um usu�rio admin acessa o dashboard em `/admin`.
    -   `AdminView.vue` � carregado e busca a lista de todos os usu�rios via `api.get('/api/users')`.

2.  **[Frontend]** O admin encontra um usu�rio na lista e clica em "Alterar Role", selecionando a nova role (ex: 'verified').
    -   O componente chama uma fun��o que envia a requisi��o para a API: `api.patch('/api/users/:id/role', { role: 'verified' })`.

3.  **[Backend]** O servidor recebe a requisi��o.
    -   `routes/index.ts` direciona `PATCH /api/users/:id/role` para a sequ�ncia:
        1.  `authMiddleware` (valida o token).
        2.  `requireAdmin` (valida se o usu�rio � admin).
        3.  `userController.updateRole`.

4.  **[Backend]** O controller delega para o service.
    -   `controllers/user.controller.ts` chama `userService.updateRole(userId, newRole)`.

5.  **[Backend]** O service executa a l�gica.
    -   `services/user.service.ts` busca o usu�rio pelo ID e atualiza seu campo `role` no banco de dados.

6.  **[Frontend]** O `AdminView.vue` recebe a confirma��o, atualiza a lista de usu�rios na tela e exibe uma mensagem de sucesso.

4*  **[Backend]** O servidor recebe a requisi��o.
    -   `routes/index.ts` direciona `POST /api/auth/register` para `userController.register`.

5.  **[Backend]** O controller delega para o service.
    -   `controllers/user.controller.ts` chama `userService.register(nome, email, senha)`.

6.  **[Backend]** O service executa a l�gica de neg�cio.
    -   `services/user.service.ts`:
        -   Valida os dados.
        -   Verifica se o email j� existe no banco (`UserRepository.findOne`).
        -   Cria um hash da senha com `bcrypt`.
        -   Salva o novo usu�rio no banco de dados (`UserRepository.save`).
        -   Gera um token JWT com o ID e role do novo usu�rio.
        -   Retorna o usu�rio criado e o token.

7.  **[Backend]** O controller envia a resposta.
    -   `user.controller.ts` retorna um JSON com `{ user, token }` e status 201.

8.  **[Frontend]** A store recebe a resposta.
    -   `stores/auth.ts`:
        -   Salva o token no `localStorage`.
        -   Atualiza seu estado interno (`user`, `token`, `isAuthenticated`).
        -   Redireciona o usu�rio para a p�gina principal (`/`).

---

## ?? Funcionalidade 2: Cria��o de um Novo Item

**Objetivo:** Um usu�rio autenticado cadastra um novo item para troca.

1.  **[Frontend]** Usu�rio clica em "Novo Item" e acessa a p�gina `/novo-item`.
    -   `router/index.ts` carrega `NewItemView.vue`.

2.  **[Frontend]** Usu�rio preenche o formul�rio (t�tulo, descri��o, categoria, imagens).
    -   `NewItemView.vue` monta um objeto `FormData` com os dados e os arquivos de imagem.
    -   Ao submeter, chama `itemStore.createItem(formData)`.

3.  **[Frontend]** A store de itens faz a requisi��o.
    -   `stores/item.ts` chama `api.post('/api/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } })`.
    -   `services/api.ts` envia a requisi��o HTTP POST. O interceptor adiciona o token de autentica��o no header.

4.  **[Backend]** O servidor recebe a requisi��o.
    -   `routes/index.ts` direciona `POST /api/items` para a sequ�ncia:
        1.  `authMiddleware` (valida o token JWT).
        2.  `upload.array('imagens')` (middleware Multer para processar o upload dos arquivos).
        3.  `itemController.create`.

5.  **[Backend]** O controller delega para o service.
    -   `controllers/item.controller.ts` extrai os dados do `req.body`, os arquivos de `req.files` e o `userId` do `req.user`.
    -   Chama `itemService.create(userId, data, files)`.

6.  **[Backend]** O service executa a l�gica de neg�cio.
    -   `services/item.service.ts`:
        -   Valida os dados do item.
        -   Mapeia os arquivos de imagem para URLs (ex: `/uploads/nome-arquivo.jpg`).
        -   Cria a entidade `Item` com os dados e as URLs das imagens.
        -   Salva o novo item no banco de dados (`ItemRepository.save`).
        -   Retorna o item criado.

7.  **[Backend]** O controller envia a resposta com o item criado e status 201.

8.  **[Frontend]** A store recebe a resposta.
    -   `stores/item.ts` exibe uma notifica��o de sucesso e redireciona o usu�rio para a p�gina de seus itens (`/meus-itens`).

---

## ?? Funcionalidade 3: Fazer e Aceitar uma Proposta

**Objetivo:** Usu�rio A faz uma proposta por um item do Usu�rio B, que por sua vez aceita.

### Parte A: Fazer a Proposta

1.  **[Frontend]** Usu�rio A est� na p�gina de detalhes de um item do Usu�rio B (`/items/:id`) e clica em "Fazer Proposta".
    -   `ItemDetailsView.vue` abre um modal onde o Usu�rio A seleciona um de seus itens para oferecer em troca.
    -   Ao confirmar, chama `proposalStore.createProposal({ itemDesejadoId, itemOferecidoId, mensagem })`.

2.  **[Frontend]** A store de propostas envia a requisi��o.
    -   `stores/proposal.ts` chama `api.post('/api/proposals', data)`.

3.  **[Backend]** O servidor recebe a requisi��o.
    -   `routes/index.ts` direciona `POST /api/proposals` para `authMiddleware` e depois `proposalController.create`.

4*  **[Backend]** O controller chama o service.
    -   `controllers/proposal.controller.ts` chama `proposalService.create(data)`.

5.  **[Backend]** O service executa a l�gica.
    -   `services/proposal.service.ts`:
        -   Valida os dados.
        -   Cria a entidade `Proposal` no banco (`ProposalRepository.save`).
        -   Chama `notificationService.notifyNewProposal()` para criar uma notifica��o para o Usu�rio B.

6.  **[Backend]** O `notificationService` cria a notifica��o.
    -   `services/notification.service.ts` salva uma nova `Notification` no banco para o Usu�rio B.
    -   **(Futuro/WebSocket)**: Poderia emitir um evento WebSocket para notificar o Usu�rio B em tempo real.

7.  **[Frontend]** `proposalStore` recebe a confirma��o e exibe uma mensagem de sucesso.

### Parte B: Aceitar a Proposta

1.  **[Frontend]** Usu�rio B acessa a p�gina `/propostas-recebidas`.
    -   `ReceivedProposalsView.vue` chama `proposalStore.fetchReceivedProposals()` que busca as propostas na API.

2.  **[Frontend]** Usu�rio B v� a proposta do Usu�rio A e clica em "Aceitar".
    -   O componente chama `proposalStore.respondToProposal(proposalId, 'aceita')`.

3.  **[Frontend]** A store envia a requisi��o.
    -   `stores/proposal.ts` chama `api.patch('/api/proposals/:id/respond', { status: 'aceita' })`.

4.  **[Backend]** O servidor recebe a requisi��o.
    -   `routes/index.ts` direciona `PATCH /api/proposals/:id/respond` para `authMiddleware` e `proposalController.respond`.

5.  **[Backend]** O controller chama o service.
    -   `controllers/proposal.controller.ts` chama `proposalService.respond(proposalId, userId, 'aceita')`.

6.  **[Backend]** O service executa a l�gica.
    -   `services/proposal.service.ts`:
        -   Atualiza o status da `Proposal` para 'aceita'.
        -   Atualiza o status de ambos os `Item` envolvidos para 'indisponivel'.
        -   Chama `notificationService.notifyProposalAccepted()` para notificar o Usu�rio A.

7.  **[Frontend]** `proposalStore` recebe a confirma��o.
    -   Exibe uma mensagem de sucesso.
    -   Chama `chatStore.openChatWithConversation(proposerId, itemId)` para iniciar automaticamente o chat entre os usu�rios.

---

## ?? Funcionalidade 4: Troca de Mensagens em Tempo Real

**Objetivo:** Usu�rio A e Usu�rio B conversam via chat ap�s a proposta ser aceita.

1.  **[Frontend]** A aplica��o � iniciada.
    -   `main.ts` chama `chatStore.connect()`.
    -   `stores/chat.ts` estabelece uma conex�o WebSocket com o servidor, enviando o token JWT para autentica��o.

2.  **[Backend]** O servidor WebSocket recebe a conex�o.
    -   `websocket/chat.socket.ts` usa um middleware para validar o token JWT.
    -   Se v�lido, armazena o `socket.id` associado ao `userId` e coloca o socket em uma "sala" (`room`) privada (ex: `user:123`).

3.  **[Frontend]** Usu�rio A envia uma mensagem para o Usu�rio B.
    -   `FloatingChat.vue` chama `chatStore.sendMessage(receiverId, itemId, 'Ol�!')`.
    -   `stores/chat.ts` emite um evento WebSocket: `socket.emit('message:send', { ... })`.

4*  **[Backend]** O `ChatSocketHandler` recebe o evento.
    -   `websocket/chat.socket.ts` no handler de `'message:send'`:
        -   Chama `chatService.createMessage()` para salvar a mensagem no banco.

5.  **[Backend]** O `chatService` salva a mensagem.
    -   `services/chat.service.ts` cria uma nova `ChatMessage` no banco de dados, ligando `senderId`, `receiverId` e `itemId`.

6.  **[Backend]** O `ChatSocketHandler` retransmite a mensagem.
    -   Envia o evento `'message:received'` para a sala do destinat�rio (Usu�rio B): `io.to('user:456').emit('message:received', message)`.
    -   Envia o mesmo evento para o remetente (Usu�rio A) como confirma��o.

7.  **[Frontend]** O `chatStore` do Usu�rio B (e do A) recebe o evento.
    -   O listener para `'message:received'` em `stores/chat.ts` � acionado.
    -   A nova mensagem � adicionada ao estado `currentMessages` (se a janela estiver aberta).
    -   O estado `conversations` � atualizado para mostrar a nova mensagem e o contador de n�o lidas.
    -   A interface do `FloatingChat.vue` � atualizada reativamente.



