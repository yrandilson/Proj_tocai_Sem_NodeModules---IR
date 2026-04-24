<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Mapeamento de Liga��es entre M�todos e Caminhos

Este documento detalha o fluxo de execu��o do Backend para as funcionalidades chave, mostrando a liga��o entre a Rota (Endpoint), o Controller e o Service, e as principais chamadas de m�todos.

## 1. Fluxo de Cria��o de Item e Matchmaking

| Rota (Endpoint) | Controller | Service | M�todos Chave | Observa��es |
| :--- | :--- | :--- | :--- | :--- |
| `POST /items` | `ItemController.create` | `ItemService.create` | `itemRepository.create()`, `itemRepository.save()` | Inicia o processo. |
| - | - | `ItemService.create` | `setImmediate(this.findMatchesAndNotify)` | **A��o Ass�ncrona:** Dispara o Matchmaking. |
| - | - | `ItemService.findMatchesAndNotify` | `itemRepository.createQueryBuilder()` | Query para encontrar itens que desejam o novo item. |
| - | - | `ItemService.findMatchesAndNotify` | `newItem.tradePreferences.some()` | **Nova Funcionalidade:** Verifica o Match Bidirecional. |
| - | - | `ItemService.findMatchesAndNotify` | `notificationService.createNotification()` | Envia notifica��o persistente e via WebSocket. |

## 2. Fluxo de Cria��o de Den�ncia

| Rota (Endpoint) | Controller | Service | M�todos Chave | Observa��es |
| :--- | :--- | :--- | :--- | :--- |
| `POST /reports` | `ReportController.create` | `ReportService.createReport` | `reportRepository.findOne()` | **Melhoria:** Verifica se j� existe den�ncia pendente para o alvo. |
| - | - | `ReportService.createReport` | `userRepository.findOneBy()`, `itemRepository.findOneBy()` | Valida a exist�ncia do denunciante, usu�rio e/ou item denunciado. |
| - | - | `ReportService.createReport` | `reportRepository.create()`, `reportRepository.save()` | Cria e salva a nova den�ncia. |

## 3. Fluxo de Cria��o de Avalia��o

| Rota (Endpoint) | Controller | Service | M�todos Chave | Observa��es |
| :--- | :--- | :--- | :--- | :--- |
| `POST /ratings` | `RatingController.create` | `RatingService.create` | `ratingRepository.findOneBy()` | **Melhoria:** Verifica se j� existe avalia��o para a proposta. |
| - | - | `RatingService.create` | `proposalRepository.findOne()` | Valida se a proposta est� `ACEITA` e se os usu�rios s�o os envolvidos. |
| - | - | `RatingService.create` | `ratingRepository.create()`, `ratingRepository.save()` | Cria e salva a avalia��o. |

## 4. Fluxo de Favoritar Item

| Rota (Endpoint) | Controller | Service | M�todos Chave | Observa��es |
| :--- | :--- | :--- | :--- | :--- |
| `POST /favorites/{itemId}` | `FavoriteController.addFavorite` | `FavoriteService.add` | `favoriteRepository.findOne()` | Verifica se o item j� est� favoritado. |
| - | - | `FavoriteService.add` | `favoriteRepository.create()`, `favoriteRepository.save()` | Cria e salva o favorito. |
| `GET /favorites` | `FavoriteController.listMyFavorites` | `FavoriteService.findByUser` | `favoriteRepository.find({ relations: [...] })` | **Melhoria:** Garante que as rela��es `item`, `item.owner` e `item.imagens` sejam carregadas. |

## 5. Fluxo de Aceite de Proposta

| Rota (Endpoint) | Controller | Service | M�todos Chave | Observa��es |
| :--- | :--- | :--- | :--- | :--- |
| `PATCH /proposals/{id}/status` | `ProposalController.updateStatus` | `ProposalService.updateStatus` | `AppDataSource.transaction()` | Executa dentro de uma transa��o para garantir atomicidade. |
| - | - | `ProposalService.updateStatus` | `chatService.createMessage()` | Cria a primeira mensagem de chat (boas-vindas). |
| - | - | `ProposalService.updateStatus` | `notificationService.notifyProposalAccepted()` | Notifica o proponente. |
| - | - | `ProposalService.updateStatus` | `this.rejectOtherProposals()` | Rejeita automaticamente outras propostas pendentes para o item. |
| - | - | `ProposalService.updateStatus` | `itemRepository.save()` | Atualiza o status do item para `TROCADO`. |





