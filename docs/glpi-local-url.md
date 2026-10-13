# URL local do GLPI nos dashboards

Os dashboards versionados usam uma URL independente do ambiente. Para habilitar o link de abertura do projeto no GLPI, gere cópias locais em `grafana/dashboards-local/`; o diretório e a configuração local são ignorados pelo Git.

## Configuração

1. Crie `grafana/glpi-url.local.json` no host, fora do diretório de dashboards provisionado:

   ```json
   {
     "baseUrl": "https://glpi.example.test"
   }
   ```

   Use a URL base autorizada do seu ambiente, sem credenciais, query string ou fragmento. Para uma instalação em subdiretório, inclua o caminho. Não registre a URL real no Git.

2. Confira se os dashboards versionados correspondem às fontes antes de qualquer regeneração:

   ```sh
   node scripts/build-project-kanban.mjs --check
   ```

   Gere os dashboards locais sem sobrescrever alterações manuais inesperadas:

   ```sh
   node scripts/build-project-kanban.mjs --safe
   node scripts/build-project-deployment.mjs
   ```

   O primeiro comando só grava quando a saída gerada é idêntica aos JSONs existentes. Se apontar diferenças, revise-as; `--force` permite sobrescrever intencionalmente depois dessa revisão.

3. No `.env` local do Compose, selecione o diretório local como fonte do provider:

   ```env
   GLPI_DASHBOARDS_PATH=/var/lib/grafana/dashboards-local
   ```

   Por padrão, Compose e provisioning continuam usando `/var/lib/grafana/dashboards`, com os arquivos versionados. A stack monta também `grafana/dashboards-local` somente leitura. Não carregue simultaneamente os dois diretórios no provider, pois os dashboards têm os mesmos UIDs.

4. Valide e aplique a configuração no ambiente autorizado:

   ```sh
   docker compose config
   docker compose up -d
   ```

O script valida URL HTTP(S), host e ausência de credenciais/query/fragmento. Ele grava somente cópias locais; os JSONs versionados permanecem inalterados. A configuração `grafana/glpi-url.local.json` fica fora do diretório lido pelo provider, evitando que o Grafana tente interpretá-la como dashboard.

## Atualizações

Após atualizar o repositório, execute novamente `build-project-kanban.mjs --check`. Se a saída divergir, revise os arquivos e use `--force` somente quando quiser regenerá-los deliberadamente. Em seguida execute `build-project-deployment.mjs` para reaplicar a URL local. `docker compose up -d` aplica a configuração no ambiente; a validação de runtime dos links continua dependente do ambiente integrado.
