---
title: Validação
description: A filosofia de validação da TerraScale, padrões recomendados e quando restrições de banco ainda ajudam.
---

A TerraScale mantém as responsabilidades de validação leves na camada de banco de dados. Na maioria dos casos, recomendamos validar os dados na sua aplicação, API ou código de domínio compartilhado antes de gravar os documentos.

## Nossa abordagem para validação

A TerraScale é intencionalmente opinativa aqui: o banco deve focar em armazenar e recuperar dados com eficiência, enquanto o código da aplicação deve aplicar regras de negócio e expectativas de schema.

Isso não significa que validação não seja importante. Significa que o lugar mais confiável para a maior parte da validação costuma ser a parte do seu sistema que já conhece o contexto da requisição, permissões do usuário, regras do produto e definições de tipos.

## Por que validação no nível da aplicação

A validação no nível da aplicação geralmente tem melhor acesso às informações necessárias para tomar boas decisões.

Por exemplo, sua aplicação muitas vezes consegue responder perguntas como:

- Este campo é obrigatório para este tipo de usuário?
- Este valor é permitido para este plano?
- Esta atualização depende do estado atual do fluxo?
- Esta gravação deve ser rejeitada, normalizada ou receber um valor padrão?

Essas regras muitas vezes são difíceis de expressar com clareza em um sistema geral de restrições de banco de dados.

## Padrões recomendados

### Validação de entrada

Valide payloads de requisição na borda do seu sistema, antes que cheguem ao código de persistência.

```ts
function validateCreateUser(input: unknown): asserts input is {
  email: string;
  name: string;
} {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid payload");
  }

  const value = input as Record<string, unknown>;

  if (typeof value.email !== "string" || typeof value.name !== "string") {
    throw new Error("Invalid user fields");
  }
}
```

### Aplicação de schema no código

Use construtores, parsers ou bibliotecas de validação na camada da aplicação para normalizar as gravações antes de armazená-las.

```ts
type User = {
  id: string;
  email: string;
  name: string;
};

function toUser(input: { id: string; email: string; name: string }): User {
  return {
    id: input.id,
    email: input.email.trim().toLowerCase(),
    name: input.name.trim()
  };
}
```

### Modelos type-safe

Mantenha tipados seus modelos de escrita, leitura e lógica de migração. Segurança de tipos não substitui validação em tempo de execução, mas reduz desvios acidentais entre o código da aplicação e os documentos armazenados.

## Quando restrições de banco ajudam

Ainda existem casos em que restrições ou guardrails no nível do banco podem ser úteis.

Elas podem ajudar quando você precisa de:

- identificadores ou chaves únicos
- garantias estruturais simples
- proteção contra gravações obviamente inválidas vindas de múltiplos serviços
- um último bloqueio para caminhos de dados de alto risco

O tradeoff é que restrições de banco podem tornar a evolução de schema e mudanças entre múltiplos serviços mais difíceis se forem rígidas demais. Para muitas equipes, um modelo equilibrado funciona melhor: validação forte no código, mais restrições direcionadas no banco onde elas realmente reduzem risco.

## Boas práticas

### Valide cedo

Rejeite entradas inválidas antes que cheguem à sua camada de persistência.

### Normalize de forma consistente

Remova espaços, normalize capitalização e defina padrões em um único lugar compartilhado.

### Mantenha a validação perto do domínio

Regras de negócio devem ficar perto do código que as entende, não espalhadas entre serviços sem relação.

### Reutilize validação em migrações e jobs em background

Não suponha que só requisições de API precisam de validação. Importações, jobs de reparo e migrações devem seguir as mesmas regras.

### Adicione restrições de banco seletivamente

Use-as onde elas oferecem proteção clara, não como substituto para design de aplicação.

## Relacionado

- [Data Migrations](/reference/migrations/)
- [Data Models](/reference/data-models/)
- [Best Practices](/reference/best-practices/)
- [API](/reference/api/)

