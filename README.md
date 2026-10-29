# GLPI Grafana Dashboards

**Languages:** [English](#english) · [Português](#português)

## English

**Read-only GLPI service desk observability with Grafana, versioned SQL, Docker Compose and CI checks.**

[![CI](https://github.com/tsathler/glpi-grafana-dashboards/actions/workflows/ci.yml/badge.svg)](https://github.com/tsathler/glpi-grafana-dashboards/actions/workflows/ci.yml)

![GLPI Service Desk dashboard — synthetic demonstration data](docs/images/dashboard-overview.png)

> **Demo only:** the screenshot contains synthetic metrics and does not reveal actual organizational data.

### Project overview

This project provides operational dashboards without modifying source data in GLPI. SQL queries and dashboards are version-controlled, and a dedicated MariaDB user is granted read-only access.

| Dashboard | Status | Scope |
| --- | --- | --- |
| GLPI Service Desk | **Stable; validated in production** | Ticket status indicators, created/resolved time series, SLA/TTR resolution efficiency |
| GLPI Projects | **In development** | Native Grafana indicators and charts for projects/tasks, progress and operational table; integrated validation pending |
| Backlog | Planned | Not implemented |

**Architecture:** authorized user → Nginx reverse proxy → Grafana → external GLPI MariaDB (read-only). GitHub Actions performs static checks of Compose, JSON, YAML, SQL and related configuration; CI does **not** query live systems or deploy.

**Technology:** Grafana 13.2.2 (pinned image), SQL, MariaDB, Docker Compose, Nginx, Linux and GitHub Actions. The verified runtime uses Ubuntu Server 24.04 LTS and host networking, so other environments may need changes.

### Quick start

Use an authorized **read-only** GLPI database account. Keep credentials in a local `.env`, never in Git.

```sh
git clone https://github.com/tsathler/glpi-grafana-dashboards.git
cd glpi-grafana-dashboards
cp .env.example .env
# Configure the local .env before starting
docker compose config
docker compose up -d
```

### Validation and limitations

Service Desk was checked against GLPI and deployed. The eight read-only Projects queries were checked directly against the database. The consolidated dashboard uses native Grafana visualizations for indicators, project and task distributions, and the operational table. The Kanban and Business Text dependency have been removed. Integrated validation of the new dashboard in Grafana remains pending. Results can vary with GLPI schema, status values, entity filtering, collation and timezone. The MariaDB version is not pinned.

**Technical documentation:** [Architecture](docs/architecture.md) · [Database discovery](docs/database.md) · [Metrics](docs/metrics.md) · [Development and deployment](docs/development.md) · [Security](docs/security.md) · [Readiness](docs/production-readiness.md) · [Milestones](docs/milestones.md).

AI tools assisted research, implementation and documentation; the engineering decisions and tests were manually reviewed to the extent described above.

---

## Português

[↑ English](#english)

**Observabilidade para operações de service desk, com SQL versionado e acesso somente de leitura ao GLPI.**

Este projeto transforma dados de chamados do GLPI em dashboards do Grafana, com consultas auditáveis, provisionamento via Docker Compose e validações automatizadas. O **GLPI Service Desk** está estável e validado em produção. O **GLPI Projects** é uma frente em desenvolvimento e ainda requer validação integrada.

## Visão geral

*A captura demonstrativa e o estado de CI estão disponíveis na seção em inglês acima.*

> **Dados de demonstração:** a imagem utiliza métricas sintéticas. Não representa dados, volumes ou informações reais da organização.

| Dashboard | Situação | O que apresenta |
| --- | --- | --- |
| **GLPI Service Desk** | **Estável e validado** | Indicadores de chamados, fluxo de criados × solucionados e eficiência de resolução por SLA/TTR |
| **GLPI Projects** | **Em desenvolvimento** | Indicadores e gráficos nativos para projetos e tarefas, progresso e tabela operacional; validação integrada pendente |
| **Backlog** | **Planejado** | Escopo ainda não implementado |

## O problema e a abordagem

Acompanhar operações apenas pelas telas transacionais do GLPI pode dificultar uma leitura rápida de volume, fluxo e cumprimento de prazos. A proposta aqui é oferecer visualizações operacionais **sem modificar dados do sistema de origem**.

- Consultas SQL versionadas e restritas a operações read-only.
- Datasource e dashboards provisionados a partir de arquivos.
- Credenciais por ambiente em `.env` local, fora do Git.
- Pipeline de CI para verificações estáticas de configuração, consultas e arquivos.
- Documentação das métricas, decisões de segurança e limitações de compatibilidade.

## O que foi implementado

### GLPI Service Desk — estável

- Sete indicadores de estado dos chamados, com filtro por **Entity**.
- Série temporal **Fluxo de chamados**, comparando criados e solucionados.
- Gauge **Eficiência de resolução (SLA)** com base no prazo TTR do GLPI.
- Provisionamento de dashboard e datasource com SQL somente para leitura.

**Evidência:** a visualização e os indicadores do Service Desk foram conferidos na interface do GLPI e implantados em produção.

### GLPI Projects — em desenvolvimento

O dashboard consolidado usa visualizações nativas do Grafana para quatro indicadores, três gráficos de distribuição de projetos e tarefas e uma tabela operacional. As oito consultas SQL read-only foram verificadas diretamente no banco. O Kanban e a dependência do plugin Business Text foram removidos. **A validação integrada da nova composição no Grafana ainda está pendente.**

Consulte [Layout do GLPI Projects](docs/projects-layout.md), [Desenvolvimento e implantação](docs/development.md) e [Marcos e roadmap](docs/milestones.md) para detalhes e limitações.

## Arquitetura

```text
Usuário autorizado
        │
        ▼
Nginx / reverse proxy
        │
        ▼
     Grafana ── SQL read-only ──► MariaDB externo do GLPI

Repositório GitHub ──► GitHub Actions ──► verificações estáticas
```

Este diagrama representa o cenário validado, não uma topologia obrigatória. O GLPI e o MariaDB ficam fora do Compose, que executa o Grafana. Outras instalações podem usar controles de acesso e reverse proxies diferentes, desde que protejam o Grafana e não exponham o banco publicamente.

## Stack e práticas

**Tecnologias:** Grafana, SQL, MariaDB/MySQL, Docker Compose, Nginx, Linux, Git e GitHub Actions.

**Segurança e qualidade:**

- Conta dedicada de banco com permissão somente de leitura.
- Nenhuma query do projeto cria ou altera objetos no banco.
- Inspeção do schema do GLPI antes da construção das métricas.
- Verificações de segurança e paridade entre SQL versionado e dashboards.
- Configuração sensível mantida fora do controle de versão.
- CI exclusivamente estática: **não** acessa o GLPI, executa consultas reais ou faz deploy.

Veja [Segurança](docs/security.md), [Arquitetura](docs/architecture.md) e [Definições das métricas](docs/metrics.md).

## Executar em ambiente próprio

**Pré-requisitos:** Linux, Git, Docker Engine e Docker Compose, além de acesso autorizado a um MariaDB do GLPI com usuário read-only.

```sh
git clone https://github.com/tsathler/glpi-grafana-dashboards.git
cd glpi-grafana-dashboards
cp .env.example .env
```

Configure o `.env` com os parâmetros do seu ambiente e as credenciais apropriadas. **Não versione esse arquivo nem reutilize credenciais administrativas do banco.**

```sh
docker compose config
docker compose up -d
```

A configuração versionada usa **host networking** e pode exigir adaptações em outros sistemas ou topologias. O runtime foi validado em Ubuntu Server 24.04 LTS. O Compose fixa a imagem `grafana/grafana:13.2.2`; outras versões não foram verificadas neste projeto.

Para instruções completas, leia [Desenvolvimento e implantação](docs/development.md). Para ajustar URLs locais dos dashboards de Projetos, veja [URL local do GLPI](docs/glpi-local-url.md).

## Validação e limitações

| Tipo | Cobertura |
| --- | --- |
| **CI / validação estática** | Compose, JSON, YAML, Markdown, SQL read-only, correspondência SQL/dashboard, arquivos de ambiente e whitespace |
| **Runtime — Service Desk** | Comparação com a interface GLPI e implantação validada |
| **Runtime — Projects** | Consultas do MVP verificadas no banco; integração dos painéis no Grafana pendente |

As consultas dependem do schema e de valores de domínio da instalação de referência. Versões, estados, relacionamentos, seleção de entidades e comportamento temporal podem variar. Antes de reutilizar o projeto, faça o discovery do banco, confira charset/collation/timezone e compare os resultados com a interface correspondente. A versão do MariaDB não é fixada pelo repositório.

## Documentação técnica

- [Arquitetura](docs/architecture.md)
- [Banco de dados e discovery](docs/database.md)
- [Definições e validação das métricas](docs/metrics.md)
- [Desenvolvimento e implantação](docs/development.md)
- [Layout do GLPI Projects](docs/projects-layout.md)
- [Segurança](docs/security.md)
- [Production Readiness](docs/production-readiness.md)
- [Marcos e roadmap](docs/milestones.md)

## Desenvolvimento com apoio de IA

Ferramentas de IA apoiaram pesquisa, implementação e documentação. A arquitetura, o SQL, a segurança, o comportamento em runtime e as métricas foram revisados manualmente e validados conforme o estado descrito acima.
