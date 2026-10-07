# Segurança

- O MariaDB permanece acessível localmente e não é exposto externamente. O datasource usa um usuário dedicado somente com acesso read-only; não conceda privilégios de escrita ou alteração.
- O Grafana deve escutar somente na interface de loopback. O acesso externo passa pelo reverse proxy Nginx e firewall que permite somente origens internas autorizadas. Não exponha diretamente o serviço do Grafana.
- Altere a senha inicial de administrador do Grafana e proteja essa conta. O cadastro de usuários está desabilitado.
- Os dados dos chamados podem conter informações pessoais ou confidenciais. Limite o acesso ao dashboard e evite publicar dados reais de chamados, nomes de usuário, nomes de entidades ou detalhes internos do host.
- A conta do banco segue o princípio do menor privilégio: somente acesso read-only. O serviço do banco não é exposto externamente.

## Gerenciamento de secrets

- Nunca faça commit de `.env`. Cada ambiente mantém sua própria configuração local; `.env.example` contém somente valores de exemplo.
- Mantenha separadas as credenciais do administrador do Grafana e do MariaDB. Nunca reutilize a conta administrativa do Grafana como conta do banco, nem o contrário.
- A configuração versionada do datasource usa `secureJsonData` para a senha. Não inclua credenciais em dashboards, logs, documentação ou no Git.
- A CI do GitHub Actions não exige secrets. Ela usa configuração com valores de exemplo para as verificações estáticas e não se conecta aos serviços de testes nem faz deploy.
- Troque qualquer credencial suspeita ou confirmadamente exposta. Remover um valor do arquivo atual não o remove do histórico do Git; considere credenciais commitadas comprometidas e troque-as. A limpeza do histórico exige uma tarefa separada e controlada de reescrita do histórico.

## Acesso em produção

A topologia de produção validada usa Nginx como reverse proxy, com acesso limitado pelo firewall a origens internas/autorizadas. O Grafana permanece vinculado somente à interface de loopback, sem exposição externa direta, e o MariaDB permanece acessível localmente com usuário dedicado read-only. O `.env` de produção é local, separado e não versionado. DNS e HTTPS são possíveis evoluções futuras, ainda não configuradas. Consulte [Production Readiness](production-readiness.md).

## Revisão do repositório

A revisão atual analisou a árvore de trabalho e todos os commits alcançáveis do Git em busca de padrões de credenciais, chaves privadas, formatos comuns de tokens, cabeçalhos de autorização/cookie, endereços de rede privados, sufixos comuns de hostname interno e nomes de arquivos de artefatos sensíveis. Não encontrou credenciais versionadas, chaves privadas, padrões de secrets, endereços de rede privados, correspondências de hostnames internos nem arquivos de artefatos sensíveis. Há um arquivo `.env` local na árvore de trabalho, ignorado pelo Git; ele não foi exibido nem adicionado. Essas verificações reduzem riscos, mas não provam a ausência de todos os formatos possíveis de secrets.
