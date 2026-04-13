---
title: Do zero ao banco de dados em 5 minutos
date: 2024-04-02
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - tutorial
  - getting-started
excerpt: Eu cronometrei. Do momento em que abri o navegador até executar minha primeira query levou 4 minutos e 37 segundos. Aqui está exatamente o que fiz, sem pular nada.
cover:
  wide: /images/blog/getting-started-5-minutes/cover-wide.svg
  square: /images/blog/getting-started-5-minutes/cover-square.svg
  alt: Uma sequência de passos limpos e iluminados levando a um portal pronto para uso, representando um caminho rápido de primeiros passos.
---

Eu cronometrei isso hoje de manhã. Do momento em que abri o navegador até executar minha primeira query contra o TerraScale levou 4 minutos e 37 segundos. Aqui estão os passos exatos, sem pular nada.

## O que você vai aprender

- Como criar seu primeiro banco de dados
- Como gerar uma API key e conectar com o SDK C#
- O que tentar em seguida quando sua primeira leitura e escrita funcionarem

Se você quiser a versão mais completa depois deste tour rápido, continue com o [guia de primeiros passos](/guides/getting-started/) e o [guia do SDK C#](/guides/sdks/csharp/).

## Minuto 0-1: cadastro

Fui para [dashboard.terrascale.io](https://dashboard.terrascale.io) e cliquei em "Get Started". Depois inseri meu email, criei uma senha e verifiquei meu email. O link chegou em cerca de 10 segundos.

Dica profissional: se você é impaciente como eu, use login com Google. Isso economiza cerca de 30 segundos.

## Minuto 1-2: crie um banco de dados

Depois de entrar, há um grande botão "Create Database". Difícil não ver.

Chamei o meu de `blog-demo` e escolhi `us-east-1` como região. O banco de dados ficou pronto em cerca de 8 segundos. Eu realmente atualizei a página achando que algo tinha travado, mas não, era só rápido assim.

## Minuto 2-3: gere uma API key

Cliquei em "API Keys" na barra lateral, depois em "Create API Key". Dei o nome `local-dev` e concedi acesso total ao banco de dados.

**Importante:** a chave só aparece uma vez. Eu a copiei para meu arquivo `.env` imediatamente. Se você esquecer, vai precisar criar outra. Para um app em produção, depois troque para escopos mais restritos seguindo a [referência de API keys](/reference/management/api-keys/).

## Minuto 3-4: instale o SDK e escreva código

Abri meu terminal e rodei:
```bash
dotnet add package TerraScale.Client
```

Depois escrevi o teste mais simples possível:
```csharp
using TerraScale;

var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY"),
    DatabaseId = "blog-demo"
});

// Write something
await client.PutItemAsync("user#123", "profile", new Dictionary<string, object>
{
    ["name"] = "Mario",
    ["email"] = "mariogk@terrascale.tech"
});

// Read it back
var result = await client.GetItemAsync("user#123", "profile");
Console.WriteLine(result.Value.GetAttribute<string>("name")); // Mario
```

## Minuto 4-5: execute
```bash
dotnet run
```

Saída: `Mario`

É isso. Sem connection strings para configurar, sem portas para lembrar, sem banco de dados local para subir. Só uma API key e um database ID.

## O que acabou de acontecer?

Por baixo dos panos, muita coisa aconteceu:

1. Minha requisição atingiu a rede de edge do TerraScale
2. Foi roteada para a região us-east-1 onde meu banco de dados vive
3. O item foi gravado em múltiplas availability zones para durabilidade
4. A resposta voltou em cerca de 12ms (eu conferi)

Mas eu não precisei pensar em nada disso. Eu só escrevi código.

Por que isso importa: uma configuração rápida muda o quanto você está disposto a experimentar. Se levar meio dia para fazer um banco de dados funcionar, você adia ideias. Se levar cinco minutos, você tenta.

## O que vem a seguir?

Se você quiser se aprofundar, aqui está o que eu sugeriria em seguida:

1. **Experimente o Query Explorer** no dashboard, você pode rodar consultas sem escrever código.
2. **Configure o padrão Repository** para entidades tipadas, é muito mais limpo do que dicionários brutos. O [guia de repository](/guides/repository/) mostra o padrão.
3. **Adicione uma segunda região** e veja seus dados replicarem automaticamente. A [referência de replication](/reference/replication/) explica o que muda.

O [guia de primeiros passos](/guides/getting-started/) entra em mais detalhes sobre cada um desses pontos. Mas, sinceramente, apenas comece a construir algo. Você vai descobrir o resto no caminho.

A melhor parte? Aquele banco de dados que criei está no plano gratuito. Não estou pagando nada até ultrapassar 100MB de armazenamento ou 10.000 requisições por mês. Para um projeto paralelo ou protótipo, isso é mais do que suficiente.

Boa construção!
