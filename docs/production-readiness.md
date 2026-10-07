# Production Readiness

Status: Produção v1 implantada e validada. A primeira versão é considerada estável.

## Fluxo de promoção

```text
DEV → GitHub/CI → TEST → PROD
```

As alterações passam pela validação estática da CI e pela validação de runtime/integrada em TEST antes da promoção para PROD. A CI não faz deploy automático.

## Controles implementados

- O Grafana está em execução no ambiente de produção e escuta somente na interface de loopback; o serviço não é exposto diretamente.
- O acesso externo passa pelo Nginx como reverse proxy, publicado em uma porta HTTP dedicada. O firewall restringe o acesso a origens internas/autorizadas.
- O MariaDB permanece acessível localmente pelo datasource, com uma conta dedicada read-only e sem exposição externa.
- O `.env` de produção é local, separado dos demais ambientes e não versionado.
- O datasource, o dashboard, o filtro **Entity** e as métricas foram validados em produção.
- O endpoint `/api/health` respondeu indicando o banco interno do Grafana saudável.

O estado descrito representa a primeira versão estável de produção. A topologia é específica do ambiente atual.

## Melhorias futuras não bloqueadoras

- Avaliar DNS e HTTPS para uma evolução futura da publicação HTTP atual.
- Automatizar backups do estado persistente do Grafana e testar periodicamente o restore.
- Definir um healthcheck gerenciado. A resposta validada de `/api/health` não significa que exista monitoramento automatizado.
- Revisar os planos `EXPLAIN` e o desempenho das queries com carga representativa como atividade contínua de operação; a validação funcional das métricas em produção já foi concluída.
- Documentar os procedimentos operacionais de promoção e recuperação sem registrar secrets ou detalhes internos.

Essas melhorias não alteram o status estável da produção v1 e não devem ser interpretadas como já implementadas.
