---
title: Comparações da TerraScale
description: Uma comparação prática entre TerraScale e outros bancos de dados com casos de uso semelhantes.
---

Nenhum banco de dados é a escolha certa para toda equipe. Esta página compara a TerraScale com outros produtos que desenvolvedores costumam avaliar para dados globalmente distribuídos, simplicidade operacional ou modelos de consulta familiares.

## DynamoDB

DynamoDB é um serviço NoSQL gerenciado e maduro, com forte integração com a AWS e um longo histórico em produção.

### Como a TerraScale se diferencia

A TerraScale foca em cargas documentais distribuídas globalmente, com um modelo centrado em documentos mais simples e uma história de preços mais fácil de explicar em termos comuns de banco de dados. O DynamoDB é profundamente otimizado para o ecossistema AWS, modelos de planejamento de capacidade e integrações nativas da AWS.

### Quando escolher TerraScale em vez de DynamoDB

Escolha TerraScale se você quer:

- um banco de dados documental com replicação multi-região embutida como recurso principal do produto
- um caminho de migração mais simples para equipes que preferem padrões de acesso no estilo documento
- uma plataforma que não está presa ao ecossistema AWS

### Quando DynamoDB pode ser melhor

DynamoDB pode ser uma escolha melhor se você quer:

- integração profunda com a AWS
- um serviço com histórico empresarial em produção muito longo
- ferramentas e padrões de arquitetura já construídos em torno de serviços AWS

## CosmosDB

CosmosDB é uma plataforma de banco de dados gerenciado rica em recursos, com distribuição global, múltiplas APIs e forte integração com Azure.

### Como a TerraScale se diferencia

A TerraScale busca manter o modelo operacional e a experiência do desenvolvedor mais focados e fáceis de entender. O CosmosDB oferece mais capacidades e recursos empresariais, mas essa flexibilidade também pode tornar preços, configuração e escolha de API mais complexos.

### Quando escolher TerraScale em vez de CosmosDB

Escolha TerraScale se você quer:

- um produto mais focado, com menos opções de plataforma para navegar
- fluxos orientados a documentos sem adotar a plataforma Azure mais ampla
- conceitos de preço mais simples para equipes pequenas e produtos iniciais

### Quando CosmosDB pode ser melhor

CosmosDB pode ser uma escolha melhor se você quer:

- recursos empresariais avançados e ampla integração com Azure
- uma plataforma apoiada pelo ecossistema maior de nuvem da Microsoft
- suporte a múltiplas APIs em uma mesma família de produto gerenciado

## MongoDB

MongoDB é o banco de dados documental mais familiar para muitos desenvolvedores e tem um grande ecossistema de ferramentas, tutoriais e opções gerenciadas.

### Como a TerraScale se diferencia

A TerraScale foi pensada para operação global distribuída desde o início. MongoDB oferece um modelo documental amplo e familiar, mas operar réplicas multi-região e mantê-las saudáveis pode adicionar complexidade operacional, especialmente em ambientes self-hosted.

### Quando escolher TerraScale em vez de MongoDB

Escolha TerraScale se você quer:

- distribuição global embutida como preocupação de primeira classe
- menos trabalho operacional com posicionamento de réplicas e topologia regional
- um produto desenhado especificamente para acesso documental distribuído

### Quando MongoDB pode ser melhor

MongoDB pode ser uma escolha melhor se você quer:

- um ecossistema muito grande e amplo suporte da comunidade
- ferramentas abrangentes em implantações self-hosted e gerenciadas
- compatibilidade com experiência e fluxos de trabalho existentes em MongoDB

## Turso

Turso é um produto de banco de dados distribuído construído sobre SQLite e um fluxo que costuma agradar desenvolvedores que gostam de padrões local-first.

### Como a TerraScale se diferencia

A TerraScale mantém o próprio banco disponível entre regiões, para que as aplicações possam ler e gravar diretamente em dados distribuídos. Turso está mais próximo do modelo SQLite e pode ser mais natural para equipes que preferem semântica de SQLite, fluxos embutidos ou padrões de sincronização local-first.

### Quando escolher TerraScale em vez de Turso

Escolha TerraScale se você quer:

- um banco documental em vez de semântica relacional baseada em SQLite
- nós de banco distribuídos globalmente como principal modelo de acesso
- um sistema pensado para leituras e gravações documentais em múltiplas regiões

### Quando Turso pode ser melhor

Turso pode ser uma escolha melhor se você quer:

- compatibilidade com SQLite
- padrões de aplicação local-first
- um fluxo centrado em consultas relacionais e ferramentas SQLite

## Relacionado

- [Pricing](/reference/pricing/)
- [Replication](/reference/replication/)
- [Use Cases](/reference/use-cases/)
- [Best Practices](/reference/best-practices/)

