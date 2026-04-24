<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Casos de Teste para Funcionalidades Chave

Este documento apresenta Casos de Teste (CT) para as funcionalidades centrais do Proj_tocai, com foco nas �reas de Avalia��o, Den�ncias, Favoritos e Notifica��o de Match (incluindo a nova funcionalidade Bidirecional).

**Conven��es:**
*   **CT:** Caso de Teste
*   **RF:** Requisito Funcional (refer�ncia ao `documento_requisitos.md`)
*   **Pr�-condi��o:** Estado necess�rio do sistema/usu�rio antes da execu��o.

## 1. Casos de Teste: Avalia��o (Rating)

| CT-ID | Requisito | Descri��o | Pr�-condi��o | Passos de Execu��o | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-R01** | RF3.1 | Avaliar um usu�rio ap�s proposta aceita. | Proposta entre Usu�rio A e B est� com status `ACEITA`. | 1. Usu�rio A acessa a Proposta Aceita. 2. Usu�rio A preenche nota (ex: 5) e coment�rio. 3. Usu�rio A submete a avalia��o. | Avalia��o � salva no DB. O perfil de Usu�rio B exibe a nova avalia��o. |
| **CT-R02** | RF3.2 | Tentar avaliar a mesma proposta duas vezes. | CT-R01 conclu�do com sucesso. | 1. Usu�rio A tenta submeter uma nova avalia��o para a mesma Proposta. | O sistema retorna um erro (`BadRequestError`) informando que a avalia��o j� foi feita. |
| **CT-R03** | RF3.1 | Tentar avaliar uma proposta `PENDENTE` ou `RECUSADA`. | Proposta entre Usu�rio A e B est� com status `PENDENTE`. | 1. Usu�rio A tenta submeter uma avalia��o para esta Proposta. | O sistema retorna um erro (`BadRequestError` ou similar) informando que a avalia��o s� � permitida ap�s a conclus�o da troca. |

## 2. Casos de Teste: Den�ncias (Report)

| CT-ID | Requisito | Descri��o | Pr�-condi��o | Passos de Execu��o | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-D01** | RF5.1 | Criar den�ncia de Item com sucesso. | Usu�rio A logado. Item X existe. | 1. Usu�rio A acessa Item X. 2. Seleciona "Denunciar", preenche motivo e descri��o. 3. Submete a den�ncia. | Den�ncia � criada no DB com status `PENDENTE`. |
| **CT-D02** | RF5.2 | Tentar criar den�ncia duplicada (Item). | CT-D01 conclu�do com sucesso. | 1. Usu�rio A tenta submeter uma nova den�ncia para o Item X. | O sistema retorna um erro (`BadRequestError`) informando que j� existe uma den�ncia pendente para este alvo. |
| **CT-D03** | RF5.4 | Admin resolve den�ncia. | Den�ncia D01 existe com status `PENDENTE`. Admin logado. | 1. Admin acessa a Den�ncia D01. 2. Altera o status para `RESOLVIDA`. 3. Salva a altera��o. | O status da Den�ncia D01 � alterado para `RESOLVIDA` no DB. |

## 3. Casos de Teste: Favoritos (Favorite)

| CT-ID | Requisito | Descri��o | Pr�-condi��o | Passos de Execu��o | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-F01** | RF4.1 | Adicionar item aos favoritos. | Usu�rio A logado. Item X existe. | 1. Usu�rio A clica em "Favoritar" no Item X. | Item X � adicionado � lista de favoritos de Usu�rio A. |
| **CT-F02** | RF4.1 | Remover item dos favoritos. | CT-F01 conclu�do com sucesso. | 1. Usu�rio A clica em "Desfavoritar" no Item X (ou remove da lista de Favoritos). | Item X � removido da lista de favoritos de Usu�rio A. |
| **CT-F03** | RF4.1 | Listar favoritos. | Usu�rio A possui 3 itens favoritos. | 1. Usu�rio A acessa a rota `/favorites`. | A API retorna uma lista com os 3 itens favoritos, incluindo dados completos (t�tulo, imagens, dono). |

## 4. Casos de Teste: Notifica��o de Match

| CT-ID | Requisito | Descri��o | Pr�-condi��o | Passos de Execu��o | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-M01** | RF4.4 | Match Unidirecional (Item B deseja Item A). | Item B existe e tem "T�tulo A" como prefer�ncia. Usu�rio A cadastra Item A. | 1. Usu�rio A cadastra Item A. | O dono de Item B recebe uma notifica��o `MATCH_FOUND` (Unidirecional) com link para Item A. |
| **CT-M02** | RF4.5 | Match Bidirecional (Perfeito). | Item B existe e tem "T�tulo A" como prefer�ncia. Item A tem "T�tulo B" como prefer�ncia. | 1. Usu�rio A cadastra Item A. | **Ambos** os donos (A e B) recebem uma notifica��o `MATCH_FOUND` com t�tulo `? Match Perfeito Encontrado! ?`. A notifica��o de B linka para Item A, e a de A linka para Item B. |
| **CT-M03** | RF4.4 | Match Unidirecional (Item B deseja Item A, mas Item B est� `TROCADO`). | Item B existe com status `TROCADO` e tem "T�tulo A" como prefer�ncia. | 1. Usu�rio A cadastra Item A. | Nenhuma notifica��o de match � enviada ao dono de Item B. |
| **CT-M04** | RNF1.2 | Verifica��o de Match Ass�ncrona. | Usu�rio A cadastra Item A. | 1. Usu�rio A recebe resposta de cria��o do item. 2. Verifica logs do servidor. | A notifica��o de Match (CT-M01 ou CT-M02) � enviada **ap�s** a resposta de cria��o do item (em segundo plano). |
| **CT-M05** | RF4.6 | Marcar notifica��o de Match como lida. | Notifica��o de Match (CT-M01) existe. | 1. Usu�rio B clica na notifica��o. 2. Acessa a rota `PATCH /notifications/{id}/read`. | A notifica��o � marcada como `read: true` no DB. |





