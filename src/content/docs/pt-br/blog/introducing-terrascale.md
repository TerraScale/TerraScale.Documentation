---
title: Apresentando o TerraScale, uma forma melhor de pensar em NoSQL
date: 2024-03-15
authors:
  - name: Mario GK
    title: Founder
tags:
  - announcement
  - launch
excerpt: Depois de dois anos de desenvolvimento, estamos animados para apresentar o TerraScale, um banco de dados NoSQL distribuído globalmente que combina o poder ao estilo DynamoDB com uma experiência de desenvolvimento mais simples.
cover:
  wide: /images/blog/introducing-terrascale/cover-wide.svg
  square: /images/blog/introducing-terrascale/cover-square.svg
  alt: Linhas de horizonte iluminadas e um farol surgindo, sugerindo uma nova plataforma global de dados emergindo da escuridão.
---

Depois de dois anos de noites viradas, incontáveis refactors e café demais, finalmente estou empolgado para compartilhar o que temos construído: TerraScale.

Se você é novo por aqui, o TerraScale foi criado para equipes que querem escala global sem transformar operações de banco de dados em um trabalho de tempo integral. Este post traz a visão geral. Se você preferir ir direto ao produto, comece pelo [guia de primeiros passos](/guides/getting-started/).

## O problema que queríamos resolver

Passei boa parte da última década trabalhando com bancos de dados distribuídos. DynamoDB, Cassandra, MongoDB, o que você imaginar, provavelmente já depurei um incidente em produção envolvendo isso às 3 da manhã.

E aqui está o que sempre me incomodou: esses bancos de dados são incrivelmente poderosos, mas fazem você pagar um imposto de complexidade. Quer consultar seus dados? Aprenda uma linguagem de consulta customizada. Precisa configurar tudo localmente? Boa sorte com esse arquivo Docker Compose. Quer preços previsíveis? Melhor deixar a calculadora preparada.

Achamos que precisava existir um jeito melhor.

## O que o TerraScale realmente é

O TerraScale é um banco de dados NoSQL totalmente gerenciado e distribuído globalmente. Se isso parece complicado, aqui vai a versão simples: é um lugar para guardar seus dados, rápido no mundo inteiro, resiliente por padrão e que não exige um PhD para operar.

Algumas coisas o tornam diferente:

**Três formas de falar com seus dados.** Use nossa API nativa se quiser performance máxima. Use a API compatível com DynamoDB se estiver migrando um app existente. Ou use SQL se quiser algo familiar. Mesmo dado, sua escolha de interface. Se você estiver comparando abordagens, o [guia de estratégia de API](/guides/api-strategy/) é uma boa próxima parada.

**Preços realmente simples.** Você paga pelo que armazena e pelo que lê e escreve. Só isso. Sem planejamento de capacidade, sem instâncias reservadas, sem surpresas na conta porque você esqueceu de configurar uma política de auto-scaling. Para detalhes, veja a [referência de preços](/reference/pricing/).

**Roda em qualquer lugar.** 19 regiões ao redor do mundo. Seus dados ficam perto dos seus usuários, onde quer que eles estejam. Quando você estiver pronto para crescer além de uma única região, a [referência de replication](/reference/replication/) explica como isso funciona.

Por que isso importa: a maioria das equipes não sofre porque o banco de dados não tem recursos. Elas sofrem porque cada recurso útil adiciona mais sobrecarga operacional. Construímos o TerraScale para reduzir essa sobrecarga sem tirar o poder.

## Para quem isso é?

Sinceramente, é para qualquer pessoa cansada de brigar com o próprio banco de dados.

Temos rodado uma Public Alpha nos últimos seis meses com cerca de 50 empresas. Os casos de uso foram os mais variados: leaderboards de jogos em tempo real, dados de sensores IoT, catálogos de produtos de e-commerce, logs de transações financeiras.

O ponto em comum é simples. Essas equipes queriam algo que simplesmente funcionasse. Elas não queriam se tornar especialistas em banco de dados. Queriam entregar seu produto de verdade.

## O que vem a seguir

Hoje marca nosso lançamento público. Você pode se cadastrar em [dashboard.terrascale.io](https://dashboard.terrascale.io) e começar a construir agora mesmo. O plano gratuito dá espaço suficiente para criar algo real, não apenas um brinquedo.

Nos próximos meses, vamos lançar mais SDKs, mais regiões e alguns recursos com os quais estou genuinamente animado, mas sobre os quais ainda não posso falar. Se você quiser uma prévia do rumo das coisas, acompanhe o [roadmap da Public Alpha](/roadmap/).

Se você experimentar o TerraScale e gostar, conte para seus amigos. Se você experimentar e algo não funcionar direito, conte para nós. Somos uma equipe pequena e lemos cada feedback.

Aqui vai um brinde a construirmos algo ótimo juntos.

- Mario
