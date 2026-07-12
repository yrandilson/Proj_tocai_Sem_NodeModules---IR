<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Simula��o de Funcionamento das Novas Funcionalidades

Este documento apresenta um fluxo de simula��o para testar as 8 novas funcionalidades implementadas no projeto Tocai.

## 1. Configura��o Inicial

**Pr�-requisito:** O servidor backend deve estar rodando e o frontend deve estar acess�vel (ex: `http://localhost:5173`).

### Cen�rio Base
*   **Usu�rio A (Comum):** `user_a@example.com`
*   **Usu�rio B (Admin):** `admin_b@example.com`
*   **Item X:** Item cadastrado pelo Usu�rio A, com `latitude` e `longitude` definidos.
*   **Item Y:** Item cadastrado pelo Usu�rio B.

## 2. Simula��o das Funcionalidades P1

### 2.1. Filtro de Busca por Localiza��o (Raio)
**Objetivo:** Verificar se o Usu�rio A consegue filtrar itens pr�ximos a ele.

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio A acessa a p�gina inicial (`/`). | O frontend tenta obter a geolocaliza��o do navegador. |
| 2 | Na barra de busca, Usu�rio A insere um `raio` pequeno (ex: 5 km). | A busca � disparada com `search`, `latitude`, `longitude` e `raio` no `ItemService`. |
| 3 | Usu�rio A insere um `raio` grande (ex: 100 km). | A busca retorna itens dentro do raio de 100 km, incluindo o Item X. |
| 4 | Usu�rio A insere um `raio` 0. | A busca deve ignorar o filtro de localiza��o ou retornar um erro (dependendo da valida��o, mas o frontend envia `raio > 0`). |

### 2.2. Sistema de Feedback Detalhado
**Objetivo:** Avaliar a experi�ncia de troca com campos detalhados.

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio A e Usu�rio B completam uma troca (Proposta Aceita). | O bot�o "Avaliar Troca" fica dispon�vel na lista de propostas do Usu�rio A. |
| 2 | Usu�rio A clica em "Avaliar Troca" para o Usu�rio B. | O modal de avalia��o � aberto, exibindo os campos de estrelas, coment�rio e os 4 checkboxes de feedback detalhado. |
| 3 | Usu�rio A preenche as estrelas, o coment�rio e marca/desmarca os checkboxes. | Ao enviar, o `RatingController` no backend recebe e salva todos os campos (estrelas, coment�rio e os 4 booleanos). |
| 4 | Usu�rio B acessa seu perfil. | A m�dia de estrelas e os dados dos feedbacks detalhados (se houver uma view para isso) s�o atualizados. |

### 2.3. Notifica��o de "Item Favorito Dispon�vel"
**Objetivo:** Notificar usu�rios que favoritaram um item que estava indispon�vel.

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio B marca o Item X (do Usu�rio A) como favorito. | O registro de favorito � criado no banco de dados. |
| 2 | Usu�rio A altera o status do Item X para `TROCADO` (indispon�vel). | O item fica indispon�vel para troca. |
| 3 | Usu�rio A altera o status do Item X de volta para `DISPONIVEL`. | O `ItemService` detecta a mudan�a para `DISPONIVEL` e dispara a notifica��o para o Usu�rio B. |
| 4 | Usu�rio B verifica suas notifica��es. | Recebe uma notifica��o: "O Item X est� novamente dispon�vel para troca!". |

## 3. Simula��o das Funcionalidades P2

### 3.1. Verifica��o de Identidade (Verified User)
**Objetivo:** Um administrador verifica a identidade de um usu�rio.

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio B (Admin) faz login. | Login bem-sucedido. |
| 2 | Usu�rio B (Admin) envia uma requisi��o `PATCH` para `/api/users/{id_usuario_a}/verify`. | O `UserController` chama o `UserService`, que altera o `role` do Usu�rio A para `VERIFIED`. |
| 3 | Usu�rio A verifica seu perfil. | O perfil do Usu�rio A exibe o selo de "Usu�rio Verificado". |

### 3.2. Bloqueio de Usu�rio
**Objetivo:** Um administrador bloqueia um usu�rio.

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio B (Admin) envia uma requisi��o `PATCH` para `/api/users/{id_usuario_a}/block` com `{"isBlocked": true}`. | O `UserController` chama o `UserService`, que define `isBlocked = true` para o Usu�rio A. |
| 2 | Usu�rio A tenta fazer login. | O `UserService` impede o login e retorna um erro de "Usu�rio Bloqueado". |
| 3 | Usu�rio B (Admin) envia uma requisi��o `PATCH` para `/api/users/{id_usuario_a}/block` com `{"isBlocked": false}`. | O `UserService` define `isBlocked = false` para o Usu�rio A. |
| 4 | Usu�rio A tenta fazer login novamente. | Login bem-sucedido. |

### 3.3. Hist�rico de Status de Den�ncias
**Objetivo:** Rastrear as mudan�as de estado de uma den�ncia.

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio A cria uma den�ncia contra o Item Y (do Usu�rio B). | A den�ncia � criada com `status: PENDENTE`. |
| 2 | Usu�rio B (Admin) atualiza o status da den�ncia para `EM_ANALISE` com a a��o "Designado para o analista X". | O `ReportService` registra uma entrada em `ReportHistory`: `statusAnterior: PENDENTE`, `statusNovo: EM_ANALISE`, `actionTaken: "Designado para o analista X"`. |
| 3 | Usu�rio B (Admin) atualiza o status da den�ncia para `RESOLVIDA` com a a��o "Item removido por violar termos". | O `ReportService` registra uma segunda entrada em `ReportHistory`: `statusAnterior: EM_ANALISE`, `statusNovo: RESOLVIDA`, `actionTaken: "Item removido por violar termos"`. |
| 4 | Um endpoint administrativo busca o hist�rico da den�ncia. | O hist�rico completo de status (`ReportHistory`) � retornado. |

## 4. Simula��o das Funcionalidades P3

### 4.1. Otimiza��o de Busca (Full-Text Search)
**Objetivo:** Buscar itens por palavras-chave no t�tulo e na descri��o.

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio A busca por uma palavra-chave que est� apenas na `descricao` do Item Y. | O `ItemService` usa a cl�usula `WHERE (titulo LIKE :search OR descricao LIKE :search)`. |
| 2 | A busca retorna o Item Y (mesmo que a palavra-chave n�o esteja no t�tulo). | A busca � mais abrangente, validando a otimiza��o. |

### 4.2. Arquivamento Autom�tico de Conversas
**Objetivo:** Arquivar uma conversa (soft-delete).

| Passo | A��o | Resultado Esperado |
| :--- | :--- | :--- |
| 1 | Usu�rio A e Usu�rio B trocam mensagens sobre o Item X. | Mensagens s�o salvas no banco de dados. |
| 2 | Usu�rio A clica no bot�o "Arquivar Conversa" na janela de chat. | O `ChatStore` chama a rota `DELETE /api/chat/conversations/{otherUserId}/{itemId}`. |
| 3 | O `ChatService` no backend realiza um `softRemove` nas mensagens da conversa. | O campo `deletedAt` das mensagens � preenchido com a data atual. |
| 4 | Usu�rio A recarrega a lista de conversas. | A conversa arquivada n�o aparece na lista, pois o `ChatService` n�o retorna mensagens com `deletedAt` preenchido. |
| 5 | Um administrador busca as mensagens arquivadas. | As mensagens ainda existem no banco de dados, mas est�o marcadas como exclu�das. |

---
**Observa��o:** O "autom�tico" no requisito 4.2 � a capacidade de arquivar. A automa��o real (ex: cron job) � uma etapa de infraestrutura que n�o est� no escopo da implementa��o de funcionalidades do projeto. O que foi implementado � o mecanismo de arquivamento (soft-delete).




