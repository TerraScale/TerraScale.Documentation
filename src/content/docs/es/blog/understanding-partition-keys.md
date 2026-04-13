---
title: "Partition keys y sort keys: un modelo mental que de verdad tiene sentido"
date: 2024-04-18
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - data-modeling
  - deep-dive
excerpt: He explicado las partition keys a muchos desarrolladores. Aquí está la explicación que por fin hace clic para la mayoría.
cover:
  wide: /images/blog/understanding-partition-keys/cover-wide.svg
  square: /images/blog/understanding-partition-keys/cover-square.svg
  alt: Estantes y compartimentos ordenados con una ruta de recuperación destacada, visualizando la lógica de partition key y sort key.
---

He explicado las partition keys a muchos desarrolladores a lo largo de los años. Algunos lo entienden enseguida. La mayoría no, y no es culpa suya, la mayoría de las explicaciones son terribles.

Aquí está el modelo mental que por fin hace clic para la mayoría.

## Lo que aprenderás

- Qué hacen realmente las partition keys y las sort keys
- Cómo detectar un diseño de claves que te dará problemas más adelante
- Cuándo conviene usar indexes o denormalization en su lugar

Si quieres una referencia más corta junto a este post, deja abierta en otra pestaña la [referencia de modelos de datos](/reference/data-models/) y la [guía de buenas prácticas](/reference/best-practices/).

## Olvida las bases de datos por un segundo

Imagina que estás organizando una biblioteca. No una base de datos, una biblioteca real con libros físicos.

Tienes miles de libros y necesitas organizarlos para que la gente encuentre lo que quiere rápidamente. Aquí va un enfoque:

**Partition = Estantería**

Pones todos los libros del mismo autor en la misma estantería. Estantería "Stephen King", estantería "Agatha Christie", etc.

**Sort key = Posición en la estantería**

Dentro de cada estantería, los libros se ordenan por fecha de publicación. "Carrie" va antes que "The Shining" porque se publicó antes.

Ahora, cuando alguien pide "libros de Stephen King de los años 80", tú:

1. Vas directamente a la estantería de Stephen King (partition key)
2. Revisas solo la sección de los años 80 (rango de sort key)

No tienes que buscar en toda la biblioteca. Esa es la magia.

## Volvamos a las bases de datos

En TerraScale, una partition key determina *dónde* viven tus datos. Los ítems con la misma partition key se almacenan juntos, en los mismos servidores físicos.

Una sort key determina *cómo* se organizan los ítems dentro de esa partición. Los ítems se ordenan por sort key, así que las consultas por rango son rápidas.

Aquí tienes un ejemplo concreto:
```
Partition Key: "user#123"
├── Sort Key: "order#2024-001"  →  { total: 59.99, status: "shipped" }
├── Sort Key: "order#2024-002"  →  { total: 124.50, status: "pending" }
├── Sort Key: "order#2024-003"  →  { total: 89.00, status: "delivered" }
└── Sort Key: "profile"         →  { name: "Alice", email: "..." }
```

¿Quieres todos los pedidos de user#123? Una query, un viaje de red:
```csharp
var orders = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
});
```

Esto devuelve los tres pedidos. Es rápido porque TerraScale sabe exactamente a qué servidores preguntar, a los que almacenan la partición `user#123`.

Esa es la idea central. Las buenas claves reducen la cantidad de trabajo que la base de datos tiene que hacer en cada solicitud.

## El error más común

Aquí es donde la gente falla: hacen su partition key demasiado amplia o demasiado estrecha. Quieres un agrupamiento que encaje con la manera natural en que tu app lee y escribe datos.

**Demasiado amplia:**
```
Partition Key: "all_orders"
Sort Key: "order#12345"
```

Ahora todos los pedidos de tu sistema están en una sola partición. Un conjunto de servidores gestiona todo. Es un cuello de botella esperando a ocurrir.

**Demasiado estrecha:**
```
Partition Key: "order#12345"
Sort Key: null
```

Ahora cada pedido es su propia partición. ¿Quieres obtener todos los pedidos de un usuario? Tienes que consultar cada pedido individualmente. Eso es lento y caro.

**Justo bien:**
```
Partition Key: "user#123"
Sort Key: "order#2024-001"
```

Los pedidos se agrupan por usuario. Puedes obtener todos los pedidos de un usuario de forma eficiente, pero la carga queda distribuida entre muchas particiones.

Por qué importa: las partition keys no son solo una preocupación de consulta. También modelan cómo se reparte el tráfico por el sistema. Un diseño saludable de claves suele ayudar tanto al rendimiento como al costo.

## Una regla práctica

Tu partition key debe responder a la pregunta: "¿Qué suelo consultar junto?"

- ¿App social? Particiona por ID de usuario
- ¿E-commerce? Particiona por ID de cliente o de producto
- ¿IoT? Particiona por ID de dispositivo
- ¿SaaS multi-tenant? Particiona por ID del tenant

Tu sort key debe responder: "Dentro de ese grupo, ¿cómo quiero filtrar u ordenar?"

- ¿Datos de series temporales? Ordena por timestamp
- ¿Datos jerárquicos? Ordena por ruta
- ¿Ítems ordenados? Ordena por número de secuencia

## Cuándo este modelo deja de servir

Este modelo mental cubre la mayoría de los casos de uso. Pero a veces necesitas consultar a través de particiones.

Ejemplo: "Muéstrame todos los pedidos de más de $100 entre todos los usuarios".

Con el diseño de particionar por usuario, esta query es cara. Tendrías que hacer scan de los pedidos de cada usuario.

Soluciones:

1. **Secondary indexes** - Crea un índice con una partition key distinta, como el importe del pedido. La [referencia de operaciones de query](/reference/api/query-operations/) cubre la mecánica.
2. **Denormalization** - Guarda los datos en varios formatos para que tus lecturas habituales sigan siendo baratas.
3. **Acepta el costo** - A veces un full scan está bien si es poco frecuente.

Cubriremos estos patrones en una publicación futura. Por ahora, solo debes saber que el diseño de partition key tiene compensaciones, y eso está bien.

## Una cosa más

Siempre puedes cambiar tu modelo de datos más adelante. Sé que suena aterrador tratándose de una base de datos, pero TerraScale lo hace manejable:

1. Crea ítems con la nueva estructura de claves
2. Migra los datos existentes en batches
3. Actualiza tu aplicación para usar las nuevas claves
4. Elimina los ítems antiguos cuando estés listo

No es gratis, pero tampoco tiene por qué ser catastrófico. Así que no pienses demasiado tu diseño inicial. Empieza con algo razonable, mide cómo funciona e itera.

Así es como se construyen los sistemas reales.
