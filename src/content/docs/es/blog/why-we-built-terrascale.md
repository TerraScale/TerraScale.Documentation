---
title: Por qué construimos TerraScale (la versión honesta)
date: 2024-03-22
authors:
  - name: Mario GK
    title: Founder
tags:
  - behind-the-scenes
  - story
excerpt: Toda startup tiene una historia de origen. La nuestra empezó con una factura cloud de $47.000 y mucha frustración. Esta es la historia honesta detrás de por qué existe TerraScale.
cover:
  wide: /images/blog/why-we-built-terrascale/cover-wide.svg
  square: /images/blog/why-we-built-terrascale/cover-square.svg
  alt: Dos placas estructurales oscuras separadas y reunidas por una precisa costura eléctrica, evocando un rediseño doloroso de infraestructura.
---

Toda startup tiene una historia de origen. Normalmente es algo inspirador: un fundador ve un problema, tiene una visión y construye algo increíble. Nuestra historia es un poco menos glamorosa. Empezó con una factura cloud de $47.000.

Quería dejar esto por escrito porque las páginas de producto suelen suavizar las partes desordenadas. Este post no lo hace. Si estás evaluando TerraScale, creo que mereces la versión real.

## La factura que lo cambió todo

Allá por 2021, yo era tech lead en una startup fintech mediana. Estábamos creciendo rápido, lo cual era genial. También estábamos quemando dinero en infraestructura, lo cual era menos genial.

Un mes, nuestra factura de DynamoDB llegó a $47.000. Para ser claro, esto no fue porque DynamoDB sea caro. De hecho, es bastante razonable si sabes lo que haces. El problema era que nosotros no sabíamos lo que hacíamos.

Teníamos hot partitions que ni siquiera sabíamos que existían. Estábamos sobreaprovisionando capacidad porque nos daba miedo el throttling. Estábamos almacenando datos de forma ineficiente porque los patrones de acceso habían evolucionado y nadie había refactorizado el schema.

Pasé los tres meses siguientes convirtiéndome en experto en DynamoDB por pura necesidad. Leí cada post de blog, vi cada charla de re:Invent y probé cada patrón que pude encontrar. Al final, reduje nuestra factura un 60% y nuestra latencia p99 un 80%.

Pero aquí está la cuestión: no debería haber tenido que hacer eso. Debería haber estado construyendo funcionalidades, no optimizando internals de la base de datos.

## La revelación

Después de dejar ese trabajo, no podía dejar de pensar en el problema. DynamoDB es una tecnología genuinamente brillante. La latencia de milisegundos de un dígito, el escalado sin fricción, las garantías de durabilidad, es una ingeniería impresionante.

Pero también es complejo. Muy complejo. La curva de aprendizaje es dura. El modelo de precios es confuso. La historia de desarrollo local es dolorosa. Y si te equivocas con el modelado de datos, te espera mucho sufrimiento.

Empecé a hablar con otros desarrolladores y escuché la misma historia una y otra vez. Les encantaba la idea de una base de datos NoSQL rápida y escalable. Odiaban tener que operarla de verdad.

## Lo que decidimos construir

La idea inicial era simple: ¿y si DynamoDB fuera más fácil?

No simplificada, más fácil. La misma potencia, menos fricción. En la práctica, eso significaba:

**Múltiples interfaces de consulta.** Algunos desarrolladores aman SQL. Otros quieren una API compatible con DynamoDB para migrar fácilmente. Otros quieren una API REST limpia y moderna. ¿Por qué obligar a todos a un solo paradigma? Si esa pregunta te suena familiar, la [guía de estrategia de API](/guides/api-strategy/) merece una lectura.

**Precios transparentes.** Paga por almacenamiento y operaciones. Punto. Sin capacity units que entender, sin debate entre provisioned y on-demand, sin trucos. Puedes comparar el modelo en la [referencia de precios](/reference/pricing/).

**Desarrollo local de primera clase.** `docker run terrascale` y tienes una base de datos local que se comporta como producción. Sin emuladores raros, sin advertencias de "más o menos compatible".

**Valores por defecto inteligentes.** Sugerencias automáticas de indexación. Caché integrada. Rate limiting sensato. La base de datos debería ayudarte, no limitarse a ejecutar tus comandos a ciegas.

Por qué importa: no intentábamos construir una base de datos que solo admiraran los expertos. Queríamos una que un equipo pequeño pudiera adoptar rápido, operar con seguridad y seguir usando a medida que el producto creciera.

## Dos años después

Enviamos el primer prototipo en 2022. Era tosco. El query planner era ingenuo, el SDK tenía bugs y la documentación era básicamente "lee el código".

Pero funcionaba. Y poco a poco conseguimos que funcionara mejor.

Ahora manejamos miles de millones de operaciones al mes para clientes en más de 40 países. Tenemos un SDK real y vienen más. La documentación es documentación de verdad.

¿Es perfecto? No. Seguimos siendo un equipo pequeño y queda mucho por construir. Pero es sólido. Es algo en lo que confiaría mis propios datos de producción, y así lo hago.

## La parte honesta

Aquí va lo que nadie te dice sobre construir infraestructura: da miedo. Cuando tu código tiene un bug, los usuarios ven un error. Cuando una base de datos tiene un bug, los usuarios pueden perder datos.

Hemos cometido errores. Hemos tenido caídas. Hemos lanzado funciones que no estaban listas y hemos tenido que retirarlas. Eso forma parte de construir software.

Lo que no hemos hecho es perder datos de clientes. Esa es la línea que nunca vamos a cruzar. Todo lo demás se puede arreglar.

Si estás pensando en probar TerraScale, debes saber que no solo estás obteniendo una base de datos. Estás obteniendo un equipo obsesionado con hacer esto bien. Cada ticket de soporte, cada bug report, cada comentario, lo tomamos en serio.

Si quieres ver el producto en sí en lugar de solo la historia, empieza con la [guía de inicio](/guides/getting-started/) o revisa la [referencia de buenas prácticas](/reference/best-practices/).

Construimos TerraScale porque queríamos una base de datos mejor. Apostamos a que tú también.
