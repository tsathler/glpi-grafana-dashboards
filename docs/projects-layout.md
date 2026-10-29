# Layout do GLPI Projects

O dashboard principal de Projetos usa somente painéis nativos do Grafana e mantém indicadores, distribuições e tabela operacional em `glpi-projects.json`. O UID `glpi-projects` foi preservado.

| Seção | Painéis | `x, y, w, h` |
| --- | --- | --- |
| Indicadores | Total, não finalizados, finalizados e progresso médio | `0/6/12/18, 2, 6, 3` |
| Distribuição | Projetos por estado, projetos por prioridade e tarefas por estado | `0/8/16, 5, 8, 5` |
| Operação | Tabela de projetos em largura total | `0, 10, 24, 14` |

Os indicadores são snapshots atuais e não usam o time picker. Todas as métricas filtram a variável **Entity**. Projetos não finalizados incluem os sem estado; projetos finalizados são determinados por `glpi_projectstates.is_finished`, sem usar `percent_done` como critério.

A tabela mantém uma linha por projeto válido, com tarefas pré-agregadas por projeto para evitar multiplicação de linhas. A coluna de progresso usa a célula nativa de gauge do Grafana. O link da coluna de ID abre o formulário do projeto no GLPI; para habilitá-lo, gere a cópia local usando a URL base do ambiente conforme [URL local do GLPI](glpi-local-url.md). A URL específica não é incorporada ao JSON versionado.

Os gráficos e tabela preservam os nomes de estado cadastrados no GLPI. O estado `projectstates_id = 0` é apresentado como **Sem estado**. O layout foi dimensionado para Full HD sem rolagem horizontal em condições usuais; barras de navegação, filtros, zoom e altura útil podem exigir rolagem vertical.

O schema e as consultas foram verificados em um ambiente GLPI específico. A composição atual do dashboard ainda depende de validação integrada no Grafana; não se declara validação de runtime nesta refatoração.
