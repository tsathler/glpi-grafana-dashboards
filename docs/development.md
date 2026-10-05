# Desenvolvimento e implantação

## Separação entre ambientes

A máquina de desenvolvimento prepara e valida os arquivos do repositório. Não se presume que ela tenha acesso ao banco do GLPI ou ao ambiente integrado de testes. Desenvolvimento e testes mantêm arquivos `.env` locais e separados, criados a partir de `.env.example`; `.env` não é versionado, e credenciais nunca devem ser copiadas pelo Git nem registradas na documentação.

O ambiente de testes recebe as alterações pelo Git. Este repositório implanta somente o Grafana; o banco do GLPI permanece externo, e o Grafana deve usar uma conta read-only no banco.

## Configuração do ambiente de testes

### Pré-requisitos

O ambiente de testes usado atualmente pelo projeto é **Ubuntu Server 24.04 LTS**, com Git, Docker Engine e o plugin do Docker Compose. Outras distribuições Linux podem funcionar, mas este documento descreve o Ubuntu Server 24.04 LTS.

O host de testes atual executa Grafana e MariaDB juntos. O MariaDB escuta somente em `127.0.0.1:3306`; não está exposto na rede. O Docker foi instalado pelo repositório APT oficial do Docker. O problema `docker-ce has no installation candidate` foi resolvido configurando esse repositório; consulte a seção de solução de problemas abaixo para ver as etapas de diagnóstico.

### Instalar Docker Engine e o plugin Compose

Estes comandos exigem privilégios administrativos. Execute-os como `root` ou primeiro abra um shell root com `sudo -i`. Se executar os comandos individualmente como um usuário sem privilégios, prefixe os comandos administrativos com `sudo`.

Instale os pré-requisitos e adicione a chave de assinatura e o repositório APT oficial do Docker para Ubuntu:

```bash
apt update
apt install -y ca-certificates curl

install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt update
```

Instale o Docker Engine, CLI, containerd, Buildx e o plugin Compose atual:

```bash
apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

Use o Compose como `docker compose`. Estas instruções não usam `snap install docker` nem o pacote legado `docker-compose`.

### Verificar a instalação

Execute:

```bash
docker --version
docker compose version
systemctl status docker --no-pager
docker run --rm hello-world
```

O primeiro comando verifica o Docker CLI; o segundo verifica o plugin Compose; `systemctl` informa o status do daemon Docker; e `hello-world` confirma que o daemon consegue executar um container. O último comando pode exigir `sudo` se o usuário atual não tiver permissão para acessar o Docker.

### Solução de problemas: `docker-ce` has no installation candidate

Isso ocorreu porque o repositório oficial do Docker não estava configurado no APT. O host de testes foi corrigido adicionando o repositório oficial do Docker e atualizando os metadados dos pacotes, como mostrado acima. Se ocorrer novamente, atualize os metadados:

```bash
apt update
```

Confirme que a saída inclui `https://download.docker.com/linux/ubuntu` e, em seguida, verifique a versão candidata disponível do pacote:

```bash
apt-cache policy docker-ce
```

Se não houver `Candidate`, revise `/etc/apt/sources.list.d/docker.sources` e execute `apt update` novamente após corrigir a configuração do repositório.

### Clonar ou atualizar o projeto

Neste ambiente de testes, `/opt` foi escolhido como local de instalação, mas não é obrigatório. Para clonar pela primeira vez:

```bash
cd /opt
git clone https://github.com/tsathler/glpi-service-desk-dashboard.git
cd glpi-service-desk-dashboard
```

Para atualizações posteriores, obtenha a nova revisão:

```bash
cd /opt/glpi-service-desk-dashboard
git pull
```

### Configurar o ambiente local

No ambiente de testes, crie e edite a configuração local:

```bash
cp .env.example .env
nano .env
```

Defina valores apropriados para esse ambiente. Nunca faça commit de `.env`: desenvolvimento e testes têm cópias locais separadas, as credenciais não são transferidas pelo Git e credenciais reais ou detalhes do host não devem ser incluídos na documentação.

### Iniciar o projeto

No diretório do projeto, execute:

```bash
docker compose config
docker compose up -d
docker compose ps
docker compose logs --tail=100 grafana
```

`config` valida e renderiza a configuração Compose; `up -d` inicia os serviços em segundo plano; `ps` mostra o estado deles; e `logs` ajuda a inspecionar a inicialização do Grafana, o provisioning e os erros.

O serviço Compose atual usa `network_mode: host`, portanto não usa um mapeamento `ports`. Essa configuração foi escolhida para o ambiente de testes atual: Grafana e MariaDB compartilham um host Linux, e o MariaDB permanece vinculado ao localhost. O acesso do container a `localhost:3306` foi validado. A interface web do Grafana escuta em TCP/3000 no host; o firewall do host restringe o acesso a redes confiáveis. A porta 3306 do MariaDB não é exposta à rede. O uso da rede do host é específico desta configuração de testes, não um requisito universal; qualquer alteração futura deve ser refletida no Compose e documentada.

O `.env` local do ambiente de testes usa os nomes de variáveis abaixo; os valores permanecem locais e não devem ser copiados para o Git nem para este documento:

```env
GRAFANA_ADMIN_USER=...
GRAFANA_ADMIN_PASSWORD=...

GLPI_DB_HOST=127.0.0.1
GLPI_DB_PORT=3306
GLPI_DB_NAME=glpi
GLPI_DB_USER=grafana_reader
GLPI_DB_PASSWORD=...
```

As credenciais administrativas do Grafana e as credenciais do MariaDB são independentes. `GRAFANA_ADMIN_USER` identifica o administrador da aplicação Grafana; `GLPI_DB_USER` é a conta leitora do banco. Não reutilize as credenciais de uma conta na outra.

### Observações de segurança

- Não adicione usuários ao grupo `docker` sem uma necessidade operacional específica; a associação concede privilégios elevados, equivalentes ao controle do host em nível de root.
- Não exponha publicamente a porta 3000 sem necessidade. Restrinja o acesso à rede interna ou a clientes autorizados.
- Mantenha as credenciais no `.env` não versionado de cada ambiente; nunca as coloque no Git.

## Máquina de desenvolvimento: validação estática

O GitHub Actions executa estas verificações estáticas em pushes e pull requests: `docker compose config` com valores copiados de `.env.example`, análise do JSON do dashboard, análise de YAML, lint de Markdown, inspeção de SQL read-only, paridade entre queries versionadas e o dashboard, geração da demonstração sintética e verificações de schema, espaços em branco do Git e confirmação de que arquivos locais de ambiente não são versionados. Não inicia containers, não usa secrets do ambiente de testes e não se conecta ao MySQL/GLPI. As credenciais devem permanecer fora do Git; `.env` e `.env.demo` não devem ser versionados. Uma ferramenta dedicada para detectar secrets poderá ser considerada separadamente no futuro.

Valide o que não depende do ambiente integrado:

```sh
docker compose config
node scripts/validate-sql.mjs
```

Analise também os arquivos JSON e YAML alterados com parsers locais adequados e revise a alteração:

```sh
git diff --check
git status --short
git diff
```

Use localmente os valores de exemplo de `.env.example` somente quando necessário para renderizar a configuração Compose. Não faça commit do `.env` local, de credenciais nem de detalhes reais do ambiente. A conectividade com o banco não é pré-requisito para essas verificações. SQL só pode ser adicionado depois que o schema e a versão reais do GLPI forem verificados e documentados; uma revisão estática não confirma que uma query corresponde a uma instalação específica.

O validador SQL aceita somente instruções read-only em `sql/`, rejeita `SELECT *` e compara a query embutida de cada painel do dashboard com o arquivo em `sql/queries/` cujo prefixo de dois dígitos corresponde ao ID do painel. Essas verificações não substituem a execução das queries nem a comparação das métricas no ambiente de testes.

Após a revisão, envie o commit planejado ao GitHub. Os arquivos de implantação versionados são Compose, arquivos de provisioning/dashboard do Grafana, documentação e qualquer SQL verificado. `.env` permanece local.

## Ambiente de testes: validação de runtime e integração

O fluxo de implantação é:

```text
Development Machine
        │
        │ git push
        ▼
      GitHub
        │
        │ CI (static validation)
        ▼
Test Environment
        │
        │ git pull
        ▼
Runtime / integration validation
```

Não há transferência manual de arquivos do projeto entre desenvolvimento e testes. A CI não acessa o ambiente de testes, MariaDB ou GLPI; não executa queries reais, não usa credenciais do ambiente e não faz deploy automático.

Após `git pull` e a configuração do `.env` local, execute os comandos Compose acima. Confirme os itens a seguir no ambiente de testes:

- O Grafana inicia sem erros de provisioning.
- O datasource **GLPI MySQL** é provisionado e consegue se conectar ao banco externo.
- O dashboard **GLPI** é provisionado e persiste conforme esperado.
- As queries do dashboard executam, e as métricas exibidas correspondem às visualizações e aos registros equivalentes no GLPI.
- Reiniciar o Grafana preserva o estado esperado.

As verificações de runtime no ambiente de testes atual confirmaram que o Grafana está em execução, que o serviço HTTP e a interface web funcionam na porta 3000, que o provisioning foi carregado e que o plugin datasource MySQL está disponível. O datasource provisionado tem estas configurações não secretas:

```text
Datasource: GLPI MySQL
Type: MySQL
Database: glpi
Access: proxy
Database privileges: SELECT only
Connection health: OK
```

O datasource é gerenciado em `grafana/provisioning/datasources/`; `secureJsonData` armazena a senha. Suas variáveis de ambiente são `GLPI_DB_HOST`, `GLPI_DB_PORT`, `GLPI_DB_NAME`, `GLPI_DB_USER` e `GLPI_DB_PASSWORD`. O datasource autentica com a conta MariaDB que tem somente permissão `SELECT`. O provisioning versionado é a fonte de verdade para alterações persistentes no datasource. Os arquivos do dashboard em `grafana/dashboards/` e o provider em `grafana/provisioning/dashboards/` também são fontes de verdade; alterações duráveis devem ser feitas pelo Git em vez de somente pela interface do Grafana.

A autenticação direta no MariaDB e o acesso read-only ao banco foram confirmados com o cliente MariaDB, incluindo a permissão `SELECT` funcional. Credenciais e resultados de queries não são registrados. O datasource e o dashboard continuaram provisionados após a reinicialização do Grafana; posteriormente, as métricas do dashboard foram validadas com o GLPI e SQL direto.

Para repetir a verificação de conexão direta, use o comando a seguir no ambiente de testes e informe a senha de forma interativa:

```bash
mariadb -h 127.0.0.1 -u grafana_reader -p glpi
```

O SQL atual das métricas está versionado em `sql/queries/` e foi comparado com a versão instalada do GLPI. Para métricas futuras ou implantações em outra instalação, compare os resultados com o GLPI e documente os mapeamentos de status, filtros e limitações. Nunca altere o banco, o schema ou a aplicação GLPI como parte deste projeto.

O ambiente de testes não recebe arquivos do projeto manualmente: as alterações são enviadas ao GitHub e chegam ao host por `git pull`. O `.env` permanece local nesse ambiente.

## Status da validação nos relatórios

Os relatórios devem separar **Validação estática** de **Validação de runtime / integração**. O sucesso estático na máquina de desenvolvimento não significa que a implantação de testes, a conexão com o banco, as queries do dashboard ou a correção das métricas tenham sido validadas. Registre o ambiente, a data, os comandos, os resultados e as verificações pendentes de cada marco em [milestones.md](milestones.md).

## Alterações de provisioning

Os arquivos provisionados são montados como read-only. Edite os JSON/YAML versionados e reinicie o Grafana ou aguarde o file watcher carregar as atualizações. Exporte do Grafana somente quando quiser atualizar intencionalmente o dashboard versionado e remova valores específicos do ambiente ou sensíveis antes do commit.

## Referências oficiais

- [Instalar Docker Engine no Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Instalar o plugin Docker Compose](https://docs.docker.com/compose/install/linux/)
- [Etapas pós-instalação do Docker Engine no Linux](https://docs.docker.com/engine/install/linux-postinstall/)
- [Publicação e mapeamento de portas](https://docs.docker.com/engine/network/port-publishing/)
