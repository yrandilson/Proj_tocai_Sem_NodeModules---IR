<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Responsabilidades dos Arquivos - TrocaAi

Este documento descreve a responsabilidade principal de cada arquivo no projeto TrocaAi, tanto no frontend quanto no backend.

---

## ?? FRONTEND (Vue.js + TypeScript)

**Arquivos de Configura��o:**

*   `frontend/package.json`: Define as depend�ncias do projeto, scripts de build, etc.
*   `frontend/vite.config.ts`: Configura��o do Vite, o bundler do frontend.
*   `frontend/tsconfig.json`: Configura��o do compilador TypeScript.
*   `frontend/tsconfig.node.json`: Configura��es espec�ficas do Node para o Typescript
*   `frontend/tailwind.config.js`: Configura��o do Tailwind CSS (estilos).
*   `frontend/postcss.config.js`: Configura��o do PostCSS (processamento de CSS).

**Arquivos Principais:**

*   `frontend/index.html`: Ponto de entrada da aplica��o web.
*   `frontend/src/main.ts`: Inicializa a aplica��o Vue, configura Pinia (store), Vue Router e monta a aplica��o no DOM.
*   `frontend/src/App.vue`: Componente raiz da aplica��o, define o layout geral (header, footer, router-view).

**Assets:**

*   `frontend/src/assets/main.css`: Estilos globais da aplica��o.

**Componentes (Reutiliz�veis):**

*   `frontend/src/components/AppHeader.vue`: Componente do cabe�alho, cont�m a navega��o principal, logo e dropdown do usu�rio.
*   `frontend/src/components/AppFooter.vue`: Componente do rodap�, cont�m links �teis e informa��es de copyright.
*   `frontend/src/components/ItemCard.vue`: Componente para exibir um item de troca em formato de cart�o.
*   `frontend/src/components/FloatingChat.vue`: Janela de chat flutuante.

**Views (P�ginas):**

*   `frontend/src/views/HomeView.vue`: P�gina inicial, lista os itens dispon�veis para troca.
*   `frontend/src/views/LoginView.vue`: P�gina de login.
*   `frontend/src/views/RegisterView.vue`: P�gina de registro de novos usu�rios.
*   `frontend/src/views/ItemDetailsView.vue`: P�gina de detalhes de um item espec�fico.
*   `frontend/src/views/MyItemsView.vue`: P�gina para o usu�rio gerenciar seus pr�prios itens.
*   `frontend/src/views/NewItemView.vue`: P�gina para cadastrar um novo item.
*   `frontend/src/views/EditItemView.vue`: P�gina para editar um item existente.
*   `frontend/src/views/MyProposalsView.vue`: P�gina para visualizar as propostas enviadas pelo usu�rio.
*   `frontend/src/views/ReceivedProposalsView.vue`: P�gina para visualizar as propostas recebidas pelo usu�rio.
*   `frontend/src/views/ProfileView.vue`: P�gina de perfil do usu�rio logado.
*   `frontend/src/views/AdminView.vue`: Painel administrativo (acesso restrito).
*   `frontend/src/views/NotFoundView.vue`: Exibe uma mensagem de "P�gina n�o encontrada".
*   `frontend/src/views/MapView.vue`: Exibe os itens em um mapa.

**Router:**

*   `frontend/src/router/index.ts`: Define as rotas da aplica��o e associa cada rota a um componente de View.

**Pinia Stores (Gerenciamento de Estado):**

*   `frontend/src/stores/auth.ts`: Gerencia o estado de autentica��o do usu�rio (login, registro, logout, informa��es do usu�rio).
*   `frontend/src/stores/item.ts`: Gerencia o estado dos itens (lista de itens, item atual, pagina��o).
*   `frontend/src/stores/proposal.ts`: Gerencia o estado das propostas de troca (propostas enviadas, propostas recebidas).
*   `frontend/src/stores/chat.ts`: Gerencia o estado do chat em tempo real (conex�o WebSocket, conversas, mensagens).
*   `frontend/src/stores/notification.ts`: Gerencia o estado das notifica��es do usu�rio.

**Services:**

*   `frontend/src/services/api.ts`: Abstrai a comunica��o com a API do backend (requisi��es HTTP usando Axios).

**Types:**
*   `frontend/src/types/index.ts`: Define as interfaces e tipos de dados usados no frontend (ex: User, Item, Proposal).

---

## ?? BACKEND (Node.js + Express + TypeORM)

**Arquivos de Configura��o:**

*   `backend/package.json`: Define as depend�ncias do projeto, scripts de build, etc.
*   `backend/tsconfig.json`: Configura��o do compilador TypeScript.
*   `backend/.env.example`: Vari�veis de ambiente (exemplo).
*   `backend/src/config/database.ts`: Configura a conex�o com o banco de dados (TypeORM).

**Arquivos Principais:**

*   `backend/src/server.ts`: Inicializa o servidor Express, configura middlewares, rotas e inicia o servidor.
*   `backend/src/routes/index.ts`: Define as rotas da API e associa cada rota a um controller.

**Middlewares:**

*   `backend/src/middlewares/auth.middleware.ts`: Middleware para autentica��o (verifica o token JWT).

**Controllers:**

*   `backend/src/controllers/user.controller.ts`: Lida com as requisi��es relacionadas a usu�rios (registro, login, perfil, admin).
*   `backend/src/controllers/item.controller.ts`: Lida com as requisi��es relacionadas a itens (listagem, cria��o, edi��o, dele��o).
*   `backend/src/controllers/proposal.controller.ts`: Lida com as requisi��es relacionadas a propostas de troca (cria��o, aceita��o, rejei��o).
*   `backend/src/controllers/chat.controller.ts`: Lida com as requisi��es relacionadas ao chat (conversas, mensagens).
*   `backend/src/controllers/notification.controller.ts`: Lida com as requisi��es relacionadas a notifica��es.

**Services:**

*   `backend/src/services/user.service.ts`: Cont�m a l�gica de neg�cio para usu�rios.
*   `backend/src/services/item.service.ts`: Cont�m a l�gica de neg�cio para itens.
*   `backend/src/services/proposal.service.ts`: Cont�m a l�gica de neg�cio para propostas de troca.
*   `backend/src/services/chat.service.ts`: Cont�m a l�gica de neg�cio para o chat.
*   `backend/src/services/notification.service.ts`: Cont�m a l�gica de neg�cio para notifica��es.

**Entities (TypeORM):**

*   `backend/src/entities/User.ts`: Define a entidade "Usu�rio" no banco de dados.
*   `backend/src/entities/Item.ts`: Define a entidade "Item" no banco de dados.
*   `backend/src/entities/Proposal.ts`: Define a entidade "Proposta" no banco de dados.
*   `backend/src/entities/ChatMessage.ts`: Define a entidade "Mensagem de Chat" no banco de dados.
*   `backend/src/entities/Notification.ts`: Define a entidade "Notifica��o" no banco de dados.
*   `backend/src/entities/Rating.ts`: Define a entidade "Avalia��o" no banco de dados.
*   `backend/src/entities/Report.ts`: Define a entidade "Den�ncia" no banco de dados.

**WebSockets:**
*   `backend/src/websocket/chat.socket.ts`: Lida com a comunica��o em tempo real do chat usando Socket.IO.

**Types:**
*   `backend/src/types/index.ts`: Define os tipos e interfaces usados no backend.

---

## ? Outros

*   `setup_trocaai.py`: Script Python para criar a estrutura inicial do projeto (n�o usado ap�s a cria��o da estrutura).
*   `trocaai_detailed_flow.md`: Descreve o fluxo completo da arquitetura do sistema.
*   `trocaai_feature_flows.md`: Descreve o fluxo de ponta a ponta das principais funcionalidades.
*   `trocaai_file_responsibilities.md`: (Este arquivo) Descreve a responsabilidade de cada arquivo no projeto.
*   `README.md`: Informa��es gerais sobre o projeto.
*   `DOCUMENTACAO.md`: Documenta��o completa do projeto.
*   `INSTALACAO.md`: Guia de instala��o e execu��o do projeto.
*   `MAPA_ARQUIVOS.txt`: Mapa de todos os arquivos do projeto (gerado pelo script `setup_trocaai.py`).



