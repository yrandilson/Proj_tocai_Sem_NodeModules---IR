<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? TrocaAi - Proposta de Projeto

 <!-- Opcional: Crie e adicione um banner para o projeto -->

**TrocaAi** � uma plataforma web full-stack moderna projetada para facilitar a troca e doa��o de itens, promovendo a economia circular e o consumo consciente. O sistema conecta usu�rios que desejam dar um novo destino a objetos que n�o utilizam mais com aqueles que precisam desses itens, criando uma comunidade engajada e sustent�vel.

---

## ?? �ndice

*   [1. Vis�o Geral](#1-vis�o-geral)
*   [2. Funcionalidades Principais](#2-funcionalidades-principais)
*   [3. Tecnologias Utilizadas (Tech Stack)](#3-tecnologias-utilizadas-tech-stack)
*   [4. Arquitetura do Sistema](#4-arquitetura-do-sistema)
*   [5. Como Executar o Projeto](#5-como-executar-o-projeto)
*   [6. Pr�ximos Passos e Melhorias Futuras](#6-pr�ximos-passos-e-melhorias-futuras)

---

## 1. Vis�o Geral

O projeto consiste em uma Single Page Application (SPA) reativa no frontend e uma API RESTful robusta no backend, com funcionalidades de comunica��o em tempo real. A plataforma permite que os usu�rios se cadastrem, publiquem seus itens, negociem trocas atrav�s de um sistema de propostas e conversem em um chat integrado.

*   **Equipe:** Dev-Connect
*   **Status:** Em Desenvolvimento
*   **Disciplina:** Projeto Final - Desenvolvimento Web Fullstack

---

## 2. Funcionalidades Principais

O sistema foi planejado com um conjunto rico de funcionalidades para garantir uma experi�ncia de usu�rio completa:

*   ? **Autentica��o de Usu�rios:** Sistema seguro de cadastro e login com tokens **JWT**.
*   ?? **Gerenciamento de Itens:** Usu�rios podem criar, editar e deletar seus itens, com upload de m�ltiplas imagens.
*   ??? **Visualiza��o em Mapa:** Itens s�o exibidos em um mapa interativo, permitindo buscas por geolocaliza��o.
*   ?? **Sistema de Propostas:** Fluxo completo para enviar, receber, aceitar e recusar propostas de troca.
*   ?? **Chat em Tempo Real:** Ap�s uma proposta ser aceita, um chat privado � aberto automaticamente entre os usu�rios para negocia��o, utilizando **WebSockets**.
*   ?? **Notifica��es Instant�neas:** Alertas em tempo real para novas propostas, respostas e mensagens.
*   ??? **Painel Administrativo:** Uma �rea restrita para administradores gerenciarem usu�rios e itens da plataforma.
*   ?? **Busca e Filtragem:** Ferramentas para que os usu�rios encontrem itens por nome ou categoria.

---

## 3. Tecnologias Utilizadas (Tech Stack)

| Categoria             | Tecnologia                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**          | **Vue.js 3** (Composition API), **TypeScript**, **Pinia**, **Vue Router**, **TailwindCSS**, **Vite**       |
| **Backend**           | **Node.js**, **Express.js**, **TypeScript**, **TypeORM**                                                 |
| **Banco de Dados**    | **SQLite** (para desenvolvimento, com f�cil migra��o para PostgreSQL/MySQL)                              |
| **Tempo Real**        | **Socket.IO** (WebSockets)                                                                               |
| **Autentica��o**      | **JWT** (JSON Web Tokens), **bcrypt** para hashing de senhas                                             |
| **Upload de Arquivos**| **Multer**                                                                                               |

---

## 4. Arquitetura do Sistema

O projeto segue uma arquitetura cliente-servidor desacoplada, o que garante manutenibilidade e escalabilidade.

*   **Cliente (Frontend):** Uma SPA constru�da com Vue.js, respons�vel por toda a renderiza��o da interface e intera��o com o usu�rio. Ela se comunica com o backend atrav�s de requisi��es HTTP para a API RESTful e mant�m uma conex�o WebSocket para eventos em tempo real.
*   **Servidor (Backend):** Um servidor Node.js/Express que exp�e uma API RESTful para as opera��es CRUD (Criar, Ler, Atualizar, Deletar) e gerencia a l�gica de neg�cio. Ele tamb�m hospeda o servidor Socket.IO, que orquestra a comunica��o do chat e das notifica��es.

### Diagrama de Alto N�vel

```mermaid
graph TD
    subgraph "Cliente (Navegador do Usu�rio)"
        style Cliente fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px
        U[<fa:fa-user> Usu�rio]
        FE[<fa:fa-vuejs> Frontend Vue.js SPA]
    end

    subgraph "Infraestrutura do Servidor (Backend)"
        style Infraestrutura fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
        
        subgraph "Servidor Node.js"
            style "Servidor Node.js" fill:none,stroke:none
            API[<fa:fa-server> API RESTful (Express.js)]
            WS[<fa:fa-bolt> Servidor WebSocket (Socket.IO)]
        end
        
        DB[(<fa:fa-database> Banco de Dados<br/>SQLite)]
        FS[(<fa:fa-folder-open> Armazenamento de Arquivos<br/>/uploads)]
    end

    U -- "Interage com a UI" --> FE

    FE -- "Requisi��es HTTP (Axios)" --> API
    API -- "Respostas JSON" --> FE

    FE -.->|Conex�o WebSocket| WS
    WS -.->|Eventos em Tempo Real| FE

    API -- "L�gica de Neg�cio (Services)" --> DB
    API -- "Salva/L� Imagens (Multer)" --> FS
    API -- "Dispara Notifica��es" --> WS
```

---

## 5. Como Executar o Projeto

Para executar o projeto localmente, siga os passos detalhados no arquivo `INSTALACAO.md`. De forma resumida:

1.  **Clone o reposit�rio.**
2.  **Instale as depend�ncias do Backend:**
    ```bash
    cd backend
    npm install
    ```
3.  **Instale as depend�ncias do Frontend:**
    ```bash
    cd frontend
    npm install
    ```
4.  **Execute o Backend** (a partir da pasta `backend`):
    ```bash
    npm run dev
    ```
5.  **Execute o Frontend** (em um novo terminal, a partir da pasta `frontend`):
    ```bash
    npm run dev
    ```

---

## 6. Pr�ximos Passos e Melhorias Futuras

A arquitetura atual j� prev� futuras expans�es. Os pr�ximos passos incluem:

*   **Sistema de Avalia��o:** Implementar a funcionalidade de avalia��o entre usu�rios ap�s uma troca.
*   **Sistema de Den�ncias:** Permitir que usu�rios reportem conte�dos ou perfis inadequados.
*   **Testes Automatizados:** Adicionar testes unit�rios (Jest/Vitest) e de ponta a ponta (Cypress) para garantir a qualidade e estabilidade do c�digo.
*   **CI/CD:** Configurar um pipeline de Integra��o e Entrega Cont�nua com GitHub Actions para automatizar o build, teste e deploy.
*   **Otimiza��o de Performance:** Implementar cache com Redis no backend e otimizar o carregamento de imagens no frontend.

---





