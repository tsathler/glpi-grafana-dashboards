# GLPI Grafana Dashboards

[![CI](https://github.com/tsathler/glpi-grafana-dashboards/actions/workflows/ci.yml/badge.svg)](https://github.com/tsathler/glpi-grafana-dashboards/actions/workflows/ci.yml)

Um conjunto de dashboards do Grafana para dados do GLPI armazenados em um banco MariaDB externo. O dashboard atual é o **GLPI Service Desk**. A stack principal do Compose executa somente o Grafana, conectado a um banco MariaDB externo do GLPI. O SQL das métricas é versionado junto com os dashboards.

## Visão geral

Os marcos 1, 2 e 3 estão concluídos. O dashboard funcional **GLPI Service Desk** e o Gauge **Eficiência de resolução (SLA)**, adicionado posteriormente, foram validados no ambiente de testes com o GLPI e SQL direto. As melhorias e os refinamentos visuais posteriores aos marcos já estão incorporados, e o estado atual é considerado estável; novas funcionalidades estão adiadas. Consulte [os achados do banco de dados](docs/database.md), [as definições das métricas](docs/metrics.md) e [o status dos marcos](docs/milestones.md).

## Objetivos

Oferecer uma visão reproduzível do status e fluxo dos chamados e do cumprimento do TTR, com acesso read-only ao banco de dados.

## Arquitetura

Consulte [docs/architecture.md](docs/architecture.md).

## Funcionalidades

- Sete cards com o estado atual dos chamados, filtrados pelo seletor **Entity**.
- Série temporal **Fluxo de chamados** com Criados e Solucionados.
- Gauge **Eficiência de resolução (SLA)** baseado no prazo TTR calculado pelo GLPI.
- Datasource MySQL e dashboard provisionados, volume persistente do Grafana e SQL read-only versionado.

## Tecnologias

Grafana 13, MariaDB, SQL, Docker Compose, Linux e GitHub Actions.

## Estrutura do repositório

Os arquivos JSON dos dashboards e os arquivos de provisioning ficam em `grafana/`. As queries das métricas estão em `sql/queries/`; os scripts de discovery do schema estão em `sql/discovery/`. Consulte as [instruções de desenvolvimento](docs/development.md).

## Requisitos

Um host Linux com Docker Engine e Docker Compose. O projeto usa um banco MariaDB externo do GLPI; o Grafana pode iniciar sem conectividade com o banco de dados.

## Configuração

Cada ambiente integrado mantém seu próprio `.env` local. Copie `.env.example` para `.env` e substitua todos os valores de exemplo. Nunca faça commit de arquivos locais de ambiente ou credenciais reais.

## Acesso ao banco de dados

Use uma conta de banco de dados dedicada, com permissão somente de `SELECT`. Consulte [docs/security.md](docs/security.md) e [docs/database.md](docs/database.md).

## Execução

```sh
docker compose up -d
```

Abra `http://localhost:3000` e entre com as credenciais administrativas configuradas para o Grafana. Consulte [docs/development.md](docs/development.md) para instruções de operação e validação.

## Dashboard

O dashboard atual provisionado **GLPI Service Desk** contém sete cards de status, um seletor de entidade, **Fluxo de chamados** e **Eficiência de resolução (SLA)**. Os cards mostram snapshots atuais; a série temporal e o Gauge respeitam o período selecionado. O Gauge mede o cumprimento do TTR entre os chamados solucionados que possuem um prazo aplicável.

## Captura de tela — exemplo demonstrativo

![Exemplo demonstrativo do dashboard GLPI Service Desk](docs/images/dashboard-overview.png)

O projeto foi desenvolvido originalmente para uso interno. A screenshot pública usa métricas demonstrativas/sintéticas e não representa dados ou volumes reais nem informações internas da organização.

## Métricas

As definições das métricas e o status de validação estão em [docs/metrics.md](docs/metrics.md). As queries read-only do dashboard são versionadas em `sql/queries/`.

## Segurança

Consulte [docs/security.md](docs/security.md). A configuração atual de testes mantém o MariaDB vinculado ao localhost e usa uma conta dedicada com acesso read-only.

## Validação

O GitHub Actions valida Compose, JSON, YAML, Markdown, SQL read-only, paridade entre queries e dashboard, espaços em branco do Git e rastreamento de arquivos de ambiente. A CI não se conecta ao GLPI nem faz deploy. As validações de runtime devem ser feitas no ambiente de testes após `git pull`; consulte [docs/development.md](docs/development.md).

## Desenvolvimento com apoio de IA

Ferramentas de IA apoiaram a pesquisa, a implementação e a documentação. A arquitetura, o SQL, a segurança, o comportamento em runtime e os resultados das métricas foram revisados e validados manualmente no ambiente de testes e na interface do GLPI.

## Limitações

O SQL direto depende do schema GLPI instalado. Valide novamente os mapeamentos do schema e os resultados das métricas ao implantar em outra instalação do GLPI.

## Roteiro

Marco 1: Fundação (Concluído). Marco 2: Discovery do banco de dados (Concluído). Marco 3: Métricas principais (Concluído). Marco 4: Dashboard de backlog (Planejado). Marco 5: Dashboard de Projetos (Planejado/Futuro; discovery inicial concluído, implementação adiada).
