---
title: Guia completo para migrar do DynamoDB para o TerraScale
date: 2024-05-10
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - migration
  - dynamodb
  - guide
excerpt: O TerraScale oferece uma API compatível com DynamoDB que torna a migração mais direta. Aqui está o guia completo para mover seus dados.
cover:
  wide: /images/blog/migrating-from-dynamodb/cover-wide.svg
  square: /images/blog/migrating-from-dynamodb/cover-square.svg
  alt: Dois sistemas de dados estruturados conectados por uma ponte de transferência calma, representando a migração de uma plataforma para outra.
---

Uma das perguntas que mais recebo é: "Como eu migro do DynamoDB para o TerraScale?"

A boa notícia é que projetamos o TerraScale pensando em migração. Nossa API compatível com DynamoDB significa que, muitas vezes, você pode trocar com mudanças mínimas de código. Aqui está o guia completo.

## O que você vai aprender

- Qual estratégia de migração se encaixa melhor no seu sistema
- Como implementar um rollout com dual-write sem apressar o cutover
- O que verificar antes de finalmente trocar o tráfego

Se você está planejando uma migração ativamente, deixe por perto a [referência de migrations](/reference/migrations/), a [página de comparações](/reference/comparisons/) e a [referência de boas práticas](/reference/best-practices/).

## Por que migrar?

Antes de mergulhar no como, vamos falar sobre por que você talvez queira migrar:

1. **Preços mais simples** - O modelo pay-per-operation do TerraScale costuma ser mais previsível do que as capacity units do DynamoDB
2. **Múltiplas APIs** - Use SQL, REST ou APIs compatíveis com DynamoDB sobre os mesmos dados
3. **Melhor experiência de desenvolvimento** - SDKs de primeira linha com padrões modernos como tipos Result
4. **Custos transparentes** - Sem contas surpresa por políticas de auto-scaling esquecidas

Dito isso, DynamoDB é excelente. Se está funcionando para você, não existe urgência para mudar. Migrações valem a pena quando os benefícios de longo prazo estão claros, não porque trocar de banco de dados parece empolgante numa sexta à tarde.

## Estratégias de migração

Existem três abordagens principais, cada uma com seus trade-offs. Escolha a que combina com sua tolerância a downtime, complexidade e risco de rollback.

### Estratégia 1: Big bang

Exporte tudo do DynamoDB, importe para o TerraScale e atualize sua aplicação para apontar para o TerraScale.

| Pros | Cons |
|------|------|
| Mais simples conceitualmente | Exige downtime |
| Cutover limpo | Arriscado para datasets grandes |
| | Tudo ou nada |

**Melhor para:** Datasets pequenos, aplicações que toleram downtime planejado.

### Estratégia 2: Dual write

Atualize sua aplicação para escrever nos dois bancos. Faça backfill dos dados históricos. Mude as leituras gradualmente para o TerraScale. Eventualmente pare de escrever no DynamoDB.

| Pros | Cons |
|------|------|
| Zero downtime | Implementação mais complexa |
| Transição gradual e segura | Custo temporário de rodar dois bancos |
| Rollback fácil | Precisa tratar consistency com cuidado |

**Melhor para:** Sistemas em produção que não toleram downtime.

### Estratégia 3: Incremental por tabela

Migre uma tabela por vez. Cada tabela passa pelo seu próprio ciclo de dual-write.

| Pros | Cons |
|------|------|
| Menor risco por migração | Leva mais tempo no total |
| Aprenda com cada iteração | Queries entre tabelas ficam complexas durante a migração |
| Mais fácil de gerenciar | |

**Melhor para:** Sistemas grandes com muitas tabelas independentes.

## O padrão dual write

Como dual write é a abordagem mais segura para a maioria dos sistemas em produção, veja como implementá-la.

### Etapa 1: configure o TerraScale

Crie seu banco de dados e gere uma API key. Certifique-se de que sua estrutura de tabela corresponde à do DynamoDB. Esse também é o momento certo para revisar suas escolhas de partition key e sort key, em vez de simplesmente carregar adiante todos os erros antigos.

### Etapa 2: implemente dual write
```csharp
public class DualWriteRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly TerraScaleDatabase _terraScale;
    private readonly ILogger _logger;

    public async Task PutItemAsync(string pk, string sk, Dictionary<string, object> data)
    {
        // Write to DynamoDB first (primary)
        await _dynamoDb.PutItemAsync(/* ... */);

        // Write to TerraScale (secondary)
        try
        {
            await _terraScale.PutItemAsync(pk, sk, data);
        }
        catch (Exception ex)
        {
            // Log but don't fail - TerraScale is secondary during migration
            _logger.LogWarning(ex, "TerraScale write failed, will retry");
            await QueueForRetry(pk, sk, data);
        }
    }
}
```

### Etapa 3: faça backfill dos dados históricos

Use DynamoDB Streams ou uma exportação em batch para sincronizar dados existentes:
```csharp
public async Task BackfillFromDynamoDB()
{
    string? lastKey = null;

    do
    {
        var scanResult = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = "my-table",
            ExclusiveStartKey = lastKey != null ? ParseKey(lastKey) : null
        });

        foreach (var item in scanResult.Items)
        {
            await _terraScale.PutItemAsync(
                item["pk"].S,
                item["sk"].S,
                ConvertAttributes(item)
            );
        }

        lastKey = scanResult.LastEvaluatedKey?.ToString();

        // Respect rate limits
        await Task.Delay(100);

    } while (lastKey != null);
}
```

### Etapa 4: mude o tráfego de leitura

Use uma feature flag para mudar leituras gradualmente:
```csharp
public async Task<Item?> GetItemAsync(string pk, string sk)
{
    if (_featureFlags.TerraScaleReadEnabled)
    {
        try
        {
            var result = await _terraScale.GetItemAsync(pk, sk);
            if (result.IsSuccess)
                return result.Value;
        }
        catch
        {
            // Fall back to DynamoDB
        }
    }

    return await _dynamoDb.GetItemAsync(/* ... */);
}
```

Comece com 1% do tráfego, monitore e depois aumente para 10%, 50% e 100%. Dê a si mesmo tempo entre os passos para comparar correção e latência, não apenas throughput.

### Etapa 5: verifique e faça o cutover

Quando 100% das leituras já estiverem no TerraScale e você estiver confiante nos dados:

1. Pare as escritas no DynamoDB
2. Atualize sua aplicação para usar apenas o TerraScale
3. Mantenha o DynamoDB como backup somente leitura por 30 dias
4. Desative o DynamoDB

## Usando a API compatível com DynamoDB

O TerraScale oferece um endpoint compatível com DynamoDB. Isso significa que você pode usar seu código atual do AWS SDK com mudanças mínimas:
```csharp
// Before: DynamoDB
var dynamoClient = new AmazonDynamoDBClient();

// After: TerraScale (DynamoDB-compatible endpoint)
var config = new AmazonDynamoDBConfig
{
    ServiceURL = "https://dynamodb.terrascale.io"
};
var terraScaleClient = new AmazonDynamoDBClient(
    new BasicAWSCredentials("your-api-key", "ignored"),
    config
);

// Your existing code works unchanged
await terraScaleClient.PutItemAsync(/* same code as before */);
```

Essa camada de compatibilidade suporta:
- GetItem, PutItem, DeleteItem, UpdateItem
- Query and Scan
- BatchGetItem, BatchWriteItem
- TransactGetItems, TransactWriteItems

## Armadilhas comuns

### Timestamps

O DynamoDB muitas vezes armazena timestamps como números (Unix epoch). O SDK do TerraScale prefere strings ISO 8601. Seja explícito com o seu formato:
```csharp
// Works in both
["createdAt"] = DateTime.UtcNow.ToString("O")
```

### Reserved words

O TerraScale tem menos reserved words do que o DynamoDB, mas confira seus nomes de atributos por garantia.

### Condition expressions

A sintaxe é quase idêntica, mas teste suas condições complexas durante a migração. Pequenos casos de borda são exatamente o tipo de coisa que você quer capturar antes do cutover completo.

Por que isso importa: a maioria das falhas de migração não é causada pela etapa de exportação ou importação. Elas vêm de suposições escondidas no código da aplicação, caminhos de dados obsoletos ou um cutover feito antes de haver verificação suficiente.

## Checklist de verificação

Antes de concluir a migração:

- [ ] Todos os dados receberam backfill e foram verificados
- [ ] 100% das leituras sendo servidas pelo TerraScale
- [ ] 100% das escritas indo para o TerraScale
- [ ] Monitoramento e alertas configurados
- [ ] Procedimento de rollback documentado
- [ ] Equipe treinada no dashboard do TerraScale

## Precisa de ajuda?

Migração pode ser estressante. Se você está planejando uma migração grande, fale comigo em mariogk@terrascale.tech. Terei prazer em revisar seu plano e oferecer sugestões.
