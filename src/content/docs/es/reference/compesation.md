---
title: Política de compensación
description: Reglas de facturación para uso acumulado, tolerancia de excedente y límites mensuales de operaciones.
---

Esta política explica cómo TerraScale maneja las operaciones no usadas, los reinicios mensuales y los pequeños excesos. El objetivo es simple: darte una facturación predecible sin cortar cargas de trabajo sanas.

> Nota: esta página mantiene la URL heredada `/reference/compesation/` por compatibilidad con enlaces existentes.

## Qué es el rollover de uso

Si tu plan incluye una asignación mensual de operaciones y no la usas por completo, la parte no utilizada pasa al mes siguiente.

El rollover te da más flexibilidad para patrones de tráfico irregulares. Está pensado para variaciones normales de un mes a otro, no como sustituto permanente de subir a un plan mayor.

## Cómo funciona el rollover

TerraScale aplica primero las operaciones incluidas del mes actual. Después de eso, se usa cualquier operación no utilizada que haya llegado del mes anterior.

El rollover es válido solo por un ciclo de facturación adicional.

### Reglas del rollover

- Las operaciones incluidas no usadas pasan al mes siguiente.
- El uso del mes actual se consume antes que el uso acumulado.
- Cualquier cantidad acumulada expira al final del mes siguiente si no se usa.
- El rollover no se acumula indefinidamente durante varios meses.

## Política de sobreuso

TerraScale no bloquea las solicitudes de forma estricta por defecto cuando superas las operaciones mensuales incluidas.

En su lugar, aplicamos esta política:

- Te avisamos cuando el uso supera la asignación mensual de tu plan.
- El uso de hasta un 20% por encima de tu asignación mensual se tolera sin cargo por excedente.
- Si el uso supera esa tolerancia del 20% dentro de un mismo mes de facturación, el exceso puede cobrarse por separado.
- Si detectamos excedentes repetidos que indiquen que tu carga ya no encaja en el plan, podemos pedirte que actualices.
- Si la configuración de tu cuenta lo permite, puedes desactivar los excedentes y hacer que las solicitudes extra se bloqueen.

## Ejemplos

### Ejemplo 1: uso completo del mes actual, uso parcial del rollover

Supongamos que un plan incluye 10 millones de operaciones por mes.

| Month | Included operations | Rolled in from previous month | Total available | Operations used | Rollover to next month |
| --- | ---: | ---: | ---: | ---: | ---: |
| January | 10 million | 0 | 10 million | 1 million | 9 million |
| February | 10 million | 9 million | 19 million | 12 million | 0 |
| March | 10 million | 0 | 10 million | Depends on March usage | Depends on March usage |

En este escenario, los 9 millones de operaciones no usadas de enero pasan a febrero. Febrero usa primero sus propios 10 millones incluidos y luego 2 millones del rollover. Los 7 millones restantes de enero expiran al final de febrero.

### Ejemplo 2: rollover tras un mes ligero

Supongamos que el mismo plan incluye 10 millones de operaciones por mes.

| Month | Included operations | Rolled in from previous month | Total available | Operations used | Rollover to next month |
| --- | ---: | ---: | ---: | ---: | ---: |
| January | 10 million | 0 | 10 million | 5 million | 5 million |
| February | 10 million | 5 million | 15 million | 2 million | 8 million |
| March | 10 million | 8 million | 18 million | Depends on March usage | Depends on March usage |

Aquí, febrero usa solo 2 millones de sus 10 millones incluidos. Como los 5 millones acumulados de enero no se necesitaron, expiran al final de febrero. Marzo recibe la parte no usada de febrero, 8 millones.

### Ejemplo 3: tolerancia de excedente

Supongamos que un plan incluye 1 millón de operaciones por mes.

| Monthly allowance | Usage | Percent over plan | Result |
| ---: | ---: | ---: | --- |
| 1 million | 1.1 million | 10% | Solo advertencia, sin cargo por excedente |
| 1 million | 1.2 million | 20% | Solo advertencia, sin cargo por excedente |
| 1 million | 1.25 million | 25% | Puede aplicarse un cargo por excedente separado |

## Relacionado

- [Pricing](/reference/pricing/)
- [Plans](/reference/plans/)
- [Billing](/reference/billing/)
- [Rate Limits](/reference/rate-limits/)

