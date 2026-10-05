# Banco de dados

## Estado atual

O Marco 1 provisiona o datasource **GLPI MySQL** usando variáveis de ambiente. Ele se conecta ao banco `glpi` pelo serviço MariaDB local, usando acesso proxy do MySQL e uma conta read-only. A saúde do datasource e a conectividade read-only direta com o MariaDB foram validadas no ambiente de testes. O MariaDB permanece vinculado a `127.0.0.1:3306`; sua porta não é exposta à rede. O Marco 2 descobriu e validou as relações do schema do Service Desk documentadas abaixo. As queries do dashboard do Marco 3 são read-only e estão versionadas em `sql/queries/`; nenhum objeto SQL foi criado no banco. Não generalize estes achados para outras instalações do GLPI sem validar seus schemas.

## Acesso

O host de testes atual usa a conta dedicada `grafana_reader@localhost`, com acesso somente `SELECT` em `glpi.*`. Ela não deve ter privilégios `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER` ou `DROP`. A concessão abaixo está documentada apenas conceitualmente; foi aplicada pelo processo de administração do banco e não é executada por este projeto:

```sql
GRANT SELECT ON glpi.* TO 'grafana_reader'@'localhost';
```

Uma conta anterior associada ao IP de rede do host não foi suficiente para esta conexão local. O MariaDB está vinculado a `127.0.0.1:3306`; portanto, não o documente nem configure como exposto à rede. Em outras implantações, escolha um host de conta com restrições adequadas à topologia de rede real.

## Achados verificados do discovery do Service Desk

O Marco 2 — Discovery do banco de dados está concluído. Os achados foram conferidos no ambiente de testes e comparados com a interface do GLPI. Aqui são registrados apenas os achados estruturais e os significados de domínio necessários aos relatórios do Service Desk; resultados brutos do ambiente e dados de chamados foram omitidos.

### Chamados e domínios

`glpi_tickets` é a tabela central de chamados. Para métricas comuns, use `is_deleted = 0` como filtro padrão. Os valores de status confirmados são:

| Valor armazenado | Significado confirmado |
| --- | --- |
| 1 | Novo |
| 2 | Em processamento (atribuído) |
| 3 | Em processamento (planejado) |
| 4 | Pendente |
| 5 | Solucionado |
| 6 | Fechado |

Os tipos de chamado confirmados são `1 = Incidente` e `2 = Solicitação`.

### Usuários, técnicos e grupos

As relações entre chamados e usuários usam `glpi_tickets_users` → `glpi_users`. Os significados confirmados de `glpi_tickets_users.type` são `1 = solicitante`, `2 = atribuído/técnico` e `3 = observador`. Um chamado pode ter vários usuários relacionados e vários técnicos; as queries devem preservar essa cardinalidade.

As relações com grupos usam `glpi_groups_tickets` → `glpi_groups`. As tabelas da relação foram identificadas, mas o ambiente atual não contém linhas para essa relação. Não infira atribuições de grupos nem trate essa relação vazia como evidência de que grupos nunca são usados.

### Categorias e entidades

As categorias dos chamados se relacionam por `glpi_tickets.itilcategories_id` → `glpi_itilcategories.id`. As categorias são hierárquicas; quando for necessário o caminho completo, use `completename` em vez de apenas `name`. Chamados podem não ter categoria.

As entidades dos chamados se relacionam por `glpi_tickets.entities_id` → `glpi_entities.id`. Há múltiplas entidades; portanto, não presuma uma única entidade para todos os chamados.

### Ciclo de vida e SLA

A sequência validada do ciclo de vida do chamado é `date` → `takeintoaccountdate` → `solvedate` → `closedate`. Antes de usar uma data em uma métrica futura, valide qual timestamp do ciclo de vida responde àquela métrica.

`time_to_own` e `time_to_resolve` são prazos de SLA, não durações decorridas. `takeintoaccount_delay_stat` e `solve_delay_stat` são campos de tempo estatístico/efetivo. A interpretação do SLA pode depender de calendários. As estruturas relevantes de SLA incluem `glpi_slas`, `glpi_slalevels`, `glpi_slalevels_tickets`, `glpi_slalevelactions` e `glpi_slalevelcriterias`.

### Cardinalidade dos joins

As relações com usuários/técnicos, grupos, categorias e entidades podem alterar a quantidade de linhas após joins. Não presuma que um resultado com joins tenha uma linha por chamado. Conforme a métrica, use `COUNT(DISTINCT t.id)` ou pré-agregue cada relação um-para-muitos antes de combiná-la com as linhas de chamados. As queries exploratórias em `sql/discovery/10-cardinality.sql` documentam as verificações de cardinalidade realizadas.

Os resultados SQL do ambiente de testes foram comparados com a interface do GLPI e considerados coerentes. Estes achados concluem somente o discovery; não implementam nem validam métricas de produção do dashboard. Os scripts exploratórios permanecem em `sql/discovery/` para reprodutibilidade e devem ser executados com acesso read-only.

## Achados verificados do discovery de Projetos

O discovery de Projetos está em andamento para o ambiente de testes. `glpi_projects` é a tabela central de projetos, e `glpi_projecttasks.projects_id` relaciona tarefas a `glpi_projects.id`. A conclusão do estado do projeto é representada por `glpi_projectstates.is_finished`. O valor `projectstates_id = 0` ocorre e significa **Sem estado**; não deve ser interpretado como um estado ativo.

Há projetos em múltiplas entidades; portanto, todas as métricas de projetos devem respeitar o escopo `$entity` selecionado. Métricas de tarefas devem aplicar esse escopo por meio da entidade do projeto pai. A relação projeto-tarefa é um-para-muitos; joins futuros devem considerar essa cardinalidade.

Tipos de projeto e milestones não têm uso relevante no ambiente atual. As datas planejadas e reais têm baixa cobertura. `percent_done` e campos de usuário responsável são utilizados. Campos de grupo não têm uso relevante no ambiente atual. Nenhum nome interno de entidade, projeto ou usuário, nem dados brutos do ambiente, é registrado aqui.
