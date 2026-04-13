---
title: De cero a base de datos en 5 minutos
date: 2024-04-02
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - tutorial
  - getting-started
excerpt: Lo cronometré. Desde abrir el navegador hasta ejecutar mi primera query pasaron 4 minutos y 37 segundos. Esto es exactamente lo que hice, sin saltarme nada.
cover:
  wide: /images/blog/getting-started-5-minutes/cover-wide.svg
  square: /images/blog/getting-started-5-minutes/cover-square.svg
  alt: Una secuencia de pasos limpios e iluminados que conduce a un portal listo, representando una ruta rápida de inicio.
---

Lo cronometré esta mañana. Desde abrir el navegador hasta ejecutar mi primera query contra TerraScale tardé 4 minutos y 37 segundos. Estos son los pasos exactos, sin saltarme nada.

## Lo que aprenderás

- Cómo crear tu primera base de datos
- Cómo generar una API key y conectarte con el SDK de C#
- Qué probar después cuando tu primera lectura y escritura ya funcionen

Si quieres la versión completa después de este recorrido rápido, sigue con la [guía de inicio](/guides/getting-started/) y la [guía del SDK de C#](/guides/sdks/csharp/).

## Minuto 0-1: regístrate

Fui a [dashboard.terrascale.io](https://dashboard.terrascale.io) e hice clic en "Get Started". Luego ingresé mi correo, creé una contraseña y verifiqué mi email. El enlace llegó en unos 10 segundos.

Consejo: si eres impaciente como yo, usa inicio de sesión con Google. Te ahorra unos 30 segundos.

## Minuto 1-2: crea una base de datos

Después de iniciar sesión, hay un gran botón "Create Database". Difícil no verlo.

La llamé `blog-demo` y elegí `us-east-1` como región. La base de datos estuvo lista en unos 8 segundos. Incluso actualicé la página pensando que algo se había quedado atascado, pero no, era así de rápido.

## Minuto 2-3: genera una API key

Hice clic en "API Keys" en la barra lateral y luego en "Create API Key". La llamé `local-dev` y le di acceso completo a la base de datos.

**Importante:** la clave solo se muestra una vez. La copié a mi archivo `.env` inmediatamente. Si la olvidas, tendrás que crear una nueva. Para una app en producción, cambia después a scopes más limitados siguiendo la [referencia de API keys](/reference/management/api-keys/).

## Minuto 3-4: instala el SDK y escribe código

Abrí mi terminal y ejecuté:
```bash
dotnet add package TerraScale.Client
```

Luego escribí la prueba más simple posible:
```csharp
using TerraScale;

var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY"),
    DatabaseId = "blog-demo"
});

// Write something
await client.PutItemAsync("user#123", "profile", new Dictionary<string, object>
{
    ["name"] = "Mario",
    ["email"] = "mariogk@terrascale.tech"
});

// Read it back
var result = await client.GetItemAsync("user#123", "profile");
Console.WriteLine(result.Value.GetAttribute<string>("name")); // Mario
```

## Minuto 4-5: ejecútalo
```bash
dotnet run
```

Salida: `Mario`

Eso es todo. Sin connection strings que configurar, sin puertos que recordar, sin una base de datos local que levantar. Solo una API key y un database ID.

## ¿Qué acaba de pasar?

Por debajo, pasaron muchas cosas:

1. Mi solicitud llegó a la red edge de TerraScale
2. Se enroutó a la región us-east-1 donde vive mi base de datos
3. El ítem se escribió en varias availability zones para durabilidad
4. La respuesta volvió en unos 12ms (lo comprobé)

Pero no tuve que pensar en nada de eso. Solo escribí código.

Por qué importa: una configuración rápida cambia tu disposición a experimentar. Si poner en marcha una base de datos te lleva medio día, pospones ideas. Si te lleva cinco minutos, pruebas cosas.

## ¿Qué sigue?

Si quieres profundizar, esto es lo que yo sugeriría después:

1. **Prueba el Query Explorer** en el dashboard, puedes ejecutar consultas sin escribir código.
2. **Configura el patrón Repository** para entidades tipadas, es mucho más limpio que usar diccionarios sin procesar. La [guía de repository](/guides/repository/) muestra el patrón.
3. **Añade una segunda región** y mira cómo tus datos se replican automáticamente. La [referencia de replication](/reference/replication/) explica qué cambia.

La [guía de inicio](/guides/getting-started/) entra en más detalle sobre cada uno de estos puntos. Pero, honestamente, solo empieza a construir algo. Lo irás descubriendo sobre la marcha.

¿La mejor parte? Esa base de datos que creé está en el plan gratuito. No estoy pagando nada hasta superar 100MB de almacenamiento o 10.000 solicitudes al mes. Para un proyecto personal o un prototipo, es más que suficiente.

¡Feliz construcción!
