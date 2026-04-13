---
title: Por que construímos o TerraScale (a versão honesta)
date: 2024-03-22
authors:
  - name: Mario GK
    title: Founder
tags:
  - behind-the-scenes
  - story
excerpt: Toda startup tem uma história de origem. A nossa começou com uma conta de nuvem de $47.000 e muita frustração. Aqui está a história honesta por trás da existência do TerraScale.
cover:
  wide: /images/blog/why-we-built-terrascale/cover-wide.svg
  square: /images/blog/why-we-built-terrascale/cover-square.svg
  alt: Duas placas estruturais escuras divididas e reconectadas por uma emenda elétrica precisa, evocando um redesenho doloroso de infraestrutura.
---

Toda startup tem uma história de origem. Normalmente é algo inspirador: um fundador vê um problema, tem uma visão e constrói algo incrível. Nossa história é um pouco menos glamourosa. Ela começou com uma conta de nuvem de $47.000.

Eu quis escrever isso porque páginas de produto normalmente suavizam as partes bagunçadas. Este post não faz isso. Se você está avaliando o TerraScale, acho que merece a versão real.

## A conta que mudou tudo

Lá em 2021, eu era tech lead em uma startup fintech de porte médio. Estávamos crescendo rápido, o que era ótimo. Também estávamos queimando dinheiro com infraestrutura, o que era menos ótimo.

Em um mês, nossa conta do DynamoDB veio em $47.000. Para deixar claro, isso não foi porque o DynamoDB é caro. Na verdade, ele é bem razoável se você sabe o que está fazendo. O problema é que nós não sabíamos o que estávamos fazendo.

Tínhamos hot partitions que nem sabíamos que existiam. Estávamos superprovisionando capacidade porque tínhamos medo de throttling. Estávamos armazenando dados de forma ineficiente porque os padrões de acesso evoluíram e ninguém tinha refatorado o schema.

Passei os três meses seguintes me tornando especialista em DynamoDB por pura necessidade. Li cada post de blog, assisti cada palestra da re:Invent e experimentei cada padrão que consegui encontrar. No fim, reduzi nossa conta em 60% e nossa latência p99 em 80%.

Mas aqui está a questão: eu não deveria ter precisado fazer isso. Eu deveria estar construindo recursos, não otimizando detalhes internos do banco de dados.

## A percepção

Depois que saí daquele trabalho, não consegui parar de pensar no problema. DynamoDB é uma tecnologia genuinamente brilhante. A latência de milissegundos de um dígito, a escalabilidade sem atrito, as garantias de durabilidade, é uma engenharia impressionante.

Mas também é complexo. Muito complexo. A curva de aprendizado é íngreme. O modelo de preços é confuso. A história de desenvolvimento local é dolorosa. E, se você errar na modelagem dos dados, vai sofrer bastante.

Comecei a conversar com outros desenvolvedores e ouvi a mesma história repetidas vezes. Eles adoravam a ideia de um banco NoSQL rápido e escalável. O que eles odiavam era operá-lo na prática.

## O que decidimos construir

A ideia inicial era simples: e se o DynamoDB fosse mais fácil?

Não simplificado demais, mais fácil. Mesmo poder, menos atrito. Na prática, isso significava:

**Múltiplas interfaces de consulta.** Alguns desenvolvedores adoram SQL. Alguns querem uma API compatível com DynamoDB para migração fácil. Alguns querem uma API REST limpa e moderna. Por que forçar todo mundo a um único paradigma? Se essa pergunta parece familiar, o [guia de estratégia de API](/guides/api-strategy/) vale a leitura.

**Preços transparentes.** Pague por armazenamento e operações. Ponto. Nada de capacity units para entender, nenhuma discussão entre provisioned e on-demand, nenhum detalhe escondido. Você pode comparar o modelo na [referência de preços](/reference/pricing/).

**Desenvolvimento local de primeira classe.** `docker run terrascale` e você tem um banco local que se comporta como produção. Sem emuladores estranhos, sem ressalvas do tipo "quase compatível".

**Padrões inteligentes.** Sugestões automáticas de indexação. Caching embutido. Rate limiting sensato. O banco de dados deveria ajudar você, não apenas executar seus comandos cegamente.

Por que isso importa: não estávamos tentando construir um banco de dados que só especialistas admirariam. Queríamos um que uma equipe pequena pudesse adotar rapidamente, operar com segurança e continuar usando conforme o produto crescesse.

## Dois anos depois

Lançamos o primeiro protótipo em 2022. Era bruto. O query planner era ingênuo, o SDK tinha bugs e a documentação era basicamente "leia o código".

Mas funcionava. E, aos poucos, fizemos funcionar melhor.

Agora estamos lidando com bilhões de operações por mês em clientes de mais de 40 países. Temos um SDK real, com mais a caminho. A documentação é documentação de verdade.

É perfeito? Não. Ainda somos uma equipe pequena e ainda há muita coisa para construir. Mas está sólido. É algo em que eu confiaria meus próprios dados de produção, e é isso que faço.

## A parte honesta

Aqui está a coisa que ninguém conta sobre construir infraestrutura: é aterrorizante. Quando seu código tem um bug, os usuários veem um erro. Quando um banco de dados tem um bug, usuários podem perder dados.

Cometemos erros. Tivemos indisponibilidades. Lançamos recursos que não estavam prontos e tivemos que voltar atrás. Isso faz parte de construir software.

O que não fizemos foi perder dados de clientes. Essa é a linha que nunca vamos cruzar. Todo o resto é corrigível.

Se você está pensando em experimentar o TerraScale, saiba que não está recebendo apenas um banco de dados. Está recebendo uma equipe obcecada por fazer isso direito. Cada ticket de suporte, cada bug report, cada feedback, levamos a sério.

Se você quiser ver o produto em si em vez de apenas a história por trás, comece pelo [guia de primeiros passos](/guides/getting-started/) ou navegue pela [referência de boas práticas](/reference/best-practices/).

Construímos o TerraScale porque queríamos um banco de dados melhor. Estamos apostando que você também quer.
