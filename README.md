# TrocaAi - Workspace

Este workspace contem 3 areas principais:

- `back/`: API backend (Node.js + TypeScript + TypeORM)
- `front/src/`: frontend SPA (Vue 3 + Vite + TypeScript)
- `Documentacao_Proj_tocai/`: documentacao tecnica, relatorios e material de apoio

## Estrutura recomendada

- Codigo executavel fica somente em `back/` e `front/src/`
- Artefatos gerados (dist, js compilado, node_modules) nao devem ser versionados
- Documentacao funcional e tecnica centralizada em `Documentacao_Proj_tocai/`

## Como rodar localmente

### Backend

1. Acesse `back/`
2. Instale dependencias: `npm install`
3. Configure variaveis de ambiente com base em `.env.example`
4. Rode em desenvolvimento: `npm run dev`
5. Rode testes: `npm test -- --runInBand --silent`

### Frontend

1. Acesse `front/src/`
2. Instale dependencias: `npm install`
3. Rode em desenvolvimento: `npm run dev`
4. Build de producao: `npm run build`

## Banco de dados (modo MySQLite)

O backend suporta dois modos via `DB_TYPE`:

- `mysql`: usa `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `sqlite`: usa `DB_DATABASE` (incluindo `:memory:` para testes)

## Observacao de organizacao

Foi aplicada limpeza automatica de artefatos JavaScript gerados dentro de `front/src/src/` quando havia arquivo-fonte correspondente (`.ts` ou `.vue`).
