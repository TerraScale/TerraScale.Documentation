---
title: Replicação
description: Informações sobre as estratégias de replicação de dados da TerraScale.
---

## O que é replicação

Replicação é o processo de copiar seus dados entre várias regiões para que eles fiquem próximos dos usuários e continuem disponíveis quando uma região tiver problemas.

Na TerraScale, replicação é parte central do produto. Você escolhe as regiões que importam para sua aplicação, e a TerraScale mantém os dados fluindo entre elas.

## Como a replicação da TerraScale funciona

Quando sua aplicação grava dados, a TerraScale aceita a gravação na região primária e depois replica essa mudança para as outras regiões configuradas no banco.

Para leituras, a TerraScale roteia requisições para a região disponível mais próxima sempre que possível. Isso ajuda a manter a latência baixa para usuários distribuídos globalmente.

## Comportamento de leitura

Leituras são atendidas pela região disponível mais próxima por padrão. Isso significa que usuários em diferentes partes do mundo muitas vezes podem ler de uma réplica próxima em vez de cruzar um oceano a cada requisição.

Do ponto de vista de uso, uma leitura conta como uma única operação, independentemente de quantas regiões de réplica o seu banco tenha configuradas.

## Comportamento de escrita

Gravações são aplicadas na região primária e depois propagadas para cada região de réplica configurada.

Como o sistema precisa processar a gravação em cada região configurada, o custo de escrita cresce com o número de regiões. Como regra simples, uma escrita é contabilizada como uma operação por região.

## Modelo de consistência

A TerraScale oferece consistência forte dentro de uma região e consistência eventual entre regiões.

Isso significa que uma gravação é imediatamente durável na região que a aceitou, enquanto outras regiões podem observar essa mudança pouco depois que a replicação termina.

Para a maioria das aplicações distribuídas globalmente, isso dá um bom equilíbrio entre baixa latência de leitura e comportamento prático de replicação.

## Configurando replicação

Você pode escolher regiões ao criar um banco de dados e depois adicionar ou remover regiões conforme seu padrão de tráfego muda.

Motivos comuns para adicionar regiões incluem:

- reduzir latência de leitura para uma nova geografia
- melhorar resiliência regional
- atender requisitos de residência de dados

Se você está começando agora, inicie pelas regiões mais próximas dos seus usuários hoje e expanda de forma intencional.

## Comportamento de failover

Se uma região ficar indisponível, a TerraScale pode continuar servindo leituras a partir de outras regiões disponíveis.

Esse comportamento automático de failover ajuda a reduzir downtime em aplicações distribuídas. Seus usuários podem ver latência maior durante uma interrupção regional, mas as leituras podem continuar a partir de réplicas saudáveis quando os dados estiverem disponíveis nelas.

## Considerações de performance

Replicação melhora a latência global de leitura, mas também muda o caminho de escrita e o perfil de custo.

- Mais regiões normalmente significam menor latência de leitura para um público maior
- Mais regiões também significam mais trabalho de replicação para cada gravação
- Cargas com muitas gravações devem escolher com cuidado quais regiões ativar

Para detalhes de pricing, veja [Pricing](/reference/pricing/).

## Veja também

- [Pricing](/reference/pricing/)
- [Getting Started](/guides/getting-started/)
- [Regions](/reference/regions/)
- [Going Global: Setting Up Multi-Region Replication](/blog/multi-region-setup/)

