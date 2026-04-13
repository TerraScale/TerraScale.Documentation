---
title: Migrações de dados
description: Abordagens recomendadas para evoluir schemas de documentos e migrar dados com segurança na TerraScale.
---

A TerraScale não depende de um sistema de migração gerenciado pelo banco no estilo de ferramentas SQL tradicionais. Em vez disso, recomendamos padrões de migração guiados pela aplicação, que permitem evoluir a estrutura dos documentos com segurança e de forma incremental.

## Abordagem atual de migração

Hoje, o modelo de migração mais seguro na TerraScale é lidar com mudanças de schema no código da aplicação.

Isso normalmente significa uma destas opções:

- ler documentos antigos e reescrevê-los no novo formato quando forem acessados
- executar um processo em background que reescreve registros existentes em lotes
- gravar temporariamente os campos antigos e novos enquanto as aplicações fazem a transição

Essa abordagem mantém as migrações explícitas e testáveis. Ela também evita mudanças de schema ocultas, que são difíceis de depurar quando as expectativas da aplicação e dos dados se afastam.

## Padrões recomendados

### Migração preguiçosa na leitura

Quando um documento antigo for carregado, detecte o formato antigo, transforme-o e salve novamente no novo formato.

```ts
type UserV1 = {
  id: string;
  fullName: string;
};

type UserV2 = {
  id: string;
  profile: {
    fullName: string;
  };
  schemaVersion: 2;
};

function migrateUser(doc: UserV1 | UserV2): UserV2 {
  if ("schemaVersion" in doc && doc.schemaVersion === 2) {
    return doc;
  }

  return {
    id: doc.id,
    profile: {
      fullName: doc.fullName
    },
    schemaVersion: 2
  };
}
```

Use esse padrão quando:

- dados antigos são acessados com regularidade
- regravações completas imediatas não são necessárias
- você quer distribuir o custo da migração pelo tráfego normal

### Reescritor em background

Execute um job separado que varre registros em lotes, transforma, valida o resultado e grava novamente.

```ts
for (const user of usersBatch) {
  const migrated = migrateUser(user);

  await db.users.update(user.id, migrated);
}
```

Use esse padrão quando:

- você precisa atualizar todo o conjunto de dados dentro de uma janela definida
- sistemas downstream esperam uma única versão de schema
- você quer progresso e métricas de migração separados do tráfego de requisição

### Escrita dupla

Durante um período de transição, grave as representações antiga e nova para que versões antigas e novas da aplicação possam coexistir.

```ts
await db.orders.insert({
  id: order.id,
  customerName: order.customerName,
  customer: {
    name: order.customerName
  },
  schemaVersion: 2
});
```

Use esse padrão quando:

- você está liberando múltiplas versões da aplicação gradualmente
- workers, APIs e clientes não mudarão ao mesmo tempo
- compatibilidade retroativa importa durante o deploy

## Checklist de segurança

Antes de executar uma migração, verifique o seguinte:

- **Backups**: confirme que você consegue restaurar o conjunto de dados afetado.
- **Idempotência**: a migração deve ser segura para rodar mais de uma vez.
- **Validação**: confirme que os documentos migrados correspondem ao novo formato.
- **Rollback**: defina como você vai se recuperar se a migração introduzir dados inválidos.
- **Observabilidade**: acompanhe contagens, falhas, retries e progresso de conclusão.
- **Tamanho do lote**: comece pequeno para reduzir risco e observar o impacto no sistema.

## Boas práticas

### Versione seus documentos

Adicione um campo `schemaVersion` quando a estrutura de um documento mudar de forma relevante. Isso facilita detectar dados antigos e aplicar a lógica correta de migração.

### Mantenha a lógica de migração no código

Trate migrações como código normal de aplicação. Revise, teste e mantenha-as junto dos modelos que elas afetam.

### Prefira mudanças aditivas primeiro

Adicionar novos campos costuma ser mais seguro do que renomear ou remover campos imediatamente. Quando todos os leitores entenderem o novo formato, você pode remover a estrutura antiga em uma etapa posterior.

### Valide antes e depois de gravar

Valide o formato de origem o suficiente para migrar com segurança, depois valide o resultado migrado antes de salvar.

### Teste com amostras reais

Execute migrações em dados representativos com formato de produção no staging antes de tocar nos registros reais.

## Relacionado

- [Validation](/reference/validation/)
- [Data Models](/reference/data-models/)
- [Best Practices](/reference/best-practices/)
- [SMongo](/reference/smongo/)

