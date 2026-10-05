# Status de validação dos marcos

## Marco 1 — Fundação

Escopo: serviço Grafana no Compose, configuração do ambiente, provisioning do datasource e do dashboard, volume de dados persistente, CI estática e validação da fundação do ambiente de testes. Nenhum SQL de métricas do GLPI é incluído antes do discovery do schema e da versão.

Status: Concluído

### Concluído

- [x] Estrutura do projeto.
- [x] Serviço Grafana no Docker Compose e configuração do volume persistente `grafana-data`.
- [x] Configuração de provisioning do datasource MySQL e do provider de dashboard baseado em arquivos.
- [x] Arquivos do dashboard e configuração do provider gerenciados pelo controle de versão.
- [x] Configuração por variáveis de ambiente, com `.env` de cada ambiente excluído do Git.
- [x] CI estática para `push` e `pull_request`, com somente a permissão `contents: read`.
- [x] Fluxo de promoção de desenvolvimento para GitHub e depois para testes com `git push` e `git pull`, sem transferência manual de arquivos.
- [x] Runtime do Grafana no ambiente de testes: container em execução, serviço HTTP e interface web disponíveis em TCP/3000 e provisioning carregado.
- [x] Plugin MySQL e datasource provisionado **GLPI MySQL** carregados (MySQL, `glpi`, acesso proxy, conta de banco somente com SELECT).
- [x] Health check do datasource bem-sucedido; o datasource permanece presente após reiniciar o Grafana.
- [x] Dashboard **GLPI Service Desk** provisionado, visível no Grafana e ainda presente após reiniciar o Grafana.
- [x] Comportamento esperado de provisioning e persistência confirmado para a fundação do Marco 1.
- [x] Autenticação direta no MariaDB e acesso read-only ao banco confirmados.
- [x] Acesso do container ao MariaDB local em `localhost:3306`, usando a rede do host, confirmado.
- [x] MariaDB mantido vinculado ao localhost; firewall restringe TCP/3000 do Grafana às redes confiáveis, e TCP/3306 do MariaDB não é exposta.
- [x] Documentação do projeto alinhada à arquitetura implementada e aos limites de validação.
- [x] Revisão de secrets do repositório concluída; consulte [security.md](security.md).

### Validação estática

A CI executa a configuração do Compose, a análise do JSON do dashboard, YAML e Markdown/lint, verificações de espaços em branco do Git e confirma que `.env` não é versionado e `.env.example` existe. Ela não acessa o ambiente de testes, MariaDB ou GLPI, não executa queries reais, não usa credenciais do ambiente nem faz deploy. Ter um workflow de CI configurado não significa que uma execução hospedada tenha sido bem-sucedida; registre os resultados hospedados separadamente. Consulte [development.md](development.md).

### Marco 1 — validação de runtime / integração

Ao concluir o Marco 1, o dashboard intencionalmente não continha métricas funcionais nem queries. Esse estado vazio era esperado e não indicava uma falha do Marco 1: validava somente a fundação do Grafana, o provisioning, a conectividade do datasource, o runtime e a persistência. As métricas principais foram adicionadas no Marco 3.

### Adiado para os próximos marcos

O trabalho com métricas e queries depende dos achados verificados do schema no Marco 2. Marcos futuros implementarão métricas e validarão resultados com o GLPI, documentando mapeamentos, filtros e limitações. Não modifique o banco, o schema nem a aplicação GLPI.

## Marco 2 — Discovery do banco de dados

Status: Concluído

Escopo: discovery read-only do ambiente GLPI/MariaDB e somente das estruturas do Service Desk necessárias às métricas futuras. Os scripts em `sql/discovery/` foram usados no ambiente de testes com acesso read-only. Os achados foram comparados com a interface do GLPI; nenhum dado bruto de chamado, pessoa, categoria, entidade ou valor específico do ambiente está incluído aqui.

### Critérios de conclusão

- [x] Ambiente GLPI/MariaDB identificado.
- [x] Schema de `glpi_tickets` documentado.
- [x] Valores reais dos domínios de chamados descobertos.
- [x] Relação com usuários/técnicos verificada.
- [x] Relação com grupos verificada; ela não possui linhas no ambiente atual.
- [x] Relação com categorias verificada.
- [x] Relação com entidades verificada.
- [x] Semântica das datas do ciclo de vida investigada.
- [x] Campos SLA/TTO/TTR investigados.
- [x] Riscos de cardinalidade dos joins documentados.
- [x] Resultados SQL representativos comparados com a interface do GLPI e considerados coerentes.
- [x] Nenhuma mutação do banco realizada; este marco adicionou somente documentação e arquivos de queries read-only.

Todo o SQL de discovery se limita a `SELECT`, `SHOW` e `DESCRIBE`. Não investigue módulos de inventário sem relação com o escopo.

## Marco 3 — Métricas principais

Status: Concluído

Escopo: seis cards de chamados no estado atual e a série temporal Fluxo de chamados, com base nos achados verificados no Marco 2. A variável Entity filtra todos os cards e a série temporal. O card de atrasados usa o prazo TTR calculado pelo GLPI e a exclusão de chamados pendentes, solucionados e fechados confirmada na interface; análise de SLA, métricas de desempenho TTO/TTR, categorias, técnicos e envelhecimento do backlog permanecem fora do escopo.

### Implementado

- [x] Snapshot atual de Chamados novos (`status = 1`).
- [x] Snapshot atual de Chamados atribuídos (`status = 2`).
- [x] Snapshot atual de Chamados atrasados usando `time_to_resolve` não nulo e vencido, calculado pelo GLPI, `solvedate IS NULL` e `status NOT IN (4, 5, 6)`.
- [x] Snapshot atual de Chamados solucionados (`status = 5`).
- [x] Snapshot atual de Chamados pendentes (`status = 4`).
- [x] Snapshot atual de Chamados total (`is_deleted = 0`).
- [x] Série temporal Fluxo de chamados usando macros de tempo do Grafana e ordenação por tempo.
- [x] Seis cards Stat e um painel de série temporal provisionados.
- [x] SQL versionado em `sql/queries/`; todas as queries excluem chamados logicamente deletados e os seis snapshots são independentes do time picker.
- [x] Variável Entity obtida de `glpi_entities`, com `id` como valor, `completename` como rótulo e opção All; os filtros SQL usam o valor da entidade selecionada.
- [x] Cards de status, total e atrasados comparados com a interface do GLPI usando o mesmo escopo de entidade e considerados coerentes.

### Marco 3 — validação de runtime / integração

- [x] Variável Entity validada no Grafana para a entidade selecionada; os seis cards respeitam a entidade selecionada.
- [x] Valores dos cards comparados com a interface do GLPI e considerados coerentes.
- [x] Classificação de atrasados reproduz o comportamento validado com a interface do GLPI.
- [x] O card de chamados totais usa formatação compacta; os outros cinco cards exibem valores inteiros.
- [x] Fluxo de chamados funciona com as séries Criados, Solucionados e Saldo; Saldo é Criados menos Solucionados.
- [x] A série temporal respeita o período selecionado no time picker; os cards de estado atual não dependem dele.
- [x] Queries do dashboard executam pelo datasource provisionado no ambiente de testes.

As validações de runtime e semântica foram concluídas no ambiente de testes contra a interface do GLPI. As verificações estáticas continuam fazendo parte da CI. Este marco não inclui alterações no banco, no schema ou nos índices.

### Melhoria após o Marco 3: Eficiência de resolução (SLA)

Esta melhoria foi validada em runtime após a conclusão do Marco 3. O percentual do Gauge coincidiu com um cálculo SQL direto no ambiente de testes. O Marco 3 permanece Concluído; o Marco 4 ainda não foi iniciado.

## Estado estável atual

O dashboard atual **GLPI Service Desk** está funcional e validado em runtime. Os Marcos 1, 2 e 3 permanecem Concluídos. A melhoria de SLA posterior ao Marco 3 e os refinamentos visuais subsequentes estão incorporados. O estado atual é considerado estável; novas funcionalidades estão fora do escopo imediato.

O dashboard atual de Service Desk é considerado estável. Novas funcionalidades ficam adiadas; as alterações devem se limitar a correções de bugs, segurança, compatibilidade ou trabalho do roadmap retomado explicitamente.

## Marco 4 — Dashboard de backlog

Status: Planejado

### Objetivo

Criar um segundo dashboard independente, dedicado à saúde e à evolução do backlog de chamados. O dashboard existente **GLPI Service Desk** permanece como a visão principal do Service Desk. O novo dashboard deverá ajudar a responder quantos chamados compõem o backlog atual, há quanto tempo estão abertos, se a fila está crescendo ou diminuindo e onde o backlog está mais concentrado.

O marco provisionará um arquivo de dashboard separado e independente do atual. O nome do arquivo, o UID e o layout final ainda não foram definidos intencionalmente.

### Escopo do dashboard de backlog

1. **Backlog atual:** contar chamados ainda não solucionados ou fechados, com `is_deleted = 0` e a variável **Entity**. A definição SQL exata deve ser validada antes da implementação.
2. **Envelhecimento do backlog:** distribuir chamados abertos nas faixas de idade propostas: < 1 dia, 1–3 dias, 3–7 dias, 7–30 dias e > 30 dias. Revisar essas faixas antes da implementação.
3. **Tendência do backlog:** mostrar se o trabalho pendente está aumentando, diminuindo ou estável. Pesquisar e validar a semântica histórica antes de escrever a query definitiva.
4. **Backlog por prioridade:** mostrar a distribuição atual do backlog por prioridade e evitar joins desnecessários na versão inicial.

### Fora do escopo

- Produtividade individual ou rankings de técnicos.
- Métricas detalhadas por categoria.
- Análise detalhada de TTO ou SLA/TTR.
- Previsões ou pontuações compostas.
- Alterações no GLPI.

### Validações necessárias antes da implementação

Antes de implementar o dashboard:

1. Confirmar semanticamente o que constitui o backlog.
2. Validar o status e os filtros relevantes.
3. Definir e validar corretamente o cálculo histórico.
4. Testar queries read-only no ambiente de testes.
5. Somente então implementar e provisionar o dashboard separado.

Enquanto este marco estiver Planejado, não serão incluídas alterações em SQL, dashboard, banco GLPI, schema ou aplicação.

## Marco 5 — Dashboard de Projetos

Status: Planejado

O discovery inicial está concluído e versionado em [11-projects-schema.sql](../sql/discovery/11-projects-schema.sql), [12-projects-domains.sql](../sql/discovery/12-projects-domains.sql), [13-project-tasks.sql](../sql/discovery/13-project-tasks.sql) e [14-projects-cardinality.sql](../sql/discovery/14-projects-cardinality.sql). Nenhuma query de métricas de produção foi criada e nenhum dashboard de Projetos foi implementado. O trabalho será retomado futuramente a partir deste discovery.

### Escopo do dashboard de Projetos

- Um dashboard independente para projetos do GLPI.
- Um filtro `Entity` consistente com o dashboard atual.
- Visões de projetos e tarefas, incluindo estados e progresso.
- Tratamento explícito de projetos e tarefas sem estado.
- Possível identificação de projetos atrasados, somente após validar sua semântica.
- Uma tabela operacional de projetos.

Métricas de tarefas devem usar o escopo da entidade do projeto pai. O valor `0` do estado do projeto significa Sem estado, não ativo. Conclua o discovery e valide a semântica antes de criar queries de produção ou implementar o dashboard.
