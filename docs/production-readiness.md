# Production Readiness

Status: Topologia atual documentada; controles operacionais adicionais e evolução de acesso permanecem planejados.

## Fluxo de promoção planejado

```text
DEV → GitHub/CI → TEST → PROD
```

As alterações devem passar pela validação estática da CI e pela validação de runtime/integrada em TEST antes de uma promoção controlada para PROD. A CI atual não faz deploy automático.

## Topologia atual

- O Grafana escuta somente em `127.0.0.1:3000`; essa porta não é exposta externamente.
- O acesso externo passa por um reverse proxy Nginx, que publica o serviço em uma porta HTTP dedicada. O firewall permite acesso somente a redes internas autorizadas.
- O MariaDB permanece vinculado a `127.0.0.1:3306` e usa um usuário dedicado read-only. A porta 3306 não é exposta externamente.
- Essa topologia é específica do ambiente atual. O acesso por DNS e HTTPS poderá ser adotado futuramente; não faz parte da configuração atual.

## Configuração e persistência por ambiente

- Manter um `.env` local e independente em DEV, TEST e PROD. Não versionar esses arquivos nem transferir credenciais pelo Git.
- Usar credenciais próprias para cada ambiente, incluindo contas distintas para administração do Grafana e leitura do MariaDB.
- Manter volumes de dados do Grafana separados por ambiente para evitar compartilhar ou sobrescrever estado entre TEST e PROD.

## Acesso e rede

- Avaliar DNS e HTTPS para uma evolução futura; até lá, manter a publicação atual por Nginx em porta HTTP dedicada e o firewall limitado a redes internas autorizadas.
- Manter uma conta administrativa restrita para configuração e suporte; usuários operacionais devem acessar com contas de função **Viewer**, sem compartilhar a conta admin.
- Preservar o acesso do datasource MariaDB somente com `SELECT`. A porta 3306 não deve ser exposta externamente nem ao acesso de usuários do Grafana.

## Operação e recuperação

- Definir e documentar o backup do estado persistente do Grafana e das configurações locais necessárias à recuperação, sem incluir secrets em cópias acessíveis ou versionadas.
- Testar o procedimento de restore antes do go-live e confirmar que o Grafana, datasource e dashboards voltam ao estado esperado.
- Definir um healthcheck operacional que confirme disponibilidade HTTP do Grafana, saúde do datasource, carregamento do dashboard e capacidade de executar as consultas necessárias.

## Desempenho e validação prévia

- Antes do go-live, revisar as queries com `EXPLAIN` e validar seu desempenho no ambiente de testes com volume e períodos representativos.
- Comparar o resultado funcional com a interface do GLPI e acompanhar o tempo de resposta dos painéis. Tratar problemas de desempenho antes da promoção.
- Manter toda validação de queries em modo read-only; não criar índices, views ou alterações no banco como parte desta preparação sem uma mudança de escopo revisada.

## Critério de go-live

Backup/restore, healthcheck operacional, revisão de performance e eventual adoção de DNS/HTTPS ainda precisam ser definidos e verificados antes do go-live. A topologia atual descrita acima está em uso; os demais itens continuam como planejamento e não devem ser interpretados como controles já implantados.
