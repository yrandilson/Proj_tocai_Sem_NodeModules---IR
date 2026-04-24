<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Melhorias e Funcionalidades Futuras - TrocaAi

Este documento descreve sugest�es de novas funcionalidades e melhorias t�cnicas que podem ser implementadas no projeto "TrocaAi" para torn�-lo ainda mais completo, robusto e escal�vel.

---

## ? Novas Funcionalidades para o Usu�rio

Estas funcionalidades focam em enriquecer a experi�ncia do usu�rio e aumentar o engajamento na plataforma.

### 1. Sistema de Avalia��o (Rating)
*   **Descri��o:** Permitir que usu�rios avaliem uns aos outros (com estrelas e coment�rios) ap�s a conclus�o de uma troca. A entidade `Rating.ts` j� est� modelada, servindo como ponto de partida.
*   **Impacto:** Aumenta a confian�a e a seguran�a na comunidade, incentivando boas pr�ticas.
*   **Implementa��o:**
    *   **Backend:** Criar `rating.controller.ts` e `rating.service.ts`.
    *   **Frontend:** Adicionar uma se��o de "Avalia��es" no perfil do usu�rio e um modal para avaliar ap�s uma proposta ser marcada como "trocado".

### 2. Sistema de Den�ncias (Report)
*   **Descri��o:** Implementar um sistema onde usu�rios possam denunciar itens, perfis ou mensagens que violem os termos de uso da plataforma. A entidade `Report.ts` tamb�m j� existe.
*   **Impacto:** Melhora a modera��o e a seguran�a da plataforma.
*   **Implementa��o:**
    *   **Backend:** Criar `report.controller.ts` e `report.service.ts`.
    *   **Frontend:** Adicionar um bot�o "Denunciar" nas p�ginas de item, perfil de usu�rio e na janela de chat. Criar uma nova se��o no painel de Admin para gerenciar as den�ncias.

### 3. Lista de Desejos (Wishlist)
*   **Descri��o:** Permitir que usu�rios salvem itens de interesse em uma "Lista de Desejos". O sistema poderia notific�-los se um item similar for cadastrado na sua regi�o.
*   **Impacto:** Aumenta a reten��o e o engajamento, incentivando os usu�rios a retornarem � plataforma.
*   **Implementa��o:**
    *   **Backend:** Criar uma nova entidade `Wishlist` e as rotas/servi�os correspondentes.
    *   **Frontend:** Adicionar um bot�o "Adicionar aos Desejos" nos cards de itens e uma nova p�gina de "Meus Desejos" no perfil do usu�rio.

### 4. Melhorias no Chat
*   **Descri��o:** Aprimorar o chat com funcionalidades como envio de imagens (para mostrar mais detalhes do item), confirma��o de leitura (marcas de "visto") e respostas a mensagens espec�ficas.
*   **Impacto:** Torna a negocia��o mais clara, eficiente e parecida com aplicativos de mensagem modernos.
*   **Implementa��o:**
    *   **Backend:** Modificar o `chat.socket.ts` para lidar com upload de imagens e novos eventos de status de mensagem.
    *   **Frontend:** Atualizar o componente `FloatingChat.vue` para incluir bot�es de upload e renderizar os status das mensagens.

### 5. Gamifica��o e Conquistas
*   **Descri��o:** Introduzir um sistema de "conquistas" ou "badges" que os usu�rios desbloqueiam ao atingir marcos (ex: "Primeira Troca Realizada", "Mestre Trocador", "Doador Generoso").
*   **Impacto:** Incentiva a participa��o ativa e cria uma experi�ncia mais divertida.
*   **Implementa��o:**
    *   **Backend:** Criar uma entidade `Achievement` e uma l�gica no `user.service` para verificar e conceder conquistas.
    *   **Frontend:** Exibir as conquistas no perfil do usu�rio.

### 6. Busca Avan�ada e Filtros
*   **Descri��o:** Expandir os filtros de busca para incluir dist�ncia (usando a geolocaliza��o j� existente), avalia��o do usu�rio, data de postagem, etc.
*   **Impacto:** Permite que os usu�rios encontrem exatamente o que procuram com mais facilidade.
*   **Implementa��o:**
    *   **Backend:** Aprimorar o m�todo `findAll` no `item.service.ts` para aceitar mais par�metros de query.
    *   **Frontend:** Adicionar mais campos de filtro na `HomeView.vue` e `MapView.vue`.

---

## ??? Melhorias T�cnicas e de Arquitetura

Estas melhorias focam na qualidade do c�digo, manutenibilidade, performance e seguran�a do projeto.

### 1. Implementa��o de Testes (Unit�rios e E2E)
*   **Descri��o:** Adicionar uma su�te de testes robusta.
    *   **Backend:** Usar **Jest** ou **Vitest** para testes unit�rios nos `services`, garantindo que a l�gica de neg�cio funcione como esperado.
    *   **Frontend:** Usar **Vitest** para testes unit�rios nos `stores` do Pinia e **Cypress** ou **Playwright** para testes de ponta a ponta (E2E), simulando a jornada do usu�rio.
*   **Impacto:** Garante a estabilidade do c�digo, previne regress�es e facilita a refatora��o com seguran�a.

### 2. Pipeline de CI/CD (Integra��o e Entrega Cont�nua)
*   **Descri��o:** Configurar um pipeline usando **GitHub Actions** (ou similar) para automatizar o processo de build, teste e deploy da aplica��o sempre que houver um push para a branch principal.
*   **Impacto:** Agiliza o ciclo de desenvolvimento, garante que apenas c�digo testado v� para produ��o e padroniza o processo de deploy.

### 3. Documenta��o da API com Swagger/OpenAPI
*   **Descri��o:** Integrar uma ferramenta como o **Swagger** ao backend Express. Usando anota��es nos controllers e DTOs, � poss�vel gerar uma documenta��o interativa da API automaticamente.
*   **Impacto:** Facilita o consumo da API por outros desenvolvedores (ou pelo pr�prio time de frontend) e serve como uma fonte �nica de verdade para os endpoints.

### 4. Otimiza��o de Performance
*   **Backend:** Implementar um sistema de **cache com Redis** para queries frequentes, como a busca de categorias ou a p�gina inicial de itens.
*   **Frontend:**
    *   **Code Splitting:** Separar o c�digo de rotas que n�o s�o acessadas com frequ�ncia (como o painel de Admin) para que s� sejam carregadas quando necess�rio.
    *   **Otimiza��o de Imagens:** Usar formatos modernos (como WebP) e lazy loading para as imagens dos itens.
*   **Impacto:** Reduz o tempo de carregamento e melhora a responsividade da aplica��o.

### 5. Migra��o do Banco de Dados para Produ��o
*   **Descri��o:** Manter o **SQLite** para desenvolvimento local, mas configurar o TypeORM para usar um banco de dados mais robusto para o ambiente de produ��o, como **PostgreSQL** ou **MySQL**.
*   **Impacto:** Garante escalabilidade, concorr�ncia e seguran�a dos dados em um ambiente real.

### 6. Refatora��o para Inje��o de Depend�ncia
*   **Descri��o:** No backend, em vez de instanciar os servi�os diretamente nos controllers (`new UserService()`), utilizar um cont�iner de inje��o de depend�ncia (como o `tsyringe` ou `typedi`).
*   **Impacto:** Desacopla os componentes, tornando o c�digo mais modular e muito mais f�cil de testar (pois permite "mockar" as depend�ncias).

```

<!--
[PROMPT_SUGGESTION]Como eu poderia implementar o sistema de avalia��o (Rating), do frontend ao backend?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Gere o c�digo para adicionar testes unit�rios ao `user.service.ts` usando Jest.[/PROMPT_SUGGESTION]




