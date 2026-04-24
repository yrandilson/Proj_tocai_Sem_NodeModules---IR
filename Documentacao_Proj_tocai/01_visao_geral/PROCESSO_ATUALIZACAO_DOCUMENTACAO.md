<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Processo de Atualizacao da Documentacao

## Objetivo

Garantir que a documentacao evolua junto com o projeto, sem ficar desatualizada.

## Regra obrigatoria por mudanca de codigo

Sempre que houver mudanca relevante no sistema, atualizar os documentos afetados no mesmo ciclo de entrega.

## Quando atualizar

Atualize documentacao em qualquer um destes casos:

- nova funcionalidade
- alteracao de regra de negocio
- mudanca de endpoint, payload ou autenticacao
- mudanca de estrutura de banco de dados
- mudanca de fluxo de tela
- mudanca de setup/deploy
- correcao de seguranca

## Checklist minimo por PR/entrega

1. Atualizou `09_relatorios_revisoes/CHANGELOG.md`
2. Revisou documentos da area impactada
3. Atualizou exemplos de request/response (quando houver API)
4. Atualizou fluxos e diagramas (quando houver alteracao de fluxo)
5. Atualizou guias de operacao (quando houver mudanca de setup)
6. Validou links internos principais da documentacao

## Matriz de impacto (o que atualizar)

- Backend/API: `04_backend_api_dados/`, `08_seguranca/`, `06_testes_qualidade/`
- Frontend/UX: `05_frontend_ux/`, `11_fluxos_uml/`, `06_testes_qualidade/`
- Requisitos: `03_requisitos_conformidade/`, `09_relatorios_revisoes/`
- Operacao/Deploy: `07_operacao_setup_deploy/`, `01_visao_geral/`

## Frequencia de revisao geral

- Revisao rapida semanal: docs criticos (API, setup, seguranca)
- Revisao completa trimestral: toda a base ativa

## Politica de status dos documentos

- `status=ativo`: documento oficial em uso
- `status=historico`: referencia antiga, nao usar como fonte principal

## Dono recomendado

- Backend: responsavel tecnico backend
- Frontend: responsavel tecnico frontend
- Operacao: responsavel por infra/deploy
- Consolidacao: maintainer principal do projeto


