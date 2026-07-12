<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Mapeamento de Entidades e Relacionamentos (Backend)

Este documento detalha as principais entidades do sistema Proj_tocai, seus atributos e os relacionamentos entre elas, servindo como base para a cria��o do Diagrama de Classes UML.

## 1. Entidade: User (Usu�rio)

Representa um usu�rio da plataforma.

| Atributo | Tipo | Descri��o |
| :--- | :--- | :--- |
| `id` | `number` | Chave prim�ria. |
| `nome` | `string` | Nome completo do usu�rio. |
| `email` | `string` | E-mail do usu�rio (�nico). |
| `senha` | `string` | Hash da senha. |
| `role` | `UserRole` | Papel do usu�rio (`admin`, `verified`, `common`). Padr�o: `common`. |
| `pushSubscription` | `string?` | Token para notifica��es push. |
| `createdAt` | `Date` | Data de cria��o do registro. |
| `updatedAt` | `Date` | Data da �ltima atualiza��o. |
| `deletedAt` | `Date?` | Data de exclus�o l�gica (soft delete). |

**Relacionamentos Chave:**

| Relacionamento | Entidade Relacionada | Tipo | Descri��o |
| :--- | :--- | :--- | :--- |
| `items` | `Item` | 1:N | Itens que o usu�rio possui. |
| `proposals` | `Proposal` | 1:N | Propostas que o usu�rio fez. |
| `notifications` | `Notification` | 1:N | Notifica��es recebidas pelo usu�rio. |
| `receivedRatings` | `Rating` | 1:N | Avalia��es recebidas (`toUser`). |
| `givenRatings` | `Rating` | 1:N | Avalia��es feitas (`fromUser`). |
| `madeReports` | `Report` | 1:N | Den�ncias feitas (`reporter`). |
| `receivedReports` | `Report` | 1:N | Den�ncias recebidas (`reportedUser`). |

## 2. Entidade: Item

Representa um item dispon�vel para troca na plataforma.

| Atributo | Tipo | Descri��o |
| :--- | :--- | :--- |
| `id` | `number` | Chave prim�ria. |
| `ownerId` | `number` | ID do dono do item (Foreign Key para `User`). |
| `titulo` | `string` | T�tulo do item. |
| `descricao` | `string` | Descri��o detalhada. |
| `categoria` | `string?` | Categoria do item. |
| `status` | `ItemStatus` | Status do item (`disponivel`, `em_negociacao`, `trocado`). Padr�o: `disponivel`. |
| `latitude`, `longitude` | `number?` | Coordenadas de localiza��o. |
| `createdAt`, `updatedAt`, `deletedAt` | `Date` | Datas de controle. |

**Relacionamentos Chave:**

| Relacionamento | Entidade Relacionada | Tipo | Descri��o |
| :--- | :--- | :--- | :--- |
| `owner` | `User` | N:1 | O dono do item. |
| `imagens` | `Image` | 1:N | Imagens associadas ao item. |
| `tradePreferences` | `TradePreference` | 1:N | Prefer�ncias de troca do dono para este item. |
| `proposals` | `Proposal` | 1:N | Propostas recebidas para este item. |
| `reports` | `Report` | 1:N | Den�ncias feitas sobre este item. |

## 3. Entidade: Proposal (Proposta)

Representa uma proposta de troca feita por um usu�rio para um item.

| Atributo | Tipo | Descri��o |
| :--- | :--- | :--- |
| `id` | `number` | Chave prim�ria. |
| `itemId` | `number` | ID do item alvo da proposta (Foreign Key para `Item`). |
| `proposerId` | `number` | ID do usu�rio que fez a proposta (Foreign Key para `User`). |
| `mensagem` | `string` | Mensagem da proposta. |
| `status` | `ProposalStatus` | Status da proposta (`pendente`, `aceita`, `recusada`). Padr�o: `pendente`. |
| `createdAt`, `updatedAt` | `Date` | Datas de controle. |

**Relacionamentos Chave:**

| Relacionamento | Entidade Relacionada | Tipo | Descri��o |
| :--- | :--- | :--- | :--- |
| `item` | `Item` | N:1 | O item alvo da proposta. |
| `proposer` | `User` | N:1 | O usu�rio que fez a proposta. |
| `ratings` | `Rating` | 1:N | Avalia��es geradas a partir desta proposta (ap�s aceita��o). |

## 4. Entidade: Rating (Avalia��o)

Representa a avalia��o de um usu�rio por outro ap�s uma troca.

| Atributo | Tipo | Descri��o |
| :--- | :--- | :--- |
| `id` | `number` | Chave prim�ria. |
| `value` | `number` | Nota da avalia��o (1 a 5). |
| `comment` | `string?` | Coment�rio da avalia��o. |
| `fromUser` | `User` | Usu�rio que fez a avalia��o. |
| `toUser` | `User` | Usu�rio que foi avaliado. |
| `proposal` | `Proposal` | Proposta que originou a avalia��o. |
| `createdAt`, `updatedAt` | `Date` | Datas de controle. |

## 5. Entidade: Report (Den�ncia)

Representa uma den�ncia feita por um usu�rio sobre outro usu�rio ou item.

| Atributo | Tipo | Descri��o |
| :--- | :--- | :--- |
| `id` | `number` | Chave prim�ria. |
| `reason` | `string` | Motivo da den�ncia. |
| `description` | `string` | Descri��o detalhada. |
| `status` | `ReportStatus` | Status da den�ncia (`pendente`, `em_analise`, `resolvida`, `rejeitada`). Padr�o: `pendente`. |
| `reporterId` | `number?` | ID do usu�rio que denunciou. |
| `reportedUserId` | `number?` | ID do usu�rio denunciado. |
| `reportedItemId` | `number?` | ID do item denunciado. |
| `createdAt` | `Date` | Data de cria��o. |

**Relacionamentos Chave:**

| Relacionamento | Entidade Relacionada | Tipo | Descri��o |
| :--- | :--- | :--- | :--- |
| `reporter` | `User` | N:1 | O usu�rio que fez a den�ncia. |
| `reportedUser` | `User` | N:1 | O usu�rio alvo da den�ncia. |
| `reportedItem` | `Item` | N:1 | O item alvo da den�ncia. |

## 6. Entidade: Notification (Notifica��o)

Representa uma notifica��o enviada ao usu�rio.

| Atributo | Tipo | Descri��o |
| :--- | :--- | :--- |
| `id` | `number` | Chave prim�ria. |
| `user` | `User` | Usu�rio que recebe a notifica��o. |
| `type` | `NotificationType` | Tipo da notifica��o (ex: `MATCH_FOUND`, `NEW_PROPOSAL`). |
| `title` | `string` | T�tulo da notifica��o. |
| `message` | `string` | Mensagem detalhada. |
| `link` | `string?` | Link de redirecionamento. |
| `metadata` | `JSON?` | Dados extras em formato JSON. |
| `read` | `boolean` | Se a notifica��o foi lida. Padr�o: `false`. |
| `createdAt` | `Date` | Data de cria��o. |

## 7. Entidades Auxiliares

*   **TradePreference:** T�tulo da prefer�ncia de troca para um `Item`. Relacionamento N:1 com `Item`.
*   **Image:** URL de uma imagem. Relacionamento N:1 com `Item`.
*   **Favorite:** Item favorito de um usu�rio. Relacionamento N:1 com `User` e N:1 com `Item`.
*   **ChatMessage:** Mensagem de chat entre usu�rios. Relacionamento N:1 com `User` (sender/receiver) e N:1 com `Item` (contexto da troca).





