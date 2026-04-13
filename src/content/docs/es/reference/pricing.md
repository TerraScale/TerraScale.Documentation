---
title: Pricing
description: Cómo TerraScale cuenta operaciones, replicación, consultas y storage para la facturación.
---

El pricing de TerraScale se basa en un uso simple y fácil de entender. Intentamos mantener el modelo de facturación cerca del trabajo que la base de datos realmente está haciendo, evitando unidades de cobro difíciles de explicar.

Las APIs de billing y uso exponen métricas orientadas al cliente, como solicitudes y storage. Los ejemplos de esta página explican la cantidad relativa de trabajo de base de datos detrás de esas métricas, especialmente en cargas replicadas globalmente.

## Operaciones de base de datos

En TerraScale, las escrituras son más caras de procesar para el sistema que las lecturas, porque deben replicarse y coordinarse entre regiones. Aun así, TerraScale mantiene el reporte de uso orientado al cliente más simple que el modelo interno de trabajo, para que los planes sean más fáciles de entender.

Eso significa que puedes razonar sobre el uso sin aprender un lenguaje de facturación propio, y aun así entender que algunas operaciones exigen más de la plataforma que otras.

## Costos de replicación global

La replicación global es una de las funciones centrales de TerraScale. La replicación afecta al pricing porque una escritura debe aplicarse en cada región configurada.

### Cómo se cuentan las escrituras

Si tu base de datos replica en 10 regiones, una sola escritura puede verse como trabajo realizado 10 veces, una por región.

Por ejemplo:

- 1 escritura de documento en 10 regiones: aproximadamente 10 operaciones de escritura de trabajo
- 1 actualización de documento en 10 regiones: aproximadamente 10 operaciones de escritura de trabajo

### Cómo se cuentan las lecturas

Las lecturas son distintas. Una lectura normalmente se sirve desde la región más cercana, así que una sola lectura de documento suele contar como una operación de trabajo.

Por eso las cargas globales con muchas escrituras cuestan más de operar que las cargas con muchas lecturas.

## Costos de consulta

Las consultas son más difíciles de predecir que las lecturas y escrituras simples, porque el costo y la latencia dependen de si TerraScale puede usar un índice con eficiencia.

Para los clientes, la orientación clave es que las consultas indexadas son más baratas para la plataforma y normalmente más rápidas en la práctica que las consultas con mucho scan.

### Consultas indexadas

Las consultas que usan operadores favorables para índices, como igualdad y comparaciones por rango, suelen ser rápidas y escalar bien.

Ejemplos de operadores amigables con índices:

- `$eq`
- `$gt`
- `$gte`
- `$lt`
- `$lte`

### Consultas con mucho scan

Las consultas que no pueden usar un índice con eficiencia, como búsquedas amplias con regex, pueden requerir que la base de datos inspeccione muchos documentos antes de devolver un resultado. Estas consultas son más lentas y cargan más el sistema.

### Ejemplo de consulta

Esta consulta a menudo puede usar un índice con eficiencia:

```json
{
  "_id": {
    "$gt": 1
  }
}
```

En cambio, una condición que fuerza un scan amplio o una evaluación por documento puede costar más en latencia y trabajo del sistema, incluso cuando devuelve un conjunto pequeño de resultados.

## Storage

El pricing de storage refleja que TerraScale mantiene varias copias de tus datos en cada región para disponibilidad y seguridad operativa.

Para cada región, TerraScale mantiene copias redundantes para que las actualizaciones y el mantenimiento puedan desplegarse sin dejar la base de datos fuera de línea. Esa redundancia forma parte del servicio por el que estás pagando, y es una de las razones por las que el storage no se cobra igual que un único disco en un único servidor.

## Optimizar costos

Normalmente puedes bajar el costo y mejorar el rendimiento con algunos hábitos sencillos.

### Prefiere filtros indexados

Usa filtros basados en campos indexados siempre que sea posible. Las consultas por igualdad y rango suelen ser mucho más eficientes que regex o condiciones negativas amplias.

### Mantén pequeños los conjuntos de resultados

Evita obtener más datos de los necesarios. TerraScale limita las respuestas de consulta a 100 elementos por solicitud, y la paginación es muy recomendable.

### Sé deliberado con la replicación

Replica en las regiones que tu aplicación realmente necesita. Más regiones mejoran la cobertura geográfica, pero también multiplican el trabajo de escritura.

### Revisa patrones de consulta costosos

Si una consulta debe escanear grandes partes de una colección, considera:

- añadir o ajustar índices
- cambiar el patrón de acceso
- precalcular vistas comunes
- reducir el filtro antes de aplicar operadores costosos

## Relacionado

- [Compensation Policy](/reference/compesation/)
- [Plans](/reference/plans/)
- [Replication](/reference/replication/)
- [Best Practices](/reference/best-practices/)

