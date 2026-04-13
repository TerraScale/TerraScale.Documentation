---
title: Casos de uso para TerraScale
description: Casos de uso comunes y patrones recomendados para TerraScale.
---

## Casos de uso comunes

### Juegos en tiempo real

TerraScale funciona bien para cargas de juego que necesitan lecturas rápidas, escrituras frecuentes y disponibilidad global.

Los patrones comunes incluyen:

- leaderboards
- estado del jugador e inventario
- datos de sesión en vivo

Consulta [Building a Real-Time Gaming Leaderboard with TerraScale](/blog/building-realtime-leaderboard/).

### IoT y datos de sensores

Los sistemas de IoT suelen generar flujos constantes de escritura desde dispositivos repartidos por varias regiones. TerraScale es una buena opción para:

- lecturas de estilo serie temporal
- estado actual del dispositivo
- pipelines de ingestión con alto throughput de escritura

Esto funciona mejor cuando modelas los datos alrededor de identificadores de dispositivo, ventanas de tiempo u otros patrones de acceso previsibles.

### E-commerce

Las aplicaciones de e-commerce suelen necesitar acceso de baja latencia a datos orientados al usuario y almacenamiento duradero para registros que se actualizan con frecuencia.

Las cargas típicas incluyen:

- catálogos de productos
- carritos de compra
- sesiones de usuario

TerraScale puede ayudar a mantener esas lecturas rápidas para clientes en diferentes regiones mientras conserva un modelo operativo simple.

### Aplicaciones SaaS

TerraScale es una opción natural para productos SaaS multi-tenant que necesitan patrones de acceso previsibles y poca sobrecarga operativa.

Los ejemplos comunes incluyen:

- datos de aplicación con alcance por tenant
- preferencias de usuario
- feature flags y stores de configuración

Esto es especialmente útil cuando tus clientes están repartidos en múltiples geografías y esperan lecturas rápidas cerca de su ubicación.

### Logs de transacciones financieras

Las plataformas financieras y los sistemas internos de ledger suelen necesitar patrones de almacenamiento con mucha append y un historial de auditoría confiable.

TerraScale es una buena opción para:

- trazas de auditoría
- registros de event sourcing
- logs de actividad orientados a compliance

Estas cargas suelen beneficiarse de claves bien diseñadas, conjuntos pequeños de resultados y paginación explícita.

## Cuándo TerraScale encaja muy bien

TerraScale es especialmente atractiva cuando:

- tus usuarios están distribuidos globalmente
- la baja latencia de lectura importa para la experiencia del producto
- quieres un pricing basado en uso más simple
- estás migrando desde DynamoDB y quieres una ruta familiar

También funciona bien cuando tus patrones de acceso se conocen de antemano y tu aplicación se beneficia de lecturas multi-región.

## Cuándo considerar alternativas

Puede que quieras considerar otro sistema si tu carga depende de:

- consultas relacionales complejas y muchos joins
- agregaciones pesadas o pipelines analíticos
- almacenamiento muy grande de blobs o medios dentro de la propia base de datos

En esos casos, TerraScale aún puede encajar en parte de la arquitectura, pero no debería ser la única capa de persistencia por defecto.

## Primeros pasos

Si uno de estos patrones coincide con tu aplicación, empieza por la [Getting Started guide](/guides/getting-started/).

## Ver también

- [Best Practices](/reference/best-practices/)
- [Data Models](/reference/data-models/)
- [Comparisons](/reference/comparisons/)
- [Replication](/reference/replication/)

