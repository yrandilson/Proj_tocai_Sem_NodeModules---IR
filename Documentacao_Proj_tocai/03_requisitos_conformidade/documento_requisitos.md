<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Documento de Requisitos do Sistema Proj_tocai

**Autor:** Manus AI
**Data:** 26 de Outubro de 2025
**Revis�o:** 1.0

## 1. Introdu��o

Este documento descreve os requisitos funcionais e n�o-funcionais do sistema **Proj_tocai**, uma plataforma de troca de itens. Os requisitos foram extra�dos da an�lise da base de c�digo e das funcionalidades implementadas.

## 2. Requisitos Funcionais (RF)

Os requisitos funcionais descrevem o comportamento do sistema e as funcionalidades que ele deve oferecer aos usu�rios.

### RF1: Gest�o de Usu�rios e Autentica��o

| ID | Descri��o |
| :--- | :--- |
| **RF1.1** | O sistema deve permitir o **registro** de novos usu�rios com nome, e-mail e senha. |
| **RF1.2** | O sistema deve permitir o **login** e a autentica��o via token JWT. |
| **RF1.3** | O sistema deve permitir que o usu�rio visualize e atualize seus dados de perfil. |
| **RF1.4** | O sistema deve suportar **tr�s pap�is de usu�rio**: `common`, `verified` e `admin`. |
| **RF1.5** | O sistema deve permitir que o administrador **gerencie os usu�rios**, incluindo altera��o de papel e exclus�o. |

### RF2: Gest�o de Itens e Trocas

| ID | Descri��o |
| :--- | :--- |
| **RF2.1** | O sistema deve permitir que o usu�rio **cadastre um novo item** com t�tulo, descri��o, categoria, imagens e prefer�ncias de troca. |
| **RF2.2** | O sistema deve permitir que o usu�rio **visualize todos os itens** dispon�veis, com filtros por categoria e busca por t�tulo. |
| **RF2.3** | O sistema deve permitir que o usu�rio **edite e exclua** apenas seus pr�prios itens. |
| **RF2.4** | O sistema deve permitir que o usu�rio **altere o status** do seu item (`disponivel`, `em_negociacao`, `trocado`). |
| **RF2.5** | O sistema deve permitir que um usu�rio **fa�a uma proposta** para o item de outro usu�rio com uma mensagem. |
| **RF2.6** | O sistema deve permitir que o dono do item **aceite ou recuse** propostas recebidas. |
| **RF2.7** | Ao aceitar uma proposta, o sistema deve **iniciar um chat** entre os usu�rios e **rejeitar automaticamente** as outras propostas pendentes para o item. |

### RF3: Avalia��o e Reputa��o

| ID | Descri��o |
| :--- | :--- |
| **RF3.1** | O sistema deve permitir que os usu�rios **avaliem uns aos outros** (nota e coment�rio) ap�s a conclus�o de uma troca (proposta aceita). |
| **RF3.2** | O sistema deve **impedir avalia��es duplicadas** para a mesma proposta. |
| **RF3.3** | O sistema deve permitir a **visualiza��o das avalia��es** recebidas por um usu�rio. |

### RF4: Favoritos e Notifica��es

| ID | Descri��o |
| :--- | :--- |
| **RF4.1** | O sistema deve permitir que o usu�rio **adicione e remova** itens da sua lista de favoritos. |
| **RF4.2** | O sistema deve **notificar** o dono de um item quando uma **nova proposta** for recebida. |
| **RF4.3** | O sistema deve **notificar** o proponente quando sua proposta for **aceita ou recusada**. |
| **RF4.4** | O sistema deve **notificar** o usu�rio quando um **Match** for encontrado (Match Unidirecional). |
| **RF4.5** | O sistema deve **notificar** ambos os usu�rios quando um **Match Bidirecional (Perfeito)** for encontrado. |
| **RF4.6** | O sistema deve permitir que o usu�rio **visualize e marque como lidas** suas notifica��es. |

### RF5: Den�ncias e Administra��o

| ID | Descri��o |
| :--- | :--- |
| **RF5.1** | O sistema deve permitir que o usu�rio **denuncie** outro usu�rio ou item com um motivo e descri��o. |
| **RF5.2** | O sistema deve **impedir den�ncias pendentes duplicadas** para o mesmo alvo. |
| **RF5.3** | O sistema deve permitir que o administrador **visualize e gerencie** todas as den�ncias. |
| **RF5.4** | O administrador deve poder **alterar o status** de uma den�ncia (`pendente`, `em_analise`, `resolvida`, `rejeitada`). |

## 3. Requisitos N�o-Funcionais (RNF)

Os requisitos n�o-funcionais descrevem crit�rios de qualidade e restri��es t�cnicas do sistema.

### RNF1: Desempenho e Escalabilidade

| ID | Descri��o |
| :--- | :--- |
| **RNF1.1** | O tempo de resposta para a listagem de itens deve ser **inferior a 2 segundos** para 1.000 itens. |
| **RNF1.2** | O sistema de Matchmaking deve ser **ass�ncrono** (executado em segundo plano) para n�o impactar o tempo de resposta do cadastro de itens. |

### RNF2: Seguran�a

| ID | Descri��o |
| :--- | :--- |
| **RNF2.1** | O sistema deve utilizar **criptografia** para armazenar senhas de usu�rios (hash). |
| **RNF2.2** | Todas as comunica��es entre frontend e backend devem ser realizadas via **HTTPS** (presumido pela infraestrutura). |
| **RNF2.3** | O acesso a rotas sens�veis (ex: administra��o, atualiza��o de perfil) deve ser **protegido por autentica��o** e verifica��o de papel (`roleMiddleware`). |
| **RNF2.4** | O sistema deve prevenir que um usu�rio acesse ou modifique dados de outro usu�rio sem permiss�o (ex: atualizar item que n�o lhe pertence). |

### RNF3: Tecnologia e Ambiente

| ID | Descri��o |
| :--- | :--- |
| **RNF3.1** | O **Backend** deve ser desenvolvido em **Node.js** com **TypeScript** e **TypeORM**. |
| **RNF3.2** | O **Frontend** deve ser desenvolvido em **Vue.js** com **TypeScript** e **Vite**. |
| **RNF3.3** | O banco de dados deve ser **PostgreSQL** (ou similar, conforme TypeORM). |
| **RNF3.4** | O sistema deve suportar **WebSockets** para comunica��o em tempo real (chat e notifica��es). |





