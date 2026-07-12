<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Diagrama de Fluxo: Matchmaking Aprimorado

Este diagrama de fluxo de atividade (Mermaid) detalha a l�gica do novo sistema de Matchmaking Bidirecional, que � acionado de forma ass�ncrona ap�s o cadastro de um item.

```mermaid
graph TD
    A[Usu�rio cadastra Item A] --> B(ItemService.create);
    B --> C{Item A salvo no DB?};
    C -- Sim --> D(Dispara Matchmaking Ass�ncrono);
    C -- N�o --> E[Erro ao criar Item];

    subgraph Matchmaking Ass�ncrono
        D --> F[Buscar Itens B com status 'DISPONIVEL' onde Item B.Prefer�ncia == Item A.T�tulo];
        F --> G{Itens B Encontrados?};
        G -- Sim --> H{Para cada Item B:};
        G -- N�o --> I[Fim do Matchmaking];

        subgraph Processar Match
            H --> J{Dono de Item B == Dono de Item A?};
            J -- Sim --> K[Ignorar (Auto-Match)];
            J -- N�o --> L{Verificar Match Bidirecional: Item A.Prefer�ncia == Item B.T�tulo?};
            L -- Sim --> M[Tipo de Match: Bidirecional];
            L -- N�o --> N[Tipo de Match: Unidirecional];
            
            M --> O(Notificar Dono de Item B: "Match Perfeito");
            M --> P(Notificar Dono de Item A: "Match Perfeito");
            N --> Q(Notificar Dono de Item B: "Match Unidirecional");

            O --> R;
            P --> R;
            Q --> R;
            K --> R(Pr�ximo Item B);
        end
        H --> R;
        R --> G;
    end
    I --> Z[Fim do Processo];
```




