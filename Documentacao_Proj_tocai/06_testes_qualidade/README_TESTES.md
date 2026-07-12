<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Manual de Execu��o de Testes Automatizados (Backend)

Este manual cont�m as instru��es necess�rias para executar os testes automatizados de integra��o que cobrem todas as novas funcionalidades implementadas no projeto Tocai.

## Pr�-requisitos

1.  **Node.js e pnpm:** Certifique-se de ter o Node.js (vers�o LTS) e o gerenciador de pacotes `pnpm` instalados em sua m�quina.
2.  **Arquivos de Teste:** Os arquivos de teste est�o localizados na pasta `backend/src/__tests__`.
3.  **Configura��o:** O ambiente de teste est� configurado para usar um banco de dados SQLite tempor�rio (`database_test.sqlite`), garantindo que os testes n�o interfiram no banco de dados de desenvolvimento.

## 1. Configura��o do Ambiente

Navegue at� o diret�rio `backend` e instale as depend�ncias.

```bash
cd backend
pnpm install
```

## 2. Execu��o dos Testes

Os testes s�o executados usando o `Jest` e o `ts-jest` para rodar os arquivos TypeScript diretamente.

Execute o seguinte comando no diret�rio `backend`:

```bash
pnpm test
```

### Detalhes da Execu��o

O comando `pnpm test` ir�:

1.  **Configurar o Ambiente:** Executar o script `src/__tests__/setup.ts` (conforme configurado no `jest.config.js`).
    *   Este script inicializa uma conex�o com o banco de dados de teste.
    *   **Importante:** Ele usa o `dotenv/config` para carregar vari�veis de ambiente, mas sobrescreve a vari�vel `DB_DATABASE` para garantir o uso do banco de dados de teste.
2.  **Rodar os Testes:** Executar todos os arquivos com a extens�o `.test.ts` dentro da pasta `src/__tests__`.

### Arquivos de Teste

| Arquivo | Funcionalidades Testadas | Prioridade |
| :--- | :--- | :--- |
| `auth_user.test.ts` | Registro e Login de Usu�rio | Base |
| | Leitura e Atualiza��o de Perfil | Base |
| `item.test.ts` | Cria��o e Listagem de Itens | Base |
| | Filtro de Busca por Localiza��o (Raio) | P1 |
| | Otimiza��o de Busca (Full-Text Search) | P3 |
| `proposal_favorite.test.ts` | Cria��o, Aceite e Rejei��o de Propostas | Base |
| | Adicionar e Remover Favoritos | Base |
| `chat.test.ts` | Envio de Mensagens e Listagem de Conversas | Base |
| `chat_rating.test.ts` | Sistema de Feedback Detalhado | P1 |
| | Arquivamento Autom�tico de Conversas (Soft-Delete) | P3 |
| `user_report.test.ts` | Verifica��o de Identidade (Verified User) | P2 |
| | Bloqueio de Usu�rio | P2 |
| | Hist�rico de Status de Den�ncias | P2 |
| `favorite_notification.test.ts` | Notifica��o de "Item Favorito Dispon�vel" | P1 |

## 3. Limpeza

Ap�s a execu��o, o script `setup.ts` automaticamente destr�i a conex�o e remove o banco de dados de teste (`database_test.sqlite`), garantindo um ambiente limpo para a pr�xima execu��o.

---
**Observa��o:** Estes s�o testes de **integra��o** (end-to-end via API), que simulam a intera��o de usu�rios com os endpoints do backend, garantindo que a l�gica de neg�cio das novas funcionalidades esteja correta.

Para testar o frontend (Vue.js), seria necess�rio configurar um ambiente de testes unit�rios (ex: Vitest) e/ou testes e2e (ex: Cypress), o que exigiria a instala��o e configura��o de mais depend�ncias e a cria��o de mocks/componentes de teste, o que est� al�m do escopo deste manual focado nas funcionalidades de backend.





