---
title: "Anunciando o SDK C# do TerraScale: suporte .NET de primeira linha"
date: 2024-07-03
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - announcement
  - sdk
  - dotnet
excerpt: Hoje estamos lançando o SDK C# oficial do TerraScale. Aqui está o que vem nele, por que o criamos e como começar.
cover:
  wide: /images/blog/announcing-csharp-sdk/cover-wide.svg
  square: /images/blog/announcing-csharp-sdk/cover-square.svg
  alt: Formas de engenharia precisas com colchetes e nós modulares, evocando um lançamento polido de um novo SDK.
---

Hoje estamos lançando o SDK C# oficial do TerraScale. Ele está em Public Alpha há três meses e eu estou genuinamente orgulhoso de como ficou.

## O que você vai aprender

- Por que começamos com C# antes de outros SDKs
- O que o SDK oferece pronto para uso
- Para onde ir em seguida se você quiser criar um app real com ele

Para a documentação completa do produto, deixe por perto o [guia do SDK C#](/guides/sdks/csharp/), o [guia de repository](/guides/repository/) e a [referência de tratamento de erros](/reference/error-handling/).

## Por que C# primeiro?

Quando começamos a criar SDKs, tivemos que escolher uma linguagem para começar. JavaScript teria sido a escolha óbvia, está em todo lugar. Mas olhamos para nossos primeiros usuários e percebemos algo interessante: um número desproporcional deles era de empresas .NET.

O diagrama de Venn entre "desenvolvedores que querem uma experiência parecida com DynamoDB" e "desenvolvedores que constroem com C#" tem muita sobreposição. Muitos desenvolvedores estão migrando do Azure Cosmos DB ou criando backends de alto desempenho, onde C# brilha.

Então foi C#.

## O que vem na caixa

### Instalação
```bash
dotnet add package TerraScale.Client
```

É isso. Sem dependências nativas, sem configuração complexa. Funciona no .NET 6, 7 e 8.

### Uso básico
```csharp
using TerraScale;

var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY"),
    DatabaseId = "my-database"
});

// Write an item
await client.PutItemAsync("user#123", "profile", new Dictionary<string, object>
{
    ["name"] = "Mario",
    ["email"] = "mariogk@terrascale.tech",
    ["createdAt"] = DateTime.UtcNow
});

// Read it back
var result = await client.GetItemAsync("user#123", "profile");
if (result.IsSuccess)
{
    var name = result.Value.GetAttribute<string>("name");
    Console.WriteLine($"Hello, {name}!");
}
```

### O padrão Repository

Dicionários brutos servem para prototipagem, mas código de produção merece algo melhor:
```csharp
public record User : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

var users = client.GetRepository<User>("users");

var user = new User
{
    Id = "user-123",
    Name = "Mario",
    Email = "mariogk@terrascale.tech"
};

await users.CreateAsync(user);
var retrieved = await users.GetByIdAsync("user-123");
Console.WriteLine(retrieved.Value.Name); // Mario
```

### Tipos Result

Toda operação do SDK retorna um tipo `Result<T>`. Nada de exceções para falhas esperadas:
```csharp
var result = await client.GetItemAsync("user#123", "profile");

var message = result switch
{
    { IsSuccess: true } => $"Found: {result.Value.PartitionKey}",
    { IsFailed: true } => $"Error: {result.Errors.First().Message}",
    _ => "Unknown state"
};
```

### Políticas de retry

Falhas transitórias são tratadas automaticamente:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "...",
    DatabaseId = "...",
    Retry = new RetryPolicyOptions
    {
        MaxRetries = 3,
        BaseDelay = TimeSpan.FromMilliseconds(100),
        MaxDelay = TimeSpan.FromSeconds(5),
        UseJitter = true
    }
});
```

## Performance

Esses números vêm dos nossos benchmarks internos. É melhor usá-los como orientação, não como promessa de que toda carga de trabalho vai se comportar exatamente da mesma forma.

| Operation | Throughput | Memory |
|-----------|------------|--------|
| PutItem (1KB) | 15,000/sec | ~2KB/op |
| GetItem | 25,000/sec | ~1KB/op |
| Query (100 items) | 800/sec | ~50KB/op |
| Batch (25 items) | 2,000/sec | ~20KB/op |

## O que vem aí

- **LINQ provider** - Consulte com `Where`, `Select`, `Take`
- **Change tracking** - Detecção automática de alterações
- **Interceptors** - Intercepte o pipeline de requisição
- **AOT support** - Compatibilidade total com Native AOT

## Primeiros passos

A [documentação do SDK](/guides/sdks/csharp/) tem tudo o que você precisa. Mas, sinceramente, basta instalar o pacote e começar a programar.
```bash
dotnet add package TerraScale.Client
```

Se você encontrar algum problema, fale comigo em mariogk@terrascale.tech. Se você ainda é novo no próprio TerraScale, combine a documentação do SDK com o [guia de primeiros passos](/guides/getting-started/).

Boa programação!
