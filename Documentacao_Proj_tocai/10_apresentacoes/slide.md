<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ????? Roteiro de Apresenta��o do Projeto "TrocaAi"

Este documento serve como um guia passo a passo para apresentar o projeto "TrocaAi" de forma clara, coesa e profissional.

---

## 1. Introdu��o e Vis�o Geral (O "Qu�" e o "Porqu�")

**Slide/T�pico 1: O que � o TrocaAi?**

*   **Conceito:** "TrocaAi � uma plataforma web full-stack projetada para facilitar a troca e doa��o de itens. O objetivo principal � criar uma comunidade baseada na economia circular e no consumo consciente."
*   **Problema que Resolve:** "Ele aborda o problema do descarte de itens que ainda t�m valor, conectando pessoas que querem desapegar de algo com outras que precisam daquele item."

**Slide/T�pico 2: Arquitetura e Tecnologias**

*   **Vis�o Geral:** "O projeto foi constru�do sobre uma arquitetura cliente-servidor moderna, utilizando TypeScript em ambas as pontas para garantir a tipagem e a robustez do c�digo."
*   **Frontend (Cliente):**
    *   **Framework:** **Vue.js 3** (Composition API) para uma interface reativa e componentizada.
    *   **Gerenciamento de Estado:** **Pinia**, que centraliza toda a l�gica e os dados do lado do cliente de forma modular (auth, items, chat, etc.).
    *   **Roteamento:** **Vue Router** para navega��o como uma Single Page Application (SPA).
    *   **Estiliza��o:** **TailwindCSS** para um desenvolvimento de UI r�pido e consistente.
*   **Backend (Servidor):**
    *   **Ambiente:** **Node.js** com o framework **Express.js** para criar uma API RESTful robusta.
    *   **Banco de Dados:** **SQLite** com o ORM **TypeORM**, que permite uma forte tipagem e abstra��o das queries ao banco, al�m de facilitar a migra��o para outros bancos de dados como PostgreSQL ou MySQL no futuro.
*   **Comunica��o em Tempo Real:**
    *   **Tecnologia:** **WebSockets** atrav�s da biblioteca **Socket.IO**, essencial para o sistema de chat e notifica��es instant�neas.

---

## 2. A Jornada do Usu�rio: Fluxos Detalhados (O "Como")

Nesta se��o, voc� guiar� o professor atrav�s das funcionalidades, explicando como as tecnologias interagem.

**Slide/T�pico 3: Fluxo de Cadastro e Autentica��o**

1.  **Cadastro:** "O fluxo come�a na `RegisterView.vue`. Ao submeter o formul�rio, a `authStore` (nossa store Pinia) � acionada."
2.  **Requisi��o:** "A store utiliza nosso `api.service` (uma inst�ncia do Axios) para enviar uma requisi��o `POST` para a rota `/api/auth/register` do backend."
3.  **L�gica no Backend:** "No backend, o `user.controller` recebe a requisi��o e a delega para o `user.service`. O servi�o valida os dados, verifica se o e-mail j� existe, criptografa a senha usando **bcrypt** para seguran�a, e salva o novo usu�rio no banco de dados."
4.  **Autentica��o com JWT:** "Ap�s salvar, o servi�o gera um **Token JWT (JSON Web Token)**. Este token � um 'passaporte digital' que cont�m o ID e a `role` do usu�rio (ex: 'common' ou 'admin')."
5.  **Retorno ao Frontend:** "O frontend recebe o token, o armazena no `localStorage`, e a partir desse momento, nosso interceptor do Axios anexa automaticamente o token no cabe�alho `Authorization` de todas as requisi��es futuras para rotas protegidas."
6.  **Prote��o de Rotas:** "No backend, o `auth.middleware.ts` intercepta essas requisi��es, valida o token JWT e, se for v�lido, anexa os dados do usu�rio ao objeto `request`, permitindo o acesso ao recurso."

**Slide/T�pico 4: Fluxo de Cria��o de Item e Proposta**

1.  **Cria��o do Item:** "Um usu�rio logado acessa a `NewItemView.vue`, preenche os dados e faz o upload de imagens. O frontend monta um `FormData` e envia para a rota `POST /api/items`."
2.  **Upload de Imagens:** "No backend, o middleware **Multer** intercepta essa requisi��o, processa os arquivos de imagem, salva-os na pasta `/uploads` do servidor e anexa os nomes dos arquivos � requisi��o."
3.  **L�gica da Proposta:** "Quando outro usu�rio v� um item e faz uma proposta, a `proposalStore` envia uma requisi��o `POST` para `/api/proposals`. O `proposal.service` no backend cria a proposta e, crucialmente, **dispara uma notifica��o**."
4.  **Sistema de Notifica��o:** "O `notification.service` cria um registro no banco de dados e, atrav�s do `ChatSocketHandler`, emite um evento WebSocket para o dono do item, que recebe a notifica��o em tempo real no `AppHeader.vue`."

**Slide/T�pico 5: O Fluxo M�gico - Aceitar Proposta e Iniciar o Chat**

1.  **Aceite da Proposta:** "O dono do item, na `ReceivedProposalsView.vue`, clica em 'Aceitar'. Isso dispara uma requisi��o `PATCH` para o backend, que atualiza o status da proposta e do item."
2.  **Integra��o Frontend:** "Aqui est� a parte mais interessante da integra��o: ao receber a confirma��o de sucesso, a `proposalStore` **chama uma a��o na `chatStore`**: `openChatWithConversation()`."
3.  **Ativa��o do Chat:** "Essa a��o ativa o componente `FloatingChat.vue`, que se abre e j� carrega a conversa espec�fica entre os dois usu�rios sobre aquele item."

**Slide/T�pico 6: Comunica��o em Tempo Real com WebSockets**

1.  **Conex�o:** "Quando o usu�rio faz login, a `chatStore` inicia uma conex�o WebSocket com o servidor, autenticando-se com o mesmo token JWT."
2.  **Gerenciamento de Conex�o:** "No backend, o `chat.socket.ts` gerencia todas as conex�es ativas. Cada usu�rio conectado entra em uma 'sala' (room) privada, o que nos permite enviar mensagens direcionadas."
3.  **Envio de Mensagem:** "Quando um usu�rio envia uma mensagem, o frontend emite um evento WebSocket `message:send`."
4.  **L�gica no Servidor:** "O servidor escuta esse evento, usa o `chat.service` para salvar a mensagem no banco de dados e, em seguida, **retransmite** o evento `message:received` para a sala do usu�rio destinat�rio."
5.  **Recebimento no Frontend:** "O `chatStore` do outro usu�rio recebe o evento, adiciona a nova mensagem � conversa e a interface � atualizada reativamente, sem a necessidade de recarregar a p�gina."

---

## 3. Estrutura do C�digo e Boas Pr�ticas

**Slide/T�pico 7: Organiza��o do Projeto**

*   **Backend:** "A estrutura do backend segue o princ�pio de separa��o de responsabilidades:
    *   **`Controllers`**: Apenas recebem requisi��es e enviam respostas.
    *   **`Services`**: Cont�m toda a l�gica de neg�cio.
    *   **`Entities`**: Mapeiam as tabelas do banco de dados (usando TypeORM).
    *   **`Middlewares`**: Para fun��es transversais como autentica��o e valida��o."
*   **Frontend:** "No frontend, a organiza��o � similar:
    *   **`Views`**: Representam as p�ginas completas.
    *   **`Components`**: Pe�as reutiliz�veis da UI.
    *   **`Stores`**: Centralizam o estado e a l�gica de cada m�dulo da aplica��o (Pinia).
    *   **`Services`**: Abstraem a comunica��o com a API."

---

## 4. Conclus�o e Pr�ximos Passos

**Slide/T�pico 8: Resumo e Pontos Fortes**

*   **Resumo:** "O TrocaAi � uma aplica��o full-stack funcional e bem arquitetada, que demonstra a integra��o de tecnologias modernas para criar uma experi�ncia de usu�rio rica e interativa."
*   **Pontos Fortes:** Arquitetura modular, gerenciamento de estado centralizado com Pinia, e uma experi�ncia de usu�rio din�mica gra�as ao uso de WebSockets.

**Slide/T�pico 9: Trabalhos Futuros**

*   **Funcionalidades:** "A estrutura j� est� preparada para futuras expans�es, como um sistema de **avalia��o entre usu�rios** (`Rating.ts`) e um sistema de **den�ncias** (`Report.ts`), cujas entidades j� foram modeladas."
*   **Melhorias:** "Os pr�ximos passos incluiriam a implementa��o de testes unit�rios e de integra��o, otimiza��o de performance e a implanta��o do projeto em um ambiente de produ��o."

---

**Fim da Apresenta��o. Aberto para perguntas.**





