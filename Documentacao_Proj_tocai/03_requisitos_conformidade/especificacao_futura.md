<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Especifica��o T�cnica para Implementa��o de Funcionalidades Futuras

**Autor:** Manus AI
**Data:** 26 de Outubro de 2025
**Foco:** Prioridade 1 (UX e Engajamento)

Este documento de especifica��o detalha o passo a passo para a implementa��o das tr�s funcionalidades de **Prioridade 1** (as mais cr�ticas para a Experi�ncia do Usu�rio e Engajamento) no sistema Proj_tocai.

## 1. Funcionalidade: Filtro de Busca por Localiza��o (Raio)

**Objetivo:** Permitir que o usu�rio encontre itens dentro de uma dist�ncia espec�fica de sua localiza��o atual ou de um ponto de refer�ncia.

### 1.1. Backend (API e Service)

| Passo | Descri��o | Componente | Detalhes T�cnicos |
| :--- | :--- | :--- | :--- |
| **1. Extens�o do Endpoint** | Modificar `GET /items` para aceitar novos par�metros de query. | `item.controller.ts`, `item.service.ts` | Adicionar `latitude`, `longitude` e `raioKm` (n�mero) aos par�metros de busca. |
| **2. C�lculo de Dist�ncia (Geospatial)** | Implementar a l�gica para calcular a dist�ncia entre dois pontos (Item e Localiza��o do Usu�rio). | `item.service.ts` | Utilizar a **F�rmula de Haversine** dentro do `createQueryBuilder` do TypeORM. Exemplo de cl�usula `WHERE`: `HAVERSINE_DISTANCE(:lat, :lon, item.latitude, item.longitude) <= :raioKm`. |
| **3. Otimiza��o do DB** | Garantir que o banco de dados suporte consultas geogr�ficas eficientes. | `Item.ts` (Entity) | Adicionar �ndices espaciais (se o DB suportar, ex: PostGIS para PostgreSQL) ou �ndices simples nas colunas `latitude` e `longitude`. |
| **4. Retorno da Dist�ncia** | Incluir a dist�ncia calculada no objeto `Item` retornado pela API. | `item.service.ts` | Adicionar um campo transiente `distanciaKm` ao DTO de retorno do Item. |

### 1.2. Frontend (Interface do Usu�rio)

| Passo | Descri��o | Componente | Detalhes T�cnicos |
| :--- | :--- | :--- | :--- |
| **1. Captura de Localiza��o** | Obter a localiza��o atual do usu�rio. | `HomeView.vue`, `item.store.ts` | Utilizar a API `navigator.geolocation` do navegador. Requer permiss�o do usu�rio. |
| **2. Componente de Filtro** | Criar um componente de interface para definir o raio. | `ItemSearchModal.vue` | Um *slider* ou *dropdown* com op��es de raio (ex: 5km, 10km, 25km, 50km). |
| **3. Exibi��o da Dist�ncia** | Mostrar a dist�ncia do item em rela��o ao usu�rio. | `ItemCard.vue` | Exibir o campo `distanciaKm` retornado pela API. |

## 2. Funcionalidade: Sistema de Feedback Detalhado (Tags)

**Objetivo:** Adicionar tags de feedback pr�-definidas �s avalia��es para enriquecer o perfil de reputa��o do usu�rio.

### 2.1. Backend (API e Service)

| Passo | Descri��o | Componente | Detalhes T�cnicos |
| :--- | :--- | :--- | :--- |
| **1. Defini��o das Tags** | Criar um `Enum` ou tabela para as tags de feedback. | `types/index.ts` | Ex: `FeedbackTag = { COMUNICACAO_RAPIDA: 'Comunica��o R�pida', ITEM_CONFORME: 'Item Conforme Descri��o', PONTUAL: 'Pontual' }`. |
| **2. Extens�o da Entidade** | Adicionar um campo para armazenar as tags selecionadas. | `Rating.ts` (Entity) | Adicionar `selectedTags: string[]` (armazenado como JSON ou Array de strings no DB). |
| **3. Extens�o do Endpoint** | Modificar o endpoint de cria��o de avalia��o. | `rating.controller.ts`, `rating.service.ts` | Adicionar `selectedTags` ao DTO de cria��o de avalia��o. Validar se as tags enviadas s�o v�lidas. |
| **4. Agrega��o de Dados** | Criar um m�todo no `User.service.ts` para calcular a frequ�ncia de cada tag de feedback recebida por um usu�rio. | `user.service.ts` | Query para contar a ocorr�ncia de cada tag nas `receivedRatings`. |

### 2.2. Frontend (Interface do Usu�rio)

| Passo | Descri��o | Componente | Detalhes T�cnicos |
| :--- | :--- | :--- | :--- |
| **1. Interface de Avalia��o** | Modificar a interface de cria��o de avalia��o. | `RatingModal.vue` | Exibir a lista de tags como *checkboxes* ou *chips* para sele��o r�pida. |
| **2. Exibi��o do Perfil** | Mostrar as tags de feedback mais frequentes no perfil do usu�rio. | `UserProfileView.vue`, `ProfileView.vue` | Exibir as 3 ou 5 tags mais recebidas (ex: "Pontual (x15)", "Comunica��o R�pida (x10)"). |

## 3. Funcionalidade: Notifica��o de "Item Favorito Dispon�vel"

**Objetivo:** Reengajar usu�rios que favoritaram um item que estava indispon�vel, mas que voltou a estar dispon�vel.

### 3.1. Backend (Service e L�gica)

| Passo | Descri��o | Componente | Detalhes T�cnicos |
| :--- | :--- | :--- | :--- |
| **1. Hook de Mudan�a de Status** | Criar um *hook* ou l�gica no servi�o de item que � acionada quando o status do item muda. | `item.service.ts` | No m�todo `updateStatus`, verificar se o status anterior era `TROCADO` ou `EM_NEGOCIACAO` e o novo � `DISPONIVEL`. |
| **2. Busca de Favoritos** | Buscar todos os usu�rios que favoritaram o item. | `favorite.service.ts` | Criar um m�todo `findByItemId(itemId: number)` para buscar os `userIds` dos usu�rios que favoritaram o item. |
| **3. Cria��o da Notifica��o** | Enviar a notifica��o para cada usu�rio encontrado. | `notification.service.ts` | Chamar `createNotification` com `NotificationType.FAVORITE_AVAILABLE`. Mensagem: "Seu item favorito [T�tulo do Item] est� dispon�vel novamente!". |
| **4. Limita��o de Frequ�ncia** | Adicionar um mecanismo para evitar spam (ex: notificar apenas uma vez a cada 7 dias por item). | `notification.service.ts` | Verificar se uma notifica��o do tipo `FAVORITE_AVAILABLE` para o mesmo item foi enviada recentemente. |

### 3.2. Frontend (Interface do Usu�rio)

| Passo | Descri��o | Componente | Detalhes T�cnicos |
| :--- | :--- | :--- | :--- |
| **1. Tipo de Notifica��o** | Adicionar o novo tipo de notifica��o. | `notification.store.ts` | Definir como a notifica��o `FAVORITE_AVAILABLE` ser� exibida (�cone, cor). |
| **2. Link Direto** | Garantir que o link da notifica��o leve diretamente para a p�gina de detalhes do item. | `NotificationDropdown.vue` | O `link` no objeto `Notification` deve ser `/items/[itemId]`. |





