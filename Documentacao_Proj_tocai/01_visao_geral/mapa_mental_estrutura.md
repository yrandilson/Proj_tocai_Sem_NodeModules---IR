<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Mapa Mental da Estrutura do Sistema Proj_tocai

Este mapa mental representa a estrutura de alto n�vel do sistema, suas tecnologias e as principais funcionalidades.

```mermaid
mindmap
  root((Proj_tocai - Plataforma de Trocas))
    Backend (Node.js/Express/TypeScript)
      API RESTful
        Rotas Principais
          Usu�rios (/users)
          Itens (/items)
          Propostas (/proposals)
          Den�ncias (/reports)
          Avalia��es (/ratings)
          Favoritos (/favorites)
          Notifica��es (/notifications)
      Comunica��o em Tempo Real
        WebSockets (Chat e Notifica��es Instant�neas)
      L�gica de Neg�cios (Services)
        Matchmaking Aprimorado (Bidirecional)
        Controle de Transa��es (Propostas)
        Valida��o de Dados (DTOs)
      Persist�ncia (TypeORM)
        Entidades
          User
          Item
          Proposal
          Rating
          Report
          Notification
          TradePreference
          Favorite
    Frontend (Vue.js/TypeScript/Pinia)
      Interface do Usu�rio (UI/UX)
        P�ginas
          Home (Listagem de Itens)
          Detalhes do Item
          Perfil (Pr�prio e de Outros)
          Meus Itens
          Propostas (Enviadas e Recebidas)
          Chat
          Admin (Den�ncias, Usu�rios, Avalia��es)
      Gerenciamento de Estado (Pinia Stores)
        Auth
        Item
        Proposal
        Chat
        Notification
        Favorite
        Admin
    Funcionalidades Chave
      Troca de Itens
      Chat Privado
      Reputa��o (Avalia��es)
      Seguran�a (Den�ncias/Admin)
      Engajamento
        Favoritos
        Notifica��o de Match Bidirecional (Nova)
```




