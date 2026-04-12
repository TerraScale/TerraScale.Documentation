---
title: Consultas
description: Como as consultas funcionam no TerraScale
sidebar:
  order: 9
---

## Consultando seus dados

O TerraScale oferece duas formas de consultar seus dados. Você pode usar **SSSQL** se preferir sintaxe no estilo SQL, ou **SMongo** se estiver mais confortável com padrões de consulta no estilo MongoDB. Esta página ajuda você a escolher a interface certa e aponta para a documentação de referência completa.

## SSSQL

SSSQL é a interface de consulta compatível com SQL do TerraScale. É uma boa opção se sua equipe já trabalha com sintaxe relacional de consulta, fluxos de relatórios ou filtragem e ordenação estruturadas.

```sql
SELECT id, email
FROM users
WHERE plan = 'pro'
ORDER BY created_at DESC
LIMIT 10;
```

Leia a [referência completa do SSSQL](/reference/sssql/).

## SMongo

SMongo é a interface de consulta compatível com MongoDB do TerraScale. É uma escolha natural se você já usa padrões de consulta orientados a documentos e quer uma API familiar para filtros e projeções.

```javascript
db.users.find(
  { plan: 'pro' },
  { id: 1, email: 1 }
).limit(10)
```

Leia a [referência completa do SMongo](/reference/smongo/).

## Qual interface devo usar?

- Use **SSSQL** se você prefere sintaxe SQL, raciocínio tabular e padrões de consulta parecidos com consultas tradicionais de banco de dados.
- Use **SMongo** se você já conhece a sintaxe de consulta do MongoDB e filtragem baseada em documentos.

As duas interfaces consultam o mesmo modelo de dados do TerraScale, então a melhor escolha normalmente depende do que parece mais natural para sua equipe.

## Dicas de performance

- Prefira consultas indexadas sempre que possível.
- Use paginação para grandes conjuntos de resultados.
- Evite scans completos em grandes coleções ou tabelas.

## Próximos passos

- Explore a [referência do SSSQL](/reference/sssql/).
- Explore a [referência do SMongo](/reference/smongo/).
- Revise os [rate limits](/reference/rate-limits/) antes de cargas de trabalho com alto volume.
