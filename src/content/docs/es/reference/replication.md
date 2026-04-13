---
title: Replicación
description: Información sobre las estrategias de replicación de datos de TerraScale.
---

## Qué es la replicación

La replicación es el proceso de copiar tus datos entre varias regiones para que se mantengan cerca de los usuarios y sigan disponibles cuando una región tenga problemas.

En TerraScale, la replicación es una parte central del producto. Tú eliges las regiones que importan para tu aplicación, y TerraScale mantiene los datos fluyendo entre ellas.

## Cómo funciona la replicación de TerraScale

Cuando tu aplicación escribe datos, TerraScale acepta la escritura en la región primaria y luego replica ese cambio a las demás regiones configuradas para la base de datos.

Para lecturas, TerraScale dirige las solicitudes a la región disponible más cercana siempre que sea posible. Esto ayuda a mantener baja la latencia para usuarios distribuidos globalmente.

## Comportamiento de lectura

Las lecturas se sirven desde la región disponible más cercana por defecto. Eso significa que los usuarios en distintas partes del mundo a menudo pueden leer desde una réplica cercana en lugar de cruzar un océano en cada solicitud.

Desde la perspectiva de uso, una lectura cuenta como una sola operación sin importar cuántas regiones réplica tenga configurada tu base de datos.

## Comportamiento de escritura

Las escrituras se aplican en la región primaria y luego se propagan a cada región réplica configurada.

Como el sistema debe procesar la escritura en cada región configurada, el costo de escritura escala con el número de regiones. Como regla simple, una escritura se cuenta como una operación por región.

## Modelo de consistencia

TerraScale ofrece consistencia fuerte dentro de una región y consistencia eventual entre regiones.

Eso significa que una escritura es inmediatamente durable en la región que la aceptó, mientras que otras regiones pueden observar ese cambio poco después de que la replicación termine.

Para la mayoría de las aplicaciones distribuidas globalmente, esto ofrece un buen equilibrio entre baja latencia de lectura y un comportamiento de replicación práctico.

## Configurar la replicación

Puedes elegir regiones al crear una base de datos y luego añadir o quitar regiones a medida que cambie tu patrón de tráfico.

Las razones comunes para añadir regiones incluyen:

- reducir la latencia de lectura para una nueva geografía
- mejorar la resiliencia regional
- cumplir requisitos de residencia de datos

Si acabas de empezar, comienza con las regiones más cercanas a tus usuarios hoy y expande con intención.

## Comportamiento de failover

Si una región deja de estar disponible, TerraScale puede seguir sirviendo lecturas desde otras regiones disponibles.

Este comportamiento automático de failover ayuda a reducir el downtime en aplicaciones distribuidas. Tus usuarios pueden ver una latencia más alta durante una interrupción regional, pero las lecturas pueden continuar desde réplicas sanas cuando los datos estén disponibles allí.

## Consideraciones de rendimiento

La replicación mejora la latencia global de lectura, pero también cambia la ruta de escritura y el perfil de costos.

- Más regiones suelen significar menor latencia de lectura para una audiencia más amplia
- Más regiones también significan más trabajo de replicación por cada escritura
- Las cargas con muchas escrituras deben elegir con cuidado qué regiones habilitar

Para detalles de pricing, consulta [Pricing](/reference/pricing/).

## Ver también

- [Pricing](/reference/pricing/)
- [Getting Started](/guides/getting-started/)
- [Regions](/reference/regions/)
- [Going Global: Setting Up Multi-Region Replication](/blog/multi-region-setup/)

