# Production Readiness

Status: Planejado. Os itens deste documento descrevem preparação para um possível go-live; não representam implementação nem implantação em produção.

## Fluxo de promoção planejado

```text
DEV → GitHub/CI → TEST → PROD
```

As alterações devem passar pela validação estática da CI e pela validação de runtime/integrada em TEST antes de uma promoção controlada para PROD. A CI atual não faz deploy automático.

## Configuração e persistência por ambiente

- Manter um `.env` local e independente em DEV, TEST e PROD. Não versionar esses arquivos nem transferir credenciais pelo Git.
- Usar credenciais próprias para cada ambiente, incluindo contas distintas para administração do Grafana e leitura do MariaDB.
- Manter volumes de dados do Grafana separados por ambiente para evitar compartilhar ou sobrescrever estado entre TEST e PROD.

## Acesso e rede

- Recomenda-se colocar Nginx com HTTPS na frente do Grafana antes de disponibilizá-lo em produção. Restringir o acesso direto à porta do Grafana conforme a arquitetura de rede aprovada.
- Manter uma conta administrativa restrita para configuração e suporte; usuários operacionais devem acessar com contas de função **Viewer**, sem compartilhar a conta admin.
- Preservar o acesso do datasource MariaDB somente com `SELECT`. A porta 3306 não deve ser exposta à rede pública nem ao acesso de usuários do Grafana.

## Operação e recuperação

- Definir e documentar o backup do estado persistente do Grafana e das configurações locais necessárias à recuperação, sem incluir secrets em cópias acessíveis ou versionadas.
- Testar o procedimento de restore antes do go-live e confirmar que o Grafana, datasource e dashboards voltam ao estado esperado.
- Definir um healthcheck operacional que confirme disponibilidade HTTP do Grafana, saúde do datasource, carregamento do dashboard e capacidade de executar as consultas necessárias.

## Desempenho e validação prévia

- Antes do go-live, revisar as queries com `EXPLAIN` e validar seu desempenho no ambiente de testes com volume e períodos representativos.
- Comparar o resultado funcional com a interface do GLPI e acompanhar o tempo de resposta dos painéis. Tratar problemas de desempenho antes da promoção.
- Manter toda validação de queries em modo read-only; não criar índices, views ou alterações no banco como parte desta preparação sem uma mudança de escopo revisada.

## Critério de go-live

Produção permanece pendente até que os controles acima sejam definidos, implementados e verificados no ambiente apropriado. Este documento é somente planejamento e não altera a arquitetura ou a configuração atuais.
