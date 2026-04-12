---
title: Hoja de Ruta de la Alfa Pública
description: Mejoras planificadas para TerraScale durante la Alfa Pública, incluida la automatización del rendimiento y límites más altos por base de datos.
draft: true
sidebar:
  order: 3
---

Esta página cubre las principales mejoras planificadas durante la Alfa Pública. El enfoque es directo: hacer que TerraScale sea más rápida de adoptar, más fácil de ajustar y más capaz bajo cargas de trabajo reales.

Para ver la visión completa del producto, consulta la [Hoja de Ruta Pública](/roadmap/). Para la etapa de lanzamiento actual, consulta [Alfa Pública](/roadmap/public-alpha/).

## Resumen

La Alfa Pública ya se puede usar, pero aún quedan varias mejoras importantes por delante. La hoja de ruta en esta etapa se centra en la automatización del rendimiento, un mejor comportamiento de la caché y más espacio para crecer antes de que los equipos tengan que pensar en los límites de tamaño de la base de datos.

## Funciones Planificadas

### Indexación Automática

TerraScale planea crear índices automáticamente para los campos que se consultan con frecuencia. El objetivo es reducir el ajuste manual y ayudar a las cargas de trabajo a alcanzar un buen rendimiento antes, especialmente para los equipos que todavía están aprendiendo sus patrones de consulta.

### Caché Automática con Invalidación

La caché automática de resultados de consultas está planificada para mejorar el rendimiento de lectura sin exigir que los equipos gestionen manualmente cada decisión de caché. La invalidación de la caché forma parte del diseño para mantener los resultados almacenados alineados con los cambios en los datos subyacentes.

### Aumento del Límite de Almacenamiento

El límite actual de la Alfa Pública es de 100 GB por base de datos. La hoja de ruta incluye aumentar ese límite a 500 GB por base de datos para que las cargas de trabajo iniciales más grandes puedan seguir en la plataforma sin chocar tan rápido con la barrera actual.

### Controles Manuales de Caché

Junto con la caché automática, TerraScale planea añadir controles manuales de caché para los equipos que quieran un control más estricto sobre el comportamiento. Eso incluye expulsión LRU y gestión explícita de la caché para cargas de trabajo que necesitan ajustes predecibles.

## Notas sobre el Cronograma

Esta hoja de ruta se prioriza según el feedback de los usuarios y los patrones reales de uso. Todavía no hay fechas públicas fijas, y el orden puede cambiar a medida que el equipo aprende más de cargas de trabajo similares a producción durante la Alfa Pública.

## Solicita una Función

¿Quieres influir en la hoja de ruta? Únete a la [comunidad de Discord](https://discord.gg/8Zr2Nw9g) y comparte qué necesita tu carga de trabajo a continuación.

Para solicitudes directas o preguntas de seguimiento, escribe a [support@terrascale.com](mailto:support@terrascale.com).
