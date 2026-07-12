<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Diagrama de Classes UML (Mermaid)

Este diagrama representa as principais entidades do Backend do sistema Proj_tocai e seus relacionamentos.

```mermaid
classDiagram
    direction LR

    class User {
        +int id
        +string nome
        +string email
        +string senha
        +UserRole role
        +Date createdAt
        +Date updatedAt
        +Date deletedAt
        +toJSON()
    }

    class Item {
        +int id
        +int ownerId
        +string titulo
        +string descricao
        +string categoria
        +ItemStatus status
        +float latitude
        +float longitude
        +Date createdAt
        +Date updatedAt
        +Date deletedAt
    }

    class TradePreference {
        +int id
        +int itemId
        +string titulo
    }

    class Proposal {
        +int id
        +int itemId
        +int proposerId
        +string mensagem
        +ProposalStatus status
        +Date createdAt
        +Date updatedAt
    }

    class Rating {
        +int id
        +int value
        +string comment
        +Date createdAt
        +Date updatedAt
    }

    class Report {
        +int id
        +string reason
        +string description
        +ReportStatus status
        +int reporterId
        +int reportedUserId
        +int reportedItemId
        +Date createdAt
    }

    class Notification {
        +int id
        +NotificationType type
        +string title
        +string message
        +string link
        +JSON metadata
        +bool read
        +Date createdAt
    }

    User "1" -- "N" Item : owner
    User "1" -- "N" Proposal : proposer
    User "1" -- "N" Notification : user
    User "1" -- "N" Rating : fromUser (faz)
    User "1" -- "N" Rating : toUser (recebe)
    User "1" -- "N" Report : reporter (faz)
    User "1" -- "N" Report : reportedUser (recebe)

    Item "1" -- "N" TradePreference : preferences
    Item "1" -- "N" Proposal : item
    Item "1" -- "N" Report : reportedItem

    Proposal "1" -- "N" Rating : proposal

    Notification "1" -- "N" User : user

    TradePreference "N" -- "1" Item : item

    Report "N" -- "1" User : reporter
    Report "N" -- "1" User : reportedUser
    Report "N" -- "1" Item : reportedItem
```




