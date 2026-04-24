<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Arquitetura e Funcionamento do Sistema Proj_tocai

**Autor:** Manus AI
**Data:** 26 de Outubro de 2025
**Revis�o:** 1.0

## 1. Arquitetura Geral

O Proj_tocai adota uma arquitetura de **Microservi�os** (ou Monolito Modular) com separa��o clara entre **Frontend** e **Backend**, comunicando-se atrav�s de uma API RESTful e WebSockets.

### 1.1. Componentes Principais

| Componente | Tecnologia | Fun��o Principal |
| :--- | :--- | :--- |
| **Frontend** | Vue.js 3, TypeScript, Pinia, Vite | Interface do Usu�rio (UI/UX), gerenciamento de estado local, roteamento de SPA. |
| **Backend** | Node.js, Express, TypeScript, TypeORM | L�gica de Neg�cios, API RESTful, Servidor de WebSockets, Autentica��o, Acesso ao Banco de Dados. |
| **Banco de Dados** | PostgreSQL (ou SQLite para desenvolvimento) | Persist�ncia de dados (Usu�rios, Itens, Propostas, Den�ncias, etc.). |
| **Servi�o de Upload** | Local (`/uploads`) | Armazenamento de imagens dos itens. |

## 2. Funcionamento do Backend (API e L�gica de Neg�cios)

O Backend � o cora��o do sistema, respons�vel por toda a l�gica de neg�cios e persist�ncia de dados.

### 2.1. Camadas de Servi�o

O Backend � estruturado em camadas para promover a separa��o de responsabilidades:

1.  **Rotas (Routes):** Define os endpoints da API (`/users`, `/items`, `/proposals`, etc.). Utiliza *middlewares* para autentica��o (`authMiddleware`) e autoriza��o (`roleMiddleware`).
2.  **Controladores (Controllers):** Recebem as requisi��es, validam os dados de entrada (usando DTOs e `validation.middleware`), e chamam os m�todos apropriados nos *Services*.
3.  **Servi�os (Services):** Cont�m a **l�gica de neg�cios** principal. Interagem com o *TypeORM* para manipular as *Entidades* e o Banco de Dados.
4.  **Entidades (Entities):** Modelos de dados que representam as tabelas do Banco de Dados (ex: `User`, `Item`, `Proposal`).

### 2.2. Fluxo de Autentica��o

1.  O usu�rio envia credenciais (`email`, `senha`) para `POST /auth/login`.
2.  O `AuthController` chama o `AuthService` para verificar as credenciais.
3.  O `AuthService` gera um **JSON Web Token (JWT)** contendo o `userId` e `userRole`.
4.  O token � retornado ao Frontend, que o armazena e o envia no cabe�alho `Authorization: Bearer <token>` em todas as requisi��es protegidas.
5.  O `authMiddleware` intercepta o token, valida-o e injeta o `userId` e `userRole` no objeto `Request` antes de passar para o Controller.

### 2.3. Fluxo de Notifica��o de Match (Melhorado)

A funcionalidade de Match ocorre de forma **ass�ncrona** ap�s o cadastro de um novo item, garantindo que a resposta ao usu�rio seja r�pida.

| Etapa | A��o | Componente Envolvido |
| :--- | :--- | :--- |
| **1. Cria��o do Item** | Usu�rio cadastra Item A. | `ItemController` -> `ItemService.create` |
| **2. Busca Ass�ncrona** | `ItemService.create` chama `setImmediate(findMatchesAndNotify(Item A))`. | `ItemService` |
| **3. Query de Match** | `findMatchesAndNotify` busca todos os Itens B que listam o t�tulo de Item A em suas prefer�ncias. | `TypeORM` (Query Builder) |
| **4. Verifica��o Bidirecional** | Para cada Item B encontrado, verifica se Item A tamb�m lista o t�tulo de Item B em suas prefer�ncias. | `ItemService` (L�gica de Neg�cios) |
| **5. Notifica��o** | O `NotificationService` � acionado para enviar a notifica��o persistente para o Banco de Dados e, via WebSocket, para o Frontend. | `NotificationService`, `ChatSocketHandler` |
| **6. Notifica��o Bidirecional** | Se o Match for Perfeito, notifica o dono de Item A e o dono de Item B com uma mensagem especial. | `NotificationService` |

## 3. Funcionamento do Frontend (Interface do Usu�rio)

O Frontend � uma Single Page Application (SPA) que utiliza o Vue.js e o Pinia para gerenciar o estado global.

### 3.1. Gerenciamento de Estado (Pinia)

| Store | Responsabilidade |
| :--- | :--- |
| `auth.ts` | Estado de autentica��o, dados do usu�rio logado. |
| `item.ts` | Busca, cria��o, edi��o e listagem de itens. |
| `proposal.ts` | Gest�o de propostas enviadas e recebidas. |
| `favorite.ts` | Lista de itens favoritos do usu�rio. |
| `notification.ts` | Notifica��es recebidas e status de leitura. |
| `chat.ts` | Conversas e mensagens em tempo real (WebSockets). |
| `admin.ts` | Fun��es de administra��o (usu�rios, den�ncias, avalia��es). |

### 3.2. Comunica��o em Tempo Real

O Frontend mant�m uma conex�o WebSocket persistente com o Backend.

*   **Chat:** Mensagens s�o enviadas e recebidas em tempo real.
*   **Notifica��es:** Novas propostas, aceites/recusas de propostas, e Matches s�o enviados instantaneamente para o usu�rio via WebSocket, atualizando a `notification.ts` store.





