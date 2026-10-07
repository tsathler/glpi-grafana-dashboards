# GLPI Grafana Dashboards

[![CI](https://github.com/tsathler/glpi-grafana-dashboards/actions/workflows/ci.yml/badge.svg)](https://github.com/tsathler/glpi-grafana-dashboards/actions/workflows/ci.yml)

Dashboards provisionados do Grafana para acompanhar o estado e o fluxo dos chamados do GLPI e, em uma frente em desenvolvimento, dados de projetos e tarefas. O **GLPI Service Desk** é a visão estável e validada; **GLPI Projects** continua em desenvolvimento, com validação integrada pendente. A stack conecta o Grafana a um MariaDB externo com acesso somente para leitura, e as queries são versionadas junto aos dashboards.

## Captura de tela demonstrativa

![Exemplo demonstrativo do dashboard GLPI Service Desk](docs/images/dashboard-overview.png)

A imagem usa métricas demonstrativas/sintéticas. Ela não representa dados, volumes ou informações internas reais da organização.

## Dashboards

### GLPI Service Desk — estável e validado

- Sete indicadores de estado dos chamados com filtro **Entity**.
- Série temporal **Fluxo de chamados**, com chamados Criados e Solucionados.
- Gauge **Eficiência de resolução (SLA)**, baseado no cumprimento do prazo TTR calculado pelo GLPI.
- Datasource e dashboard provisionados; consultas read-only versionadas.

### GLPI Projects — em desenvolvimento

O dashboard MVP e suas oito queries read-only estão implementados. As queries foram conferidas diretamente no banco; a validação integrada dos painéis no Grafana continua pendente. O escopo atual inclui indicadores e distribuições de projetos e tarefas, progresso e uma tabela operacional. O dashboard não deve ser considerado concluído.

## Arquitetura

```text
Usuário autorizado
        ↓
Nginx (reverse proxy)
        ↓
Grafana ── leitura (conta dedicada read-only) ──→ MariaDB externo do GLPI
```

```text
Repositório GitHub → GitHub Actions → validações estáticas
```

O GLPI e seu banco permanecem externos ao Compose, que executa o Grafana. Na implantação validada, o Grafana fica atrás de um reverse proxy; o banco não recebe alterações deste projeto.

## Decisões técnicas e segurança

- O schema do GLPI foi investigado antes da implementação das métricas.
- O SQL usa operações read-only e não cria nem altera objetos no banco.
- Os arquivos SQL versionados são verificados quanto à segurança e à paridade com as queries dos dashboards.
- Datasource e dashboards são provisionados a partir de arquivos versionados.
- Cada ambiente mantém seu próprio `.env` local, fora do Git.
- O datasource usa uma conta dedicada com permissão somente de leitura. Consulte [Segurança](docs/security.md).
- A CI valida arquivos e configuração; ela não acessa o GLPI, não executa queries no banco real e não faz deploy.

## Tecnologias

Grafana 13, MariaDB, MySQL, SQL, Docker Compose, Nginx, Linux, Git e GitHub Actions.

## Executar

Requisitos: Linux, Git, Docker Engine e Docker Compose. Para clonar e iniciar:

```sh
git clone https://github.com/tsathler/glpi-grafana-dashboards.git
cd glpi-grafana-dashboards
cp .env.example .env
```

Edite `.env` com as credenciais do Grafana e os parâmetros do MariaDB apropriados ao seu ambiente. Use uma conta read-only e mantenha o arquivo local. Em seguida:

```sh
docker compose config
docker compose up -d
```

Consulte [Desenvolvimento e implantação](docs/development.md) para configurar o ambiente e acessar o Grafana.

## Validação e estado

**Validação estática:** GitHub Actions verifica a configuração Compose, JSON dos dashboards, YAML, Markdown, SQL read-only, correspondência entre SQL versionado e dashboards, arquivos de ambiente e whitespace do Git.

**Validação de runtime:** o Service Desk foi validado contra a interface do GLPI e implantado em produção. Para Projetos, as queries do MVP foram verificadas diretamente no banco; a validação integrada do dashboard no Grafana permanece pendente.

- Service Desk e primeira implantação de produção — estáveis e validados.
- Projetos — em desenvolvimento; dashboard implementado, validação integrada pendente.
- Dashboard de backlog — planejado.

## Limitações

As queries dependem do schema da instalação do GLPI. Antes de usar o projeto em outra instalação, valide a versão, as relações e os resultados no ambiente correspondente.

## Desenvolvimento com apoio de IA

Ferramentas de IA apoiaram pesquisa, implementação e documentação. A arquitetura, o SQL, a segurança, o comportamento em runtime e as métricas foram revisados manualmente e validados contra o ambiente e a interface do GLPI.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Banco de dados e discovery](docs/database.md)
- [Definições e validação das métricas](docs/metrics.md)
- [Desenvolvimento e implantação](docs/development.md)
- [Segurança](docs/security.md)
- [Production Readiness](docs/production-readiness.md)
- [Marcos e roadmap](docs/milestones.md)
