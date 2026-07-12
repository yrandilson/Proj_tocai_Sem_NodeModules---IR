<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Changelog - TrocaAi

## [v1.2.5] - 10 Abril 2026

### Ambiente Local e Validacao Funcional

- Backend atualizado para aceitar CORS em desenvolvimento com multiplas origens locais:
  - `http://localhost:5173`
  - `http://localhost:5174`
- Variavel de ambiente padrao definida para frontend local em `back/.env`:
  - `FRONTEND_URL=http://localhost:5174`

### Smoke Tests Executados

- Fluxos criticos (usuario comum) validados com sucesso:
  - criacao de item
  - favoritos
  - proposta
  - chat
  - notificacoes
- Resultado: **5/5 aprovado**

- Smoke test de administrador validado com sucesso:
  - `GET /api/admin/stats`
  - `GET /api/admin/top-categories`
  - `GET /api/admin/recent-activity`
  - `GET /api/admin/growth-data`
  - `GET /api/users`
  - validacao de bloqueio de acesso para nao-admin (`403`)
- Resultado: **6/6 aprovado**

## [v1.2.4] - 10 Abril 2026

### Sistema de Atualizacao Continua da Documentacao

- Metadados de revisao aplicados em todos os documentos ativos (DOC-META)
  - `status=ativo`
  - `ultima_revisao=2026-04-10`
  - `proxima_revisao=trimestral`
- Processo oficial criado:
  - `01_visao_geral/PROCESSO_ATUALIZACAO_DOCUMENTACAO.md`
- Template padrao criado:
  - `01_visao_geral/TEMPLATE_DOCUMENTO_PADRAO.md`
- `README` da documentacao atualizado com regra obrigatoria de governanca

## [v1.2.3] - 10 Abril 2026

### ?? Auditoria de Duplicidade Documental

- Varredura completa de `.md` e `.txt` em `Documentacao_Proj_tocai/`
- Identificados grupos de duplicidade exata e por nome/assunto
- Arquivos vazios e duplicados operacionais movidos para:
  - `99_arquivo_historico/duplicados_identificados_2026-04-10/`

### ?? Curadoria Aplicada

- Mantido um arquivo canonico por assunto em cada categoria
- Duplicados preservados somente em historico (sem perda de rastreabilidade)
- Relatorio tecnico criado:
  - `09_relatorios_revisoes/ANALISE_DUPLICIDADE_DOCUMENTACAO_2026-04-10.md`

## [v1.2.2] - 10 Abril 2026

### ?? Reorganizacao Completa da Documentacao

- Documentacao consolidada em estrutura unica por area de estudo do sistema
- Pastas tematicas criadas na raiz de `Documentacao_Proj_tocai/`
- Conteudo historico e duplicado preservado em `99_arquivo_historico/`
- Diretorios legados antigos removidos apos migracao de conteudo
- Indice mestre criado em `Documentacao_Proj_tocai/README.md`

### ??? Nova Taxonomia

- `01_visao_geral`
- `02_arquitetura_design`
- `03_requisitos_conformidade`
- `04_backend_api_dados`
- `05_frontend_ux`
- `06_testes_qualidade`
- `07_operacao_setup_deploy`
- `08_seguranca`
- `09_relatorios_revisoes`
- `10_apresentacoes`
- `11_fluxos_uml`
- `99_arquivo_historico`

## [v1.2.1] - 10 Abril 2026

### ?? Organiza��o de Estrutura

- Limpeza automatica de artefatos gerados no frontend (`front/src/src/**/*.js`) quando havia arquivo fonte correspondente (`.ts` ou `.vue`)
- Total removido: **75 arquivos gerados**
- `tsconfig` do frontend atualizado com `noEmit: true` para evitar nova geracao de JS dentro de `src/`

### ?? Padroniza��o de Workspace

- Criado `README.md` na raiz com guia de estrutura e execucao
- Criado `.gitignore` na raiz com regras unificadas para todo workspace
- Criado `Documentacao_Proj_tocai/README.md` como indice de navegacao da documentacao

## [v1.2.0] - 10 Abril 2026

### ??? Adapta��o de Banco (MySQLite)

- **Suporte dual no backend**: `DB_TYPE` agora alterna entre `mysql` e `sqlite`
- **Configura��o unificada** em `back/src/config/database.ts`
  - `DB_TYPE=mysql` usa `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `DB_TYPE=sqlite` usa `DB_DATABASE` (incluindo `:memory:` para testes)
- **Compatibilidade com SQLite nos testes**:
  - enums convertidos para `simple-enum` em entidades cr�ticas (`Item`, `Proposal`, `Report`, `Notification`)
  - setup de teste padronizado com SQLite em mem�ria

### ?? Seguran�a e Hardening

- **JWT sem fallback inseguro** no `AuthService`
  - remo��o de `your_secret_key`
  - uso obrigat�rio de `getJWTSecret()` e `JWT_CONFIG.expiresIn`
- **Remo��o de logs sens�veis** do fluxo de login
  - sem exposi��o de senha recebida
- **Prote��es HTTP adicionadas** em `back/src/app.ts`
  - `helmet`
  - `express-rate-limit`

### ??? Corre��es Funcionais

- **Rotas duplicadas removidas**
  - `/users/:id/role` duplicada eliminada
  - endpoint redundante de exclus�o de conversa removido
- **Rota de detalhes de den�ncia adicionada**
  - `GET /api/reports/:id` (admin)
- **Ajuste de resposta de login para usu�rio bloqueado**
  - retorna `Usu�rio bloqueado.` quando aplic�vel

### ?? Testes e Build

- **Backend**: su�te Jest 100% verde
  - `7/7` su�tes
  - `23/23` testes
- **Frontend**: build de produ��o validado com sucesso via Vite

### ?? Tooling

- **TypeScript**: compatibilidade com aviso de deprecia��o tratada em `back/tsconfig.json`
  - `ignoreDeprecations: "6.0"`

## [v1.1.0] - 17 Outubro 2025

### ?? Seguran�a

#### JWT Security - CR�TICO
- **Eliminados fallbacks inseguros**: Removidos TODOS os `'default_secret'` e `'secret'`
- **Centraliza��o JWT**: Criado `backend/src/config/jwt.ts` com fun��o `getJWTSecret()`
  - Valida obrigatoriamente a presen�a de `JWT_SECRET` no ambiente
  - Lan�a erro se n�o configurado (evita tokens inseguros)
- **Arquivos Corrigidos**:
  - `backend/src/middlewares/auth.middleware.ts`
  - `backend/src/services/user.service.ts`
  - `backend/src/entities/user.service.ts`
  - `backend/src/services/chat.socket.ts`
  - `backend/src/websocket/chat.socket.ts`

#### Prote��o de Dados
- **Admin Protection**: Implementado `beforeAll()` em `backend/src/__tests__/setup.ts`
  - Garante que usu�rio admin existe antes de cada teste
  - Evita falhas em testes por falta de dados iniciais

### ?? Corre��es T�cnicas

#### Backend
- **WebSocket**: Corrigido uso de singleton `ChatSocketHandler.getInstance()`
- **TypeScript**: Corrigidos erros LSP em tratamento de erros (tipo `unknown`)
- **Database**: Foreign keys habilitadas no SQLite

#### Frontend
- **Vite HMR**: Otimizado WebSocket para funcionar no Replit
  - `protocol: 'ws'` configurado
  - `clientPort: 5000` definido
- **TypeScript**: Instalado `@types/node` para suporte a m�dulos Node
- **CORS**: Configurado para aceitar todas origens em desenvolvimento

#### Workflows
- **Limpeza**: Removidos workflows duplicados (Backend, Frontend, Server)
- **Otimiza��o**: Mantido apenas workflow "TrocaAi" usando `concurrently`
- **Performance**: Backend + Frontend rodando simultaneamente

### ?? Documenta��o

#### Criados
- ? `replit.md` - Documenta��o completa do projeto
  - Vis�o geral e tecnologias
  - Estrutura do projeto
  - Como executar (Replit e local)
  - Credenciais admin
  - API endpoints
  - Troubleshooting
  
- ? `GOOGLE_MAPS_INTEGRATION.md` - Guia de integra��o Google Maps
  - Como obter API key
  - Configura��o passo-a-passo
  - C�digo de exemplo
  - Solu��o de problemas
  
- ? `EXPORT_INSTRUCTIONS.md` - Como rodar localmente
  - Download do projeto
  - Instala��o de depend�ncias
  - Configura��o de ambiente
  - Execu��o local

#### Atualizados
- ? `.gitignore` - Ignorar arquivos tempor�rios e sens�veis
- ? `README.md` - Links para documenta��o adicional

### ?? Deployment

- **Replit Deploy**: Configurado autoscale deployment
  - Build do frontend antes do deploy
  - Backend servindo API em localhost:3000
  - Frontend servindo em 0.0.0.0:5000 (porta p�blica)

### ?? Testes

- **Admin Protection**: Testes n�o deletam mais o usu�rio admin
- **Cleanup**: Melhorado processo de limpeza entre testes
- **Stability**: Testes mais confi�veis e previs�veis

---

## [v1.0.0] - Vers�o Inicial

### ? Funcionalidades

#### Autentica��o
- Registro de usu�rios
- Login com JWT
- Autoriza��o baseada em roles (Admin/Common)

#### Gest�o de Items
- CRUD completo de items
- Upload de imagens
- Categoriza��o de items
- Localiza��o no mapa

#### Sistema de Propostas
- Cria��o de propostas de troca
- Aceitar/Recusar propostas
- Status de propostas (pendente, aceita, recusada)

#### Chat em Tempo Real
- WebSocket com Socket.IO
- Mensagens em tempo real
- Indicador de digita��o
- Notifica��es de mensagens n�o lidas

#### Notifica��es
- Sistema de notifica��es em tempo real
- Push notifications via WebSocket
- Contador de n�o lidas

#### Avalia��es e Den�ncias
- Sistema de avalia��es de usu�rios
- Den�ncias de items/usu�rios
- Painel administrativo

#### Painel Admin
- Gest�o de usu�rios
- Modera��o de conte�do
- Estat�sticas do sistema

---

## ?? Pr�ximas Melhorias Sugeridas

### ?? Features
- [ ] Sistema de favoritos
- [ ] Filtros avan�ados de busca
- [ ] Hist�rico de trocas
- [ ] Sistema de reputa��o gamificado

### ?? T�cnicas
- [ ] Migra��o para PostgreSQL (produ��o)
- [ ] Cache com Redis
- [ ] CDN para imagens
- [ ] Testes E2E com Cypress

### ?? Mobile
- [ ] PWA (Progressive Web App)
- [ ] App nativo React Native
- [ ] Notifica��es push mobile

---

**Desenvolvido com ?? por Dev-Connect**




