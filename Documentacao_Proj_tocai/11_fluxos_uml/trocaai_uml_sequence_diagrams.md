<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Diagramas de Sequ�ncia UML - TrocaAi

Este documento cont�m os diagramas de sequ�ncia UML para as principais funcionalidades do sistema, ilustrando a intera��o entre os componentes do frontend e backend.

---

## 1. Diagrama de Sequ�ncia: Cadastro de Novo Usu�rio

Este diagrama mostra o fluxo completo desde o momento em que um usu�rio preenche o formul�rio de registro at� a confirma��o de que sua conta foi criada e ele est� autenticado no sistema.

```mermaid
sequenceDiagram
    actor Usu�rio
    participant RegisterView as RegisterView.vue
    participant AuthStore as stores/auth.ts
    participant ApiService as services/api.ts
    participant BackendApi as Backend API
    participant UserService as services/user.service.ts
    participant Database as Banco de Dados

    Usu�rio->>+RegisterView: Preenche formul�rio e clica em "Cadastrar"
    RegisterView->>+AuthStore: chama register(dados)
    AuthStore->>+ApiService: post('/api/auth/register', dados)
    ApiService->>+BackendApi: [HTTP POST] /api/auth/register
    
    BackendApi->>+UserService: register(dados)
    UserService->>+Database: findOne({ where: { email } })
    Database-->>-UserService: (Email n�o existe)
    UserService->>UserService: Gera hash da senha (bcrypt)
    UserService->>+Database: save(novoUsuario)
    Database-->>-UserService: (Usu�rio salvo)
    UserService->>UserService: Gera Token JWT
    UserService-->>-BackendApi: Retorna { user, token }

    BackendApi-->>-ApiService: [HTTP 201] { user, token }
    ApiService-->>-AuthStore: (Resposta de sucesso)
    AuthStore->>AuthStore: Salva token no localStorage
    AuthStore->>AuthStore: Atualiza estado (user, isAuthenticated)
    AuthStore-->>-RegisterView: (Promise resolvida)
    RegisterView->>Usu�rio: Redireciona para a Home

```

---

## 2. Diagrama de Sequ�ncia: Fazer e Aceitar uma Proposta

Este � um fluxo mais complexo que envolve dois usu�rios e a intera��o com o sistema de notifica��es e chat.

### Parte A: Usu�rio A faz uma proposta

```mermaid
sequenceDiagram
    actor UserA as Usu�rio A
    participant ItemDetailsView as ItemDetailsView.vue
    participant ProposalStore as stores/proposal.ts
    participant ApiService as services/api.ts
    participant BackendApi as Backend API
    participant ProposalService as services/proposal.service.ts
    participant NotificationService as services/notification.service.ts
    participant WebSocket as WebSocket Server
    actor UserB as Usu�rio B

    UserA->>+ItemDetailsView: Clica em "Fazer Proposta" e preenche
    ItemDetailsView->>+ProposalStore: createProposal(dados)
    ProposalStore->>+ApiService: post('/api/proposals', dados)
    ApiService->>+BackendApi: [HTTP POST] /api/proposals

    BackendApi->>+ProposalService: create(dados)
    ProposalService->>ProposalService: Salva proposta no DB
    ProposalService->>+NotificationService: notifyNewProposal(dados)
    NotificationService->>NotificationService: Salva notifica��o no DB
    NotificationService->>+WebSocket: emit('proposal:new', notifData)
    WebSocket-->>UserB: [WS] Recebe notifica��o em tempo real
    NotificationService-->>-ProposalService: (Notifica��o criada)
    ProposalService-->>-BackendApi: (Proposta criada)

    BackendApi-->>-ApiService: [HTTP 201] (Sucesso)
    ApiService-->>-ProposalStore: (Promise resolvida)
    ProposalStore-->>-ItemDetailsView: (Sucesso)
    ItemDetailsView->>UserA: Exibe toast "Proposta enviada!"

```

### Parte B: Usu�rio B aceita a proposta

```mermaid
sequenceDiagram
    actor UserB as Usu�rio B
    participant ReceivedProposalsView as ReceivedProposalsView.vue
    participant ProposalStore as stores/proposal.ts
    participant ChatStore as stores/chat.ts
    participant ApiService as services/api.ts
    participant BackendApi as Backend API
    participant ProposalService as services/proposal.service.ts
    participant WebSocket as WebSocket Server
    actor UserA as Usu�rio A

    UserB->>+ReceivedProposalsView: Clica em "Aceitar"
    ReceivedProposalsView->>+ProposalStore: respondToProposal(id, 'aceita')
    ProposalStore->>+ApiService: patch('/api/proposals/:id/respond')
    ApiService->>+BackendApi: [HTTP PATCH] /api/proposals/:id/respond

    BackendApi->>+ProposalService: respond(id, 'aceita')
    ProposalService->>ProposalService: Atualiza status da Proposta e do Item no DB
    ProposalService->>ProposalService: Cria notifica��o para Usu�rio A
    ProposalService->>+WebSocket: emit('proposal:accepted', notifData)
    WebSocket-->>UserA: [WS] Recebe notifica��o de aceite
    ProposalService-->>-BackendApi: (Sucesso)

    BackendApi-->>-ApiService: [HTTP 200] (Sucesso)
    ApiService-->>-ProposalStore: (Promise resolvida)
    ProposalStore->>+ChatStore: openChatWithConversation(dados)
    ChatStore->>ChatStore: Define `conversationToOpen`
    Note over ChatStore: Sinaliza para o FloatingChat.vue abrir a conversa
    ChatStore-->>-ProposalStore: (A��o conclu�da)
    ProposalStore-->>-ReceivedProposalsView: (Sucesso)
    ReceivedProposalsView->>UserB: Exibe toast "Proposta aceita!" e recarrega lista

```

---

## 3. Diagrama de Sequ�ncia: Troca de Mensagens em Tempo Real (Chat)

Este diagrama detalha como a comunica��o via WebSocket funciona quando um usu�rio envia uma mensagem para outro.

```mermaid
sequenceDiagram
    actor UserA as Usu�rio A
    participant FloatingChat as FloatingChat.vue
    participant ChatStore as stores/chat.ts
    participant WebSocket as WebSocket Server
    participant ChatService as services/chat.service.ts
    participant Database as Banco de Dados
    actor UserB as Usu�rio B

    UserA->>+FloatingChat: Digita mensagem e clica "Enviar"
    FloatingChat->>+ChatStore: sendMessage(dados)
    
    ChatStore->>ChatStore: Adiciona mensagem localmente (Otimista)
    ChatStore->>+WebSocket: emit('message:send', dados)
    
    WebSocket->>+ChatService: createMessage(dados)
    ChatService->>+Database: save(novaMensagem)
    Database-->>-ChatService: (Mensagem salva)
    ChatService-->>-WebSocket: Retorna mensagem completa
    
    WebSocket->>WebSocket: Normaliza resposta
    
    alt Envia para Destinat�rio
        WebSocket->>UserB: [WS] emit('message:received', mensagem)
        UserB->>UserB: Recebe mensagem e atualiza UI
    end

    alt Envia para Remetente (Confirma��o)
        WebSocket-->>-ChatStore: [WS] emit('message:received', mensagem)
        ChatStore->>ChatStore: Atualiza mensagem tempor�ria com dados do servidor
        ChatStore-->>-FloatingChat: (UI j� est� atualizada)
    end

```

---

## 4. Diagrama de Sequ�ncia: Fluxo Administrativo (Deletar Usu�rio)

Este diagrama mostra como um administrador pode deletar um usu�rio e como o backend lida com a exclus�o em cascata de todos os dados relacionados a esse usu�rio.

```mermaid
sequenceDiagram
    actor Admin
    participant AdminView as AdminView.vue
    participant ApiService as services/api.ts
    participant BackendApi as Backend API
    participant AuthMiddleware as auth.middleware.ts
    participant UserService as services/user.service.ts
    participant Database as Banco de Dados

    Admin->>+AdminView: Clica em "Deletar Usu�rio"
    AdminView->>+ApiService: delete('/api/users/:id')
    ApiService->>+BackendApi: [HTTP DELETE] /api/users/:id

    BackendApi->>+AuthMiddleware: Verifica token e role de admin
    AuthMiddleware-->>-BackendApi: (Permiss�o concedida)

    BackendApi->>+UserService: delete(userId)
    note over UserService, Database: Inicia uma transa��o no banco de dados
    UserService->>+Database: Deleta den�ncias (Reports)
    Database-->>-UserService: (OK)
    UserService->>+Database: Deleta mensagens (ChatMessages)
    Database-->>-UserService: (OK)
    UserService->>+Database: Deleta avalia��es (Ratings)
    Database-->>-UserService: (OK)
    UserService->>+Database: Deleta notifica��es (Notifications)
    Database-->>-UserService: (OK)
    UserService->>+Database: Deleta propostas (Proposals)
    Database-->>-UserService: (OK)
    UserService->>+Database: Deleta itens (Items)
    Database-->>-UserService: (OK)
    UserService->>+Database: Deleta o usu�rio (User)
    Database-->>-UserService: (OK)
    note over UserService, Database: Commita a transa��o
    UserService-->>-BackendApi: (Sucesso)

    BackendApi-->>-ApiService: [HTTP 200] { message: 'Usu�rio deletado' }
    ApiService-->>-AdminView: (Promise resolvida)
    AdminView->>Admin: Exibe toast "Usu�rio deletado" e atualiza a lista

```



