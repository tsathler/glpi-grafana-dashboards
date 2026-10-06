# Métricas

## Implementadas

O dashboard provisionado **GLPI Service Desk** contém sete snapshots do estado atual e uma série temporal do Marco 3, além de um Gauge adicionado posteriormente. Suas queries read-only estão versionadas em `sql/queries/`:

- **Chamados novos:** chamados atuais com status `1` e `is_deleted = 0`.
- **Chamados atribuídos:** chamados atuais com status `2` e `is_deleted = 0`.
- **Chamados planejados:** chamados atuais em Processando (planejado), com status `3` e `is_deleted = 0`.
- **Chamados atrasados:** chamados atuais não excluídos logicamente, com `status NOT IN (4, 5, 6)`, `solvedate IS NULL` e prazo TTR `time_to_resolve` não nulo, calculado pelo GLPI e anterior a `NOW()`.
- **Chamados solucionados:** chamados atuais com status `5` e `is_deleted = 0`.
- **Chamados pendentes:** chamados atuais com status `4` e `is_deleted = 0`.
- **Chamados:** total de chamados atuais com `is_deleted = 0`.
- **Fluxo de chamados:** chamados criados por `date` em comparação com os solucionados por `solvedate`, agrupados pelo intervalo adaptativo do Grafana e pelo período selecionado, em ordem por `time`. **Saldo** é `Criados - Solucionados` em cada intervalo: positivo significa que entraram mais chamados do que foram solucionados; negativo, que mais foram solucionados do que entraram; e zero, equilíbrio naquele intervalo.
- **Eficiência de resolução (SLA):** percentual de chamados solucionados com prazo TTR aplicável, calculado pelo GLPI, que foram solucionados até esse prazo. Mede o cumprimento do TTR entre chamados solucionados, não a eficiência geral da equipe.

A variável de dashboard **Entity** consulta `glpi_entities`, exibe `completename` e usa `id` como valor selecionado. Ela oferece **All** e filtra todos os cards e as queries de métricas; nenhuma entidade é fixa na query. Os sete cards são snapshots do estado atual e não usam o time picker do dashboard. A série temporal respeita o período selecionado. Todas as queries filtram `is_deleted = 0`. As queries dos cards leem diretamente a tabela de chamados; a query de atrasados não faz join com tabelas de SLA nem reconstrói regras de calendário. Um chamado aberto só é contado como atrasado quando o GLPI preencheu `time_to_resolve` e esse prazo é anterior ao horário atual do banco (`NOW()`). Chamados sem prazo TTR calculado não são contados como atrasados. A query usa o prazo calculado pelo GLPI conforme armazenado, sem recalcular separadamente um eventual calendário de SLA.

## Fórmula de Eficiência de resolução (SLA)

- **Numerador:** chamados solucionados com `is_deleted = 0`, `solvedate` não nulo e `time_to_resolve` não nulo, para os quais `solvedate <= time_to_resolve`.
- **Denominador:** todos os chamados solucionados com `is_deleted = 0`, `solvedate` não nulo e `time_to_resolve` não nulo. Chamados sem prazo TTR aplicável e chamados ainda não solucionados são excluídos.
- A query respeita **Entity** e filtra o período selecionado por `solvedate`. Ela usa o prazo calculado e armazenado pelo GLPI; não reconstrói calendários de SLA.
- O resultado é um percentual de 0 a 100. `NULL` significa que não houve chamados solucionados elegíveis no período selecionado. A métrica representa o cumprimento do TTR entre chamados solucionados, não a eficiência geral da equipe.

## Status da validação

A validação de runtime de **Eficiência de resolução (SLA)** está concluída. O percentual do Gauge foi comparado diretamente com uma query SQL equivalente no ambiente de testes, e ambos apresentaram o mesmo percentual. O cálculo validado considera somente chamados solucionados não excluídos logicamente e com prazo TTR calculado pelo GLPI não nulo; conta o chamado dentro do TTR quando `solvedate <= time_to_resolve`, aplica a Entity selecionada e o time picker por `solvedate`, e retorna `NULL` quando não há chamados elegíveis. Nenhum percentual observado, quantidade de chamados, nome de entidade, data do teste ou dado de chamado é registrado. A validação de runtime das métricas principais no Grafana também está concluída. A variável Entity funciona e os sete cards respeitam a entidade selecionada. Os valores dos cards foram comparados com a interface do GLPI e considerados coerentes; a regra de atrasados corresponde ao comportamento validado nela. O card Chamados usa formatação compacta, e os demais exibem valores inteiros. O Fluxo de chamados funciona com Criados, Solucionados e Saldo, em que Saldo = Criados - Solucionados. A série temporal respeita o período selecionado, enquanto os snapshots permanecem independentes dele.

## Preparação para produção

Antes do go-live, validar o plano de execução (`EXPLAIN`) e o desempenho das queries com dados e carga representativos. Esta revisão ainda está planejada; não representa validação de performance em produção.

Outros indicadores de SLA, métricas de TTO, categorias, métricas de técnicos, métricas de entidade além da seleção/filtragem, envelhecimento do backlog e outras métricas estão fora do escopo do Marco 3 e permanecem como trabalho futuro. O card de atrasados é somente uma classificação do estado atual baseada no prazo; não é um cálculo de SLA reconstruído.

## MVP de Projetos — queries implementadas, dashboard pendente

As oito queries read-only do MVP estão versionadas separadamente em `sql/projects/queries/`, sem correspondência com painéis do Service Desk. Elas cobrem:

- projetos não finalizados, incluindo projetos sem estado;
- projetos finalizados;
- projetos sem estado;
- média de `percent_done` dos projetos válidos, que não representa uma taxa de conclusão;
- projetos por estado;
- projetos por prioridade, usando o valor armazenado;
- tarefas por estado, filtradas pela entidade do projeto pai;
- tabela operacional com quantidade de tarefas.

Todas as consultas filtram projetos válidos por `is_deleted = 0`, `is_template = 0` e `$entity`; consultas de tarefas também filtram registros válidos e usam o escopo da entidade do projeto pai. `projectstates_id = 0` é rotulado como **Sem estado** e incluído entre os não finalizados; por isso, os indicadores de não finalizados e sem estado se sobrepõem intencionalmente. Estados finalizados são identificados por `glpi_projectstates.is_finished = 1`; `percent_done` não é usado para inferir conclusão. A tabela operacional pré-agrega tarefas por projeto para preservar a relação 1:N.

As oito queries foram validadas diretamente no banco em mais de um escopo de entidade. As contagens por estado fecharam com os indicadores; a tabela manteve uma linha por projeto; e a soma das tarefas pré-agregadas coincidiu com a distribuição de tarefas por estado. O dashboard de Projetos foi implementado, mas ainda precisa de validação integrada no Grafana. Não foram adicionadas métricas de atraso, prazos, timeline ou Gantt.
