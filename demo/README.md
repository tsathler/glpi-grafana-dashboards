# Demonstração sintética

Este modo opcional executa o dashboard Grafana existente contra um banco MariaDB em container com dados **100% fictícios**. Ele não usa, copia, anonimiza nem deriva registros de uma instalação real do GLPI.

## Gerar e iniciar

Requisitos: Docker Compose e Python 3.12. Na raiz do repositório:

```sh
cp .env.demo.example .env.demo
python3 demo/generate.py
docker compose -f compose.demo.yaml up -d
```

Se Python não estiver instalado no host, gere o arquivo usando um container Python isolado:

```sh
docker run --rm -v "$PWD:/work" -w /work python:3.12-alpine python demo/generate.py
```

Abra `http://127.0.0.1:3001` e entre com as credenciais fictícias do Grafana no `.env.demo` local. A porta do MariaDB não é publicada. Mantenha `MARIADB_PASSWORD` e `GLPI_DB_PASSWORD` iguais se personalizar as credenciais da demonstração; o Grafana usa uma conta dedicada no banco com somente `SELECT`.

Por padrão, o gerador usa a seed `20261002` e grava `demo/generated/seed.sql`, ignorado pelo Git. Ele gera 5.000 chamados ao longo de 90 dias e três entidades fictícias: **Service Desk**, **Infrastructure** e **Corporate**. O SQL gerado é idêntico byte a byte para a mesma seed. Na primeira inicialização do banco, `@demo_now = NOW()` ancora os timestamps relativos a esse horário, mantendo útil o intervalo padrão do Grafana. Para escolher outra seed determinística, execute `python3 demo/generate.py --seed NUMBER` antes de iniciar a stack.

O MariaDB carrega o schema mínimo, as linhas geradas e as permissões do leitor somente quando o volume de dados está vazio. Alterar `seed.sql` não atualiza um volume existente.

## Redefinir

```sh
docker compose -f compose.demo.yaml down -v
python3 demo/generate.py
docker compose -f compose.demo.yaml up -d
```

`down -v` remove somente os containers e volumes nomeados do projeto de demonstração. Não afeta a stack Compose principal nem qualquer banco GLPI.

## Escopo e limitações

A demonstração monta o **mesmo** provisioning do Grafana e o mesmo JSON do dashboard usados no ambiente integrado. Todos os painéis executam o **mesmo** SQL em `sql/queries/`; não existem queries de métricas específicas da demonstração. O banco contém somente `glpi_tickets` e `glpi_entities`, com as colunas atualmente usadas por essas queries e pelo seletor Entity. Ele não representa o schema completo do GLPI, os fluxos da aplicação, usuários ou o mecanismo de calendário do SLA. Os prazos TTR são timestamps sintéticos armazenados, escolhidos para exercitar a lógica de métricas existente.

As senhas de exemplo são fictícias e destinadas somente à demonstração local. A seed gerada é ignorada pelo Git; não a substitua por dados reais do GLPI.
