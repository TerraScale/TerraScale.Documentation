---
title: Presentamos TerraScale, una mejor forma de pensar NoSQL
date: 2024-03-15
authors:
  - name: Mario GK
    title: Founder
tags:
  - announcement
  - launch
excerpt: Después de dos años de desarrollo, nos entusiasma presentar TerraScale, una base de datos NoSQL distribuida globalmente que combina la potencia al estilo DynamoDB con una experiencia de desarrollo más simple.
cover:
  wide: /images/blog/introducing-terrascale/cover-wide.svg
  square: /images/blog/introducing-terrascale/cover-square.svg
  alt: Líneas de horizonte iluminadas y una baliza ascendente que sugieren una nueva plataforma global de datos emergiendo de la oscuridad.
---

Después de dos años de trasnoches, incontables refactors y demasiado café, por fin me entusiasma compartir lo que hemos estado construyendo: TerraScale.

Si eres nuevo por aquí, TerraScale está pensado para equipos que quieren escala global sin convertir las operaciones de base de datos en un trabajo de tiempo completo. Esta publicación te da la visión general. Si prefieres ir directo al producto, empieza con la [guía de inicio](/guides/getting-started/).

## El problema que queríamos resolver

He pasado buena parte de la última década trabajando con bases de datos distribuidas. DynamoDB, Cassandra, MongoDB, la que sea, probablemente me ha tocado depurar un incidente de producción con ella a las 3 de la mañana.

Y esto es lo que siempre me molestó: estas bases de datos son increíblemente potentes, pero te hacen pagar un impuesto de complejidad. ¿Quieres consultar tus datos? Aprende un lenguaje de consulta personalizado. ¿Necesitas montar todo en local? Suerte con ese archivo Docker Compose. ¿Quieres precios predecibles? Mejor prepara la calculadora.

Pensamos que tenía que existir una mejor manera.

## Qué es realmente TerraScale

TerraScale es una base de datos NoSQL totalmente gestionada y distribuida globalmente. Si eso suena demasiado técnico, aquí va una versión más simple: es un lugar para guardar tus datos que es rápido en todo el mundo, resiliente por defecto y no requiere un doctorado para operarlo.

Hay varias cosas que la hacen distinta:

**Tres formas de hablar con tus datos.** Usa nuestra API nativa si quieres el máximo rendimiento. Usa la API compatible con DynamoDB si estás migrando una app existente. O usa SQL si solo quieres algo familiar. Los mismos datos, la interfaz que prefieras. Si estás comparando enfoques, la [guía de estrategia de API](/guides/api-strategy/) es una buena siguiente parada.

**Precios realmente simples.** Pagas por lo que almacenas y por lo que lees y escribes. Eso es todo. Sin planificación de capacidad, sin instancias reservadas, sin facturas sorpresa porque olvidaste configurar una política de auto-scaling. Para los detalles, consulta la [referencia de precios](/reference/pricing/).

**Funciona en cualquier parte.** 19 regiones alrededor del mundo. Tus datos permanecen cerca de tus usuarios, estén donde estén. Cuando estés listo para crecer más allá de una sola región, la [referencia de replication](/reference/replication/) explica cómo funciona.

Por qué importa: la mayoría de los equipos no sufren porque su base de datos carezca de funciones. Sufren porque cada función útil añade más carga operativa. Construimos TerraScale para reducir esa carga sin quitar potencia.

## ¿Para quién es esto?

Honestamente, es para cualquiera que esté cansado de pelearse con su base de datos.

Hemos llevado una Public Alpha durante los últimos seis meses con unas 50 empresas. Los casos de uso han sido muy variados: leaderboards de gaming en tiempo real, datos de sensores IoT, catálogos de productos de e-commerce, logs de transacciones financieras.

El hilo común es simple. Estos equipos querían algo que simplemente funcionara. No querían convertirse en expertos en bases de datos. Querían enviar su producto real.

## Lo que viene

Hoy marca nuestro lanzamiento público. Puedes registrarte en [dashboard.terrascale.io](https://dashboard.terrascale.io) y empezar a construir de inmediato. El plan gratuito te da suficiente espacio para construir algo real, no solo un juguete.

En los próximos meses lanzaremos más SDKs, más regiones y algunas funciones que me entusiasman de verdad, pero de las que todavía no puedo hablar. Si quieres un adelanto de hacia dónde van las cosas, sigue el [roadmap de Public Alpha](/roadmap/).

Si pruebas TerraScale y te encanta, cuéntaselo a tus amigos. Si lo pruebas y algo no funciona bien, cuéntanoslo. Somos un equipo pequeño y leemos cada comentario.

Brindemos por construir algo grande juntos.

- Mario
