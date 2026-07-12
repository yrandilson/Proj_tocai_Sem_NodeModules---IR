<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Mapeamento de Rotas e Endpoints (Backend)

Este documento lista os principais endpoints (rotas) da API do Proj_tocai, detalhando o m�todo HTTP, o caminho, a fun��o principal e o n�vel de acesso necess�rio (autentica��o e papel do usu�rio).

**Conven��es:**
*   `[Auth]` : Requer autentica��o de usu�rio (qualquer papel).
*   `[Admin]` : Requer autentica��o e o papel de `admin`.
*   `[Public]` : N�o requer autentica��o.
*   `{id}`: Par�metro din�mico na URL (ex: ID do usu�rio, item, etc.).

## 1. Rotas de Autentica��o (`/auth`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | `[Public]` | Cria uma nova conta de usu�rio. |
| `POST` | `/auth/login` | `[Public]` | Autentica o usu�rio e retorna um token JWT. |
| `GET` | `/auth/me` | `[Auth]` | Retorna os dados do usu�rio autenticado. |

## 2. Rotas de Usu�rios (`/users`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | `[Admin]` | Lista todos os usu�rios do sistema. |
| `GET` | `/users/{id}` | `[Public]` | Busca um usu�rio pelo ID (retorna dados p�blicos). |
| `PUT` | `/users/{id}` | `[Auth]` | Atualiza os dados do usu�rio (requer ser o pr�prio usu�rio). |
| `DELETE` | `/users/{id}` | `[Admin]` | Deleta um usu�rio. |
| `PATCH` | `/users/{id}/role` | `[Admin]` | Atualiza o papel (`role`) de um usu�rio. |

## 3. Rotas de Itens (`/items`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `GET` | `/items/categories` | `[Public]` | Retorna a lista de categorias de itens dispon�veis. |
| `GET` | `/items/my` | `[Auth]` | Lista os itens do usu�rio autenticado. |
| `GET` | `/items` | `[Public]` | Lista todos os itens dispon�veis, com filtros e pagina��o. |
| `GET` | `/items/{id}` | `[Public]` | Busca um item pelo ID. |
| `POST` | `/items` | `[Auth]` | Cria um novo item (com upload de imagens). |
| `PUT` | `/items/{id}` | `[Auth]` | Atualiza um item (requer ser o dono). |
| `DELETE` | `/items/{id}` | `[Auth]` | Deleta um item (requer ser o dono ou admin). |
| `PATCH` | `/items/{id}/status` | `[Auth]` | Atualiza o status de um item (requer ser o dono). |

## 4. Rotas de Propostas (`/proposals`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `POST` | `/proposals` | `[Auth]` | Cria uma nova proposta. |
| `GET` | `/proposals/sent` | `[Auth]` | Lista as propostas enviadas pelo usu�rio autenticado. |
| `GET` | `/proposals/received` | `[Auth]` | Lista as propostas recebidas para os itens do usu�rio autenticado. |
| `GET` | `/proposals/all` | `[Admin]` | Lista todas as propostas do sistema. |
| `GET` | `/proposals/item/{itemId}` | `[Public]` | Lista as propostas para um item espec�fico. |
| `PATCH` | `/proposals/{id}/status` | `[Auth]` | Atualiza o status de uma proposta (Aceitar/Recusar). |
| `DELETE` | `/proposals/{id}` | `[Auth]` | Deleta uma proposta enviada. |

## 5. Rotas de Favoritos (`/favorites`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `GET` | `/favorites` | `[Auth]` | Lista os itens favoritos do usu�rio autenticado. |
| `POST` | `/favorites/{itemId}` | `[Auth]` | Adiciona um item aos favoritos. |
| `DELETE` | `/favorites/{itemId}` | `[Auth]` | Remove um item dos favoritos. |

## 6. Rotas de Avalia��o (`/ratings`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `POST` | `/ratings` | `[Auth]` | Cria uma nova avalia��o ap�s uma troca conclu�da. |
| `GET` | `/ratings/user/{userId}` | `[Public]` | Lista as avalia��es recebidas por um usu�rio. |
| `GET` | `/ratings` | `[Admin]` | Lista todas as avalia��es do sistema. |

## 7. Rotas de Den�ncia (`/reports`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `POST` | `/reports` | `[Auth]` | Cria uma nova den�ncia (usu�rio ou item). |
| `GET` | `/reports` | `[Admin]` | Lista todas as den�ncias do sistema. |
| `PATCH` | `/reports/{id}/status` | `[Admin]` | Atualiza o status de uma den�ncia. |

## 8. Rotas de Notifica��o (`/notifications`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | `[Auth]` | Lista as notifica��es do usu�rio autenticado. |
| `PATCH` | `/notifications/{id}/read` | `[Auth]` | Marca uma notifica��o como lida. |

## 9. Rotas de Chat (`/chat`)

| M�todo | Caminho | Acesso | Descri��o |
| :--- | :--- | :--- | :--- |
| `GET` | `/chat/conversations` | `[Auth]` | Lista as conversas do usu�rio. |
| `GET` | `/chat/unread-count` | `[Auth]` | Retorna o n�mero de mensagens n�o lidas. |
| `GET` | `/chat/messages/{otherUserId}` | `[Auth]` | Busca as mensagens de uma conversa espec�fica. |
| `POST` | `/chat/read` | `[Auth]` | Marca as mensagens de uma conversa como lidas. |
| `DELETE` | `/chat/conversation/{otherUserId}/{itemId}` | `[Auth]` | Deleta uma conversa. |





