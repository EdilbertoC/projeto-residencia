# Auditoria de Mocks e Integracoes Parciais

Este documento lista os pontos do sistema que ainda usam dados simulados, fallback local ou integracao parcial. O objetivo e separar comportamento intencional de prototipo de fluxos que ja dependem da API.

## Painel

- Origem atual: dados agregados montados na tela.
- Risco: indicadores podem divergir da base real.
- Acao recomendada: substituir por endpoints de metricas assim que a API disponibilizar indicadores consolidados.

## Analytics

- Origem atual: graficos e series estaticas/locais.
- Risco: analises gerenciais podem parecer reais sem refletir producao.
- Acao recomendada: criar repositorio dedicado para metricas e remover mocks apos validacao dos endpoints.

## Consultas

- Origem atual: `careQueue` em `src/data/mockData.js`.
- Risco: fila de atendimento nao representa a operacao real.
- Acao recomendada: trocar por endpoint de fila/triagem ou derivar de agendamentos com status.

## Comunicacao

- Origem atual: templates, mensagens e campanhas iniciais mockados no repositorio do modulo.
- Risco: usuario pode confundir historico simulado com mensagens enviadas.
- Acao recomendada: manter sinalizador visual ate existir endpoint de envio/listagem real.

## Prontuario

- Origem atual: registros locais com fallback para historico mockado quando relatorios reais nao carregam.
- Risco: detalhe clinico pode misturar dados reais e simulados.
- Acao recomendada: integrar CRUD completo de prontuario e remover fallback em fluxos clinicos.

## Relatorios

- Origem atual: templates de conteudo sao locais em `src/data/reportTemplates.js`.
- Risco: baixo; templates sao conteudo inicial, nao dados clinicos gravados.
- Acao recomendada: manter local se forem padroes do produto ou migrar para configuracao administrativa no futuro.

## Configuracoes

- Origem atual: preferencias visuais locais no navegador.
- Risco: preferencia nao acompanha o usuario em outro dispositivo.
- Acao recomendada: persistir preferencias no perfil quando houver campo/API para isso.
