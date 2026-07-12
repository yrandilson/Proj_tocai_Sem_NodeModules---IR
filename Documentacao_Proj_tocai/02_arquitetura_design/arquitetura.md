<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ??? Diagrama de Arquitetura de Alto N�vel - TrocaAi

Este diagrama ilustra a arquitetura geral do projeto "TrocaAi", mostrando os principais componentes e como eles interagem entre si.

---

## Vis�o Geral da Arquitetura

O projeto � dividido em duas partes principais:

1.  **Cliente (Client-Side):** Uma Single Page Application (SPA) constru�da com Vue.js que roda no navegador do usu�rio. � respons�vel por toda a interface e experi�ncia do usu�rio.
2.  **Servidor (Server-Side):** Uma infraestrutura Node.js que hospeda a API RESTful, o servidor de WebSocket para comunica��o em tempo real, o banco de dados e o armazenamento de arquivos.

### Legenda

*   **Setas Cheias (`-->`):** Representam requisi��es HTTP (ex: GET, POST), que s�o tipicamente iniciadas pelo cliente para buscar ou enviar dados.
*   **Setas Tracejadas (`-.->`):** Representam a comunica��o persistente via WebSockets, usada para eventos em tempo real como chat e notifica��es.

---

## Diagrama

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

    %% Intera��es do Usu�rio
    U -- "Interage com a UI" --> FE

    %% Comunica��o Frontend -> Backend
    FE -- "Requisi��es HTTP (Axios)<br/>(Login, Itens, Propostas)" --> API
    API -- "Respostas JSON" --> FE

    FE -.->|Conex�o WebSocket<br/>(Chat, Notifica��es)| WS
    WS -.->|Eventos em Tempo Real<br/>(message:received, user:online)| FE

    %% Comunica��o Interna do Backend
    API -- "L�gica de Neg�cio (Services)<br/>Leitura/Escrita via TypeORM" --> DB
    API -- "Salva/L� Imagens (Multer)" --> FS
    API -- "Dispara Notifica��es<br/>(ex: nova proposta)" --> WS

    %% Servidor de Arquivos Est�ticos
    FE -- "Carrega Imagens<br/>(ex: /uploads/img.jpg)" --> FS

```





