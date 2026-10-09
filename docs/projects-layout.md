# Layout do GLPI Projects

O dashboard usa layout customizado em uma grade de 24 colunas. No Grafana, cada unidade de altura de `gridPos` representa 30 px; o layout mantém o Kanban como painel principal e move a tabela operacional para `glpi-projects-detail.json`, com navegação entre os dashboards.

## Distribuição

| Linha | Painéis | `x, y, w, h` |
| --- | --- | --- |
| Cabeçalho | Título compacto | `0, 0, 24, 2` |
| Indicadores | 4 Stat | `0/6/12/18, 2, 6, 3` |
| Gráficos | Estado, prioridade, tarefas | `0/8/16, 5, 8, 5` |
| Kanban | Business Text, largura total | `0, 10, 24, 16` |
| Detalhamento | Tabela operacional no dashboard secundário | `0, 0, 24, 24` |

O conteúdo principal ocupa 26 unidades, ou 780 px de altura de grade. Em 1920×1080 espera-se que caiba sem rolagem vertical na maioria das configurações; a barra do Grafana, os filtros, o zoom do navegador e a altura útil da janela afetam o espaço. Em telas menores, a página pode rolar verticalmente. As colunas ocupam igualmente a largura quando cabem com largura mínima de 245 px; quando não couberem, o Kanban rola horizontalmente. Os cartões rolam internamente dentro das colunas, limitados a 380 px.

Os quatro indicadores mantêm a largura uniforme. Os três gráficos dividem a linha em partes iguais. A tabela fica acessível pelo link **Tabela operacional**, e o dashboard de detalhamento tem link de retorno.

## Painel de prioridade

A consulta retorna `priority` como texto para fornecer categorias ao eixo do Bar chart. O agrupamento e a ordenação continuam baseados na prioridade original; as contagens continuam contando projetos distintos e os filtros de projetos válidos e Entity permanecem. O painel não tem transformações configuradas. A alteração corrige localmente a forma do campo categórico, mas a causa original de `An unexpected error happened` não pode ser confirmada sem erro detalhado ou reprodução no Grafana.

Se o erro persistir, colete: (1) Query Inspector > Query, incluindo o SQL interpolado, (2) Query Inspector > Data/JSON com nomes e tipos dos campos e uma amostra anonimizada, (3) detalhes do erro no painel e no console do navegador, (4) versão efetiva do Grafana e do plugin, e (5) export do JSON do painel após abrir em edição. Não inclua credenciais nem nomes/dados reais do GLPI.

Para regenerar os dashboards após editar os fontes do Kanban ou sua consulta, execute `node scripts/build-project-kanban.mjs` na raiz do repositório. O JSON secundário reutiliza a consulta operacional existente; não há um segundo arquivo SQL.

O painel Business Text usa `renderMode: allRows`, registra `renderKanban` em `helpers`, define `editor.format` como HTML e reserva `afterRender` vazio. HTML e CSS são incorporados de arquivos versionados. A sanitização padrão do plugin continua habilitada. O validador SQL também verifica essas opções para detectar regressões no JSON gerado.
