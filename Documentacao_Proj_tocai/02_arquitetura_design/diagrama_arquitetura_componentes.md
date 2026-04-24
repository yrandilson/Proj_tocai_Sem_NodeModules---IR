<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Diagrama de Arquitetura de Componentes (Frontend e Backend)

Este diagrama ilustra a intera��o entre os componentes principais do sistema Proj_tocai.

```mermaid
graph TD
    subgraph Frontend (Vue.js SPA)
        A[Interface do Usu�rio]
        B(Pinia Stores)
    end

    subgraph Backend (Node.js/Express)
        C[API RESTful / Rotas]
        D(L�gica de Neg�cios / Services)
        E[Servidor WebSocket]
    end

    subgraph Infraestrutura
        F[Banco de Dados (TypeORM)]
        G[Armazenamento de Imagens (/uploads)]
    end

    A -- Requisi��o HTTP/S --> C
    B -- Estado Global --> A
    C -- Chama L�gica --> D
    D -- Persist�ncia --> F
    D -- Leitura/Escrita --> G

    A -- Conex�o em Tempo Real (WS) --> E
    E -- Eventos de Notifica��o/Chat --> A
    D -- Envia Notifica��o Ass�ncrona --> E

    style A fill:#bbf,stroke:#333,stroke-width:2px
    style B fill:#ddf,stroke:#333
    style C fill:#fbb,stroke:#333,stroke-width:2px
    style D fill:#fdd,stroke:#333
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#ccf,stroke:#333
    style G fill:#ccf,stroke:#333
```




