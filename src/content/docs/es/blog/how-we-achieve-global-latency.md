---
title: Cómo TerraScale logra una latencia inferior a 10ms en 19 regiones
date: 2024-06-15
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - architecture
  - deep-dive
  - performance
excerpt: Una mirada honesta a la arquitectura de TerraScale, lo que funciona, lo que es difícil y cómo logramos baja latencia a nivel global.
cover:
  wide: /images/blog/how-we-achieve-global-latency/cover-wide.svg
  square: /images/blog/how-we-achieve-global-latency/cover-square.svg
  alt: Un globo abstracto y disperso con algunas rutas brillantes de baja latencia conectando regiones distantes.
---

"¿Cómo puede TerraScale ser rápido en todas partes?"

Me hacen mucho esa pregunta. La respuesta honesta es simple: no es magia, pero sí es deliberado. Cada decisión de arquitectura que hemos tomado optimiza la latencia. Así es como funciona.

## Lo que aprenderás

- Cómo se mueven las solicitudes por TerraScale, desde el edge hasta el storage
- Por qué las decisiones de replication y consistency afectan tanto la latencia
- Qué pequeñas decisiones de ingeniería suman las mayores ganancias

Si quieres combinar esto con la documentación del producto, la [referencia de replication](/reference/replication/), la [referencia de regiones](/reference/regions/) y la [visión general de la API](/reference/api/) son buenos acompañamientos.

## La arquitectura básica

TerraScale funciona en 19 regiones globales. Cada región tiene:

- **Nodos edge** - Manejan la terminación TLS y el enrutamiento de solicitudes
- **Coordinadores de query** - Analizan queries y planifican la ejecución
- **Nodos de storage** - Realmente almacenan y recuperan los datos
- **Capa de replication** - Sincroniza datos entre regiones

Cuando creas una base de datos, eliges una región primaria. Ahí es donde viven tus datos de forma autoritativa. Pero aquí está el punto clave: las lecturas pueden servirse desde cualquier región donde hayas habilitado replication.

## Por qué importan los nodos edge

Cada solicitud a TerraScale llega primero a un nodo edge. Tenemos nodos edge en más de 40 ciudades, incluyendo lugares que no son regiones completas.

El nodo edge se encarga de:

1. **Terminación TLS** - El costoso handshake criptográfico sucede cerca del usuario
2. **Validación de solicitudes** - Las solicitudes mal formadas se rechazan inmediatamente
3. **Rate limiting** - El tráfico abusivo se bloquea en el edge
4. **Enrutamiento** - Determina qué región debe manejar la solicitud

Esto suele añadir entre 1 y 3ms a una solicitud, pero ahorra mucho más. Un handshake TLS hacia un servidor lejano puede tardar 100ms o más. Hacerlo en el edge acelera todo lo demás.

## La ruta de la query

Sigamos una solicitud simple de lectura:
```
User in Tokyo → Edge (Tokyo) → Coordinator (ap-northeast-1) → Storage → Response
```

Total: ~8ms

Ahora sigamos una escritura:
```
User in Tokyo → Edge (Tokyo) → Coordinator (ap-northeast-1) → Storage (write locally)
                                                            → Async replication to other regions
```

Total: ~12ms para la escritura, más replication en segundo plano

La idea clave es que nunca hacemos esperar al usuario por operaciones entre regiones. Las escrituras se confirman en cuanto son durables en la región primaria. La replication ocurre de forma asíncrona.

## Compensaciones de consistency

Esta replication asíncrona significa que TerraScale ofrece eventual consistency para lecturas entre regiones. Si escribes en Tokyo y lees inmediatamente en Frankfurt, podrías obtener datos desactualizados.

Para la mayoría de las aplicaciones, esto está bien. Perfiles de usuario, catálogos de productos, datos de sesión, unos cientos de milisegundos de desfase no importan.

Pero a veces necesitas strong consistency:
```csharp
var result = await client.GetItemAsync("user#123", "profile", new ReadOptions
{
    ConsistentRead = true
});
```

Con `ConsistentRead = true`, enroutamos la lectura a la región primaria, incluso si hay una réplica más cercana. Pagas el costo de latencia, pero obtienes los datos más frescos.

Por qué importa: la baja latencia nunca es gratis. Cada vez que endureces consistency o aumentas la coordinación, normalmente devuelves algo de latencia. Los buenos sistemas te dejan elegir esa compensación en lugar de imponer una sola respuesta para cada solicitud.

## Qué hace rápido al storage

Nuestra capa de storage es donde ocurre la mayoría de las ganancias reales:

### SSDs en todas partes

Todos los datos viven en SSDs NVMe. La latencia de lectura aleatoria de una unidad NVMe es de unos 0,1ms. En un disco giratorio, es de 5 a 10ms. Esa diferencia se acumula.

### Localidad de datos

Los ítems con la misma partition key se guardan juntos en disco. Cuando consultas "todos los pedidos de user#123", hacemos lecturas secuenciales, no búsquedas aleatorias.

### Índices en memoria

Cada nodo de storage mantiene un índice en memoria de partition key → ubicación en disco. Encontrar dónde viven los datos es una búsqueda en tabla hash (~0,001ms), no una operación de disco.

### Connection pooling

Mantenemos conexiones persistentes entre todos los componentes. Sin handshakes TCP en el hot path. Esto ahorra unos 2ms por solicitud.

## Los números

Esto es lo que medimos en producción en todas las regiones:

| Percentile | Read Latency | Write Latency |
|------------|--------------|---------------|
| p50 | 4ms | 7ms |
| p90 | 8ms | 15ms |
| p99 | 18ms | 35ms |
| p99.9 | 45ms | 80ms |

Estas métricas se miden desde el edge, así que incluyen el tiempo de red desde el usuario hasta nuestro nodo edge.

## Resumen

No hay un solo truco para lograr baja latencia. Es el efecto compuesto de docenas de decisiones:

- Nodos edge cerca de los usuarios
- Replication asíncrona para que las escrituras no se bloqueen por consenso
- Storage NVMe con localidad de datos
- Índices en memoria
- Connection pooling
- Protocolo de replication eficiente

Cada una ahorra algunos milisegundos. Juntas, se convierten en una base de datos rápida en los lugares donde tus usuarios realmente lo notan.
