# Segurança

- O host de testes atual mantém o MariaDB vinculado a `127.0.0.1:3306`; ele não é exposto à rede. Nesta configuração em que ambos estão no mesmo host, o Grafana usa a rede do host para se conectar localmente. Não exponha o MariaDB sem uma necessidade documentada.
- O acesso do Grafana ao MariaDB usa a conta dedicada `grafana_reader@localhost`, com somente `SELECT` em `glpi.*`. Ela não deve ter privilégios `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER` ou `DROP`. A conexão foi validada diretamente e pelo datasource provisionado **GLPI MySQL**.
- Com a configuração atual de rede do host, o Grafana escuta na porta 3000 do host de testes. Restrinja o acesso no limite do host/rede; use um proxy reverso adequado com TLS ao disponibilizá-lo além de uma rede local confiável.
- Altere a senha inicial de administrador do Grafana e proteja essa conta. O cadastro de usuários está desabilitado.
- Os dados dos chamados podem conter informações pessoais ou confidenciais. Limite o acesso ao dashboard e evite publicar dados reais de chamados, nomes de usuário, nomes de entidades ou detalhes internos do host.
- A conta do banco segue o princípio do menor privilégio: somente acesso read-only. O firewall restringe a porta 3000 do Grafana às redes confiáveis; a porta 3306 não é exposta para acesso da aplicação.

## Gerenciamento de secrets

- Nunca faça commit de `.env`. Cada ambiente mantém sua própria configuração local; `.env.example` contém somente valores de exemplo.
- Mantenha separadas as credenciais do administrador do Grafana e do MariaDB. Nunca reutilize a conta administrativa do Grafana como conta do banco, nem o contrário.
- A configuração versionada do datasource usa `secureJsonData` para a senha. Não inclua credenciais em dashboards, logs, documentação ou no Git.
- A CI do GitHub Actions não exige secrets. Ela usa configuração com valores de exemplo para as verificações estáticas e não se conecta aos serviços de testes nem faz deploy.
- Troque qualquer credencial suspeita ou confirmadamente exposta. Remover um valor do arquivo atual não o remove do histórico do Git; considere credenciais commitadas comprometidas e troque-as. A limpeza do histórico exige uma tarefa separada e controlada de reescrita do histórico.

## Planejamento de acesso em produção

Antes do go-live, recomenda-se publicar o Grafana por Nginx com HTTPS, manter a conta admin separada e restrita e fornecer acesso cotidiano por contas Viewer individuais. Cada ambiente deve ter credenciais próprias. O datasource deve continuar read-only, e a porta 3306 do MariaDB deve permanecer inacessível pela rede pública. Esses controles estão planejados e ainda não descrevem uma implantação de produção existente; consulte [Production Readiness](production-readiness.md).

## Revisão do repositório

A revisão atual analisou a árvore de trabalho e todos os commits alcançáveis do Git em busca de padrões de credenciais, chaves privadas, formatos comuns de tokens, cabeçalhos de autorização/cookie, endereços de rede privados, sufixos comuns de hostname interno e nomes de arquivos de artefatos sensíveis. Não encontrou credenciais versionadas, chaves privadas, padrões de secrets, endereços de rede privados, correspondências de hostnames internos nem arquivos de artefatos sensíveis. Há um arquivo `.env` local na árvore de trabalho, ignorado pelo Git; ele não foi exibido nem adicionado. Essas verificações reduzem riscos, mas não provam a ausência de todos os formatos possíveis de secrets.
