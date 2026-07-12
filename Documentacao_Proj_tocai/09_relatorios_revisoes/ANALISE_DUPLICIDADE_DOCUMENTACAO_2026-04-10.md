<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# Analise de Duplicidade da Documentacao (10/04/2026)

## Escopo

- Diretorio analisado: `Documentacao_Proj_tocai/`
- Tipos: `.md` e `.txt`
- Metodo: comparacao por hash de conteudo normalizado e por nome semelhante

## Resumo

- Total de documentos analisados: 53
- Grupos com duplicidade exata: 7
- Grupos com duplicidade por nome/assunto: 4
- Curadoria aplicada: sim (sem perda de historico)

## Duplicados exatos encontrados

1. `readDOIS.md` e `trocaai_project_compliance.md`
- Status: duplicados de conteudo
- Decisao: manter `03_requisitos_conformidade/trocaai_project_compliance.md`
- Acao: `01_visao_geral/readDOIS.md` movido para `99_arquivo_historico/duplicados_identificados_2026-04-10/`

2. `RELATORIO_FINAL_CORRECAO_V2.md` e `Relat�rio Final de Revis�o e Corre��o de Erros (Vers�o 2).md`
- Status: duplicados de conteudo
- Decisao: manter `09_relatorios_revisoes/RELATORIO_FINAL_CORRECAO_V2.md`
- Acao: versao duplicada movida para `99_arquivo_historico/duplicados_identificados_2026-04-10/`

3. `SIMULACAO_FUNCIONALIDADES.md` e `SIMULACAO_FUNCIONALIDADES (2).md`
- Status: duplicados de conteudo
- Decisao: manter versao em `11_fluxos_uml/`
- Acao: copia mantida em `99_arquivo_historico/`

4. `trocaai_detailed_flow.md` e `trocaai_detailed_flow - Copia.md`
- Status: duplicados de conteudo
- Decisao: manter versao em `11_fluxos_uml/`
- Acao: copia mantida em `99_arquivo_historico/`

5. `Funcionalidades Essenciais Gest�o d.md` e `Funcionalidades Essenciais Gest�o d.txt`
- Status: duplicados de conteudo
- Decisao: manter formato `.md`
- Acao: ambos permanecem em historico para rastreabilidade

## Arquivos vazios identificados e tratados

- `01_visao_geral/README.md` (vazio)
- `02_arquitetura_design/DOCUMENTACAO.md` (vazio)
- `07_operacao_setup_deploy/INSTALACAO.md` (vazio)

Acao aplicada: movidos para `99_arquivo_historico/duplicados_identificados_2026-04-10/`.

## O que realmente importa (base can�nica recomendada)

- Visao geral: `01_visao_geral/manual_sistema.md`, `01_visao_geral/mapa_mental_estrutura.md`
- Arquitetura: `02_arquitetura_design/arquitetura_funcionamento.md`, `02_arquitetura_design/diagrama_classes_uml.md`, `02_arquitetura_design/diagrama_arquitetura_componentes.md`
- Requisitos: `03_requisitos_conformidade/documento_requisitos.md`, `03_requisitos_conformidade/CONFORMIDADE_REQUISITOS.md`
- Backend/API: `04_backend_api_dados/DOCUMENTACAO_PROJETO.md`, `04_backend_api_dados/rotas_endpoints.md`
- Testes: `06_testes_qualidade/README_TESTES.md`, `06_testes_qualidade/casos_de_teste.md`
- Operacao: `07_operacao_setup_deploy/GUIA_CRIACAO_DO_ZERO.md`, `07_operacao_setup_deploy/EXPORT_INSTRUCTIONS.md`, `07_operacao_setup_deploy/replit.md`
- Seguranca: `08_seguranca/SECURITY_IMPROVEMENTS.md`, `08_seguranca/security_summary.md`
- Revisoes: `09_relatorios_revisoes/RELATORIO_FINAL_CORRECAO_V2.md`, `09_relatorios_revisoes/RELATORIO_ANALISE.md`, `09_relatorios_revisoes/CHANGELOG.md`
- Fluxos: `11_fluxos_uml/trocaai_detailed_flow.md`, `11_fluxos_uml/SIMULACAO_FUNCIONALIDADES.md`

## Proximo passo recomendado

Criar um documento "canonico" por categoria com status `ativo` e marcar os demais como `historico` no topo do arquivo, para eliminar ambiguidade em futuras consultas.




