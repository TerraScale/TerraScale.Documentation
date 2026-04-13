---
title: "Expandindo globalmente: configurando replication multi-region"
date: 2024-09-10
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - multi-region
  - replication
  - tutorial
excerpt: Seus usuários estão em todos os lugares. Seu banco de dados também deveria estar. Veja como configurar replication multi-region no TerraScale com as expectativas corretas.
cover:
  wide: /images/blog/multi-region-setup/cover-wide.svg
  square: /images/blog/multi-region-setup/cover-square.svg
  alt: Clusters de regiões espelhados conectados por linhas de replication medidas, ilustrando uma configuração multi-region.
---

Seus usuários estão em todos os lugares. Seu banco de dados também deveria estar.

O TerraScale suporta 19 regiões no mundo todo. Com replication multi-region, seus dados são copiados automaticamente para as regiões que você escolher, dando aos usuários acesso de baixa latência onde quer que estejam.

Veja como configurar.

## O que você vai aprender

- Quando replication multi-region vale a complexidade adicional
- Como adicionar regiões pelo dashboard, SDK ou API
- O que muda para leituras, escritas, consistency e custo

Se você quiser a documentação do produto junto com este passo a passo, abra a [referência de replication](/reference/replication/) e a [referência de regiões](/reference/regions/).

## Por que multi-region?

Existem três motivos principais para equipes adotarem multi-region:

1. **Latência** - Um usuário em Tokyo acessando dados em us-east-1 adiciona 150-200ms de ida e volta. Com uma réplica em ap-northeast-1, fica abaixo de 10ms.

2. **Disponibilidade** - Se uma região tiver um problema, leituras podem ser servidas por outra região.

3. **Compliance** - Algumas regulações exigem que os dados sejam armazenados em locais geográficos específicos.

## Configurando replication

### Via dashboard

1. Vá para as configurações do seu banco de dados
2. Clique em "Add Region"
3. Selecione a(s) região(ões) desejada(s)
4. Clique em "Enable Replication"

É isso. Os dados existentes começam a sincronizar imediatamente. Para um banco de dados novo, isso normalmente parece quase instantâneo. Para um banco maior, espere que a primeira sincronização demore mais enquanto a cópia inicial alcança tudo.

### Via SDK
```csharp
await client.Management.Databases.AddRegionAsync("my-database", new AddRegionRequest
{
    Region = "eu-west-1"
});
```

### Via API
```bash
POST /api/v1/management/databases/my-database/regions
{
    "region": "eu-west-1"
}
```

## Como a replication funciona

Quando você escreve no TerraScale, este é o fluxo:

1. A escrita vai para sua região primária
2. Ela é confirmada assim que está durável ali
3. De forma assíncrona, os dados são replicados para outras regiões
4. A replication normalmente termina em 100-500ms
```
Write in us-east-1 → Durable in us-east-1 (12ms) → Response to client
                   → Async replicate to eu-west-1 (~200ms)
                   → Async replicate to ap-northeast-1 (~300ms)
```

## Leitura a partir de réplicas

Por padrão, leituras vão para a região mais próxima:
```csharp
var result = await client.GetItemAsync("user#123", "profile");
// Automatically routes to nearest region
```

Se você precisa do dado absolutamente mais recente, use uma leitura consistente:
```csharp
var result = await client.GetItemAsync("user#123", "profile", new GetOptions
{
    ConsistentRead = true  // Routes to primary region
});
```

## Escolhendo regiões

Este é o meu modelo mental para escolher regiões. Comece por onde seus usuários estão hoje, não por onde você espera que talvez estejam no próximo ano.

| User Location | Primary Region | Replica Regions |
|---------------|----------------|-----------------|
| Mostly US | us-east-1 | us-west-2 |
| US + Europe | us-east-1 | eu-west-1 |
| Global | us-east-1 | eu-west-1, ap-northeast-1 |
| Europe-focused | eu-west-1 | eu-central-1 |
| Asia-focused | ap-southeast-1 | ap-northeast-1 |

Comece com sua base principal de usuários, depois adicione regiões conforme crescer. Uma segunda região bem escolhida normalmente entrega mais valor do que se espalhar cedo demais por muitas delas.

## Regiões disponíveis

O TerraScale roda em 19 regiões:

**Americas:**
- us-east-1 (N. Virginia)
- us-east-2 (Ohio)
- us-west-1 (N. California)
- us-west-2 (Oregon)
- ca-central-1 (Montreal)
- sa-east-1 (São Paulo)

**Europe:**
- eu-west-1 (Ireland)
- eu-west-2 (London)
- eu-west-3 (Paris)
- eu-central-1 (Frankfurt)
- eu-north-1 (Stockholm)

**Asia Pacific:**
- ap-northeast-1 (Tokyo)
- ap-northeast-2 (Seoul)
- ap-southeast-1 (Singapore)
- ap-southeast-2 (Sydney)
- ap-south-1 (Mumbai)

**Middle East & Africa:**
- me-south-1 (Bahrain)
- af-south-1 (Cape Town)

## Resolução de conflitos

O que acontece se o mesmo item for escrito em duas regiões simultaneamente?

O TerraScale usa last-writer-wins com base em timestamp. A escrita com o timestamp mais recente se torna a versão autoritativa.

Para a maioria dos casos de uso, isso é aceitável. Usuários raramente atualizam o mesmo item de continentes diferentes exatamente no mesmo momento.

Por que isso importa: multi-region oferece melhor experiência ao usuário e melhor resiliência, mas também significa que você deve ser intencional sobre de onde as escritas se originam e qual consistency sua aplicação realmente precisa.

Se você precisa de consistency mais forte, determine que as escritas vão para sua região primária:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "...",
    DatabaseId = "my-database",
    PreferredWriteRegion = "us-east-1"  // All writes go here
});
```

## Custos

Replication multi-region tem custos:

- **Storage**: Cada região armazena uma cópia completa dos seus dados
- **Replication**: Transferência de dados entre regiões

Para um banco de dados de 10GB com 3 regiões:
- Storage: 10GB × 3 = 30GB total
- Replication: Depende do volume de escrita

A melhoria de latência normalmente vale a pena para aplicações voltadas ao usuário. Se você é sensível a custo, compare isso com a [referência de billing](/reference/billing/) antes de ativar mais regiões do que realmente precisa.

## Removendo uma região

Se você não precisa mais de uma região:
```csharp
await client.Management.Databases.RemoveRegionAsync("my-database", new RemoveRegionRequest
{
    Region = "eu-west-1"
});
```

Os dados nessa região são apagados. A região primária e as outras réplicas não são afetadas.

## Monitorando replication

O dashboard mostra o status de replication:

- **Replication Lag**: Tempo de atraso em relação à primária
- **Sync Status**: Syncing, Synced ou Error
- **Last Sync**: Quando a replication foi concluída pela última vez

Um replication lag saudável fica abaixo de 1 segundo. Se você vir atraso sustentado acima de 5 segundos, verifique seu volume de escrita ou fale com o suporte.

## Resumo

1. Adicione regiões onde seus usuários estão
2. Leituras vão automaticamente para a região mais próxima
3. Use leituras consistentes quando precisar dos dados mais recentes
4. Last-writer-wins para resolução de conflitos
5. Monitore replication lag no dashboard

Dúvidas sobre configuração multi-region? Envie um email para mariogk@terrascale.tech. Se você está planejando leituras e escritas globais ao mesmo tempo, a [referência de boas práticas](/reference/best-practices/) pode ajudar a evitar erros comuns de modelagem.
