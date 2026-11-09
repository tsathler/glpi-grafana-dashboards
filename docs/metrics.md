# Métricas

## Implementadas

O dashboard provisionado **GLPI Service Desk** contém sete snapshots do estado atual e uma série temporal do Marco 3, além de um Gauge adicionado posteriormente. Suas queries read-only estão versionadas em `sql/queries/`:

Os IDs de status usados pelas queries correspondem aos valores descobertos e validados na instalação GLPI de referência deste projeto. Eles não formam uma garantia para outras versões ou instalações; execute novamente o discovery e compare os domínios antes da reutilização.

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

## Dashboard de Projetos

O dashboard de Projetos tem seis indicadores de projeto e seis de tarefas: total, em andamento, finalizados, não inicializados (projetos: não inicializados/pausados), outros e progresso médio dos itens em andamento. Os gráficos **Projetos por estado** e **Tarefas por estado** foram removidos.

As queries read-only estão versionadas em `sql/projects/queries/`. Todas filtram projetos válidos por `is_deleted = 0`, `is_template = 0` e `$entity`; consultas de tarefas também filtram registros válidos e usam a entidade do projeto pai. As categorias usam os rótulos confirmados em TEST: **Em andamento** para itens em andamento e **A Fazer** para itens não inicializados. Estados finalizados usam `glpi_projectstates.is_finished = 1`. Estados de projeto cujo nome contém `paus` entram no grupo de não inicializados/pausados. **Outros** inclui `projectstates_id = 0` (sem estado) e estados restantes não finalizados. `percent_done` não é usado para inferir conclusão; o progresso médio é calculado somente para os itens em **Em andamento**.

O schema e os rótulos de estado foram verificados na instalação TEST GLPI 11, mas as queries revisadas ainda precisam ser executadas no MariaDB e validadas no Grafana. Validação estática não substitui validação de banco. Não foram adicionadas métricas de atraso, prazos, timeline ou Gantt.

### Membros da equipe em tarefas

O painel **Tarefas por membro da equipe** usa `glpi_projecttaskteams.projecttasks_id`, `itemtype = 'User'` e `items_id`, conforme discovery validado na interface do GLPI. `glpi_projecttasks.users_id` não é usado, pois identifica o criador. Cada usuário da equipe recebe uma contagem distinta da tarefa; membros do tipo grupo não são expandidos. Tarefas sem vínculo `User` aparecem em **Sem usuário na equipe**. Os nomes usam `glpi_users.firstname` e `realname`; quando a conta não pode ser identificada como ativa, não excluída e com nome disponível, o painel mostra `Usuário #ID`. A contagem indica associações de tarefas, não produtividade. O filtro Entity é aplicado pela entidade do projeto pai.

O discovery informado para TEST encontrou nove tarefas válidas: uma com usuário vinculado à equipe e oito sem vínculo `User`. Nenhum nome, ID real ou outro dado pessoal foi registrado. O resultado precisa ser reconfirmado em SQL e no Grafana de TEST antes da homologação integrada.
