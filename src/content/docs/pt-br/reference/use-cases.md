---
title: Casos de uso para TerraScale
description: Casos de uso comuns e padrões recomendados para a TerraScale.
---

## Casos de uso comuns

### Jogos em tempo real

A TerraScale funciona bem para cargas de jogos que precisam de leituras rápidas, gravações frequentes e disponibilidade global.

Padrões comuns incluem:

- leaderboards
- estado do jogador e inventário
- dados de sessão ao vivo

Veja [Building a Real-Time Gaming Leaderboard with TerraScale](/blog/building-realtime-leaderboard/).

### IoT e dados de sensores

Sistemas de IoT muitas vezes geram fluxos constantes de gravação a partir de dispositivos espalhados por várias regiões. A TerraScale é uma boa opção para:

- leituras no estilo série temporal
- estado atual do dispositivo
- pipelines de ingestão com alto throughput de escrita

Isso funciona melhor quando você modela os dados em torno de identificadores de dispositivo, janelas de tempo ou outros padrões previsíveis de acesso.

### E-commerce

Aplicações de e-commerce geralmente precisam de acesso de baixa latência a dados voltados ao usuário e armazenamento durável para registros atualizados com frequência.

Cargas típicas incluem:

- catálogos de produtos
- carrinhos de compra
- sessões de usuário

A TerraScale pode ajudar a manter essas leituras rápidas para clientes em diferentes regiões, preservando um modelo operacional simples.

### Aplicações SaaS

A TerraScale é uma escolha natural para produtos SaaS multi-tenant que precisam de padrões de acesso previsíveis e baixa sobrecarga operacional.

Exemplos comuns incluem:

- dados de aplicação com escopo por tenant
- preferências de usuário
- feature flags e stores de configuração

Isso é especialmente útil quando seus clientes estão espalhados por múltiplas geografias e esperam leituras responsivas próximas de sua localização.

### Logs de transações financeiras

Plataformas financeiras e sistemas internos de ledger muitas vezes precisam de padrões de armazenamento com muita append e histórico confiável para auditoria.

A TerraScale é uma boa opção para:

- trilhas de auditoria
- registros de event sourcing
- logs de atividade orientados a compliance

Essas cargas geralmente se beneficiam de chaves bem desenhadas, conjuntos pequenos de resultado e paginação explícita.

## Quando a TerraScale é uma ótima escolha

A TerraScale é especialmente atraente quando:

- seus usuários estão distribuídos globalmente
- baixa latência de leitura importa para a experiência do produto
- você quer pricing baseado em uso mais simples
- você está migrando do DynamoDB e quer um caminho familiar

Ela também funciona bem quando seus padrões de acesso são conhecidos antecipadamente e sua aplicação se beneficia de leituras multi-região.

## Quando considerar alternativas

Você pode considerar outro sistema se sua carga depender de:

- consultas relacionais complexas e muitos joins
- agregações pesadas ou pipelines analíticos
- armazenamento muito grande de blobs ou mídia dentro do próprio banco

Nesses casos, a TerraScale ainda pode se encaixar em parte da arquitetura, mas não deve ser a única camada de persistência por padrão.

## Primeiros passos

Se um desses padrões combina com a sua aplicação, comece com o [Getting Started guide](/guides/getting-started/).

## Veja também

- [Best Practices](/reference/best-practices/)
- [Data Models](/reference/data-models/)
- [Comparisons](/reference/comparisons/)
- [Replication](/reference/replication/)

